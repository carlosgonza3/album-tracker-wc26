import Ionicons from '@expo/vector-icons/Ionicons';

import {
    BottomTabBar,
    type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';

import {
    Tabs,
} from 'expo-router';

import {
    useCallback,
    useMemo,
} from 'react';

import {
    StyleSheet,
    View,
} from 'react-native';

import {
    runOnJS,
    useAnimatedReaction,
} from 'react-native-reanimated';

import {
    AlbumHeader,
} from '@/components/album/header/AlbumHeader';

import type {
    AlbumHeaderSummary,
} from '@/components/album/header/albumHeader.types';

import {
    AlbumHeaderProvider,
} from '@/context/AlbumHeaderProvider';

import { theme } from '@/constants/theme';
import { albumCatalogue } from '@/data/albumCatalogue';

import {
    useAlbumHeader,
} from '@/hooks/album/useAlbumHeader';

import {
    useAlbumLayout,
} from '@/hooks/album/useAlbumLayout';

import {
    useStickers,
} from '@/hooks/useStickers';

import {
    getCollectionSummary,
} from '@/utils/albumStats';

const HEADER_EXPANDED_THRESHOLD = 0.15;

function normalizeCopies(
    copies: number
): number {
    if (!Number.isFinite(copies)) {
        return 0;
    }

    return Math.max(
        0,
        Math.floor(copies)
    );
}

function GlobalAlbumTabs() {
    const {
        safeAreaTop,
        expandedHeaderHeight,
        headerCollapseDistance,
    } = useAlbumLayout();

    const {
        collection,
    } = useStickers();

    const {
        scrollY,
        isHeaderExpanded,
        collapseHeader,
        expandHeader,
        setHeaderExpanded,
    } = useAlbumHeader();

    const expandedRange =
        headerCollapseDistance *
        HEADER_EXPANDED_THRESHOLD;

    /*
     * Keep the provider state synchronized with the
     * animated header position.
     *
     * This covers both:
     * - direct header gestures
     * - vertical Album list scrolling
     */
    useAnimatedReaction(
        () =>
            scrollY.value <=
            expandedRange,
        (
            isExpanded,
            wasExpanded
        ) => {
            if (
                isExpanded ===
                wasExpanded
            ) {
                return;
            }

            runOnJS(
                setHeaderExpanded
            )(isExpanded);
        },
        [
            expandedRange,
            setHeaderExpanded,
        ]
    );

    const renderTabBar =
        useCallback(
            (
                props:
                BottomTabBarProps
            ) => {
                if (
                    isHeaderExpanded
                ) {
                    return null;
                }

                return (
                    <BottomTabBar
                        {...props}
                    />
                );
            },
            [
                isHeaderExpanded,
            ]
        );

    const albumSummary =
        useMemo(
            () =>
                getCollectionSummary(
                    albumCatalogue,
                    collection
                ),
            [
                collection,
            ]
        );

    const repeatedCopies =
        useMemo(
            () =>
                Object.values(
                    collection
                ).reduce(
                    (
                        total,
                        copies
                    ) => {
                        const normalizedCopies =
                            normalizeCopies(
                                copies
                            );

                        return (
                            total +
                            Math.max(
                                0,
                                normalizedCopies -
                                1
                            )
                        );
                    },
                    0
                ),
            [
                collection,
            ]
        );

    const albumHeaderSummary =
        useMemo<AlbumHeaderSummary>(
            () => {
                const remaining =
                    Math.max(
                        0,
                        albumSummary
                            .totalStickers -
                        albumSummary
                            .uniqueOwned
                    );

                return {
                    collected:
                    albumSummary
                        .uniqueOwned,

                    remaining,

                    repeated:
                    repeatedCopies,

                    total:
                    albumSummary
                        .totalStickers,

                    percentage:
                    albumSummary
                        .completionPercentage,
                };
            },
            [
                albumSummary
                    .completionPercentage,
                albumSummary
                    .totalStickers,
                albumSummary
                    .uniqueOwned,
                repeatedCopies,
            ]
        );

    return (
        <View style={styles.root}>
            <AlbumHeader
                scrollY={scrollY}
                expandedHeight={
                    expandedHeaderHeight
                }
                safeAreaTop={
                    safeAreaTop
                }
                summary={
                    albumHeaderSummary
                }
                onCollapseHeader={
                    collapseHeader
                }
                onExpandHeader={
                    expandHeader
                }
            />

            <View
                pointerEvents={
                    isHeaderExpanded
                        ? 'none'
                        : 'auto'
                }
                accessibilityElementsHidden={
                    isHeaderExpanded
                }
                importantForAccessibility={
                    isHeaderExpanded
                        ? 'no-hide-descendants'
                        : 'auto'
                }
                style={[
                    styles.tabsContainer,
                    isHeaderExpanded &&
                    styles.tabsContainerHidden,
                ]}
            >
                <Tabs
                    tabBar={renderTabBar}
                    screenOptions={{
                        headerShown: false,

                        tabBarActiveTintColor:
                        theme.colors.gold,

                        tabBarInactiveTintColor:
                        theme.colors
                            .textMuted,

                        tabBarStyle:
                        styles.tabBar,

                        tabBarLabelStyle: {
                            fontSize:
                            theme.typography
                                .sizes.xs,

                            fontWeight:
                            theme.typography
                                .weights
                                .semibold,
                        },
                    }}
                >
                    <Tabs.Screen
                        name="index"
                        options={{
                            title: 'Album',

                            tabBarIcon: ({
                                             color,
                                             focused,
                                             size,
                                         }) => (
                                <Ionicons
                                    name={
                                        focused
                                            ? 'book'
                                            : 'book-outline'
                                    }
                                    size={size}
                                    color={color}
                                />
                            ),
                        }}
                    />

                    <Tabs.Screen
                        name="collection"
                        options={{
                            title:
                                'Collection',

                            tabBarIcon: ({
                                             color,
                                             focused,
                                             size,
                                         }) => (
                                <Ionicons
                                    name={
                                        focused
                                            ? 'albums'
                                            : 'albums-outline'
                                    }
                                    size={size}
                                    color={color}
                                />
                            ),
                        }}
                    />

                    <Tabs.Screen
                        name="share"
                        options={{
                            title: 'Share',

                            tabBarIcon: ({
                                             color,
                                             focused,
                                             size,
                                         }) => (
                                <Ionicons
                                    name={
                                        focused
                                            ? 'share-social'
                                            : 'share-social-outline'
                                    }
                                    size={size}
                                    color={color}
                                />
                            ),
                        }}
                    />

                    <Tabs.Screen
                        name="settings"
                        options={{
                            title:
                                'Settings',

                            tabBarIcon: ({
                                             color,
                                             focused,
                                             size,
                                         }) => (
                                <Ionicons
                                    name={
                                        focused
                                            ? 'settings'
                                            : 'settings-outline'
                                    }
                                    size={size}
                                    color={color}
                                />
                            ),
                        }}
                    />
                </Tabs>
            </View>
        </View>
    );
}

export default function TabLayout() {
    return (
        <AlbumHeaderProvider>
            <GlobalAlbumTabs />
        </AlbumHeaderProvider>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        overflow: 'hidden',
        backgroundColor:
        theme.colors.background,
    },

    tabsContainer: {
        flex: 1,
        minHeight: 0,
    },

    tabBar: {
        borderTopWidth: 1,
        borderTopColor:
        theme.colors.border,
        backgroundColor:
        theme.colors.primary,
    },

    tabsContainerHidden: {
        opacity: 0,
    },
});