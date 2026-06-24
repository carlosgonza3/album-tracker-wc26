import {
    memo,
    useMemo,
} from 'react';

import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import {
    Gesture,
    GestureDetector,
} from 'react-native-gesture-handler';

import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    type SharedValue,
    useAnimatedStyle,
} from 'react-native-reanimated';

import { theme } from '@/constants/theme';

/**
 * Height occupied by the compact header content,
 * excluding the device's top safe area.
 */
export const ALBUM_HEADER_COLLAPSED_HEIGHT = 64;

export interface AlbumHeaderSummary {
    collected: number;
    remaining: number;
    repeated: number;
    total: number;
    percentage: number;
}

interface CollapsibleAlbumHeaderProps {
    scrollY: SharedValue<number>;
    expandedHeight: number;
    safeAreaTop: number;
    summary: AlbumHeaderSummary;

    /**
     * Called after an upward gesture begins inside the
     * expanded My Album header.
     */
    onCollapseHeader: () => void;

    /**
     * Called after a downward gesture begins inside the
     * compact My Album header.
     */
    onExpandHeader: () => void;
}

interface AlbumStatProps {
    label: string;
    value: number;
    accent?: boolean;
}

interface HeaderAnimationOptions {
    scrollY: SharedValue<number>;
    expandedHeight: number;
    collapsedHeight: number;
}

const GESTURE_DISTANCE_THRESHOLD = 34;
const GESTURE_VELOCITY_THRESHOLD = 420;
const GESTURE_HORIZONTAL_FAILURE_OFFSET = 22;

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

function useHeaderAnimations({
                                 scrollY,
                                 expandedHeight,
                                 collapsedHeight,
                             }: HeaderAnimationOptions) {
    const collapseDistance = Math.max(
        1,
        expandedHeight - collapsedHeight
    );

    const containerStyle =
        useAnimatedStyle(() => {
            const progress = Math.min(
                Math.max(
                    scrollY.value /
                    collapseDistance,
                    0
                ),
                1
            );

            return {
                height: interpolate(
                    progress,
                    [0, 1],
                    [
                        expandedHeight,
                        collapsedHeight,
                    ],
                    Extrapolation.CLAMP
                ),

                shadowOpacity: interpolate(
                    progress,
                    [0.55, 1],
                    [0, 0.18],
                    Extrapolation.CLAMP
                ),

                elevation: interpolate(
                    progress,
                    [0.55, 1],
                    [0, 8],
                    Extrapolation.CLAMP
                ),
            };
        });

    const expandedContentStyle =
        useAnimatedStyle(() => {
            const progress = Math.min(
                Math.max(
                    scrollY.value /
                    collapseDistance,
                    0
                ),
                1
            );

            return {
                opacity: interpolate(
                    progress,
                    [
                        0,
                        0.48,
                        0.72,
                    ],
                    [
                        1,
                        0.72,
                        0,
                    ],
                    Extrapolation.CLAMP
                ),

                transform: [
                    {
                        translateY:
                            interpolate(
                                progress,
                                [0, 1],
                                [0, -56],
                                Extrapolation.CLAMP
                            ),
                    },
                    {
                        scale: interpolate(
                            progress,
                            [0, 1],
                            [1, 0.95],
                            Extrapolation.CLAMP
                        ),
                    },
                ],
            };
        });

    const compactContentStyle =
        useAnimatedStyle(() => {
            const progress = Math.min(
                Math.max(
                    scrollY.value /
                    collapseDistance,
                    0
                ),
                1
            );

            return {
                opacity: interpolate(
                    progress,
                    [
                        0.58,
                        0.84,
                    ],
                    [0, 1],
                    Extrapolation.CLAMP
                ),

                transform: [
                    {
                        translateY:
                            interpolate(
                                progress,
                                [0.58, 1],
                                [18, 0],
                                Extrapolation.CLAMP
                            ),
                    },
                    {
                        scale: interpolate(
                            progress,
                            [0.58, 1],
                            [0.97, 1],
                            Extrapolation.CLAMP
                        ),
                    },
                ],
            };
        });

    return {
        collapseDistance,
        containerStyle,
        expandedContentStyle,
        compactContentStyle,
    };
}

const AlbumStat = memo(
    function AlbumStat({
                           label,
                           value,
                           accent = false,
                       }: AlbumStatProps) {
        return (
            <View style={styles.stat}>
                <Text
                    style={[
                        styles.statValue,
                        accent &&
                        styles
                            .statValueAccent,
                    ]}
                >
                    {value}
                </Text>

                <Text
                    style={styles.statLabel}
                >
                    {label}
                </Text>
            </View>
        );
    }
);

