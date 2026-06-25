import Ionicons from '@expo/vector-icons/Ionicons';

import type {
    BottomTabBarProps,
} from '@react-navigation/bottom-tabs';

import {
    BlurView,
} from 'expo-blur';

import {
    memo,
    type ComponentProps,
    useCallback,
    useEffect,
} from 'react';

import {
    Platform,
    Pressable,
    StyleSheet,
    useWindowDimensions,
    View,
} from 'react-native';

import {
    useSafeAreaInsets,
} from 'react-native-safe-area-context';

import Animated, {
    FadeInDown,
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

import { theme } from '@/constants/theme';

type IoniconName =
    ComponentProps<
        typeof Ionicons
    >['name'];

interface TabIconNames {
    active: IoniconName;
    inactive: IoniconName;
}

type GlassTabBarProps =
    BottomTabBarProps;

interface GlassTabItemProps {
    routeKey: string;
    routeName: string;
    label: string;
    isFocused: boolean;
    itemWidth: number;

    options:
        BottomTabBarProps[
            'descriptors'
            ][string]['options'];

    navigation:
        BottomTabBarProps['navigation'];
}

const TAB_ICONS:
    Record<
        string,
        TabIconNames
    > = {
    index: {
        active: 'book',
        inactive:
            'book-outline',
    },

    collection: {
        active: 'albums',
        inactive:
            'albums-outline',
    },

    share: {
        active:
            'share-social',
        inactive:
            'share-social-outline',
    },

    settings: {
        active: 'settings',
        inactive:
            'settings-outline',
    },
};

const ACTIVE_SPRING = {
    damping: 24,
    stiffness: 180,
    mass: 0.9,
};

const BAR_HORIZONTAL_PADDING = 5;
const BAR_ITEM_GAP = 3;
const MINIMUM_ITEM_WIDTH = 52;
const MINIMUM_BAR_WIDTH = 64;

function getTabLabel(
    routeName: string,
    options:
    GlassTabItemProps['options']
): string {
    const label =
        options.tabBarLabel;

    if (
        typeof label ===
        'string'
    ) {
        return label;
    }

    if (
        typeof options.title ===
        'string'
    ) {
        return options.title;
    }

    return routeName === 'index'
        ? 'Album'
        : routeName
            .charAt(0)
            .toUpperCase() +
        routeName.slice(1);
}

const GlassTabItem = memo(
    function GlassTabItem({
                              routeKey,
                              routeName,
                              label,
                              isFocused,
                              itemWidth,
                              options,
                              navigation,
                          }: GlassTabItemProps) {
        const focusProgress =
            useSharedValue(
                isFocused ? 1 : 0
            );

        const pressProgress =
            useSharedValue(0);

        useEffect(() => {
            focusProgress.value =
                withSpring(
                    isFocused
                        ? 1
                        : 0,
                    ACTIVE_SPRING
                );
        }, [
            focusProgress,
            isFocused,
        ]);

        const animatedPillStyle =
            useAnimatedStyle(() => ({
                backgroundColor:
                    interpolateColor(
                        focusProgress.value,
                        [0, 1],
                        [
                            'rgba(255,255,255,0)',
                            'rgba(245,197,24,0.16)',
                        ]
                    ),

                borderColor:
                    interpolateColor(
                        focusProgress.value,
                        [0, 1],
                        [
                            'rgba(255,255,255,0)',
                            'rgba(245,197,24,0.30)',
                        ]
                    ),

                transform: [
                    {
                        scale:
                            interpolate(
                                pressProgress.value,
                                [0, 1],
                                [1, 0.97]
                            ),
                    },
                    {
                        translateY:
                            interpolate(
                                focusProgress.value,
                                [0, 1],
                                [0, -0.5]
                            ),
                    },
                ],
            }));

        const animatedIconStyle =
            useAnimatedStyle(() => ({
                transform: [
                    {
                        scale:
                            interpolate(
                                focusProgress.value,
                                [0, 1],
                                [1, 1.04]
                            ),
                    },
                ],
            }));

        const animatedLabelStyle =
            useAnimatedStyle(() => ({
                opacity:
                    interpolate(
                        focusProgress.value,
                        [0, 1],
                        [0.72, 1]
                    ),

                transform: [
                    {
                        translateY:
                            interpolate(
                                focusProgress.value,
                                [0, 1],
                                [1, 0]
                            ),
                    },
                ],
            }));

        const iconNames =
            TAB_ICONS[routeName] ??
            TAB_ICONS.index;

        const iconColor =
            isFocused
                ? theme.colors.gold
                : theme.colors
                    .textMuted;

        const handlePress =
            useCallback(() => {
                const event =
                    navigation.emit({
                        type:
                            'tabPress',
                        target:
                        routeKey,
                        canPreventDefault:
                            true,
                    });

                if (
                    !isFocused &&
                    !event.defaultPrevented
                ) {
                    navigation.navigate(
                        routeName
                    );
                }
            }, [
                isFocused,
                navigation,
                routeKey,
                routeName,
            ]);

        const handleLongPress =
            useCallback(() => {
                navigation.emit({
                    type:
                        'tabLongPress',
                    target:
                    routeKey,
                });
            }, [
                navigation,
                routeKey,
            ]);

        return (
            <View
                style={[
                    styles.itemContainer,
                    {
                        width:
                        itemWidth,
                    },
                ]}
            >
                <Pressable
                    accessibilityRole="button"
                    accessibilityState={{
                        selected:
                        isFocused,
                    }}
                    accessibilityLabel={
                        options
                            .tabBarAccessibilityLabel
                    }
                    testID={
                        options
                            .tabBarButtonTestID
                    }
                    onPress={
                        handlePress
                    }
                    onLongPress={
                        handleLongPress
                    }
                    onPressIn={() => {
                        pressProgress.value =
                            withTiming(
                                1,
                                {
                                    duration:
                                        90,
                                }
                            );
                    }}
                    onPressOut={() => {
                        pressProgress.value =
                            withTiming(
                                0,
                                {
                                    duration:
                                        120,
                                }
                            );
                    }}
                    style={
                        styles.pressable
                    }
                >
                    <Animated.View
                        style={[
                            styles.itemPill,
                            animatedPillStyle,
                        ]}
                    >
                        <Animated.View
                            style={
                                animatedIconStyle
                            }
                        >
                            <Ionicons
                                name={
                                    isFocused
                                        ? iconNames.active
                                        : iconNames.inactive
                                }
                                size={20}
                                color={
                                    iconColor
                                }
                            />
                        </Animated.View>

                        <Animated.Text
                            numberOfLines={1}
                            style={[
                                styles.label,
                                {
                                    color:
                                    iconColor,
                                },
                                animatedLabelStyle,
                            ]}
                        >
                            {label}
                        </Animated.Text>
                    </Animated.View>
                </Pressable>
            </View>
        );
    }
);

function GlassTabBarComponent({
                                  state,
                                  descriptors,
                                  navigation,
                              }: GlassTabBarProps) {
    const insets =
        useSafeAreaInsets();

    const {
        width: screenWidth,
    } = useWindowDimensions();

    const fullBarWidth =
        Math.max(
            MINIMUM_BAR_WIDTH,
            screenWidth -
            theme.spacing.md * 2
        );

    const availableItemsWidth =
        fullBarWidth -
        BAR_HORIZONTAL_PADDING *
        2 -
        BAR_ITEM_GAP *
        Math.max(
            0,
            state.routes.length -
            1
        );

    const itemWidth =
        Math.max(
            MINIMUM_ITEM_WIDTH,
            availableItemsWidth /
            Math.max(
                state.routes.length,
                1
            )
        );

    return (
        <Animated.View
            entering={
                FadeInDown.duration(
                    220
                )
            }
            style={[
                styles.outerContainer,
                {
                    paddingBottom:
                        Math.max(
                            insets.bottom,
                            8
                        ),
                },
            ]}
        >
            <View
                style={[
                    styles.shadowContainer,
                    {
                        width:
                        fullBarWidth,
                    },
                ]}
            >
                <BlurView
                    intensity={62}
                    tint="dark"
                    style={
                        StyleSheet.absoluteFill
                    }
                />

                <View
                    pointerEvents="none"
                    style={
                        styles.glassOverlay
                    }
                />

                <View
                    style={
                        styles.tabRow
                    }
                >
                    {state.routes.map(
                        (
                            route,
                            index
                        ) => {
                            const descriptor =
                                descriptors[
                                    route.key
                                    ];

                            const options =
                                descriptor
                                    .options;

                            return (
                                <GlassTabItem
                                    key={
                                        route.key
                                    }
                                    routeKey={
                                        route.key
                                    }
                                    routeName={
                                        route.name
                                    }
                                    label={getTabLabel(
                                        route.name,
                                        options
                                    )}
                                    isFocused={
                                        state.index ===
                                        index
                                    }
                                    itemWidth={
                                        itemWidth
                                    }
                                    options={
                                        options
                                    }
                                    navigation={
                                        navigation
                                    }
                                />
                            );
                        }
                    )}
                </View>
            </View>
        </Animated.View>
    );
}

export const GlassTabBar = memo(
    GlassTabBarComponent
);

const styles = StyleSheet.create({
    outerContainer: {
        alignItems: 'center',
        paddingTop: 6,
        paddingHorizontal:
        theme.spacing.md,
        backgroundColor:
            'transparent',
    },

    shadowContainer: {
        minHeight: 60,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor:
            'rgba(255,255,255,0.13)',
        borderRadius: 26,
        backgroundColor:
            'rgba(11,28,58,0.62)',

        shadowColor:
            '#000000',

        shadowOffset: {
            width: 0,
            height: 8,
        },

        shadowOpacity:
            Platform.OS ===
            'ios'
                ? 0.22
                : 0,

        shadowRadius: 18,
        elevation: 10,
    },

    glassOverlay: {
        ...StyleSheet.absoluteFillObject,

        backgroundColor:
            'rgba(255,255,255,0.025)',
    },

    tabRow: {
        minHeight: 60,
        padding:
        BAR_HORIZONTAL_PADDING,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: BAR_ITEM_GAP,
    },

    itemContainer: {
        minWidth: 0,
        overflow: 'hidden',
    },

    pressable: {
        width: '100%',
        borderRadius:
        theme.radius.full,
    },

    itemPill: {
        width: '100%',
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        paddingHorizontal: 4,
        borderWidth: 1,
        borderRadius:
        theme.radius.full,
    },

    label: {
        fontSize: 9,
        lineHeight: 11,

        fontWeight:
        theme.typography.weights
            .semibold,
    },
});