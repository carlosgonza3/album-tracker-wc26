import {
    memo,
    type ReactElement,
    type Ref,
    useMemo,
} from 'react';

import {
    type FlatList,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
    type ScrollViewProps,
    StyleSheet,
    View,
} from 'react-native';

import {
    AlbumSectionPageHeader,
} from '@/components/album/section/AlbumSectionPageHeader';

import {
    STICKER_COLUMNS,
    StickerGrid,
} from '@/components/album/sticker/StickerGrid';

import { theme } from '@/constants/theme';

import type {
    AlbumSection,
    StickerWithState,
} from '@/types/album';

import {
    attachStickerState,
} from '@/utils/stickerState';

type StickerCollection = Record<
    string,
    number
>;

interface AlbumSectionPageProps {
    section: AlbumSection;

    /**
     * Zero-based index within the album sections array.
     *
     * 0 = Panini
     * 1 = FIFA World Cup
     */
    sectionIndex: number;

    collection: StickerCollection;

    topSpacerHeight: number;

    invertSwipeDirections: boolean;

    listRef?: Ref<
        FlatList<StickerWithState>
    >;

    onIncrementSticker: (
        stickerId: string
    ) => void;

    onDecrementSticker: (
        stickerId: string
    ) => void;

    onScroll?: ScrollViewProps['onScroll'];

    scrollEventThrottle?: number;

    snapToOffsets?: number[];

    onScrollBeginDrag?: (
        event:
        NativeSyntheticEvent<
            NativeScrollEvent
        >
    ) => void;

    onScrollEndDrag?: (
        event:
        NativeSyntheticEvent<
            NativeScrollEvent
        >
    ) => void;

    onMomentumScrollEnd?: (
        event:
        NativeSyntheticEvent<
            NativeScrollEvent
        >
    ) => void;
}

interface SectionSummary {
    uniqueOwned: number;
    totalStickers: number;
    completionPercentage: number;
}

function normalizeCopies(
    copies: number | undefined
): number {
    if (
        copies === undefined ||
        !Number.isFinite(copies)
    ) {
        return 0;
    }

    return Math.max(
        0,
        Math.floor(copies)
    );
}

function calculateSectionSummary(
    section: AlbumSection,
    collection: StickerCollection
): SectionSummary {
    const totalStickers =
        section.stickers.length;

    const uniqueOwned =
        section.stickers.reduce(
            (
                total,
                sticker
            ) => {
                const copies =
                    normalizeCopies(
                        collection[
                            sticker.id
                            ]
                    );

                return (
                    total +
                    (
                        copies > 0
                            ? 1
                            : 0
                    )
                );
            },
            0
        );

    const completionPercentage =
        totalStickers > 0
            ? (
            uniqueOwned /
            totalStickers
        ) * 100
            : 0;

    return {
        uniqueOwned,
        totalStickers,
        completionPercentage,
    };
}

