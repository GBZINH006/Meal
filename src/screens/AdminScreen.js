// src/screens/AdminScreen.js
import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet, KeyboardAvoidingView, Platform,
} from "react-native";
import global from "../styles/global";
import RedButton from "../components/RedButton";
import StorageService from "../services/StorageService";

export default function AdminScreen({navigation}) {
  const [alunos, setAlunos] = useState([]);
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [turma, setTurma] = useState("");
  const [editingMatricula, setEditingMatricula] = useState(null);

  useEffect(() => { loadAlunos(); }, []);

  async function loadAlunos() {
    try {
      const list = await StorageService.getAllAlunos();
      setAlunos(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("[Admin] erro loadAlunos:", err);
      setAlunos([]);
    }
  }

  function resetForm() { setNome(""); setMatricula(""); setTurma(""); setEditingMatricula(null); }

  async function handleSave() {
    const cleanedMat = String(matricula).trim();
    const cleanedNome = String(nome).trim();
    const cleanedTurma = String(turma).trim();

    if (!cleanedNome) { Alert.alert("Erro", "Informe o nome do aluno"); return; }
    if (!cleanedMat) { Alert.alert("Erro", "Informe a matrícula"); return; }
    if (!cleanedTurma) { Alert.alert("Erro", "Informe a turma"); return; }

    try {
      const exists = await StorageService.getAlunoByMatricula(cleanedMat);
      if (editingMatricula) {
        const updated = { ...(exists || {}), nome: cleanedNome, matricula: cleanedMat, turma: cleanedTurma };
        await StorageService.updateAluno(updated);
        Alert.alert("Sucesso", "Aluno atualizado");
      } else {
        if (exists) { Alert.alert("Erro", "Já existe um aluno com essa matrícula"); return; }
        const novo = { nome: cleanedNome, matricula: cleanedMat, turma: cleanedTurma, fotoUri: null, ticketCode: null, lastTicketDate: null, ticketStatus: "nenhum" };
        await StorageService.updateAluno(novo);
        Alert.alert("Sucesso", "Aluno cadastrado");
      }
      resetForm();
      loadAlunos();
    } catch (err) {
      console.error("[Admin] erro handleSave:", err);
      Alert.alert("Erro", "Não foi possível salvar o aluno");
    }
  }

  function handleEdit(item) {
    setNome(item.nome ?? "");
    setMatricula(String(item.matricula ?? ""));
    setTurma(item.turma ?? "");
    setEditingMatricula(item.matricula);
  }

  function handleDelete(item) {
    Alert.alert(
      "Remover aluno",
      `Deseja remover ${item.nome}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              const list = await StorageService.getAllAlunos();
              const newList = list.filter(a => String(a.matricula) !== String(item.matricula));
              await StorageService.saveAlunos(newList);
              loadAlunos();
              Alert.alert("Sucesso", "Aluno removido");
            } catch (err) {
              console.error("[Admin] erro ao remover:", err);
              Alert.alert("Erro", "Não foi possível remover o aluno");
            }
          },
        },
      ]
    );
  }

  function renderItem({ item }) {
    return (
      <View style={styles.item}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemName}>{item.nome}</Text>
          <Text style={styles.itemMeta}>Matrícula: {item.matricula}  •  Turma: {item.turma ?? "—"}</Text>
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconBtn}><Text style={styles.iconText}>✏️</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconBtn}><Text style={styles.iconText}>🗑️</Text></TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={[global.container, { padding: 16 }]}>
      <Text style={global.title}>Painel do ADM</Text>

      <View style={styles.form}>
        <Text style={global.label}>Nome</Text>
        <TextInput style={global.input} placeholder="Nome completo" value={nome} onChangeText={setNome} />

        <Text style={global.label}>Matrícula</Text>
        <TextInput style={global.input} placeholder="12345" value={matricula} onChangeText={setMatricula} keyboardType="default" />

        <Text style={global.label}>Turma</Text>
        <TextInput style={global.input} placeholder="Ex: 6A" value={turma} onChangeText={setTurma} />

        <View style={{ marginTop: 8, flexDirection: "row", gap: 8 }}>
          <RedButton title={editingMatricula ? "Atualizar" : "Adicionar aluno"} onPress={handleSave} />
          <TouchableOpacity onPress={resetForm} style={styles.cancelBtn}><Text style={styles.cancelText}>Limpar</Text></TouchableOpacity>
        </View>
      </View>

      <View style={{ marginTop: 18, flex: 1 }}>
        <Text style={[global.label, { marginBottom: 8 }]}>Alunos cadastrados ({alunos.length})</Text>
        <FlatList
          data={alunos.sort((a,b)=> String(a.matricula).localeCompare(String(b.matricula)))}
          keyExtractor={item => String(item.matricula)}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
  <TouchableOpacity
    onPress={() => navigation.navigate('LoginScreen')}
    activeOpacity={0.85}
    style={{
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#EEE",
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    }}
  >
    <Text style={{ fontSize: 16, marginRight: 8 }}>⬅️</Text>
    <Text style={{ color: "#333", fontWeight: "700" }}>Voltar</Text>
  </TouchableOpacity>
</View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  form: { backgroundColor: "#fff", padding: 14, borderRadius: 10, elevation: 2 },
  cancelBtn: { marginLeft: 10, justifyContent: "center", paddingHorizontal: 12, backgroundColor: "#eee", borderRadius: 8 },
  cancelText: { color: "#333", fontWeight: "700" },
  item: { backgroundColor: "#fff", padding: 12, borderRadius: 10, flexDirection: "row", alignItems: "center", elevation: 1 },
  itemName: { fontSize: 16, fontWeight: "700" },
  itemMeta: { color: "#666", marginTop: 4 },
  itemActions: { marginLeft: 12, flexDirection: "row" },
  iconBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  iconText: { fontSize: 16 },
});
