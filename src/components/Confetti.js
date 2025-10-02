// src/components/Confetti.js
import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

export default function Confetti({ run = false, count = 100, origin = { x: 0, y: 0 }, fadeOut = true, onComplete }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!run) return;
    const timeout = setTimeout(() => {
      if (typeof onComplete === "function") onComplete();
    }, 3000);
    return () => clearTimeout(timeout);
  }, [run, onComplete]);

  if (!run) return <View />;

  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      <ConfettiCannon ref={ref} count={count} origin={origin} fadeOut={fadeOut} />
    </View>
  );
}
