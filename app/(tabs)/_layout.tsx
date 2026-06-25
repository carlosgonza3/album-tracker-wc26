import { Tabs } from 'expo-router';

import { theme } from '@/constants/theme';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.gold,
                tabBarInactiveTintColor: theme.colors.textMuted,
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border,
                    backgroundColor: theme.colors.primary,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Album',
                }}
            />

            <Tabs.Screen
                name="collection"
                options={{
                    title: 'Collection',
                }}
            />

            <Tabs.Screen
                name="share"
                options={{
                    title: 'Share',
                }}
            />

            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                }}
            />
        </Tabs>
    );
}