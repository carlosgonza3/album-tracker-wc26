import {
    type PropsWithChildren,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { useRouter } from 'expo-router';

import {
    Animated,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { CollectionSearchControls } from '@/components/search/CollectionSearchControls';
import { CollectionStickerResults } from '@/components/search/CollectionStickerResults';
import {
    CollectionSummaryCards,
    type CollectionQuickFilter,
} from '@/components/search/CollectionSummaryCards';
import { theme } from '@/constants/theme';
import { albumCatalogue } from '@/data/albumCatalogue';
import { useStickers } from '@/hooks/useStickers';
import { getCollectionSummary } from '@/utils/albumStats';
import {
    searchCollectionStickers,
    type CollectionFilter,
    type CollectionStickerResult,
} from '@/utils/collectionSearch';

type CollectionView = 'stickers' | 'stats';

export default function CollectionScreen() {
    const router = useRouter();

    const { collection, isHydrated } =
        useStickers();

    const [activeView, setActiveView] =
        useState<CollectionView>('stickers');

    const [query, setQuery] = useState('');

    const [activeFilter, setActiveFilter] =
        useState<CollectionFilter>('all');

    const [
        isHeaderCollapsed,
        setIsHeaderCollapsed,
    ] = useState(false);

    const summary = useMemo(
        () =>
            getCollectionSummary(
                albumCatalogue,
                collection
            ),
        [collection]
    );

    const filteredStickers = useMemo(
        () =>
            searchCollectionStickers(collection, {
                query,
                filter: activeFilter,
            }),
        [
            collection,
            query,
            activeFilter,
        ]
    );

    const handleSelectQuickFilter = (
        filter: CollectionQuickFilter
    ) => {
        setActiveFilter((currentFilter) =>
            currentFilter === filter
                ? 'all'
                : filter
        );
    };

    const handleChangeView = (
        view: CollectionView
    ) => {
        setIsHeaderCollapsed(false);
        setActiveView(view);
    };

    const handlePressSticker = (
        sticker: CollectionStickerResult
    ) => {
        router.navigate({
            pathname: '/',
            params: {
                sectionId:
                sticker.sectionId,

                /*
                 * Makes every press a distinct navigation
                 * request, even when opening the same section
                 * more than once.
                 */
                openRequest:
                    Date.now().toString(),
            },
        });
    };

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.container}>
                <CollapsibleArea
                    collapsed={
                        activeView === 'stickers' &&
                        isHeaderCollapsed
                    }
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            Collection
                        </Text>

                        <Text style={styles.description}>
                            Search your stickers, review missing
                            cards, manage duplicates, and track
                            your progress.
                        </Text>
                    </View>
                </CollapsibleArea>

                <View
                    style={[
                        styles.segmentedControl,
                        isHeaderCollapsed &&
                        activeView ===
                        'stickers' &&
                        styles.segmentedControlCollapsed,
                    ]}
                >
                    <SegmentButton
                        label="Stickers"
                        active={
                            activeView ===
                            'stickers'
                        }
                        onPress={() =>
                            handleChangeView(
                                'stickers'
                            )
                        }
                    />

                    <SegmentButton
                        label="Stats"
                        active={
                            activeView ===
                            'stats'
                        }
                        onPress={() =>
                            handleChangeView(
                                'stats'
                            )
                        }
                    />
                </View>

                {activeView === 'stickers' ? (
                    <StickersView
                        isHydrated={isHydrated}
                        isHeaderCollapsed={
                            isHeaderCollapsed
                        }
                        query={query}
                        activeFilter={
                            activeFilter
                        }
                        stickers={
                            filteredStickers
                        }
                        missingCount={
                            summary.missingStickers
                        }
                        ownedCount={
                            summary.uniqueOwned
                        }
                        repeatedCount={
                            summary.repeatedStickerTypes
                        }
                        tradeCopiesCount={
                            summary.totalExtraCopies
                        }
                        onChangeQuery={setQuery}
                        onChangeFilter={
                            setActiveFilter
                        }
                        onSelectQuickFilter={
                            handleSelectQuickFilter
                        }
                        onPressSticker={
                            handlePressSticker
                        }
                        onCollapseChange={
                            setIsHeaderCollapsed
                        }
                    />
                ) : (
                    <StatsView
                        isHydrated={isHydrated}
                        completionPercentage={
                            summary.completionPercentage
                        }
                        uniqueOwned={
                            summary.uniqueOwned
                        }
                        totalStickers={
                            summary.totalStickers
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

interface CollapsibleAreaProps
    extends PropsWithChildren {
    collapsed: boolean;
}

function CollapsibleArea({
                             collapsed,
                             children,
                         }: CollapsibleAreaProps) {
    const progress = useRef(
        new Animated.Value(
            collapsed ? 1 : 0
        )
    ).current;

    /*
     * Stores the largest natural height ever measured.
     *
     * Measurements produced while the wrapper is partially
     * collapsed are smaller and must never replace this value.
     */
    const fullHeightRef = useRef(0);

    const [fullHeight, setFullHeight] =
        useState(0);

    useEffect(() => {
        progress.stopAnimation();

        Animated.timing(progress, {
            toValue: collapsed ? 1 : 0,
            duration: collapsed ? 210 : 280,
            useNativeDriver: false,
        }).start();
    }, [
        collapsed,
        progress,
    ]);

    const animatedStyle =
        fullHeight > 0
            ? {
                height: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                        fullHeight,
                        0,
                    ],
                }),

                opacity: progress.interpolate({
                    inputRange: [
                        0,
                        0.75,
                        1,
                    ],
                    outputRange: [
                        1,
                        0.25,
                        0,
                    ],
                }),

                transform: [
                    {
                        translateY:
                            progress.interpolate({
                                inputRange: [
                                    0,
                                    1,
                                ],
                                outputRange: [
                                    0,
                                    -10,
                                ],
                            }),
                    },
                ],
            }
            : undefined;

    return (
        <Animated.View
            pointerEvents={
                collapsed ? 'none' : 'auto'
            }
            style={[
                styles.collapsibleArea,
                animatedStyle,
            ]}
        >
            <View
                style={
                    styles.collapsibleContent
                }
                onLayout={(event) => {
                    const measuredHeight =
                        event.nativeEvent.layout
                            .height;

                    /*
                     * Only accept a larger measurement.
                     *
                     * This prevents a partially cropped height
                     * from becoming the new expansion target.
                     */
                    if (
                        measuredHeight >
                        fullHeightRef.current
                    ) {
                        fullHeightRef.current =
                            measuredHeight;

                        setFullHeight(
                            measuredHeight
                        );
                    }
                }}
            >
                {children}
            </View>
        </Animated.View>
    );
}

interface SegmentButtonProps {
    label: string;
    active: boolean;
    onPress: () => void;
}

function SegmentButton({
                           label,
                           active,
                           onPress,
                       }: SegmentButtonProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{
                selected: active,
            }}
            onPress={onPress}
            style={({ pressed }) => [
                styles.segmentButton,
                active &&
                styles.segmentButtonActive,
                pressed &&
                styles.segmentButtonPressed,
            ]}
        >
            <Text
                style={[
                    styles.segmentLabel,
                    active &&
                    styles.segmentLabelActive,
                ]}
            >
                {label}
            </Text>
        </Pressable>
    );
}

