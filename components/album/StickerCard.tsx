import * as Haptics from 'expo-haptics';

import {
    memo,
    useCallback,
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
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

import { theme } from '@/constants/theme';
import type { StickerWithState } from '@/types/album';

interface StickerCardProps {
    sticker: StickerWithState;
    invertSwipeDirections: boolean;

    /*
     * These callbacks receive the sticker ID directly.
     * StickerGrid can therefore pass the same stable
     * functions to every card without creating inline
     * closures for each render.
     */
    onIncrementSticker: (
        stickerId: string
    ) => void;

    onDecrementSticker: (
        stickerId: string
    ) => void;
}

const SWIPE_ACTIVATION_DELAY = 165;
const SWIPE_THRESHOLD = 38;
const MAX_TRANSLATION = 54;

const SPRING_CONFIG = {
    damping: 34,
    stiffness: 320,
    mass: 0.5,
    overshootClamping: true,
};

function triggerActivationHaptic() {
    void Haptics.impactAsync(
        Haptics.ImpactFeedbackStyle.Medium
    );
}

function triggerThresholdHaptic() {
    void Haptics.impactAsync(
        Haptics.ImpactFeedbackStyle.Rigid
    );
}

function StickerCardComponent({
                                  sticker,
                                  invertSwipeDirections,
                                  onIncrementSticker,
                                  onDecrementSticker,
                              }: StickerCardProps) {
    const translateX = useSharedValue(0);

    const confirmedDirection =
        useSharedValue<-1 | 0 | 1>(0);

    const isGestureActivated =
        useSharedValue(false);

    const activationPulse =
        useSharedValue(0);

    const {
        id,
        name,
        type,
        copies,
    } = sticker;

    const isMissing = copies === 0;
    const isOwned = copies === 1;
    const isRepeated = copies >= 2;

    const applyIncrement = useCallback(() => {
        onIncrementSticker(id);
    }, [
        id,
        onIncrementSticker,
    ]);

    const applyDecrement = useCallback(() => {
        if (copies > 0) {
            onDecrementSticker(id);
        }
    }, [
        copies,
        id,
        onDecrementSticker,
    ]);

    /*
     * The gesture object is recreated only when this
     * card's actionable data actually changes.
     */
    const panGesture = useMemo(
        () =>
            Gesture.Pan()
                .activateAfterLongPress(
                    SWIPE_ACTIVATION_DELAY
                )
                .minDistance(8)
                .activeOffsetX([-10, 10])
                .failOffsetY([-8, 8])
                .shouldCancelWhenOutside(true)

                .onStart(() => {
                    isGestureActivated.value = true;

                    activationPulse.value =
                        withSequence(
                            withTiming(1, {
                                duration: 90,
                            }),
                            withTiming(0, {
                                duration: 170,
                            })
                        );

                    runOnJS(
                        triggerActivationHaptic
                    )();
                })

                .onUpdate((event) => {
                    let minimumTranslation =
                        -MAX_TRANSLATION;

                    let maximumTranslation =
                        MAX_TRANSLATION;

                    /*
                     * A missing sticker cannot be decremented,
                     * so block the removal direction.
                     */
                    if (copies === 0) {
                        if (invertSwipeDirections) {
                            maximumTranslation = 0;
                        } else {
                            minimumTranslation = 0;
                        }
                    }

                    translateX.value = Math.max(
                        minimumTranslation,
                        Math.min(
                            maximumTranslation,
                            event.translationX
                        )
                    );

                    const reachedRightThreshold =
                        translateX.value >=
                        SWIPE_THRESHOLD;

                    const reachedLeftThreshold =
                        translateX.value <=
                        -SWIPE_THRESHOLD;

                    const nextDirection:
                        | -1
                        | 0
                        | 1 =
                        reachedRightThreshold
                            ? 1
                            : reachedLeftThreshold
                                ? -1
                                : 0;

                    if (
                        nextDirection !== 0 &&
                        nextDirection !==
                        confirmedDirection.value
                    ) {
                        runOnJS(
                            triggerThresholdHaptic
                        )();
                    }

                    confirmedDirection.value =
                        nextDirection;
                })

                .onEnd(() => {
                    const direction =
                        confirmedDirection.value;

                    const shouldIncrement =
                        invertSwipeDirections
                            ? direction === -1
                            : direction === 1;

                    const shouldDecrement =
                        invertSwipeDirections
                            ? direction === 1
                            : direction === -1;

                    if (shouldIncrement) {
                        runOnJS(applyIncrement)();
                    } else if (
                        shouldDecrement &&
                        copies > 0
                    ) {
                        runOnJS(applyDecrement)();
                    }
                })

                .onFinalize(() => {
                    confirmedDirection.value = 0;
                    isGestureActivated.value = false;

                    translateX.value = withSpring(
                        0,
                        SPRING_CONFIG
                    );
                }),
        [
            activationPulse,
            applyDecrement,
            applyIncrement,
            confirmedDirection,
            copies,
            invertSwipeDirections,
            isGestureActivated,
            translateX,
        ]
    );

    const cardAnimatedStyle =
        useAnimatedStyle(() => {
            const distance = Math.abs(
                translateX.value
            );

            const activationScale =
                interpolate(
                    activationPulse.value,
                    [0, 1],
                    [1, 1.035]
                );

            const dragScale = interpolate(
                distance,
                [0, SWIPE_THRESHOLD],
                [1, 0.98],
                'clamp'
            );

            return {
                opacity: interpolate(
                    distance,
                    [0, MAX_TRANSLATION],
                    [1, 0.94],
                    'clamp'
                ),

                transform: [
                    {
                        translateX:
                        translateX.value,
                    },
                    {
                        scale:
                            activationScale *
                            dragScale,
                    },
                ],

                borderWidth:
                    isGestureActivated.value
                        ? 2
                        : 1,

                shadowOpacity:
                    isGestureActivated.value
                        ? 0.28
                        : 0,

                shadowRadius:
                    isGestureActivated.value
                        ? 12
                        : 0,

                shadowOffset: {
                    width: 0,
                    height:
                        isGestureActivated.value
                            ? 5
                            : 0,
                },

                elevation:
                    isGestureActivated.value
                        ? 8
                        : 0,
            };
        });

    const activationOverlayStyle =
        useAnimatedStyle(() => ({
            opacity: interpolate(
                activationPulse.value,
                [0, 1],
                [0, 0.72]
            ),

            transform: [
                {
                    scale: interpolate(
                        activationPulse.value,
                        [0, 1],
                        [0.96, 1.045]
                    ),
                },
            ],
        }));

    const incrementActionStyle =
        useAnimatedStyle(() => {
            const opacity =
                invertSwipeDirections
                    ? interpolate(
                        translateX.value,
                        [-SWIPE_THRESHOLD, 0],
                        [1, 0],
                        'clamp'
                    )
                    : interpolate(
                        translateX.value,
                        [0, SWIPE_THRESHOLD],
                        [0, 1],
                        'clamp'
                    );

            return { opacity };
        });

    const decrementActionStyle =
        useAnimatedStyle(() => {
            if (copies === 0) {
                return {
                    opacity: 0,
                };
            }

            const opacity =
                invertSwipeDirections
                    ? interpolate(
                        translateX.value,
                        [0, SWIPE_THRESHOLD],
                        [0, 1],
                        'clamp'
                    )
                    : interpolate(
                        translateX.value,
                        [-SWIPE_THRESHOLD, 0],
                        [1, 0],
                        'clamp'
                    );

            return { opacity };
        });

    const actionContentStyle =
        useAnimatedStyle(() => {
            const distance = Math.abs(
                translateX.value
            );

            return {
                opacity: interpolate(
                    distance,
                    [6, SWIPE_THRESHOLD],
                    [0.3, 1],
                    'clamp'
                ),

                transform: [
                    {
                        scale: interpolate(
                            distance,
                            [0, SWIPE_THRESHOLD],
                            [0.88, 1],
                            'clamp'
                        ),
                    },
                ],
            };
        });

    const addDirectionText =
        invertSwipeDirections
            ? 'Swipe left'
            : 'Swipe right';

    const removeDirectionText =
        invertSwipeDirections
            ? 'swipe right'
            : 'swipe left';

    return (
        <View style={styles.swipeContainer}>
            <Animated.View
                pointerEvents="none"
                style={[
                    styles.action,
                    invertSwipeDirections
                        ? styles.actionRight
                        : styles.actionLeft,
                    isMissing &&
                    styles.actionMissing,
                    isOwned &&
                    styles.actionOwned,
                    isRepeated &&
                    styles.actionRepeated,
                    incrementActionStyle,
                ]}
            >
                <Animated.View
                    style={actionContentStyle}
                >
                    <Text style={styles.actionSymbol}>
                        +1
                    </Text>

                    <Text style={styles.actionLabel}>
                        Add New
                    </Text>
                </Animated.View>
            </Animated.View>

            {copies > 0 && (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.action,
                        invertSwipeDirections
                            ? styles.actionLeft
                            : styles.actionRight,
                        isOwned &&
                        styles.actionOwned,
                        isRepeated &&
                        styles.actionRepeated,
                        decrementActionStyle,
                    ]}
                >
                    <Animated.View
                        style={[
                            actionContentStyle,
                            styles.removeContent,
                        ]}
                    >
                        <Text
                            style={styles.actionSymbol}
                        >
                            −1
                        </Text>

                        <Text
                            style={styles.actionLabel}
                        >
                            Remove One
                        </Text>
                    </Animated.View>
                </Animated.View>
            )}

            <Animated.View
                pointerEvents="none"
                style={[
                    styles.activationOverlay,
                    activationOverlayStyle,
                ]}
            />

            <GestureDetector gesture={panGesture}>
                <Animated.View
                    accessible
                    accessibilityRole="adjustable"
                    accessibilityLabel={`${id}, ${name}`}
                    accessibilityValue={{
                        text: `${copies} copies`,
                    }}
                    accessibilityHint={
                        copies === 0
                            ? `${addDirectionText} to add a copy`
                            : `${addDirectionText} to add a copy or ${removeDirectionText} to remove one`
                    }
                    style={[
                        styles.card,
                        isMissing &&
                        styles.cardMissing,
                        isOwned &&
                        styles.cardOwned,
                        isRepeated &&
                        styles.cardRepeated,
                        cardAnimatedStyle,
                    ]}
                >
                    <View style={styles.topRow}>
                        <Text style={styles.id}>
                            {id}
                        </Text>

                        {type === 'foil' && (
                            <View style={styles.foilBadge}>
                                <Text style={styles.foilText}>
                                    FOIL
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text
                        numberOfLines={2}
                        style={styles.name}
                    >
                        {name}
                    </Text>

                    <View style={styles.footer}>
                        <Text
                            style={[
                                styles.status,
                                isOwned &&
                                styles.statusOwned,
                                isRepeated &&
                                styles.statusRepeated,
                            ]}
                        >
                            {isMissing
                                ? 'Missing'
                                : isOwned
                                    ? 'Owned'
                                    : 'Repeated'}
                        </Text>

                        {copies > 0 && (
                            <View
                                style={[
                                    styles.copyBadge,
                                    isRepeated &&
                                    styles.copyBadgeRepeated,
                                ]}
                            >
                                <Text
                                    style={styles.copyText}
                                >
                                    ×{copies}
                                </Text>
                            </View>
                        )}
                    </View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

/*
 * Compare only values that affect this card.
 *
 * When another sticker changes, this card keeps the
 * same metadata, count and callback identities, so
 * React skips its render completely.
 */
function areStickerCardPropsEqual(
    previous: StickerCardProps,
    next: StickerCardProps
): boolean {
    return (
        previous.sticker.id ===
        next.sticker.id &&
        previous.sticker.name ===
        next.sticker.name &&
        previous.sticker.type ===
        next.sticker.type &&
        previous.sticker.copies ===
        next.sticker.copies &&
        previous.invertSwipeDirections ===
        next.invertSwipeDirections &&
        previous.onIncrementSticker ===
        next.onIncrementSticker &&
        previous.onDecrementSticker ===
        next.onDecrementSticker
    );
}

export const StickerCard = memo(
    StickerCardComponent,
    areStickerCardPropsEqual
);

const styles = StyleSheet.create({
    swipeContainer: {
        flex: 1,
        minHeight: 132,
        overflow: 'hidden',
        borderRadius: theme.radius.md,
    },

    activationOverlay: {
        position: 'absolute',
        top: -2,
        right: -2,
        bottom: -2,
        left: -2,
        zIndex: 2,
        borderWidth: 2,
        borderColor:
            'rgba(53, 201, 111, 0.95)',
        borderRadius: theme.radius.md,
        backgroundColor:
            'rgba(53, 201, 111, 0.08)',
    },

    action: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '58%',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.md,
    },

    actionLeft: {
        left: 0,
        alignItems: 'flex-start',
    },

    actionRight: {
        right: 0,
        alignItems: 'flex-end',
    },

    actionMissing: {
        backgroundColor:
            'rgba(53, 201, 111, 0.12)',
    },

    actionOwned: {
        backgroundColor:
            'rgba(53, 201, 111, 0.22)',
    },

    actionRepeated: {
        backgroundColor:
            'rgba(53, 201, 111, 0.34)',
    },

    removeContent: {
        alignItems: 'flex-end',
    },

    actionSymbol: {
        fontSize:
        theme.typography.sizes.lg,
        fontWeight:
        theme.typography.weights.bold,
        color: theme.colors.textPrimary,
    },

    actionLabel: {
        marginTop: 2,
        fontSize:
        theme.typography.sizes.xs,
        fontWeight:
        theme.typography.weights.semibold,
        color: theme.colors.textSecondary,
    },

    card: {
        flex: 1,
        minHeight: 132,
        zIndex: 3,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderRadius: theme.radius.md,
        shadowColor:
            'rgba(53, 201, 111, 1)',
    },

    cardMissing: {
        borderColor: theme.colors.border,
        backgroundColor:
        theme.colors.missing,
    },

    cardOwned: {
        borderColor:
            'rgba(53, 201, 111, 0.58)',
        backgroundColor:
            'rgba(53, 201, 111, 0.14)',
    },

    cardRepeated: {
        borderColor:
            'rgba(53, 201, 111, 0.86)',
        backgroundColor:
            'rgba(53, 201, 111, 0.26)',
    },

    topRow: {
        minHeight: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.xs,
    },

    id: {
        flexShrink: 1,
        fontSize:
        theme.typography.sizes.md,
        fontWeight:
        theme.typography.weights.bold,
        color: theme.colors.textPrimary,
    },

    foilBadge: {
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: theme.radius.full,
        backgroundColor:
            'rgba(245, 197, 24, 0.18)',
    },

    foilText: {
        fontSize: 8,
        fontWeight:
        theme.typography.weights.bold,
        letterSpacing: 0.5,
        color: theme.colors.gold,
    },

    name: {
        marginTop: theme.spacing.sm,
        fontSize:
        theme.typography.sizes.xs,
        lineHeight: 16,
        color: theme.colors.textSecondary,
    },

    footer: {
        minHeight: 24,
        marginTop: 'auto',
        paddingTop: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.xs,
    },

    status: {
        flexShrink: 1,
        fontSize:
        theme.typography.sizes.xs,
        fontWeight:
        theme.typography.weights.semibold,
        color: theme.colors.missingText,
    },

    statusOwned: {
        color: theme.colors.owned,
    },

    statusRepeated: {
        color: '#6EE79A',
    },

    copyBadge: {
        minWidth: 28,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 7,
        paddingVertical: 4,
        borderRadius: theme.radius.full,
        backgroundColor:
        theme.colors.owned,
    },

    copyBadgeRepeated: {
        backgroundColor:
            'rgba(53, 201, 111, 0.86)',
    },

    copyText: {
        fontSize:
        theme.typography.sizes.xs,
        fontWeight:
        theme.typography.weights.bold,
        color: theme.colors.textPrimary,
    },
});