import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { theme } from '@/constants/theme';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,

                tabBarActiveTintColor:
                theme.colors.gold,

                tabBarInactiveTintColor:
                theme.colors.textMuted,

                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor:
                    theme.colors.border,
                    backgroundColor:
                    theme.colors.primary,
                },

                tabBarLabelStyle: {
                    fontSize:
                    theme.typography.sizes.xs,
                    fontWeight:
                    theme.typography.weights.semibold,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Album',

                    tabBarIcon: ({
                                     color,
                                     focused,
                                     size,
                                 }) => (
                        <Ionicons
                            name={
                                focused
                                    ? 'book'
                                    : 'book-outline'
                            }
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="collection"
                options={{
                    title: 'Collection',

                    tabBarIcon: ({
                                     color,
                                     focused,
                                     size,
                                 }) => (
                        <Ionicons
                            name={
                                focused
                                    ? 'albums'
                                    : 'albums-outline'
                            }
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="share"
                options={{
                    title: 'Share',

                    tabBarIcon: ({
                                     color,
                                     focused,
                                     size,
                                 }) => (
                        <Ionicons
                            name={
                                focused
                                    ? 'share-social'
                                    : 'share-social-outline'
                            }
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',

                    tabBarIcon: ({
                                     color,
                                     focused,
                                     size,
                                 }) => (
                        <Ionicons
                            name={
                                focused
                                    ? 'settings'
                                    : 'settings-outline'
                            }
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}