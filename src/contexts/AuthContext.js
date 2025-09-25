// src/contexts/AuthContext.js
import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }){
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState({ coords: null, insideSchool: false, distanceMeters: null, institution: null });
  return (
    <AuthContext.Provider value={{ user, setUser, location, setLocation }}>
      {children}
    </AuthContext.Provider>
  );
}
