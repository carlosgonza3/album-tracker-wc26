import {
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { StickerCard } from '@/components/album/StickerCard';
import { theme } from '@/constants/theme';
import type { StickerWithState } from '@/types/album';

interface StickerGridProps {
    stickers: StickerWithState[];
    invertSwipeDirections: boolean;
    onIncrementSticker: (stickerId: string) => void;
    onDecrementSticker: (stickerId: string) => void;
    header: React.ReactElement;
    contentTopPadding: number;
}
export function StickerGrid({
                                stickers,
                                invertSwipeDirections,
                                onIncrementSticker,
                                onDecrementSticker,
                                header,
                                contentTopPadding,
                            }: StickerGridProps) {
    return (
        <FlatList
            data={stickers}
            keyExtractor={(item) => item.id}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
                styles.content,
                {
                    paddingTop: contentTopPadding,
                },
            ]}
            columnWrapperStyle={styles.row}
            ListHeaderComponent={header}
            ListEmptyComponent={
                <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>
                        No stickers found
                    </Text>

                    <Text style={styles.emptyDescription}>
                        This section does not contain any stickers.
                    </Text>
                </View>
            }
            renderItem={({ item }) => (
                <StickerCard
                    sticker={item}
                    invertSwipeDirections={
                        invertSwipeDirections
                    }
                    onIncrement={() =>
                        onIncrementSticker(item.id)
                    }
                    onDecrement={() =>
                        onDecrementSticker(item.id)
                    }
                />
            )}
        />
    );
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: 130,
    },

    row: {
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },

    emptyState: {
        alignItems: 'center',
        paddingVertical: 64,
        paddingHorizontal: theme.spacing.xl,
    },

    emptyTitle: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.textPrimary,
    },

    emptyDescription: {
        marginTop: theme.spacing.sm,
        textAlign: 'center',
        fontSize: theme.typography.sizes.sm,
        lineHeight: 20,
        color: theme.colors.textSecondary,
    },
});