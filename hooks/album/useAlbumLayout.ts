import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ALBUM_HEADER_COLLAPSED_HEIGHT } from '@/components/album/header/CollapsibleAlbumHeader';

const DEFAULT_BOTTOM_NAVIGATION_HEIGHT = 72;
const DEFAULT_MINIMUM_EXPANDED_HEIGHT = 560;
const DEFAULT_SHARED_SECTION_HEADER_HEIGHT = 148;

interface UseAlbumLayoutOptions {
    bottomNavigationHeight?: number;
    minimumExpandedHeight?: number;
    sharedSectionHeaderHeight?: number;
}

export interface AlbumLayout {
    windowHeight: number;
    windowWidth: number;

    safeAreaTop: number;
    safeAreaBottom: number;

    expandedHeaderHeight: number;
    collapsedHeaderHeight: number;
    headerCollapseDistance: number;

    albumSectionsSnapOffset: number;

    sharedSectionHeaderHeight: number;
    sharedSectionHeaderTop: number;
    sharedSectionHeaderBottom: number;

    sectionContentSpacerHeight: number;
    sectionContentStartOffset: number;

    bottomNavigationHeight: number;
}

/**
 * Calculates the measurements shared by the album
 * hero, compact header, section toolbar and sticker
 * pages.
 *
 * Keeping these calculations in one hook prevents
 * small layout inconsistencies between components.
 */
export function useAlbumLayout(
    options: UseAlbumLayoutOptions = {}
): AlbumLayout {
    const {
        bottomNavigationHeight =
            DEFAULT_BOTTOM_NAVIGATION_HEIGHT,

        minimumExpandedHeight =
            DEFAULT_MINIMUM_EXPANDED_HEIGHT,

        sharedSectionHeaderHeight =
            DEFAULT_SHARED_SECTION_HEADER_HEIGHT,
    } = options;

    const insets = useSafeAreaInsets();

    const {
        height: windowHeight,
        width: windowWidth,
    } = useWindowDimensions();

    return useMemo(() => {
        /*
         * ALBUM_HEADER_COLLAPSED_HEIGHT excludes the
         * device's top safe area.
         */
        const collapsedHeaderHeight =
            ALBUM_HEADER_COLLAPSED_HEIGHT +
            insets.top;

        /*
         * The expanded hero fills the available screen
         * above the bottom tab navigation while still
         * respecting a minimum design height.
         */
        const expandedHeaderHeight = Math.max(
            minimumExpandedHeight +
            insets.top,
            windowHeight -
            insets.bottom -
            bottomNavigationHeight
        );

        const headerCollapseDistance = Math.max(
            1,
            expandedHeaderHeight -
            collapsedHeaderHeight
        );

        /*
         * The first vertical snap lands exactly where
         * the expanded hero has finished collapsing.
         */
        const albumSectionsSnapOffset =
            headerCollapseDistance;

        /*
         * The shared Album Sections toolbar sits directly
         * below the compact album header.
         */
        const sharedSectionHeaderTop = 0;

        const sharedSectionHeaderBottom =
            sharedSectionHeaderTop +
            sharedSectionHeaderHeight;

        /*
         * Every section page needs enough empty space at
         * the beginning of its vertical list for:
         *
         * 1. The expanded album hero.
         * 2. The fixed Album Sections toolbar.
         *
         * At the snap offset, the dynamic section content
         * begins directly below both fixed layers.
         */
        const sectionContentSpacerHeight =
            headerCollapseDistance +
            sharedSectionHeaderHeight;

        const sectionContentStartOffset =
            sharedSectionHeaderBottom;

        return {
            windowHeight,
            windowWidth,

            safeAreaTop: insets.top,
            safeAreaBottom: insets.bottom,

            expandedHeaderHeight,
            collapsedHeaderHeight,
            headerCollapseDistance,

            albumSectionsSnapOffset,

            sharedSectionHeaderHeight,
            sharedSectionHeaderTop,
            sharedSectionHeaderBottom,

            sectionContentSpacerHeight,
            sectionContentStartOffset,

            bottomNavigationHeight,
        };
    }, [
        bottomNavigationHeight,
        insets.bottom,
        insets.top,
        minimumExpandedHeight,
        sharedSectionHeaderHeight,
        windowHeight,
        windowWidth,
    ]);
}