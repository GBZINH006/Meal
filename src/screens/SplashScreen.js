import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";

function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(() => {
      navigation.replace("Login");
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.splashContainer}>
      <Animated.Text style={[styles.splashTitle, { opacity: fadeAnim }]}>
        MealV
      </Animated.Text>
      <Animated.Text style={[styles.splashSubtitle, { opacity: fadeAnim }]}>
        Controle de tickets escolares
      </Animated.Text>
    </View>
  );
}
const styles = StyleSheet.create({
    splashContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FF5A5F",
    },
    splashTitle: {
        fontSize: 48,
        fontWeight: "bold",
        color: "#fff",
    },
    splashSubtitle: {
        fontSize: 16,
        color: "#fff",
        marginTop: 10,
    },
});

export default SplashScreen;