import * as Haptics from 'expo-haptics';

import {
    memo,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import {
    type ImageResizeMode,
    type ImageSourcePropType,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Animated, {
    Easing,
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import {
    getAlbumSectionArtwork,
} from '@/utils/albumSectionArtwork';

import {
    ProgressBar,
} from '@/components/ui/ProgressBar';

import {
    getSectionColors,
} from '@/constants/sectionColors';

import { theme } from '@/constants/theme';

import type {
    AlbumSection,
} from '@/types/album';

interface SectionProgressProps {
    name: string;
    federation?: string;

    section?: AlbumSection;
    sectionIndex?: number;

    artworkSource?: ImageSourcePropType;
    artworkResizeMode?: ImageResizeMode;
    isLogo?: boolean;

    owned: number;
    total: number;
    percentage: number;
}

interface ResolvedArtwork {
    source: ImageSourcePropType;
    resizeMode: ImageResizeMode;
    isLogo: boolean;
}

function normalizeCount(
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

function clampPercentage(
    value: number
): number {
    if (!Number.isFinite(value)) {
        return 0;
    }

    return Math.max(
        0,
        Math.min(
            100,
            value
        )
    );
}

function SectionProgressComponent({
                                      name,
                                      federation,
                                      section,
                                      sectionIndex,
                                      artworkSource,
                                      artworkResizeMode,
                                      isLogo,
                                      owned,
                                      total,
                                      percentage,
                                  }: SectionProgressProps) {
    const entranceProgress =
        useSharedValue(0);

    const completionGlow =
        useSharedValue(0);

    const completionSweep =
        useSharedValue(0);

    const completionBadge =
        useSharedValue(0);

    const previousCompletedRef =
        useRef<boolean | null>(
            null
        );

    const [
        showCompletionBadge,
        setShowCompletionBadge,
    ] = useState(false);

    useEffect(() => {
        entranceProgress.value = 0;

        entranceProgress.value =
            withTiming(
                1,
                {
                    duration: 260,

                    easing:
                        Easing.out(
                            Easing.cubic
                        ),
                }
            );
    }, [
        entranceProgress,
        section?.id,
    ]);

    const normalizedValues =
        useMemo(() => {
            const normalizedTotal =
                normalizeCount(
                    total
                );

            const normalizedOwned =
                Math.min(
                    normalizeCount(
                        owned
                    ),
                    normalizedTotal
                );

            const normalizedPercentage =
                clampPercentage(
                    percentage
                );

            const missing =
                Math.max(
                    0,
                    normalizedTotal -
                    normalizedOwned
                );

            return {
                owned:
                normalizedOwned,

                total:
                normalizedTotal,

                missing,

                percentage:
                normalizedPercentage,

                roundedPercentage:
                    Math.round(
                        normalizedPercentage
                    ),

                isCompleted:
                    normalizedTotal > 0 &&
                    normalizedOwned ===
                    normalizedTotal,
            };
        }, [
            owned,
            percentage,
            total,
        ]);

    useEffect(() => {
        const wasCompleted =
            previousCompletedRef.current;

        /*
         * Record the initial state without celebrating.
         * This prevents the effect from playing when an
         * already-complete section is first opened.
         */
        if (wasCompleted === null) {
            previousCompletedRef.current =
                normalizedValues.isCompleted;

            return;
        }

        const justCompleted =
            !wasCompleted &&
            normalizedValues.isCompleted;

        previousCompletedRef.current =
            normalizedValues.isCompleted;

        if (!justCompleted) {
            return;
        }

        setShowCompletionBadge(
            true
        );

        void Haptics.notificationAsync(
            Haptics
                .NotificationFeedbackType
                .Success
        );

        completionGlow.value = 0;
        completionSweep.value = 0;
        completionBadge.value = 0;

        completionGlow.value =
            withSequence(
                withTiming(
                    1,
                    {
                        duration: 280,

                        easing:
                            Easing.out(
                                Easing.cubic
                            ),
                    }
                ),

                withTiming(
                    0.55,
                    {
                        duration: 380,
                    }
                ),

                withTiming(
                    1,
                    {
                        duration: 240,
                    }
                ),

                withTiming(
                    0,
                    {
                        duration: 900,

                        easing:
                            Easing.inOut(
                                Easing.cubic
                            ),
                    }
                )
            );

        completionSweep.value =
            withDelay(
                100,
                withTiming(
                    1,
                    {
                        duration: 900,

                        easing:
                            Easing.inOut(
                                Easing.cubic
                            ),
                    }
                )
            );

        completionBadge.value =
            withSequence(
                withDelay(
                    150,
                    withTiming(
                        1,
                        {
                            duration: 240,

                            easing:
                                Easing.out(
                                    Easing.cubic
                                ),
                        }
                    )
                ),

                withDelay(
                    1400,
                    withTiming(
                        0,
                        {
                            duration: 340,

                            easing:
                                Easing.in(
                                    Easing.cubic
                                ),
                        }
                    )
                )
            );

        const hideTimer =
            setTimeout(() => {
                setShowCompletionBadge(
                    false
                );
            }, 2300);

        return () => {
            clearTimeout(
                hideTimer
            );
        };
    }, [
        completionBadge,
        completionGlow,
        completionSweep,
        normalizedValues.isCompleted,
    ]);

    const resolvedArtwork =
        useMemo<
            ResolvedArtwork | null
        >(() => {
            if (artworkSource) {
                return {
                    source:
                    artworkSource,

                    resizeMode:
                        artworkResizeMode ??
                        'cover',

                    isLogo:
                        isLogo ??
                        false,
                };
            }

            if (
                !section ||
                sectionIndex ===
                undefined
            ) {
                return null;
            }

            return getAlbumSectionArtwork(
                section,
                sectionIndex
            );
        }, [
            artworkResizeMode,
            artworkSource,
            isLogo,
            section,
            sectionIndex,
        ]);

    const colors =
        useMemo(
            () =>
                getSectionColors(
                    name,
                    federation
                ),
            [
                federation,
                name,
            ]
        );

    const animatedCardStyle =
        useAnimatedStyle(() => ({
            opacity:
            entranceProgress.value,

            transform: [
                {
                    translateY:
                        interpolate(
                            entranceProgress.value,
                            [
                                0,
                                1,
                            ],
                            [
                                8,
                                0,
                            ]
                        ),
                },
            ],
        }));

    const completionShellStyle =
        useAnimatedStyle(() => ({
            borderColor:
                interpolateColor(
                    completionGlow.value,
                    [
                        0,
                        1,
                    ],
                    [
                        colors.border,
                        colors.primary,
                    ]
                ),

            shadowOpacity:
                interpolate(
                    completionGlow.value,
                    [
                        0,
                        1,
                    ],
                    [
                        0,
                        0.9,
                    ]
                ),

            shadowRadius:
                interpolate(
                    completionGlow.value,
                    [
                        0,
                        1,
                    ],
                    [
                        0,
                        25,
                    ]
                ),

            elevation:
                interpolate(
                    completionGlow.value,
                    [
                        0,
                        1,
                    ],
                    [
                        0,
                        16,
                    ]
                ),
        }));

    const completionOverlayStyle =
        useAnimatedStyle(() => ({
            opacity:
                interpolate(
                    completionGlow.value,
                    [
                        0,
                        0.25,
                        1,
                    ],
                    [
                        0,
                        0.18,
                        0.65,
                    ]
                ),
        }));

    const completionSweepStyle =
        useAnimatedStyle(() => ({
            opacity:
                interpolate(
                    completionSweep.value,
                    [
                        0,
                        0.08,
                        0.82,
                        1,
                    ],
                    [
                        0,
                        0.7,
                        0.7,
                        0,
                    ]
                ),

            transform: [
                {
                    translateX:
                        interpolate(
                            completionSweep.value,
                            [
                                0,
                                1,
                            ],
                            [
                                -190,
                                460,
                            ]
                        ),
                },
                {
                    rotate:
                        '-18deg',
                },
            ],
        }));

    const completionBadgeStyle =
        useAnimatedStyle(() => ({
            opacity:
            completionBadge.value,

            transform: [
                {
                    translateY:
                        interpolate(
                            completionBadge.value,
                            [
                                0,
                                1,
                            ],
                            [
                                -8,
                                0,
                            ]
                        ),
                },
            ],
        }));

    const animatedArtworkStyle =
        useAnimatedStyle(() => ({
            opacity:
                interpolate(
                    entranceProgress.value,
                    [
                        0,
                        0.6,
                        1,
                    ],
                    [
                        0,
                        0.7,
                        1,
                    ]
                ),

            transform: [
                {
                    translateX:
                        interpolate(
                            entranceProgress.value,
                            [
                                0,
                                1,
                            ],
                            [
                                -8,
                                0,
                            ]
                        ),
                },
            ],
        }));

    return (
        <Animated.View
            style={[
                styles.cardShell,
                {
                    borderColor:
                    colors.border,

                    shadowColor:
                    colors.primary,
                },
                animatedCardStyle,
                completionShellStyle,
            ]}
        >
            <View
                style={[
                    styles.card,
                    {
                        backgroundColor:
                        colors.secondarySoft,
                    },
                ]}
            >
                <View
                    pointerEvents="none"
                    style={[
                        styles.primaryAccent,
                        {
                            backgroundColor:
                            colors.primary,
                        },
                    ]}
                />

                <View
                    pointerEvents="none"
                    style={[
                        styles.primaryGlow,
                        {
                            backgroundColor:
                            colors.primarySoft,
                        },
                    ]}
                />

                <View
                    pointerEvents="none"
                    style={[
                        styles.secondaryGlow,
                        {
                            backgroundColor:
                            colors.secondarySoft,
                        },
                    ]}
                />

                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.completionOverlay,
                        {
                            backgroundColor:
                            colors.primary,
                        },
                        completionOverlayStyle,
                    ]}
                />

                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.completionSweep,
                        {
                            backgroundColor:
                            colors.primary,
                        },
                        completionSweepStyle,
                    ]}
                />

                {showCompletionBadge ? (
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            styles.completionBadge,
                            {
                                borderColor:
                                colors.border,

                                backgroundColor:
                                colors.primary,
                            },
                            completionBadgeStyle,
                        ]}
                    >
                        <Text
                            style={
                                styles.completionBadgeText
                            }
                        >
                            SECTION COMPLETE
                        </Text>
                    </Animated.View>
                ) : null}

                <Animated.View
                    style={[
                        styles.artworkContainer,
                        resolvedArtwork
                            ?.isLogo &&
                        styles.logoContainer,
                        {
                            borderColor:
                            colors.border,

                            backgroundColor:
                            colors.primarySoft,
                        },
                        animatedArtworkStyle,
                    ]}
                >
                    {resolvedArtwork ? (
                        <Animated.Image
                            source={
                                resolvedArtwork.source
                            }
                            resizeMode={
                                resolvedArtwork.resizeMode
                            }
                            style={[
                                styles.artwork,
                                resolvedArtwork.isLogo &&
                                styles.logoArtwork,
                            ]}
                            accessibilityIgnoresInvertColors
                        />
                    ) : (
                        <View
                            style={
                                styles.artworkPlaceholder
                            }
                        >
                            <Text
                                style={[
                                    styles.placeholderLetter,
                                    {
                                        color:
                                        colors.primary,
                                    },
                                ]}
                            >
                                {name
                                    .charAt(0)
                                    .toUpperCase()}
                            </Text>
                        </View>
                    )}
                </Animated.View>

                <View
                    style={
                        styles.content
                    }
                >
                    <View
                        style={
                            styles.topRow
                        }
                    >
                        <View
                            style={
                                styles.identity
                            }
                        >
                            <Text
                                numberOfLines={
                                    1
                                }
                                style={
                                    styles.name
                                }
                            >
                                {name}
                            </Text>

                            {federation ? (
                                <Text
                                    numberOfLines={
                                        1
                                    }
                                    style={
                                        styles.federation
                                    }
                                >
                                    {
                                        federation
                                    }
                                </Text>
                            ) : null}
                        </View>

                        <Text
                            style={[
                                styles.percentage,
                                {
                                    color:
                                        normalizedValues
                                            .isCompleted
                                            ? theme
                                                .colors
                                                .owned
                                            : colors.primary,
                                },
                            ]}
                        >
                            {
                                normalizedValues
                                    .roundedPercentage
                            }
                            %
                        </Text>
                    </View>

                    <View
                        style={
                            styles.progressRow
                        }
                    >
                        <View
                            style={
                                styles.progressWrapper
                            }
                        >
                            <ProgressBar
                                progress={
                                    normalizedValues
                                        .percentage
                                }
                            />
                        </View>

                        <Text
                            style={
                                styles.count
                            }
                        >
                            {
                                normalizedValues
                                    .owned
                            }
                            /
                            {
                                normalizedValues
                                    .total
                            }
                        </Text>
                    </View>

                    <View
                        style={
                            styles.summaryRow
                        }
                    >
                        <View
                            style={
                                styles.summaryItem
                            }
                        >
                            <View
                                style={[
                                    styles.summaryDot,
                                    {
                                        backgroundColor:
                                        colors.primary,
                                    },
                                ]}
                            />

                            <Text
                                style={
                                    styles.summaryText
                                }
                            >
                                {
                                    normalizedValues
                                        .owned
                                }{' '}
                                collected
                            </Text>
                        </View>

                        <View
                            style={
                                styles.summaryDivider
                            }
                        />

                        <View
                            style={
                                styles.summaryItem
                            }
                        >
                            <View
                                style={[
                                    styles.summaryDot,
                                    styles.missingDot,
                                ]}
                            />

                            <Text
                                style={
                                    styles.summaryText
                                }
                            >
                                {
                                    normalizedValues
                                        .missing
                                }{' '}
                                missing
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </Animated.View>
    );
}

