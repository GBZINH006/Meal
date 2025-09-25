// src/config/appConfig.js
export default {
  primaryColor: "#d32f2f",
  defaultIntervaloDuracaoMin: 30,
  turmas: [
    { id: "1A", nome: "1A", intervaloHora: "10:30", intervaloDuracaoMin: 25 },
    { id: "2B", nome: "2B", intervaloHora: "11:00", intervaloDuracaoMin: 25 },
    { id: "3C", nome: "3C", intervaloHora: "11:30", intervaloDuracaoMin: 30 },
    { id: "3A", nome: "3A", intervaloHora: "12:00", intervaloDuracaoMin: 20 },
    { id: "4B", nome: "4B", intervaloHora: "10:45", intervaloDuracaoMin: 20 }
  ],
  institutions: [
    {
      id: "escola_principal",
      name: "Escola (local fornecido)",
      coords: { latitude: -27.618398, longitude: -48.662856},
      radiusMeters: 150
    }
  ],
  directionsApiKey: "" // opcional para desenhar rotas
};
