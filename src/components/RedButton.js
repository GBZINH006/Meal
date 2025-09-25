// src/components/RedButton.js
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import config from "../config/appConfig";

export default function RedButton({ title, onPress, style, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, style, disabled && styles.disabled]}
      disabled={disabled}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: config.primaryColor,
    padding: 12,
    borderRadius: 10,
    alignItems: "center"
  },
  text: { color: "#fff", fontWeight: "700" },
  disabled: { backgroundColor: "#e0a6a6" }
});
