// src/screens/LoginScreen.js
import React, { useContext, useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import global from "../styles/global";
import RedButton from "../components/RedButton";
import { AuthContext } from "../contexts/AuthContext";
import StorageService from "../services/StorageService";

export default function LoginScreen({ navigation }) {
  const { setUser } = useContext(AuthContext);
  const [mode, setMode] = useState("aluno");
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");

  useEffect(() => {
    // nada extra aqui; ADM senha vinda de StorageService quando necessário
  }, []);

  async function loginAluno() {
    if (!matricula.trim()) { Alert.alert("Erro", "Informe a matrícula"); return; }
    const aluno = await StorageService.getAlunoByMatricula(matricula.trim());
    if (!aluno) {
      Alert.alert("Não encontrado", "Matrícula não cadastrada. Peça ao ADM para cadastrar o aluno.");
      return;
    }
    // aluno já contém nome, matricula, turma
    setUser({ type: "aluno", ...aluno });
    navigation.replace("Aluno");
  }

  async function loginAdm() {
    if (!senha) { Alert.alert("Erro", "Informe a senha"); return; }
    const adm = await StorageService.getAdm();
    const expected = adm?.password ?? "admin123";
    if (senha === expected) {
      setUser({ type: "adm", nome: "Administrador" });
      navigation.replace("ADM");
    } else {
      Alert.alert("Erro", "Senha incorreta");
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={[global.container, { justifyContent: "flex-start" }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40}}>
        <Text style={global.title}>Login</Text>

        <View style={{ flexDirection: "row", marginBottom: 16 }}>
          <TouchableOpacity onPress={() => setMode("aluno")} style={{ marginRight: 12 }}>
            <Text style={[global.label, mode === "aluno" && global.redText]}>Aluno</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMode("adm")}>
            <Text style={[global.label, mode === "adm" && global.redText]}>Painel do ADM</Text>
          </TouchableOpacity>
        </View>

        {mode === "aluno" ? (
          <>
            <Text style={global.label}>Matrícula</Text>
            <TextInput style={global.input} placeholder="12345" value={matricula} onChangeText={setMatricula} keyboardType="number-pad" />
            <View style={{ marginTop: 8 }}>
              <RedButton title="Entrar como Aluno" onPress={loginAluno} />
            </View>
          </>
        ) : (
          <>
            <Text style={global.label}>Senha ADM</Text>
            <TextInput style={global.input} secureTextEntry placeholder="Senha" value={senha} onChangeText={setSenha} />
            <View style={{ marginTop: 8 }}>
              <RedButton title="Entrar como ADM" onPress={loginAdm} />
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
