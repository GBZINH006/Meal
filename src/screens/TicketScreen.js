// src/screens/TicketScreen.js
import React, { useContext, useEffect, useState } from "react";
import { View, Text, Alert, StyleSheet, TouchableOpacity } from "react-native";
import global from "../styles/global";
import RedButton from "../components/RedButton";
import Confetti from "../components/Confetti";
import { AuthContext } from "../contexts/AuthContext";
import StorageService from "../services/StorageService";
import Barcode from "react-native-barcode-svg";
import { sanitizeTicketCode } from "../utils/sanitizeTicket";

function generateTicketCode() {
  const now = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${now}-${rand}`.toUpperCase();
}

export default function TicketScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const alunoParam = route?.params?.aluno ?? null;
  const alunoFromUser = user && user.type === "aluno" ? user : null;
  const aluno = alunoParam ?? alunoFromUser;

  const [ticketCode, setTicketCode] = useState(aluno?.ticketCode ?? null);
  const [lastTicketDate, setLastTicketDate] = useState(aluno?.lastTicketDate ?? null);
  const [celebrate, setCelebrate] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTicketCode(aluno?.ticketCode ?? null);
    setLastTicketDate(aluno?.lastTicketDate ?? null);
  }, [aluno]);

  if (!aluno) {
    return (
      <View style={global.container}>
        <Text style={global.title}>Ticket</Text>
        <Text style={global.muted}>Nenhum aluno disponível. Volte ao login.</Text>
        <RedButton title="Voltar" onPress={() => navigation.replace("Login")} />
      </View>
    );
  }

  function canReceiveTicket() {
    if (!lastTicketDate) return true;
    const last = new Date(lastTicketDate);
    const now = new Date();
    return last.toDateString() !== now.toDateString();
  }

  async function giveTicket() {
    if (!canReceiveTicket()) {
      Alert.alert("Atenção", "Ticket já recebido hoje.");
      return;
    }

    setLoading(true);
    const code = generateTicketCode();
    const nowISO = new Date().toISOString();
    const updated = { ...aluno, ticketCode: code, lastTicketDate: nowISO, ticketStatus: "emitido" };

    try {
      const saved = await StorageService.updateAluno(updated);
      const alunoSalvo = saved || updated;

      const safe = sanitizeTicketCode(alunoSalvo.ticketCode);
      if (!safe) throw new Error("Código inválido após salvar");

      setTicketCode(alunoSalvo.ticketCode);
      setLastTicketDate(alunoSalvo.lastTicketDate);
      setCelebrate(true);
      console.log("[TicketScreen] ticket criado:", alunoSalvo.ticketCode, "safe:", safe);

      navigation.replace("CartaoAluno", { aluno: alunoSalvo });
    } catch (err) {
      console.error("[TicketScreen] erro ao salvar ticket:", err);
      Alert.alert("Erro", "Não foi possível emitir o ticket. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function revokeTicket() {
    Alert.alert(
      "Remover ticket",
      "Deseja remover o ticket deste aluno?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            const updated = { ...aluno, ticketCode: null, lastTicketDate: null, ticketStatus: "nenhum" };
            try {
              const saved = await StorageService.updateAluno(updated);
              setTicketCode(saved?.ticketCode ?? null);
              setLastTicketDate(saved?.lastTicketDate ?? null);
              Alert.alert("Sucesso", "Ticket removido.");
            } catch (err) {
              console.error("Erro ao remover ticket:", err);
              Alert.alert("Erro", "Não foi possível remover o ticket.");
            }
          },
        },
      ],
    );
  }

  // saneamento e valores numéricos explícitos
  const safeCode = sanitizeTicketCode(ticketCode);
  const singleBarWidth = 2; // CORRETO: prop se chama singleBarWidth
  const barcodeHeight = 80;  // CORRETO: use height para altura

  console.log("[DEBUG TicketScreen] raw:", ticketCode, "safe:", safeCode, "singleBarWidth/height:", singleBarWidth, barcodeHeight);

  return (
    <View style={styles.screen}>
      <Text style={global.title}>Emitir Ticket</Text>
      <Text style={global.muted}>Aluno: {aluno.nome}</Text>
      <Text style={global.muted}>Matrícula: {aluno.matricula}</Text>

      <View style={styles.card}>
        {safeCode.length > 0 ? (
          <>
            <View style={{ backgroundColor: "#fff", padding: 8 }}>
              <Barcode
                value={safeCode}
                format="CODE128"
                singleBarWidth={singleBarWidth}
                height={barcodeHeight}
                lineColor="#000"
                backgroundColor="#fff"
                onError={(e) => {
                  console.warn("[Barcode] onError:", e);
                }}
              />
            </View>

            <Text style={styles.code}>{safeCode}</Text>
            <Text style={global.hint}>Emitido em: {lastTicketDate ? new Date(lastTicketDate).toLocaleString() : "—"}</Text>

            <TouchableOpacity style={[global.buttonOutline, { marginTop: 12 }]} onPress={() => navigation.navigate("CartaoAluno", { aluno: { ...aluno, ticketCode: safeCode, lastTicketDate } })}>
              <Text style={global.buttonOutlineText}>Ver no Cartão</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[global.buttonOutline, { marginTop: 8 }]} onPress={revokeTicket}>
              <Text style={global.buttonOutlineText}>Remover Ticket</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.noTicket}>Sem ticket disponível</Text>
            <RedButton title={loading ? "Emitindo..." : "Emitir Ticket"} onPress={giveTicket} disabled={loading} />
          </>
        )}
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
        <Text style={global.hint}>Voltar</Text>
      </TouchableOpacity>

      <Confetti run={celebrate} onComplete={() => setCelebrate(false)} origin={{ x: 200, y: 0 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, backgroundColor: "#F7F7FA" },
  card: { marginTop: 18, backgroundColor: "#fff", borderRadius: 12, padding: 18, alignItems: "center", elevation: 3 },
  code: { marginTop: 12, fontSize: 14, color: "#333" },
  noTicket: { fontSize: 16, color: "#666", marginBottom: 12 },
});
