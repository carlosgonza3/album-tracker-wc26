import {
    useMemo,
} from 'react';

import {
    Gesture,
} from 'react-native-gesture-handler';

import {
    runOnJS,
    type SharedValue,
} from 'react-native-reanimated';

import {
    ALBUM_HEADER_COLLAPSED_THRESHOLD,
    ALBUM_HEADER_EXPANDED_THRESHOLD,
    ALBUM_HEADER_GESTURE_DISTANCE_THRESHOLD,
    ALBUM_HEADER_GESTURE_HORIZONTAL_FAILURE_OFFSET,
    ALBUM_HEADER_GESTURE_VELOCITY_THRESHOLD,
} from './albumHeader.constants';

interface UseAlbumHeaderGestureOptions {
    scrollY: SharedValue<number>;
    collapseDistance: number;
    onCollapseHeader: () => void;
    onExpandHeader: () => void;
}

export function useAlbumHeaderGesture({
                                          scrollY,
                                          collapseDistance,
                                          onCollapseHeader,
                                          onExpandHeader,
                                      }: UseAlbumHeaderGestureOptions) {
    return useMemo(() => {
        const panGesture = Gesture.Pan()
            .activeOffsetY([
                -10,
                10,
            ])
            .failOffsetX([
                -ALBUM_HEADER_GESTURE_HORIZONTAL_FAILURE_OFFSET,
                ALBUM_HEADER_GESTURE_HORIZONTAL_FAILURE_OFFSET,
            ])
            .onEnd((event) => {
                const isCollapsed =
                    scrollY.value >=
                    collapseDistance *
                    ALBUM_HEADER_COLLAPSED_THRESHOLD;

                const isExpanded =
                    scrollY.value <=
                    collapseDistance *
                    ALBUM_HEADER_EXPANDED_THRESHOLD;

                const swipedUp =
                    event.translationY <=
                    -ALBUM_HEADER_GESTURE_DISTANCE_THRESHOLD ||
                    event.velocityY <=
                    -ALBUM_HEADER_GESTURE_VELOCITY_THRESHOLD;

                const swipedDown =
                    event.translationY >=
                    ALBUM_HEADER_GESTURE_DISTANCE_THRESHOLD ||
                    event.velocityY >=
                    ALBUM_HEADER_GESTURE_VELOCITY_THRESHOLD;

                if (
                    isExpanded &&
                    swipedUp
                ) {
                    runOnJS(
                        onCollapseHeader
                    )();

                    return;
                }

                if (
                    isCollapsed &&
                    swipedDown
                ) {
                    runOnJS(
                        onExpandHeader
                    )();
                }
            });

        const tapGesture = Gesture.Tap()
            .maxDistance(10)
            .onEnd((_event, success) => {
                if (!success) {
                    return;
                }

                const isCollapsed =
                    scrollY.value >=
                    collapseDistance *
                    ALBUM_HEADER_COLLAPSED_THRESHOLD;

                if (isCollapsed) {
                    runOnJS(
                        onExpandHeader
                    )();
                }
            });

        return Gesture.Exclusive(
            panGesture,
            tapGesture
        );
    }, [
        collapseDistance,
        onCollapseHeader,
        onExpandHeader,
        scrollY,
    ]);
}