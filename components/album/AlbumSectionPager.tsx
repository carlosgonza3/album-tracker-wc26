import {
    memo,
    type Ref,
    useCallback,
} from 'react';

import {
    type FlatList,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
    type ScrollViewProps,
    StyleSheet,
    View,
} from 'react-native';

import PagerView from 'react-native-pager-view';

import Animated, {
    useEvent,
} from 'react-native-reanimated';

import { AlbumOverviewPage } from '@/components/album/AlbumOverviewPage';
import { AlbumSectionPage } from '@/components/album/AlbumSectionPage';
import { theme } from '@/constants/theme';
import type {
    AlbumSection,
    StickerWithState,
} from '@/types/album';

type StickerCollection = Record<
    string,
    number
>;

interface PageSelectedEvent {
    position: number;
}

/**
 * Raw payload exposed by PagerView's native
 * onPageScroll event to Reanimated.
 *
 * This is intentionally not a NativeSyntheticEvent.
 * Reanimated's useEvent handler receives the native
 * payload fields directly.
 */
interface PageScrollEvent {
    position: number;
    offset: number;
}

type SectionList =
    FlatList<StickerWithState>;

type SectionListRefCallback = (
    instance: SectionList | null
) => void;

/**
 * PagerView must be wrapped so the Reanimated event
 * handler can receive onPageScroll on the UI thread.
 */
const AnimatedPagerView =
    Animated.createAnimatedComponent(
        PagerView
    );

/**
 * Actual handler type returned by useEvent in
 * useAlbumNavigation.
 */
type ReanimatedPageScrollHandler =
    ReturnType<
        typeof useEvent<PageScrollEvent>
    >;

/**
 * PagerView's declared prop type does not understand the
 * processed Reanimated event handler, even though it is
 * supported at runtime.
 *
 * We isolate that mismatch to the component boundary.
 */
type AnimatedPagerPageScrollProp =
    React.ComponentProps<
        typeof AnimatedPagerView
    >['onPageScroll'];

interface AlbumSectionPagerProps {
    sections: readonly AlbumSection[];
    collection: StickerCollection;

    pagerRef: React.RefObject<
        PagerView | null
    >;

    /**
     * Pager index including Overview.
     *
     * 0 = Overview
     * 1 = first album section
     * 2 = second album section
     */
    selectedIndex: number;

    initialPage?: number;

    topSpacerHeight: number;
    invertSwipeDirections: boolean;

    onIncrementSticker: (
        stickerId: string
    ) => void;

    onDecrementSticker: (
        stickerId: string
    ) => void;

    /**
     * Reanimated handler returned by useEvent.
     */
    onPageScroll:
        ReanimatedPageScrollHandler;

    onPageSelected: (
        event: NativeSyntheticEvent<PageSelectedEvent>
    ) => void;

    onSectionSelected?: (
        sectionId: string,
        sectionIndex: number
    ) => void;

    onOverviewSelected?: () => void;

    onSelectSection: (
        sectionId: string,
        sectionIndex: number
    ) => void;

    getSectionListRef: (
        sectionId: string
    ) => SectionListRefCallback;

    overviewListRef?: Ref<
        FlatList<AlbumSection>
    >;

    onVerticalScroll?:
        ScrollViewProps['onScroll'];

    verticalScrollEventThrottle?: number;

    snapToOffsets?: number[];

    onVerticalScrollBeginDrag?: (
        event: NativeSyntheticEvent<NativeScrollEvent>
    ) => void;

    onVerticalScrollEndDrag?: (
        event: NativeSyntheticEvent<NativeScrollEvent>
    ) => void;

    onVerticalMomentumEnd?: (
        event: NativeSyntheticEvent<NativeScrollEvent>
    ) => void;
}

const ACTIVE_PAGE_RADIUS = 1;
const OVERVIEW_PAGE_INDEX = 0;
const SECTION_PAGE_OFFSET = 1;

