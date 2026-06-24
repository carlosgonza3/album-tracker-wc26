import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
} from 'react-native';

import { theme } from '@/constants/theme';
import type { AlbumSection } from '@/types/album';

interface SectionSelectorProps {
    sections: AlbumSection[];
    selectedSectionId: string;
    onSelectSection: (sectionId: string) => void;
}

export function SectionSelector({
                                    sections,
                                    selectedSectionId,
                                    onSelectSection,
                                }: SectionSelectorProps) {
    return (
        <FlatList
            horizontal
            data={sections}
            keyExtractor={(section) => section.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.content}
            renderItem={({ item }) => {
                const isSelected =
                    item.id === selectedSectionId;

                return (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityState={{
                            selected: isSelected,
                        }}
                        accessibilityLabel={`Open ${item.name} section`}
                        onPress={() =>
                            onSelectSection(item.id)
                        }
                        style={({ pressed }) => [
                            styles.pill,
                            isSelected && styles.pillSelected,
                            pressed && styles.pillPressed,
                        ]}
                    >
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.label,
                                isSelected &&
                                styles.labelSelected,
                            ]}
                        >
                            {item.name}
                        </Text>
                    </Pressable>
                );
            }}
        />
    );
}

const styles = StyleSheet.create({
    content: {
        gap: theme.spacing.sm,
        paddingRight: theme.spacing.lg,
    },

    pill: {
        minHeight: 40,
        maxWidth: 190,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.surface,
    },

    pillSelected: {
        borderColor: theme.colors.gold,
        backgroundColor: theme.colors.gold,
    },

    pillPressed: {
        opacity: 0.72,
    },

    label: {
        fontSize: theme.typography.sizes.sm,
        fontWeight: theme.typography.weights.medium,
        color: theme.colors.textSecondary,
    },

    labelSelected: {
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.textInverse,
    },
});