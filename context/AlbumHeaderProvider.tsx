import {
    createContext,
    type PropsWithChildren,
    useCallback,
    useMemo,
    useRef,
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

    collapseHeader: () => void;
    expandHeader: () => void;

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

    const collapseHeader =
        useCallback(() => {
            scrollActionsRef.current
                ?.scrollToSections(true);
        }, []);

    const expandHeader =
        useCallback(() => {
            scrollActionsRef.current
                ?.scrollToAlbumCover(true);
        }, []);

    const value =
        useMemo<AlbumHeaderContextValue>(
            () => ({
                scrollY,
                collapseHeader,
                expandHeader,
                registerScrollActions,
            }),
            [
                collapseHeader,
                expandHeader,
                registerScrollActions,
                scrollY,
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