import {
    createContext,
    type PropsWithChildren,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';

import {
    type SharedValue,
    useSharedValue,
} from 'react-native-reanimated';

interface AlbumHeaderScrollActions {
    scrollToAlbumCover: (
        animated?: boolean
    ) => void;

    scrollToSections: (
        animated?: boolean
    ) => void;
}

export interface AlbumHeaderContextValue {
    /*
     * Controls the global Album header.
     */
    scrollY: SharedValue<number>;

    /*
     * Receives scroll positions from all tab screens
     * and controls the GlassTabBar animation.
     */
    tabBarScrollY: SharedValue<number>;

    isHeaderExpanded: boolean;

    collapseHeader: () => void;
    expandHeader: () => void;

    setHeaderExpanded: (
        isExpanded: boolean
    ) => void;

    registerScrollActions: (
        actions:
            AlbumHeaderScrollActions |
            null
    ) => void;
}

export const AlbumHeaderContext =
    createContext<
        AlbumHeaderContextValue |
        undefined
    >(undefined);

export function AlbumHeaderProvider({
                                        children,
                                    }: PropsWithChildren) {
    const scrollY =
        useSharedValue(0);

    const tabBarScrollY =
        useSharedValue(0);

    const [
        isHeaderExpanded,
        setIsHeaderExpanded,
    ] = useState(true);

    const scrollActionsRef =
        useRef<
            AlbumHeaderScrollActions |
            null
        >(null);

    const registerScrollActions =
        useCallback(
            (
                actions:
                    AlbumHeaderScrollActions |
                    null
            ) => {
                scrollActionsRef.current =
                    actions;
            },
            []
        );

    const setHeaderExpanded =
        useCallback(
            (
                isExpanded: boolean
            ) => {
                setIsHeaderExpanded(
                    isExpanded
                );
            },
            []
        );

    const collapseHeader =
        useCallback(() => {
            /*
             * Show the tab content and navigation
             * immediately, then run the existing Album
             * scroll transition.
             */
            setIsHeaderExpanded(false);

            scrollActionsRef.current
                ?.scrollToSections(true);
        }, []);

    const expandHeader =
        useCallback(() => {
            /*
             * Hide the tab content and navigation
             * immediately, then run the existing Album
             * scroll transition.
             */
            setIsHeaderExpanded(true);

            /*
             * Reset the independent tab-bar scroll state
             * so it starts expanded when it becomes
             * visible again.
             */
            tabBarScrollY.value = 0;

            scrollActionsRef.current
                ?.scrollToAlbumCover(true);
        }, [
            tabBarScrollY,
        ]);

    const value =
        useMemo<AlbumHeaderContextValue>(
            () => ({
                scrollY,
                tabBarScrollY,
                isHeaderExpanded,
                collapseHeader,
                expandHeader,
                setHeaderExpanded,
                registerScrollActions,
            }),
            [
                collapseHeader,
                expandHeader,
                isHeaderExpanded,
                registerScrollActions,
                scrollY,
                tabBarScrollY,
                setHeaderExpanded,
            ]
        );

    return (
        <AlbumHeaderContext.Provider
            value={value}
        >
            {children}
        </AlbumHeaderContext.Provider>
    );
}