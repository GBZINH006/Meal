// src/navigation/AppNavigator.js
import React from "react";
import { Animated } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import config from "../config/appConfig";

import LoginScreen from "../screens/LoginScreen";
import ReceiveTicketScreen from "../screens/ReceiveTicketScreen";
import LocationScreen from "../screens/LocationScreen";
import MapScreen from "../screens/MapScreen";
import ValidateTicketScreen from "../screens/ValidateTicketScreen";
import IntervalScreen from "../screens/IntervalScreen";
import AdminScreen from "../screens/AdminScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function IconWithBounce({ name, color, size, focused }) {
  const anim = React.useRef(new Animated.Value(focused ? 1 : 0)).current;
  React.useEffect(() => {
    Animated.timing(anim, { toValue: focused ? 1 : 0, duration: 250, useNativeDriver: true }).start();
  }, [focused]);
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });
  return <Animated.View style={{ transform: [{ scale }, { translateY }] }}><Ionicons name={name} size={size} color={color} /></Animated.View>;
}

function AlunoTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: config.primaryColor,
      tabBarIcon: ({ focused, color, size }) =>{
        if (route.name === "Receber") return <IconWithBounce name="receipt-outline" focused={focused} color={color} size={size} />;
        if (route.name === "Localização") return <IconWithBounce name="location-outline" focused={focused} color={color} size={size} />;
        if (route.name === "Mapa") return <IconWithBounce name="map-outline" focused={focused} color={color} size={size} />;
        if (route.name === "Intervalo") return <IconWithBounce name="time-outline" focused={focused} color={color} size={size} />;
        return null;
      }
    })}>
      <Tab.Screen name="Receber" component={ReceiveTicketScreen} />
      <Tab.Screen name="Localização" component={LocationScreen} />
      <Tab.Screen name="Mapa" component={MapScreen} />
      <Tab.Screen name="Intervalo" component={IntervalScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Aluno" component={AlunoTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Validar" component={ValidateTicketScreen} />
        <Stack.Screen name="ADM" component={AdminScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
