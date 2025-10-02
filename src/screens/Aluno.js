// src/screens/Aluno.js
import React, { useContext } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Alert } from "react-native";
import global from "../styles/global";
import RedButton from "../components/RedButton";
import { AuthContext } from "../contexts/AuthContext";

/*
  Esta tela usa o AuthContext para obter o usuário logado.
  Funciona quando o Login faz: setUser({ type: "aluno", ...aluno });
  Também aceita receber "aluno" via route.params se você navegar assim.
*/

export default function AlunoScreen({ navigation, route }) {
  const { user, setUser } = useContext(AuthContext);
  const aluno = route?.params?.aluno ?? user ?? null;

  if (!aluno) {
    return (
      <View style={global.container}>
        <Text style={global.title}>Aluno</Text>
        <Text style={global.muted}>Nenhum aluno encontrado. Volte ao login.</Text>
        <RedButton title="Voltar ao Login" onPress={() => navigation.replace("Login")} />
      </View>
    );
  }

  function handleLocation() {
    navigation.navigate("Location", { aluno });
  }

  function handleInterval() {
    navigation.navigate("Interval", { aluno });
  }

  function handleTicket() {
    navigation.navigate("Ticket", { aluno });
  }

  function handleCard() {
    navigation.navigate("CartaoAluno", { aluno });
  }

  function handleLogout() {
    setUser(null);
    navigation.replace("Login");
  }

  return (
    <ScrollView contentContainerStyle={[global.container, { alignItems: "stretch" }]}>
      <View style={{ alignItems: "center", marginBottom: 18 }}>
        {aluno.fotoUri ? (
          <Image source={{ uri: aluno.fotoUri }} style={global.avatarLarge} />
        ) : (
          <View style={[global.avatarLarge, { justifyContent: "center", alignItems: "center" }]}>
            <Text style={{ color: "#888" }}>Sem foto</Text>
          </View>
        )}
      </View>

      <Text style={global.title}>{aluno.nome}</Text>
      <Text style={global.muted}>Matrícula: {aluno.matricula}</Text>
      <Text style={global.muted}>Série: {aluno.serie ?? "—"}</Text>
      <Text style={[global.muted, { marginBottom: 12 }]}>Nascimento: {aluno.nascimento ?? "—"}</Text>

      <RedButton title="Verificar Localização" onPress={handleLocation} />
      <RedButton title="Ver Intervalo" onPress={handleInterval} style={{ marginTop: 8 }} />
      <RedButton title="Receber Ticket" onPress={handleTicket} style={{ marginTop: 8 }} />
      <RedButton title="Ver Cartão do Aluno" onPress={handleCard} style={{ marginTop: 8 }} />

      <TouchableOpacity onPress={() => {
        Alert.alert(
          "Sair",
          "Deseja fazer logout?",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Sair", style: "destructive", onPress: handleLogout }
          ]
        );
      }} style={[global.buttonOutline, { marginTop: 14 }]}>
        <Text style={global.buttonOutlineText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