function isPageWithinActiveWindow(
    pageIndex: number,
    selectedIndex: number
): boolean {
    return (
        Math.abs(
            pageIndex - selectedIndex
        ) <= ACTIVE_PAGE_RADIUS
    );
}

function AlbumSectionPlaceholder() {
    return (
        <View
            collapsable={false}
            style={styles.page}
        />
    );
}

function AlbumSectionPagerComponent({
                                        sections,
                                        collection,
                                        pagerRef,
                                        selectedIndex,
                                        initialPage = OVERVIEW_PAGE_INDEX,
                                        topSpacerHeight,
                                        invertSwipeDirections,
                                        onIncrementSticker,
                                        onDecrementSticker,
                                        onPageScroll,
                                        onPageSelected,
                                        onSectionSelected,
                                        onOverviewSelected,
                                        onSelectSection,
                                        getSectionListRef,
                                        overviewListRef,
                                        onVerticalScroll,
                                        verticalScrollEventThrottle = 16,
                                        snapToOffsets,
                                        onVerticalScrollBeginDrag,
                                        onVerticalScrollEndDrag,
                                        onVerticalMomentumEnd,
                                    }: AlbumSectionPagerProps) {
    const handlePageSelected =
        useCallback(
            (
                event: NativeSyntheticEvent<PageSelectedEvent>
            ) => {
                onPageSelected(event);

                const nextPagerIndex =
                    event.nativeEvent.position;

                if (
                    nextPagerIndex ===
                    OVERVIEW_PAGE_INDEX
                ) {
                    onOverviewSelected?.();
                    return;
                }

                const sectionIndex =
                    nextPagerIndex -
                    SECTION_PAGE_OFFSET;

                const nextSection =
                    sections[sectionIndex];

                if (
                    nextSection &&
                    onSectionSelected
                ) {
                    onSectionSelected(
                        nextSection.id,
                        sectionIndex
                    );
                }
            },
            [
                onOverviewSelected,
                onPageSelected,
                onSectionSelected,
                sections,
            ]
        );

    const isOverviewActive =
        selectedIndex ===
        OVERVIEW_PAGE_INDEX;

    return (
        <View style={styles.container}>
            <AnimatedPagerView
                ref={pagerRef}
                style={styles.pager}
                initialPage={initialPage}
                orientation="horizontal"
                scrollEnabled
                pageMargin={8}
                overScrollMode="never"
                offscreenPageLimit={
                    ACTIVE_PAGE_RADIUS
                }
                onPageScroll={
                    onPageScroll as unknown as
                        AnimatedPagerPageScrollProp
                }
                onPageSelected={
                    handlePageSelected
                }
            >
                <View
                    key="album-overview"
                    collapsable={false}
                    style={styles.page}
                >
                    <AlbumOverviewPage
                        ref={overviewListRef}
                        sections={sections}
                        collection={collection}
                        topSpacerHeight={
                            topSpacerHeight
                        }
                        onSelectSection={
                            onSelectSection
                        }
                        onScroll={
                            isOverviewActive
                                ? onVerticalScroll
                                : undefined
                        }
                        scrollEventThrottle={
                            verticalScrollEventThrottle
                        }
                        snapToOffsets={
                            snapToOffsets
                        }
                        onScrollBeginDrag={
                            isOverviewActive
                                ? onVerticalScrollBeginDrag
                                : undefined
                        }
                        onScrollEndDrag={
                            isOverviewActive
                                ? onVerticalScrollEndDrag
                                : undefined
                        }
                        onMomentumScrollEnd={
                            isOverviewActive
                                ? onVerticalMomentumEnd
                                : undefined
                        }
                    />
                </View>

                {sections.map(
                    (
                        section,
                        sectionIndex
                    ) => {
                        const pagerIndex =
                            sectionIndex +
                            SECTION_PAGE_OFFSET;

                        const shouldRenderPage =
                            isPageWithinActiveWindow(
                                pagerIndex,
                                selectedIndex
                            );

                        if (!shouldRenderPage) {
                            return (
                                <View
                                    key={
                                        section.id
                                    }
                                    collapsable={
                                        false
                                    }
                                    style={
                                        styles.page
                                    }
                                >
                                    <AlbumSectionPlaceholder />
                                </View>
                            );
                        }

                        const isActivePage =
                            pagerIndex ===
                            selectedIndex;

                        return (
                            <View
                                key={section.id}
                                collapsable={false}
                                style={styles.page}
                            >
                                <AlbumSectionPage
                                    section={section}
                                    sectionIndex={sectionIndex}
                                    collection={collection}
                                    topSpacerHeight={topSpacerHeight}
                                    invertSwipeDirections={
                                        invertSwipeDirections
                                    }
                                    listRef={
                                        getSectionListRef(section.id)
                                    }
                                    onIncrementSticker={
                                        onIncrementSticker
                                    }
                                    onDecrementSticker={
                                        onDecrementSticker
                                    }
                                    onScroll={
                                        isActivePage
                                            ? onVerticalScroll
                                            : undefined
                                    }
                                    scrollEventThrottle={
                                        verticalScrollEventThrottle
                                    }
                                    snapToOffsets={
                                        snapToOffsets
                                    }
                                    onScrollBeginDrag={
                                        isActivePage
                                            ? onVerticalScrollBeginDrag
                                            : undefined
                                    }
                                    onScrollEndDrag={
                                        isActivePage
                                            ? onVerticalScrollEndDrag
                                            : undefined
                                    }
                                    onMomentumScrollEnd={
                                        isActivePage
                                            ? onVerticalMomentumEnd
                                            : undefined
                                    }
                                />
                            </View>
                        );
                    }
                )}
            </AnimatedPagerView>
        </View>
    );
}

