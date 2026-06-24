import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { theme } from '@/constants/theme';
import { albumCatalogue } from '@/data/albumCatalogue';
import { useStickers } from '@/hooks/useStickers';
import {
    getStickerStatus,
    getExtraCopies,
} from '@/utils/stickerState';

const testSticker =
    albumCatalogue.sections[1]?.stickers[0];

export default function AlbumScreen() {
    const {
        collection,
        cycleSticker,
        resetCollection,
        storageError,
    } = useStickers();

    if (!testSticker) {
        return (
            <View style={styles.screen}>
                <Text style={styles.title}>
                    No test sticker found
                </Text>
            </View>
        );
    }

    const copies =
        collection[testSticker.id] ?? 0;

    const status =
        getStickerStatus(copies);

    const extraCopies =
        getExtraCopies(copies);

    return (
        <View style={styles.screen}>
            <Text style={styles.eyebrow}>
                PERSISTENCE TEST
            </Text>

            <Text style={styles.title}>
                {testSticker.id}
            </Text>

            <Text style={styles.name}>
                {testSticker.name}
            </Text>

            <View
                style={[
                    styles.card,
                    status === 'owned' &&
                    styles.cardOwned,
                    status === 'repeated' &&
                    styles.cardRepeated,
                ]}
            >
                <Text style={styles.status}>
                    {status.toUpperCase()}
                </Text>

                <Text style={styles.copies}>
                    Copies: {copies}
                </Text>

                <Text style={styles.extras}>
                    Extra copies: {extraCopies}
                </Text>
            </View>

            <Pressable
                onPress={() => {
                    void cycleSticker(testSticker.id);
                }}
                style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.pressed,
                ]}
            >
                <Text style={styles.primaryButtonText}>
                    Cycle sticker
                </Text>
            </Pressable>

            <Pressable
                onPress={() => {
                    void resetCollection();
                }}
                style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.pressed,
                ]}
            >
                <Text style={styles.secondaryButtonText}>
                    Reset collection
                </Text>
            </Pressable>

            {storageError && (
                <Text style={styles.error}>
                    {storageError}
                </Text>
            )}

            <Text style={styles.instructions}>
                Tap to cycle missing → owned → repeated → missing.
                Reload Expo Go to verify persistence.
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
        color: theme.colors.textPrimary,
    },

    name: {
        marginTop: theme.spacing.xs,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textSecondary,
    },

    card: {
        marginTop: theme.spacing.xl,
        padding: theme.spacing.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
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

    status: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.textPrimary,
    },

    copies: {
        marginTop: theme.spacing.md,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textSecondary,
    },

    extras: {
        marginTop: theme.spacing.xs,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
    },

    primaryButton: {
        minHeight: 50,
        marginTop: theme.spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.gold,
    },

    primaryButtonText: {
        fontSize: theme.typography.sizes.md,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.textInverse,
    },

    secondaryButton: {
        minHeight: 50,
        marginTop: theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.borderStrong,
        borderRadius: theme.radius.full,
    },

    secondaryButtonText: {
        fontSize: theme.typography.sizes.md,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.textPrimary,
    },

    instructions: {
        marginTop: theme.spacing.xl,
        fontSize: theme.typography.sizes.sm,
        lineHeight: 20,
        color: theme.colors.textMuted,
    },

    error: {
        marginTop: theme.spacing.md,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.error,
    },

    pressed: {
        opacity: 0.72,
    },
});