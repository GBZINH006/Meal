// src/screens/AdminScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, Alert, TouchableOpacity } from "react-native";
import global from "../styles/global";
import RedButton from "../components/RedButton";
import StorageService from "../services/StorageService";

function todayISO() { return new Date().toISOString().slice(0,10); }

export default function AdminScreen() {
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [alunos, setAlunos] = useState([]);
  const [pegosHoje, setPegosHoje] = useState([]);
  const [turmas, setTurmas] = useState([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setAlunos(await StorageService.getAlunos());
    setPegosHoje(await StorageService.getTicketsByDate(todayISO()));
    setTurmas(StorageService.getTurmas());
    // default select first turma if não tiver
    const t = StorageService.getTurmas();
    if (t && t.length && !turmaSelecionada) setTurmaSelecionada(t[0].id);
  }

  async function addAluno() {
    if (!nome.trim() || !matricula.trim() || !turmaSelecionada) return Alert.alert("Preencha nome, matrícula e turma");
    try {
      await StorageService.addAluno({ id: String(matricula).trim(), nome: nome.trim(), matricula: String(matricula).trim(), turma: turmaSelecionada });
      setNome(""); setMatricula(""); setTurmaSelecionada("");
      loadData();
      Alert.alert("Sucesso", "Aluno cadastrado");
    } catch (err) {
      Alert.alert("Erro", err.message || "Falha ao cadastrar");
    }
  }

  async function resetHoje() {
    await StorageService.resetTicketsForDate(todayISO());
    Alert.alert("Reset", "Tickets do dia foram resetados");
    loadData();
  }

  return (
    <View style={global.container}>
      

      <Text style={global.label}>Cadastrar aluno</Text>
      <TextInput style={global.input} placeholder="Nome" value={nome} onChangeText={setNome} />
      <TextInput style={global.input} placeholder="Matrícula" value={matricula} onChangeText={setMatricula} keyboardType="number-pad" />

      <Text style={global.label}>Turma</Text>
      <View style={[global.input, { padding: 0 }]}>
        {turmas.map(t => (
          <TouchableOpacity key={t.id} onPress={() => setTurmaSelecionada(t.id)} style={{ padding: 10, backgroundColor: turmaSelecionada === t.id ? "#fee" : "transparent" }}>
            <Text style={{ color: turmaSelecionada === t.id ? "#b00" : "#333' " }}>{t.nome} — {t.intervaloHora}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <RedButton title="Adicionar Aluno" onPress={addAluno} />

      <Text style={[global.title, { marginTop: 16, fontSize: 18 }]}>Alunos</Text>
      <FlatList data={alunos} keyExtractor={i => i.matricula} renderItem={({ item }) => (
        <View style={global.card}>
          <Text style={global.label}>Nome: {item.nome}</Text>
          <Text style={global.label}>Matrícula: {item.matricula}</Text>
          <Text style={global.label}>Turma: {item.turma}</Text>
        </View>
      )} />

      <Text style={[global.title, { marginTop: 8, fontSize: 18 }]}>Pegaram hoje</Text>
      <FlatList data={pegosHoje} keyExtractor={i => i.idTicket} renderItem={({ item }) => (
        <View style={global.card}>
          <Text style={global.label}>Nome: {item.nome}</Text>
          <Text style={global.label}>Matrícula: {item.matricula}</Text>
          <Text style={global.label}>Turma: {item.turma ?? "-"}</Text>
          <Text style={global.label}>Status: {item.status}</Text>
        </View>
      )} />

      <View style={{ marginVertical: 12 }}>
        <RedButton title="Resetar tickets do dia" onPress={resetHoje} />
      </View>
    </View>
  );
}
