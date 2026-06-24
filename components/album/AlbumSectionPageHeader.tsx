import { memo } from 'react';

import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { SectionProgress } from '@/components/album/SectionProgress';
import { theme } from '@/constants/theme';
import type { AlbumSection } from '@/types/album';

interface AlbumSectionPageHeaderProps {
    section: AlbumSection;
    sectionIndex: number;
    name: string;
    federation?: string;
    owned: number;
    total: number;
    percentage: number;
    stickerCount: number;
}

function normalizeStickerCount(
    value: number
): number {
    if (!Number.isFinite(value)) {
        return 0;
    }

    return Math.max(
        0,
        Math.floor(value)
    );
}

function AlbumSectionPageHeaderComponent({
                                             section,
                                             sectionIndex,
                                             name,
                                             federation,
                                             owned,
                                             total,
                                             percentage,
                                             stickerCount,
                                         }: AlbumSectionPageHeaderProps) {
    const normalizedStickerCount =
        normalizeStickerCount(
            stickerCount
        );

    return (
        <View style={styles.container}>
            <SectionProgress
                section={section}
                sectionIndex={
                    sectionIndex
                }
                name={name}
                federation={federation}
                owned={owned}
                total={total}
                percentage={percentage}
            />

            <View style={styles.gridHeadingRow}>

            </View>
        </View>
    );
}

function areAlbumSectionPageHeaderPropsEqual(
    previous: AlbumSectionPageHeaderProps,
    next: AlbumSectionPageHeaderProps
): boolean {
    return (
        previous.section ===
        next.section &&
        previous.sectionIndex ===
        next.sectionIndex &&
        previous.name === next.name &&
        previous.federation ===
        next.federation &&
        previous.owned === next.owned &&
        previous.total === next.total &&
        previous.percentage ===
        next.percentage &&
        previous.stickerCount ===
        next.stickerCount
    );
}

export const AlbumSectionPageHeader = memo(
    AlbumSectionPageHeaderComponent,
    areAlbumSectionPageHeaderPropsEqual
);

const styles = StyleSheet.create({
    container: {
        paddingHorizontal:
        theme.spacing.xl,
        paddingTop:
        theme.spacing.xl,
    },

    gridHeadingRow: {
        marginTop:
        theme.spacing.xxl,
        marginBottom:
        theme.spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:
            'space-between',
        gap: theme.spacing.md,
    },

    gridCopy: {
        flex: 1,
    },

    gridHeading: {
        fontSize:
        theme.typography.sizes.lg,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    gridDescription: {
        marginTop: 6,
        fontSize:
        theme.typography.sizes.xs,
        lineHeight: 18,
        color:
        theme.colors.textSecondary,
    },

    gridCountBadge: {
        minWidth: 40,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal:
        theme.spacing.sm,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor:
        theme.colors.border,
        borderRadius:
        theme.radius.full,
        backgroundColor:
        theme.colors.surface,
    },

    gridCount: {
        fontSize:
        theme.typography.sizes.sm,
        fontWeight:
        theme.typography.weights.semibold,
        color:
        theme.colors.textPrimary,
    },
});