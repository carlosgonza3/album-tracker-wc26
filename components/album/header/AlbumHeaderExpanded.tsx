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
import { AlbumHeaderStats } from './AlbumHeaderStats';

import type {
    AlbumHeaderExpandedProps,
} from './albumHeader.types';

function AlbumHeaderExpandedComponent({
                                          safeAreaTop,
                                          summary,
                                          clampedPercentage,
                                          animatedStyle,
                                      }: AlbumHeaderExpandedProps) {
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
                styles.expandedContent,
                {
                    paddingTop:
                        safeAreaTop +
                        theme.spacing.xl,
                },
                animatedStyle,
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
                        styles.tournamentBadge
                    }
                >
                    <Text
                        style={
                            styles.tournamentText
                        }
                    >
                        PANINI
                    </Text>
                </View>

                <Text
                    style={styles.totalText}
                >
                    {total} stickers
                </Text>
            </View>

            <View style={styles.heroBody}>
                <Text style={styles.eyebrow}>
                    YOUR COLLECTION
                </Text>

                <Text style={styles.title}>
                    FIFA World Cup 2026
                </Text>

                <Text
                    style={styles.description}
                >
                    Track your World Cup
                    Official Sticker Collection,
                    discover what is missing, and
                    keep repeated stickers ready
                    to trade.
                </Text>

                <View
                    style={
                        styles.completionRow
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
                            styles.completionCopy
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

                <AlbumHeaderProgress
                    percentage={
                        clampedPercentage
                    }
                />

                <AlbumHeaderStats
                    collected={collected}
                    remaining={remaining}
                    repeated={repeated}
                />
            </View>

            <View style={styles.scrollHint}>
                <View
                    style={styles.scrollHandle}
                />

                <Text
                    style={
                        styles.scrollHintText
                    }
                >
                    Swipe up to explore
                </Text>
            </View>
        </Animated.View>
    );
}

function areAlbumHeaderExpandedPropsEqual(
    previous: AlbumHeaderExpandedProps,
    next: AlbumHeaderExpandedProps
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

export const AlbumHeaderExpanded = memo(
    AlbumHeaderExpandedComponent,
    areAlbumHeaderExpandedPropsEqual
);

const styles = StyleSheet.create({
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
        color:
        theme.colors.gold,
    },

    totalText: {
        fontSize:
        theme.typography.sizes.xs,
        color:
        theme.colors.textSecondary,
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

    eyebrow: {
        fontSize: 11,
        fontWeight:
        theme.typography.weights.bold,
        letterSpacing: 1.8,
        color:
        theme.colors.owned,
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
});