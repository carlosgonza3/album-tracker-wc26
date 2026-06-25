import Constants from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as ExpoSharing from 'expo-sharing';

import { useState } from 'react';

import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/constants/theme';
import { albumCatalogue } from '@/data/albumCatalogue';
import { useSettings } from '@/hooks/useSettings';
import { useStickers } from '@/hooks/useStickers';
import {
    parseStickerCollectionBackup,
    type ParsedStickerCollection,
} from '@/services/stickerStorage';
import type { StickerCollection } from '@/types/album';

type DataAction =
    | 'backup'
    | 'restore'
    | 'reset';

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();

    const {
        settings,
        setInvertSwipeDirections,
    } = useSettings();

    const {
        collection,
        isHydrated,
        replaceCollection,
        resetCollection,
    } = useStickers();

    const [
        activeDataAction,
        setActiveDataAction,
    ] = useState<DataAction | null>(
        null
    );

    const [
        backupFileName,
        setBackupFileName,
    ] = useState('');

    const isInverted =
        settings.invertSwipeDirections;

    const savedStickerTypes =
        Object.keys(collection).length;

    const appName =
        Constants.expoConfig?.name ??
        'WC26 Sticker Tracker';

    const appVersion =
        Constants.expoConfig?.version ??
        '1.0.0';

    const albumVersion =
        albumCatalogue.version;

    const isBusy =
        activeDataAction !== null;

    const backupDisabled =
        !isHydrated ||
        isBusy ||
        savedStickerTypes === 0;

    const restoreDisabled =
        !isHydrated ||
        isBusy;

    const resetDisabled =
        !isHydrated ||
        isBusy ||
        savedStickerTypes === 0;

    const handleCreateBackup =
        async () => {
            if (backupDisabled) {
                return;
            }

            setActiveDataAction(
                'backup'
            );

            try {
                if (
                    Platform.OS === 'web'
                ) {
                    Alert.alert(
                        'Backup unavailable',
                        'Collection backup sharing is currently available in the iOS and Android app.'
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

                const date =
                    new Date()
                        .toISOString()
                        .slice(0, 10);

                const normalizedFileName =
                    normalizeBackupFileName(
                        backupFileName
                    );

                const fileName =
                    normalizedFileName.length >
                    0
                        ? `${normalizedFileName}.json`
                        : `wc26-collection-backup-${date}.json`;

                const backupFile =
                    new File(
                        Paths.cache,
                        fileName
                    );

                backupFile.create({
                    overwrite: true,
                    intermediates: true,
                });

                backupFile.write(
                    JSON.stringify(
                        collection,
                        null,
                        2
                    )
                );

                await ExpoSharing.shareAsync(
                    backupFile.uri,
                    {
                        dialogTitle:
                            'Save collection backup',
                        mimeType:
                            'application/json',
                        UTI:
                            'public.json',
                    }
                );
            } catch (error) {
                console.error(
                    'Unable to create collection backup:',
                    error
                );

                Alert.alert(
                    'Backup failed',
                    'Your collection backup could not be created. Please try again.'
                );
            } finally {
                setActiveDataAction(
                    null
                );
            }
        };

    const handleRestoreBackup =
        async () => {
            if (restoreDisabled) {
                return;
            }

            setActiveDataAction(
                'restore'
            );

            try {
                const result =
                    await DocumentPicker.getDocumentAsync(
                        {
                            type: [
                                'application/json',
                                'text/json',
                                'text/plain',
                            ],
                            copyToCacheDirectory:
                                true,
                            multiple: false,
                        }
                    );

                if (result.canceled) {
                    return;
                }

                const asset =
                    result.assets[0];

                if (!asset) {
                    throw new Error(
                        'No backup file was selected.'
                    );
                }

                const backupFile =
                    new File(
                        asset.uri
                    );

                const backupText =
                    await backupFile.text();

                const parsedBackup =
                    parseStickerCollectionBackup(
                        backupText
                    );

                setActiveDataAction(
                    null
                );

                confirmRestoreCollection(
                    parsedBackup
                );
            } catch (error) {
                console.error(
                    'Unable to read collection backup:',
                    error
                );

                Alert.alert(
                    'Invalid backup',
                    'The selected file is not a valid sticker collection backup.'
                );
            } finally {
                setActiveDataAction(
                    null
                );
            }
        };

    const confirmRestoreCollection = (
        parsedBackup:
        ParsedStickerCollection
    ) => {
        const {
            collection:
                importedCollection,
            acceptedEntries,
            ignoredEntries,
            unknownStickerIds,
        } = parsedBackup;

        if (acceptedEntries === 0) {
            const ignoredMessage =
                ignoredEntries > 0
                    ? ` ${ignoredEntries} ${
                        ignoredEntries === 1
                            ? 'entry was'
                            : 'entries were'
                    } ignored because ${
                        ignoredEntries === 1
                            ? 'it contains'
                            : 'they contain'
                    } zero copies or sticker IDs that do not exist in this album.`
                    : '';

            Alert.alert(
                'No compatible stickers',
                `This backup does not contain any compatible sticker entries.${ignoredMessage} Your current collection has not been changed.`
            );

            return;
        }

        const compatibleLabel =
            acceptedEntries === 1
                ? 'sticker type'
                : 'sticker types';

        const ignoredMessage =
            ignoredEntries > 0
                ? `\n\n${ignoredEntries} ${
                    ignoredEntries === 1
                        ? 'entry will'
                        : 'entries will'
                } be ignored because ${
                    ignoredEntries === 1
                        ? 'it contains'
                        : 'they contain'
                } zero copies or sticker IDs that are not part of this album.`
                : '';

        const unknownIdsMessage =
            unknownStickerIds.length > 0
                ? `\n\nUnknown IDs: ${formatUnknownStickerIds(
                    unknownStickerIds
                )}`
                : '';

        Alert.alert(
            'Restore collection?',
            `This backup contains ${acceptedEntries} compatible ${compatibleLabel}.${ignoredMessage}${unknownIdsMessage}\n\nRestoring it will replace the collection currently saved on this device.`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Restore backup',
                    style: 'destructive',
                    onPress: () => {
                        void restoreCollection(
                            importedCollection
                        );
                    },
                },
            ]
        );
    };

    const restoreCollection =
        async (
            importedCollection:
            StickerCollection
        ) => {
            setActiveDataAction(
                'restore'
            );

            try {
                await replaceCollection(
                    importedCollection
                );

                Alert.alert(
                    'Collection restored',
                    'Your sticker collection has been restored from the selected backup.'
                );
            } catch (error) {
                console.error(
                    'Unable to restore collection:',
                    error
                );

                Alert.alert(
                    'Restore failed',
                    'The backup was valid, but the collection could not be saved. Please try again.'
                );
            } finally {
                setActiveDataAction(
                    null
                );
            }
        };

    const handleResetCollection = () => {
        if (resetDisabled) {
            return;
        }

        Alert.alert(
            'Reset collection?',
            'This will permanently remove every owned sticker and duplicate count from this device. This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Reset collection',
                    style: 'destructive',
                    onPress: () => {
                        void confirmResetCollection();
                    },
                },
            ]
        );
    };

    const confirmResetCollection =
        async () => {
            setActiveDataAction(
                'reset'
            );

            try {
                await resetCollection();

                Alert.alert(
                    'Collection reset',
                    'All saved sticker counts have been removed.'
                );
            } catch (error) {
                console.error(
                    'Unable to reset collection:',
                    error
                );

                Alert.alert(
                    'Reset failed',
                    'Your collection could not be reset. Please try again.'
                );
            } finally {
                setActiveDataAction(
                    null
                );
            }
        };

    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={[
                styles.content,
                {
                    paddingTop:
                        insets.top +
                        theme.spacing.lg,
                    paddingBottom:
                        insets.bottom +
                        theme.spacing.xl,
                },
            ]}
            showsVerticalScrollIndicator={
                false
            }
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.title}>
                Settings
            </Text>

            <Text style={styles.subtitle}>
                Customize how you interact
                with your sticker collection.
            </Text>

            <View style={styles.section}>
                <Text
                    style={
                        styles.sectionTitle
                    }
                >
                    Sticker controls
                </Text>

                <View
                    style={
                        styles.settingCard
                    }
                >
                    <View
                        style={
                            styles.settingTopRow
                        }
                    >
                        <View
                            style={
                                styles.settingText
                            }
                        >
                            <Text
                                style={
                                    styles.settingTitle
                                }
                            >
                                Invert swipe
                                directions
                            </Text>

                            <Text
                                style={
                                    styles.settingDescription
                                }
                            >
                                Swap the gestures
                                used to add and
                                remove sticker
                                copies.
                            </Text>
                        </View>

                        <Switch
                            value={isInverted}
                            onValueChange={(
                                value
                            ) => {
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
                                    ? theme.colors
                                        .owned
                                    : theme.colors
                                        .textMuted
                            }
                            ios_backgroundColor="rgba(255,255,255,0.16)"
                            accessibilityLabel="Invert swipe directions"
                            accessibilityHint="Changes which swipe direction adds or removes a sticker copy"
                        />
                    </View>

                    <View
                        style={
                            styles.divider
                        }
                    />

                    <View
                        style={
                            styles.preview
                        }
                    >
                        <Text
                            style={
                                styles.previewLabel
                            }
                        >
                            Current controls
                        </Text>

                        <View
                            style={
                                styles.directionRow
                            }
                        >
                            <View
                                style={[
                                    styles.directionCard,
                                    isInverted
                                        ? styles.directionCardAdd
                                        : styles.directionCardRemove,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.arrow,
                                        isInverted
                                            ? styles.actionTextAdd
                                            : styles.actionTextRemove,
                                    ]}
                                >
                                    ←
                                </Text>

                                <Text
                                    style={[
                                        styles.directionAction,
                                        isInverted
                                            ? styles.actionTextAdd
                                            : styles.actionTextRemove,
                                    ]}
                                >
                                    {isInverted
                                        ? 'Add'
                                        : 'Remove'}
                                </Text>

                                <Text
                                    style={[
                                        styles.directionValue,
                                        isInverted
                                            ? styles.actionTextAdd
                                            : styles.actionTextRemove,
                                    ]}
                                >
                                    {isInverted
                                        ? '+1'
                                        : '−1'}
                                </Text>
                            </View>

                            <View
                                style={
                                    styles.stickerPreview
                                }
                            >
                                <Text
                                    style={
                                        styles.stickerPreviewId
                                    }
                                >
                                    FWC 01
                                </Text>

                                <Text
                                    style={
                                        styles.stickerPreviewText
                                    }
                                >
                                    Swipe
                                </Text>
                            </View>

                            <View
                                style={[
                                    styles.directionCard,
                                    isInverted
                                        ? styles.directionCardRemove
                                        : styles.directionCardAdd,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.arrow,
                                        isInverted
                                            ? styles.actionTextRemove
                                            : styles.actionTextAdd,
                                    ]}
                                >
                                    →
                                </Text>

                                <Text
                                    style={[
                                        styles.directionAction,
                                        isInverted
                                            ? styles.actionTextRemove
                                            : styles.actionTextAdd,
                                    ]}
                                >
                                    {isInverted
                                        ? 'Remove'
                                        : 'Add'}
                                </Text>

                                <Text
                                    style={[
                                        styles.directionValue,
                                        isInverted
                                            ? styles.actionTextRemove
                                            : styles.actionTextAdd,
                                    ]}
                                >
                                    {isInverted
                                        ? '−1'
                                        : '+1'}
                                </Text>
                            </View>
                        </View>

                        <Text
                            style={
                                styles.helperText
                            }
                        >
                            When a sticker has
                            zero copies, only the
                            add direction is
                            available.
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text
                    style={
                        styles.sectionTitle
                    }
                >
                    Backup & restore
                </Text>

                <View
                    style={
                        styles.backupCard
                    }
                >
                    <View
                        style={
                            styles.backupHeader
                        }
                    >
                        <View
                            style={
                                styles.backupCopy
                            }
                        >
                            <Text
                                style={
                                    styles.backupTitle
                                }
                            >
                                Collection backup
                            </Text>

                            <Text
                                style={
                                    styles.backupDescription
                                }
                            >
                                Save your full
                                collection as a
                                JSON file, or
                                restore it later
                                on this or another
                                device.
                            </Text>
                        </View>

                        <View
                            style={
                                styles.backupCountBadge
                            }
                        >
                            <Text
                                style={
                                    styles.backupCountValue
                                }
                            >
                                {isHydrated
                                    ? savedStickerTypes
                                    : '—'}
                            </Text>

                            <Text
                                style={
                                    styles.backupCountLabel
                                }
                            >
                                tracked
                            </Text>
                        </View>
                    </View>

                    <View
                        style={
                            styles.fileNameField
                        }
                    >
                        <Text
                            style={
                                styles.fileNameLabel
                            }
                        >
                            Backup file name
                        </Text>

                        <View
                            style={
                                styles.fileNameInputRow
                            }
                        >
                            <TextInput
                                value={
                                    backupFileName
                                }
                                onChangeText={
                                    setBackupFileName
                                }
                                editable={!isBusy}
                                autoCapitalize="none"
                                autoCorrect={false}
                                returnKeyType="done"
                                maxLength={64}
                                placeholder="wc26-collection-backup"
                                placeholderTextColor={
                                    theme.colors
                                        .textMuted
                                }
                                accessibilityLabel="Backup file name"
                                style={
                                    styles.fileNameInput
                                }
                            />

                            <Text
                                style={
                                    styles.fileExtension
                                }
                            >
                                .json
                            </Text>
                        </View>

                        <Text
                            style={
                                styles.fileNameHelper
                            }
                        >
                            Leave blank to use
                            the default dated
                            name.
                        </Text>
                    </View>

                    <View
                        style={
                            styles.backupActions
                        }
                    >
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Create collection backup"
                            disabled={
                                backupDisabled
                            }
                            onPress={() => {
                                void handleCreateBackup();
                            }}
                            style={({
                                        pressed,
                                    }) => [
                                styles.backupButton,
                                pressed &&
                                !backupDisabled &&
                                styles.buttonPressed,
                                backupDisabled &&
                                styles.buttonDisabled,
                            ]}
                        >
                            {activeDataAction ===
                            'backup' ? (
                                <ActivityIndicator
                                    size="small"
                                    color={
                                        theme.colors
                                            .textInverse
                                    }
                                />
                            ) : (
                                <Text
                                    style={
                                        styles.backupButtonText
                                    }
                                >
                                    {savedStickerTypes ===
                                    0
                                        ? 'Nothing to back up'
                                        : 'Create backup'}
                                </Text>
                            )}
                        </Pressable>

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Restore collection backup"
                            disabled={
                                restoreDisabled
                            }
                            onPress={() => {
                                void handleRestoreBackup();
                            }}
                            style={({
                                        pressed,
                                    }) => [
                                styles.restoreButton,
                                pressed &&
                                !restoreDisabled &&
                                styles.buttonPressed,
                                restoreDisabled &&
                                styles.buttonDisabled,
                            ]}
                        >
                            {activeDataAction ===
                            'restore' ? (
                                <ActivityIndicator
                                    size="small"
                                    color={
                                        theme.colors
                                            .gold
                                    }
                                />
                            ) : (
                                <Text
                                    style={
                                        styles.restoreButtonText
                                    }
                                >
                                    Restore backup
                                </Text>
                            )}
                        </Pressable>
                    </View>

                    <Text
                        style={
                            styles.backupHelperText
                        }
                    >
                        Restoring a backup
                        replaces the collection
                        currently saved on this
                        device.
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text
                    style={
                        styles.sectionTitle
                    }
                >
                    Collection data
                </Text>

                <View
                    style={
                        styles.dataCard
                    }
                >
                    <View
                        style={
                            styles.dataCardHeader
                        }
                    >
                        <View
                            style={
                                styles.dataCardCopy
                            }
                        >
                            <Text
                                style={
                                    styles.dataCardTitle
                                }
                            >
                                Reset collection
                            </Text>

                            <Text
                                style={
                                    styles.dataCardDescription
                                }
                            >
                                Remove all owned
                                stickers and
                                duplicate counts
                                saved on this
                                device.
                            </Text>
                        </View>

                        <View
                            style={
                                styles.savedCountBadge
                            }
                        >
                            <Text
                                style={
                                    styles.savedCountValue
                                }
                            >
                                {isHydrated
                                    ? savedStickerTypes
                                    : '—'}
                            </Text>

                            <Text
                                style={
                                    styles.savedCountLabel
                                }
                            >
                                tracked
                            </Text>
                        </View>
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Reset sticker collection"
                        accessibilityHint="Permanently removes all saved sticker counts"
                        disabled={
                            resetDisabled
                        }
                        onPress={
                            handleResetCollection
                        }
                        style={({
                                    pressed,
                                }) => [
                            styles.resetButton,
                            pressed &&
                            !resetDisabled &&
                            styles.buttonPressed,
                            resetDisabled &&
                            styles.buttonDisabled,
                        ]}
                    >
                        {activeDataAction ===
                        'reset' ? (
                            <ActivityIndicator
                                size="small"
                                color="#FFFFFF"
                            />
                        ) : (
                            <Text
                                style={
                                    styles.resetButtonText
                                }
                            >
                                {savedStickerTypes ===
                                0
                                    ? 'Collection is empty'
                                    : 'Reset collection'}
                            </Text>
                        )}
                    </Pressable>
                </View>
            </View>

            <View style={styles.section}>
                <Text
                    style={
                        styles.sectionTitle
                    }
                >
                    App information
                </Text>

                <View
                    style={
                        styles.infoCard
                    }
                >
                    <View
                        style={
                            styles.infoHeader
                        }
                    >
                        <View
                            style={
                                styles.infoHeaderCopy
                            }
                        >
                            <Text
                                style={
                                    styles.infoTitle
                                }
                            >
                                {appName}
                            </Text>

                            <Text
                                style={
                                    styles.infoSubtitle
                                }
                            >
                                Made for the
                                official sticker
                                collection of the
                                FIFA World Cup
                                2026.
                            </Text>
                        </View>
                    </View>

                    <View
                        style={
                            styles.infoDivider
                        }
                    />

                    <View
                        style={
                            styles.infoRows
                        }
                    >
                        <View
                            style={
                                styles.infoRow
                            }
                        >
                            <Text
                                style={
                                    styles.infoLabel
                                }
                            >
                                App version
                            </Text>

                            <Text
                                style={
                                    styles.infoValue
                                }
                            >
                                {appVersion}
                            </Text>
                        </View>

                        <View
                            style={
                                styles.infoRow
                            }
                        >
                            <Text
                                style={
                                    styles.infoLabel
                                }
                            >
                                Album version
                            </Text>

                            <Text
                                style={
                                    styles.infoValue
                                }
                            >
                                {albumVersion}
                            </Text>
                        </View>

                        <View
                            style={
                                styles.infoRow
                            }
                        >
                            <Text
                                style={
                                    styles.infoLabel
                                }
                            >
                                Data storage
                            </Text>

                            <Text
                                style={
                                    styles.infoValue
                                }
                            >
                                On this device
                            </Text>
                        </View>

                        <View
                            style={
                                styles.infoRow
                            }
                        >
                            <Text
                                style={
                                    styles.infoLabel
                                }
                            >
                                Account required
                            </Text>

                            <Text
                                style={
                                    styles.infoValue
                                }
                            >
                                No
                            </Text>
                        </View>
                    </View>

                    <View
                        style={
                            styles.privacyBox
                        }
                    >
                        <Text
                            style={
                                styles.privacyEyebrow
                            }
                        >
                            PRIVACY SUMMARY
                        </Text>

                        <Text
                            style={
                                styles.privacyTitle
                            }
                        >
                            Your collection stays
                            private
                        </Text>

                        <Text
                            style={
                                styles.privacyDescription
                            }
                        >
                            The app stores the
                            following information
                            locally on your
                            device:
                        </Text>

                        <View
                            style={
                                styles.privacyList
                            }
                        >
                            <View
                                style={
                                    styles.privacyListItem
                                }
                            >
                                <Text
                                    style={
                                        styles.privacyBullet
                                    }
                                >
                                    •
                                </Text>

                                <Text
                                    style={
                                        styles.privacyListText
                                    }
                                >
                                    Stickers marked
                                    as owned.
                                </Text>
                            </View>

                            <View
                                style={
                                    styles.privacyListItem
                                }
                            >
                                <Text
                                    style={
                                        styles.privacyBullet
                                    }
                                >
                                    •
                                </Text>

                                <Text
                                    style={
                                        styles.privacyListText
                                    }
                                >
                                    The number of
                                    copies and
                                    duplicate
                                    stickers in
                                    your collection.
                                </Text>
                            </View>

                            <View
                                style={
                                    styles.privacyListItem
                                }
                            >
                                <Text
                                    style={
                                        styles.privacyBullet
                                    }
                                >
                                    •
                                </Text>

                                <Text
                                    style={
                                        styles.privacyListText
                                    }
                                >
                                    App preferences,
                                    including the
                                    selected swipe
                                    direction.
                                </Text>
                            </View>
                        </View>

                        <View
                            style={
                                styles.privacyDivider
                            }
                        />

                        <Text
                            style={
                                styles.privacySubtitle
                            }
                        >
                            Information not
                            collected
                        </Text>

                        <Text
                            style={
                                styles.privacyDescription
                            }
                        >
                            The app does not
                            require an account
                            and does not collect
                            your name, email
                            address, contacts,
                            photos, precise
                            location, advertising
                            identifiers, or
                            payment information.
                        </Text>

                        <View
                            style={
                                styles.privacyDivider
                            }
                        />

                        <Text
                            style={
                                styles.privacySubtitle
                            }
                        >
                            No advertising or
                            tracking
                        </Text>

                        <Text
                            style={
                                styles.privacyDescription
                            }
                        >
                            The app does not
                            contain advertising,
                            create an advertising
                            profile, or track
                            your activity across
                            other apps or
                            websites.
                        </Text>

                        <View
                            style={
                                styles.privacyDivider
                            }
                        />

                        <Text
                            style={
                                styles.privacySubtitle
                            }
                        >
                            Backups and exports
                        </Text>

                        <Text
                            style={
                                styles.privacyDescription
                            }
                        >
                            Collection
                            information only
                            leaves the app when
                            you choose to create,
                            save, or share a
                            backup or exported
                            list. Restoring a
                            backup reads only
                            the file that you
                            select.
                        </Text>

                        <View
                            style={
                                styles.privacyDivider
                            }
                        />

                        <Text
                            style={
                                styles.privacySubtitle
                            }
                        >
                            Data control
                        </Text>

                        <Text
                            style={
                                styles.privacyDescription
                            }
                        >
                            You can remove all
                            collection data
                            stored by the app at
                            any time by selecting
                            Reset collection.
                            Backup and export
                            files saved outside
                            the app must be
                            deleted separately
                            from the location
                            where you saved them.
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

function normalizeBackupFileName(
    value: string
): string {
    return value
        .trim()
        .replace(/\.json$/i, '')
        .replace(
            /[^a-zA-Z0-9_-]+/g,
            '-'
        )
        .replace(/^-+|-+$/g, '');
}

function formatUnknownStickerIds(
    stickerIds: string[]
): string {
    const visibleIds =
        stickerIds.slice(0, 6);

    const remainingCount =
        stickerIds.length -
        visibleIds.length;

    const visibleText =
        visibleIds.join(', ');

    return remainingCount > 0
        ? `${visibleText} and ${remainingCount} more`
        : visibleText;
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

    title: {
        marginTop:
        theme.spacing.xs,
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
        marginTop:
        theme.spacing.sm,
        fontSize:
        theme.typography.sizes.sm,
        lineHeight: 20,
        color:
        theme.colors.textSecondary,
    },

    section: {
        marginTop:
        theme.spacing.xl,
    },

    sectionTitle: {
        marginBottom:
        theme.spacing.md,
        fontSize:
        theme.typography.sizes.lg,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    settingCard: {
        padding:
        theme.spacing.lg,
        borderWidth: 1,
        borderColor:
        theme.colors.border,
        borderRadius:
        theme.radius.lg,
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
        marginTop:
        theme.spacing.xs,
        fontSize:
        theme.typography.sizes.sm,
        lineHeight: 19,
        color:
        theme.colors.textSecondary,
    },

    divider: {
        height: 1,
        marginVertical:
        theme.spacing.lg,
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
        padding:
        theme.spacing.sm,
        borderWidth: 1,
        borderRadius:
        theme.radius.md,
    },

    directionCardAdd: {
        borderColor:
            'rgba(53, 201, 111, 0.65)',
        backgroundColor:
            'rgba(53, 201, 111, 0.16)',
    },

    directionCardRemove: {
        borderColor:
            'rgba(239, 68, 68, 0.65)',
        backgroundColor:
            'rgba(239, 68, 68, 0.16)',
    },

    arrow: {
        fontSize:
        theme.typography.sizes.xl,
        fontWeight:
        theme.typography.weights.bold,
    },

    directionAction: {
        marginTop: 2,
        fontSize:
        theme.typography.sizes.xs,
        fontWeight:
        theme.typography.weights.semibold,
    },

    directionValue: {
        marginTop: 2,
        fontSize:
        theme.typography.sizes.xs,
        fontWeight:
        theme.typography.weights.semibold,
    },

    actionTextAdd: {
        color:
        theme.colors.owned,
    },

    actionTextRemove: {
        color: '#EF4444',
    },

    stickerPreview: {
        width: 86,
        minHeight: 96,
        alignItems: 'center',
        justifyContent: 'center',
        padding:
        theme.spacing.sm,
        borderWidth: 1,
        borderColor:
            'rgba(148, 163, 184, 0.42)',
        borderRadius:
        theme.radius.md,
        backgroundColor:
            'rgba(148, 163, 184, 0.12)',
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
        marginTop:
        theme.spacing.xs,
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

    backupCard: {
        padding:
        theme.spacing.lg,
        borderWidth: 1,
        borderColor:
            'rgba(245,197,24,0.34)',
        borderRadius:
        theme.radius.lg,
        backgroundColor:
            'rgba(245,197,24,0.08)',
    },

    backupHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent:
            'space-between',
        gap: theme.spacing.lg,
    },

    backupCopy: {
        flex: 1,
    },

    backupTitle: {
        fontSize:
        theme.typography.sizes.md,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    backupDescription: {
        marginTop:
        theme.spacing.xs,
        fontSize:
        theme.typography.sizes.sm,
        lineHeight: 19,
        color:
        theme.colors.textSecondary,
    },

    backupCountBadge: {
        minWidth: 68,
        alignItems: 'center',
        paddingHorizontal:
        theme.spacing.sm,
        paddingVertical:
        theme.spacing.sm,
        borderWidth: 1,
        borderColor:
            'rgba(245,197,24,0.28)',
        borderRadius:
        theme.radius.md,
        backgroundColor:
            'rgba(245,197,24,0.10)',
    },

    backupCountValue: {
        fontSize:
        theme.typography.sizes.lg,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.gold,
    },

    backupCountLabel: {
        marginTop: 2,
        fontSize:
        theme.typography.sizes.xs,
        color:
        theme.colors.textMuted,
    },

    fileNameField: {
        marginTop:
        theme.spacing.lg,
        gap:
        theme.spacing.sm,
    },

    fileNameLabel: {
        fontSize:
        theme.typography.sizes.xs,
        fontWeight:
        theme.typography.weights.bold,
        letterSpacing: 0.6,
        color:
        theme.colors.textSecondary,
    },

    fileNameInputRow: {
        minHeight: 46,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor:
        theme.colors.border,
        borderRadius:
        theme.radius.md,
        backgroundColor:
        theme.colors.surface,
    },

    fileNameInput: {
        flex: 1,
        minWidth: 0,
        paddingHorizontal:
        theme.spacing.md,
        paddingVertical:
        theme.spacing.sm,
        fontSize:
        theme.typography.sizes.sm,
        color:
        theme.colors.textPrimary,
    },

    fileExtension: {
        height: 46,
        paddingHorizontal:
        theme.spacing.md,
        textAlign: 'center',
        lineHeight: 46,
        fontSize:
        theme.typography.sizes.sm,
        fontWeight:
        theme.typography.weights.semibold,
        color:
        theme.colors.textMuted,
        backgroundColor:
            'rgba(148,163,184,0.10)',
    },

    fileNameHelper: {
        fontSize:
        theme.typography.sizes.xs,
        lineHeight: 17,
        color:
        theme.colors.textMuted,
    },

    backupActions: {
        gap: theme.spacing.sm,
        marginTop:
        theme.spacing.lg,
    },

    backupButton: {
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
        theme.colors.gold,
    },

    backupButtonText: {
        fontSize:
        theme.typography.sizes.sm,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textInverse,
    },

    restoreButton: {
        minHeight: 44,
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
            'rgba(245,197,24,0.10)',
    },

    restoreButtonText: {
        fontSize:
        theme.typography.sizes.sm,
        fontWeight:
        theme.typography.weights.semibold,
        color:
        theme.colors.gold,
    },

    backupHelperText: {
        marginTop:
        theme.spacing.md,
        fontSize:
        theme.typography.sizes.xs,
        lineHeight: 17,
        color:
        theme.colors.textMuted,
    },

    dataCard: {
        padding:
        theme.spacing.lg,
        borderWidth: 1,
        borderColor:
            'rgba(248,113,113,0.38)',
        borderRadius:
        theme.radius.lg,
        backgroundColor:
            'rgba(248,113,113,0.08)',
    },

    dataCardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent:
            'space-between',
        gap: theme.spacing.lg,
    },

    dataCardCopy: {
        flex: 1,
    },

    dataCardTitle: {
        fontSize:
        theme.typography.sizes.md,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    dataCardDescription: {
        marginTop:
        theme.spacing.xs,
        fontSize:
        theme.typography.sizes.sm,
        lineHeight: 19,
        color:
        theme.colors.textSecondary,
    },

    savedCountBadge: {
        minWidth: 68,
        alignItems: 'center',
        paddingHorizontal:
        theme.spacing.sm,
        paddingVertical:
        theme.spacing.sm,
        borderWidth: 1,
        borderColor:
            'rgba(248,113,113,0.26)',
        borderRadius:
        theme.radius.md,
        backgroundColor:
            'rgba(248,113,113,0.10)',
    },

    savedCountValue: {
        fontSize:
        theme.typography.sizes.lg,
        fontWeight:
        theme.typography.weights.bold,
        color: '#FCA5A5',
    },

    savedCountLabel: {
        marginTop: 2,
        fontSize:
        theme.typography.sizes.xs,
        color:
        theme.colors.textMuted,
    },

    resetButton: {
        minHeight: 46,
        marginTop:
        theme.spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal:
        theme.spacing.lg,
        borderWidth: 1,
        borderColor: '#EF4444',
        borderRadius:
        theme.radius.full,
        backgroundColor:
            '#EF4444',
    },

    resetButtonText: {
        fontSize:
        theme.typography.sizes.sm,
        fontWeight:
        theme.typography.weights.bold,
        color: '#FFFFFF',
    },

    infoCard: {
        padding:
        theme.spacing.lg,
        borderWidth: 1,
        borderColor:
        theme.colors.border,
        borderRadius:
        theme.radius.lg,
        backgroundColor:
        theme.colors.surface,
    },

    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },

    infoHeaderCopy: {
        flex: 1,
    },

    infoTitle: {
        fontSize:
        theme.typography.sizes.md,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    infoSubtitle: {
        marginTop:
        theme.spacing.xs,
        fontSize:
        theme.typography.sizes.sm,
        lineHeight: 19,
        color:
        theme.colors.textSecondary,
    },

    infoDivider: {
        height: 1,
        marginVertical:
        theme.spacing.lg,
        backgroundColor:
        theme.colors.border,
    },

    infoRows: {
        gap:
        theme.spacing.md,
    },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:
            'space-between',
        gap:
        theme.spacing.lg,
    },

    infoLabel: {
        fontSize:
        theme.typography.sizes.sm,
        color:
        theme.colors.textSecondary,
    },

    infoValue: {
        flexShrink: 1,
        textAlign: 'right',
        fontSize:
        theme.typography.sizes.sm,
        fontWeight:
        theme.typography.weights.semibold,
        color:
        theme.colors.textPrimary,
    },

    privacyBox: {
        marginTop:
        theme.spacing.lg,
        padding:
        theme.spacing.lg,
        borderWidth: 1,
        borderColor:
            'rgba(53, 201, 111, 0.24)',
        borderRadius:
        theme.radius.md,
        backgroundColor:
            'rgba(53, 201, 111, 0.08)',
    },

    privacyEyebrow: {
        fontSize:
        theme.typography.sizes.xs,
        fontWeight:
        theme.typography.weights.bold,
        letterSpacing: 1,
        color:
        theme.colors.owned,
    },

    privacyTitle: {
        marginTop:
        theme.spacing.xs,
        fontSize:
        theme.typography.sizes.md,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    privacySubtitle: {
        fontSize:
        theme.typography.sizes.sm,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.textPrimary,
    },

    privacyDescription: {
        marginTop:
        theme.spacing.sm,
        fontSize:
        theme.typography.sizes.xs,
        lineHeight: 18,
        color:
        theme.colors.textSecondary,
    },

    privacyList: {
        marginTop:
        theme.spacing.md,
        gap:
        theme.spacing.sm,
    },

    privacyListItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap:
        theme.spacing.sm,
    },

    privacyBullet: {
        fontSize:
        theme.typography.sizes.sm,
        lineHeight: 18,
        color:
        theme.colors.owned,
    },

    privacyListText: {
        flex: 1,
        fontSize:
        theme.typography.sizes.xs,
        lineHeight: 18,
        color:
        theme.colors.textSecondary,
    },

    privacyDivider: {
        height: 1,
        marginVertical:
        theme.spacing.lg,
        backgroundColor:
            'rgba(53, 201, 111, 0.18)',
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
        opacity: 0.42,
    },
});