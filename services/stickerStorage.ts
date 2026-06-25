import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '@/constants/storage';
import {
    albumStickers,
} from '@/data/albumCatalogue';
import type {
    StickerCollection,
} from '@/types/album';

export interface ParsedStickerCollection {
    collection: StickerCollection;
    importedEntries: number;
    acceptedEntries: number;
    ignoredEntries: number;
    unknownStickerIds: string[];
}

const validStickerIds =
    new Set(
        albumStickers.map(
            (sticker) => sticker.id
        )
    );

export function isStickerCollection(
    value: unknown
): value is StickerCollection {
    if (
        typeof value !== 'object' ||
        value === null ||
        Array.isArray(value)
    ) {
        return false;
    }

    return Object.entries(value).every(
        ([stickerId, copies]) =>
            stickerId.trim().length > 0 &&
            typeof copies === 'number' &&
            Number.isFinite(copies) &&
            copies >= 0 &&
            Number.isInteger(copies)
    );
}

export function parseStickerCollectionBackup(
    value: string
): ParsedStickerCollection {
    const parsedValue: unknown =
        JSON.parse(value);

    if (
        !isStickerCollection(
            parsedValue
        )
    ) {
        throw new Error(
            'The selected file does not contain a valid sticker collection.'
        );
    }

    const collection:
        StickerCollection = {};

    const unknownStickerIds:
        string[] = [];

    let acceptedEntries = 0;
    let ignoredEntries = 0;

    const entries =
        Object.entries(parsedValue);

    for (const [
        rawStickerId,
        copies,
    ] of entries) {
        const stickerId =
            rawStickerId.trim();

        if (copies === 0) {
            ignoredEntries += 1;
            continue;
        }

        if (
            !validStickerIds.has(
                stickerId
            )
        ) {
            unknownStickerIds.push(
                stickerId
            );

            ignoredEntries += 1;
            continue;
        }

        collection[stickerId] =
            copies;

        acceptedEntries += 1;
    }

    return {
        collection,
        importedEntries:
        entries.length,
        acceptedEntries,
        ignoredEntries,
        unknownStickerIds,
    };
}

export function parseStickerCollection(
    value: string
): StickerCollection {
    return parseStickerCollectionBackup(
        value
    ).collection;
}

export async function loadStickerCollection(): Promise<StickerCollection> {
    const savedValue =
        await AsyncStorage.getItem(
            STORAGE_KEYS.stickerCollection
        );

    if (!savedValue) {
        return {};
    }

    try {
        return parseStickerCollection(
            savedValue
        );
    } catch (error) {
        console.warn(
            'Invalid sticker collection found in AsyncStorage. Resetting collection.',
            error
        );

        return {};
    }
}

export async function saveStickerCollection(
    collection: StickerCollection
): Promise<void> {
    await AsyncStorage.setItem(
        STORAGE_KEYS.stickerCollection,
        JSON.stringify(collection)
    );
}

export async function clearStickerCollection(): Promise<void> {
    await AsyncStorage.removeItem(
        STORAGE_KEYS.stickerCollection
    );
}