function CollapsibleAlbumHeaderComponent({
                                             scrollY,
                                             expandedHeight,
                                             safeAreaTop,
                                             summary,
                                             onCollapseHeader,
                                             onExpandHeader,
                                         }: CollapsibleAlbumHeaderProps) {
    const {
        collected,
        remaining,
        repeated,
        total,
        percentage,
    } = summary;

    const clampedPercentage =
        clampPercentage(percentage);

    const collapsedHeight =
        ALBUM_HEADER_COLLAPSED_HEIGHT +
        safeAreaTop;

    const {
        collapseDistance,
        containerStyle,
        expandedContentStyle,
        compactContentStyle,
    } = useHeaderAnimations({
        scrollY,
        expandedHeight,
        collapsedHeight,
    });

    const headerGesture = useMemo(() => {
        const panGesture = Gesture.Pan()
            .activeOffsetY([
                -10,
                10,
            ])
            .failOffsetX([
                -GESTURE_HORIZONTAL_FAILURE_OFFSET,
                GESTURE_HORIZONTAL_FAILURE_OFFSET,
            ])
            .onEnd((event) => {
                const isCollapsed =
                    scrollY.value >=
                    collapseDistance * 0.85;

                const isExpanded =
                    scrollY.value <=
                    collapseDistance * 0.15;

                const swipedUp =
                    event.translationY <=
                    -GESTURE_DISTANCE_THRESHOLD ||
                    event.velocityY <=
                    -GESTURE_VELOCITY_THRESHOLD;

                const swipedDown =
                    event.translationY >=
                    GESTURE_DISTANCE_THRESHOLD ||
                    event.velocityY >=
                    GESTURE_VELOCITY_THRESHOLD;

                if (
                    isExpanded &&
                    swipedUp
                ) {
                    runOnJS(
                        onCollapseHeader
                    )();

                    return;
                }

                if (
                    isCollapsed &&
                    swipedDown
                ) {
                    runOnJS(
                        onExpandHeader
                    )();
                }
            });

        const tapGesture = Gesture.Tap()
            .maxDistance(10)
            .onEnd((_event, success) => {
                if (!success) {
                    return;
                }

                const isCollapsed =
                    scrollY.value >=
                    collapseDistance * 0.85;

                if (isCollapsed) {
                    runOnJS(
                        onExpandHeader
                    )();
                }
            });

        return Gesture.Exclusive(
            panGesture,
            tapGesture
        );
    }, [
        collapseDistance,
        onCollapseHeader,
        onExpandHeader,
        scrollY,
    ]);

    return (
        <GestureDetector
            gesture={headerGesture}
        >
            <Animated.View
                pointerEvents="auto"
                style={[
                    styles.container,
                    containerStyle,
                ]}
            >
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.expandedContent,
                        {
                            paddingTop:
                                safeAreaTop +
                                theme.spacing.xl,
                        },
                        expandedContentStyle,
                    ]}
                >
                    <View
                        style={[
                            styles.topRow,
                            {
                                top:
                                    safeAreaTop +
                                    theme.spacing.lg,
                            },
                        ]}
                    >
                        <View
                            style={
                                styles
                                    .tournamentBadge
                            }
                        >
                            <Text
                                style={
                                    styles
                                        .tournamentText
                                }
                            >
                                WORLD CUP 2026
                            </Text>
                        </View>

                        <Text
                            style={
                                styles.totalText
                            }
                        >
                            {total} stickers
                        </Text>
                    </View>

                    <View
                        style={styles.heroBody}
                    >
                        <Text
                            style={styles.eyebrow}
                        >
                            YOUR COLLECTION
                        </Text>

                        <Text
                            style={styles.title}
                        >
                            My Album
                        </Text>

                        <Text
                            style={
                                styles.description
                            }
                        >
                            Track your World Cup
                            collection, discover what
                            is missing, and keep
                            repeated stickers ready
                            to trade.
                        </Text>

                        <View
                            style={
                                styles
                                    .completionRow
                            }
                        >
                            <Text
                                style={
                                    styles.percentage
                                }
                            >
                                {clampedPercentage}%
                            </Text>

                            <View
                                style={
                                    styles
                                        .completionCopy
                                }
                            >
                                <Text
                                    style={
                                        styles
                                            .completionTitle
                                    }
                                >
                                    Album completed
                                </Text>

                                <Text
                                    style={
                                        styles
                                            .completionSubtitle
                                    }
                                >
                                    {collected} of{' '}
                                    {total} collected
                                </Text>
                            </View>
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
                                            `${clampedPercentage}%`,
                                    },
                                ]}
                            />
                        </View>

                        <View
                            style={
                                styles.statsRow
                            }
                        >
                            <AlbumStat
                                label="Collected"
                                value={collected}
                                accent
                            />

                            <View
                                style={
                                    styles
                                        .statDivider
                                }
                            />

                            <AlbumStat
                                label="Remaining"
                                value={remaining}
                            />

                            <View
                                style={
                                    styles
                                        .statDivider
                                }
                            />

                            <AlbumStat
                                label="Repeated"
                                value={repeated}
                            />
                        </View>
                    </View>

                    <View
                        style={styles.scrollHint}
                    >
                        <View
                            style={
                                styles.scrollHandle
                            }
                        />

                        <Text
                            style={
                                styles
                                    .scrollHintText
                            }
                        >
                            Swipe up to explore
                        </Text>
                    </View>
                </Animated.View>

                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.compactContent,
                        {
                            top: safeAreaTop,
                            height:
                            ALBUM_HEADER_COLLAPSED_HEIGHT,
                        },
                        compactContentStyle,
                    ]}
                >
                    <View
                        style={
                            styles
                                .compactTitleGroup
                        }
                    >
                        <Text
                            style={
                                styles
                                    .compactEyebrow
                            }
                        >
                            WORLD CUP 2026
                        </Text>

                        <Text
                            style={
                                styles.compactTitle
                            }
                        >
                            My Album
                        </Text>
                    </View>

                    <View
                        style={
                            styles.compactCenter
                        }
                    >
                        <Text
                            style={
                                styles
                                    .compactSummary
                            }
                        >
                            {remaining} left ·{' '}
                            {repeated} repeated
                        </Text>

                        <View
                            style={
                                styles
                                    .compactProgressTrack
                            }
                        >
                            <View
                                style={[
                                    styles
                                        .compactProgressFill,
                                    {
                                        width:
                                            `${clampedPercentage}%`,
                                    },
                                ]}
                            />
                        </View>
                    </View>

                    <View
                        style={
                            styles.compactMeta
                        }
                    >
                        <Text
                            style={
                                styles
                                    .compactPercentage
                            }
                        >
                            {clampedPercentage}%
                        </Text>

                        <Text
                            style={
                                styles.compactCount
                            }
                        >
                            {collected}/{total}
                        </Text>
                    </View>
                </Animated.View>
            </Animated.View>
        </GestureDetector>
    );
}

