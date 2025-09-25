// src/styles/global.js
import { StyleSheet } from "react-native";
import config from "../config/appConfig";

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff"
  },
  center: { alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", color: "#222", marginBottom: 12 },
  subtitle: { fontSize: 18, fontWeight: "600", color: "#333", marginBottom: 8 },
  label: { fontSize: 14, color: "#333", marginBottom: 6 },
  small: { fontSize: 12, color: "#666" },
  redText: { color: config.primaryColor, fontWeight: "700" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff"
  },
  card: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 12
  },
  buttonPrimary: {
    backgroundColor: config.primaryColor,
    padding: 12,
    borderRadius: 10,
    alignItems: "center"
  },
  buttonPrimaryText: { color: "#fff", fontWeight: "700" },
  buttonDisabled: { backgroundColor: "#e0a6a6" },
  badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, alignSelf: "flex-start" },
  badgeRed: { backgroundColor: config.primaryColor, color: "#fff" },
  badgeGreen: { backgroundColor: "#2e7d32", color: "#fff" },
  spacerSmall: { height: 8 },
  spacer: { height: 16 },
  spacerLarge: { height: 24 }
});
