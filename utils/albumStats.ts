import type {
    AlbumCatalogue,
    AlbumSummary,
    CollectionSummary,
    SectionCollectionSummary,
    SectionSummary,
    StickerCollection,
} from '@/types/album';

export function getCollectionSummary(

    catalogue: AlbumCatalogue,
    collection: StickerCollection

): CollectionSummary {

    let totalStickers = 0;
    let uniqueOwned = 0;
    let repeatedStickerTypes = 0;
    let totalExtraCopies = 0;

    for (const section of catalogue.sections) {
        for (const sticker of section.stickers) {
            totalStickers += 1;

            const copies = Math.max(
                0,
                Math.floor(collection[sticker.id] ?? 0)
            );

            if (copies > 0) {
                uniqueOwned += 1;
            }

            if (copies > 1) {
                repeatedStickerTypes += 1;
                totalExtraCopies += copies - 1;
            }
        }
    }

    const missingStickers =
        totalStickers - uniqueOwned;

    const completionPercentage =
        totalStickers === 0
            ? 0
            : (uniqueOwned / totalStickers) * 100;

    return {
        totalStickers,
        uniqueOwned,
        missingStickers,
        repeatedStickerTypes,
        totalExtraCopies,
        completionPercentage,
    };
}

export function getSectionCollectionSummary(

    catalogue: AlbumCatalogue,
    sectionId: string,
    collection: StickerCollection

): SectionCollectionSummary | undefined {

    const section = catalogue.sections.find(
        (item) => item.id === sectionId
    );

    if (!section) {
        return undefined;
    }

    let uniqueOwned = 0;
    let repeatedStickerTypes = 0;
    let totalExtraCopies = 0;

    for (const sticker of section.stickers) {
        const copies = Math.max(
            0,
            Math.floor(collection[sticker.id] ?? 0)
        );

        if (copies > 0) {
            uniqueOwned += 1;
        }

        if (copies > 1) {
            repeatedStickerTypes += 1;
            totalExtraCopies += copies - 1;
        }
    }

    const totalStickers = section.stickers.length;
    const missingStickers =
        totalStickers - uniqueOwned;

    const completionPercentage =
        totalStickers === 0
            ? 0
            : (uniqueOwned / totalStickers) * 100;

    return {
        sectionId: section.id,
        sectionName: section.name,
        totalStickers,
        uniqueOwned,
        missingStickers,
        repeatedStickerTypes,
        totalExtraCopies,
        completionPercentage,
    };
}