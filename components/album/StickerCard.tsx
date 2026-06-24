import * as Haptics from 'expo-haptics';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { theme } from '@/constants/theme';
import type { StickerWithState } from '@/types/album';

interface StickerCardProps {
    sticker: StickerWithState;
    onPress: () => void;
}

export function StickerCard({
                                sticker,
                                onPress,
                            }: StickerCardProps) {
    const isOwned = sticker.status === 'owned';
    const isRepeated =
        sticker.status === 'repeated';

    async function handlePress() {
        await Haptics.selectionAsync();
        onPress();
    }

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${sticker.id}, ${sticker.name}, ${sticker.status}`}
            accessibilityHint="Tap to change sticker state"
            onPress={() => {
                void handlePress();
            }}
            style={({ pressed }) => [
                styles.card,
                isOwned && styles.cardOwned,
                isRepeated && styles.cardRepeated,
                pressed && styles.cardPressed,
            ]}
        >
            <View style={styles.topRow}>
                <Text style={styles.id}>
                    {sticker.id}
                </Text>

                {sticker.type === 'foil' && (
                    <View style={styles.foilBadge}>
                        <Text style={styles.foilText}>
                            FOIL
                        </Text>
                    </View>
                )}
            </View>

            <Text
                numberOfLines={2}
                style={styles.name}
            >
                {sticker.name}
            </Text>

            <View style={styles.footer}>
                <Text
                    style={[
                        styles.status,
                        isOwned && styles.statusOwned,
                        isRepeated &&
                        styles.statusRepeated,
                    ]}
                >
                    {sticker.status === 'missing'
                        ? 'Missing'
                        : sticker.status === 'owned'
                            ? 'Owned'
                            : 'Repeated'}
                </Text>

                {sticker.copies > 0 && (
                    <View
                        style={[
                            styles.copyBadge,
                            isRepeated &&
                            styles.copyBadgeRepeated,
                        ]}
                    >
                        <Text style={styles.copyText}>
                            ×{sticker.copies}
                        </Text>
                    </View>
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        minHeight: 132,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.missing,
    },

    cardOwned: {
        borderColor: theme.colors.owned,
        backgroundColor:
        theme.colors.ownedBackground,
    },

    cardRepeated: {
        borderColor: theme.colors.repeated,
        backgroundColor:
        theme.colors.repeatedBackground,
    },

    cardPressed: {
        opacity: 0.74,
        transform: [{ scale: 0.97 }],
    },

    topRow: {
        minHeight: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.xs,
    },

    id: {
        flexShrink: 1,
        fontSize: theme.typography.sizes.md,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.textPrimary,
    },

    foilBadge: {
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: theme.radius.full,
        backgroundColor:
            'rgba(245,197,24,0.18)',
    },

    foilText: {
        fontSize: 8,
        fontWeight: theme.typography.weights.bold,
        letterSpacing: 0.5,
        color: theme.colors.gold,
    },

    name: {
        marginTop: theme.spacing.sm,
        fontSize: theme.typography.sizes.xs,
        lineHeight: 16,
        color: theme.colors.textSecondary,
    },

    footer: {
        minHeight: 24,
        marginTop: 'auto',
        paddingTop: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.xs,
    },

    status: {
        flexShrink: 1,
        fontSize: theme.typography.sizes.xs,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.missingText,
    },

    statusOwned: {
        color: theme.colors.owned,
    },

    statusRepeated: {
        color: theme.colors.repeated,
    },

    copyBadge: {
        minWidth: 28,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 7,
        paddingVertical: 4,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.owned,
    },

    copyBadgeRepeated: {
        backgroundColor: theme.colors.repeated,
    },

    copyText: {
        fontSize: theme.typography.sizes.xs,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.textPrimary,
    },
});