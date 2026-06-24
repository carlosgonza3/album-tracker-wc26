export type StickerType =
    | 'sticker'
    | 'foil';

export type StickerStatus =
    | 'missing'
    | 'owned'
    | 'repeated';

export interface Sticker {
    id: string;
    name: string;
    type: StickerType;
}

export interface AlbumSection {
    id: string;
    name: string;
    federation?: string;
    stickers: Sticker[];
}

export interface AlbumCatalogue {
    id: string;
    name: string;
    version: string;
    sections: AlbumSection[];
}

export interface CatalogueSticker
    extends Sticker {
    sectionId: string;
    sectionName: string;
    federation?: string;
}

export type StickerCollection =
    Record<string, number>;

export interface StickerWithState
    extends CatalogueSticker {
    copies: number;
    extraCopies: number;
    status: StickerStatus;
}

export interface AlbumSummary {
    totalSections: number;
    totalStickers: number;
    foilStickers: number;
    regularStickers: number;
}

export interface SectionSummary {
    sectionId: string;
    sectionName: string;
    totalStickers: number;
    foilStickers: number;
    regularStickers: number;
}

export interface CollectionSummary {
    totalStickers: number;
    uniqueOwned: number;
    missingStickers: number;
    repeatedStickerTypes: number;
    totalExtraCopies: number;
    completionPercentage: number;
}

export interface SectionCollectionSummary
    extends CollectionSummary {
    sectionId: string;
    sectionName: string;
    federation?: string;
}

export interface FoilCollectionSummary {
    totalFoils: number;
    ownedFoils: number;
    missingFoils: number;
    completionPercentage: number;
}

export interface CollectionStatsSummary {
    overall: CollectionSummary;
    foil: FoilCollectionSummary;
    sections: SectionCollectionSummary[];

    mostCompleteSection:
        SectionCollectionSummary | null;

    leastCompleteSection:
        SectionCollectionSummary | null;
}