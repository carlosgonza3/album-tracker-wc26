import {
    forwardRef,
    memo,
    type ReactElement,
    useCallback,
    useMemo,
} from 'react';

import {
    FlatList,
    Image,
    type ListRenderItem,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
    Pressable,
    type ScrollViewProps,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Animated from 'react-native-reanimated';

import {
    getAlbumSectionArtwork,
} from '@/components/album/section/AlbumSectionArtwork';

import { theme } from '@/constants/theme';

import type { AlbumSection } from '@/types/album';

type StickerCollection = Record<
    string,
    number
>;

interface AlbumOverviewPageProps {
    sections: readonly AlbumSection[];
    collection: StickerCollection;

    topSpacerHeight: number;

    onSelectSection: (
        sectionId: string,
        sectionIndex: number
    ) => void;

    onScroll?: ScrollViewProps['onScroll'];
    scrollEventThrottle?: number;

    snapToOffsets?: number[];

    onScrollBeginDrag?: (
        event: NativeSyntheticEvent<NativeScrollEvent>
    ) => void;

    onScrollEndDrag?: (
        event: NativeSyntheticEvent<NativeScrollEvent>
    ) => void;

    onMomentumScrollEnd?: (
        event: NativeSyntheticEvent<NativeScrollEvent>
    ) => void;
}

interface AlbumOverviewCardProps {
    section: AlbumSection;
    sectionIndex: number;
    collection: StickerCollection;

    onSelectSection: (
        sectionId: string,
        sectionIndex: number
    ) => void;
}

interface SectionProgress {
    collected: number;
    total: number;
    percentage: number;
}

const OVERVIEW_COLUMNS = 2;

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

function clampPercentage(
    percentage: number
): number {
    return Math.max(
        0,
        Math.min(
            100,
            Math.round(percentage)
        )
    );
}

function calculateSectionProgress(
    section: AlbumSection,
    collection: StickerCollection
): SectionProgress {
    const total =
        section.stickers.length;

    const collected =
        section.stickers.reduce(
            (count, sticker) => {
                const copies =
                    normalizeCopies(
                        collection[
                            sticker.id
                            ]
                    );

                return (
                    count +
                    (copies > 0 ? 1 : 0)
                );
            },
            0
        );

    const percentage =
        total > 0
            ? (collected / total) * 100
            : 0;

    return {
        collected,
        total,
        percentage,
    };
}

const AlbumOverviewCard = memo(
    function AlbumOverviewCard({
                                   section,
                                   sectionIndex,
                                   collection,
                                   onSelectSection,
                               }: AlbumOverviewCardProps) {
        const progress = useMemo(
            () =>
                calculateSectionProgress(
                    section,
                    collection
                ),
            [
                collection,
                section,
            ]
        );

        const artwork = useMemo(
            () =>
                getAlbumSectionArtwork(
                    section,
                    sectionIndex
                ),
            [
                section,
                sectionIndex,
            ]
        );

        const percentage =
            clampPercentage(
                progress.percentage
            );

        const isCompleted =
            progress.total > 0 &&
            progress.collected ===
            progress.total;

        const handlePress =
            useCallback(() => {
                onSelectSection(
                    section.id,
                    sectionIndex
                );
            }, [
                onSelectSection,
                section.id,
                sectionIndex,
            ]);

        return (
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                    `${section.name}, ${progress.collected} of ${progress.total} stickers collected`
                }
                accessibilityHint={
                    'Opens this album section'
                }
                onPress={handlePress}
                style={({ pressed }) => [
                    styles.card,
                    pressed &&
                    styles.cardPressed,
                ]}
            >
                <View style={styles.cardTopRow}>
                    <View
                        style={[
                            styles.sectionArtwork,
                            artwork?.isLogo &&
                            styles.logoContainer,
                        ]}
                    >
                        {artwork ? (
                            <Image
                                source={
                                    artwork.source
                                }
                                resizeMode={
                                    artwork.resizeMode
                                }
                                style={[
                                    styles.artworkImage,
                                    artwork.isLogo &&
                                    styles.logoImage,
                                ]}
                                accessibilityIgnoresInvertColors
                            />
                        ) : null}
                    </View>

                    <Text
                        style={[
                            styles.cardPercentage,
                            isCompleted &&
                            styles.cardPercentageCompleted,
                        ]}
                    >
                        {percentage}%
                    </Text>
                </View>

                <View style={styles.cardCopy}>
                    <Text
                        numberOfLines={2}
                        style={styles.cardTitle}
                    >
                        {section.name}
                    </Text>

                    <Text
                        numberOfLines={1}
                        style={
                            styles.cardFederation
                        }
                    >
                        {section.federation}
                    </Text>
                </View>

                <View
                    style={
                        styles.progressTrack
                    }
                >
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width:
                                    `${percentage}%`,
                            },
                        ]}
                    />
                </View>

                <View
                    style={
                        styles.cardFooter
                    }
                >
                    <Text
                        style={
                            styles.cardCount
                        }
                    >
                        {progress.collected}
                        /{progress.total}
                    </Text>
                </View>
            </Pressable>
        );
    }
);

