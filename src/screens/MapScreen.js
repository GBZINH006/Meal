// src/screens/MapScreen.js
import React, { useEffect, useState, useContext, useRef } from "react";
import { View, Text, Alert, ActivityIndicator, Animated, TouchableOpacity, StyleSheet, Platform, Linking } from "react-native";
import MapView, { Marker, Circle, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import global from "../styles/global";
import config from "../config/appConfig";
import { findNearestInstitution } from "../services/LocationService";
import { AuthContext } from "../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function MapScreen({ navigation }) {
  const { user, setLocation } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [userPos, setUserPos] = useState(null);
  const [nearest, setNearest] = useState(null);
  const [checked, setChecked] = useState(false);
  const [routeCoords, setRouteCoords] = useState(null);
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { startBounce(); }, []);

  function startBounce() {
    bounceAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 600, useNativeDriver: true })
      ])
    ).start();
  }

  function showCard() {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }

  async function detectAndCheck() {
    setLoading(true);
    setChecked(false);
    setRouteCoords(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") { Alert.alert("Permissão negada", "Ative localização"); setLoading(false); return; }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      if (!pos || !pos.coords) { Alert.alert("Erro", "Não foi possível obter coordenadas."); setLoading(false); return; }
      const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setUserPos(coords);

      const institutions = Array.isArray(config.institutions) ? config.institutions : [];
      if (institutions.length === 0) { Alert.alert("Configuração", "Nenhuma instituição configurada."); setLoading(false); return; }

      const nearestResult = findNearestInstitution(coords, institutions);
      if (!nearestResult || !nearestResult.institution) { Alert.alert("Nenhuma instituição próxima"); setLoading(false); return; }
      setNearest(nearestResult);
      setChecked(true);

      const inst = nearestResult.institution;
      const dist = nearestResult.distance;
      const inside = typeof inst.radiusMeters === "number" ? dist <= inst.radiusMeters : false;

      setLocation({ coords, insideSchool: inside, distanceMeters: Math.round(dist), institution: inst });
      showCard();

      if (inside) {
        Alert.alert("Você está no local", `${inst.name} está a ${Math.round(dist)} m. Indo para Receber Ticket.`, [
          { text: "OK", onPress: () => navigation.navigate("Receber") }
        ]);
      } else {
        Alert.alert("Você não está na escola", `${inst.name} está a ${Math.round(dist)} m. Deseja ver rota?`, [
          { text: "Cancelar" },
          { text: "Mostrar rota", onPress: () => openExternalDirections(coords, inst.coords) }
        ]);
      }

      if (config.directionsApiKey) {
        try {
          const poly = await fetchRoutePolyline(coords, inst.coords, config.directionsApiKey);
          if (Array.isArray(poly) && poly.length) setRouteCoords(poly);
        } catch (err) {
          console.warn("Directions fetch failed:", err.message || err);
        }
      }
    } catch (err) {
      console.warn("detectAndCheck error:", err);
      Alert.alert("Erro", "Não foi possível obter localização.");
    } finally {
      setLoading(false);
    }
  }

  function openExternalDirections(origin, destination) {
    if (!origin || !destination) { Alert.alert("Erro", "Coordenadas inválidas para rota."); return; }
    const o = `${origin.latitude},${origin.longitude}`;
    const d = `${destination.latitude},${destination.longitude}`;
    let url = "";
    if (Platform.OS === "ios") url = `http://maps.apple.com/?saddr=${o}&daddr=${d}`;
    else url = `https://www.google.com/maps/dir/?api=1&origin=${o}&destination=${d}&travelmode=walking`;
    Linking.openURL(url).catch(() => Alert.alert("Erro", "Não foi possível abrir o app de mapas."));
  }

  async function fetchRoutePolyline(origin, destination, apiKey) {
    if (!origin || !destination || !apiKey) throw new Error("Parâmetros inválidos para Directions API");
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destStr = `${destination.latitude},${destination.longitude}`;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&mode=walking&key=${apiKey}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!json || !json.routes || json.routes.length === 0) throw new Error("No routes");
    return decodePolyline(json.routes[0].overview_polyline.points || "");
  }

  function decodePolyline(encoded) {
    if (!encoded) return [];
    const poly = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;
    while (index < len) {
      let b, shift = 0, result = 0;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      shift = 0;
      result = 0;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      poly.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return poly;
  }

  return (
    <View style={global.container}>
      <Text style={global.title}>Mapa — Verificação de Local</Text>
      <Text style={global.label}>Aluno: {user?.nome ?? "-"}</Text>

      <View style={{ height: 12 }} />

      <View style={{ height: 300, borderRadius: 10, overflow: "hidden" }}>
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: (config.institutions && config.institutions[0] && config.institutions[0].coords.latitude) || 0,
            longitude: (config.institutions && config.institutions[0] && config.institutions[0].coords.longitude) || 0,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02
          }}
          showsUserLocation={!!userPos}
        >
          {(Array.isArray(config.institutions) ? config.institutions : []).map(inst => {
            const coords = inst && inst.coords ? inst.coords : null;
            if (!coords) return null;
            return <Marker key={inst.id} coordinate={coords} title={inst.name} pinColor="red" />;
          })}

          {userPos && <Marker coordinate={userPos} title="Você" pinColor="blue" />}

          {nearest && nearest.institution && nearest.institution.coords && (
            <Circle center={nearest.institution.coords} radius={nearest.institution.radiusMeters || 150} strokeColor="rgba(211,47,47,0.6)" fillColor="rgba(211,47,47,0.12)" />
          )}

          {routeCoords && routeCoords.length > 0 && <Polyline coordinates={routeCoords} strokeColor="#2b7bf6" strokeWidth={4} />}
        </MapView>
      </View>

      <View style={{ marginTop: 8 }}>
        <TouchableOpacity onPress={detectAndCheck} style={[styles.checkButton, { backgroundColor: config.primaryColor }]}>
          {loading ? <ActivityIndicator color="#fff" /> : <><Ionicons name="locate-outline" color="#fff" size={18} /><Text style={{ color: "#fff", marginLeft: 8, fontWeight: "700" }}>Detectar local e verificar</Text></>}
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.infoCard, { opacity: fadeAnim }]}>
        {checked && nearest ? (
          <>
            <Text style={global.label}>Instituição mais próxima: <Text style={global.redText}>{nearest.institution?.name ?? "-"}</Text></Text>
            <Text style={global.label}>Distância: <Text style={global.redText}>{nearest.distance ? `${Math.round(nearest.distance)} m` : "-"}</Text></Text>
            <Text style={global.label}>Status: <Text style={global.redText}>{nearest.distance <= (nearest.institution.radiusMeters || 0) ? "Você está no local" : "Você não está no local"}</Text></Text>

            <View style={{ height: 8 }} />
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity onPress={() => {
                if (nearest.distance <= (nearest.institution.radiusMeters || 0)) navigation.navigate("Receber");
                else openExternalDirections(userPos || { latitude: 0, longitude: 0 }, nearest.institution.coords);
              }} style={[styles.smallBtn, { backgroundColor: config.primaryColor }]}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>{nearest.distance <= (nearest.institution.radiusMeters || 0) ? "Ir para Receber" : "Mostrar rota"}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setChecked(false); setNearest(null); setRouteCoords(null); setUserPos(null); }} style={[styles.smallBtn, { backgroundColor: "#888", marginLeft: 8 }]}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Limpar</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={global.small}>Clique em Detectar local e verificar para procurar a instituição mais próxima.</Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  checkButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 12, borderRadius: 10 },
  infoCard: { marginTop: 12, padding: 12, borderRadius: 10, backgroundColor: "#fff", elevation: 4 },
  smallBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, alignItems: "center", justifyContent: "center" }
});