function areNumberArraysEqual(
    previous?: number[],
    next?: number[]
): boolean {
    if (previous === next) {
        return true;
    }

    if (
        !previous ||
        !next ||
        previous.length !== next.length
    ) {
        return false;
    }

    return previous.every(
        (value, index) =>
            value === next[index]
    );
}

function areAlbumSectionPagerPropsEqual(
    previous: AlbumSectionPagerProps,
    next: AlbumSectionPagerProps
): boolean {
    return (
        previous.sections ===
        next.sections &&
        previous.collection ===
        next.collection &&
        previous.pagerRef ===
        next.pagerRef &&
        previous.selectedIndex ===
        next.selectedIndex &&
        previous.initialPage ===
        next.initialPage &&
        previous.topSpacerHeight ===
        next.topSpacerHeight &&
        previous.invertSwipeDirections ===
        next.invertSwipeDirections &&
        previous.onIncrementSticker ===
        next.onIncrementSticker &&
        previous.onDecrementSticker ===
        next.onDecrementSticker &&
        previous.onPageScroll ===
        next.onPageScroll &&
        previous.onPageSelected ===
        next.onPageSelected &&
        previous.onSectionSelected ===
        next.onSectionSelected &&
        previous.onOverviewSelected ===
        next.onOverviewSelected &&
        previous.onSelectSection ===
        next.onSelectSection &&
        previous.getSectionListRef ===
        next.getSectionListRef &&
        previous.overviewListRef ===
        next.overviewListRef &&
        previous.onVerticalScroll ===
        next.onVerticalScroll &&
        previous
            .verticalScrollEventThrottle ===
        next
            .verticalScrollEventThrottle &&
        areNumberArraysEqual(
            previous.snapToOffsets,
            next.snapToOffsets
        ) &&
        previous.onVerticalScrollBeginDrag ===
        next.onVerticalScrollBeginDrag &&
        previous.onVerticalScrollEndDrag ===
        next.onVerticalScrollEndDrag &&
        previous.onVerticalMomentumEnd ===
        next.onVerticalMomentumEnd
    );
}

export const AlbumSectionPager = memo(
    AlbumSectionPagerComponent,
    areAlbumSectionPagerPropsEqual
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
        backgroundColor:
        theme.colors.background,
    },

    pager: {
        flex: 1,
    },

    page: {
        flex: 1,
        backgroundColor:
        theme.colors.background,
    },
});