interface StickersViewProps {
    isHydrated: boolean;
    isHeaderCollapsed: boolean;
    query: string;
    activeFilter: CollectionFilter;
    stickers: CollectionStickerResult[];
    missingCount: number;
    ownedCount: number;
    repeatedCount: number;
    tradeCopiesCount: number;

    onChangeQuery: (
        query: string
    ) => void;

    onChangeFilter: (
        filter: CollectionFilter
    ) => void;

    onSelectQuickFilter: (
        filter: CollectionQuickFilter
    ) => void;

    onPressSticker: (
        sticker: CollectionStickerResult
    ) => void;

    onCollapseChange: (
        collapsed: boolean
    ) => void;
}

function StickersView({
                          isHydrated,
                          isHeaderCollapsed,
                          query,
                          activeFilter,
                          stickers,
                          missingCount,
                          ownedCount,
                          repeatedCount,
                          tradeCopiesCount,
                          onChangeQuery,
                          onChangeFilter,
                          onSelectQuickFilter,
                          onPressSticker,
                          onCollapseChange,
                      }: StickersViewProps) {
    if (!isHydrated) {
        return (
            <View style={styles.content}>
                <View
                    style={
                        styles.placeholderCard
                    }
                >
                    <Text
                        style={
                            styles.placeholderTitle
                        }
                    >
                        Loading collection
                    </Text>

                    <Text
                        style={
                            styles.placeholderDescription
                        }
                    >
                        Your saved sticker data is being
                        loaded.
                    </Text>
                </View>
            </View>
        );
    }

    const quickFilter =
        activeFilter === 'missing' ||
        activeFilter === 'owned' ||
        activeFilter === 'repeated'
            ? activeFilter
            : null;

    return (
        <View
            style={[
                styles.content,
                isHeaderCollapsed &&
                styles.contentCollapsed,
            ]}
        >
            <CollapsibleArea
                collapsed={
                    isHeaderCollapsed
                }
            >
                <View
                    style={
                        styles.summarySection
                    }
                >
                    <CollectionSummaryCards
                        missingCount={
                            missingCount
                        }
                        ownedCount={
                            ownedCount
                        }
                        repeatedCount={
                            repeatedCount
                        }
                        tradeCopiesCount={
                            tradeCopiesCount
                        }
                        activeFilter={
                            quickFilter
                        }
                        selectAll={
                            activeFilter ===
                            'all'
                        }
                        onSelectFilter={
                            onSelectQuickFilter
                        }
                    />
                </View>
            </CollapsibleArea>

            <View
                style={[
                    styles.searchSection,
                    isHeaderCollapsed &&
                    styles.searchSectionCollapsed,
                ]}
            >
                <CollectionSearchControls
                    query={query}
                    activeFilter={
                        activeFilter
                    }
                    onChangeQuery={
                        onChangeQuery
                    }
                    onChangeFilter={
                        onChangeFilter
                    }
                />
            </View>

            <CollectionStickerResults
                title={getFilterTitle(
                    activeFilter
                )}
                stickers={stickers}
                query={query}
                onPressSticker={
                    onPressSticker
                }
                onCollapseChange={
                    onCollapseChange
                }
            />
        </View>
    );
}

