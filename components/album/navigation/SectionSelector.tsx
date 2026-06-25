import {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from 'react';

import {
    type LayoutChangeEvent,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import {
    Pressable,
} from 'react-native-gesture-handler';

import Animated, {
    Extrapolation,
    interpolate,
    interpolateColor,
    runOnJS,
    type SharedValue,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';

import { theme } from '@/constants/theme';
import type { AlbumSection } from '@/types/album';

interface SectionSelectorProps {
    sections: AlbumSection[];

    /**
     * Continuous PagerView position.
     *
     * 0 = Overview
     * 1 = first real album section
     * 2 = second real album section
     */
    pagePosition: SharedValue<number>;

    selectedIndex: number;

    onSelectSection: (
        sectionId: string,
        sectionIndex: number
    ) => void;
}

interface SectionPillProps {
    section: AlbumSection;
    index: number;
    selectedIndex: number;

    /**
     * Position synchronized with the pill-strip movement.
     *
     * This intentionally differs from the raw PagerView
     * position so the visual selection and strip movement
     * update together.
     */
    pillPosition: SharedValue<number>;

    onPress: (
        sectionId: string,
        sectionIndex: number
    ) => void;

    onLayout?: (
        index: number,
        event: LayoutChangeEvent
    ) => void;
}

function clamp(
    value: number,
    minimum: number,
    maximum: number
): number {
    'worklet';

    return Math.min(
        Math.max(
            value,
            minimum
        ),
        maximum
    );
}

function withAlpha(
    color: string,
    alpha: number
): string {
    const normalizedAlpha = Math.max(
        0,
        Math.min(1, alpha)
    );

    const hexMatch = color.match(
        /^#([0-9a-f]{6})$/i
    );

    if (!hexMatch) {
        return color;
    }

    const hex = hexMatch[1];

    const red = Number.parseInt(
        hex.slice(0, 2),
        16
    );

    const green = Number.parseInt(
        hex.slice(2, 4),
        16
    );

    const blue = Number.parseInt(
        hex.slice(4, 6),
        16
    );

    return `rgba(${red}, ${green}, ${blue}, ${normalizedAlpha})`;
}

const TRANSPARENT_BACKGROUND =
    withAlpha(
        theme.colors.background,
        0
    );

const SOFT_BACKGROUND =
    withAlpha(
        theme.colors.background,
        0.72
    );

const SectionPill = memo(
    function SectionPill({
                             section,
                             index,
                             selectedIndex,
                             pillPosition,
                             onPress,
                             onLayout,
                         }: SectionPillProps) {
        const pillAnimatedStyle =
            useAnimatedStyle(() => {
                const distance =
                    Math.min(
                        Math.abs(
                            pillPosition.value -
                            index
                        ),
                        1
                    );

                const selectionProgress =
                    1 - distance;

                return {
                    borderColor:
                        interpolateColor(
                            selectionProgress,
                            [0, 1],
                            [
                                theme.colors
                                    .border,
                                theme.colors
                                    .gold,
                            ]
                        ),

                    backgroundColor:
                        interpolateColor(
                            selectionProgress,
                            [0, 1],
                            [
                                theme.colors
                                    .surface,
                                theme.colors
                                    .gold,
                            ]
                        ),

                    transform: [
                        {
                            scale:
                                interpolate(
                                    selectionProgress,
                                    [0, 1],
                                    [1, 1.035],
                                    Extrapolation.CLAMP
                                ),
                        },
                    ],
                };
            });

        const labelAnimatedStyle =
            useAnimatedStyle(() => {
                const distance =
                    Math.min(
                        Math.abs(
                            pillPosition.value -
                            index
                        ),
                        1
                    );

                const selectionProgress =
                    1 - distance;

                return {
                    color:
                        interpolateColor(
                            selectionProgress,
                            [0, 1],
                            [
                                theme.colors
                                    .textSecondary,
                                theme.colors
                                    .textInverse,
                            ]
                        ),

                    opacity:
                        interpolate(
                            selectionProgress,
                            [0, 1],
                            [0.84, 1],
                            Extrapolation.CLAMP
                        ),
                };
            });

        const isSelected =
            selectedIndex === index;

        return (
            <View
                onLayout={
                    onLayout
                        ? (event) => {
                            onLayout(
                                index,
                                event
                            );
                        }
                        : undefined
                }
            >
                <Pressable
                    accessibilityRole="button"
                    accessibilityState={{
                        selected: isSelected,
                    }}
                    accessibilityLabel={
                        `Open ${section.name}`
                    }
                    accessibilityHint={
                        isSelected
                            ? 'Currently selected'
                            : 'Navigates to this album page'
                    }
                    onPress={() => {
                        onPress(
                            section.id,
                            index
                        );
                    }}
                    style={({ pressed }) => [
                        styles.pressable,
                        pressed &&
                        styles
                            .pressablePressed,
                    ]}
                >
                    <Animated.View
                        style={[
                            styles.pill,
                            pillAnimatedStyle,
                        ]}
                    >
                        <Animated.Text
                            numberOfLines={1}
                            style={[
                                styles.label,
                                labelAnimatedStyle,
                            ]}
                        >
                            {section.name}
                        </Animated.Text>
                    </Animated.View>
                </Pressable>
            </View>
        );
    }
);

function SectionSelectorComponent({
                                      sections,
                                      pagePosition,
                                      selectedIndex,
                                      onSelectSection,
                                  }: SectionSelectorProps) {
    const overviewSection =
        sections[0];

    const scrollableSections =
        useMemo(
            () => sections.slice(1),
            [sections]
        );

    const scrollViewRef =
        useRef<ScrollView>(null);

    const viewportWidth =
        useSharedValue(0);

    const contentWidth =
        useSharedValue(0);

    const pillCenters =
        useSharedValue<number[]>([]);

    const pillMeasured =
        useSharedValue<boolean[]>([]);

    /**
     * Drives the pill appearance.
     *
     * It is updated from the same JS operation that moves
     * the horizontal ScrollView, keeping both effects in
     * visual sync.
     */
    const pillPosition =
        useSharedValue(pagePosition.value);

    const pillCentersRef =
        useRef<number[]>([]);

    const viewportWidthRef =
        useRef(0);

    const contentWidthRef =
        useRef(0);

    /**
     * Moves the strip and immediately commits the same
     * PagerView position to the pill visual state.
     *
     * Both commands now originate from one JS callback.
     */
    const applySynchronizedPosition =
        useCallback(
            (
                offset: number,
                nextPagePosition: number,
                animated = false
            ) => {
                scrollViewRef.current?.scrollTo({
                    x: offset,
                    y: 0,
                    animated,
                });

                pillPosition.value =
                    nextPagePosition;
            },
            [pillPosition]
        );

    const calculateOffsetForLocalIndex =
        useCallback(
            (
                localIndex: number
            ): number | null => {
                const center =
                    pillCentersRef.current[
                        localIndex
                        ];

                const currentViewportWidth =
                    viewportWidthRef.current;

                const currentContentWidth =
                    contentWidthRef.current;

                if (
                    center === undefined ||
                    currentViewportWidth <= 0 ||
                    currentContentWidth <= 0
                ) {
                    return null;
                }

                const desiredOffset =
                    center -
                    currentViewportWidth / 2;

                const maximumOffset =
                    Math.max(
                        0,
                        currentContentWidth -
                        currentViewportWidth
                    );

                return Math.max(
                    0,
                    Math.min(
                        desiredOffset,
                        maximumOffset
                    )
                );
            },
            []
        );

    const handleViewportLayout =
        useCallback(
            (
                event: LayoutChangeEvent
            ) => {
                const width =
                    event.nativeEvent
                        .layout.width;

                viewportWidth.value =
                    width;

                viewportWidthRef.current =
                    width;
            },
            [viewportWidth]
        );

    const handlePillLayout =
        useCallback(
            (
                globalIndex: number,
                event: LayoutChangeEvent
            ) => {
                const localIndex =
                    globalIndex - 1;

                if (localIndex < 0) {
                    return;
                }

                const {
                    x,
                    width,
                } =
                    event.nativeEvent
                        .layout;

                const center =
                    x + width / 2;

                const nextCenters = [
                    ...pillCenters.value,
                ];

                const nextMeasured = [
                    ...pillMeasured.value,
                ];

                nextCenters[localIndex] =
                    center;

                nextMeasured[localIndex] =
                    true;

                pillCenters.value =
                    nextCenters;

                pillMeasured.value =
                    nextMeasured;

                pillCentersRef.current[
                    localIndex
                    ] = center;
            },
            [
                pillCenters,
                pillMeasured,
            ]
        );

    /**
     * Calculates both values from the same PagerView frame:
     *
     * - horizontal strip offset
     * - visual pill position
     */
    useAnimatedReaction(
        () => {
            const pillCount =
                scrollableSections.length;

            const rawPagePosition =
                pagePosition.value;

            if (
                pillCount === 0 ||
                viewportWidth.value <= 0 ||
                contentWidth.value <= 0
            ) {
                return {
                    offset: 0,
                    page: rawPagePosition,
                    ready: false,
                };
            }

            const localPosition =
                clamp(
                    rawPagePosition - 1,
                    0,
                    pillCount - 1
                );

            const leftIndex =
                Math.floor(
                    localPosition
                );

            const rightIndex =
                Math.min(
                    leftIndex + 1,
                    pillCount - 1
                );

            const measured =
                pillMeasured.value;

            if (
                !measured[leftIndex] ||
                !measured[rightIndex]
            ) {
                return {
                    offset: 0,
                    page: rawPagePosition,
                    ready: false,
                };
            }

            const progress =
                localPosition -
                leftIndex;

            const centers =
                pillCenters.value;

            const interpolatedCenter =
                centers[leftIndex] +
                (
                    centers[rightIndex] -
                    centers[leftIndex]
                ) *
                progress;

            const desiredOffset =
                interpolatedCenter -
                viewportWidth.value / 2;

            const maximumOffset =
                Math.max(
                    0,
                    contentWidth.value -
                    viewportWidth.value
                );

            return {
                offset: clamp(
                    desiredOffset,
                    0,
                    maximumOffset
                ),
                page: rawPagePosition,
                ready: true,
            };
        },
        (
            nextValue,
            previousValue
        ) => {
            if (!nextValue.ready) {
                return;
            }

            if (
                previousValue?.ready &&
                nextValue.offset ===
                previousValue.offset &&
                nextValue.page ===
                previousValue.page
            ) {
                return;
            }

            runOnJS(
                applySynchronizedPosition
            )(
                nextValue.offset,
                nextValue.page,
                false
            );
        },
        [
            applySynchronizedPosition,
            scrollableSections.length,
        ]
    );

    /**
     * Handles committed page changes and direct pill taps.
     *
     * The fallback still updates movement and appearance
     * through the same function.
     */
    useEffect(() => {
        if (selectedIndex <= 0) {
            applySynchronizedPosition(
                0,
                0,
                true
            );

            return;
        }

        const localIndex =
            selectedIndex - 1;

        const frame =
            requestAnimationFrame(() => {
                const offset =
                    calculateOffsetForLocalIndex(
                        localIndex
                    );

                if (offset === null) {
                    return;
                }

                applySynchronizedPosition(
                    offset,
                    selectedIndex,
                    true
                );
            });

        return () => {
            cancelAnimationFrame(
                frame
            );
        };
    }, [
        applySynchronizedPosition,
        calculateOffsetForLocalIndex,
        selectedIndex,
    ]);

    if (!overviewSection) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View
                style={
                    styles.overviewContainer
                }
            >
                <SectionPill
                    section={
                        overviewSection
                    }
                    index={0}
                    selectedIndex={
                        selectedIndex
                    }
                    pillPosition={
                        pillPosition
                    }
                    onPress={
                        onSelectSection
                    }
                />
            </View>

            <View
                style={
                    styles.scrollViewport
                }
                onLayout={
                    handleViewportLayout
                }
            >
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    showsHorizontalScrollIndicator={
                        false
                    }
                    bounces={false}
                    overScrollMode="never"
                    keyboardShouldPersistTaps="handled"
                    scrollEventThrottle={16}
                    contentContainerStyle={
                        styles.content
                    }
                    onContentSizeChange={(
                        width
                    ) => {
                        contentWidth.value =
                            width;

                        contentWidthRef.current =
                            width;
                    }}
                >
                    {scrollableSections.map(
                        (
                            section,
                            localIndex
                        ) => {
                            const globalIndex =
                                localIndex + 1;

                            return (
                                <SectionPill
                                    key={
                                        section.id
                                    }
                                    section={
                                        section
                                    }
                                    index={
                                        globalIndex
                                    }
                                    selectedIndex={
                                        selectedIndex
                                    }
                                    pillPosition={
                                        pillPosition
                                    }
                                    onPress={
                                        onSelectSection
                                    }
                                    onLayout={
                                        handlePillLayout
                                    }
                                />
                            );
                        }
                    )}
                </ScrollView>

                <LinearGradient
                    pointerEvents="none"
                    colors={[
                        theme.colors.background,
                        SOFT_BACKGROUND,
                        TRANSPARENT_BACKGROUND,
                    ]}
                    locations={[
                        0,
                        0.42,
                        1,
                    ]}
                    start={{
                        x: 0,
                        y: 0.5,
                    }}
                    end={{
                        x: 1,
                        y: 0.5,
                    }}
                    style={[
                        styles.fade,
                        styles.leftFade,
                    ]}
                />
                <LinearGradient
                    pointerEvents="none"
                    colors={[
                        TRANSPARENT_BACKGROUND,
                        SOFT_BACKGROUND,
                        theme.colors.background,
                    ]}
                    locations={[
                        0,
                        0.58,
                        1,
                    ]}
                    start={{
                        x: 0,
                        y: 0.5,
                    }}
                    end={{
                        x: 1,
                        y: 0.5,
                    }}
                    style={[
                        styles.fade,
                        styles.rightFade,
                    ]}
                />
            </View>
        </View>
    );
}

export const SectionSelector = memo(
    SectionSelectorComponent
);

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },

    overviewContainer: {
        zIndex: 3,
        flexShrink: 0,
        backgroundColor:
        theme.colors.background,
    },

    scrollViewport: {
        flex: 1,
        overflow: 'hidden',
    },

    content: {
        alignItems: 'center',
        gap: theme.spacing.sm,
        paddingHorizontal:
        theme.spacing.xs,
    },

    fade: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 32,
    },

    leftFade: {
        left: 0,
    },

    rightFade: {
        right: 0,
    },

    pressable: {
        borderRadius:
        theme.radius.full,
    },

    pressablePressed: {
        opacity: 0.74,
    },

    pill: {
        minHeight: 40,
        maxWidth: 210,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal:
        theme.spacing.lg,
        borderWidth: 1,
        borderRadius:
        theme.radius.full,
    },

    label: {
        fontSize:
        theme.typography.sizes.sm,
        fontWeight:
        theme.typography.weights
            .semibold,
    },
});