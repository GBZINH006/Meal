// src/screens/LocationScreen.js
import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import global from "../styles/global";
import RedButton from "../components/RedButton";
import * as Location from "expo-location";
import config from "../config/appConfig";
import { distanceMeters } from "../services/LocationService";

export default function LocationScreen() {
  const [coords, setCoords] = useState(null);
  const [inside, setInside] = useState(false);

  async function enableLocation(){
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão negada");
      return;
    }
    const pos = await Location.getCurrentPositionAsync({});
    setCoords(pos.coords);
    const d = distanceMeters(pos.coords.latitude, pos.coords.longitude, config.schoolCoords.latitude, config.schoolCoords.longitude);
    setInside(d <= config.schoolRadiusMeters);
  }

  return (
    <View style={global.container}>
      <Text style={global.title}>Localização</Text>
      <Text style={global.label}>Coordenadas encontradas: {coords ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` : "Nenhuma"}</Text>
      <Text style={global.label}>Dentro da área da escola: {inside ? "Sim" : "Não"}</Text>
      <RedButton title="Pedir permissão e obter localização" onPress={enableLocation} />
    </View>
  );
}
