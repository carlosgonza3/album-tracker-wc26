import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '@/constants/storage';
import {
    DEFAULT_APP_SETTINGS,
    type AppSettings,
} from '@/types/settings';

function isAppSettings(
    value: unknown
): value is AppSettings {
    if (
        typeof value !== 'object' ||
        value === null ||
        Array.isArray(value)
    ) {
        return false;
    }

    const settings = value as Partial<AppSettings>;

    return (
        typeof settings.invertSwipeDirections ===
        'boolean'
    );
}

export async function loadAppSettings(): Promise<AppSettings> {
    const savedSettings = await AsyncStorage.getItem(
        STORAGE_KEYS.appSettings
    );

    if (!savedSettings) {
        return DEFAULT_APP_SETTINGS;
    }

    const parsedSettings: unknown =
        JSON.parse(savedSettings);

    if (!isAppSettings(parsedSettings)) {
        return DEFAULT_APP_SETTINGS;
    }

    return {
        ...DEFAULT_APP_SETTINGS,
        ...parsedSettings,
    };
}

export async function saveAppSettings(
    settings: AppSettings
): Promise<void> {
    await AsyncStorage.setItem(
        STORAGE_KEYS.appSettings,
        JSON.stringify(settings)
    );
}