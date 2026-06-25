import type {
    StyleProp,
    ViewStyle,
} from 'react-native';

import type {
    SharedValue,
} from 'react-native-reanimated';

export interface AlbumHeaderSummary {
    collected: number;
    remaining: number;
    repeated: number;
    total: number;
    percentage: number;
}

export interface AlbumHeaderProps {
    scrollY: SharedValue<number>;
    expandedHeight: number;
    safeAreaTop: number;
    summary: AlbumHeaderSummary;

    /**
     * Called after an upward gesture ends inside the
     * expanded My Album header.
     */
    onCollapseHeader: () => void;

    /**
     * Called after a downward gesture ends inside the
     * compact My Album header.
     */
    onExpandHeader: () => void;
}

export interface AlbumHeaderExpandedProps {
    safeAreaTop: number;
    summary: AlbumHeaderSummary;
    clampedPercentage: number;
    animatedStyle?: StyleProp<ViewStyle>;
}

export interface AlbumHeaderCompactProps {
    safeAreaTop: number;
    summary: AlbumHeaderSummary;
    clampedPercentage: number;
    animatedStyle?: StyleProp<ViewStyle>;
}

export interface AlbumHeaderProgressProps {
    percentage: number;
    compact?: boolean;
}