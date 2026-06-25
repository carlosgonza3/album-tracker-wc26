import {
    memo,
} from 'react';

import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { theme } from '@/constants/theme';

interface AlbumHeaderStatsProps {
    collected: number;
    remaining: number;
    repeated: number;
}

interface AlbumStatProps {
    label: string;
    value: number;
    accent?: boolean;
}

const AlbumStat = memo(
    function AlbumStat({
                           label,
                           value,
                           accent = false,
                       }: AlbumStatProps) {
        return (
            <View style={styles.stat}>
                <Text
                    style={[
                        styles.statValue,
                        accent &&
                        styles
                            .statValueAccent,
                    ]}
                >
                    {value}
                </Text>

                <Text
                    style={styles.statLabel}
                >
                    {label}
                </Text>
            </View>
        );
    }
);

function AlbumHeaderStatsComponent({
                                       collected,
                                       remaining,
                                       repeated,
                                   }: AlbumHeaderStatsProps) {
    return (
        <View style={styles.statsRow}>
            <AlbumStat
                label="Collected"
                value={collected}
                accent
            />

            <View
                style={styles.statDivider}
            />

            <AlbumStat
                label="Remaining"
                value={remaining}
            />

            <View
                style={styles.statDivider}
            />

            <AlbumStat
                label="Repeated"
                value={repeated}
            />
        </View>
    );
}

export const AlbumHeaderStats = memo(
    AlbumHeaderStatsComponent
);

const styles = StyleSheet.create({
    statsRow: {
        marginTop:
        theme.spacing.xxl,
        paddingVertical:
        theme.spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor:
        theme.colors.border,
        borderRadius:
        theme.radius.lg,
        backgroundColor:
        theme.colors.surface,
    },

    stat: {
        flex: 1,
        alignItems: 'center',
    },

    statValue: {
        fontSize:
        theme.typography.sizes.xl,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    statValueAccent: {
        color:
        theme.colors.owned,
    },

    statLabel: {
        marginTop: 5,
        fontSize:
        theme.typography.sizes.xs,
        color:
        theme.colors.textSecondary,
    },

    statDivider: {
        width: 1,
        height: 34,
        backgroundColor:
        theme.colors.border,
    },
});