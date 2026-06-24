import { StyleSheet, Text, View } from 'react-native';

import albumData from '@/assets/data/album.json';
import { theme } from '@/constants/theme';

export default function AlbumScreen() {
    const totalSections = albumData.sections.length;

    const totalStickers = albumData.sections.reduce(
        (total, section) => total + section.stickers.length,
        0
    );

    return (
        <View style={styles.screen}>
            <Text style={styles.eyebrow}>WORLD CUP 2026</Text>
            <Text style={styles.title}>My Album</Text>

            <Text style={styles.description}>
                {totalSections} sections and {totalStickers} stickers loaded.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
    },

    eyebrow: {
        fontSize: theme.typography.sizes.xs,
        fontWeight: theme.typography.weights.bold,
        letterSpacing: 1.8,
        color: theme.colors.gold,
    },

    title: {
        marginTop: theme.spacing.xs,
        fontSize: theme.typography.sizes.display,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.textPrimary,
    },

    description: {
        marginTop: theme.spacing.md,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textSecondary,
    },
});