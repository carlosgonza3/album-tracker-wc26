import { File, Paths } from 'expo-file-system';
import * as ExpoSharing from 'expo-sharing';

import { useMemo, useState } from 'react';

import {
    Alert,
    Platform,
    Pressable,
    SafeAreaView,
    Share,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Animated from 'react-native-reanimated';

import { theme } from '@/constants/theme';
import { albumCatalogue } from '@/data/albumCatalogue';
import { useStickers } from '@/hooks/useStickers';
import { getCollectionStatsSummary } from '@/utils/albumStats';
import {
    searchCollectionStickers,
    type CollectionStickerResult,
} from '@/utils/collectionSearch';

type ExportType =
    | 'missing'
    | 'repeated'
    | 'summary';

type ExportFormat =
    | 'text'
    | 'csv';

interface ActiveExport {
    type: ExportType;
    format: ExportFormat;
}

export default function ShareScreen() {
    const { collection, isHydrated } =
        useStickers();

    const [
        activeExport,
        setActiveExport,
    ] = useState<ActiveExport | null>(
        null
    );

    const missingStickers = useMemo(
        () =>
            searchCollectionStickers(
                collection,
                {
                    query: '',
                    filter: 'missing',
                }
            ),
        [collection]
    );

    const repeatedStickers = useMemo(
        () =>
            searchCollectionStickers(
                collection,
                {
                    query: '',
                    filter: 'repeated',
                }
            ),
        [collection]
    );

    const hasRepeatedStickers =
        repeatedStickers.length > 0;

    const stats = useMemo(
        () =>
            getCollectionStatsSummary(
                albumCatalogue,
                collection
            ),
        [collection]
    );

    const handleShareText = async (
        type: ExportType
    ) => {
        if (
            !isHydrated ||
            activeExport !== null
        ) {
            return;
        }

        const exportContent =
            createExportContent(
                type,
                missingStickers,
                repeatedStickers,
                stats
            );

        setActiveExport({
            type,
            format: 'text',
        });

        try {
            await Share.share({
                title:
                exportContent.title,
                message:
                exportContent.message,
            });
        } catch (error) {
            console.error(
                'Unable to share text export:',
                error
            );

            Alert.alert(
                'Unable to share',
                'The text export could not be opened. Please try again.'
            );
        } finally {
            setActiveExport(null);
        }
    };

    const handleExportCsv = async (
        type:
            | 'missing'
            | 'repeated'
    ) => {
        if (
            !isHydrated ||
            activeExport !== null
        ) {
            return;
        }

        setActiveExport({
            type,
            format: 'csv',
        });

        try {
            if (Platform.OS === 'web') {
                Alert.alert(
                    'CSV sharing unavailable',
                    'CSV file sharing is currently available in the iOS and Android app. You can still use the text share option.'
                );

                return;
            }

            const sharingAvailable =
                await ExpoSharing.isAvailableAsync();

            if (!sharingAvailable) {
                Alert.alert(
                    'Sharing unavailable',
                    'File sharing is not available on this device.'
                );

                return;
            }

            const csvExport =
                createCsvExport(
                    type,
                    type === 'missing'
                        ? missingStickers
                        : repeatedStickers
                );

            const file = new File(
                Paths.cache,
                csvExport.fileName
            );

            file.create({
                overwrite: true,
                intermediates: true,
            });

            /*
             * UTF-8 BOM improves compatibility with spreadsheet
             * applications when names contain accented characters.
             */
            file.write(
                `\uFEFF${csvExport.content}`
            );

            await ExpoSharing.shareAsync(
                file.uri,
                {
                    dialogTitle:
                    csvExport.title,
                    mimeType:
                        'text/csv',
                    UTI:
                        'public.comma-separated-values-text',
                }
            );
        } catch (error) {
            console.error(
                'Unable to export CSV file:',
                error
            );

            Alert.alert(
                'Unable to export CSV',
                'The CSV file could not be created or shared. Please try again.'
            );
        } finally {
            setActiveExport(null);
        }
    };

    const isBusy =
        activeExport !== null;

    return (
        <SafeAreaView style={styles.screen}>
            <Animated.ScrollView
                style={styles.scroll}
                contentContainerStyle={
                    styles.content
                }
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={
                    false
                }
            >
                <View style={styles.header}>
                    <Text style={styles.title}>
                        Share
                    </Text>

                    <Text
                        style={
                            styles.description
                        }
                    >
                        Share your missing
                        stickers, trade list, or
                        complete album progress.
                    </Text>
                </View>

                {!isHydrated ? (
                    <View
                        style={
                            styles.loadingCard
                        }
                    >
                        <Text
                            style={
                                styles.loadingTitle
                            }
                        >
                            Loading collection
                        </Text>

                        <Text
                            style={
                                styles.loadingDescription
                            }
                        >
                            Your saved sticker
                            data is being prepared.
                        </Text>
                    </View>
                ) : (
                    <>
                        <ExportCard
                            eyebrow="PROGRESS"
                            title="Collection summary"
                            description="Share your album completion, foil progress, and duplicate totals."
                            count={Math.round(
                                stats.overall
                                    .completionPercentage
                            )}
                            countLabel="% complete"
                            textButtonLabel="Share summary"
                            variant="summary"
                            disabled={isBusy}
                            isSharingText={
                                activeExport?.type ===
                                'summary' &&
                                activeExport.format ===
                                'text'
                            }
                            isExportingCsv={false}
                            onShareText={() =>
                                handleShareText(
                                    'summary'
                                )
                            }
                        />

                        <ExportCard
                            eyebrow="AVAILABLE"
                            title="Duplicates for trade"
                            description="Share the repeated stickers and quantities you can trade."
                            count={
                                stats.overall
                                    .totalExtraCopies
                            }
                            countLabel="trade copies"
                            textButtonLabel="Share trade list"
                            csvButtonLabel="Export trade CSV"
                            variant="repeated"
                            disabled={
                                isBusy ||
                                !hasRepeatedStickers
                            }
                            isSharingText={
                                activeExport?.type ===
                                'repeated' &&
                                activeExport.format ===
                                'text'
                            }
                            isExportingCsv={
                                activeExport?.type ===
                                'repeated' &&
                                activeExport.format ===
                                'csv'
                            }
                            onShareText={() =>
                                handleShareText(
                                    'repeated'
                                )
                            }
                            onExportCsv={() =>
                                handleExportCsv(
                                    'repeated'
                                )
                            }
                        />

                        <ExportCard
                            eyebrow="NEEDED"
                            title="Missing stickers"
                            description="Share every sticker you still need, grouped by album section."
                            count={
                                stats.overall
                                    .missingStickers
                            }
                            countLabel="missing"
                            textButtonLabel="Share missing list"
                            csvButtonLabel="Export missing CSV"
                            variant="missing"
                            disabled={isBusy}
                            isSharingText={
                                activeExport?.type ===
                                'missing' &&
                                activeExport.format ===
                                'text'
                            }
                            isExportingCsv={
                                activeExport?.type ===
                                'missing' &&
                                activeExport.format ===
                                'csv'
                            }
                            onShareText={() =>
                                handleShareText(
                                    'missing'
                                )
                            }
                            onExportCsv={() =>
                                handleExportCsv(
                                    'missing'
                                )
                            }
                        />
                    </>
                )}
            </Animated.ScrollView>
        </SafeAreaView>
    );
}

interface ExportCardProps {
    eyebrow: string;
    title: string;
    description: string;
    count: number;
    countLabel: string;
    textButtonLabel: string;
    csvButtonLabel?: string;

    variant:
        | 'missing'
        | 'repeated'
        | 'summary';

    disabled: boolean;
    isSharingText: boolean;
    isExportingCsv: boolean;

    onShareText: () => void;
    onExportCsv?: () => void;
}

function ExportCard({
                        eyebrow,
                        title,
                        description,
                        count,
                        countLabel,
                        textButtonLabel,
                        csvButtonLabel,
                        variant,
                        disabled,
                        isSharingText,
                        isExportingCsv,
                        onShareText,
                        onExportCsv,
                    }: ExportCardProps) {
    return (
        <View
            style={[
                styles.exportCard,
                variant === 'missing' &&
                styles.exportCardMissing,
                variant === 'repeated' &&
                styles.exportCardRepeated,
                variant === 'summary' &&
                styles.exportCardSummary,
            ]}
        >
            <View style={styles.cardTop}>
                <View style={styles.cardCopy}>
                    <Text
                        style={[
                            styles.eyebrow,
                            variant ===
                            'repeated' &&
                            styles.eyebrowRepeated,
                            variant ===
                            'summary' &&
                            styles.eyebrowSummary,
                        ]}
                    >
                        {eyebrow}
                    </Text>

                    <Text
                        style={
                            styles.cardTitle
                        }
                    >
                        {title}
                    </Text>

                    <Text
                        style={
                            styles.cardDescription
                        }
                    >
                        {description}
                    </Text>
                </View>

                <View
                    style={[
                        styles.countBadge,
                        variant ===
                        'repeated' &&
                        styles.countBadgeRepeated,
                        variant ===
                        'summary' &&
                        styles.countBadgeSummary,
                    ]}
                >
                    <Text
                        style={[
                            styles.countValue,
                            variant ===
                            'repeated' &&
                            styles.countValueRepeated,
                            variant ===
                            'summary' &&
                            styles.countValueSummary,
                        ]}
                    >
                        {count}
                    </Text>

                    <Text
                        style={
                            styles.countLabel
                        }
                    >
                        {countLabel}
                    </Text>
                </View>
            </View>

            <View style={styles.actions}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                        textButtonLabel
                    }
                    disabled={disabled}
                    onPress={onShareText}
                    style={({ pressed }) => [
                        styles.shareButton,
                        variant === 'repeated' &&
                        styles.shareButtonRepeated,
                        variant === 'summary' &&
                        styles.shareButtonSummary,
                        pressed &&
                        !disabled &&
                        styles.buttonPressed,
                        disabled &&
                        styles.buttonDisabled,
                    ]}
                >
                    <Text
                        style={[
                            styles.shareButtonText,
                            variant === 'repeated' &&
                            styles.shareButtonTextRepeated,
                            variant === 'summary' &&
                            styles.shareButtonTextSummary,
                        ]}
                    >
                        {isSharingText
                            ? 'Opening share sheet…'
                            : textButtonLabel}
                    </Text>
                </Pressable>

                {csvButtonLabel &&
                onExportCsv ? (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={
                            csvButtonLabel
                        }
                        disabled={disabled}
                        onPress={onExportCsv}
                        style={({ pressed }) => [
                            styles.csvButton,
                            pressed &&
                            !disabled &&
                            styles.buttonPressed,
                            disabled &&
                            styles.buttonDisabled,
                        ]}
                    >
                        <Text
                            style={
                                styles.csvButtonText
                            }
                        >
                            {isExportingCsv
                                ? 'Creating CSV…'
                                : csvButtonLabel}
                        </Text>
                    </Pressable>
                ) : null}
            </View>
        </View>
    );
}

