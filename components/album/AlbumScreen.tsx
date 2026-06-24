import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from 'react';

import { useLocalSearchParams } from 'expo-router';

import {
    type FlatList,
    StyleSheet,
    View,
} from 'react-native';

import { AlbumSectionPager } from '@/components/album/AlbumSectionPager';
import { AlbumSectionToolbar } from '@/components/album/AlbumSectionToolbar';
import {
    type AlbumHeaderSummary,
    CollapsibleAlbumHeader,
} from '@/components/album/CollapsibleAlbumHeader';
import { theme } from '@/constants/theme';
import { albumCatalogue } from '@/data/albumCatalogue';
import { useAlbumLayout } from '@/hooks/album/useAlbumLayout';
import { useAlbumNavigation } from '@/hooks/album/useAlbumNavigation';
import { useAlbumScroll } from '@/hooks/album/useAlbumScroll';
import { useSettings } from '@/hooks/useSettings';
import { useStickers } from '@/hooks/useStickers';
import type {
    AlbumSection,
    StickerWithState,
} from '@/types/album';
import { getCollectionSummary } from '@/utils/albumStats';

const ALBUM_OVERVIEW_ID =
    'album-overview';

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

function getSingleRouteParam(
    value: string | string[] | undefined
): string | undefined {
    return Array.isArray(value)
        ? value[0]
        : value;
}