interface StatsViewProps {
    isHydrated: boolean;
    completionPercentage: number;
    uniqueOwned: number;
    totalStickers: number;
}

function StatsView({
                       isHydrated,
                       completionPercentage,
                       uniqueOwned,
                       totalStickers,
                   }: StatsViewProps) {
    const roundedPercentage = Math.round(
        completionPercentage
    );

    return (
        <View style={styles.content}>
            <View
                style={
                    styles.placeholderCard
                }
            >
                <Text
                    style={
                        styles.placeholderTitle
                    }
                >
                    Collection progress
                </Text>

                <Text
                    style={
                        styles.statsValue
                    }
                >
                    {isHydrated
                        ? `${roundedPercentage}%`
                        : '—'}
                </Text>

                <Text
                    style={
                        styles.placeholderDescription
                    }
                >
                    {isHydrated
                        ? `${uniqueOwned} of ${totalStickers} unique stickers collected.`
                        : 'Loading your collection statistics.'}
                </Text>
            </View>
        </View>
    );
}

function getFilterTitle(
    filter: CollectionFilter
): string {
    switch (filter) {
        case 'missing':
            return 'Missing stickers';

        case 'owned':
            return 'Owned stickers';

        case 'repeated':
            return 'Duplicates available for trade';

        case 'foil':
            return 'Foil stickers';

        case 'all':
        default:
            return 'All stickers';
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor:
        theme.colors.background,
    },

    container: {
        flex: 1,
        minHeight: 0,
        paddingHorizontal:
        theme.spacing.xl,
        paddingTop:
        theme.spacing.lg,
    },

    collapsibleArea: {
        width: '100%',
        flexShrink: 0,
        overflow: 'hidden',
    },

    collapsibleContent: {
        width: '100%',
        flexShrink: 0,
    },

    header: {
        gap: theme.spacing.sm,
        paddingBottom:
        theme.spacing.xl,
    },

    title: {
        fontSize:
        theme.typography.sizes.xxl,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    description: {
        maxWidth: 520,
        fontSize:
        theme.typography.sizes.md,
        lineHeight: 22,
        color:
        theme.colors.textSecondary,
    },

    segmentedControl: {
        flexShrink: 0,
        flexDirection: 'row',
        padding: 4,
        borderWidth: 1,
        borderColor:
        theme.colors.border,
        borderRadius:
        theme.radius.full,
        backgroundColor:
        theme.colors.missing,
    },

    segmentedControlCollapsed: {
        marginTop: 0,
    },

    segmentButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal:
        theme.spacing.md,
        paddingVertical:
        theme.spacing.sm,
        borderWidth: 1,
        borderColor: 'transparent',
        borderRadius:
        theme.radius.full,
    },

    segmentButtonActive: {
        borderColor:
        theme.colors.gold,
        backgroundColor:
            'rgba(245, 197, 24, 0.16)',
    },

    segmentButtonPressed: {
        backgroundColor:
        theme.colors.surfacePressed,
    },

    segmentLabel: {
        fontSize:
        theme.typography.sizes.sm,
        fontWeight:
        theme.typography.weights.semibold,
        color:
        theme.colors.textMuted,
    },

    segmentLabelActive: {
        color:
        theme.colors.gold,
    },

    content: {
        flex: 1,
        minHeight: 0,
        paddingTop:
        theme.spacing.xl,
    },

    contentCollapsed: {
        paddingTop:
        theme.spacing.md,
    },

    summarySection: {
        width: '100%',
        flexShrink: 0,
        paddingBottom:
        theme.spacing.lg,
    },

    searchSection: {
        width: '100%',
        flexShrink: 0,
        marginTop: 0,
    },

    searchSectionCollapsed: {
        marginTop: 0,
    },

    placeholderCard: {
        padding:
        theme.spacing.xl,
        borderWidth: 1,
        borderColor:
        theme.colors.border,
        borderRadius:
        theme.radius.lg,
        backgroundColor:
        theme.colors.missing,
    },

    placeholderTitle: {
        fontSize:
        theme.typography.sizes.lg,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    placeholderDescription: {
        marginTop:
        theme.spacing.sm,
        fontSize:
        theme.typography.sizes.md,
        lineHeight: 22,
        color:
        theme.colors.textSecondary,
    },

    statsValue: {
        marginTop:
        theme.spacing.lg,
        fontSize: 42,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.owned,
    },
});