import {
    type PropsWithChildren,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { useRouter } from 'expo-router';

import {
    Animated as RNAnimated,
    Pressable,
    SafeAreaView,
    ScrollView,
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
import type {
    CollectionStatsSummary,
    SectionCollectionSummary,
} from '@/types/album';
import {
    getCollectionStatsSummary,
    getCollectionSummary,
} from '@/utils/albumStats';
import {
    searchCollectionStickers,
    type CollectionFilter,
    type CollectionStickerResult,
} from '@/utils/collectionSearch';

type CollectionView =
    | 'stickers'
    | 'stats';

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

    const statsSummary = useMemo(
        () =>
            getCollectionStatsSummary(
                albumCatalogue,
                collection
            ),
        [collection]
    );

    const filteredStickers = useMemo(
        () =>
            searchCollectionStickers(
                collection,
                {
                    query,
                    filter:
                    activeFilter,
                }
            ),
        [
            collection,
            query,
            activeFilter,
        ]
    );

    const handleSelectQuickFilter = (
        filter: CollectionQuickFilter
    ) => {
        setActiveFilter(
            (currentFilter) =>
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
                openRequest:
                    Date.now().toString(),
            },
        });
    };

    const handlePressSection = (
        section:
        SectionCollectionSummary
    ) => {
        router.navigate({
            pathname: '/',
            params: {
                sectionId:
                section.sectionId,
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
                        activeView ===
                        'stickers' &&
                        isHeaderCollapsed
                    }
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            Collection
                        </Text>

                        <Text
                            style={
                                styles.description
                            }
                        >
                            Search your stickers,
                            review missing cards,
                            manage duplicates, and
                            track your progress.
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

                {activeView ===
                'stickers' ? (
                    <StickersView
                        isHydrated={
                            isHydrated
                        }
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
                        onChangeQuery={
                            setQuery
                        }
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
                        isHydrated={
                            isHydrated
                        }
                        stats={
                            statsSummary
                        }
                        onPressSection={
                            handlePressSection
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
        new RNAnimated.Value(
            collapsed ? 1 : 0
        )
    ).current;

    const fullHeightRef =
        useRef(0);

    const [
        fullHeight,
        setFullHeight,
    ] = useState(0);

    useEffect(() => {
        progress.stopAnimation();

        RNAnimated.timing(progress, {
            toValue:
                collapsed ? 1 : 0,
            duration:
                collapsed ? 210 : 280,
            useNativeDriver: false,
        }).start();
    }, [
        collapsed,
        progress,
    ]);

    const animatedStyle =
        fullHeight > 0
            ? {
                height:
                    progress.interpolate({
                        inputRange: [
                            0,
                            1,
                        ],
                        outputRange: [
                            fullHeight,
                            0,
                        ],
                    }),

                opacity:
                    progress.interpolate({
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
                            progress.interpolate(
                                {
                                    inputRange:
                                        [
                                            0,
                                            1,
                                        ],
                                    outputRange:
                                        [
                                            0,
                                            -10,
                                        ],
                                }
                            ),
                    },
                ],
            }
            : undefined;

    return (
        <RNAnimated.View
            pointerEvents={
                collapsed
                    ? 'none'
                    : 'auto'
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
                        event.nativeEvent
                            .layout.height;

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
        </RNAnimated.View>
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
    stickers:
        CollectionStickerResult[];
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
        sticker:
        CollectionStickerResult
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
                <LoadingCard />
            </View>
        );
    }

    const quickFilter =
        activeFilter ===
        'missing' ||
        activeFilter === 'owned' ||
        activeFilter ===
        'repeated'
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
    stats: CollectionStatsSummary;

    onPressSection: (
        section:
        SectionCollectionSummary
    ) => void;
}

function StatsView({
                       isHydrated,
                       stats,
                       onPressSection,
                   }: StatsViewProps) {
    if (!isHydrated) {
        return (
            <View style={styles.content}>
                <LoadingCard />
            </View>
        );
    }

    const overallPercentage =
        Math.round(
            stats.overall
                .completionPercentage
        );

    const foilPercentage =
        Math.round(
            stats.foil
                .completionPercentage
        );

    return (
        <ScrollView
            style={styles.statsScroll}
            contentContainerStyle={
                styles.statsContent
            }
            showsVerticalScrollIndicator={
                false
            }
        >
            <View style={styles.heroCard}>
                <View style={styles.heroTopRow}>
                    <View style={styles.heroCopy}>
                        <Text
                            style={
                                styles.statsEyebrow
                            }
                        >
                            ALBUM COMPLETION
                        </Text>

                        <Text
                            style={
                                styles.heroPercentage
                            }
                        >
                            {overallPercentage}%
                        </Text>

                        <Text
                            style={
                                styles.heroDescription
                            }
                        >
                            {
                                stats.overall
                                    .uniqueOwned
                            }{' '}
                            of{' '}
                            {
                                stats.overall
                                    .totalStickers
                            }{' '}
                            unique stickers
                            collected
                        </Text>
                    </View>

                    <View
                        style={
                            styles.heroCountBadge
                        }
                    >
                        <Text
                            style={
                                styles.heroCountValue
                            }
                        >
                            {
                                stats.overall
                                    .missingStickers
                            }
                        </Text>

                        <Text
                            style={
                                styles.heroCountLabel
                            }
                        >
                            missing
                        </Text>
                    </View>
                </View>

                <ProgressBar
                    percentage={
                        stats.overall
                            .completionPercentage
                    }
                    variant="gold"
                />
            </View>

            <View style={styles.metricGrid}>
                <MetricCard
                    label="Owned"
                    value={
                        stats.overall
                            .uniqueOwned
                    }
                    detail="unique stickers"
                    variant="owned"
                />

                <MetricCard
                    label="Missing"
                    value={
                        stats.overall
                            .missingStickers
                    }
                    detail="still needed"
                    variant="missing"
                />

                <MetricCard
                    label="Duplicates"
                    value={
                        stats.overall
                            .repeatedStickerTypes
                    }
                    detail="sticker types"
                    variant="gold"
                />

                <MetricCard
                    label="Trade copies"
                    value={
                        stats.overall
                            .totalExtraCopies
                    }
                    detail="extra stickers"
                    variant="gold"
                />
            </View>

            <View style={styles.statsSection}>
                <Text style={styles.statsSectionTitle}>
                    Foil collection
                </Text>

                <View style={styles.foilCard}>
                    <View style={styles.foilHeader}>
                        <View>
                            <Text
                                style={
                                    styles.foilPercentage
                                }
                            >
                                {foilPercentage}%
                            </Text>

                            <Text
                                style={
                                    styles.foilDescription
                                }
                            >
                                {
                                    stats.foil
                                        .ownedFoils
                                }{' '}
                                of{' '}
                                {
                                    stats.foil
                                        .totalFoils
                                }{' '}
                                foils collected
                            </Text>
                        </View>

                        <View
                            style={
                                styles.foilBadge
                            }
                        >
                            <Text
                                style={
                                    styles.foilBadgeText
                                }
                            >
                                FOIL
                            </Text>
                        </View>
                    </View>

                    <ProgressBar
                        percentage={
                            stats.foil
                                .completionPercentage
                        }
                        variant="foil"
                    />

                    <Text
                        style={
                            styles.foilMissingText
                        }
                    >
                        {
                            stats.foil
                                .missingFoils
                        }{' '}
                        foil stickers missing
                    </Text>
                </View>
            </View>

            <View style={styles.statsSection}>
                <Text style={styles.statsSectionTitle}>
                    Collection highlights
                </Text>

                <View style={styles.highlightRow}>
                    <HighlightCard
                        label="Most complete"
                        section={
                            stats.mostCompleteSection
                        }
                        variant="best"
                    />

                    <HighlightCard
                        label="Needs attention"
                        section={
                            stats.leastCompleteSection
                        }
                        variant="lowest"
                    />
                </View>
            </View>

            <View style={styles.statsSection}>
                <View
                    style={
                        styles.sectionProgressHeader
                    }
                >
                    <Text
                        style={
                            styles.statsSectionTitle
                        }
                    >
                        Progress by section
                    </Text>

                    <Text
                        style={
                            styles.sectionCount
                        }
                    >
                        {stats.sections.length}
                    </Text>
                </View>

                <View
                    style={
                        styles.sectionProgressList
                    }
                >
                    {[...stats.sections]
                        .sort((sectionA, sectionB) => {
                            const progressDifference =
                                sectionB.completionPercentage -
                                sectionA.completionPercentage;

                            if (progressDifference !== 0) {
                                return progressDifference;
                            }

                            return sectionA.sectionName.localeCompare(
                                sectionB.sectionName
                            );
                        })
                        .map((section) => (
                            <SectionProgressCard
                                key={section.sectionId}
                                section={section}
                                onPress={() =>
                                    onPressSection(section)
                                }
                            />
                        ))}
                </View>
            </View>
        </ScrollView>
    );
}

function LoadingCard() {
    return (
        <View style={styles.placeholderCard}>
            <Text style={styles.placeholderTitle}>
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
    );
}

type ProgressVariant =
    | 'gold'
    | 'foil';

interface ProgressBarProps {
    percentage: number;
    variant: ProgressVariant;
}

function ProgressBar({
                         percentage,
                         variant,
                     }: ProgressBarProps) {
    const normalizedPercentage =
        Math.max(
            0,
            Math.min(
                100,
                percentage
            )
        );

    return (
        <View style={styles.progressTrack}>
            <View
                style={[
                    styles.progressFill,
                    variant === 'gold'
                        ? styles.progressFillGold
                        : styles.progressFillFoil,
                    {
                        width:
                            `${normalizedPercentage}%`,
                    },
                ]}
            />
        </View>
    );
}

type MetricVariant =
    | 'owned'
    | 'missing'
    | 'gold';

interface MetricCardProps {
    label: string;
    value: number;
    detail: string;
    variant: MetricVariant;
}

function MetricCard({
                        label,
                        value,
                        detail,
                        variant,
                    }: MetricCardProps) {
    return (
        <View
            style={[
                styles.metricCard,
                variant === 'owned' &&
                styles.metricCardOwned,
                variant === 'missing' &&
                styles.metricCardMissing,
                variant === 'gold' &&
                styles.metricCardGold,
            ]}
        >
            <Text style={styles.metricLabel}>
                {label}
            </Text>

            <Text
                style={[
                    styles.metricValue,
                    variant === 'owned' &&
                    styles.metricValueOwned,
                    variant === 'missing' &&
                    styles.metricValueMissing,
                    variant === 'gold' &&
                    styles.metricValueGold,
                ]}
            >
                {value}
            </Text>

            <Text style={styles.metricDetail}>
                {detail}
            </Text>
        </View>
    );
}

interface HighlightCardProps {
    label: string;
    section:
        SectionCollectionSummary | null;
    variant:
        | 'best'
        | 'lowest';
}

function HighlightCard({
                           label,
                           section,
                           variant,
                       }: HighlightCardProps) {
    return (
        <View
            style={[
                styles.highlightCard,
                variant === 'best'
                    ? styles.highlightCardBest
                    : styles.highlightCardLowest,
            ]}
        >
            <Text
                style={
                    styles.highlightLabel
                }
            >
                {label}
            </Text>

            <Text
                numberOfLines={2}
                style={
                    styles.highlightName
                }
            >
                {section?.sectionName ??
                    'No section'}
            </Text>

            <Text
                style={[
                    styles.highlightPercentage,
                    variant === 'best'
                        ? styles.highlightPercentageBest
                        : styles.highlightPercentageLowest,
                ]}
            >
                {section
                    ? `${Math.round(
                        section.completionPercentage
                    )}%`
                    : '—'}
            </Text>

            {section ? (
                <Text
                    style={
                        styles.highlightDetail
                    }
                >
                    {section.uniqueOwned} of{' '}
                    {section.totalStickers}
                </Text>
            ) : null}
        </View>
    );
}

interface SectionProgressCardProps {
    section:
        SectionCollectionSummary;
    onPress: () => void;
}

function SectionProgressCard({
                                 section,
                                 onPress,
                             }: SectionProgressCardProps) {
    const percentage =
        Math.round(
            section.completionPercentage
        );

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${section.sectionName} in album`}
            onPress={onPress}
            style={({ pressed }) => [
                styles.sectionProgressCard,
                pressed &&
                styles.sectionProgressCardPressed,
            ]}
        >
            <View
                style={
                    styles.sectionProgressTop
                }
            >
                <View
                    style={
                        styles.sectionProgressCopy
                    }
                >
                    <Text
                        numberOfLines={1}
                        style={
                            styles.sectionProgressName
                        }
                    >
                        {section.sectionName}
                    </Text>

                    <Text
                        numberOfLines={1}
                        style={
                            styles.sectionProgressMeta
                        }
                    >
                        {section.federation
                            ? `${section.federation} · `
                            : ''}
                        {section.uniqueOwned} of{' '}
                        {section.totalStickers}
                    </Text>
                </View>

                <Text
                    style={
                        styles.sectionProgressPercentage
                    }
                >
                    {percentage}%
                </Text>
            </View>

            <ProgressBar
                percentage={
                    section.completionPercentage
                }
                variant="gold"
            />

            <View
                style={
                    styles.sectionProgressFooter
                }
            >
                <Text
                    style={
                        styles.sectionProgressFooterText
                    }
                >
                    {section.missingStickers}{' '}
                    missing
                </Text>

                <Text
                    style={
                        styles.sectionProgressFooterText
                    }
                >
                    {
                        section.totalExtraCopies
                    }{' '}
                    trade copies
                </Text>
            </View>
        </Pressable>
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
        marginTop:
        theme.spacing.xl,
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

    statsScroll: {
        flex: 1,
        minHeight: 0,
    },

    statsContent: {
        gap: theme.spacing.xl,
        paddingTop:
        theme.spacing.xl,
        paddingBottom:
            theme.spacing.xl * 2,
    },

    heroCard: {
        padding:
        theme.spacing.xl,
        borderWidth: 1,
        borderColor:
            'rgba(245, 197, 24, 0.42)',
        borderRadius:
        theme.radius.lg,
        backgroundColor:
            'rgba(245, 197, 24, 0.10)',
    },

    heroTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent:
            'space-between',
        gap: theme.spacing.lg,
    },

    heroCopy: {
        flex: 1,
    },

    statsEyebrow: {
        fontSize:
        theme.typography.sizes.xs,
        fontWeight:
        theme.typography.weights.bold,
        letterSpacing: 1,
        color:
        theme.colors.gold,
    },

    heroPercentage: {
        marginTop:
        theme.spacing.sm,
        fontSize: 48,
        lineHeight: 54,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    heroDescription: {
        marginTop: 4,
        fontSize:
        theme.typography.sizes.sm,
        lineHeight: 20,
        color:
        theme.colors.textSecondary,
    },

    heroCountBadge: {
        minWidth: 74,
        alignItems: 'center',
        paddingHorizontal:
        theme.spacing.md,
        paddingVertical:
        theme.spacing.sm,
        borderWidth: 1,
        borderColor:
        theme.colors.border,
        borderRadius:
        theme.radius.lg,
        backgroundColor:
        theme.colors.missing,
    },

    heroCountValue: {
        fontSize:
        theme.typography.sizes.xl,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    heroCountLabel: {
        marginTop: 2,
        fontSize:
        theme.typography.sizes.xs,
        color:
        theme.colors.textMuted,
    },

    progressTrack: {
        height: 8,
        marginTop:
        theme.spacing.lg,
        overflow: 'hidden',
        borderRadius:
        theme.radius.full,
        backgroundColor:
            'rgba(255,255,255,0.10)',
    },

    progressFill: {
        height: '100%',
        borderRadius:
        theme.radius.full,
    },

    progressFillGold: {
        backgroundColor:
        theme.colors.gold,
    },

    progressFillFoil: {
        backgroundColor:
            '#9D8CFF',
    },

    metricGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.md,
    },

    metricCard: {
        width: '47.8%',
        minHeight: 118,
        padding:
        theme.spacing.md,
        borderWidth: 1,
        borderRadius:
        theme.radius.lg,
    },

    metricCardOwned: {
        borderColor:
            'rgba(53, 201, 111, 0.42)',
        backgroundColor:
            'rgba(53, 201, 111, 0.12)',
    },

    metricCardMissing: {
        borderColor:
        theme.colors.border,
        backgroundColor:
        theme.colors.missing,
    },

    metricCardGold: {
        borderColor:
            'rgba(245, 197, 24, 0.30)',
        backgroundColor:
            'rgba(245, 197, 24, 0.08)',
    },

    metricLabel: {
        fontSize:
        theme.typography.sizes.sm,
        color:
        theme.colors.textSecondary,
    },

    metricValue: {
        marginTop:
        theme.spacing.sm,
        fontSize: 30,
        fontWeight:
        theme.typography.weights.bold,
    },

    metricValueOwned: {
        color:
        theme.colors.owned,
    },

    metricValueMissing: {
        color:
        theme.colors.textPrimary,
    },

    metricValueGold: {
        color:
        theme.colors.gold,
    },

    metricDetail: {
        marginTop: 4,
        fontSize:
        theme.typography.sizes.xs,
        color:
        theme.colors.textMuted,
    },

    statsSection: {
        gap: theme.spacing.md,
    },

    statsSectionTitle: {
        fontSize:
        theme.typography.sizes.lg,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    foilCard: {
        padding:
        theme.spacing.lg,
        borderWidth: 1,
        borderColor:
            'rgba(139, 126, 255, 0.42)',
        borderRadius:
        theme.radius.lg,
        backgroundColor:
            'rgba(139, 126, 255, 0.10)',
    },

    foilHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent:
            'space-between',
        gap: theme.spacing.md,
    },

    foilPercentage: {
        fontSize: 32,
        fontWeight:
        theme.typography.weights.bold,
        color: '#C8C0FF',
    },

    foilDescription: {
        marginTop: 4,
        fontSize:
        theme.typography.sizes.sm,
        color:
        theme.colors.textSecondary,
    },

    foilBadge: {
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor:
            'rgba(139, 126, 255, 0.55)',
        borderRadius:
        theme.radius.full,
        backgroundColor:
            'rgba(139, 126, 255, 0.18)',
    },

    foilBadgeText: {
        fontSize: 9,
        fontWeight:
        theme.typography.weights.bold,
        letterSpacing: 0.7,
        color: '#C8C0FF',
    },

    foilMissingText: {
        marginTop:
        theme.spacing.sm,
        fontSize:
        theme.typography.sizes.xs,
        color:
        theme.colors.textMuted,
    },

    highlightRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },

    highlightCard: {
        flex: 1,
        minHeight: 152,
        padding:
        theme.spacing.md,
        borderWidth: 1,
        borderRadius:
        theme.radius.lg,
    },

    highlightCardBest: {
        borderColor:
            'rgba(53, 201, 111, 0.38)',
        backgroundColor:
            'rgba(53, 201, 111, 0.10)',
    },

    highlightCardLowest: {
        borderColor:
        theme.colors.border,
        backgroundColor:
        theme.colors.missing,
    },

    highlightLabel: {
        fontSize:
        theme.typography.sizes.xs,
        fontWeight:
        theme.typography.weights.semibold,
        color:
        theme.colors.textMuted,
    },

    highlightName: {
        minHeight: 40,
        marginTop:
        theme.spacing.sm,
        fontSize:
        theme.typography.sizes.sm,
        fontWeight:
        theme.typography.weights.semibold,
        lineHeight: 19,
        color:
        theme.colors.textPrimary,
    },

    highlightPercentage: {
        marginTop:
        theme.spacing.sm,
        fontSize: 28,
        fontWeight:
        theme.typography.weights.bold,
    },

    highlightPercentageBest: {
        color:
        theme.colors.owned,
    },

    highlightPercentageLowest: {
        color:
        theme.colors.gold,
    },

    highlightDetail: {
        marginTop: 2,
        fontSize:
        theme.typography.sizes.xs,
        color:
        theme.colors.textMuted,
    },

    sectionProgressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:
            'space-between',
    },

    sectionCount: {
        minWidth: 30,
        textAlign: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius:
        theme.radius.full,
        backgroundColor:
        theme.colors.missing,
        fontSize:
        theme.typography.sizes.xs,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.gold,
    },

    sectionProgressList: {
        gap: theme.spacing.md,
    },

    sectionProgressCard: {
        padding:
        theme.spacing.md,
        borderWidth: 1,
        borderColor:
        theme.colors.border,
        borderRadius:
        theme.radius.lg,
        backgroundColor:
        theme.colors.missing,
    },

    sectionProgressCardPressed: {
        opacity: 0.76,
        transform: [
            {
                scale: 0.99,
            },
        ],
    },

    sectionProgressTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent:
            'space-between',
        gap: theme.spacing.md,
    },

    sectionProgressCopy: {
        flex: 1,
    },

    sectionProgressName: {
        fontSize:
        theme.typography.sizes.md,
        fontWeight:
        theme.typography.weights.semibold,
        color:
        theme.colors.textPrimary,
    },

    sectionProgressMeta: {
        marginTop: 4,
        fontSize:
        theme.typography.sizes.xs,
        color:
        theme.colors.textMuted,
    },

    sectionProgressPercentage: {
        fontSize:
        theme.typography.sizes.lg,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.gold,
    },

    sectionProgressFooter: {
        flexDirection: 'row',
        justifyContent:
            'space-between',
        gap: theme.spacing.sm,
        marginTop:
        theme.spacing.sm,
    },

    sectionProgressFooterText: {
        fontSize:
        theme.typography.sizes.xs,
        color:
        theme.colors.textMuted,
    },
});