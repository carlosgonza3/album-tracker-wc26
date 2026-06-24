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
    cycleSticker: (stickerId: string) => Promise<void>;
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

    function updateCollection(
        nextCollection: StickerCollection
    ) {
        collectionRef.current = nextCollection;
        setCollection(nextCollection);
    }

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
    }, []);

    const persistCollection = useCallback(
        async (
            nextCollection: StickerCollection,
            errorMessage: string
        ) => {
            updateCollection(nextCollection);
            setStorageError(null);

            try {
                await saveStickerCollection(
                    nextCollection
                );
            } catch (error) {
                console.error(
                    'Failed to persist sticker collection:',
                    error
                );

                setStorageError(errorMessage);
            }
        },
        []
    );

    const getCopies = useCallback(
        (stickerId: string): number => {
            return collectionRef.current[stickerId] ?? 0;
        },
        []
    );

    const cycleSticker = useCallback(
        async (stickerId: string) => {
            const currentCollection =
                collectionRef.current;

            const currentCopies =
                currentCollection[stickerId] ?? 0;

            const nextCopies =
                getNextStickerCopies(currentCopies);

            const nextCollection = {
                ...currentCollection,
            };

            if (nextCopies === 0) {
                delete nextCollection[stickerId];
            } else {
                nextCollection[stickerId] =
                    nextCopies;
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

            const nextCollection = {
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
        []
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
            cycleSticker,
            setStickerCopies,
            resetCollection,
            clearStorageError,
        }),
        [
            collection,
            isHydrated,
            storageError,
            getCopies,
            cycleSticker,
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