interface ExportContent {
    title: string;
    message: string;
}

function createExportContent(
    type: ExportType,
    missingStickers:
    CollectionStickerResult[],
    repeatedStickers:
    CollectionStickerResult[],
    stats: ReturnType<
        typeof getCollectionStatsSummary
    >
): ExportContent {
    switch (type) {
        case 'missing':
            return {
                title:
                    'Missing World Cup stickers',
                message:
                    createMissingList(
                        missingStickers
                    ),
            };

        case 'repeated':
            return {
                title:
                    'World Cup stickers available for trade',
                message:
                    createRepeatedList(
                        repeatedStickers
                    ),
            };

        case 'summary':
        default:
            return {
                title:
                    'World Cup sticker collection summary',
                message:
                    createSummary(
                        stats
                    ),
            };
    }
}

interface CsvExport {
    title: string;
    fileName: string;
    content: string;
}

function createCsvExport(
    type:
        | 'missing'
        | 'repeated',
    stickers:
    CollectionStickerResult[]
): CsvExport {
    if (type === 'missing') {
        return {
            title:
                'Export missing stickers CSV',
            fileName:
                'wc26-missing-stickers.csv',
            content:
                createMissingCsv(
                    stickers
                ),
        };
    }

    return {
        title:
            'Export trade stickers CSV',
        fileName:
            'wc26-trade-stickers.csv',
        content:
            createRepeatedCsv(
                stickers
            ),
    };
}

