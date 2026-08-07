/* -----------------------------------------------------------------
 * ⚠️ Datos de ejemplo (mock). No hay backend/base de datos en este
 * proyecto todavía, así que amigos, feed y rankings de otros usuarios
 * son simulados localmente para que la interfaz sea completa y quede
 * lista para conectarse a una API real más adelante.
 * ----------------------------------------------------------------- */

export type MockFriend = {
  id: string;
  name: string;
  avatar: string;
  level: number;
  streak: number;
  engagementScore: number;
  city: string;
  elo: number;
};

export const MOCK_FRIENDS: MockFriend[] = [
  { id: "f1", name: "Carlos Ruiz", avatar: "🧔", level: 14, streak: 21, engagementScore: 88, city: "Barcelona", elo: 1420 },
  { id: "f2", name: "Laura Gómez", avatar: "👩", level: 18, streak: 10, engagementScore: 92, city: "Barcelona", elo: 1510 },
  { id: "f3", name: "Pedro Sánchez", avatar: "🧑", level: 9, streak: 4, engagementScore: 64, city: "Madrid", elo: 1280 },
  { id: "f4", name: "Ana Torres", avatar: "👩‍🦱", level: 21, streak: 35, engagementScore: 95, city: "Barcelona", elo: 1610 },
  { id: "f5", name: "Diego Martín", avatar: "🧑‍🦲", level: 7, streak: 2, engagementScore: 51, city: "Valencia", elo: 1190 },
];

export type FeedEvent = {
  id: string;
  actor: string;
  avatar: string;
  text: string;
  timeAgo: string;
};

export const MOCK_FEED: FeedEvent[] = [
  { id: "fe1", actor: "Carlos", avatar: "🧔", text: "completó Push Day", timeAgo: "hace 12 min" },
  { id: "fe2", actor: "Laura", avatar: "👩", text: "consiguió una racha de 10 días", timeAgo: "hace 1 h" },
  { id: "fe3", actor: "Pedro", avatar: "🧑", text: "ganó un duelo de dominadas", timeAgo: "hace 3 h" },
  { id: "fe4", actor: "Ana", avatar: "👩‍🦱", text: "subió al Top 5 del ranking de Barcelona", timeAgo: "hace 5 h" },
  { id: "fe5", actor: "Diego", avatar: "🧑‍🦲", text: "registró su primer 5K", timeAgo: "ayer" },
];

export type DuelType =
  | "Dominadas"
  | "Flexiones"
  | "Sentadillas"
  | "Abdominales"
  | "Burpees"
  | "5 km"
  | "10 km"
  | "Ritmo medio"
  | "Distancia corriendo"
  | "Distancia bicicleta"
  | "Pasos"
  | "Tiempo entrenando"
  | "Calorías quemadas"
  | "Volumen levantado";

export const DUEL_TYPES: DuelType[] = [
  "Dominadas",
  "Flexiones",
  "Sentadillas",
  "Abdominales",
  "Burpees",
  "5 km",
  "10 km",
  "Ritmo medio",
  "Distancia corriendo",
  "Distancia bicicleta",
  "Pasos",
  "Tiempo entrenando",
  "Calorías quemadas",
  "Volumen levantado",
];

export type Duel = {
  id: string;
  opponentId: string;
  type: DuelType;
  myScore: number;
  opponentScore: number;
  status: "en curso" | "ganado" | "perdido" | "empate";
  startsAt: string; // sábado 00:00
  endsAt: string; // domingo 23:59
};
