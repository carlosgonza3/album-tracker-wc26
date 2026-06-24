import type {
    ImageResizeMode,
    ImageSourcePropType,
} from 'react-native';

import type { AlbumSection } from '@/types/album';

export interface AlbumSectionArtwork {
    source: ImageSourcePropType;
    resizeMode: ImageResizeMode;
    isLogo: boolean;
}

/**
 * Special artwork uses the visible one-based section
 * number.
 *
 * sectionIndex 0 = section 1
 * sectionIndex 1 = section 2
 */
const SPECIAL_SECTION_ARTWORK: Record<
    number,
    ImageSourcePropType
> = {
    1: require('../../assets/images/flags/Panini.png'),
    2: require('../../assets/images/flags/Fifa.png'),
    51: require('../../assets/images/flags/Fifa.png'),
    52: require('../../assets/images/flags/Coca-Cola.png'),
};

/**
 * Metro requires local assets to use explicit,
 * statically analyzable require() calls.
 *
 * Every key is normalized to lowercase with accents,
 * underscores, and hyphens removed.
 */
const COUNTRY_FLAGS: Record<
    string,
    ImageSourcePropType
> = {
    algeria:
        require('../../assets/images/flags/Algeria.jpg'),

    argentina:
        require('../../assets/images/flags/Argentina.jpg'),

    australia:
        require('../../assets/images/flags/Australia.jpg'),

    austria:
        require('../../assets/images/flags/Austria.jpg'),

    belgium:
        require('../../assets/images/flags/Belgium.jpg'),

    'bosnia and herzegovina':
        require('../../assets/images/flags/Bosnia-and-Herzegovina.jpg'),

    'bosnia herzegovina':
        require('../../assets/images/flags/Bosnia-and-Herzegovina.jpg'),

    bosnia:
        require('../../assets/images/flags/Bosnia-and-Herzegovina.jpg'),

    brazil:
        require('../../assets/images/flags/Brazil.jpg'),

    'cabo verde':
        require('../../assets/images/flags/Cabo-Verde.jpg'),

    'cape verde':
        require('../../assets/images/flags/Cabo-Verde.jpg'),

    canada:
        require('../../assets/images/flags/Canada.jpg'),

    colombia:
        require('../../assets/images/flags/Colombia.jpg'),

    croatia:
        require('../../assets/images/flags/Croatia.jpg'),

    curacao:
        require('../../assets/images/flags/Curacao.jpg'),

    czechia:
        require('../../assets/images/flags/Czechia.jpg'),

    'czech republic':
        require('../../assets/images/flags/Czechia.jpg'),

    'dr congo':
        require('../../assets/images/flags/DR-Congo.jpg'),

    'congo dr':
        require('../../assets/images/flags/DR-Congo.jpg'),

    'democratic republic of the congo':
        require('../../assets/images/flags/DR-Congo.jpg'),

    ecuador:
        require('../../assets/images/flags/Ecuador.jpg'),

    egypt:
        require('../../assets/images/flags/Egypt.jpg'),

    england:
        require('../../assets/images/flags/England.jpg'),

    france:
        require('../../assets/images/flags/France.jpg'),

    germany:
        require('../../assets/images/flags/Germany.jpg'),

    ghana:
        require('../../assets/images/flags/Ghana.jpg'),

    haiti:
        require('../../assets/images/flags/Haiti.jpg'),

    iran:
        require('../../assets/images/flags/Iran.jpg'),

    'ir iran':
        require('../../assets/images/flags/Iran.jpg'),

    iraq:
        require('../../assets/images/flags/Iraq.jpg'),

    'ivory coast':
        require('../../assets/images/flags/Ivory-Coast.jpg'),

    "cote d'ivoire":
        require('../../assets/images/flags/Ivory-Coast.jpg'),

    japan:
        require('../../assets/images/flags/Japan.jpg'),

    jordan:
        require('../../assets/images/flags/Jordan.jpg'),

    mexico:
        require('../../assets/images/flags/Mexico.jpg'),

    morocco:
        require('../../assets/images/flags/Morocco.jpg'),

    netherlands:
        require('../../assets/images/flags/Netherlands.jpg'),

    'new zealand':
        require('../../assets/images/flags/New-Zealand.jpg'),

    norway:
        require('../../assets/images/flags/Norway.jpg'),

    panama:
        require('../../assets/images/flags/Panama.jpg'),

    paraguay:
        require('../../assets/images/flags/Paraguay.jpg'),

    portugal:
        require('../../assets/images/flags/Portugal.jpg'),

    qatar:
        require('../../assets/images/flags/Qatar.jpg'),

    'saudi arabia':
        require('../../assets/images/flags/Saudi-Arabia.jpg'),

    scotland:
        require('../../assets/images/flags/Scotland.jpg'),

    senegal:
        require('../../assets/images/flags/Senegal.jpg'),

    'south africa':
        require('../../assets/images/flags/South-Africa.jpg'),

    'south korea':
        require('../../assets/images/flags/South-Korea.jpg'),

    'korea republic':
        require('../../assets/images/flags/South-Korea.jpg'),

    'republic of korea':
        require('../../assets/images/flags/South-Korea.jpg'),

    spain:
        require('../../assets/images/flags/Spain.jpg'),

    sweden:
        require('../../assets/images/flags/Sweden.jpg'),

    switzerland:
        require('../../assets/images/flags/Switzerland.jpg'),

    tunisia:
        require('../../assets/images/flags/Tunisia.jpg'),

    turkey:
        require('../../assets/images/flags/Turkey.jpg'),

    turkiye:
        require('../../assets/images/flags/Turkey.jpg'),

    usa:
        require('../../assets/images/flags/USA.jpg'),

    'united states':
        require('../../assets/images/flags/USA.jpg'),

    'united states of america':
        require('../../assets/images/flags/USA.jpg'),

    uruguay:
        require('../../assets/images/flags/Uruguay.jpg'),

    uzbekistan:
        require('../../assets/images/flags/Uzbekistan.jpg'),
};

export function normalizeAlbumSectionName(
    value: string | undefined
): string {
    return (
        value
            ?.normalize('NFD')
            .replace(
                /[\u0300-\u036f]/g,
                ''
            )
            .replace(
                /[_-]+/g,
                ' '
            )
            .replace(
                /\s+/g,
                ' '
            )
            .trim()
            .toLowerCase() ?? ''
    );
}

export function getAlbumSectionArtwork(
    section: AlbumSection,
    sectionIndex: number
): AlbumSectionArtwork | null {
    const sectionNumber =
        sectionIndex + 1;

    const specialArtwork =
        SPECIAL_SECTION_ARTWORK[
            sectionNumber
            ];

    if (specialArtwork) {
        return {
            source: specialArtwork,
            resizeMode: 'contain',
            isLogo: true,
        };
    }

    const normalizedName =
        normalizeAlbumSectionName(
            section.name
        );

    const normalizedFederation =
        normalizeAlbumSectionName(
            section.federation
        );

    const flagSource =
        COUNTRY_FLAGS[normalizedName] ??
        COUNTRY_FLAGS[
            normalizedFederation
            ];

    if (!flagSource) {
        return null;
    }

    return {
        source: flagSource,
        resizeMode: 'cover',
        isLogo: false,
    };
}