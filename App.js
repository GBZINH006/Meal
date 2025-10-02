// App.js
import React from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./src/contexts/AuthContext";

// telas
import SplashScreen from "./src/screens/SplashScreen";
import LoginScreen from "./src/screens/LoginScreen";
import AdminScreen from "./src/screens/AdminScreen";
import AlunoScreen from "./src/screens/Aluno";
import LocationScreen from "./src/screens/MapScreen";
import IntervalScreen from "./src/screens/IntervalScreen";
import TicketScreen from "./src/screens/TicketScreen";
import ValidateScreen from "./src/screens/ValidateScreen";
import StudentCardScreen from "./src/screens/StudentCardScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Admin" component={AdminScreen} />
          <Stack.Screen name="ADM" component={AdminScreen} />
          <Stack.Screen name="Aluno" component={AlunoScreen} />
          <Stack.Screen name="Student" component={AlunoScreen} />
          <Stack.Screen name="Location" component={LocationScreen} />
          <Stack.Screen name="Mapa" component={LocationScreen} />
          <Stack.Screen name="Interval" component={IntervalScreen} />
          <Stack.Screen name="Ticket" component={TicketScreen} />
          <Stack.Screen name="Validate" component={ValidateScreen} />
          <Stack.Screen name="CartaoAluno" component={StudentCardScreen} />
          <Stack.Screen name="StudentCard" component={StudentCardScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
