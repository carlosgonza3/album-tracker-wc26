import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/constants/theme';
import { useSettings } from '@/hooks/useSettings';

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();

    const {
        settings,
        setInvertSwipeDirections,
    } = useSettings();

    const isInverted =
        settings.invertSwipeDirections;

    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={[
                styles.content,
                {
                    paddingTop:
                        insets.top + theme.spacing.lg,
                    paddingBottom:
                        insets.bottom + 120,
                },
            ]}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.eyebrow}>
                PREFERENCES
            </Text>

            <Text style={styles.title}>
                Settings
            </Text>

            <Text style={styles.subtitle}>
                Customize how you interact with your sticker collection.
            </Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Sticker controls
                </Text>

                <View style={styles.settingCard}>
                    <View style={styles.settingTopRow}>
                        <View style={styles.settingText}>
                            <Text style={styles.settingTitle}>
                                Invert swipe directions
                            </Text>

                            <Text style={styles.settingDescription}>
                                Swap the gestures used to add and remove sticker copies.
                            </Text>
                        </View>

                        <Switch
                            value={isInverted}
                            onValueChange={(value) => {
                                void setInvertSwipeDirections(
                                    value
                                );
                            }}
                            trackColor={{
                                false:
                                    'rgba(255,255,255,0.16)',
                                true:
                                    'rgba(53,201,111,0.45)',
                            }}
                            thumbColor={
                                isInverted
                                    ? theme.colors.owned
                                    : theme.colors.textMuted
                            }
                            ios_backgroundColor="rgba(255,255,255,0.16)"
                            accessibilityLabel="Invert swipe directions"
                            accessibilityHint="Changes which swipe direction adds or removes a sticker copy"
                        />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.preview}>
                        <Text style={styles.previewLabel}>
                            Current controls
                        </Text>

                        <View style={styles.directionRow}>
                            <View style={styles.directionCard}>
                                <Text style={styles.arrow}>
                                    ←
                                </Text>

                                <Text style={styles.directionAction}>
                                    {isInverted
                                        ? 'Add'
                                        : 'Remove'}
                                </Text>

                                <Text style={styles.directionValue}>
                                    {isInverted ? '+1' : '−1'}
                                </Text>
                            </View>

                            <View style={styles.stickerPreview}>
                                <Text style={styles.stickerPreviewId}>
                                    MEX 01
                                </Text>

                                <Text style={styles.stickerPreviewText}>
                                    Swipe
                                </Text>
                            </View>

                            <View style={styles.directionCard}>
                                <Text style={styles.arrow}>
                                    →
                                </Text>

                                <Text style={styles.directionAction}>
                                    {isInverted
                                        ? 'Remove'
                                        : 'Add'}
                                </Text>

                                <Text style={styles.directionValue}>
                                    {isInverted ? '−1' : '+1'}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.helperText}>
                            When a sticker has zero copies, only the add direction is available.
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor:
        theme.colors.background,
    },

    content: {
        paddingHorizontal:
        theme.spacing.lg,
    },

    eyebrow: {
        fontSize:
        theme.typography.sizes.xs,
        fontWeight:
        theme.typography.weights.bold,
        letterSpacing: 1.8,
        color: theme.colors.gold,
    },

    title: {
        marginTop: theme.spacing.xs,
        fontSize:
        theme.typography.sizes.display,
        fontWeight:
        theme.typography.weights.bold,
        letterSpacing: -0.8,
        color:
        theme.colors.textPrimary,
    },

    subtitle: {
        maxWidth: 340,
        marginTop: theme.spacing.sm,
        fontSize:
        theme.typography.sizes.sm,
        lineHeight: 20,
        color:
        theme.colors.textSecondary,
    },

    section: {
        marginTop: theme.spacing.xl,
    },

    sectionTitle: {
        marginBottom: theme.spacing.md,
        fontSize:
        theme.typography.sizes.lg,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    settingCard: {
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        backgroundColor:
        theme.colors.surface,
    },

    settingTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.lg,
    },

    settingText: {
        flex: 1,
    },

    settingTitle: {
        fontSize:
        theme.typography.sizes.md,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    settingDescription: {
        marginTop: theme.spacing.xs,
        fontSize:
        theme.typography.sizes.sm,
        lineHeight: 19,
        color:
        theme.colors.textSecondary,
    },

    divider: {
        height: 1,
        marginVertical: theme.spacing.lg,
        backgroundColor:
        theme.colors.border,
    },

    preview: {
        gap: theme.spacing.md,
    },

    previewLabel: {
        fontSize:
        theme.typography.sizes.xs,
        fontWeight:
        theme.typography.weights.bold,
        letterSpacing: 1,
        color:
        theme.colors.textMuted,
    },

    directionRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: theme.spacing.sm,
    },

    directionCard: {
        flex: 1,
        minHeight: 96,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.sm,
        borderRadius: theme.radius.md,
        backgroundColor:
            'rgba(53,201,111,0.12)',
    },

    arrow: {
        fontSize:
        theme.typography.sizes.xl,
        fontWeight:
        theme.typography.weights.bold,
        color: theme.colors.owned,
    },

    directionAction: {
        marginTop: 2,
        fontSize:
        theme.typography.sizes.xs,
        fontWeight:
        theme.typography.weights.semibold,
        color:
        theme.colors.textPrimary,
    },

    directionValue: {
        marginTop: 2,
        fontSize:
        theme.typography.sizes.xs,
        color:
        theme.colors.textSecondary,
    },

    stickerPreview: {
        width: 86,
        minHeight: 96,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.sm,
        borderWidth: 1,
        borderColor:
            'rgba(53,201,111,0.65)',
        borderRadius: theme.radius.md,
        backgroundColor:
            'rgba(53,201,111,0.16)',
    },

    stickerPreviewId: {
        fontSize:
        theme.typography.sizes.sm,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    stickerPreviewText: {
        marginTop: theme.spacing.xs,
        fontSize:
        theme.typography.sizes.xs,
        color:
        theme.colors.textSecondary,
    },

    helperText: {
        fontSize:
        theme.typography.sizes.xs,
        lineHeight: 17,
        color:
        theme.colors.textMuted,
    },
});