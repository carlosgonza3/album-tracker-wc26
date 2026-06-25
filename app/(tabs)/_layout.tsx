import type {
    BottomTabBarProps,
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
    AlbumHeaderProvider,
} from '@/context/AlbumHeaderProvider';

import {
    AlbumHeader,
} from '@/components/album/header/AlbumHeader';

import type {
    AlbumHeaderSummary,
} from '@/components/album/header/albumHeader.types';

import {
    GlassTabBar,
} from '@/components/album/navigation/GlassTabBar';

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

function GlobalAlbumTabsContent() {
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
     * Keep the React state synchronized with the
     * animated Album header position.
     *
     * This covers:
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
                    <GlassTabBar
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
                        tabBarHideOnKeyboard:
                            true,
                    }}
                >
                    <Tabs.Screen
                        name="index"
                        options={{
                            title: 'Album',
                        }}
                    />

                    <Tabs.Screen
                        name="collection"
                        options={{
                            title:
                                'Collection',
                        }}
                    />

                    <Tabs.Screen
                        name="share"
                        options={{
                            title: 'Share',
                        }}
                    />

                    <Tabs.Screen
                        name="settings"
                        options={{
                            title:
                                'Settings',
                        }}
                    />
                </Tabs>
            </View>
        </View>
    );
}

export default function GlobalAlbumTabs() {
    return (
        <AlbumHeaderProvider>
            <GlobalAlbumTabsContent />
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

    tabsContainerHidden: {
        opacity: 0,
    },
});