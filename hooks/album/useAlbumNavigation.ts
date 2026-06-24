import * as Haptics from 'expo-haptics';

import {
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';

import type {
    NativeSyntheticEvent,
} from 'react-native';

import PagerView from 'react-native-pager-view';

import {
    type SharedValue,
    useEvent,
    useSharedValue,
} from 'react-native-reanimated';

import type { AlbumSection } from '@/types/album';

interface PageScrollEvent {
    position: number;
    offset: number;
}

interface PageSelectedEvent {
    position: number;
}

interface UseAlbumNavigationOptions {
    sections: readonly AlbumSection[];
    initialSectionId?: string;
    enableHaptics?: boolean;
}

export interface AlbumNavigation {
    pagerRef: React.RefObject<
        PagerView | null
    >;

    /**
     * Continuous PagerView position.
     *
     * 0 = Overview
     * 1 = first album section
     * 2 = second album section
     *
     * This SharedValue is updated directly on the
     * Reanimated UI thread while PagerView is moving.
     */
    pagePosition: SharedValue<number>;

    /**
     * Fully committed PagerView index.
     *
     * 0 = Overview
     * 1 = first album section
     * 2 = second album section
     */
    selectedSectionIndex: number;

    selectedSectionId: string;
    selectedSection: AlbumSection | null;

    isOverviewSelected: boolean;

    sectionCount: number;
    pageCount: number;

    hasPreviousSection: boolean;
    hasNextSection: boolean;

    selectOverview: () => void;

    selectSection: (
        sectionId: string,
        sectionIndex: number
    ) => void;

    selectSectionByIndex: (
        sectionIndex: number
    ) => void;

    selectPreviousSection: () => void;
    selectNextSection: () => void;

    /**
     * Native Reanimated event handler passed directly to
     * PagerView's onPageScroll prop.
     */
    handlePageScroll: ReturnType<
        typeof useEvent<PageScrollEvent>
    >;

    handlePageSelected: (
        event: NativeSyntheticEvent<PageSelectedEvent>
    ) => void;
}

const OVERVIEW_ID =
    'album-overview';

const OVERVIEW_PAGE_INDEX = 0;
const SECTION_PAGE_OFFSET = 1;

function clampIndex(
    index: number,
    itemCount: number
): number {
    if (itemCount <= 0) {
        return 0;
    }

    return Math.max(
        0,
        Math.min(
            Math.floor(index),
            itemCount - 1
        )
    );
}

function findInitialPagerIndex(
    sections: readonly AlbumSection[],
    initialSectionId?: string
): number {
    if (!initialSectionId) {
        return OVERVIEW_PAGE_INDEX;
    }

    const initialSectionIndex =
        sections.findIndex(
            (section) =>
                section.id ===
                initialSectionId
        );

    if (initialSectionIndex < 0) {
        return OVERVIEW_PAGE_INDEX;
    }

    return (
        initialSectionIndex +
        SECTION_PAGE_OFFSET
    );
}

/**
 * Owns horizontal navigation for:
 *
 * 0 = Overview
 * 1...n = real album sections
 *
 * React state changes only after PagerView commits a
 * page. During a swipe, pagePosition changes entirely
 * on the Reanimated UI thread.
 */
export function useAlbumNavigation({
                                       sections,
                                       initialSectionId,
                                       enableHaptics = true,
                                   }: UseAlbumNavigationOptions): AlbumNavigation {
    const sectionCount =
        sections.length;

    const pageCount =
        sectionCount +
        SECTION_PAGE_OFFSET;

    const initialPagerIndex = useMemo(
        () =>
            findInitialPagerIndex(
                sections,
                initialSectionId
            ),
        [
            initialSectionId,
            sections,
        ]
    );

    const pagerRef =
        useRef<PagerView>(null);

    const selectedIndexRef =
        useRef(initialPagerIndex);

    const requestedIndexRef =
        useRef<number | null>(null);

    const [
        selectedSectionIndex,
        setSelectedSectionIndex,
    ] = useState(
        initialPagerIndex
    );

    const pagePosition =
        useSharedValue(
            initialPagerIndex
        );

    const isOverviewSelected =
        selectedSectionIndex ===
        OVERVIEW_PAGE_INDEX;

    const selectedCatalogueIndex =
        isOverviewSelected
            ? -1
            : selectedSectionIndex -
            SECTION_PAGE_OFFSET;

    const selectedSection =
        selectedCatalogueIndex >= 0
            ? sections[
            selectedCatalogueIndex
            ] ?? null
            : null;

    const selectedSectionId =
        selectedSection?.id ??
        OVERVIEW_ID;

    const hasPreviousSection =
        selectedSectionIndex >
        OVERVIEW_PAGE_INDEX;

    const hasNextSection =
        selectedSectionIndex <
        pageCount - 1;

    const selectPageByIndex =
        useCallback(
            (pageIndex: number) => {
                const nextPageIndex =
                    clampIndex(
                        pageIndex,
                        pageCount
                    );

                if (
                    nextPageIndex ===
                    selectedIndexRef.current &&
                    requestedIndexRef.current ===
                    null
                ) {
                    return;
                }

                requestedIndexRef.current =
                    nextPageIndex;

                pagerRef.current?.setPage(
                    nextPageIndex
                );
            },
            [pageCount]
        );

    const selectOverview =
        useCallback(() => {
            selectPageByIndex(
                OVERVIEW_PAGE_INDEX
            );
        }, [selectPageByIndex]);

    const selectSectionByIndex =
        useCallback(
            (sectionIndex: number) => {
                if (sectionCount === 0) {
                    return;
                }

                const normalizedSectionIndex =
                    clampIndex(
                        sectionIndex,
                        sectionCount
                    );

                selectPageByIndex(
                    normalizedSectionIndex +
                    SECTION_PAGE_OFFSET
                );
            },
            [
                sectionCount,
                selectPageByIndex,
            ]
        );

    const selectSection =
        useCallback(
            (
                sectionId: string,
                sectionIndex: number
            ) => {
                const section =
                    sections[sectionIndex];

                if (
                    !section ||
                    section.id !== sectionId
                ) {
                    const resolvedIndex =
                        sections.findIndex(
                            (candidate) =>
                                candidate.id ===
                                sectionId
                        );

                    if (resolvedIndex < 0) {
                        return;
                    }

                    selectSectionByIndex(
                        resolvedIndex
                    );

                    return;
                }

                selectSectionByIndex(
                    sectionIndex
                );
            },
            [
                sections,
                selectSectionByIndex,
            ]
        );

    const selectPreviousSection =
        useCallback(() => {
            if (!hasPreviousSection) {
                return;
            }

            selectPageByIndex(
                selectedIndexRef.current -
                1
            );
        }, [
            hasPreviousSection,
            selectPageByIndex,
        ]);

    const selectNextSection =
        useCallback(() => {
            if (!hasNextSection) {
                return;
            }

            selectPageByIndex(
                selectedIndexRef.current +
                1
            );
        }, [
            hasNextSection,
            selectPageByIndex,
        ]);

    /**
     * Reanimated receives PagerView's native
     * onPageScroll event directly.
     *
     * Unlike a useCallback handler, this does not wait
     * for the event to cross onto the JavaScript thread.
     * SectionSelector can therefore respond to every
     * fractional swipe position.
     */
    const handlePageScroll =
        useEvent<PageScrollEvent>(
            (event) => {
                'worklet';

                pagePosition.value =
                    event.position +
                    event.offset;
            },
            [
                'onPageScroll',
            ]
        );

    const handlePageSelected =
        useCallback(
            (
                event: NativeSyntheticEvent<PageSelectedEvent>
            ) => {
                const nextPageIndex =
                    clampIndex(
                        event.nativeEvent
                            .position,
                        pageCount
                    );

                const previousPageIndex =
                    selectedIndexRef.current;

                const didChange =
                    previousPageIndex !==
                    nextPageIndex;

                selectedIndexRef.current =
                    nextPageIndex;

                requestedIndexRef.current =
                    null;

                /*
                 * Guarantee an exact final value after the
                 * native transition finishes.
                 */
                pagePosition.value =
                    nextPageIndex;

                if (!didChange) {
                    return;
                }

                setSelectedSectionIndex(
                    nextPageIndex
                );

                if (enableHaptics) {
                    void Haptics.selectionAsync();
                }
            },
            [
                enableHaptics,
                pageCount,
                pagePosition,
            ]
        );

    return {
        pagerRef,
        pagePosition,

        selectedSectionIndex,
        selectedSectionId,
        selectedSection,
        isOverviewSelected,

        sectionCount,
        pageCount,
        hasPreviousSection,
        hasNextSection,

        selectOverview,
        selectSection,
        selectSectionByIndex,
        selectPreviousSection,
        selectNextSection,

        handlePageScroll,
        handlePageSelected,
    };
}