// src/screens/ExactLocationScreen.js
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import global from "../styles/global";
import * as Location from "expo-location";

export default function ExactLocationScreen(){
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const pos = await Location.getCurrentPositionAsync({});
        setCoords(pos.coords);
      }
    })();
  }, []);

  return (
    <View style={global.container}>
      <Text style={global.title}>Minha Localização</Text>
      <Text style={global.label}>Latitude: {coords ? coords.latitude : "-"}</Text>
      <Text style={global.label}>Longitude: {coords ? coords.longitude : "-"}</Text>
    </View>
  );
}
