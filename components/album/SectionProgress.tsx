import {
    memo,
    useMemo,
} from 'react';

import {
    Image,
    type ImageResizeMode,
    type ImageSourcePropType,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import {
    getAlbumSectionArtwork,
} from '@/components/album/AlbumSectionArtwork';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { theme } from '@/constants/theme';
import type { AlbumSection } from '@/types/album';

interface SectionProgressProps {
    name: string;
    federation?: string;

    /**
     * Pass these from AlbumSectionPage so this component
     * can resolve the correct flag or special logo using
     * the same shared logic as AlbumOverviewPage.
     */
    section?: AlbumSection;
    sectionIndex?: number;

    /**
     * Optional manual overrides kept for compatibility.
     * These take priority over the shared artwork lookup.
     */
    artworkSource?: ImageSourcePropType;
    artworkResizeMode?: ImageResizeMode;
    isLogo?: boolean;

    owned: number;
    total: number;
    percentage: number;
}

interface ResolvedArtwork {
    source: ImageSourcePropType;
    resizeMode: ImageResizeMode;
    isLogo: boolean;
}

function normalizeCount(
    value: number
): number {
    if (!Number.isFinite(value)) {
        return 0;
    }

    return Math.max(
        0,
        Math.floor(value)
    );
}

function clampPercentage(
    value: number
): number {
    if (!Number.isFinite(value)) {
        return 0;
    }

    return Math.max(
        0,
        Math.min(100, value)
    );
}

function SectionProgressComponent({
                                      name,
                                      federation,
                                      section,
                                      sectionIndex,
                                      artworkSource,
                                      artworkResizeMode,
                                      isLogo,
                                      owned,
                                      total,
                                      percentage,
                                  }: SectionProgressProps) {
    const normalizedValues = useMemo(() => {
        const normalizedTotal =
            normalizeCount(total);

        const normalizedOwned = Math.min(
            normalizeCount(owned),
            normalizedTotal
        );

        const normalizedPercentage =
            clampPercentage(percentage);

        const missing = Math.max(
            0,
            normalizedTotal -
            normalizedOwned
        );

        const isCompleted =
            normalizedTotal > 0 &&
            normalizedOwned ===
            normalizedTotal;

        return {
            owned: normalizedOwned,
            total: normalizedTotal,
            missing,
            percentage:
            normalizedPercentage,
            roundedPercentage:
                Math.round(
                    normalizedPercentage
                ),
            isCompleted,
        };
    }, [
        owned,
        percentage,
        total,
    ]);

    const resolvedArtwork =
        useMemo<ResolvedArtwork | null>(() => {
            /**
             * Explicit artwork props act as an override.
             */
            if (artworkSource) {
                return {
                    source: artworkSource,
                    resizeMode:
                        artworkResizeMode ??
                        'cover',
                    isLogo:
                        isLogo ?? false,
                };
            }

            if (
                !section ||
                sectionIndex === undefined
            ) {
                return null;
            }

            return getAlbumSectionArtwork(
                section,
                sectionIndex
            );
        }, [
            artworkResizeMode,
            artworkSource,
            isLogo,
            section,
            sectionIndex,
        ]);

    return (
        <View style={styles.card}>
            <View style={styles.mainRow}>
                <View style={styles.identity}>
                    <View
                        style={[
                            styles.artworkContainer,
                            resolvedArtwork?.isLogo &&
                            styles.logoContainer,
                        ]}
                    >
                        {resolvedArtwork ? (
                            <Image
                                source={
                                    resolvedArtwork.source
                                }
                                resizeMode={
                                    resolvedArtwork.resizeMode
                                }
                                style={[
                                    styles.artwork,
                                    resolvedArtwork.isLogo &&
                                    styles.logoArtwork,
                                ]}
                                accessibilityIgnoresInvertColors
                            />
                        ) : (
                            <View
                                style={
                                    styles.artworkPlaceholder
                                }
                            />
                        )}
                    </View>

                    <View
                        style={
                            styles.textContainer
                        }
                    >
                        <Text
                            numberOfLines={2}
                            style={styles.name}
                        >
                            {name}
                        </Text>

                        {federation ? (
                            <Text
                                style={
                                    styles.federation
                                }
                            >
                                {federation}
                            </Text>
                        ) : null}
                    </View>
                </View>

                <View
                    style={
                        styles.missingSummary
                    }
                >
                    <Text
                        style={
                            styles.missingValue
                        }
                    >
                        {
                            normalizedValues
                                .missing
                        }
                    </Text>

                    <Text
                        style={
                            styles.missingLabel
                        }
                    >
                        Missing
                    </Text>
                </View>
            </View>

            <View style={styles.progressArea}>
                <View
                    style={
                        styles.progressHeader
                    }
                >
                    <View style={styles.progressCopy}>
                        <Text
                            style={
                                styles.progressTitle
                            }
                        >
                            Section progress
                        </Text>

                        <Text
                            style={
                                styles.collectionCount
                            }
                        >
                            {
                                normalizedValues
                                    .owned
                            }
                            {' of '}
                            {
                                normalizedValues
                                    .total
                            }
                            {' collected'}
                        </Text>
                    </View>

                    <Text
                        style={[
                            styles.progressPercentage,
                            normalizedValues
                                .isCompleted &&
                            styles
                                .progressPercentageCompleted,
                        ]}
                    >
                        {
                            normalizedValues
                                .roundedPercentage
                        }
                        %
                    </Text>
                </View>

                <ProgressBar
                    progress={
                        normalizedValues.percentage
                    }
                />
            </View>
        </View>
    );
}

function areSectionProgressPropsEqual(
    previous: SectionProgressProps,
    next: SectionProgressProps
): boolean {
    return (
        previous.name === next.name &&
        previous.federation ===
        next.federation &&
        previous.section ===
        next.section &&
        previous.sectionIndex ===
        next.sectionIndex &&
        previous.artworkSource ===
        next.artworkSource &&
        previous.artworkResizeMode ===
        next.artworkResizeMode &&
        previous.isLogo ===
        next.isLogo &&
        previous.owned === next.owned &&
        previous.total === next.total &&
        previous.percentage ===
        next.percentage
    );
}

export const SectionProgress = memo(
    SectionProgressComponent,
    areSectionProgressPropsEqual
);

const styles = StyleSheet.create({
    card: {
        marginTop:
        theme.spacing.lg,
        padding:
        theme.spacing.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor:
        theme.colors.border,
        borderRadius:
        theme.radius.lg,
        backgroundColor:
        theme.colors.surface,
    },

    mainRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.spacing.lg,
    },

    identity: {
        flex: 1,
        minWidth: 0,
    },

    artworkContainer: {
        width: 104,
        height: 72,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor:
            'rgba(245, 197, 24, 0.26)',
        borderRadius:
        theme.radius.md,
        backgroundColor:
            'rgba(245, 197, 24, 0.06)',
    },

    logoContainer: {
        padding:
        theme.spacing.sm,
        backgroundColor:
            'rgba(255,255,255,0.96)',
    },

    artwork: {
        width: '100%',
        height: '100%',
    },

    logoArtwork: {
        borderRadius:
        theme.radius.sm,
    },

    artworkPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor:
            'rgba(255,255,255,0.03)',
    },

    textContainer: {
        minWidth: 0,
        marginTop:
        theme.spacing.md,
    },

    name: {
        fontSize: 28,
        lineHeight: 32,
        fontWeight:
        theme.typography.weights.bold,
        letterSpacing: -0.6,
        color:
        theme.colors.textPrimary,
    },

    federation: {
        marginTop:
        theme.spacing.xs,
        flexShrink: 1,
        fontSize:
        theme.typography.sizes.sm,
        lineHeight: 20,
        color:
        theme.colors.textSecondary,
    },

    missingSummary: {
        minWidth: 72,
        flexShrink: 0,
        alignItems: 'flex-end',
        paddingTop:
        theme.spacing.xs,
    },

    missingValue: {
        fontSize: 26,
        lineHeight: 30,
        fontWeight:
        theme.typography.weights.bold,
        letterSpacing: -0.5,
        color:
        theme.colors.textPrimary,
    },

    missingLabel: {
        marginTop: 2,
        fontSize: 10,
        fontWeight:
        theme.typography.weights.semibold,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        color:
        theme.colors.textMuted,
    },

    progressArea: {
        marginTop:
        theme.spacing.xl,
        paddingTop:
        theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor:
            'rgba(255,255,255,0.06)',
    },

    progressHeader: {
        marginBottom:
        theme.spacing.sm,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent:
            'space-between',
        gap: theme.spacing.md,
    },

    progressCopy: {
        flex: 1,
        minWidth: 0,
    },

    progressTitle: {
        fontSize:
        theme.typography.sizes.xs,
        fontWeight:
        theme.typography.weights.semibold,
        color:
        theme.colors.textSecondary,
    },

    collectionCount: {
        marginTop: 3,
        fontSize: 11,
        color:
        theme.colors.textMuted,
    },

    progressPercentage: {
        flexShrink: 0,
        fontSize:
        theme.typography.sizes.lg,
        lineHeight: 24,
        fontWeight:
        theme.typography.weights.bold,
        color: theme.colors.gold,
    },

    progressPercentageCompleted: {
        color: theme.colors.owned,
    },
});