export function AlbumScreen() {
    const routeParams =
        useLocalSearchParams();

    const requestedSectionId =
        getSingleRouteParam(
            routeParams.sectionId
        );

    const openRequest =
        getSingleRouteParam(
            routeParams.openRequest
        );

    const handledOpenRequestRef =
        useRef<string | null>(null);

    const {
        safeAreaTop,
        expandedHeaderHeight,
        albumSectionsSnapOffset,
        sharedSectionHeaderHeight,
        sharedSectionHeaderTop,
        sectionContentSpacerHeight,
    } = useAlbumLayout();

    const { settings } = useSettings();

    const {
        collection,
        incrementSticker,
        decrementSticker,
    } = useStickers();

    const {
        pagerRef,
        pagePosition,

        /*
         * PagerView index:
         *
         * 0 = Overview
         * 1 = first real section
         * 2 = second real section
         */
        selectedSectionIndex,

        selectedSectionId,
        selectOverview,
        selectSection,
        handlePageScroll,
        handlePageSelected,
    } = useAlbumNavigation({
        sections:
        albumCatalogue.sections,
    });

    useEffect(() => {
        if (!requestedSectionId) {
            return;
        }

        const requestKey =
            openRequest ??
            requestedSectionId;

        if (
            handledOpenRequestRef.current ===
            requestKey
        ) {
            return;
        }

        const sectionIndex =
            albumCatalogue.sections.findIndex(
                (section) =>
                    section.id ===
                    requestedSectionId
            );

        if (sectionIndex < 0) {
            return;
        }

        handledOpenRequestRef.current =
            requestKey;

        /*
         * Wait one frame so PagerView and its native ref
         * are mounted after switching from Collection.
         */
        const frameId =
            requestAnimationFrame(() => {
                selectSection(
                    requestedSectionId,
                    sectionIndex
                );
            });

        return () => {
            cancelAnimationFrame(
                frameId
            );
        };
    }, [
        openRequest,
        requestedSectionId,
        selectSection,
    ]);

    const {
        scrollY,
        isSharedHeaderInteractive,
        snapToOffsets,
        scrollEventThrottle,
        handleVerticalScroll,
        handleVerticalScrollBeginDrag,
        handleVerticalScrollEndDrag,
        handleVerticalMomentumEnd,
        getSectionListRef,
        synchronizeSectionScroll,
        scrollToAlbumCover,
        scrollToSections,
    } = useAlbumScroll({
        albumSectionsSnapOffset,
        activeSectionId:
        selectedSectionId,
        sectionChangeBehavior:
            'section-start',
    });

    /*
     * Register the Overview FlatList with the same scroll
     * controller used by sticker section lists.
     */
    const overviewListRef =
        useCallback(
            (
                instance:
                    FlatList<AlbumSection> | null
            ) => {
                const registerOverviewList =
                    getSectionListRef(
                        ALBUM_OVERVIEW_ID
                    );

                registerOverviewList(
                    instance as unknown as
                        FlatList<StickerWithState> | null
                );
            },
            [
                getSectionListRef,
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

    const handleIncrementSticker =
        useCallback(
            (
                stickerId: string
            ) => {
                void incrementSticker(
                    stickerId
                );
            },
            [
                incrementSticker,
            ]
        );

    const handleDecrementSticker =
        useCallback(
            (
                stickerId: string
            ) => {
                void decrementSticker(
                    stickerId
                );
            },
            [
                decrementSticker,
            ]
        );

    const handleSectionSelected =
        useCallback(
            (
                sectionId: string
            ) => {
                synchronizeSectionScroll(
                    sectionId
                );
            },
            [
                synchronizeSectionScroll,
            ]
        );

    const handleOverviewSelected =
        useCallback(() => {
            synchronizeSectionScroll(
                ALBUM_OVERVIEW_ID
            );
        }, [
            synchronizeSectionScroll,
        ]);

    const handleCollapseHeader =
        useCallback(() => {
            scrollToSections(true);
        }, [
            scrollToSections,
        ]);

    const handleExpandHeader =
        useCallback(() => {
            scrollToAlbumCover(true);
        }, [
            scrollToAlbumCover,
        ]);

    return (
        <View style={styles.screen}>
            <AlbumSectionPager
                sections={
                    albumCatalogue.sections
                }
                collection={
                    collection
                }
                pagerRef={
                    pagerRef
                }
                selectedIndex={
                    selectedSectionIndex
                }
                initialPage={
                    selectedSectionIndex
                }
                topSpacerHeight={
                    sectionContentSpacerHeight
                }
                invertSwipeDirections={
                    settings
                        .invertSwipeDirections
                }
                onIncrementSticker={
                    handleIncrementSticker
                }
                onDecrementSticker={
                    handleDecrementSticker
                }
                onPageScroll={
                    handlePageScroll
                }
                onPageSelected={
                    handlePageSelected
                }
                onOverviewSelected={
                    handleOverviewSelected
                }
                onSectionSelected={
                    handleSectionSelected
                }
                onSelectSection={
                    selectSection
                }
                getSectionListRef={
                    getSectionListRef
                }
                overviewListRef={
                    overviewListRef
                }
                onVerticalScroll={
                    handleVerticalScroll
                }
                verticalScrollEventThrottle={
                    scrollEventThrottle
                }
                snapToOffsets={
                    snapToOffsets
                }
                onVerticalScrollBeginDrag={
                    handleVerticalScrollBeginDrag
                }
                onVerticalScrollEndDrag={
                    handleVerticalScrollEndDrag
                }
                onVerticalMomentumEnd={
                    handleVerticalMomentumEnd
                }
            />

            <CollapsibleAlbumHeader
                scrollY={
                    scrollY
                }
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
                    handleCollapseHeader
                }
                onExpandHeader={
                    handleExpandHeader
                }
            />

            <AlbumSectionToolbar
                sections={
                    albumCatalogue.sections
                }
                pagePosition={
                    pagePosition
                }
                selectedIndex={
                    selectedSectionIndex
                }
                scrollY={
                    scrollY
                }
                albumSectionsSnapOffset={
                    albumSectionsSnapOffset
                }
                top={
                    sharedSectionHeaderTop
                }
                height={
                    sharedSectionHeaderHeight
                }
                isInteractive={
                    isSharedHeaderInteractive
                }
                onSelectOverview={
                    selectOverview
                }
                onSelectSection={
                    selectSection
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        overflow: 'hidden',
        backgroundColor:
        theme.colors.background,
    },
});