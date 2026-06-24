import { StyleSheet, View } from 'react-native';

import { theme } from '@/constants/theme';

interface ProgressBarProps {
    progress: number;
    height?: number;
}

export function ProgressBar({
                                progress,
                                height = 8,
                            }: ProgressBarProps) {
    const normalizedProgress = Math.min(
        100,
        Math.max(0, progress)
    );

    return (
        <View
            style={[
                styles.track,
                {
                    height,
                },
            ]}
        >
            <View
                style={[
                    styles.fill,
                    {
                        width: `${normalizedProgress}%`,
                    },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    track: {
        width: '100%',
        overflow: 'hidden',
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.surfaceStrong,
    },

    fill: {
        height: '100%',
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.gold,
    },
});