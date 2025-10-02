// src/screens/MapScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import global from "../styles/global";

export default function MapScreen({ navigation, route }) {
  const aluno = route?.params?.aluno ?? null;
  const initialRegionFromAluno = aluno?.location
    ? { latitude: aluno.location.latitude, longitude: aluno.location.longitude, latitudeDelta: 0.007, longitudeDelta: 0.007 }
    : null;

  const [region, setRegion] = useState(initialRegionFromAluno ?? null);
  const [loading, setLoading] = useState(!initialRegionFromAluno);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function requestLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") { setErrorMsg("Permissão de localização negada"); setLoading(false); return; }
        const loc = await Location.getCurrentPositionAsync({});
        if (!mounted) return;
        setRegion({ latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      } catch (err) {
        console.warn("Erro ao obter localização:", err);
        setErrorMsg("Não foi possível obter localização");
      } finally { setLoading(false); }
    }

    if (!initialRegionFromAluno) requestLocation();
    else setLoading(false);

    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <View style={[global.container, styles.center]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Carregando mapa...</Text>
      </View>
    );
  }

  if (!region) {
    return (
      <View style={[global.container, styles.center]}>
        <Text style={global.title}>Mapa</Text>
        <Text style={global.muted}>{errorMsg ?? "Região do mapa indisponível"}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[global.buttonOutline, { marginTop: 12 }]}>
          <Text style={global.buttonOutlineText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={region} showsUserLocation={true}>
        {aluno?.location && <Marker coordinate={{ latitude: aluno.location.latitude, longitude: aluno.location.longitude }} title={aluno.nome} description={aluno.matricula} />}
      </MapView>

      <TouchableOpacity style={styles.fab} onPress={() => navigation.goBack()}><Text style={{ color: "#fff", fontWeight: "700" }}>Fechar</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  fab: { position: "absolute", right: 16, bottom: 20, backgroundColor: "#FF5A5F", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 28, elevation: 4 },
});
