import type {
    AlbumCatalogue,
    AlbumSection,
    CatalogueSticker,
    Sticker,
} from '@/types/album';

export function flattenAlbumCatalogue(
    catalogue: AlbumCatalogue
): CatalogueSticker[] {
    return catalogue.sections.flatMap((section) =>
        section.stickers.map((sticker) => ({
            ...sticker,
            sectionId: section.id,
            sectionName: section.name,
            federation: section.federation,
        }))
    );
}

export function findSectionById(
    catalogue: AlbumCatalogue,
    sectionId: string
): AlbumSection | undefined {
    return catalogue.sections.find(
        (section) => section.id === sectionId
    );
}

export function findStickerById(
    catalogue: AlbumCatalogue,
    stickerId: string
): CatalogueSticker | undefined {
    for (const section of catalogue.sections) {
        const sticker = section.stickers.find(
            (item) => item.id === stickerId
        );

        if (sticker) {
            return {
                ...sticker,
                sectionId: section.id,
                sectionName: section.name,
                federation: section.federation,
            };
        }
    }

    return undefined;
}

export function getAlbumStickerCount(
    catalogue: AlbumCatalogue
): number {
    return catalogue.sections.reduce(
        (total, section) => total + section.stickers.length,
        0
    );
}

export function getFoilStickers(
    stickers: Sticker[]
): Sticker[] {
    return stickers.filter(
        (sticker) => sticker.type === 'foil'
    );
}