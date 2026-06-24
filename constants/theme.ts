export const theme = {
    colors: {
        background: '#07152E',
        backgroundElevated: '#0C2042',
        primary: '#0D1B3E',
        primaryLight: '#17335F',

        accent: '#C8102E',
        accentLight: '#F04C63',

        gold: '#F5C518',
        goldLight: '#FFE16A',

        surface: 'rgba(255,255,255,0.07)',
        surfaceStrong: 'rgba(255,255,255,0.12)',
        surfacePressed: 'rgba(255,255,255,0.17)',

        glass: 'rgba(13,27,62,0.70)',
        glassBorder: 'rgba(255,255,255,0.14)',

        border: 'rgba(255,255,255,0.11)',
        borderStrong: 'rgba(255,255,255,0.22)',

        missing: 'rgba(255,255,255,0.08)',
        missingText: 'rgba(255,255,255,0.40)',

        owned: '#35C96F',
        ownedBackground: 'rgba(53,201,111,0.18)',

        repeated: '#F04C63',
        repeatedBackground: 'rgba(240,76,99,0.18)',

        textPrimary: '#FFFFFF',
        textSecondary: 'rgba(255,255,255,0.68)',
        textMuted: 'rgba(255,255,255,0.42)',
        textInverse: '#07152E',

        overlay: 'rgba(0,0,0,0.68)',
        error: '#F04C63',
    },

    typography: {
        sizes: {
            xs: 11,
            sm: 13,
            md: 15,
            lg: 17,
            xl: 21,
            xxl: 28,
            display: 34,
        },

        weights: {
            regular: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
        },
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        xxl: 32,
    },

    radius: {
        sm: 8,
        md: 12,
        lg: 18,
        xl: 24,
        full: 999,
    },
} as const;

export type Theme = typeof theme;