function AlbumOverviewPageComponent(
    {
        sections,
        collection,
        topSpacerHeight,
        onSelectSection,
        onScroll,
        scrollEventThrottle = 16,
        snapToOffsets,
        onScrollBeginDrag,
        onScrollEndDrag,
        onMomentumScrollEnd,
    }: AlbumOverviewPageProps,
    ref: React.ForwardedRef<
        FlatList<AlbumSection>
    >
) {
    const listHeader =
        useMemo<ReactElement>(
            () => (
                <View>
                    <View
                        style={{
                            height:
                            topSpacerHeight,
                        }}
                    />

                    <View style={styles.header}>
                        <Text
                            style={
                                styles.eyebrow
                            }
                        >
                            MY PROGRESS
                        </Text>

                        <Text style={styles.title}>
                            Overview
                        </Text>
                    </View>
                </View>
            ),
            [topSpacerHeight]
        );

    const keyExtractor = useCallback(
        (section: AlbumSection) =>
            section.id,
        []
    );

    const renderSection = useCallback<
        ListRenderItem<AlbumSection>
    >(
        ({ item, index }) => (
            <AlbumOverviewCard
                section={item}
                sectionIndex={index}
                collection={collection}
                onSelectSection={
                    onSelectSection
                }
            />
        ),
        [
            collection,
            onSelectSection,
        ]
    );

    return (
        <View
            collapsable={false}
            style={styles.page}
        >
            <Animated.FlatList<AlbumSection>
                ref={ref}
                style={styles.list}
                data={[...sections]}
                keyExtractor={
                    keyExtractor
                }
                renderItem={renderSection}
                numColumns={
                    OVERVIEW_COLUMNS
                }
                columnWrapperStyle={
                    styles.row
                }
                ListHeaderComponent={
                    listHeader
                }
                ListEmptyComponent={
                    <EmptyAlbumOverview />
                }
                contentContainerStyle={
                    styles.content
                }
                showsVerticalScrollIndicator={
                    false
                }
                onScroll={onScroll}
                scrollEventThrottle={
                    scrollEventThrottle
                }
                snapToOffsets={
                    snapToOffsets
                }
                snapToStart
                snapToEnd={false}
                decelerationRate="fast"
                onScrollBeginDrag={
                    onScrollBeginDrag
                }
                onScrollEndDrag={
                    onScrollEndDrag
                }
                onMomentumScrollEnd={
                    onMomentumScrollEnd
                }
                keyboardShouldPersistTaps="handled"
                contentInsetAdjustmentBehavior="never"
                overScrollMode="never"
                bounces={false}
                alwaysBounceVertical={false}
                initialNumToRender={8}
                maxToRenderPerBatch={8}
                updateCellsBatchingPeriod={16}
                windowSize={5}
                removeClippedSubviews={false}
            />
        </View>
    );
}

