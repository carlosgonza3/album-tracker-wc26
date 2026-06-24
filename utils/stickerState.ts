import type {
    CatalogueSticker,
    StickerCollection,
    StickerStatus,
    StickerWithState,
} from '@/types/album';

export function normalizeCopies(copies: number): number {
    if (!Number.isFinite(copies)) {
        return 0;
    }

    return Math.max(0, Math.floor(copies));
}

export function getStickerStatus(
    copies: number
): StickerStatus {
    const normalizedCopies = normalizeCopies(copies);

    if (normalizedCopies === 0) {
        return 'missing';
    }

    if (normalizedCopies === 1) {
        return 'owned';
    }

    return 'repeated';
}

export function getExtraCopies(copies: number): number {
    return Math.max(0, normalizeCopies(copies) - 1);
}

export function getNextStickerCopies(
    currentCopies: number
): number {
    const copies = normalizeCopies(currentCopies);

    if (copies === 0) {
        return 1;
    }

    if (copies === 1) {
        return 2;
    }

    return 0;
}

export function attachStickerState(
    sticker: CatalogueSticker,
    collection: StickerCollection
): StickerWithState {
    const copies = normalizeCopies(
        collection[sticker.id] ?? 0
    );

    return {
        ...sticker,
        copies,
        extraCopies: getExtraCopies(copies),
        status: getStickerStatus(copies),
    };
}