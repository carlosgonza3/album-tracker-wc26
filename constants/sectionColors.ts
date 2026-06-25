// constants/sectionColors.ts

export interface SectionColors {
    primary: string;
    secondary: string;
    primarySoft: string;
    secondarySoft: string;
    border: string;
}

export const DEFAULT_SECTION_COLORS: SectionColors = {
    primary: '#F5C518',
    secondary: '#0B1C3A',
    primarySoft:
        'rgba(245, 197, 24, 0.13)',
    secondarySoft:
        'rgba(11, 28, 58, 0.72)',
    border:
        'rgba(245, 197, 24, 0.34)',
};

export function hexToRgba(
    hex: string,
    alpha: number
): string {
    const normalizedHex =
        hex.replace('#', '');

    if (
        normalizedHex.length !== 6
    ) {
        return `rgba(245, 197, 24, ${alpha})`;
    }

    const red =
        Number.parseInt(
            normalizedHex.slice(
                0,
                2
            ),
            16
        );

    const green =
        Number.parseInt(
            normalizedHex.slice(
                2,
                4
            ),
            16
        );

    const blue =
        Number.parseInt(
            normalizedHex.slice(
                4,
                6
            ),
            16
        );

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function createSectionColors(
    primary: string,
    secondary: string
): SectionColors {
    return {
        primary,
        secondary,

        primarySoft:
            hexToRgba(
                primary,
                0.15
            ),

        secondarySoft:
            hexToRgba(
                secondary,
                0.11
            ),

        border:
            hexToRgba(
                primary,
                0.42
            ),
    };
}

export const COUNTRY_SECTION_COLORS:
    Record<
        string,
        SectionColors
    > = {
    ARG: createSectionColors(
        '#75AADB',
        '#FFFFFF'
    ),
    ARGENTINA: createSectionColors(
        '#75AADB',
        '#FFFFFF'
    ),

    AUS: createSectionColors(
        '#012169',
        '#E4002B'
    ),

    AUSTRALIA: createSectionColors(
        '#012169',
        '#E4002B'
    ),

    AUT: createSectionColors(
        '#ED2939',
        '#FFFFFF'
    ),
    AUSTRIA: createSectionColors(
        '#ED2939',
        '#FFFFFF'
    ),

    BEL: createSectionColors(
        '#E30613',
        '#FFCD00'
    ),
    BELGIUM: createSectionColors(
        '#E30613',
        '#FFCD00'
    ),

    BIH: createSectionColors(
        '#002395',
        '#FECB00'
    ),
    'BOSNIA-HERZEGOVINA':
        createSectionColors(
            '#002395',
            '#FECB00'
        ),

    BRA: createSectionColors(
        '#009C3B',
        '#FFDF00'
    ),
    BRAZIL: createSectionColors(
        '#009C3B',
        '#FFDF00'
    ),

    CAN: createSectionColors(
        '#FF0000',
        '#FFFFFF'
    ),
    CANADA: createSectionColors(
        '#FF0000',
        '#FFFFFF'
    ),

    CPV: createSectionColors(
        '#003893',
        '#F7D116'
    ),
    'CABO VERDE':
        createSectionColors(
            '#ffffff',
            '#f71616'
        ),

    COL: createSectionColors(
        '#FCD116',
        '#b91313'
    ),
    COLOMBIA: createSectionColors(
        '#FCD116',
        '#b91313'
    ),

    COD: createSectionColors(
        '#007FFF',
        '#CE1021'
    ),
    'CONGO DR':
        createSectionColors(
            '#007FFF',
            '#CE1021'
        ),
    'DEMOCRATIC REPUBLIC OF THE CONGO':
        createSectionColors(
            '#007FFF',
            '#CE1021'
        ),

    CIV: createSectionColors(
        '#F77F00',
        '#009E60'
    ),
    'IVORY COAST':
        createSectionColors(
            '#F77F00',
            '#009E60'
        ),
    "CÔTE D'IVOIRE":
        createSectionColors(
            '#F77F00',
            '#009E60'
        ),

    CRO: createSectionColors(
        '#FF0000',
        '#171796'
    ),
    CROATIA: createSectionColors(
        '#FF0000',
        '#171796'
    ),

    CUW: createSectionColors(
        '#002B7F',
        '#F9E814'
    ),
    CURACAO: createSectionColors(
        '#002B7F',
        '#F9E814'
    ),
    CZE: createSectionColors(
        '#D7141A',
        '#11457E'
    ),
    CZECHIA: createSectionColors(
        '#D7141A',
        'rgba(255,255,255,0.76)'
    ),

    ECU: createSectionColors(
        '#FFD100',
        '#034EA2'
    ),
    ECUADOR: createSectionColors(
        '#FFD100',
        '#034EA2'
    ),

    EGY: createSectionColors(
        '#CE1126',
        '#FFFFFF'
    ),
    EGYPT: createSectionColors(
        '#CE1126',
        '#FFFFFF'
    ),

    ENG: createSectionColors(
        '#FFFFFF',
        '#CE1124'
    ),
    ENGLAND: createSectionColors(
        '#FFFFFF',
        '#CE1124'
    ),

    ESP: createSectionColors(
        '#AA151B',
        '#F1BF00'
    ),
    SPAIN: createSectionColors(
        '#AA151B',
        '#F1BF00'
    ),

    FRA: createSectionColors(
        '#0055A4',
        '#EF4135'
    ),
    FRANCE: createSectionColors(
        '#0055A4',
        '#EF4135'
    ),

    GER: createSectionColors(
        '#DD0000',
        '#FFCE00'
    ),
    GERMANY: createSectionColors(
        '#DD0000',
        '#FFCE00'
    ),

    GHA: createSectionColors(
        '#CE1126',
        '#FCD116'
    ),
    GHANA: createSectionColors(
        '#CE1126',
        '#FCD116'
    ),

    HAI: createSectionColors(
        '#00209F',
        '#D21034'
    ),
    HAITI: createSectionColors(
        '#00209F',
        '#D21034'
    ),

    IRN: createSectionColors(
        '#239F40',
        '#DA0000'
    ),
    'IR IRAN': createSectionColors(
        '#239F40',
        '#DA0000'
    ),

    IRQ: createSectionColors(
        '#CE1126',
        '#000000'
    ),
    IRAQ: createSectionColors(
        '#CE1126',
        '#000000'
    ),

    JPN: createSectionColors(
        '#BC002D',
        '#FFFFFF'
    ),
    JAPAN: createSectionColors(
        '#BC002D',
        '#FFFFFF'
    ),

    JOR: createSectionColors(
        '#CE1126',
        '#007A3D'
    ),
    JORDAN: createSectionColors(
        '#CE1126',
        '#007A3D'
    ),

    KOR: createSectionColors(
        '#CD2E3A',
        '#0047A0'
    ),
    'KOREA REPUBLIC':
        createSectionColors(
            '#CD2E3A',
            '#0047A0'
        ),

    KSA: createSectionColors(
        '#006C35',
        '#FFFFFF'
    ),
    'SAUDI ARABIA':
        createSectionColors(
            '#006C35',
            '#FFFFFF'
        ),

    MAR: createSectionColors(
        '#C1272D',
        '#006233'
    ),
    MOROCCO: createSectionColors(
        '#C1272D',
        '#006233'
    ),

    MEX: createSectionColors(
        '#006847',
        '#CE1126'
    ),
    MEXICO: createSectionColors(
        '#006847',
        '#CE1126'
    ),

    NED: createSectionColors(
        '#AE1C28',
        '#21468B'
    ),
    NETHERLANDS:
        createSectionColors(
            '#AE1C28',
            '#21468B'
        ),

    NOR: createSectionColors(
        '#BA0C2F',
        '#00205B'
    ),
    NORWAY: createSectionColors(
        '#BA0C2F',
        '#00205B'
    ),

    NZL: createSectionColors(
        '#012169',
        '#CC142B'
    ),
    'NEW ZEALAND':
        createSectionColors(
            '#012169',
            '#CC142B'
        ),

    PAN: createSectionColors(
        '#DA121A',
        '#005293'
    ),
    PANAMA: createSectionColors(
        '#DA121A',
        '#005293'
    ),

    PAR: createSectionColors(
        '#D52B1E',
        '#0038A8'
    ),
    PARAGUAY: createSectionColors(
        '#D52B1E',
        '#0038A8'
    ),

    POR: createSectionColors(
        '#046A38',
        '#DA291C'
    ),
    PORTUGAL: createSectionColors(
        '#046A38',
        '#DA291C'
    ),

    QAT: createSectionColors(
        '#8A1538',
        '#FFFFFF'
    ),
    QATAR: createSectionColors(
        '#8A1538',
        '#FFFFFF'
    ),

    RSA: createSectionColors(
        '#007749',
        '#FFB81C'
    ),
    'SOUTH AFRICA':
        createSectionColors(
            '#007749',
            '#FFB81C'
        ),

    SCO: createSectionColors(
        '#005EB8',
        '#FFFFFF'
    ),
    SCOTLAND: createSectionColors(
        '#005EB8',
        '#FFFFFF'
    ),

    SEN: createSectionColors(
        '#00853F',
        '#FDEF42'
    ),
    SENEGAL: createSectionColors(
        '#00853F',
        '#FDEF42'
    ),

    SUI: createSectionColors(
        '#FF0000',
        '#FFFFFF'
    ),
    SWITZERLAND:
        createSectionColors(
            '#FF0000',
            '#FFFFFF'
        ),

    SWE: createSectionColors(
        '#006AA7',
        '#FECC02'
    ),
    SWEDEN: createSectionColors(
        '#006AA7',
        '#FECC02'
    ),

    TUN: createSectionColors(
        '#E70013',
        '#FFFFFF'
    ),
    TUNISIA: createSectionColors(
        '#E70013',
        '#FFFFFF'
    ),

    TUR: createSectionColors(
        '#E30A17',
        '#FFFFFF'
    ),
    TURKEY: createSectionColors(
        '#E30A17',
        '#FFFFFF'
    ),
    TÜRKIYE: createSectionColors(
        '#E30A17',
        '#FFFFFF'
    ),

    URU: createSectionColors(
        '#5BC0EB',
        '#FFFFFF'
    ),
    URUGUAY: createSectionColors(
        '#5BC0EB',
        '#FFFFFF'
    ),

    USA: createSectionColors(
        '#3C3B6E',
        '#B22234'
    ),
    'UNITED STATES':
        createSectionColors(
            '#3C3B6E',
            '#B22234'
        ),

    UZB: createSectionColors(
        '#0099B5',
        '#1EB53A'
    ),
    UZBEKISTAN:
        createSectionColors(
            '#0099B5',
            '#1EB53A'
        ),

    ALG: createSectionColors(
        '#006233',
        '#D21034'
    ),
    ALGERIA: createSectionColors(
        '#006233',
        '#D21034'
    ),
};

function normalizeSectionColorKey(
    value?: string
): string {
    return (
        value
            ?.trim()
            .toUpperCase() ??
        ''
    );
}

export function getSectionColors(
    name: string,
    federation?: string
): SectionColors {
    const nameKey =
        normalizeSectionColorKey(
            name
        );

    const federationKey =
        normalizeSectionColorKey(
            federation
        );

    return (
        COUNTRY_SECTION_COLORS[
            federationKey
            ] ??
        COUNTRY_SECTION_COLORS[
            nameKey
            ] ??
        DEFAULT_SECTION_COLORS
    );
}