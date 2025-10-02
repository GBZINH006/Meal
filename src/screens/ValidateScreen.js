// src/screens/ValidateScreen.js
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, TouchableOpacity, StyleSheet } from "react-native";
import global from "../styles/global";
import Confetti from "../components/Confetti";
import StorageService from "../services/StorageService";

export default function ValidateScreen({ navigation, route }) {
  const ticketCode = route?.params?.ticketCode ?? route?.params?.aluno?.ticketCode ?? null;

  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!ticketCode) { setResult("fail"); setMessage("Ticket não informado"); playAnim("fail"); return; }
    verifyTicket(ticketCode);
  }, [ticketCode]);

  async function verifyTicket(code) {
    setRunning(true);
    try {
      if (typeof StorageService.validateTicket === "function") {
        const res = await StorageService.validateTicket(code);
        if (res?.ok) { setResult("ok"); setMessage("Ticket aprovado com sucesso"); playAnim("ok"); if (res.aluno && typeof StorageService.markTicketUsed === "function") { await StorageService.markTicketUsed(res.aluno.matricula, code); } }
        else { setResult("fail"); setMessage(res?.reason ?? "Ticket não aprovado"); playAnim("fail"); }
      } else {
        const all = (await StorageService.getAllAlunos?.()) || [];
        const found = all.find(a => a.ticketCode === code);
        if (found) { setResult("ok"); setMessage("Ticket aprovado com sucesso"); playAnim("ok"); if (typeof StorageService.updateAluno === "function") { const updated = { ...found, ticketStatus: "usado" }; await StorageService.updateAluno(updated); } }
        else { setResult("fail"); setMessage("Ticket não aprovado"); playAnim("fail"); }
      }
    } catch (err) {
      console.error("ValidateScreen error:", err);
      setResult("fail");
      setMessage("Erro ao validar ticket");
      playAnim("fail");
    } finally { setRunning(false); }
  }

  function playAnim(type) {
    opacityAnim.setValue(0);
    scaleAnim.setValue(0.6);
    Animated.parallel([ Animated.timing(opacityAnim, { toValue: 1, duration: 350, useNativeDriver: true }), Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }) ]).start();
    const delay = type === "ok" ? 2200 : 2800;
    setTimeout(() => { navigation.goBack(); }, delay);
  }

  const icon = result === "ok" ? "✅" : "❎";
  const iconColor = result === "ok" ? "#16A34A" : "#D44";

  return (
    <View style={[global.container, styles.screen]}>
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
        <Text style={[styles.icon, { color: iconColor }]}>{icon}</Text>
        <Text style={styles.title}>{result === "ok" ? "Aprovado" : result === "fail" ? "Não Aprovado" : "Validando..."}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={{ marginTop: 14 }}>
          <TouchableOpacity onPress={() => { if (running) return; verifyTicket(ticketCode); }} style={[global.buttonOutline, { minWidth: 160 }]}>
            <Text style={global.buttonOutlineText}>{running ? "Validando..." : "Revalidar"}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Confetti run={result === "ok"} count={80} origin={{ x: 200, y: 0 }} onComplete={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: "center", alignItems: "center" },
  card: { width: 320, backgroundColor: "#fff", borderRadius: 14, padding: 22, alignItems: "center", elevation: 6 },
  icon: { fontSize: 64, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: "700", color: "#222", marginBottom: 6 },
  message: { fontSize: 15, color: "#555", textAlign: "center" },
});
