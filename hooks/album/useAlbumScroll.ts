import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import {
    type FlatList,
    type GestureResponderEvent,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from 'react-native';

import {
    cancelAnimation,
    Easing,
    runOnJS,
    type SharedValue,
    useAnimatedScrollHandler,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import type { StickerWithState } from '@/types/album';

type SectionList =
    FlatList<StickerWithState>;

type SectionListRefCallback = (
    instance: SectionList | null
) => void;

export type AlbumSectionScrollBehavior =
    | 'preserve'
    | 'section-start';

interface UseAlbumScrollOptions {
    albumSectionsSnapOffset: number;
    activeSectionId: string;
    sectionChangeBehavior?: AlbumSectionScrollBehavior;
    interactionThreshold?: number;
}

export interface AlbumScroll {
    scrollY: SharedValue<number>;

    isSharedHeaderInteractive: boolean;

    snapToOffsets: number[];
    scrollEventThrottle: number;

    handleVerticalScroll: ReturnType<
        typeof useAnimatedScrollHandler
    >;

    handleVerticalTouchStart: (
        event: GestureResponderEvent
    ) => void;

    handleVerticalScrollBeginDrag: (
        event: NativeSyntheticEvent<NativeScrollEvent>
    ) => void;

    handleVerticalScrollEndDrag: (
        event: NativeSyntheticEvent<NativeScrollEvent>
    ) => void;

    handleVerticalMomentumEnd: (
        event: NativeSyntheticEvent<NativeScrollEvent>
    ) => void;

    getSectionListRef: (
        sectionId: string
    ) => SectionListRefCallback;

    synchronizeSectionScroll: (
        sectionId: string
    ) => void;

    scrollToAlbumCover: (
        animated?: boolean
    ) => void;

    scrollToSections: (
        animated?: boolean
    ) => void;

    getCurrentVerticalOffset: () => number;
}

function normalizeOffset(
    value: number
): number {
    if (!Number.isFinite(value)) {
        return 0;
    }

    return Math.max(0, value);
}

export function useAlbumScroll({
                                   albumSectionsSnapOffset,
                                   activeSectionId,
                                   sectionChangeBehavior = 'preserve',
                                   interactionThreshold = 0.9,
                               }: UseAlbumScrollOptions): AlbumScroll {
    const normalizedSnapOffset = Math.max(
        1,
        albumSectionsSnapOffset
    );

    const normalizedInteractionThreshold =
        Math.max(
            0,
            Math.min(
                1,
                interactionThreshold
            )
        );

    const interactionOffset =
        normalizedSnapOffset *
        normalizedInteractionThreshold;

    const scrollY = useSharedValue(0);

    /*
     * Expanded overview:
     *     minimumAllowedOffset = 0
     *
     * Collapsed overview:
     *     minimumAllowedOffset =
     *         normalizedSnapOffset
     */
    const minimumAllowedOffset =
        useSharedValue(0);

    /*
     * Prevents a single overscroll frame from requesting
     * multiple identical boundary corrections.
     */
    const boundaryCorrectionRequested =
        useSharedValue(false);

    const activeSectionIdRef =
        useRef(activeSectionId);

    const currentVerticalOffsetRef =
        useRef(0);

    const sectionListRefs =
        useRef<Map<string, SectionList>>(
            new Map()
        );

    const sectionListRefCallbacks =
        useRef<
            Map<string, SectionListRefCallback>
        >(new Map());

    /*
     * Stores the required offset for a destination page
     * that has not mounted its FlatList yet.
     *
     * This is especially important when selecting a card
     * from the Overview page and jumping several pages.
     */
    const pendingSectionOffsetsRef =
        useRef<Map<string, number>>(
            new Map()
        );

    const pendingSynchronizationFrameRef =
        useRef<number | null>(null);

    const manualSnapTargetRef =
        useRef<number | null>(null);

    /*
     * Distinguishes a deliberate My Album header
     * transition from a sticker-grid boundary correction.
     */
    const isHeaderTransitionRef =
        useRef(false);

    const manualSnapFallbackRef =
        useRef<
            ReturnType<typeof setTimeout> | null
        >(null);

    const interactiveStateRef =
        useRef(false);

    const [
        isSharedHeaderInteractive,
        setIsSharedHeaderInteractive,
    ] = useState(false);

    useEffect(() => {
        activeSectionIdRef.current =
            activeSectionId;
    }, [activeSectionId]);

    useEffect(() => {
        return () => {
            if (
                pendingSynchronizationFrameRef.current !==
                null
            ) {
                cancelAnimationFrame(
                    pendingSynchronizationFrameRef.current
                );
            }

            if (
                manualSnapFallbackRef.current !==
                null
            ) {
                clearTimeout(
                    manualSnapFallbackRef.current
                );
            }

            pendingSectionOffsetsRef.current.clear();

            cancelAnimation(scrollY);
        };
    }, [scrollY]);

    const snapToOffsets = useMemo(
        () => [
            normalizedSnapOffset,
        ],
        [normalizedSnapOffset]
    );

    const updateToolbarInteraction =
        useCallback(
            (offset: number) => {
                const nextInteractive =
                    offset >= interactionOffset;

                if (
                    nextInteractive ===
                    interactiveStateRef.current
                ) {
                    return;
                }

                interactiveStateRef.current =
                    nextInteractive;

                setIsSharedHeaderInteractive(
                    nextInteractive
                );
            },
            [interactionOffset]
        );

    const synchronizeInactiveLists =
        useCallback(
            (offset: number) => {
                const normalizedOffset =
                    normalizeOffset(offset);

                const currentActiveSectionId =
                    activeSectionIdRef.current;

                sectionListRefs.current.forEach(
                    (list, sectionId) => {
                        if (
                            sectionId ===
                            currentActiveSectionId
                        ) {
                            return;
                        }

                        list.scrollToOffset({
                            offset:
                            normalizedOffset,
                            animated: false,
                        });
                    }
                );
            },
            []
        );

    const commitVerticalOffset =
        useCallback(
            (offset: number) => {
                const normalizedOffset =
                    normalizeOffset(offset);

                currentVerticalOffsetRef.current =
                    normalizedOffset;

                scrollY.value = Math.min(
                    normalizedOffset,
                    normalizedSnapOffset
                );

                updateToolbarInteraction(
                    normalizedOffset
                );

                if (
                    pendingSynchronizationFrameRef.current !==
                    null
                ) {
                    cancelAnimationFrame(
                        pendingSynchronizationFrameRef.current
                    );
                }

                pendingSynchronizationFrameRef.current =
                    requestAnimationFrame(() => {
                        pendingSynchronizationFrameRef.current =
                            null;

                        synchronizeInactiveLists(
                            normalizedOffset
                        );
                    });
            },
            [
                normalizedSnapOffset,
                scrollY,
                synchronizeInactiveLists,
                updateToolbarInteraction,
            ]
        );

    const clearManualSnapFallback =
        useCallback(() => {
            if (
                manualSnapFallbackRef.current ===
                null
            ) {
                return;
            }

            clearTimeout(
                manualSnapFallbackRef.current
            );

            manualSnapFallbackRef.current =
                null;
        }, []);

    const finishManualSnap =
        useCallback(() => {
            const targetOffset =
                manualSnapTargetRef.current;

            if (targetOffset === null) {
                return;
            }

            clearManualSnapFallback();

            manualSnapTargetRef.current =
                null;

            boundaryCorrectionRequested.value =
                false;

            /*
             * Header transitions animate scrollY
             * independently with withTiming().
             *
             * Committing here would cut the visual
             * animation short.
             */
            if (isHeaderTransitionRef.current) {
                isHeaderTransitionRef.current =
                    false;

                currentVerticalOffsetRef.current =
                    targetOffset;

                updateToolbarInteraction(
                    targetOffset
                );

                synchronizeInactiveLists(
                    targetOffset
                );

                return;
            }

            commitVerticalOffset(
                targetOffset
            );
        }, [
            boundaryCorrectionRequested,
            clearManualSnapFallback,
            commitVerticalOffset,
            synchronizeInactiveLists,
            updateToolbarInteraction,
        ]);

    const scrollActiveSectionTo =
        useCallback(
            (
                offset: number,
                animated: boolean
            ) => {
                const activeList =
                    sectionListRefs.current.get(
                        activeSectionIdRef.current
                    );

                if (!activeList) {
                    commitVerticalOffset(
                        offset
                    );

                    return;
                }

                activeList.scrollToOffset({
                    offset,
                    animated,
                });
            },
            [commitVerticalOffset]
        );

    const startManualSnap =
        useCallback(
            (targetOffset: number) => {
                clearManualSnapFallback();

                isHeaderTransitionRef.current =
                    false;

                manualSnapTargetRef.current =
                    targetOffset;

                scrollActiveSectionTo(
                    targetOffset,
                    true
                );

                manualSnapFallbackRef.current =
                    setTimeout(() => {
                        finishManualSnap();
                    }, 500);
            },
            [
                clearManualSnapFallback,
                finishManualSnap,
                scrollActiveSectionTo,
            ]
        );

    const correctActiveListBoundary =
        useCallback(
            (minimumOffset: number) => {
                const normalizedMinimum =
                    normalizeOffset(
                        minimumOffset
                    );

                const activeList =
                    sectionListRefs.current.get(
                        activeSectionIdRef.current
                    );

                currentVerticalOffsetRef.current =
                    normalizedMinimum;

                scrollY.value = Math.min(
                    normalizedMinimum,
                    normalizedSnapOffset
                );

                updateToolbarInteraction(
                    normalizedMinimum
                );

                activeList?.scrollToOffset({
                    offset:
                    normalizedMinimum,
                    animated: false,
                });

                synchronizeInactiveLists(
                    normalizedMinimum
                );

                requestAnimationFrame(() => {
                    boundaryCorrectionRequested.value =
                        false;
                });
            },
            [
                boundaryCorrectionRequested,
                normalizedSnapOffset,
                scrollY,
                synchronizeInactiveLists,
                updateToolbarInteraction,
            ]
        );

    const handleVerticalScroll =
        useAnimatedScrollHandler({
            onScroll: (event) => {
                const offset = Math.max(
                    0,
                    event.contentOffset.y
                );

                const minimumOffset =
                    minimumAllowedOffset.value;

                if (
                    offset <
                    minimumOffset &&
                    !boundaryCorrectionRequested.value
                ) {
                    boundaryCorrectionRequested.value =
                        true;

                    runOnJS(
                        correctActiveListBoundary
                    )(
                        minimumOffset
                    );

                    return;
                }

                if (
                    offset >=
                    minimumOffset
                ) {
                    boundaryCorrectionRequested.value =
                        false;
                }
            },
        });

    const handleVerticalTouchStart =
        useCallback(
            (
                _event: GestureResponderEvent
            ) => {
                // Compatibility handler.
            },
            []
        );

    const handleVerticalScrollBeginDrag =
        useCallback(
            (
                _event: NativeSyntheticEvent<NativeScrollEvent>
            ) => {
                boundaryCorrectionRequested.value =
                    false;
            },
            [
                boundaryCorrectionRequested,
            ]
        );

    const handleVerticalScrollEndDrag =
        useCallback(
            (
                event: NativeSyntheticEvent<NativeScrollEvent>
            ) => {
                if (
                    manualSnapTargetRef.current !==
                    null
                ) {
                    return;
                }

                const offset = normalizeOffset(
                    event.nativeEvent
                        .contentOffset.y
                );

                const minimumOffset =
                    minimumAllowedOffset.value;

                if (
                    offset <
                    minimumOffset
                ) {
                    correctActiveListBoundary(
                        minimumOffset
                    );
                }
            },
            [
                correctActiveListBoundary,
                minimumAllowedOffset,
            ]
        );

    const handleVerticalMomentumEnd =
        useCallback(
            (
                event: NativeSyntheticEvent<NativeScrollEvent>
            ) => {
                if (
                    manualSnapTargetRef.current !==
                    null
                ) {
                    finishManualSnap();
                    return;
                }

                const offset = normalizeOffset(
                    event.nativeEvent
                        .contentOffset.y
                );

                const minimumOffset =
                    minimumAllowedOffset.value;

                if (
                    offset <
                    minimumOffset
                ) {
                    correctActiveListBoundary(
                        minimumOffset
                    );

                    return;
                }

                boundaryCorrectionRequested.value =
                    false;

                commitVerticalOffset(offset);
            },
            [
                boundaryCorrectionRequested,
                commitVerticalOffset,
                correctActiveListBoundary,
                finishManualSnap,
                minimumAllowedOffset,
            ]
        );

    const getSectionListRef =
        useCallback(
            (
                sectionId: string
            ): SectionListRefCallback => {
                const existingCallback =
                    sectionListRefCallbacks.current.get(
                        sectionId
                    );

                if (existingCallback) {
                    return existingCallback;
                }

                const callback:
                    SectionListRefCallback = (
                    instance
                ) => {
                    if (!instance) {
                        sectionListRefs.current.delete(
                            sectionId
                        );

                        return;
                    }

                    sectionListRefs.current.set(
                        sectionId,
                        instance
                    );

                    /*
                     * Prefer a specifically requested reset
                     * for this section. Otherwise align the
                     * newly mounted list with the current
                     * shared vertical position.
                     */
                    const pendingOffset =
                        pendingSectionOffsetsRef.current.get(
                            sectionId
                        );

                    const targetOffset =
                        pendingOffset ??
                        currentVerticalOffsetRef.current;

                    /*
                     * PagerView may mount the destination
                     * page before its FlatList has completed
                     * layout. Waiting two frames ensures the
                     * requested offset is applied after both
                     * page and list layout have settled.
                     */
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            /*
                             * Confirm that this exact list is
                             * still registered before moving
                             * it. The page may have unmounted
                             * during rapid horizontal swipes.
                             */
                            const registeredList =
                                sectionListRefs.current.get(
                                    sectionId
                                );

                            if (
                                registeredList !==
                                instance
                            ) {
                                return;
                            }

                            instance.scrollToOffset({
                                offset:
                                targetOffset,
                                animated: false,
                            });

                            pendingSectionOffsetsRef.current.delete(
                                sectionId
                            );
                        });
                    });
                };

                sectionListRefCallbacks.current.set(
                    sectionId,
                    callback
                );

                return callback;
            },
            []
        );

    const getSectionTargetOffset =
        useCallback(() => {
            const currentOffset =
                currentVerticalOffsetRef.current;

            /*
             * When the album cover is expanded, switching
             * sections should preserve the expanded state.
             */
            if (currentOffset <= 0) {
                return 0;
            }

            /*
             * Any partial header position resolves to the
             * beginning of Album Sections.
             */
            if (
                currentOffset <
                normalizedSnapOffset
            ) {
                return normalizedSnapOffset;
            }

            if (
                sectionChangeBehavior ===
                'preserve'
            ) {
                return currentOffset;
            }

            /*
             * section-start always opens the destination
             * section directly beneath the fixed toolbar.
             */
            return normalizedSnapOffset;
        }, [
            normalizedSnapOffset,
            sectionChangeBehavior,
        ]);

    const synchronizeSectionScroll =
        useCallback(
            (sectionId: string) => {
                const targetOffset =
                    getSectionTargetOffset();

                currentVerticalOffsetRef.current =
                    targetOffset;

                scrollY.value = Math.min(
                    targetOffset,
                    normalizedSnapOffset
                );

                minimumAllowedOffset.value =
                    targetOffset <= 0
                        ? 0
                        : normalizedSnapOffset;

                boundaryCorrectionRequested.value =
                    false;

                updateToolbarInteraction(
                    targetOffset
                );

                /*
                 * Store the offset before looking up the
                 * list. When the destination page has not
                 * mounted yet, getSectionListRef will apply
                 * this exact offset after layout.
                 */
                pendingSectionOffsetsRef.current.set(
                    sectionId,
                    targetOffset
                );

                const targetList =
                    sectionListRefs.current.get(
                        sectionId
                    );

                if (!targetList) {
                    return;
                }

                /*
                 * The list already exists, so reset it
                 * immediately. A second application on the
                 * next frame makes this resilient to a
                 * PagerView page becoming active during the
                 * same render cycle.
                 */
                targetList.scrollToOffset({
                    offset:
                    targetOffset,
                    animated: false,
                });

                requestAnimationFrame(() => {
                    const registeredList =
                        sectionListRefs.current.get(
                            sectionId
                        );

                    if (
                        registeredList !==
                        targetList
                    ) {
                        return;
                    }

                    targetList.scrollToOffset({
                        offset:
                        targetOffset,
                        animated: false,
                    });

                    pendingSectionOffsetsRef.current.delete(
                        sectionId
                    );
                });
            },
            [
                boundaryCorrectionRequested,
                getSectionTargetOffset,
                minimumAllowedOffset,
                normalizedSnapOffset,
                scrollY,
                updateToolbarInteraction,
            ]
        );

    const scrollAllMountedSectionsToTarget =
        useCallback(
            (
                targetOffset: number,
                animated: boolean
            ) => {
                const normalizedTarget =
                    normalizeOffset(
                        targetOffset
                    );

                clearManualSnapFallback();

                minimumAllowedOffset.value =
                    normalizedTarget <= 0
                        ? 0
                        : normalizedSnapOffset;

                boundaryCorrectionRequested.value =
                    false;

                isHeaderTransitionRef.current =
                    true;

                manualSnapTargetRef.current =
                    normalizedTarget;

                currentVerticalOffsetRef.current =
                    normalizedTarget;

                /*
                 * Ensure pages mounted after this transition
                 * inherit its destination rather than a stale
                 * vertical offset.
                 */
                pendingSectionOffsetsRef.current.clear();

                cancelAnimation(scrollY);

                if (animated) {
                    scrollY.value = withTiming(
                        normalizedTarget,
                        {
                            duration: 380,
                            easing:
                                Easing.out(
                                    Easing.cubic
                                ),
                        }
                    );
                } else {
                    scrollY.value =
                        normalizedTarget;
                }

                updateToolbarInteraction(
                    normalizedTarget
                );

                const mountedLists =
                    Array.from(
                        sectionListRefs.current.values()
                    );

                if (
                    mountedLists.length === 0
                ) {
                    finishManualSnap();
                    return;
                }

                mountedLists.forEach(
                    (list) => {
                        list.scrollToOffset({
                            offset:
                            normalizedTarget,
                            animated,
                        });
                    }
                );

                if (!animated) {
                    isHeaderTransitionRef.current =
                        false;

                    finishManualSnap();
                    return;
                }

                manualSnapFallbackRef.current =
                    setTimeout(() => {
                        finishManualSnap();
                    }, 650);
            },
            [
                boundaryCorrectionRequested,
                clearManualSnapFallback,
                finishManualSnap,
                minimumAllowedOffset,
                normalizedSnapOffset,
                scrollY,
                updateToolbarInteraction,
            ]
        );

    const scrollToAlbumCover =
        useCallback(
            (animated = true) => {
                scrollAllMountedSectionsToTarget(
                    0,
                    animated
                );
            },
            [
                scrollAllMountedSectionsToTarget,
            ]
        );

    const scrollToSections =
        useCallback(
            (animated = true) => {
                scrollAllMountedSectionsToTarget(
                    normalizedSnapOffset,
                    animated
                );
            },
            [
                normalizedSnapOffset,
                scrollAllMountedSectionsToTarget,
            ]
        );

    const getCurrentVerticalOffset =
        useCallback(
            () =>
                currentVerticalOffsetRef.current,
            []
        );

    /*
     * Retained because it is part of the existing hook
     * implementation, even though current callers do not
     * invoke it directly.
     */
    void startManualSnap;

    return {
        scrollY,
        isSharedHeaderInteractive,

        snapToOffsets,
        scrollEventThrottle: 16,

        handleVerticalScroll,
        handleVerticalTouchStart,
        handleVerticalScrollBeginDrag,
        handleVerticalScrollEndDrag,
        handleVerticalMomentumEnd,

        getSectionListRef,
        synchronizeSectionScroll,

        scrollToAlbumCover,
        scrollToSections,
        getCurrentVerticalOffset,
    };
}