function AlbumSectionPageComponent({
                                       section,
                                       sectionIndex,
                                       collection,
                                       topSpacerHeight,
                                       invertSwipeDirections,
                                       listRef,
                                       onIncrementSticker,
                                       onDecrementSticker,
                                       onScroll,
                                       scrollEventThrottle = 16,
                                       snapToOffsets,
                                       onScrollBeginDrag,
                                       onScrollEndDrag,
                                       onMomentumScrollEnd,
                                   }: AlbumSectionPageProps) {
    const stickers =
        useMemo(
            () =>
                section.stickers.map(
                    (sticker) =>
                        attachStickerState(
                            {
                                ...sticker,

                                sectionId:
                                section.id,

                                sectionName:
                                section.name,

                                federation:
                                section.federation,
                            },
                            collection
                        )
                ),
            [
                collection,
                section,
            ]
        );

    const summary =
        useMemo(
            () =>
                calculateSectionSummary(
                    section,
                    collection
                ),
            [
                collection,
                section,
            ]
        );

    /*
     * Sections containing only one sticker row do not have
     * enough content to reach the normal collapsed snap
     * position. This invisible footer supplies the missing
     * scrollable height without changing the visible gap
     * between the section header and its sticker cards.
     */
    const shortSectionFooter =
        useMemo<
            ReactElement | null
        >(() => {
            if (
                summary.totalStickers >
                STICKER_COLUMNS
            ) {
                return null;
            }

            return (
                <View
                    pointerEvents="none"
                    style={{
                        height:
                        topSpacerHeight,
                    }}
                />
            );
        }, [
            summary.totalStickers,
            topSpacerHeight,
        ]);

    const listHeader =
        useMemo<ReactElement>(
            () => (
                <View>
                    <View
                        pointerEvents="none"
                        style={{
                            height:
                            topSpacerHeight,
                        }}
                    />

                    <AlbumSectionPageHeader
                        section={section}
                        sectionIndex={
                            sectionIndex
                        }
                        name={
                            section.name
                        }
                        federation={
                            section.federation
                        }
                        owned={
                            summary.uniqueOwned
                        }
                        total={
                            summary.totalStickers
                        }
                        percentage={
                            summary
                                .completionPercentage
                        }
                    />
                </View>
            ),
            [
                section,
                sectionIndex,
                summary.completionPercentage,
                summary.totalStickers,
                summary.uniqueOwned,
                topSpacerHeight,
            ]
        );

    return (
        <View
            collapsable={false}
            style={styles.page}
        >
            <StickerGrid
                ref={listRef}
                stickers={stickers}
                invertSwipeDirections={
                    invertSwipeDirections
                }
                onIncrementSticker={
                    onIncrementSticker
                }
                onDecrementSticker={
                    onDecrementSticker
                }
                header={listHeader}
                footer={
                    shortSectionFooter
                }
                contentTopPadding={0}
                onScroll={onScroll}
                scrollEventThrottle={
                    scrollEventThrottle
                }
                snapToOffsets={
                    snapToOffsets
                }
                onScrollBeginDrag={
                    onScrollBeginDrag
                }
                onScrollEndDrag={
                    onScrollEndDrag
                }
                onMomentumScrollEnd={
                    onMomentumScrollEnd
                }
            />
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
        previous.length !==
        next.length
    ) {
        return false;
    }

    return previous.every(
        (
            value,
            index
        ) =>
            value ===
            next[index]
    );
}

function hasSectionCollectionChanged(
    section: AlbumSection,
    previousCollection:
    StickerCollection,
    nextCollection:
    StickerCollection
): boolean {
    return section.stickers.some(
        (sticker) =>
            normalizeCopies(
                previousCollection[
                    sticker.id
                    ]
            ) !==
            normalizeCopies(
                nextCollection[
                    sticker.id
                    ]
            )
    );
}

function areAlbumSectionPagePropsEqual(
    previous: AlbumSectionPageProps,
    next: AlbumSectionPageProps
): boolean {
    if (
        previous.section.id !==
        next.section.id ||
        previous.section.name !==
        next.section.name ||
        previous.section.federation !==
        next.section.federation ||
        previous.section.stickers.length !==
        next.section.stickers.length ||
        previous.sectionIndex !==
        next.sectionIndex
    ) {
        return false;
    }

    if (
        hasSectionCollectionChanged(
            previous.section,
            previous.collection,
            next.collection
        )
    ) {
        return false;
    }

    return (
        previous.topSpacerHeight ===
        next.topSpacerHeight &&
        previous.invertSwipeDirections ===
        next.invertSwipeDirections &&
        previous.listRef ===
        next.listRef &&
        previous.onIncrementSticker ===
        next.onIncrementSticker &&
        previous.onDecrementSticker ===
        next.onDecrementSticker &&
        previous.onScroll ===
        next.onScroll &&
        previous.scrollEventThrottle ===
        next.scrollEventThrottle &&
        previous.onScrollBeginDrag ===
        next.onScrollBeginDrag &&
        previous.onScrollEndDrag ===
        next.onScrollEndDrag &&
        previous.onMomentumScrollEnd ===
        next.onMomentumScrollEnd &&
        areNumberArraysEqual(
            previous.snapToOffsets,
            next.snapToOffsets
        )
    );
}

export const AlbumSectionPage =
    memo(
        AlbumSectionPageComponent,
        areAlbumSectionPagePropsEqual
    );

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor:
        theme.colors.background,
    },
});