function areSectionProgressPropsEqual(
    previous: SectionProgressProps,
    next: SectionProgressProps
): boolean {
    return (
        previous.name ===
        next.name &&
        previous.federation ===
        next.federation &&
        previous.section ===
        next.section &&
        previous.sectionIndex ===
        next.sectionIndex &&
        previous.artworkSource ===
        next.artworkSource &&
        previous.artworkResizeMode ===
        next.artworkResizeMode &&
        previous.isLogo ===
        next.isLogo &&
        previous.owned ===
        next.owned &&
        previous.total ===
        next.total &&
        previous.percentage ===
        next.percentage
    );
}

export const SectionProgress =
    memo(
        SectionProgressComponent,
        areSectionProgressPropsEqual
    );

const styles = StyleSheet.create({
    cardShell: {
        width: '100%',
        minHeight: 100,
        marginTop:
        theme.spacing.sm,
        overflow: 'visible',
        borderWidth: 1,
        borderRadius:
        theme.radius.lg,

        shadowOffset: {
            width: 0,
            height: 0,
        },
    },

    card: {
        width: '100%',
        minHeight: 98,
        paddingVertical:
        theme.spacing.md,
        paddingRight:
        theme.spacing.md,
        paddingLeft:
        theme.spacing.lg,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        borderRadius:
        theme.radius.lg,
    },

    primaryAccent: {
        position: 'absolute',
        top: 12,
        bottom: 12,
        left: 0,
        width: 4,
        borderTopRightRadius:
        theme.radius.full,
        borderBottomRightRadius:
        theme.radius.full,
    },

    primaryGlow: {
        position: 'absolute',
        top: -56,
        left: -44,
        width: 150,
        height: 150,
        borderRadius: 75,
    },

    secondaryGlow: {
        position: 'absolute',
        right: -58,
        bottom: -75,
        width: 170,
        height: 170,
        borderRadius: 85,
        opacity: 0.65,
    },

    completionOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 4,
    },

    completionSweep: {
        position: 'absolute',
        zIndex: 5,
        top: -55,
        bottom: -55,
        width: 56,
    },

    completionBadge: {
        position: 'absolute',
        zIndex: 20,
        top: 8,
        left: '50%',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderRadius:
        theme.radius.full,

        transform: [
            {
                translateX: -65,
            },
        ],
    },

    completionBadgeText: {
        fontSize: 8,
        lineHeight: 10,
        fontWeight:
        theme.typography.weights.bold,
        letterSpacing: 0.8,
        color:
        theme.colors.textInverse,
    },

    artworkContainer: {
        width: 72,
        height: 72,
        zIndex: 6,
        flexShrink: 0,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius:
        theme.radius.md,
    },

    logoContainer: {
        padding:
        theme.spacing.sm,
        backgroundColor:
            'rgba(255,255,255,0.96)',
    },

    artwork: {
        width: '100%',
        height: '100%',
    },

    logoArtwork: {
        borderRadius:
        theme.radius.sm,
    },

    artworkPlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },

    placeholderLetter: {
        fontSize: 28,
        fontWeight:
        theme.typography.weights.bold,
    },

    content: {
        flex: 1,
        zIndex: 6,
        minWidth: 0,
    },

    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent:
            'space-between',
        gap: theme.spacing.sm,
    },

    identity: {
        flex: 1,
        minWidth: 0,
    },

    name: {
        fontSize:
        theme.typography.sizes.lg,
        lineHeight: 23,
        fontWeight:
        theme.typography.weights.bold,
        letterSpacing: -0.3,
        color:
        theme.colors.textPrimary,
    },

    federation: {
        marginTop: 1,
        fontSize:
        theme.typography.sizes.xs,
        lineHeight: 15,
        color:
        theme.colors.textSecondary,
    },

    percentage: {
        flexShrink: 0,
        fontSize:
        theme.typography.sizes.lg,
        lineHeight: 23,
        fontWeight:
        theme.typography.weights.bold,
    },

    progressRow: {
        marginTop:
        theme.spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },

    progressWrapper: {
        flex: 1,
        minWidth: 0,
    },

    count: {
        minWidth: 36,
        textAlign: 'right',
        fontSize: 10,
        fontWeight:
        theme.typography.weights.semibold,
        color:
        theme.colors.textMuted,
    },

    summaryRow: {
        marginTop: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },

    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },

    summaryDot: {
        width: 5,
        height: 5,
        borderRadius:
        theme.radius.full,
    },

    missingDot: {
        backgroundColor:
        theme.colors.textMuted,
    },

    summaryText: {
        fontSize: 9,
        lineHeight: 12,
        color:
        theme.colors.textMuted,
    },

    summaryDivider: {
        width: 1,
        height: 9,
        backgroundColor:
            'rgba(255,255,255,0.10)',
    },
});