function areCollapsibleAlbumHeaderPropsEqual(
    previous: CollapsibleAlbumHeaderProps,
    next: CollapsibleAlbumHeaderProps
): boolean {
    return (
        previous.scrollY ===
        next.scrollY &&
        previous.expandedHeight ===
        next.expandedHeight &&
        previous.safeAreaTop ===
        next.safeAreaTop &&
        previous.summary.collected ===
        next.summary.collected &&
        previous.summary.remaining ===
        next.summary.remaining &&
        previous.summary.repeated ===
        next.summary.repeated &&
        previous.summary.total ===
        next.summary.total &&
        previous.summary.percentage ===
        next.summary.percentage &&
        previous.onCollapseHeader ===
        next.onCollapseHeader &&
        previous.onExpandHeader ===
        next.onExpandHeader
    );
}

export const CollapsibleAlbumHeader = memo(
    CollapsibleAlbumHeaderComponent,
    areCollapsibleAlbumHeaderPropsEqual
);

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        zIndex: 20,
        overflow: 'hidden',
        borderBottomWidth: 1,
        borderBottomColor:
        theme.colors.border,
        backgroundColor:
        theme.colors.background,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowRadius: 14,
    },

    expandedContent: {
        ...StyleSheet.absoluteFillObject,
        paddingHorizontal:
        theme.spacing.xl,
        paddingBottom:
        theme.spacing.xl,
        justifyContent: 'center',
    },

    topRow: {
        position: 'absolute',
        right: theme.spacing.xl,
        left: theme.spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:
            'space-between',
    },

    heroBody: {
        width: '100%',
        maxWidth: 560,
        alignSelf: 'center',
        transform: [
            {
                translateY: -18,
            },
        ],
    },

    tournamentBadge: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderWidth: 1,
        borderColor:
            'rgba(245, 197, 24, 0.36)',
        borderRadius:
        theme.radius.full,
        backgroundColor:
            'rgba(245, 197, 24, 0.10)',
    },

    tournamentText: {
        fontSize: 10,
        fontWeight:
        theme.typography.weights.bold,
        letterSpacing: 1.3,
        color: theme.colors.gold,
    },

    totalText: {
        fontSize:
        theme.typography.sizes.xs,
        color:
        theme.colors.textSecondary,
    },

    eyebrow: {
        fontSize: 11,
        fontWeight:
        theme.typography.weights.bold,
        letterSpacing: 1.8,
        color: theme.colors.owned,
    },

    title: {
        marginTop:
        theme.spacing.sm,
        fontSize: 52,
        lineHeight: 58,
        fontWeight:
        theme.typography.weights.bold,
        letterSpacing: -1.8,
        color:
        theme.colors.textPrimary,
    },

    description: {
        maxWidth: 430,
        marginTop:
        theme.spacing.md,
        fontSize:
        theme.typography.sizes.md,
        lineHeight: 24,
        color:
        theme.colors.textSecondary,
    },

    completionRow: {
        marginTop:
        theme.spacing.xxl,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: theme.spacing.lg,
    },

    percentage: {
        fontSize: 62,
        lineHeight: 64,
        fontWeight:
        theme.typography.weights.bold,
        letterSpacing: -2.5,
        color:
        theme.colors.textPrimary,
    },

    completionCopy: {
        paddingBottom: 7,
    },

    completionTitle: {
        fontSize:
        theme.typography.sizes.md,
        fontWeight:
        theme.typography.weights
            .semibold,
        color:
        theme.colors.textPrimary,
    },

    completionSubtitle: {
        marginTop: 4,
        fontSize:
        theme.typography.sizes.xs,
        color:
        theme.colors.textSecondary,
    },

    progressTrack: {
        height: 7,
        marginTop:
        theme.spacing.md,
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

    statsRow: {
        marginTop:
        theme.spacing.xxl,
        paddingVertical:
        theme.spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor:
        theme.colors.border,
        borderRadius:
        theme.radius.lg,
        backgroundColor:
        theme.colors.surface,
    },

    stat: {
        flex: 1,
        alignItems: 'center',
    },

    statValue: {
        fontSize:
        theme.typography.sizes.xl,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    statValueAccent: {
        color: theme.colors.owned,
    },

    statLabel: {
        marginTop: 5,
        fontSize:
        theme.typography.sizes.xs,
        color:
        theme.colors.textSecondary,
    },

    statDivider: {
        width: 1,
        height: 34,
        backgroundColor:
        theme.colors.border,
    },

    scrollHint: {
        position: 'absolute',
        right: 0,
        bottom:
        theme.spacing.xl,
        left: 0,
        alignItems: 'center',
    },

    scrollHandle: {
        width: 42,
        height: 4,
        marginBottom:
        theme.spacing.sm,
        borderRadius:
        theme.radius.full,
        backgroundColor:
            'rgba(255,255,255,0.22)',
    },

    scrollHintText: {
        fontSize:
        theme.typography.sizes.xs,
        color:
        theme.colors.textSecondary,
    },

    compactContent: {
        position: 'absolute',
        right: 0,
        left: 0,
        paddingHorizontal:
        theme.spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },

    compactTitleGroup: {
        flexShrink: 0,
    },

    compactEyebrow: {
        fontSize: 8,
        fontWeight:
        theme.typography.weights.bold,
        letterSpacing: 1.2,
        color: theme.colors.gold,
    },

    compactTitle: {
        marginTop: 4,
        fontSize:
        theme.typography.sizes.lg,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    compactCenter: {
        flex: 1,
        paddingHorizontal:
        theme.spacing.sm,
    },

    compactSummary: {
        marginBottom: 6,
        fontSize: 9,
        textAlign: 'center',
        color:
        theme.colors.textSecondary,
    },

    compactProgressTrack: {
        height: 4,
        overflow: 'hidden',
        borderRadius:
        theme.radius.full,
        backgroundColor:
            'rgba(255,255,255,0.08)',
    },

    compactProgressFill: {
        height: '100%',
        borderRadius:
        theme.radius.full,
        backgroundColor:
        theme.colors.owned,
    },

    compactMeta: {
        minWidth: 52,
        alignItems: 'flex-end',
    },

    compactPercentage: {
        fontSize:
        theme.typography.sizes.lg,
        fontWeight:
        theme.typography.weights.bold,
        color: theme.colors.owned,
    },

    compactCount: {
        marginTop: 2,
        fontSize: 9,
        color:
        theme.colors.textSecondary,
    },
});