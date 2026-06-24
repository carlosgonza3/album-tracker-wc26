import type {
    AlbumCatalogue,
    AlbumSummary,
    SectionSummary,
} from '@/types/album';

export function getAlbumSummary(
    catalogue: AlbumCatalogue
): AlbumSummary {
    let totalStickers = 0;
    let foilStickers = 0;

    for (const section of catalogue.sections) {
        totalStickers += section.stickers.length;

        for (const sticker of section.stickers) {
            if (sticker.type === 'foil') {
                foilStickers += 1;
            }
        }
    }

    return {
        totalSections: catalogue.sections.length,
        totalStickers,
        foilStickers,
        regularStickers: totalStickers - foilStickers,
    };
}

export function getSectionSummary(
    catalogue: AlbumCatalogue,
    sectionId: string
): SectionSummary | undefined {
    const section = catalogue.sections.find(
        (item) => item.id === sectionId
    );

    if (!section) {
        return undefined;
    }

    const foilStickers = section.stickers.filter(
        (sticker) => sticker.type === 'foil'
    ).length;

    return {
        sectionId: section.id,
        sectionName: section.name,
        totalStickers: section.stickers.length,
        foilStickers,
        regularStickers:
            section.stickers.length - foilStickers,
    };
}