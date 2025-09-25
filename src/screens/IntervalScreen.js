// src/screens/IntervalScreen.js
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import global from "../styles/global";
import config from "../config/appConfig";

function parseToToday(timeHHmm) {
  if (!timeHHmm) return null;
  const [hh, mm] = timeHHmm.split(":").map(Number);
  const d = new Date();
  d.setHours(isNaN(hh) ? 0 : hh, isNaN(mm) ? 0 : mm, 0, 0);
  return d;
}

export default function IntervalScreen() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const turmas = Array.isArray(config.turmas) ? config.turmas : [];

  return (
    <View style={global.container}>
      <Text style={global.title}>Intervalos por Turma</Text>
      {turmas.length === 0 && <Text style={global.small}>Nenhuma turma configurada.</Text>}
      {turmas.map(t => {
        const intervalStart = parseToToday(t.intervaloHora || "");
        const intervalEnd = intervalStart ? new Date(intervalStart.getTime() + (t.intervaloDuracaoMin || config.defaultIntervaloDuracaoMin) * 60000) : new Date();
        const windowStart = intervalStart ? new Date(intervalStart.getTime() - 5 * 60000) : null;
        const inWindow = windowStart ? now >= windowStart && now < intervalStart : false;
        const active = intervalStart ? now >= intervalStart && now < intervalEnd : false;
        const remainingStart = intervalStart ? intervalStart - now : 0;
        const remainingEnd = intervalEnd ? intervalEnd - now : 0;
        function formatMs(ms){
          if (ms <= 0) return "00:00:00";
          const s = Math.floor(ms/1000)%60;
          const m = Math.floor(ms/60000)%60;
          const h = Math.floor(ms/3600000);
          return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
        }
        return (
          <View key={t.id} style={global.card}>
            <Text style={global.subtitle}>{t.nome} — {t.intervaloHora ?? "-" } ({t.intervaloDuracaoMin ?? config.defaultIntervaloDuracaoMin} min)</Text>
            <Text style={global.label}>Janela de recebimento: {inWindow ? "Ativa" : "Inativa"}</Text>
            <Text style={global.label}>Intervalo ativo: {active ? "Sim" : "Não"}</Text>
            <Text style={global.label}>Tempo para início: {formatMs(remainingStart)}</Text>
            <Text style={global.label}>Tempo para fim: {formatMs(remainingEnd)}</Text>
          </View>
        );
      })}
    </View>
  );
}
