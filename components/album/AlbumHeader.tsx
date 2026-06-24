import { StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { theme } from '@/constants/theme';

interface AlbumHeaderProps {
    owned: number;
    total: number;
    percentage: number;
}

export function AlbumHeader({
                                owned,
                                total,
                                percentage,
                            }: AlbumHeaderProps) {
    return (
        <View>
            <Text style={styles.eyebrow}>
                WORLD CUP 2026
            </Text>

            <Text style={styles.title}>
                My Album
            </Text>

            <Text style={styles.subtitle}>
                Track your collection, missing stickers, and duplicates.
            </Text>

            <View style={styles.progressCard}>
                <View style={styles.progressTopRow}>
                    <View>
                        <Text style={styles.progressLabel}>
                            Album progress
                        </Text>

                        <Text style={styles.progressValue}>
                            {owned} of {total}
                        </Text>
                    </View>

                    <Text style={styles.percentage}>
                        {Math.round(percentage)}%
                    </Text>
                </View>

                <ProgressBar
                    progress={percentage}
                    height={9}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
        letterSpacing: -0.8,
        color: theme.colors.textPrimary,
    },

    subtitle: {
        maxWidth: 340,
        marginTop: theme.spacing.sm,
        fontSize: theme.typography.sizes.sm,
        lineHeight: 20,
        color: theme.colors.textSecondary,
    },

    progressCard: {
        marginTop: theme.spacing.xl,
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.surface,
    },

    progressTopRow: {
        marginBottom: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },

    progressLabel: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
    },

    progressValue: {
        marginTop: theme.spacing.xs,
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.textPrimary,
    },

    percentage: {
        fontSize: theme.typography.sizes.xl,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.gold,
    },
});