function createMissingCsv(
    stickers: CollectionStickerResult[]
): string {
    const rows = [
        [
            'Sticker Id',
            'Album Section',
        ],
        ...stickers.map(
            (sticker) => [
                sticker.id,
                sticker.sectionName,
            ]
        ),
    ];

    return rows
        .map(createCsvRow)
        .join('\r\n');
}

function createRepeatedCsv(
    stickers: CollectionStickerResult[]
): string {
    const rows: (string | number)[][] = [
        [
            'ID',
            'Section',
            'Trade Copies',
        ],
        ...stickers.map((sticker) => [
            sticker.id,
            sticker.sectionName,
            sticker.extraCopies,
        ]),
    ];

    return rows
        .map(createCsvRow)
        .join('\r\n');
}

function createRepeatedList(
    stickers: CollectionStickerResult[]
): string {
    if (stickers.length === 0) {
        return 'No duplicate stickers available.';
    }

    const sections =
        groupStickersBySection(
            stickers
        );

    return sections
        .map((section) => {
            const stickerLines =
                section.stickers.map(
                    (sticker) =>
                        `${sticker.id} × ${sticker.extraCopies}`
                );

            return [
                section.sectionName,
                ...stickerLines,
            ].join('\n');
        })
        .join('\n\n');
}

