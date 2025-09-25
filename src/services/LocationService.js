// src/services/LocationService.js
import * as Location from "expo-location";

export async function requestPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

export async function getCurrentPositionAsync() {
  return await Location.getCurrentPositionAsync({});
}

export function distanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
  function toRad(x) { return x * Math.PI / 180; }
  const R = 6371e3;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function findNearestInstitution(userCoords, institutions = []) {
  if (!userCoords || !Array.isArray(institutions) || institutions.length === 0) return null;
  let best = null;
  for (const inst of institutions){
    if (!inst || !inst.coords) continue;
    const d = distanceMeters(userCoords.latitude, userCoords.longitude, inst.coords.latitude, inst.coords.longitude);
    if (!best || d < best.distance) best = { institution: inst, distance: d };
  }
  return best;
}
