import {
    memo,
} from 'react';

import {
    StyleSheet,
    View,
} from 'react-native';

import { theme } from '@/constants/theme';

import type {
    AlbumHeaderProgressProps,
} from './albumHeader.types';

function AlbumHeaderProgressComponent({
                                          percentage,
                                          compact = false,
                                      }: AlbumHeaderProgressProps) {
    return (
        <View
            style={
                compact
                    ? styles.compactTrack
                    : styles.expandedTrack
            }
        >
            <View
                style={[
                    compact
                        ? styles.compactFill
                        : styles.expandedFill,
                    {
                        width:
                            `${percentage}%`,
                    },
                ]}
            />
        </View>
    );
}

export const AlbumHeaderProgress = memo(
    AlbumHeaderProgressComponent
);

const styles = StyleSheet.create({
    expandedTrack: {
        height: 7,
        marginTop:
        theme.spacing.md,
        overflow: 'hidden',
        borderRadius:
        theme.radius.full,
        backgroundColor:
            'rgba(255,255,255,0.08)',
    },

    expandedFill: {
        height: '100%',
        borderRadius:
        theme.radius.full,
        backgroundColor:
        theme.colors.owned,
    },

    compactTrack: {
        height: 4,
        overflow: 'hidden',
        borderRadius:
        theme.radius.full,
        backgroundColor:
            'rgba(255,255,255,0.08)',
    },

    compactFill: {
        height: '100%',
        borderRadius:
        theme.radius.full,
        backgroundColor:
        theme.colors.owned,
    },
});