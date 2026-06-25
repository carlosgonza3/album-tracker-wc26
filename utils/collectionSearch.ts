import type {
    StickerCollection,
    StickerStatus,
    StickerWithState,
} from '@/types/album';

import { albumCatalogue, albumStickers } from '@/data/albumCatalogue';
import { attachStickerState } from '@/utils/stickerState';

export type CollectionFilter =
    | 'all'
    | 'missing'
    | 'owned'
    | 'repeated'
    | 'foil';

export interface CollectionStickerResult
    extends StickerWithState {
    sectionIndex: number;
}

export interface CollectionSearchOptions {
    query?: string;
    filter?: CollectionFilter;
}

function normalizeSearchValue(value: string): string {
    return value
        .trim()
        .toLocaleLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function matchesSearchQuery(
    sticker: CollectionStickerResult,
    query: string
): boolean {
    if (!query.trim()) {
        return true;
    }

    const normalizedQuery =
        normalizeSearchValue(query);

    const compactQuery =
        normalizedQuery.replace(
            /[\s_-]+/g,
            ''
        );

    const normalizedStickerId =
        normalizeSearchValue(
            sticker.id
        ).replace(
            /[\s_-]+/g,
            ''
        );

    const normalizedSectionName =
        normalizeSearchValue(
            sticker.sectionName
        );

    return (
        normalizedStickerId.includes(
            compactQuery
        ) ||
        normalizedSectionName.includes(
            normalizedQuery
        )
    );
}

function matchesCollectionFilter(
    sticker: CollectionStickerResult,
    filter: CollectionFilter
): boolean {
    switch (filter) {
        case 'missing':
            return sticker.status === 'missing';

        case 'owned':
            return sticker.copies > 0;

        case 'repeated':
            return sticker.status === 'repeated';

        case 'foil':
            return sticker.type === 'foil';

        case 'all':
        default:
            return true;
    }
}

function getSectionIndex(
    sectionId: string
): number {
    return albumCatalogue.sections.findIndex(
        (section) => section.id === sectionId
    );
}

export function getCollectionStickers(
    collection: StickerCollection
): CollectionStickerResult[] {
    return albumStickers.map((sticker) => ({
        ...attachStickerState(
            sticker,
            collection
        ),
        sectionIndex: getSectionIndex(
            sticker.sectionId
        ),
    }));
}

export function searchCollectionStickers(
    collection: StickerCollection,
    {
        query = '',
        filter = 'all',
    }: CollectionSearchOptions = {}
): CollectionStickerResult[] {
    const stickers =
        getCollectionStickers(collection);

    return stickers.filter(
        (sticker) =>
            matchesCollectionFilter(
                sticker,
                filter
            ) &&
            matchesSearchQuery(
                sticker,
                query
            )
    );
}

export function getMissingStickers(
    collection: StickerCollection
): CollectionStickerResult[] {
    return searchCollectionStickers(
        collection,
        {
            filter: 'missing',
        }
    );
}

export function getOwnedStickers(
    collection: StickerCollection
): CollectionStickerResult[] {
    return searchCollectionStickers(
        collection,
        {
            filter: 'owned',
        }
    );
}

export function getRepeatedStickers(
    collection: StickerCollection
): CollectionStickerResult[] {
    return searchCollectionStickers(
        collection,
        {
            filter: 'repeated',
        }
    );
}

export function getFoilStickers(
    collection: StickerCollection
): CollectionStickerResult[] {
    return searchCollectionStickers(
        collection,
        {
            filter: 'foil',
        }
    );
}

export function getTotalTradeCopies(
    stickers: CollectionStickerResult[]
): number {
    return stickers.reduce(
        (total, sticker) =>
            total + sticker.extraCopies,
        0
    );
}

export function isStickerStatus(
    value: string
): value is StickerStatus {
    return (
        value === 'missing' ||
        value === 'owned' ||
        value === 'repeated'
    );
}