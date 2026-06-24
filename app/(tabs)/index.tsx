import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSettings } from '@/hooks/useSettings';

import { AlbumHeader } from '@/components/album/AlbumHeader';
import { SectionProgress } from '@/components/album/SectionProgress';
import { SectionSelector } from '@/components/album/SectionSelector';
import { StickerGrid } from '@/components/album/StickerGrid';
import { theme } from '@/constants/theme';
import {
    albumCatalogue,
    sectionsById,
} from '@/data/albumCatalogue';
import { useStickers } from '@/hooks/useStickers';
import {
    getCollectionSummary,
    getSectionCollectionSummary,
} from '@/utils/albumStats';
import { attachStickerState } from '@/utils/stickerState';

export default function AlbumScreen() {
    const insets = useSafeAreaInsets();

    const { settings } = useSettings();

    const {
        collection,
        incrementSticker,
        decrementSticker,
    } = useStickers();

    const firstSectionId =
        albumCatalogue.sections[0]?.id ?? '';

    const [
        selectedSectionId,
        setSelectedSectionId,
    ] = useState(firstSectionId);

    const selectedSection =
        sectionsById.get(selectedSectionId) ??
        albumCatalogue.sections[0];

    const albumSummary = useMemo(
        () =>
            getCollectionSummary(
                albumCatalogue,
                collection
            ),
        [collection]
    );

    const sectionSummary = useMemo(() => {
        if (!selectedSection) {
            return undefined;
        }

        return getSectionCollectionSummary(
            albumCatalogue,
            selectedSection.id,
            collection
        );
    }, [collection, selectedSection]);

    const sectionStickers = useMemo(() => {
        if (!selectedSection) {
            return [];
        }

        return selectedSection.stickers.map(
            (sticker) =>
                attachStickerState(
                    {
                        ...sticker,
                        sectionId: selectedSection.id,
                        sectionName: selectedSection.name,
                        federation: selectedSection.federation,
                    },
                    collection
                )
        );
    }, [collection, selectedSection]);

    const header = (
        <View style={styles.header}>
            <AlbumHeader
                owned={albumSummary.uniqueOwned}
                total={albumSummary.totalStickers}
                percentage={
                    albumSummary.completionPercentage
                }
            />

            <View style={styles.sectionBrowser}>
                <View style={styles.sectionHeadingRow}>
                    <Text style={styles.sectionHeading}>
                        Sections
                    </Text>

                    <Text style={styles.sectionCount}>
                        {albumCatalogue.sections.length}
                    </Text>
                </View>

                <SectionSelector
                    sections={albumCatalogue.sections}
                    selectedSectionId={selectedSectionId}
                    onSelectSection={setSelectedSectionId}
                />
            </View>

            {selectedSection && sectionSummary && (
                <SectionProgress
                    name={selectedSection.name}
                    federation={selectedSection.federation}
                    owned={sectionSummary.uniqueOwned}
                    total={sectionSummary.totalStickers}
                    percentage={
                        sectionSummary.completionPercentage
                    }
                />
            )}

            <View style={styles.gridHeadingRow}>
                <Text style={styles.gridHeading}>
                    Stickers
                </Text>

                <Text style={styles.gridCount}>
                    {sectionStickers.length}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.screen}>
            <StickerGrid
                stickers={sectionStickers}
                invertSwipeDirections={
                    settings.invertSwipeDirections
                }
                onIncrementSticker={(stickerId) => {
                    void incrementSticker(stickerId);
                }}
                onDecrementSticker={(stickerId) => {
                    void decrementSticker(stickerId);
                }}
                header={header}
                contentTopPadding={
                    insets.top + theme.spacing.lg
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },

    header: {
        marginBottom: theme.spacing.md,
    },

    sectionBrowser: {
        marginTop: theme.spacing.xl,
    },

    sectionHeadingRow: {
        marginBottom: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    sectionHeading: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.textPrimary,
    },

    sectionCount: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
    },

    gridHeadingRow: {
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    gridHeading: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.textPrimary,
    },

    gridCount: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
    },
});