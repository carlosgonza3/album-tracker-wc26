import {
    createContext,
    type PropsWithChildren,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import {
    clearStickerCollection,
    loadStickerCollection,
    saveStickerCollection,
} from '@/services/stickerStorage';

import type { StickerCollection } from '@/types/album';

import {
    getNextStickerCopies,
    normalizeCopies,
} from '@/utils/stickerState';


interface StickerContextValue {
    collection: StickerCollection;
    isHydrated: boolean;
    storageError: string | null;

    getCopies: (stickerId: string) => number;
    incrementSticker: (stickerId: string) => Promise<void>;
    decrementSticker: (stickerId: string) => Promise<void>;
    setStickerCopies: (
        stickerId: string,
        copies: number
    ) => Promise<void>;
    resetCollection: () => Promise<void>;
    clearStorageError: () => void;
}

export const StickerContext =
    createContext<StickerContextValue | null>(null);

export function StickerProvider({
                                    children,
                                }: PropsWithChildren) {
    const [collection, setCollection] =
        useState<StickerCollection>({});

    const collectionRef =
        useRef<StickerCollection>({});

    const [isHydrated, setIsHydrated] =
        useState(false);

    const [storageError, setStorageError] =
        useState<string | null>(null);

    const updateCollection = useCallback(
        (nextCollection: StickerCollection) => {
            collectionRef.current = nextCollection;
            setCollection(nextCollection);
        },
        []
    );

    useEffect(() => {
        async function hydrateCollection() {
            try {
                const savedCollection =
                    await loadStickerCollection();

                updateCollection(savedCollection);
                setStorageError(null);
            } catch (error) {
                console.error(
                    'Failed to hydrate sticker collection:',
                    error
                );

                updateCollection({});

                setStorageError(
                    'Your saved collection could not be loaded.'
                );
            } finally {
                setIsHydrated(true);
            }
        }

        void hydrateCollection();
    }, [updateCollection]);

    const persistCollection = useCallback(
        async (
            nextCollection: StickerCollection,
            errorMessage: string
        ) => {
            updateCollection(nextCollection);
            setStorageError(null);

            try {
                await saveStickerCollection(nextCollection);
            } catch (error) {
                console.error(
                    'Failed to persist sticker collection:',
                    error
                );

                setStorageError(errorMessage);
            }
        },
        [updateCollection]
    );

    const getCopies = useCallback(
        (stickerId: string): number => {
            return collectionRef.current[stickerId] ?? 0;
        },
        []
    );

    const incrementSticker = useCallback(
        async (stickerId: string) => {
            const currentCollection = collectionRef.current;
            const currentCopies = currentCollection[stickerId] ?? 0;
            const nextCopies = getNextStickerCopies(currentCopies);

            const nextCollection: StickerCollection = {
                ...currentCollection,
                [stickerId]: nextCopies,
            };

            await persistCollection(
                nextCollection,
                'Your sticker change could not be saved.'
            );
        },
        [persistCollection]
    );

    const decrementSticker = useCallback(
        async (stickerId: string) => {
            const currentCollection = collectionRef.current;
            const currentCopies = currentCollection[stickerId] ?? 0;

            if (currentCopies === 0) {
                return;
            }

            const nextCopies = currentCopies - 1;
            const nextCollection: StickerCollection = {
                ...currentCollection,
            };

            if (nextCopies === 0) {
                delete nextCollection[stickerId];
            } else {
                nextCollection[stickerId] = nextCopies;
            }

            await persistCollection(
                nextCollection,
                'Your sticker change could not be saved.'
            );
        },
        [persistCollection]
    );

    const setStickerCopies = useCallback(
        async (
            stickerId: string,
            copies: number
        ) => {
            const normalizedCopies =
                normalizeCopies(copies);

            const nextCollection: StickerCollection = {
                ...collectionRef.current,
            };

            if (normalizedCopies === 0) {
                delete nextCollection[stickerId];
            } else {
                nextCollection[stickerId] =
                    normalizedCopies;
            }

            await persistCollection(
                nextCollection,
                'Your sticker count could not be saved.'
            );
        },
        [persistCollection]
    );

    const resetCollection = useCallback(
        async () => {
            try {
                await clearStickerCollection();

                updateCollection({});
                setStorageError(null);
            } catch (error) {
                console.error(
                    'Failed to reset sticker collection:',
                    error
                );

                setStorageError(
                    'Your collection could not be reset.'
                );
            }
        },
        [updateCollection]
    );

    const clearStorageError = useCallback(() => {
        setStorageError(null);
    }, []);

    const value = useMemo<StickerContextValue>(
        () => ({
            collection,
            isHydrated,
            storageError,
            getCopies,
            incrementSticker,
            decrementSticker,
            setStickerCopies,
            resetCollection,
            clearStorageError,
        }),
        [
            collection,
            isHydrated,
            storageError,
            getCopies,
            incrementSticker,
            decrementSticker,
            setStickerCopies,
            resetCollection,
            clearStorageError,
        ]
    );

    return (
        <StickerContext.Provider value={value}>
            {children}
        </StickerContext.Provider>
    );
}