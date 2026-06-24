import {
    memo,
    useCallback,
    useMemo,
} from 'react';

import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Animated, {
    Extrapolation,
    interpolate,
    type SharedValue,
    useAnimatedStyle,
} from 'react-native-reanimated';

import { SectionSelector } from '@/components/album/SectionSelector';
import { theme } from '@/constants/theme';
import type { AlbumSection } from '@/types/album';

interface AlbumSectionToolbarProps {
    sections: AlbumSection[];

    pagePosition: SharedValue<number>;

    selectedIndex: number;

    scrollY: SharedValue<number>;

    albumSectionsSnapOffset: number;

    top: number;
    height: number;

    isInteractive: boolean;

    onSelectOverview: () => void;

    onSelectSection: (
        sectionId: string,
        sectionIndex: number
    ) => void;
}

interface ToolbarAnimationOptions {
    scrollY: SharedValue<number>;
    snapOffset: number;
}

const OVERVIEW_ID = 'album-overview';
const OVERVIEW_PAGE_INDEX = 0;
const SECTION_PAGE_OFFSET = 1;

const OVERVIEW_SECTION: AlbumSection = {
    id: OVERVIEW_ID,
    name: 'All',
    federation: 'Quick access',
    stickers: [],
};

function clampIndex(
    index: number,
    pageCount: number
): number {
    if (pageCount <= 0) {
        return 0;
    }

    return Math.max(
        0,
        Math.min(
            Math.floor(index),
            pageCount - 1
        )
    );
}

function useToolbarRevealAnimation({
                                       scrollY,
                                       snapOffset,
                                   }: ToolbarAnimationOptions) {
    const normalizedSnapOffset =
        Math.max(
            1,
            snapOffset
        );

    return useAnimatedStyle(() => {
        const revealStart =
            normalizedSnapOffset * 0.58;

        const revealEnd =
            normalizedSnapOffset * 0.92;

        return {
            opacity: interpolate(
                scrollY.value,
                [
                    revealStart,
                    revealEnd,
                ],
                [0, 1],
                Extrapolation.CLAMP
            ),

            transform: [
                {
                    translateY:
                        interpolate(
                            scrollY.value,
                            [
                                revealStart,
                                revealEnd,
                            ],
                            [28, 0],
                            Extrapolation.CLAMP
                        ),
                },
            ],
        };
    });
}

