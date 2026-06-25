import {
    useCallback,
    useEffect,
    useRef,
} from 'react';

import {
    useLocalSearchParams,
} from 'expo-router';

import {
    type FlatList,
    StyleSheet,
    View,
} from 'react-native';

import {
    AlbumSectionPager,
} from '@/components/album/navigation/AlbumSectionPager';

import {
    AlbumSectionToolbar,
} from '@/components/album/navigation/AlbumSectionToolbar';

import { theme } from '@/constants/theme';
import { albumCatalogue } from '@/data/albumCatalogue';

import {
    useAlbumHeader,
} from '@/hooks/album/useAlbumHeader';

import {
    useAlbumLayout,
} from '@/hooks/album/useAlbumLayout';

import {
    useAlbumNavigation,
} from '@/hooks/album/useAlbumNavigation';

import {
    useAlbumScroll,
} from '@/hooks/album/useAlbumScroll';

import {
    useSettings,
} from '@/hooks/useSettings';

import {
    useStickers,
} from '@/hooks/useStickers';

import type {
    AlbumSection,
    StickerWithState,
} from '@/types/album';

const ALBUM_OVERVIEW_ID =
    'album-overview';

function getSingleRouteParam(
    value:
        string |
        string[] |
        undefined
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
        albumSectionsSnapOffset,
        sharedSectionHeaderHeight,
        sharedSectionHeaderTop,
        sectionContentSpacerHeight,
    } = useAlbumLayout();

    const {
        scrollY:
            sharedHeaderScrollY,

        registerScrollActions,
    } = useAlbumHeader();

    const { settings } =
        useSettings();

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

        sharedScrollY:
        sharedHeaderScrollY,
    });

    /*
     * Give the global header access to the existing
     * Album-list transitions.
     *
     * The global header still collapses and expands by
     * moving every mounted Album list exactly as before.
     */
    useEffect(() => {
        registerScrollActions({
            scrollToAlbumCover,
            scrollToSections,
        });

        return () => {
            registerScrollActions(
                null
            );
        };
    }, [
        registerScrollActions,
        scrollToAlbumCover,
        scrollToSections,
    ]);

    /*
     * Register the Overview FlatList with the same scroll
     * controller used by sticker section lists.
     */
    const overviewListRef =
        useCallback(
            (
                instance:
                    FlatList<AlbumSection> |
                    null
            ) => {
                const registerOverviewList =
                    getSectionListRef(
                        ALBUM_OVERVIEW_ID
                    );

                registerOverviewList(
                    instance as unknown as
                        FlatList<StickerWithState> |
                        null
                );
            },
            [
                getSectionListRef,
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