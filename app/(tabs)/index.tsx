import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import { albumCatalogue } from '@/data/albumCatalogue';
import { getAlbumSummary } from '@/utils/albumStats';

const summary = getAlbumSummary(albumCatalogue);

export default function AlbumScreen() {
    return (
        <View style={styles.screen}>
            <Text style={styles.eyebrow}>
                WORLD CUP 2026
            </Text>

            <Text style={styles.title}>
                {albumCatalogue.name}
            </Text>

            <View style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                    <Text style={styles.value}>
                        {summary.totalSections}
                    </Text>
                    <Text style={styles.label}>Sections</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.summaryItem}>
                    <Text style={styles.value}>
                        {summary.totalStickers}
                    </Text>
                    <Text style={styles.label}>Stickers</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.summaryItem}>
                    <Text style={styles.value}>
                        {summary.foilStickers}
                    </Text>
                    <Text style={styles.label}>Foils</Text>
                </View>
            </View>

            <Text style={styles.version}>
                Catalogue version {albumCatalogue.version}
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
        marginTop: theme.spacing.sm,
        fontSize: theme.typography.sizes.display,
        fontWeight: theme.typography.weights.bold,
        lineHeight: 42,
        color: theme.colors.textPrimary,
    },

    summaryCard: {
        marginTop: theme.spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
        paddingHorizontal: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.surface,
    },

    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },

    value: {
        fontSize: theme.typography.sizes.xxl,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.textPrimary,
    },

    label: {
        marginTop: theme.spacing.xs,
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textSecondary,
    },

    divider: {
        width: 1,
        height: 42,
        backgroundColor: theme.colors.border,
    },

    version: {
        marginTop: theme.spacing.lg,
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textMuted,
    },
});