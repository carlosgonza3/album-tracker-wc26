import {
    memo,
} from 'react';

import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Animated from 'react-native-reanimated';

import { theme } from '@/constants/theme';

import { AlbumHeaderProgress } from './AlbumHeaderProgress';

import {
    ALBUM_HEADER_COLLAPSED_HEIGHT,
} from './albumHeader.constants';

import type {
    AlbumHeaderCompactProps,
} from './albumHeader.types';

function AlbumHeaderCompactComponent({
                                         safeAreaTop,
                                         summary,
                                         clampedPercentage,
                                         animatedStyle,
                                     }: AlbumHeaderCompactProps) {
    const {
        collected,
        remaining,
        repeated,
        total,
    } = summary;

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                styles.compactContent,
                {
                    top: safeAreaTop,
                    height:
                    ALBUM_HEADER_COLLAPSED_HEIGHT,
                },
                animatedStyle,
            ]}
        >
            <View
                style={
                    styles.compactTitleGroup
                }
            >
                <Text
                    style={
                        styles.compactEyebrow
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
                        styles.compactSummary
                    }
                >
                    {remaining} left ·{' '}
                    {repeated} repeated
                </Text>

                <AlbumHeaderProgress
                    percentage={
                        clampedPercentage
                    }
                    compact
                />
            </View>

            <View
                style={styles.compactMeta}
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
    );
}

function areAlbumHeaderCompactPropsEqual(
    previous: AlbumHeaderCompactProps,
    next: AlbumHeaderCompactProps
): boolean {
    return (
        previous.safeAreaTop ===
        next.safeAreaTop &&
        previous.clampedPercentage ===
        next.clampedPercentage &&
        previous.animatedStyle ===
        next.animatedStyle &&
        previous.summary.collected ===
        next.summary.collected &&
        previous.summary.remaining ===
        next.summary.remaining &&
        previous.summary.repeated ===
        next.summary.repeated &&
        previous.summary.total ===
        next.summary.total &&
        previous.summary.percentage ===
        next.summary.percentage
    );
}

export const AlbumHeaderCompact = memo(
    AlbumHeaderCompactComponent,
    areAlbumHeaderCompactPropsEqual
);

const styles = StyleSheet.create({
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
        color:
        theme.colors.gold,
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

    compactMeta: {
        minWidth: 52,
        alignItems: 'flex-end',
    },

    compactPercentage: {
        fontSize:
        theme.typography.sizes.lg,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.owned,
    },

    compactCount: {
        marginTop: 2,
        fontSize: 9,
        color:
        theme.colors.textSecondary,
    },
});