import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

export default function StatsScreen() {
    return (
        <View style={styles.screen}>
            <Text style={styles.title}>Statistics</Text>
            <Text style={styles.description}>
                Progress insights will appear here.
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

    title: {
        fontSize: theme.typography.sizes.xxl,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.textPrimary,
    },

    description: {
        marginTop: theme.spacing.sm,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textSecondary,
    },
});