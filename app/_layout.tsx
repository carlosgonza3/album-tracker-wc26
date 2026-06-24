import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
    ActivityIndicator,
    StyleSheet,
    View,
} from 'react-native';

import { theme } from '@/constants/theme';
import { StickerProvider } from '@/context/StickerProvider';
import { useStickers } from '@/hooks/useStickers';

function AppNavigator() {
    const { isHydrated } = useStickers();

    if (!isHydrated) {
        return (
            <View style={styles.loadingScreen}>
                <StatusBar style="light" />

                <ActivityIndicator
                    size="large"
                    color={theme.colors.gold}
                />
            </View>
        );
    }

    return (
        <>
            <StatusBar style="light" />

            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: {
                        backgroundColor:
                        theme.colors.background,
                    },
                }}
            >
                <Stack.Screen name="(tabs)" />
            </Stack>
        </>
    );
}

export default function RootLayout() {
    return (
        <StickerProvider>
            <AppNavigator />
        </StickerProvider>
    );
}

const styles = StyleSheet.create({
    loadingScreen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
    },
});