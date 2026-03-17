import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withDelay,
    Easing,
} from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';

const Dot = ({ delay }: { delay: number }) => {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0.4);

    useEffect(() => {
        translateY.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(-6, { duration: 300, easing: Easing.out(Easing.ease) }),
                    withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) }),
                    withTiming(0, { duration: 400 }) // pause at bottom
                ),
                -1,
                true // reverse
            )
        );

        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: 300 }),
                    withTiming(0.4, { duration: 300 }),
                    withTiming(0.4, { duration: 400 })
                ),
                -1,
                true
            )
        );
    }, [delay]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    return <Animated.View style={[styles.dot, animatedStyle]} />;
};

export default function TypingIndicator() {
    return (
        <View style={styles.container}>
            <View style={styles.bubble}>
                <Dot delay={0} />
                <Dot delay={150} />
                <Dot delay={300} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignSelf: 'flex-start',
        maxWidth: '80%',
        marginVertical: 4,
    },
    bubble: {
        backgroundColor: Colors.white,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 20,
        borderBottomLeftRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.gray[500],
        marginHorizontal: 3,
    },
});
