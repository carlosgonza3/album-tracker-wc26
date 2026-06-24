import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, View } from 'react-native';
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
    onIncrement: () => void;
    onDecrement: () => void;
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

export function StickerCard({
                                sticker,
                                invertSwipeDirections,
                                onIncrement,
                                onDecrement,
                            }: StickerCardProps) {
    const translateX = useSharedValue(0);
    const confirmedDirection =
        useSharedValue<-1 | 0 | 1>(0);

    const isGestureActivated =
        useSharedValue(false);

    const activationPulse =
        useSharedValue(0);

    const isMissing = sticker.copies === 0;
    const isOwned = sticker.copies === 1;
    const isRepeated = sticker.copies >= 2;

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

    function applyIncrement() {
        onIncrement();
    }

    function applyDecrement() {
        if (sticker.copies > 0) {
            onDecrement();
        }
    }

    const resetGesture = () => {
        'worklet';

        confirmedDirection.value = 0;
        isGestureActivated.value = false;

        translateX.value = withSpring(
            0,
            SPRING_CONFIG
        );
    };

    const panGesture = Gesture.Pan()
        .activateAfterLongPress(
            SWIPE_ACTIVATION_DELAY
        )
        .activeOffsetX([-8, 8])
        .failOffsetY([-12, 12])

        .onStart(() => {
            isGestureActivated.value = true;

            activationPulse.value = withSequence(
                withTiming(1, {
                    duration: 90,
                }),
                withTiming(0, {
                    duration: 170,
                })
            );

            runOnJS(triggerActivationHaptic)();
        })

        .onUpdate((event) => {
            let minimumTranslation =
                -MAX_TRANSLATION;

            let maximumTranslation =
                MAX_TRANSLATION;

            /*
             * When the count is zero, block the direction
             * that would remove a copy.
             */
            if (sticker.copies === 0) {
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

            const nextDirection: -1 | 0 | 1 =
                reachedRightThreshold
                    ? 1
                    : reachedLeftThreshold
                        ? -1
                        : 0;

            /*
             * Trigger one crisp haptic when entering
             * an actionable direction.
             */
            if (
                nextDirection !== 0 &&
                nextDirection !==
                confirmedDirection.value
            ) {
                runOnJS(triggerThresholdHaptic)();
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
                sticker.copies > 0
            ) {
                runOnJS(applyDecrement)();
            }
        })

        .onFinalize(() => {
            resetGesture();
        });

    const cardAnimatedStyle =
        useAnimatedStyle(() => {
            const distance = Math.abs(
                translateX.value
            );

            const activationScale = interpolate(
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
                        translateX: translateX.value,
                    },
                    {
                        scale:
                            activationScale * dragScale,
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
            if (sticker.copies === 0) {
                return { opacity: 0 };
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
                    isOwned && styles.actionOwned,
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
                        Add copy
                    </Text>
                </Animated.View>
            </Animated.View>

            {sticker.copies > 0 && (
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
                        <Text style={styles.actionSymbol}>
                            −1
                        </Text>

                        <Text style={styles.actionLabel}>
                            Remove copy
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
                    accessibilityLabel={`${sticker.id}, ${sticker.name}`}
                    accessibilityValue={{
                        text: `${sticker.copies} copies`,
                    }}
                    accessibilityHint={
                        sticker.copies === 0
                            ? `${addDirectionText} to add a copy`
                            : `${addDirectionText} to add a copy or ${removeDirectionText} to remove one`
                    }
                    style={[
                        styles.card,
                        isMissing &&
                        styles.cardMissing,
                        isOwned && styles.cardOwned,
                        isRepeated &&
                        styles.cardRepeated,
                        cardAnimatedStyle,
                    ]}
                >
                    <View style={styles.topRow}>
                        <Text style={styles.id}>
                            {sticker.id}
                        </Text>

                        {sticker.type === 'foil' && (
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
                        {sticker.name}
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

                        {sticker.copies > 0 && (
                            <View
                                style={[
                                    styles.copyBadge,
                                    isRepeated &&
                                    styles.copyBadgeRepeated,
                                ]}
                            >
                                <Text style={styles.copyText}>
                                    ×{sticker.copies}
                                </Text>
                            </View>
                        )}
                    </View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

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
        fontSize: theme.typography.sizes.lg,
        fontWeight:
        theme.typography.weights.bold,
        color: theme.colors.textPrimary,
    },

    actionLabel: {
        marginTop: 2,
        fontSize: theme.typography.sizes.xs,
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
        backgroundColor: theme.colors.missing,
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
        fontSize: theme.typography.sizes.md,
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
        fontSize: theme.typography.sizes.xs,
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
        fontSize: theme.typography.sizes.xs,
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
        backgroundColor: theme.colors.owned,
    },

    copyBadgeRepeated: {
        backgroundColor:
            'rgba(53, 201, 111, 0.86)',
    },

    copyText: {
        fontSize: theme.typography.sizes.xs,
        fontWeight:
        theme.typography.weights.bold,
        color: theme.colors.textPrimary,
    },
});