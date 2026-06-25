import { memo } from 'react';

import {
    StyleSheet,
    View,
} from 'react-native';

import { SectionProgress } from '@/components/album/overview/SectionProgress';
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
}

function AlbumSectionPageHeaderComponent({
                                             section,
                                             sectionIndex,
                                             name,
                                             federation,
                                             owned,
                                             total,
                                             percentage,
                                         }: AlbumSectionPageHeaderProps) {
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
        previous.name ===
        next.name &&
        previous.federation ===
        next.federation &&
        previous.owned ===
        next.owned &&
        previous.total ===
        next.total &&
        previous.percentage ===
        next.percentage
    );
}

export const AlbumSectionPageHeader = memo(
    AlbumSectionPageHeaderComponent,
    areAlbumSectionPageHeaderPropsEqual
);

const styles = StyleSheet.create({
    container: {
        paddingHorizontal:
        theme.spacing.md,

        paddingTop:
        theme.spacing.sm,

        paddingBottom:
        theme.spacing.lg,
    },
});