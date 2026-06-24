import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '@/constants/storage';
import type { StickerCollection } from '@/types/album';

function isStickerCollection(
    value: unknown
): value is StickerCollection {
    if (
        typeof value !== 'object' ||
        value === null ||
        Array.isArray(value)
    ) {
        return false;
    }

    return Object.values(value).every(
        (copies) =>
            typeof copies === 'number' &&
            Number.isFinite(copies) &&
            copies >= 0 &&
            Number.isInteger(copies)
    );
}

export async function loadStickerCollection(): Promise<StickerCollection> {
    const savedValue = await AsyncStorage.getItem(
        STORAGE_KEYS.stickerCollection
    );

    if (!savedValue) {
        return {};
    }

    const parsedValue: unknown = JSON.parse(savedValue);

    if (!isStickerCollection(parsedValue)) {
        console.warn(
            'Invalid sticker collection found in AsyncStorage. Resetting collection.'
        );

        return {};
    }

    return parsedValue;
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