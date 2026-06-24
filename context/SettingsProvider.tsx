import {
    createContext,
    type PropsWithChildren,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    loadAppSettings,
    saveAppSettings,
} from '@/services/settingsStorage';
import {
    DEFAULT_APP_SETTINGS,
    type AppSettings,
} from '@/types/settings';

interface SettingsContextValue {
    settings: AppSettings;
    isSettingsHydrated: boolean;

    setInvertSwipeDirections: (
        inverted: boolean
    ) => Promise<void>;

    toggleSwipeDirections: () => Promise<void>;
}

export const SettingsContext =
    createContext<SettingsContextValue | null>(null);

export function SettingsProvider({
                                     children,
                                 }: PropsWithChildren) {
    const [settings, setSettings] =
        useState<AppSettings>(
            DEFAULT_APP_SETTINGS
        );

    const [
        isSettingsHydrated,
        setIsSettingsHydrated,
    ] = useState(false);

    useEffect(() => {
        async function hydrateSettings() {
            try {
                const savedSettings =
                    await loadAppSettings();

                setSettings(savedSettings);
            } catch (error) {
                console.error(
                    'Failed to load app settings:',
                    error
                );

                setSettings(DEFAULT_APP_SETTINGS);
            } finally {
                setIsSettingsHydrated(true);
            }
        }

        void hydrateSettings();
    }, []);

    const updateSettings = useCallback(
        async (
            nextSettings: AppSettings
        ) => {
            setSettings(nextSettings);

            try {
                await saveAppSettings(nextSettings);
            } catch (error) {
                console.error(
                    'Failed to save app settings:',
                    error
                );
            }
        },
        []
    );

    const setInvertSwipeDirections =
        useCallback(
            async (inverted: boolean) => {
                await updateSettings({
                    ...settings,
                    invertSwipeDirections: inverted,
                });
            },
            [settings, updateSettings]
        );

    const toggleSwipeDirections =
        useCallback(async () => {
            await updateSettings({
                ...settings,
                invertSwipeDirections:
                    !settings.invertSwipeDirections,
            });
        }, [settings, updateSettings]);

    const value =
        useMemo<SettingsContextValue>(
            () => ({
                settings,
                isSettingsHydrated,
                setInvertSwipeDirections,
                toggleSwipeDirections,
            }),
            [
                settings,
                isSettingsHydrated,
                setInvertSwipeDirections,
                toggleSwipeDirections,
            ]
        );

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}