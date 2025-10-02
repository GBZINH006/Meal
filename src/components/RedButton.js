// src/components/RedButton.js
import React from "react";
import { TouchableOpacity, Text } from "react-native";
import global from "../styles/global";

export default function RedButton({ title, onPress, disabled, style }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[global.button, style, disabled && { opacity: 0.6 }]}>
      <Text style={global.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}
