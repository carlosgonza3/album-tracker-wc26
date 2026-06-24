import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { SettingsProvider } from '@/context/SettingsProvider';
import { StickerProvider } from '@/context/StickerProvider';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SettingsProvider>
                <StickerProvider>
                    <Stack screenOptions={{ headerShown: false }} />
                </StickerProvider>
            </SettingsProvider>
        </GestureHandlerRootView>
    );
}