const EmptyAlbumOverview = memo(
    function EmptyAlbumOverview() {
        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>
                    No album sections
                </Text>

                <Text
                    style={
                        styles.emptyDescription
                    }
                >
                    Album sections will appear
                    here once they are available.
                </Text>
            </View>
        );
    }
);

const ForwardedAlbumOverviewPage =
    forwardRef<
        FlatList<AlbumSection>,
        AlbumOverviewPageProps
    >(AlbumOverviewPageComponent);

ForwardedAlbumOverviewPage.displayName =
    'AlbumOverviewPage';

export const AlbumOverviewPage = memo(
    ForwardedAlbumOverviewPage
);

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor:
        theme.colors.background,
    },

    list: {
        flex: 1,
        backgroundColor:
        theme.colors.background,
    },

    content: {
        flexGrow: 1,
        paddingHorizontal:
        theme.spacing.lg,
        paddingBottom:
        theme.spacing.xl,
    },

    header: {
        paddingTop:
        theme.spacing.xl,
        paddingBottom:
        theme.spacing.xl,
    },

    eyebrow: {
        fontSize: 10,
        fontWeight:
        theme.typography.weights.bold,
        letterSpacing: 1.5,
        color: theme.colors.gold,
    },

    title: {
        marginTop:
        theme.spacing.sm,
        fontSize: 34,
        lineHeight: 40,
        fontWeight:
        theme.typography.weights.bold,
        letterSpacing: -0.8,
        color:
        theme.colors.textPrimary,
    },

    row: {
        gap: theme.spacing.md,
        marginBottom:
        theme.spacing.md,
    },

    card: {
        flex: 1,
        minHeight: 176,
        padding:
        theme.spacing.lg,
        justifyContent:
            'space-between',
        borderWidth: 1,
        borderColor:
        theme.colors.border,
        borderRadius:
        theme.radius.lg,
        backgroundColor:
        theme.colors.surface,
    },

    cardPressed: {
        opacity: 0.72,
        transform: [
            {
                scale: 0.985,
            },
        ],
    },

    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:
            'space-between',
    },

    sectionArtwork: {
        width: 32,
        height: 32,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor:
            'rgba(245, 197, 24, 0.30)',
        borderRadius:
        theme.radius.full,
        backgroundColor:
            'rgba(245, 197, 24, 0.08)',
    },

    logoContainer: {
        padding: 3,
        backgroundColor:
            'rgba(255,255,255,0.96)',
    },

    artworkImage: {
        width: '100%',
        height: '100%',
    },

    logoImage: {
        borderRadius:
        theme.radius.full,
    },

    cardPercentage: {
        fontSize:
        theme.typography.sizes.sm,
        fontWeight:
        theme.typography.weights.bold,
        color: theme.colors.gold,
    },

    cardPercentageCompleted: {
        color: theme.colors.owned,
    },

    cardCopy: {
        marginVertical:
        theme.spacing.lg,
    },

    cardTitle: {
        fontSize:
        theme.typography.sizes.lg,
        lineHeight: 24,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    cardFederation: {
        marginTop: 5,
        fontSize:
        theme.typography.sizes.xs,
        color:
        theme.colors.textSecondary,
    },

    progressTrack: {
        height: 5,
        overflow: 'hidden',
        borderRadius:
        theme.radius.full,
        backgroundColor:
            'rgba(255,255,255,0.08)',
    },

    progressFill: {
        height: '100%',
        borderRadius:
        theme.radius.full,
        backgroundColor:
        theme.colors.owned,
    },

    cardFooter: {
        marginTop:
        theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:
            'space-between',
    },

    cardCount: {
        fontSize:
        theme.typography.sizes.xs,
        color:
        theme.colors.textSecondary,
    },

    emptyState: {
        alignItems: 'center',
        paddingVertical: 64,
        paddingHorizontal:
        theme.spacing.xl,
    },

    emptyTitle: {
        fontSize:
        theme.typography.sizes.lg,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    emptyDescription: {
        marginTop:
        theme.spacing.sm,
        textAlign: 'center',
        fontSize:
        theme.typography.sizes.sm,
        lineHeight: 20,
        color:
        theme.colors.textSecondary,
    },
});