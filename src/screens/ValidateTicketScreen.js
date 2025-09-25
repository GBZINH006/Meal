// src/screens/ValidateTicketScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import global from "../styles/global";
import RedButton from "../components/RedButton";
import StorageService from "../services/StorageService";

function todayISO() { return new Date().toISOString().slice(0,10); }

export default function ValidateTicketScreen() {
  const [matricula, setMatricula] = useState("");
  const [ticket, setTicket] = useState(null);

  async function checkTicket() {
    if (!matricula) return Alert.alert("Informe matrícula");
    const t = await StorageService.getTicketForMatriculaOnDate(matricula, todayISO());
    if (!t) return Alert.alert("Sem ticket", "Aluno não tem ticket hoje");
    setTicket(t);
  }

  async function useTicket() {
    if (!ticket) return;
    if (ticket.status === "usado") return Alert.alert("Já usado");
    const updated = { ...ticket, status: "usado" };
    await StorageService.updateTicket(updated);
    setTicket(updated);
    Alert.alert("OK", "Ticket marcado como usado");
  }

  return (
    <View style={global.container}>
      <Text style={global.title}>Validação de Ticket</Text>
      <Text style={global.label}>Matrícula</Text>
      <TextInput style={global.input} placeholder="12345" value={matricula} onChangeText={setMatricula} keyboardType="number-pad" />
      <RedButton title="Verificar" onPress={checkTicket} />
      {ticket && (
        <View style={{ marginTop: 16 }}>
          <Text style={global.label}>Nome: {ticket.nome}</Text>
          <Text style={global.label}>Matrícula: {ticket.matricula}</Text>
          <Text style={global.label}>Turma: {ticket.turma ?? "-"}</Text>
          <Text style={global.label}>Status: <Text style={global.redText}>{ticket.status}</Text></Text>
          <RedButton title="Usar ticket" onPress={useTicket} disabled={ticket.status === "usado"} />
        </View>
      )}
    </View>
  );
}