function createCsvRow(
    values:
    (string | number)[]
): string {
    return values
        .map((value) =>
            escapeCsvValue(
                String(value)
            )
        )
        .join(',');
}

function escapeCsvValue(
    value: string
): string {
    const escapedValue =
        value.replace(
            /"/g,
            '""'
        );

    return `"${escapedValue}"`;
}

function createMissingList(
    stickers: CollectionStickerResult[]
): string {
    if (stickers.length === 0) {
        return [
            albumCatalogue.name,
            '',
            'Missing stickers',
            '',
            'Album complete — no missing stickers!',
        ].join('\n');
    }
    const sections =
        groupStickersBySection(
            stickers
        );
    const sectionLines =
        sections.flatMap(
            ({
                 sectionName,
                 stickers:
                     sectionStickers,
             }) => [
                '',
                sectionName,
                sectionStickers
                    .map(
                        (sticker) =>
                            `${sticker.id}`
                    )
                    .join('\n'),
            ]
        );
    return [
        albumCatalogue.name,
        '',
        `Missing stickers: ${stickers.length}`,
        ...sectionLines,
    ].join('\n');
}

function createSummary(
    stats: ReturnType<
        typeof getCollectionStatsSummary
    >
): string {
    const overallPercentage =
        Math.round(
            stats.overall
                .completionPercentage
        );

    const foilPercentage =
        Math.round(
            stats.foil
                .completionPercentage
        );

    const sectionLines =
        stats.sections.map(
            (section) =>
                `${section.sectionName}: ${section.uniqueOwned}/${section.totalStickers} (${Math.round(section.completionPercentage)}%)`
        );

    return [
        albumCatalogue.name,
        '',
        'Collection summary',
        '',
        `Completed: ${overallPercentage}%`,
        `Owned: ${stats.overall.uniqueOwned}/${stats.overall.totalStickers}`,
        `Missing: ${stats.overall.missingStickers}`,
        `Repeated types: ${stats.overall.repeatedStickerTypes}`,
        `Trade copies: ${stats.overall.totalExtraCopies}`,
        '',
        `Foils: ${stats.foil.ownedFoils}/${stats.foil.totalFoils} (${foilPercentage}%)`,
        `Missing foils: ${stats.foil.missingFoils}`,
        '',
        'Progress by section',
        ...sectionLines,
    ].join('\n');
}

interface GroupedSection {
    sectionId: string;
    sectionName: string;
    federation?: string;
    stickers:
        CollectionStickerResult[];
}

