import albumData from '@/assets/data/album.json';

import type {
    AlbumCatalogue,
    AlbumSection,
    CatalogueSticker,
} from '@/types/album';
import { flattenAlbumCatalogue } from '@/utils/albumCatalogue';
import { validateAlbumCatalogue } from '@/utils/validateAlbum';

const validation = validateAlbumCatalogue(albumData);

if (!validation.isValid) {
    throw new Error(
        [
            'Invalid album catalogue:',
            ...validation.errors.map(
                (error) => `- ${error}`
            ),
        ].join('\n')
    );
}

if (__DEV__) {
    validation.warnings.forEach((warning) => {
        console.warn(`[Album catalogue] ${warning}`);
    });
}

export const albumCatalogue =
    albumData as AlbumCatalogue;

export const albumStickers =
    flattenAlbumCatalogue(albumCatalogue);

export const sectionsById = new Map<
    string,
    AlbumSection
>(
    albumCatalogue.sections.map((section) => [
        section.id,
        section,
    ])
);

export const stickersById = new Map<
    string,
    CatalogueSticker
>(
    albumStickers.map((sticker) => [
        sticker.id,
        sticker,
    ])
);