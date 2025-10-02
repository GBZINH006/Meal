// src/styles/global.js
import { StyleSheet, Platform } from "react-native";

export default StyleSheet.create({
  // Container padrão para telas
  container: {
    flex: 1,
    backgroundColor: "#F7F7FA",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 20,
  },

  // Textos principais
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 18,
  },
  muted: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },

  // Labels e pequenas instruções
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
  },
  redText: {
    color: "#FF5A5F",
    fontWeight: "700",
  },

  // Inputs
  input: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#222",
    borderWidth: 1,
    borderColor: "#E6E6EA",
    marginBottom: 12,
  },
  inputSmall: {
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FFF",
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#222",
    borderWidth: 1,
    borderColor: "#E6E6EA",
  },

  // Botões principais (vermelho)
  button: {
    height: 50,
    backgroundColor: "#FF5A5F",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#FF5A5F",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  // Botões secundários
  buttonOutline: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginTop: 10,
  },
  buttonOutlineText: {
    color: "#333",
    fontSize: 15,
    fontWeight: "600",
  },

  // Cards e lists
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },

  // Avatares / imagens
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEE",
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#EEE",
  },

  // Tipos de texto utilitários
  hint: {
    fontSize: 12,
    color: "#999",
  },
  errorText: {
    fontSize: 13,
    color: "#D44",
    marginTop: 6,
  },

  // Layout helpers
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },

  // Footer / small actions
  footerText: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    marginTop: 18,
  },

  // Small chips / badges
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFD7D7",
  },
  badgeText: {
    color: "#FF5A5F",
    fontSize: 12,
    fontWeight: "700",
  },
});
