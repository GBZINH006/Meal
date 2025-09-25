// src/components/Confetti.js
import React, { useEffect, useRef } from "react";
import { View, Animated, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export default function Confetti({ show = false, count = 20, onComplete }) {
  const pieces = useRef(
    new Array(count).fill(0).map(() => ({
      x: Math.random() * width,
      delay: Math.random() * 300,
      fall: new Animated.Value(0),
      rotate: new Animated.Value(Math.random() * 360),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.7 + Math.random() * 0.8)
    }))
  ).current;

  useEffect(() => {
    if (!show) return;
    const animations = pieces.map(p =>
      Animated.sequence([
        Animated.delay(p.delay),
        Animated.parallel([
          Animated.timing(p.fall, { toValue: height + 80, duration: 1200 + Math.random() * 600, useNativeDriver: true }),
          Animated.timing(p.opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(p.rotate, { toValue: p.rotate._value + (Math.random() * 600 - 200), duration: 1200 + Math.random() * 600, useNativeDriver: true })
        ])
      ])
    );
    Animated.stagger(8, animations).start(() => {
      if (onComplete) onComplete();
      pieces.forEach(p => { p.fall.setValue(0); p.opacity.setValue(0); });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (!show) return null;

  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width, height }}>
      {pieces.map((p, i) =>{
        const translateY = p.fall;
        const translateX = p.fall.interpolate({ inputRange: [0, height], outputRange: [0, Math.random() * 40 - 20] });
        const rotate = p.rotate.interpolate({ inputRange: [0, 360], outputRange: ["0deg", "360deg"] });
        const color = ["#ff5252", "#ffb74d", "#ffd54f", "#e57373", "#f48fb1"][i % 5];
        return (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              left: p.x,
              transform: [{ translateY }, { translateX }, { rotate }, { scale: p.scale }],
              opacity: p.opacity,
              width: 10 + (i % 3) * 6,
              height: 14 + (i % 4) * 4,
              backgroundColor: color,
              borderRadius: 2
            }}
          />
        );
      })}
    </View>
  );
}
