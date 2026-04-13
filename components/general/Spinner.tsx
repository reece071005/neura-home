import {Animated} from 'react-native'
import React, {useEffect, useRef} from 'react'
import SpinnerSvg from "@/assets/illustrations/spinner.svg"

type SpinnerProps = {
    size?: number;
    duration?: number;
}

const Spinner = ({size=260, duration=1200}: SpinnerProps) => {
    const rotate = useRef(new Animated.Value(0)).current;

    useEffect(()=> {
        Animated.loop(
            Animated.timing(rotate, {
                toValue: 1,
                duration,
                useNativeDriver: true,
            })
        ).start();
        }, []);

    const spin = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    return (
        <Animated.View style={{transform: [{rotate: spin}]}}>
            <SpinnerSvg width={size} size={size} />
        </Animated.View>
    )
}
export default Spinner

