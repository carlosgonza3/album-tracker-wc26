import { StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { theme } from '@/constants/theme';

interface SectionProgressProps {
    name: string;
    federation?: string;
    owned: number;
    total: number;
    percentage: number;
}

export function SectionProgress({
                                    name,
                                    federation,
                                    owned,
                                    total,
                                    percentage,
                                }: SectionProgressProps) {
    return (
        <View style={styles.card}>
            <View style={styles.topRow}>
                <View style={styles.textContainer}>
                    <Text
                        numberOfLines={1}
                        style={styles.name}
                    >
                        {name}
                    </Text>

                    {federation && (
                        <Text
                            numberOfLines={1}
                            style={styles.federation}
                        >
                            {federation}
                        </Text>
                    )}
                </View>

                <View style={styles.summary}>
                    <Text style={styles.percentage}>
                        {Math.round(percentage)}%
                    </Text>

                    <Text style={styles.count}>
                        {owned}/{total}
                    </Text>
                </View>
            </View>

            <ProgressBar progress={percentage} />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginTop: theme.spacing.lg,
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.surface,
    },

    topRow: {
        marginBottom: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: theme.spacing.md,
    },

    textContainer: {
        flex: 1,
    },

    name: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.textPrimary,
    },

    federation: {
        marginTop: theme.spacing.xs,
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textMuted,
    },

    summary: {
        alignItems: 'flex-end',
    },

    percentage: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.gold,
    },

    count: {
        marginTop: 2,
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textSecondary,
    },
});