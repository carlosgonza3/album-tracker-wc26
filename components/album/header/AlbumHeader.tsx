import {
    memo,
} from 'react';

import {
    StyleSheet,
} from 'react-native';

import {
    GestureDetector,
} from 'react-native-gesture-handler';

import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedStyle,
} from 'react-native-reanimated';

import { theme } from '@/constants/theme';

import { AlbumHeaderCompact } from './AlbumHeaderCompact';
import { AlbumHeaderExpanded } from './AlbumHeaderExpanded';

import {
    ALBUM_HEADER_COLLAPSED_HEIGHT,
} from './albumHeader.constants';

import type {
    AlbumHeaderProps,
} from './albumHeader.types';

import {
    useAlbumHeaderGesture,
} from './useAlbumHeaderGesture';

interface HeaderAnimationOptions {
    scrollY: AlbumHeaderProps['scrollY'];
    expandedHeight: number;
    collapsedHeight: number;
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

function useHeaderAnimations({
                                 scrollY,
                                 expandedHeight,
                                 collapsedHeight,
                             }: HeaderAnimationOptions) {
    const collapseDistance = Math.max(
        1,
        expandedHeight -
        collapsedHeight
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

function AlbumHeaderComponent({
                                  scrollY,
                                  expandedHeight,
                                  safeAreaTop,
                                  summary,
                                  onCollapseHeader,
                                  onExpandHeader,
                              }: AlbumHeaderProps) {
    const clampedPercentage =
        clampPercentage(
            summary.percentage
        );

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

    const headerGesture =
        useAlbumHeaderGesture({
            scrollY,
            collapseDistance,
            onCollapseHeader,
            onExpandHeader,
        });

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
                <AlbumHeaderExpanded
                    safeAreaTop={safeAreaTop}
                    summary={summary}
                    clampedPercentage={
                        clampedPercentage
                    }
                    animatedStyle={
                        expandedContentStyle
                    }
                />

                <AlbumHeaderCompact
                    safeAreaTop={safeAreaTop}
                    summary={summary}
                    clampedPercentage={
                        clampedPercentage
                    }
                    animatedStyle={
                        compactContentStyle
                    }
                />
            </Animated.View>
        </GestureDetector>
    );
}

function areAlbumHeaderPropsEqual(
    previous: AlbumHeaderProps,
    next: AlbumHeaderProps
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

export const AlbumHeader = memo(
    AlbumHeaderComponent,
    areAlbumHeaderPropsEqual
);

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexShrink: 0,
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
});