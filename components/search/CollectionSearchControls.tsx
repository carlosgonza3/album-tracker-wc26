import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { theme } from '@/constants/theme';
import type { CollectionFilter } from '@/utils/collectionSearch';

interface CollectionSearchControlsProps {
    query: string;
    activeFilter: CollectionFilter;
    onChangeQuery: (query: string) => void;
    onChangeFilter: (filter: CollectionFilter) => void;
}

const filters: Array<{
    label: string;
    value: CollectionFilter;
}> = [
    {
        label: 'All',
        value: 'all',
    },
    {
        label: 'Missing',
        value: 'missing',
    },
    {
        label: 'Owned',
        value: 'owned',
    },
    {
        label: 'Repeated',
        value: 'repeated',
    },
    {
        label: 'Foil',
        value: 'foil',
    },
];

export function CollectionSearchControls({
                                             query,
                                             activeFilter,
                                             onChangeQuery,
                                             onChangeFilter,
                                         }: CollectionSearchControlsProps) {
    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>
                    ⌕
                </Text>

                <TextInput
                    value={query}
                    onChangeText={onChangeQuery}
                    placeholder="Search by Sticker Code or Team name"
                    placeholderTextColor={
                        theme.colors.textMuted
                    }
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                    style={styles.input}
                />

                {query.length > 0 ? (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Clear search"
                        hitSlop={10}
                        onPress={() =>
                            onChangeQuery('')
                        }
                        style={({ pressed }) => [
                            styles.clearButton,
                            pressed &&
                            styles.clearButtonPressed,
                        ]}
                    >
                        <Text style={styles.clearText}>
                            ×
                        </Text>
                    </Pressable>
                ) : null}
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={
                    styles.filtersContent
                }
            >
                {filters.map((filter) => {
                    const isActive =
                        activeFilter === filter.value;

                    return (
                        <Pressable
                            key={filter.value}
                            accessibilityRole="button"
                            accessibilityState={{
                                selected: isActive,
                            }}
                            onPress={() =>
                                onChangeFilter(
                                    filter.value
                                )
                            }
                            style={({ pressed }) => [
                                styles.filterButton,
                                isActive &&
                                styles.filterButtonActive,
                                pressed &&
                                styles.filterButtonPressed,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.filterLabel,
                                    isActive &&
                                    styles.filterLabelActive,
                                ]}
                            >
                                {filter.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: theme.spacing.md,
    },

    searchContainer: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.missing,
    },

    searchIcon: {
        marginRight: theme.spacing.sm,
        fontSize: 22,
        color: theme.colors.textMuted,
    },

    input: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textPrimary,
    },

    clearButton: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.surface,
    },

    clearButtonPressed: {
        backgroundColor:
        theme.colors.surfacePressed,
    },

    clearText: {
        marginTop: -2,
        fontSize: 20,
        lineHeight: 22,
        color: theme.colors.textSecondary,
    },

    filtersContent: {
        gap: theme.spacing.sm,
        paddingRight: theme.spacing.xl,
    },

    filterButton: {
        minHeight: 36,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.missing,
    },

    filterButtonActive: {
        borderColor: theme.colors.gold,
        backgroundColor: 'rgba(245, 197, 24, 0.16)',
    },

    filterButtonPressed: {
        backgroundColor:
        theme.colors.surfacePressed,
    },

    filterLabel: {
        fontSize: theme.typography.sizes.sm,
        fontWeight:
        theme.typography.weights.semibold,
        color: theme.colors.textSecondary,
    },

    filterLabelActive: {
        color: theme.colors.gold,
    },
});