// src/screens/ReceiveTicketScreen.js
import React, { useContext, useEffect, useState, useRef } from "react";
import { View, Text, Alert, Animated, Platform } from "react-native";
import global from "../styles/global";
import RedButton from "../components/RedButton";
import { AuthContext } from "../contexts/AuthContext";
import StorageService from "../services/StorageService";
import Confetti from "../components/Confetti";
import config from "../config/appConfig";
import * as Notifications from "expo-notifications";

function localDateISO() {
  const d = new Date();
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d - tzOffset).toISOString().slice(0, 10);
}
function parseTimeToToday(timeHHmm) {
  if (!timeHHmm) return null;
  const [hh, mm] = timeHHmm.split(":").map(Number);
  const d = new Date();
  d.setHours(isNaN(hh) ? 0 : hh, isNaN(mm) ? 0 : mm, 0, 0);
  return d;
}

// configurar handler de notificações em foreground (apresentação simples)
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false })
});

export default function ReceiveTicketScreen({ navigation }) {
  const { user, location, setUser } = useContext(AuthContext);
  const [turmaObj, setTurmaObj] = useState(null);
  const [hasTicketToday, setHasTicketToday] = useState(false);
  const [canReceiveWindow, setCanReceiveWindow] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [now, setNow] = useState(new Date());
  const [scheduledNotificationId, setScheduledNotificationId] = useState(null);

  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // atualiza relógio a cada segundo
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    loadState();
    const id = setInterval(checkWindow, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => { if (location && location.coords) setChecked(true); }, [location]);

  async function ensureNotificationPermission() {
    try {
      const { status: existing } = await Notifications.getPermissionsAsync();
      if (existing === "granted") return true;
      const { status } = await Notifications.requestPermissionsAsync();
      return status === "granted";
    } catch (err) {
      console.warn("Notification permission error:", err);
      return false;
    }
  }

  async function scheduleIntervalEndNotification(intervalEndDate) {
    try {
      const ok = await ensureNotificationPermission();
      if (!ok) {
        console.warn("Notificação não autorizada");
        return null;
      }
      const trigger = intervalEndDate instanceof Date ? intervalEndDate : new Date(intervalEndDate);
      // se trigger for no passado, não agenda
      if (trigger.getTime() <= Date.now()) return null;
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Intervalo finalizado",
          body: `O intervalo da sua turma (${turmaObj?.nome ?? "-"}) terminou.`,
          data: { screen: "Receber" }
        },
        trigger
      });
      return id;
    } catch (err) {
      console.warn("Erro ao agendar notificação:", err);
      return null;
    }
  }

  async function cancelScheduledNotification(id) {
    try {
      if (!id) return;
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (err) {
      console.warn("Falha ao cancelar notificação:", err);
    }
  }

  async function loadState() {
    try {
      if (!user) return;
      let turma = null;
      if (StorageService && typeof StorageService.getTurmaById === "function") turma = StorageService.getTurmaById(user.turma);
      if (!turma && Array.isArray(config.turmas)) turma = config.turmas.find(t => String(t.id) === String(user.turma)) || null;
      setTurmaObj(turma);
      const t = await StorageService.getTicketForMatriculaOnDate(user.matricula, localDateISO());
      setHasTicketToday(!!t);
      checkWindow();
    } catch (err) {
      console.warn("loadState error:", err);
    }
  }

  function checkWindow() {
    try {
      if (!user) { setCanReceiveWindow(false); return; }
      let turma = null;
      if (StorageService && typeof StorageService.getTurmaById === "function") turma = StorageService.getTurmaById(user.turma);
      if (!turma && Array.isArray(config.turmas)) turma = config.turmas.find(t => String(t.id) === String(user.turma)) || null;
      if (!turma || !turma.intervaloHora) { setCanReceiveWindow(false); return; }

      const intervalStart = parseTimeToToday(turma.intervaloHora);
      if (!intervalStart) { setCanReceiveWindow(false); return; }
      const intervalEnd = new Date(intervalStart.getTime() + (turma.intervaloDuracaoMin || config.defaultIntervaloDuracaoMin) * 60000);
      const nowLocal = new Date();
      const can = nowLocal >= intervalStart && nowLocal < intervalEnd;
      setCanReceiveWindow(can);

      // se intervalo terminou recentemente e existia notificação agendada, cancela
      if (scheduledNotificationId && nowLocal >= intervalEnd) {
        cancelScheduledNotification(scheduledNotificationId);
        setScheduledNotificationId(null);
      }
    } catch (err) {
      console.warn("checkWindow error:", err);
      setCanReceiveWindow(false);
    }
  }

  function playSuccessAnimation() {
    successAnim.setValue(0);
    Animated.sequence([
      Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start();
  }

  async function handleReceive() {
    console.log("ATTEMPT RECEIVE", { user, canReceiveWindow, hasTicketToday, location });
    if (!user) return Alert.alert("Erro", "Usuário não identificado. Faça login novamente.");
    if (!canReceiveWindow) return Alert.alert("Fora da janela", "Só no horário do intervalo você pode receber o ticket.");
    if (hasTicketToday) return Alert.alert("Aviso", "Você já recebeu o ticket hoje.");
    if (!location || !location.coords) return Alert.alert("Localização", "Verifique sua posição no Mapa antes de receber o ticket.");
    if (!location.insideSchool) return Alert.alert("Fora da área", "Você precisa estar dentro da área da escola para receber o ticket.");

    const date = localDateISO();
    const id = `${user.matricula}-${date}`;
    const ticket = { idTicket: id, matricula: user.matricula, nome: user.nome || `Aluno ${user.matricula}`, turma: user.turma, dateISO: date, status: "disponivel" };

    try {
      const exists = await StorageService.getTicketForMatriculaOnDate(user.matricula, date);
      if (exists) { setHasTicketToday(true); return Alert.alert("Aviso", "Ticket já registrado hoje"); }

      await StorageService.addTicket(ticket);
      const t = await StorageService.getTicketForMatriculaOnDate(user.matricula, date);
      setHasTicketToday(!!t);

      // agendar notificação para o fim do intervalo (se turma conhecida)
      if (turmaObj && turmaObj.intervaloHora) {
        const intervalStart = parseTimeToToday(turmaObj.intervaloHora);
        const intervalEnd = new Date(intervalStart.getTime() + (turmaObj.intervaloDuracaoMin || config.defaultIntervaloDuracaoMin) * 60000);
        const notifId = await scheduleIntervalEndNotification(intervalEnd);
        if (notifId) {
          // cancelar notificação anterior se houver
          if (scheduledNotificationId) await cancelScheduledNotification(scheduledNotificationId);
          setScheduledNotificationId(notifId);
        }
      }

      setShowConfetti(true);
      playSuccessAnimation();
      setTimeout(() => setShowConfetti(false), 2200);

      Alert.alert("Sucesso", "Ticket recebido! Notificação agendada para o fim do intervalo.");
    } catch (err) {
      console.warn("handleReceive error:", err);
      Alert.alert("Erro", err.message || "Falha ao criar ticket");
    }
  }

  function logoutToLogin() {
    if (setUser) setUser(null);
    navigation.replace("Login");
  }

  const successScale = successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  const successOpacity = successAnim;

  // formatadores
  const formatTime = (d) => {
    if (!d) return "-";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <View style={global.container}>
      <Text style={global.title}>Receber Ticket</Text>

      <Text style={global.label}>Horário atual: <Text style={global.redText}>{formatTime(now)}</Text></Text>

      <Text style={global.label}>Aluno: {user?.nome ?? "-"}</Text>
      <Text style={global.label}>Matrícula: {user?.matricula ?? "-"}</Text>
      <Text style={global.label}>Turma: {user?.turma ?? "-"}</Text>
      <Text style={global.label}>Horário do intervalo: <Text style={global.redText}>{turmaObj?.intervaloHora ?? "-"}</Text></Text>
      <Text style={global.label}>Status hoje: <Text style={global.redText}>{hasTicketToday ? "Já pegou" : "Não pegou"}</Text></Text>
      <Text style={global.label}>Intervalo ativo: <Text style={global.redText}>{canReceiveWindow ? "Sim" : "Não"}</Text></Text>
      <Text style={global.label}>Local verificado: <Text style={global.redText}>{(location && location.coords) ? (location.insideSchool ? "Estou neste local" : "Não estou neste local") : "Não verificado"}</Text></Text>
      <Text style={global.label}>Distância até a escola: <Text style={global.redText}>{location?.distanceMeters != null ? `${location.distanceMeters} m` : "-"}</Text></Text>

      <View style={{ marginVertical: 10 }}>
        <RedButton title="Abrir Mapa para checar localização" onPress={() => navigation.navigate("Mapa")} />
      </View>

      <View style={{ marginVertical: 8 }}>
        <RedButton title="Receber Ticket" onPress={handleReceive} disabled={!(canReceiveWindow && !hasTicketToday && location && location.insideSchool)} />
      </View>

      <View style={{ marginVertical: 8 }}>
        <RedButton title="Voltar ao Login" onPress={logoutToLogin} />
      </View>

      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 120,
          backgroundColor: "#fff",
          padding: 14,
          borderRadius: 12,
          elevation: 8,
          transform: [{ scale: successScale }],
          opacity: successOpacity
        }}
      >
        <Text style={{ color: "#d32f2f", fontWeight: "800", textAlign: "center" }}>Ticket recebido com sucesso!</Text>
      </Animated.View>

      <Confetti show={showConfetti} />
    </View>
  );
}
