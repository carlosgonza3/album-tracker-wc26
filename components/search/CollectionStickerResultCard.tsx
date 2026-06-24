import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { theme } from '@/constants/theme';
import type { CollectionStickerResult } from '@/utils/collectionSearch';

interface CollectionStickerResultCardProps {
    sticker: CollectionStickerResult;
    onPress: (
        sticker: CollectionStickerResult
    ) => void;
}

export function CollectionStickerResultCard({
                                                sticker,
                                                onPress,
                                            }: CollectionStickerResultCardProps) {
    const isMissing =
        sticker.status === 'missing';

    const isRepeated =
        sticker.status === 'repeated';

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${sticker.name} in ${sticker.sectionName}`}
            onPress={() => onPress(sticker)}
            style={({ pressed }) => [
                styles.card,
                isMissing && styles.cardMissing,
                sticker.status === 'owned' &&
                styles.cardOwned,
                isRepeated && styles.cardRepeated,
                pressed && styles.cardPressed,
            ]}
        >
            <View style={styles.mainContent}>
                <View style={styles.topRow}>
                    <View style={styles.identity}>
                        <Text style={styles.stickerId}>
                            {sticker.id}
                        </Text>

                        {sticker.type === 'foil' ? (
                            <View style={styles.foilBadge}>
                                <Text style={styles.foilText}>
                                    FOIL
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    <CopyBadge
                        copies={sticker.copies}
                        extraCopies={
                            sticker.extraCopies
                        }
                    />
                </View>

                <Text
                    numberOfLines={2}
                    style={styles.name}
                >
                    {sticker.name}
                </Text>

                <Text
                    numberOfLines={1}
                    style={styles.section}
                >
                    {sticker.federation
                        ? `${sticker.federation} · ${sticker.sectionName}`
                        : sticker.sectionName}
                </Text>

                <View style={styles.footer}>
                    <StatusLabel
                        status={sticker.status}
                    />

                    {isRepeated ? (
                        <Text style={styles.tradeText}>
                            {sticker.extraCopies === 1
                                ? '1 available to trade'
                                : `${sticker.extraCopies} available to trade`}
                        </Text>
                    ) : (
                        <Text style={styles.openText}>
                            {isMissing
                                ? 'Open in album'
                                : 'View sticker'}
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.chevronContainer}>
                <Text style={styles.chevron}>
                    ›
                </Text>
            </View>
        </Pressable>
    );
}

interface CopyBadgeProps {
    copies: number;
    extraCopies: number;
}

function CopyBadge({
                       copies,
                       extraCopies,
                   }: CopyBadgeProps) {
    if (copies === 0) {
        return (
            <View style={styles.missingCopyBadge}>
                <Text style={styles.missingCopyText}>
                    ×0
                </Text>
            </View>
        );
    }

    return (
        <View
            style={[
                styles.copyBadge,
                extraCopies > 0 &&
                styles.copyBadgeRepeated,
            ]}
        >
            <Text style={styles.copyText}>
                ×{copies}
            </Text>
        </View>
    );
}

interface StatusLabelProps {
    status:
        | 'missing'
        | 'owned'
        | 'repeated';
}

function StatusLabel({
                         status,
                     }: StatusLabelProps) {
    const label =
        status === 'missing'
            ? 'Missing'
            : status === 'owned'
                ? 'Owned'
                : 'Repeated';

    return (
        <View
            style={[
                styles.statusBadge,
                status === 'missing' &&
                styles.statusBadgeMissing,
                status === 'owned' &&
                styles.statusBadgeOwned,
                status === 'repeated' &&
                styles.statusBadgeRepeated,
            ]}
        >
            <Text
                style={[
                    styles.statusText,
                    status === 'missing' &&
                    styles.statusTextMissing,
                    status === 'owned' &&
                    styles.statusTextOwned,
                    status === 'repeated' &&
                    styles.statusTextRepeated,
                ]}
            >
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        minHeight: 138,
        flexDirection: 'row',
        overflow: 'hidden',
        borderWidth: 1,
        borderRadius: theme.radius.lg,
    },

    cardMissing: {
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.missing,
    },

    cardOwned: {
        borderColor: 'rgba(53, 201, 111, 0.58)',
        backgroundColor: 'rgba(53, 201, 111, 0.14)',
    },

    cardRepeated: {
        borderColor: 'rgba(53, 201, 111, 0.86)',
        backgroundColor: 'rgba(53, 201, 111, 0.26)',
    },
    cardPressed: {
        opacity: 0.78,
        transform: [
            {
                scale: 0.99,
            },
        ],
    },

    mainContent: {
        flex: 1,
        padding: theme.spacing.md,
    },

    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.sm,
    },

    identity: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },

    stickerId: {
        flexShrink: 1,
        fontSize: theme.typography.sizes.sm,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.gold,
    },

    foilBadge: {
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor:
            'rgba(139, 126, 255, 0.52)',
        borderRadius: theme.radius.full,
        backgroundColor:
            'rgba(139, 126, 255, 0.16)',
    },

    foilText: {
        fontSize: 8,
        fontWeight:
        theme.typography.weights.bold,
        letterSpacing: 0.6,
        color: '#B8AEFF',
    },

    copyBadge: {
        minWidth: 34,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor:
            'rgba(148, 163, 184, 0.28)',
        borderRadius: theme.radius.full,
        backgroundColor:
            'rgba(148, 163, 184, 0.14)',
    },

    copyBadgeRepeated: {
        borderColor:
            'rgba(148, 163, 184, 0.38)',
        backgroundColor:
            'rgba(148, 163, 184, 0.20)',
    },

    copyText: {
        fontSize: theme.typography.sizes.xs,
        fontWeight:
        theme.typography.weights.bold,
        color: '#CBD5E1',
    },

    missingCopyBadge: {
        minWidth: 34,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.surface,
    },

    missingCopyText: {
        fontSize: theme.typography.sizes.xs,
        fontWeight:
        theme.typography.weights.bold,
        color: theme.colors.textMuted,
    },

    name: {
        marginTop: theme.spacing.md,
        fontSize: theme.typography.sizes.md,
        fontWeight:
        theme.typography.weights.semibold,
        lineHeight: 21,
        color: theme.colors.textPrimary,
    },

    section: {
        marginTop: 5,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
    },

    footer: {
        minHeight: 28,
        marginTop: 'auto',
        paddingTop: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.sm,
    },

    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderRadius: theme.radius.full,
    },

    statusBadgeMissing: {
        borderColor:
            'rgba(248, 113, 113, 0.26)',
        backgroundColor:
            'rgba(248, 113, 113, 0.10)',
    },

    statusBadgeOwned: {
        borderColor:
            'rgba(74, 222, 128, 0.25)',
        backgroundColor:
            'rgba(74, 222, 128, 0.10)',
    },

    statusBadgeRepeated: {
        borderColor:
            'rgba(250, 204, 21, 0.26)',
        backgroundColor:
            'rgba(250, 204, 21, 0.10)',
    },

    statusText: {
        fontSize: theme.typography.sizes.xs,
        fontWeight:
        theme.typography.weights.semibold,
    },

    statusTextMissing: {
        color: '#FCA5A5',
    },

    statusTextOwned: {
        color: '#86EFAC',
    },

    statusTextRepeated: {
        color: '#FDE047',
    },

    tradeText: {
        flex: 1,
        textAlign: 'right',
        fontSize: theme.typography.sizes.xs,
        fontWeight:
        theme.typography.weights.semibold,
        color: theme.colors.gold,
    },

    openText: {
        flex: 1,
        textAlign: 'right',
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textMuted,
    },

    chevronContainer: {
        width: 38,
        alignItems: 'center',
        justifyContent: 'center',
        borderLeftWidth: 1,
        borderLeftColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
    },

    chevron: {
        marginTop: -3,
        fontSize: 30,
        fontWeight:
        theme.typography.weights.semibold,
        color: theme.colors.textMuted,
    },
});