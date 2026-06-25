import {
    forwardRef,
    memo,
    type ReactElement,
    useCallback,
} from 'react';

import {
    FlatList,
    type ListRenderItem,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
    type ScrollViewProps,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Animated from 'react-native-reanimated';

import { StickerCard } from '@/components/album/sticker/StickerCard';

import { theme } from '@/constants/theme';

import type { StickerWithState } from '@/types/album';

interface StickerGridProps {

    header?: ReactElement | null;
    footer?: ReactElement | null;
    stickers: StickerWithState[];

    invertSwipeDirections: boolean;

    onIncrementSticker: (
        stickerId: string
    ) => void;

    onDecrementSticker: (
        stickerId: string
    ) => void;

    contentTopPadding?: number;
    contentBottomPadding?: number;

    onScroll?: ScrollViewProps['onScroll'];
    scrollEventThrottle?: number;

    snapToOffsets?: number[];

    onScrollBeginDrag?: (
        event: NativeSyntheticEvent<NativeScrollEvent>
    ) => void;

    onScrollEndDrag?: (
        event: NativeSyntheticEvent<NativeScrollEvent>
    ) => void;

    onMomentumScrollEnd?: (
        event: NativeSyntheticEvent<NativeScrollEvent>
    ) => void;
}

export const STICKER_COLUMNS = 3

function StickerGridComponent(
    {
        stickers,
        invertSwipeDirections,
        onIncrementSticker,
        onDecrementSticker,
        header = null,
        contentTopPadding = 0,
        footer,

        /*
         * The bottom navigation already occupies its own
         * layout space, so the grid only needs a small
         * visual gap beneath the final sticker row.
         */
        contentBottomPadding =
        theme.spacing.xl,

        onScroll,
        scrollEventThrottle = 16,
        snapToOffsets,
        onScrollBeginDrag,
        onScrollEndDrag,
        onMomentumScrollEnd,
    }: StickerGridProps,
    ref: React.ForwardedRef<
        FlatList<StickerWithState>
    >
) {
    const keyExtractor = useCallback(
        (item: StickerWithState) =>
            item.id,
        []
    );

    const renderSticker = useCallback<
        ListRenderItem<StickerWithState>
    >(
        ({ item }) => (
            <StickerCard
                sticker={item}
                invertSwipeDirections={
                    invertSwipeDirections
                }
                onIncrementSticker={
                    onIncrementSticker
                }
                onDecrementSticker={
                    onDecrementSticker
                }
            />
        ),
        [
            invertSwipeDirections,
            onDecrementSticker,
            onIncrementSticker,
        ]
    );

    return (
        <Animated.FlatList<StickerWithState>
            ref={ref}
            style={styles.list}
            data={stickers}
            ListFooterComponent={
                footer
            }
            keyExtractor={keyExtractor}
            renderItem={renderSticker}
            numColumns={STICKER_COLUMNS}
            columnWrapperStyle={styles.row}
            ListHeaderComponent={header}
            ListEmptyComponent={
                <EmptyStickerGrid />
            }
            contentContainerStyle={[
                styles.content,
                {
                    paddingTop:
                    contentTopPadding,
                    paddingBottom:
                    contentBottomPadding,
                },
            ]}
            showsVerticalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={
                scrollEventThrottle
            }
            snapToOffsets={snapToOffsets}
            snapToStart
            snapToEnd={false}
            decelerationRate="fast"
            onScrollBeginDrag={
                onScrollBeginDrag
            }
            onScrollEndDrag={
                onScrollEndDrag
            }
            onMomentumScrollEnd={
                onMomentumScrollEnd
            }
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="never"
            overScrollMode="never"
            bounces={false}
            alwaysBounceVertical={false}
            initialNumToRender={9}
            maxToRenderPerBatch={9}
            updateCellsBatchingPeriod={16}
            windowSize={5}
            removeClippedSubviews={false}
        />
    );
}

const EmptyStickerGrid = memo(
    function EmptyStickerGrid() {
        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>
                    No stickers found
                </Text>

                <Text
                    style={
                        styles.emptyDescription
                    }
                >
                    This section does not contain any
                    stickers.
                </Text>
            </View>
        );
    }
);

const ForwardedStickerGrid =
    forwardRef<
        FlatList<StickerWithState>,
        StickerGridProps
    >(StickerGridComponent);

ForwardedStickerGrid.displayName =
    'StickerGrid';

export const StickerGrid = memo(
    ForwardedStickerGrid
);

const styles = StyleSheet.create({
    list: {
        flex: 1,
        backgroundColor:
        theme.colors.background,
    },

    content: {
        flexGrow: 1,
        paddingHorizontal:
        theme.spacing.lg,
    },

    row: {
        gap: theme.spacing.sm,
        marginBottom:
        theme.spacing.sm,
    },

    emptyState: {
        alignItems: 'center',
        paddingVertical: 64,
        paddingHorizontal:
        theme.spacing.xl,
    },

    emptyTitle: {
        fontSize:
        theme.typography.sizes.lg,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    emptyDescription: {
        marginTop:
        theme.spacing.sm,
        textAlign: 'center',
        fontSize:
        theme.typography.sizes.sm,
        lineHeight: 20,
        color:
        theme.colors.textSecondary,
    },
});