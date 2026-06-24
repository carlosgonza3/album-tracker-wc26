import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { theme } from '@/constants/theme';

export type CollectionQuickFilter =
    | 'missing'
    | 'owned'
    | 'repeated';

interface CollectionSummaryCardsProps {
    missingCount: number;
    ownedCount: number;
    repeatedCount: number;
    tradeCopiesCount: number;
    activeFilter?: CollectionQuickFilter | null;
    selectAll?: boolean;
    onSelectFilter: (
        filter: CollectionQuickFilter
    ) => void;
}

export function CollectionSummaryCards({
                                           missingCount,
                                           ownedCount,
                                           repeatedCount,
                                           tradeCopiesCount,
                                           activeFilter = null,
                                           selectAll = false,
                                           onSelectFilter,
                                       }: CollectionSummaryCardsProps) {
    return (
        <View style={styles.container}>
            <SummaryCard
                label="Missing"
                value={missingCount}
                caption="Still needed"
                active={
                    selectAll ||
                    activeFilter === 'missing'
                }
                onPress={() =>
                    onSelectFilter('missing')
                }
            />

            <SummaryCard
                label="Owned"
                value={ownedCount}
                caption="Unique stickers"
                active={
                    selectAll ||
                    activeFilter === 'owned'
                }
                onPress={() =>
                    onSelectFilter('owned')
                }
            />

            <SummaryCard
                label="Duplicates"
                value={tradeCopiesCount}
                caption={
                    repeatedCount === 1
                        ? '1 repeated sticker'
                        : `${repeatedCount} repeated stickers`
                }
                active={
                    selectAll ||
                    activeFilter === 'repeated'
                }
                onPress={() =>
                    onSelectFilter('repeated')
                }
            />
        </View>
    );
}

interface SummaryCardProps {
    label: string;
    value: number;
    caption: string;
    active: boolean;
    onPress: () => void;
}

function SummaryCard({
                         label,
                         value,
                         caption,
                         active,
                         onPress,
                     }: SummaryCardProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{
                selected: active,
            }}
            onPress={onPress}
            style={({ pressed }) => [
                styles.card,
                active && styles.cardActive,
                pressed && styles.cardPressed,
            ]}
        >
            <View style={styles.cardHeader}>
                <Text
                    style={[
                        styles.label,
                        active && styles.labelActive,
                    ]}
                >
                    {label}
                </Text>

                <View
                    style={[
                        styles.indicator,
                        active &&
                        styles.indicatorActive,
                    ]}
                />
            </View>

            <Text
                style={[
                    styles.value,
                    active && styles.valueActive,
                ]}
            >
                {value}
            </Text>

            <Text
                numberOfLines={2}
                style={[
                    styles.caption,
                    active && styles.captionActive,
                ]}
            >
                {caption}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },

    card: {
        flex: 1,
        minHeight: 118,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.missing,
    },

    cardActive: {
        borderColor: theme.colors.gold,
        backgroundColor: 'rgba(245, 197, 24, 0.14)',
    },

    cardPressed: {
        backgroundColor:
        theme.colors.surfacePressed,
    },

    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.xs,
    },

    label: {
        flexShrink: 1,
        fontSize: theme.typography.sizes.sm,
        fontWeight:
        theme.typography.weights.semibold,
        color: theme.colors.textSecondary,
    },

    labelActive: {
        color: theme.colors.gold,
    },

    indicator: {
        width: 7,
        height: 7,
        borderRadius: theme.radius.full,
        backgroundColor:
        theme.colors.borderStrong,
    },

    indicatorActive: {
        backgroundColor: theme.colors.gold,
    },

    value: {
        marginTop: theme.spacing.md,
        fontSize: theme.typography.sizes.xxl,
        fontWeight:
        theme.typography.weights.bold,
        color: theme.colors.textPrimary,
    },

    valueActive: {
        color: theme.colors.gold,
    },

    caption: {
        marginTop: theme.spacing.xs,
        fontSize: theme.typography.sizes.xs,
        lineHeight: 16,
        color: theme.colors.textMuted,
    },

    captionActive: {
        color: theme.colors.textSecondary,
    },
});