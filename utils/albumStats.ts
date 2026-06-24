import type {
    AlbumCatalogue,
    AlbumSection,
    CollectionStatsSummary,
    CollectionSummary,
    FoilCollectionSummary,
    SectionCollectionSummary,
    StickerCollection,
} from '@/types/album';

function normalizeCopies(
    copies: number | undefined
): number {
    if (
        copies === undefined ||
        !Number.isFinite(copies)
    ) {
        return 0;
    }

    return Math.max(
        0,
        Math.floor(copies)
    );
}

function calculateCompletionPercentage(
    owned: number,
    total: number
): number {
    if (total <= 0) {
        return 0;
    }

    return (
        owned /
        total
    ) * 100;
}

function calculateSectionCollectionSummary(
    section: AlbumSection,
    collection: StickerCollection
): SectionCollectionSummary {
    let uniqueOwned = 0;
    let repeatedStickerTypes = 0;
    let totalExtraCopies = 0;

    for (const sticker of section.stickers) {
        const copies = normalizeCopies(
            collection[sticker.id]
        );

        if (copies > 0) {
            uniqueOwned += 1;
        }

        if (copies > 1) {
            repeatedStickerTypes += 1;
            totalExtraCopies +=
                copies - 1;
        }
    }

    const totalStickers =
        section.stickers.length;

    const missingStickers =
        Math.max(
            0,
            totalStickers -
            uniqueOwned
        );

    return {
        sectionId: section.id,
        sectionName: section.name,
        federation: section.federation,
        totalStickers,
        uniqueOwned,
        missingStickers,
        repeatedStickerTypes,
        totalExtraCopies,
        completionPercentage:
            calculateCompletionPercentage(
                uniqueOwned,
                totalStickers
            ),
    };
}

export function getCollectionSummary(
    catalogue: AlbumCatalogue,
    collection: StickerCollection
): CollectionSummary {
    let totalStickers = 0;
    let uniqueOwned = 0;
    let repeatedStickerTypes = 0;
    let totalExtraCopies = 0;

    for (
        const section of
        catalogue.sections
        ) {
        for (
            const sticker of
            section.stickers
            ) {
            totalStickers += 1;

            const copies =
                normalizeCopies(
                    collection[
                        sticker.id
                        ]
                );

            if (copies > 0) {
                uniqueOwned += 1;
            }

            if (copies > 1) {
                repeatedStickerTypes += 1;
                totalExtraCopies +=
                    copies - 1;
            }
        }
    }

    const missingStickers =
        Math.max(
            0,
            totalStickers -
            uniqueOwned
        );

    return {
        totalStickers,
        uniqueOwned,
        missingStickers,
        repeatedStickerTypes,
        totalExtraCopies,
        completionPercentage:
            calculateCompletionPercentage(
                uniqueOwned,
                totalStickers
            ),
    };
}

export function getSectionCollectionSummary(
    catalogue: AlbumCatalogue,
    sectionId: string,
    collection: StickerCollection
): SectionCollectionSummary | undefined {
    const section =
        catalogue.sections.find(
            (item) =>
                item.id === sectionId
        );

    if (!section) {
        return undefined;
    }

    return calculateSectionCollectionSummary(
        section,
        collection
    );
}

function getFoilCollectionSummary(
    catalogue: AlbumCatalogue,
    collection: StickerCollection
): FoilCollectionSummary {
    let totalFoils = 0;
    let ownedFoils = 0;

    for (
        const section of
        catalogue.sections
        ) {
        for (
            const sticker of
            section.stickers
            ) {
            if (
                sticker.type !==
                'foil'
            ) {
                continue;
            }

            totalFoils += 1;

            const copies =
                normalizeCopies(
                    collection[
                        sticker.id
                        ]
                );

            if (copies > 0) {
                ownedFoils += 1;
            }
        }
    }

    const missingFoils =
        Math.max(
            0,
            totalFoils -
            ownedFoils
        );

    return {
        totalFoils,
        ownedFoils,
        missingFoils,
        completionPercentage:
            calculateCompletionPercentage(
                ownedFoils,
                totalFoils
            ),
    };
}

function getMostCompleteSection(
    sections: SectionCollectionSummary[]
): SectionCollectionSummary | null {
    if (sections.length === 0) {
        return null;
    }

    return sections.reduce(
        (best, current) => {
            if (
                current.completionPercentage >
                best.completionPercentage
            ) {
                return current;
            }

            if (
                current.completionPercentage ===
                best.completionPercentage &&
                current.uniqueOwned >
                best.uniqueOwned
            ) {
                return current;
            }

            return best;
        }
    );
}

function getLeastCompleteSection(
    sections: SectionCollectionSummary[]
): SectionCollectionSummary | null {
    const nonEmptySections =
        sections.filter(
            (section) =>
                section.totalStickers >
                0
        );

    if (
        nonEmptySections.length ===
        0
    ) {
        return null;
    }

    return nonEmptySections.reduce(
        (lowest, current) => {
            if (
                current.completionPercentage <
                lowest.completionPercentage
            ) {
                return current;
            }

            if (
                current.completionPercentage ===
                lowest.completionPercentage &&
                current.uniqueOwned <
                lowest.uniqueOwned
            ) {
                return current;
            }

            return lowest;
        }
    );
}

export function getCollectionStatsSummary(
    catalogue: AlbumCatalogue,
    collection: StickerCollection
): CollectionStatsSummary {
    const overall =
        getCollectionSummary(
            catalogue,
            collection
        );

    const foil =
        getFoilCollectionSummary(
            catalogue,
            collection
        );

    const sections =
        catalogue.sections.map(
            (section) =>
                calculateSectionCollectionSummary(
                    section,
                    collection
                )
        );

    return {
        overall,
        foil,
        sections,
        mostCompleteSection:
            getMostCompleteSection(
                sections
            ),
        leastCompleteSection:
            getLeastCompleteSection(
                sections
            ),
    };
}