function AlbumSectionToolbarComponent({
                                          sections,
                                          pagePosition,
                                          selectedIndex,
                                          scrollY,
                                          albumSectionsSnapOffset,
                                          top,
                                          height,
                                          isInteractive,
                                          onSelectOverview,
                                          onSelectSection,
                                      }: AlbumSectionToolbarProps) {
    const selectorSections =
        useMemo(
            () => [
                OVERVIEW_SECTION,
                ...sections,
            ],
            [sections]
        );

    const pageCount =
        selectorSections.length;

    const normalizedSelectedIndex =
        clampIndex(
            selectedIndex,
            pageCount
        );

    const currentPosition =
        pageCount > 0
            ? normalizedSelectedIndex + 1
            : 0;

    const revealAnimatedStyle =
        useToolbarRevealAnimation({
            scrollY,
            snapOffset:
            albumSectionsSnapOffset,
        });

    const handleSelectItem =
        useCallback(
            (
                sectionId: string,
                selectorIndex: number
            ) => {
                if (
                    selectorIndex ===
                    OVERVIEW_PAGE_INDEX ||
                    sectionId ===
                    OVERVIEW_ID
                ) {
                    onSelectOverview();
                    return;
                }

                const sectionIndex =
                    selectorIndex -
                    SECTION_PAGE_OFFSET;

                const section =
                    sections[sectionIndex];

                if (!section) {
                    return;
                }

                onSelectSection(
                    section.id,
                    sectionIndex
                );
            },
            [
                onSelectOverview,
                onSelectSection,
                sections,
            ]
        );

    return (
        <Animated.View
            pointerEvents={
                isInteractive
                    ? 'auto'
                    : 'none'
            }
            accessibilityElementsHidden={
                !isInteractive
            }
            importantForAccessibility={
                isInteractive
                    ? 'auto'
                    : 'no-hide-descendants'
            }
            style={[
                styles.container,
                {
                    top,
                    height,
                },
                revealAnimatedStyle,
            ]}
        >
            <View style={styles.introRow}>
                <View style={styles.copy}>
                    <Text style={styles.title}>
                        Album sections
                    </Text>

                    <Text style={styles.subtitle}>
                        Swipe sideways to explore
                    </Text>
                </View>

                <View
                    accessibilityRole="text"
                    accessibilityLabel={
                        pageCount > 0
                            ? `Page ${currentPosition} of ${pageCount}`
                            : 'No album pages'
                    }
                    style={styles.position}
                >
                    <Text
                        style={
                            styles.currentPosition
                        }
                    >
                        {currentPosition}
                    </Text>

                    <Text
                        style={
                            styles.totalPosition
                        }
                    >
                        {' '}
                        / {pageCount}
                    </Text>
                </View>
            </View>

            <View style={styles.selectorRow}>
                <SectionSelector
                    sections={
                        selectorSections
                    }
                    pagePosition={
                        pagePosition
                    }
                    selectedIndex={
                        normalizedSelectedIndex
                    }
                    onSelectSection={
                        handleSelectItem
                    }
                />
            </View>
        </Animated.View>
    );
}

function areAlbumSectionToolbarPropsEqual(
    previous: AlbumSectionToolbarProps,
    next: AlbumSectionToolbarProps
): boolean {
    return (
        previous.sections ===
        next.sections &&
        previous.pagePosition ===
        next.pagePosition &&
        previous.selectedIndex ===
        next.selectedIndex &&
        previous.scrollY ===
        next.scrollY &&
        previous
            .albumSectionsSnapOffset ===
        next.albumSectionsSnapOffset &&
        previous.top ===
        next.top &&
        previous.height ===
        next.height &&
        previous.isInteractive ===
        next.isInteractive &&
        previous.onSelectOverview ===
        next.onSelectOverview &&
        previous.onSelectSection ===
        next.onSelectSection
    );
}

export const AlbumSectionToolbar = memo(
    AlbumSectionToolbarComponent,
    areAlbumSectionToolbarPropsEqual
);

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 0,
        left: 0,
        zIndex: 15,
        paddingTop:
        theme.spacing.lg,
        paddingBottom:
        theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor:
        theme.colors.border,
        backgroundColor:
        theme.colors.background,
    },

    introRow: {
        marginBottom:
        theme.spacing.lg,
        paddingHorizontal:
        theme.spacing.xl,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent:
            'space-between',
        gap: theme.spacing.lg,
    },

    selectorRow: {
        width: '100%',
        paddingHorizontal:
        theme.spacing.md,
    },

    copy: {
        flex: 1,
    },

    title: {
        fontSize: 28,
        lineHeight: 34,
        fontWeight:
        theme.typography.weights.bold,
        letterSpacing: -0.6,
        color:
        theme.colors.textPrimary,
    },

    subtitle: {
        marginTop: 7,
        fontSize:
        theme.typography.sizes.xs,
        lineHeight: 18,
        color:
        theme.colors.textSecondary,
    },

    position: {
        flexShrink: 0,
        paddingBottom: 2,
        flexDirection: 'row',
        alignItems: 'baseline',
    },

    currentPosition: {
        fontSize:
        theme.typography.sizes.xl,
        fontWeight:
        theme.typography.weights.bold,
        color:
        theme.colors.gold,
    },

    totalPosition: {
        fontSize:
        theme.typography.sizes.xs,
        color:
        theme.colors.textSecondary,
    },
});