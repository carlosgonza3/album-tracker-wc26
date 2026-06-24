import {
    FlatList,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {
    useCallback,
    useRef,
} from 'react';

import { CollectionStickerResultCard } from '@/components/search/CollectionStickerResultCard';
import { theme } from '@/constants/theme';
import type { CollectionStickerResult } from '@/utils/collectionSearch';

interface CollectionStickerResultsProps {
    title: string;
    stickers: CollectionStickerResult[];
    query: string;
    onPressSticker: (
        sticker: CollectionStickerResult
    ) => void;
    onCollapseChange?: (
        collapsed: boolean
    ) => void;
}

const COLLAPSE_THRESHOLD = 28;
const EXPAND_THRESHOLD = 2;
const MIN_DRAG_DISTANCE = 10;

export function CollectionStickerResults({
                                             title,
                                             stickers,
                                             query,
                                             onPressSticker,
                                             onCollapseChange,
                                         }: CollectionStickerResultsProps) {
    const isCollapsedRef = useRef(false);

    const dragStartOffsetRef = useRef(0);

    const canCollapseRef = useRef(true);

    const handleScrollBeginDrag = useCallback(
        (
            event: NativeSyntheticEvent<
                NativeScrollEvent
            >
        ) => {
            dragStartOffsetRef.current =
                event.nativeEvent.contentOffset.y;

            /*
             * A fresh gesture may collapse the header again.
             *
             * This prevents the layout shift caused by expanding
             * from immediately collapsing it a second time.
             */
            canCollapseRef.current = true;
        },
        []
    );

    const handleScroll = useCallback(
        (
            event: NativeSyntheticEvent<
                NativeScrollEvent
            >
        ) => {
            if (!onCollapseChange) {
                return;
            }

            const offsetY = Math.max(
                0,
                event.nativeEvent.contentOffset.y
            );

            /*
             * Expand only when the list genuinely returns
             * to its top.
             */
            if (
                isCollapsedRef.current &&
                offsetY <= EXPAND_THRESHOLD
            ) {
                isCollapsedRef.current = false;

                /*
                 * Ignore layout-generated offset changes until
                 * the user begins a new drag.
                 */
                canCollapseRef.current = false;

                onCollapseChange(false);
                return;
            }

            const draggedDistance =
                offsetY -
                dragStartOffsetRef.current;

            /*
             * Collapse only during a fresh downward scroll,
             * not because expanding changed the layout.
             */
            if (
                !isCollapsedRef.current &&
                canCollapseRef.current &&
                offsetY >= COLLAPSE_THRESHOLD &&
                draggedDistance >= MIN_DRAG_DISTANCE
            ) {
                isCollapsedRef.current = true;
                onCollapseChange(true);
            }
        },
        [onCollapseChange]
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    {title}
                </Text>

                <View style={styles.countBadge}>
                    <Text style={styles.countText}>
                        {stickers.length}
                    </Text>
                </View>
            </View>

            <FlatList
                data={stickers}
                keyExtractor={(sticker) =>
                    sticker.id
                }
                renderItem={({ item }) => (
                    <CollectionStickerResultCard
                        sticker={item}
                        onPress={onPressSticker}
                    />
                )}
                contentContainerStyle={[
                    styles.listContent,
                    stickers.length === 0 &&
                    styles.emptyListContent,
                ]}
                ItemSeparatorComponent={
                    StickerSeparator
                }
                ListEmptyComponent={
                    <CollectionEmptyState
                        hasQuery={
                            query.trim().length > 0
                        }
                    />
                }
                onScrollBeginDrag={
                    handleScrollBeginDrag
                }
                onScroll={handleScroll}
                scrollEventThrottle={16}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
                initialNumToRender={12}
                maxToRenderPerBatch={12}
                windowSize={7}
                removeClippedSubviews
            />
        </View>
    );
}

function StickerSeparator() {
    return (
        <View style={styles.separator} />
    );
}

interface CollectionEmptyStateProps {
    hasQuery: boolean;
}

function CollectionEmptyState({
                                  hasQuery,
                              }: CollectionEmptyStateProps) {
    return (
        <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>
                    ⌕
                </Text>
            </View>

            <Text style={styles.emptyTitle}>
                {hasQuery
                    ? 'No matching stickers'
                    : 'No stickers found'}
            </Text>

            <Text style={styles.emptyDescription}>
                {hasQuery
                    ? 'Try another sticker number, player, team, or section.'
                    : 'There are no stickers in the selected category.'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: 0,
        marginTop: theme.spacing.lg,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.md,
    },

    title: {
        flex: 1,
        fontSize: theme.typography.sizes.lg,
        fontWeight:
        theme.typography.weights.bold,
        color: theme.colors.textPrimary,
    },

    countBadge: {
        minWidth: 34,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: theme.colors.gold,
        borderRadius: theme.radius.full,
        backgroundColor:
            'rgba(245, 197, 24, 0.14)',
    },

    countText: {
        fontSize: theme.typography.sizes.sm,
        fontWeight:
        theme.typography.weights.bold,
        color: theme.colors.gold,
    },

    listContent: {
        paddingBottom:
            theme.spacing.xl * 2,
    },

    emptyListContent: {
        flexGrow: 1,
    },

    separator: {
        height: theme.spacing.md,
    },

    emptyState: {
        flex: 1,
        minHeight: 220,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.xl,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        backgroundColor:
        theme.colors.missing,
    },

    emptyIcon: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.full,
        backgroundColor:
        theme.colors.surface,
    },

    emptyIconText: {
        fontSize: 26,
        color: theme.colors.textMuted,
    },

    emptyTitle: {
        marginTop: theme.spacing.md,
        fontSize: theme.typography.sizes.lg,
        fontWeight:
        theme.typography.weights.bold,
        color: theme.colors.textPrimary,
    },

    emptyDescription: {
        maxWidth: 320,
        marginTop: theme.spacing.sm,
        textAlign: 'center',
        fontSize: theme.typography.sizes.sm,
        lineHeight: 20,
        color: theme.colors.textSecondary,
    },
});