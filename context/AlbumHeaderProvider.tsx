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
    scrollY: SharedValue<number>;

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
             * Update global navigation visibility
             * immediately, then run the existing Album
             * list transition.
             */
            setIsHeaderExpanded(false);

            scrollActionsRef.current
                ?.scrollToSections(true);
        }, []);

    const expandHeader =
        useCallback(() => {
            /*
             * Hide the bottom tabs immediately on every
             * route, then run the existing Album list
             * transition.
             */
            setIsHeaderExpanded(true);

            scrollActionsRef.current
                ?.scrollToAlbumCover(true);
        }, []);

    const value =
        useMemo<AlbumHeaderContextValue>(
            () => ({
                scrollY,
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