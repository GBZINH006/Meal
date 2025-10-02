// src/screens/StudentCardScreen.js
import React, { useContext, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Barcode from "react-native-barcode-svg";
import global from "../styles/global";
import { AuthContext } from "../contexts/AuthContext";
import { sanitizeTicketCode } from "../utils/sanitizeTicket";

export default function StudentCardScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const aluno = route?.params?.aluno ?? (user && user.type === "aluno" ? user : null);

  useEffect(() => {
    console.log("[StudentCard] aluno param:", route?.params?.aluno);
    console.log("[StudentCard] user:", user);
  }, [route?.params?.aluno, user]);

  if (!aluno) {
    return (
      <View style={global.container}>
        <Text style={global.title}>Cartão do Aluno</Text>
        <Text style={global.muted}>Nenhum aluno disponível. Volte ao login.</Text>
        <TouchableOpacity onPress={() => navigation.replace("Login")} style={[global.buttonOutline, { marginTop: 12 }]}>
          <Text style={global.buttonOutlineText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const code = sanitizeTicketCode(aluno.ticketCode || "");
  const singleBarWidth = 2;
  const barcodeHeight = 80;

  console.log("[DEBUG StudentCard] raw:", aluno.ticketCode, "code:", code, "singleBarWidth/height:", singleBarWidth, barcodeHeight);

  return (
    <View style={[global.container, styles.screen]}>
      <Text style={global.title}>{aluno.nome}</Text>
      <Text style={global.muted}>Matrícula: {aluno.matricula}</Text>

      <View style={styles.card}>
        {code.length > 0 ? (
          <>
            <View style={styles.barcodeWrapper}>
              <Barcode
                value={code}
                format="CODE128"
                singleBarWidth={singleBarWidth}
                height={barcodeHeight}
                lineColor="#000"
                backgroundColor="#fff"
                onError={(e) => console.warn("[Barcode CartaoAluno] onError:", e)}
              />
            </View>
            <Text style={styles.code}>{code}</Text>
            <Text style={global.hint}>Emitido em: {aluno.lastTicketDate ? new Date(aluno.lastTicketDate).toLocaleString() : "—"}</Text>
          </>
        ) : (
          <Text style={styles.noTicket}>Sem ticket</Text>
        )}
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
        <Text style={global.hint}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { alignItems: "stretch", padding: 20 },
  card: { marginTop: 18, backgroundColor: "#fff", borderRadius: 12, padding: 18, alignItems: "center", elevation: 3 },
  barcodeWrapper: { backgroundColor: "#fff", padding: 8 },
  code: { marginTop: 12, fontSize: 14, color: "#333" },
  noTicket: { fontSize: 16, color: "#666", marginBottom: 12 },
});