function groupStickersBySection(
    stickers:
    CollectionStickerResult[]
): GroupedSection[] {
    const sections =
        new Map<
            string,
            GroupedSection
        >();

    for (const sticker of stickers) {
        const existingSection =
            sections.get(
                sticker.sectionId
            );

        if (existingSection) {
            existingSection.stickers.push(
                sticker
            );

            continue;
        }

        sections.set(
            sticker.sectionId,
            {
                sectionId:
                sticker.sectionId,
                sectionName:
                sticker.sectionName,
                federation:
                sticker.federation,
                stickers: [sticker],
            }
        );
    }

    return Array.from(
        sections.values()
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor:
        theme.colors.background,
    },

    scroll: {
        flex: 1,
    },

    content: {
        gap: theme.spacing.lg,
        paddingHorizontal:
        theme.spacing.xl,
        paddingTop:
        theme.spacing.lg,
        paddingBottom:
            theme.spacing.xl * 2,
    },

    header: {
        gap: theme.spacing.sm,
        marginBottom:
        theme.spacing.sm,
    },

    title: {
        fontSize:
        theme.typography.sizes.xxl,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    description: {
        maxWidth: 520,
        fontSize:
        theme.typography.sizes.md,
        lineHeight: 22,
        color:
        theme.colors.textSecondary,
    },

    loadingCard: {
        padding: theme.spacing.xl,
        borderWidth: 1,
        borderColor:
        theme.colors.border,
        borderRadius:
        theme.radius.lg,
        backgroundColor:
        theme.colors.missing,
    },

    loadingTitle: {
        fontSize:
        theme.typography.sizes.lg,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    loadingDescription: {
        marginTop:
        theme.spacing.sm,
        fontSize:
        theme.typography.sizes.md,
        lineHeight: 22,
        color:
        theme.colors.textSecondary,
    },

    exportCard: {
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderRadius:
        theme.radius.lg,
    },

    exportCardMissing: {
        borderColor:
        theme.colors.border,
        backgroundColor:
        theme.colors.missing,
    },

    exportCardRepeated: {
        borderColor:
            'rgba(245, 197, 24, 0.38)',
        backgroundColor:
            'rgba(245, 197, 24, 0.10)',
    },

    exportCardSummary: {
        borderColor:
            'rgba(53, 201, 111, 0.38)',
        backgroundColor:
            'rgba(53, 201, 111, 0.10)',
    },

    cardTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent:
            'space-between',
        gap: theme.spacing.lg,
    },

    cardCopy: {
        flex: 1,
    },

    eyebrow: {
        fontSize:
        theme.typography.sizes.xs,
        fontWeight:
        theme.typography.weights.bold,
        letterSpacing: 1,
        color:
        theme.colors.textMuted,
    },

    eyebrowRepeated: {
        color: theme.colors.gold,
    },

    eyebrowSummary: {
        color: theme.colors.owned,
    },

    cardTitle: {
        marginTop:
        theme.spacing.sm,
        fontSize:
        theme.typography.sizes.lg,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    cardDescription: {
        marginTop:
        theme.spacing.sm,
        fontSize:
        theme.typography.sizes.sm,
        lineHeight: 20,
        color:
        theme.colors.textSecondary,
    },

    countBadge: {
        minWidth: 78,
        alignItems: 'center',
        paddingHorizontal:
        theme.spacing.sm,
        paddingVertical:
        theme.spacing.sm,
        borderWidth: 1,
        borderColor:
        theme.colors.border,
        borderRadius:
        theme.radius.lg,
        backgroundColor:
        theme.colors.surface,
    },

    countBadgeRepeated: {
        borderColor:
            'rgba(245, 197, 24, 0.30)',
        backgroundColor:
            'rgba(245, 197, 24, 0.10)',
    },

    countBadgeSummary: {
        borderColor:
            'rgba(53, 201, 111, 0.30)',
        backgroundColor:
            'rgba(53, 201, 111, 0.10)',
    },

    countValue: {
        fontSize:
        theme.typography.sizes.xl,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    countValueRepeated: {
        color:
        theme.colors.gold,
    },

    countValueSummary: {
        color:
        theme.colors.owned,
    },

    countLabel: {
        marginTop: 2,
        textAlign: 'center',
        fontSize:
        theme.typography.sizes.xs,
        color:
        theme.colors.textMuted,
    },

    actions: {
        gap: theme.spacing.sm,
        marginTop:
        theme.spacing.lg,
    },

    shareButton: {
        minHeight: 46,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal:
        theme.spacing.lg,
        borderWidth: 1,
        borderColor:
        theme.colors.gold,
        borderRadius:
        theme.radius.full,
        backgroundColor:
            'rgba(245, 197, 24, 0.16)',
    },

    shareButtonRepeated: {
        backgroundColor:
        theme.colors.gold,
    },

    shareButtonText: {
        fontSize:
        theme.typography.sizes.sm,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.gold,
    },

    shareButtonTextRepeated: {
        color:
        theme.colors.textInverse,
    },

    csvButton: {
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal:
        theme.spacing.lg,
        borderWidth: 1,
        borderColor:
        theme.colors.border,
        borderRadius:
        theme.radius.full,
        backgroundColor:
        theme.colors.surface,
    },

    csvButtonText: {
        fontSize:
        theme.typography.sizes.sm,
        fontWeight:
        theme.typography.weights.semibold,
        color:
        theme.colors.textPrimary,
    },

    buttonPressed: {
        opacity: 0.78,
        transform: [
            {
                scale: 0.99,
            },
        ],
    },

    buttonDisabled: {
        opacity: 0.55,
    },

    noteCard: {
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor:
        theme.colors.border,
        borderRadius:
        theme.radius.lg,
        backgroundColor:
        theme.colors.surface,
    },

    noteTitle: {
        fontSize:
        theme.typography.sizes.sm,
        fontWeight:
        theme.typography.weights.semibold,
        color:
        theme.colors.textPrimary,
    },

    noteDescription: {
        marginTop:
        theme.spacing.sm,
        fontSize:
        theme.typography.sizes.sm,
        lineHeight: 20,
        color:
        theme.colors.textSecondary,
    },
    shareButtonSummary: {
        borderColor: theme.colors.owned,
        backgroundColor: theme.colors.owned,
    },

    shareButtonTextSummary: {
        color: theme.colors.textInverse,
    },
});