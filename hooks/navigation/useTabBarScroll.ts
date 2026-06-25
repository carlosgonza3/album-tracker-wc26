import {
    useCallback,
} from 'react';

import {
    useFocusEffect,
} from 'expo-router';

import {
    useAnimatedScrollHandler,
} from 'react-native-reanimated';

import {
    useAlbumHeader,
} from '@/hooks/album/useAlbumHeader';

export function useTabBarScroll() {
    const {
        tabBarScrollY,
    } = useAlbumHeader();

    /*
     * Reset the navigation animation whenever a
     * different tab becomes active.
     */
    useFocusEffect(
        useCallback(() => {
            tabBarScrollY.value = 0;

            return () => {
                tabBarScrollY.value = 0;
            };
        }, [
            tabBarScrollY,
        ])
    );

    const tabBarScrollHandler =
        useAnimatedScrollHandler({
            onScroll: (event) => {
                tabBarScrollY.value =
                    Math.max(
                        0,
                        event.contentOffset.y
                    );
            },
        });

    return {
        tabBarScrollY,
        tabBarScrollHandler,
    };
}