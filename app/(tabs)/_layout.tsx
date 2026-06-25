import Ionicons from '@expo/vector-icons/Ionicons';

import {
    Tabs,
} from 'expo-router';

import {
    useMemo,
} from 'react';

import {
    StyleSheet,
    View,
} from 'react-native';

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
    } = useAlbumLayout();

    const {
        collection,
    } = useStickers();

    const {
        scrollY,
        collapseHeader,
        expandHeader,
    } = useAlbumHeader();

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

            <View style={styles.tabsContainer}>
                <Tabs
                    screenOptions={{
                        headerShown: false,

                        tabBarActiveTintColor:
                        theme.colors.gold,

                        tabBarInactiveTintColor:
                        theme.colors
                            .textMuted,

                        tabBarStyle: {
                            borderTopWidth: 1,

                            borderTopColor:
                            theme.colors.border,

                            backgroundColor:
                            theme.colors.primary,
                        },

                        tabBarLabelStyle: {
                            fontSize:
                            theme.typography
                                .sizes.xs,

                            fontWeight:
                            theme.typography
                                .weights.semibold,
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
                            title: 'Collection',

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
                            title: 'Settings',

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
});