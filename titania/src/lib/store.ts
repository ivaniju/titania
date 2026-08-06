"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ─────────────────────────────────────────────
   TIPOS PÚBLICOS
───────────────────────────────────────────── */

export type ChatTurn = { role: "titan" | "user"; text: string };

export type Profile = {
  name?: string;
  age?: string;
  sex?: string;
  height?: string;
  weight?: string;
  targetWeight?: string;
  goal?: string;
  level?: string;
  trainingDays?: string;
  trainingPlace?: string;
  equipment?: string;
  injury?: string;
  allergies?: string;
  dietPreference?: string;
  sleepHours?: string;
  dailyActivity?: string;
  supermarket?: string;
};

export type LoggedSet = { weight: number; reps: number; rpe: number };

export type Exercise = {
  id: string;
  name: string;
  targetSets: number;
  targetReps: string;
  muscleGroup?: string;
  loggedSets: LoggedSet[];
};

export type MealMacros = {
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Meal = MealMacros & {
  id: string;
  icon: string;
  alternatives: MealMacros[];
};

export type ShoppingItem = {
  id: string;
  name: string;
  category: string;
  checked: boolean;
  quantity?: string;
  fromMenu?: boolean; // auto-generated from weekly menu
};

export type WeighIn = { date: string; weight: number };

export type ChatMessage = { role: "user" | "titan"; text: string };

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  xpReward: number;
};

export type ChallengeType = "daily" | "weekly" | "monthly";

export type Challenge = {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  progress: number;
  target: number;
  unit: string;
  xpReward: number;
  completed: boolean;
  requiresWatch: boolean;
};

export type Friend = {
  id: string;
  name: string;
  level: number;
  xp: number;
  streak: number;
  avatar?: string;
  commitmentIndex: number;
  position: number;
  status: "accepted" | "pending_sent" | "pending_received";
};

export type FeedItem = {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  icon: string;
};

export type Duel = {
  id: string;
  opponentId: string;
  opponentName: string;
  type: string;
  myScore: number;
  opponentScore: number;
  status: "active" | "won" | "lost" | "pending";
  startedAt: string;
  endsAt: string;
};

export type DailyStats = {
  date: string;
  water: number;       // litros
  steps: number;
  sleepHours: number;
  caloriesBurned: number;
  workoutMinutes: number;
  proteinGrams: number;
  screenMinutes: number;
  fromWatch: boolean;
};

export type HealthSource = "apple_health" | "health_connect" | "manual" | "none";

export type ProgressPhoto = {
  id: string;
  date: string;        // ISO date string
  dataUrl: string;     // base64 data URL stored locally
  note?: string;
};

// Historial de comidas por día (clave: "YYYY-MM-DD")
export type DayMeals = {
  date: string;
  meals: Meal[];
  completed: Record<string, boolean>;
};

export type NotificationSettings = {
  enabled: boolean;
  remindFood: boolean;
  remindWater: boolean;
  remindWorkout: boolean;
  dailySummary: boolean;
  weeklySummary: boolean;
  duelAvailable: boolean;
  friendSurpassed: boolean;
};

/* ─────────────────────────────────────────────
   FUNCIONES DE UTILIDAD (exportadas)
───────────────────────────────────────────── */

export function xpToLevel(xp: number): {
  level: number;
  levelXp: number;
  nextLevelXp: number;
} {
  let level = 1;
  let accumulated = 0;
  while (accumulated + 500 * level <= xp) {
    accumulated += 500 * level;
    level++;
  }
  return { level, levelXp: xp - accumulated, nextLevelXp: 500 * level };
}

export function commitmentIndex(stats: {
  workoutsThisWeek: number;
  nutritionDays: number;
  avgSteps: number;
  avgWater: number;
  avgSleep: number;
}): number {
  const workout = Math.min(stats.workoutsThisWeek / 4, 1) * 40;
  const nutrition = Math.min(stats.nutritionDays / 5, 1) * 25;
  const steps = Math.min(stats.avgSteps / 10000, 1) * 15;
  const water = Math.min(stats.avgWater / 2, 1) * 10;
  const sleep = Math.min(stats.avgSleep / 8, 1) * 10;
  return Math.round(workout + nutrition + steps + water + sleep);
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function isoToLabel(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
}

/* ─────────────────────────────────────────────
   PLANTILLAS BASE (sin datos personales)
───────────────────────────────────────────── */

const baseMeals: Meal[] = [
  {
    id: "desayuno",
    icon: "🍳",
    name: "Desayuno pendiente",
    kcal: 0, protein: 0, carbs: 0, fat: 0,
    alternatives: [],
  },
  {
    id: "comida",
    icon: "🥗",
    name: "Comida pendiente",
    kcal: 0, protein: 0, carbs: 0, fat: 0,
    alternatives: [],
  },
  {
    id: "cena",
    icon: "🍗",
    name: "Cena pendiente",
    kcal: 0, protein: 0, carbs: 0, fat: 0,
    alternatives: [],
  },
  {
    id: "snack",
    icon: "🥤",
    name: "Snack pendiente",
    kcal: 0, protein: 0, carbs: 0, fat: 0,
    alternatives: [],
  },
];

const baseExercises: Exercise[] = [
  { id: "e1", name: "Press banca", targetSets: 4, targetReps: "6-8", muscleGroup: "Pecho", loggedSets: [] },
  { id: "e2", name: "Press militar", targetSets: 3, targetReps: "8-10", muscleGroup: "Hombro", loggedSets: [] },
  { id: "e3", name: "Fondos", targetSets: 3, targetReps: "10-12", muscleGroup: "Tríceps", loggedSets: [] },
  { id: "e4", name: "Elevaciones laterales", targetSets: 3, targetReps: "12-15", muscleGroup: "Hombro", loggedSets: [] },
  { id: "e5", name: "Extensión tríceps", targetSets: 3, targetReps: "12-15", muscleGroup: "Tríceps", loggedSets: [] },
];

const baseChallenges: Challenge[] = [
  {
    id: "c1", title: "Entrena hoy",
    description: "Completa 1 entrenamiento",
    type: "daily", progress: 0, target: 1, unit: "entrenos",
    xpReward: 50, completed: false, requiresWatch: false,
  },
  {
    id: "c2", title: "Hidratación diaria",
    description: "Bebe 2 litros de agua",
    type: "daily", progress: 0, target: 2, unit: "litros",
    xpReward: 30, completed: false, requiresWatch: false,
  },
  {
    id: "c3", title: "10.000 pasos",
    description: "Camina 10.000 pasos",
    type: "daily", progress: 0, target: 10000, unit: "pasos",
    xpReward: 40, completed: false, requiresWatch: true,
  },
  {
    id: "c4", title: "Semana activa",
    description: "Entrena 4 veces esta semana",
    type: "weekly", progress: 0, target: 4, unit: "entrenos",
    xpReward: 150, completed: false, requiresWatch: false,
  },
  {
    id: "c5", title: "Corre 20km",
    description: "Acumula 20 km corriendo esta semana",
    type: "weekly", progress: 0, target: 20, unit: "km",
    xpReward: 200, completed: false, requiresWatch: true,
  },
  {
    id: "c6", title: "Mes activo",
    description: "Entrena 16 veces este mes",
    type: "monthly", progress: 0, target: 16, unit: "entrenos",
    xpReward: 500, completed: false, requiresWatch: false,
  },
];

const baseAchievements: Achievement[] = [
  { id: "a1", title: "Primer entreno", description: "Completaste tu primer entrenamiento", icon: "🏋️", xpReward: 100 },
  { id: "a2", title: "7 días seguidos", description: "Racha de 7 días activos", icon: "🔥", xpReward: 250 },
  { id: "a3", title: "Hidratado", description: "Bebiste 2L durante 5 días", icon: "💧", xpReward: 150 },
  { id: "a4", title: "30 días activo", description: "Mantuviste actividad 30 días", icon: "🗓️", xpReward: 500 },
  { id: "a5", title: "100 entrenos", description: "Completaste 100 entrenamientos", icon: "💯", xpReward: 1000 },
  { id: "a6", title: "Primer 5K", description: "Corriste 5 kilómetros", icon: "🏃", xpReward: 300 },
  { id: "a7", title: "Proteína perfecta", description: "Cumpliste tu objetivo 7 días", icon: "🥩", xpReward: 200 },
  { id: "a8", title: "Top amigos", description: "Líder del ranking de amigos", icon: "🏆", xpReward: 400 },
  { id: "a9", title: "Primer duelo", description: "Participaste en tu primer duelo", icon: "⚔️", xpReward: 150 },
  { id: "a10", title: "Guerrero", description: "Ganaste un duelo de fin de semana", icon: "🛡️", xpReward: 350 },
  { id: "a11", title: "Madrugador", description: "Entrenaste antes de las 8am 5 veces", icon: "🌅", xpReward: 200 },
  { id: "a12", title: "Consistente", description: "4 semanas entrenando mínimo 3 días", icon: "📅", xpReward: 600 },
];

const emptyDailyStats = (): DailyStats => ({
  date: todayISO(),
  water: 0,
  steps: 0,
  sleepHours: 0,
  caloriesBurned: 0,
  workoutMinutes: 0,
  proteinGrams: 0,
  screenMinutes: 0,
  fromWatch: false,
});

const defaultNotifications: NotificationSettings = {
  enabled: false,
  remindFood: true,
  remindWater: true,
  remindWorkout: true,
  dailySummary: true,
  weeklySummary: true,
  duelAvailable: true,
  friendSurpassed: true,
};

/* ─────────────────────────────────────────────
   STORE TYPE
───────────────────────────────────────────── */

type TitanState = {
  // ── Onboarding ──
  onboardingCompleted: boolean;
  stepIndex: number;
  profile: Profile;
  history: ChatTurn[];
  answerStep: (field: keyof Profile, value: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  // ── XP / nivel ──
  xp: number;
  addXp: (amount: number) => void;

  // ── Racha ──
  streak: number;
  lastActiveDate: string;
  updateStreak: () => void;

  // ── Health / reloj ──
  healthSource: HealthSource;
  setHealthSource: (src: HealthSource) => void;

  // ── Estadísticas diarias ──
  dailyStats: DailyStats;
  dailyHistory: DailyStats[];  // historial de días anteriores
  updateWater: (liters: number) => void;
  updateSteps: (steps: number, fromWatch?: boolean) => void;
  updateSleep: (hours: number) => void;
  updateScreenTime: (minutes: number) => void;
  syncHealthData: (data: Partial<DailyStats>) => void;

  // ── Entrenamiento ──
  todayWorkout: { title: string; meta: string; exercises: Exercise[]; completed: boolean };
  logSet: (exerciseId: string, set: LoggedSet) => void;
  completeWorkout: () => void;

  // ── Nutrición ──
  meals: Meal[];
  mealsCompleted: Record<string, boolean>;
  toggleMealDone: (mealId: string) => void;
  swapMeal: (mealId: string) => void;
  updateMeal: (mealId: string, data: Partial<MealMacros>) => void;

  // ── Historial semanal de comidas ──
  mealHistory: DayMeals[];
  saveTodayMeals: () => void;

  // ── Lista de la compra ──
  shoppingList: ShoppingItem[];
  addShoppingItem: (item: Omit<ShoppingItem, "id" | "checked">) => void;
  removeShoppingItem: (id: string) => void;
  toggleShoppingItem: (id: string) => void;
  resetShoppingList: () => void;
  generateShoppingListFromMenu: () => void;

  // ── Progreso (peso) ──
  weighIns: WeighIn[];
  addWeighIn: (weight: number) => void;

  // ── Fotos de progreso ──
  progressPhotos: ProgressPhoto[];
  addProgressPhoto: (dataUrl: string, note?: string) => void;
  removeProgressPhoto: (id: string) => void;

  // ── Logros ──
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  pendingAchievement: Achievement | null;
  clearPendingAchievement: () => void;

  // ── Retos ──
  challenges: Challenge[];
  updateChallengeProgress: (id: string, progress: number) => void;

  // ── Social / Amigos ──
  friends: Friend[];
  friendRequests: Friend[];
  feed: FeedItem[];
  duels: Duel[];
  sendFriendRequest: (name: string) => void;
  acceptFriendRequest: (id: string) => void;
  removeFriend: (id: string) => void;

  // ── Ranking ──
  userCommitmentIndex: number;

  // ── Chat con Titan (IA) ──
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => Promise<void>;
  chatLoading: boolean;

  // ── Notificaciones ──
  notifications: NotificationSettings;
  updateNotifications: (settings: Partial<NotificationSettings>) => void;
};

/* ─────────────────────────────────────────────
   STORE
───────────────────────────────────────────── */

export const useTitanStore = create<TitanState>()(
  persist(
    (set, get) => ({
      // ── Onboarding ──
      onboardingCompleted: false,
      stepIndex: 0,
      profile: {},
      history: [],
      answerStep: (field, value) =>
        set((s) => ({
          profile: { ...s.profile, [field]: value },
          history: [...s.history, { role: "user", text: value }],
          stepIndex: s.stepIndex + 1,
        })),
      completeOnboarding: () =>
        set({
          onboardingCompleted: true,
          // Inicializar datos reales al completar onboarding
          chatMessages: [
            {
              role: "titan",
              text: "¡Hola! Ya tengo tu perfil listo. Soy tu entrenador personal con IA — pregúntame cualquier cosa sobre nutrición, entrenamiento, hábitos o recetas. También puedo analizar tu progreso y adaptar el plan según cómo evoluciones. ¿Por dónde empezamos? 💪",
            },
          ],
        }),
      resetOnboarding: () =>
        set({
          onboardingCompleted: false,
          stepIndex: 0,
          profile: {},
          history: [],
          xp: 0,
          streak: 0,
          lastActiveDate: "",
          dailyStats: emptyDailyStats(),
          dailyHistory: [],
          weighIns: [],
          progressPhotos: [],
          mealHistory: [],
          shoppingList: [],
          friends: [],
          friendRequests: [],
          feed: [],
          duels: [],
          chatMessages: [],
          achievements: baseAchievements.map((a) => ({ ...a, unlockedAt: undefined })),
          challenges: baseChallenges.map((c) => ({ ...c, progress: 0, completed: false })),
          todayWorkout: {
            title: "Sin entreno asignado",
            meta: "Completa el onboarding para recibir tu plan",
            exercises: [],
            completed: false,
          },
          meals: baseMeals.map((m) => ({ ...m })),
          mealsCompleted: {},
          healthSource: "none",
          userCommitmentIndex: 0,
        }),

      // ── XP / nivel ──
      xp: 0,
      addXp: (amount) => set((s) => ({ xp: s.xp + amount })),

      // ── Racha ──
      streak: 0,
      lastActiveDate: "",
      updateStreak: () => {
        const today = todayISO();
        set((s) => {
          if (s.lastActiveDate === today) return s;
          const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
          const newStreak = s.lastActiveDate === yesterday ? s.streak + 1 : 1;
          return { streak: newStreak, lastActiveDate: today };
        });
      },

      // ── Health ──
      healthSource: "none",
      setHealthSource: (src) => set({ healthSource: src }),

      // ── Estadísticas diarias ──
      dailyStats: emptyDailyStats(),
      dailyHistory: [],
      updateWater: (liters) =>
        set((s) => ({ dailyStats: { ...s.dailyStats, water: liters } })),
      updateSteps: (steps, fromWatch = false) =>
        set((s) => ({
          dailyStats: { ...s.dailyStats, steps, fromWatch: fromWatch || s.dailyStats.fromWatch },
        })),
      updateSleep: (hours) =>
        set((s) => ({ dailyStats: { ...s.dailyStats, sleepHours: hours } })),
      updateScreenTime: (minutes) =>
        set((s) => ({ dailyStats: { ...s.dailyStats, screenMinutes: minutes } })),
      syncHealthData: (data) => {
        set((s) => ({
          dailyStats: { ...s.dailyStats, ...data, fromWatch: true },
        }));
      },

      // ── Entrenamiento ──
      todayWorkout: {
        title: "Empuje — Fuerza",
        meta: "5 ejercicios · ~52 min · Gimnasio completo",
        exercises: baseExercises.map((e) => ({ ...e })),
        completed: false,
      },
      logSet: (exerciseId, newSet) =>
        set((s) => ({
          todayWorkout: {
            ...s.todayWorkout,
            exercises: s.todayWorkout.exercises.map((ex) =>
              ex.id === exerciseId ? { ...ex, loggedSets: [...ex.loggedSets, newSet] } : ex
            ),
          },
        })),
      completeWorkout: () =>
        set((s) => ({
          todayWorkout: { ...s.todayWorkout, completed: true },
          xp: s.xp + 120,
          dailyStats: {
            ...s.dailyStats,
            workoutMinutes: s.dailyStats.workoutMinutes + 52,
          },
          chatMessages: [
            ...s.chatMessages,
            {
              role: "titan" as const,
              text: "Entreno registrado 💪 +120 XP. Con los datos de hoy ajustaré la carga de la próxima semana.",
            },
          ],
        })),

      // ── Nutrición ──
      meals: baseMeals.map((m) => ({ ...m })),
      mealsCompleted: {},
      toggleMealDone: (mealId) =>
        set((s) => {
          const isDone = !s.mealsCompleted[mealId];
          const meal = s.meals.find((m) => m.id === mealId);
          const xpDelta = meal ? (isDone ? 15 : -15) : 0;
          return {
            mealsCompleted: { ...s.mealsCompleted, [mealId]: isDone },
            xp: Math.max(0, s.xp + xpDelta),
            dailyStats: {
              ...s.dailyStats,
              proteinGrams: isDone
                ? s.dailyStats.proteinGrams + (meal?.protein ?? 0)
                : Math.max(0, s.dailyStats.proteinGrams - (meal?.protein ?? 0)),
            },
          };
        }),
      swapMeal: (mealId) =>
        set((s) => ({
          meals: s.meals.map((meal) => {
            if (meal.id !== mealId || meal.alternatives.length === 0) return meal;
            const [nextAlt, ...rest] = meal.alternatives;
            const currentAsAlt: MealMacros = {
              name: meal.name, kcal: meal.kcal, protein: meal.protein,
              carbs: meal.carbs, fat: meal.fat,
            };
            return { ...meal, ...nextAlt, alternatives: [...rest, currentAsAlt] };
          }),
        })),
      updateMeal: (mealId, data) =>
        set((s) => ({
          meals: s.meals.map((m) => m.id === mealId ? { ...m, ...data } : m),
        })),

      // ── Historial semanal ──
      mealHistory: [],
      saveTodayMeals: () =>
        set((s) => {
          const today = todayISO();
          const existing = s.mealHistory.findIndex((d) => d.date === today);
          const entry: DayMeals = { date: today, meals: s.meals, completed: s.mealsCompleted };
          if (existing >= 0) {
            const updated = [...s.mealHistory];
            updated[existing] = entry;
            return { mealHistory: updated };
          }
          return { mealHistory: [...s.mealHistory, entry].slice(-30) }; // keep 30 days
        }),

      // ── Lista de la compra ──
      shoppingList: [],
      addShoppingItem: (item) =>
        set((s) => ({
          shoppingList: [
            ...s.shoppingList,
            { ...item, id: `si-${Date.now()}-${Math.random().toString(36).slice(2)}`, checked: false },
          ],
        })),
      removeShoppingItem: (id) =>
        set((s) => ({ shoppingList: s.shoppingList.filter((i) => i.id !== id) })),
      toggleShoppingItem: (id) =>
        set((s) => ({
          shoppingList: s.shoppingList.map((i) =>
            i.id === id ? { ...i, checked: !i.checked } : i
          ),
        })),
      resetShoppingList: () =>
        set((s) => ({
          shoppingList: s.shoppingList.map((i) => ({ ...i, checked: false })),
        })),
      generateShoppingListFromMenu: () =>
        set((s) => {
          const categories: Record<string, { name: string; category: string; quantity: string }[]> = {
            "🥩 Proteínas": [],
            "🥦 Verduras": [],
            "🥣 Cereales": [],
            "🥛 Lácteos / Huevos": [],
            "🧂 Despensa": [],
            "🍎 Frutas": [],
          };

          // Extraer ingredientes de los nombres de las comidas de la semana
          const allMealNames = [
            ...s.meals.map((m) => m.name),
            ...s.mealHistory.flatMap((d) => d.meals.map((m) => m.name)),
          ];

          const keywords: { word: string; category: string }[] = [
            { word: "pollo", category: "🥩 Proteínas" },
            { word: "ternera", category: "🥩 Proteínas" },
            { word: "salmón", category: "🥩 Proteínas" },
            { word: "merluza", category: "🥩 Proteínas" },
            { word: "atún", category: "🥩 Proteínas" },
            { word: "pavo", category: "🥩 Proteínas" },
            { word: "tofu", category: "🥩 Proteínas" },
            { word: "huevo", category: "🥛 Lácteos / Huevos" },
            { word: "yogur", category: "🥛 Lácteos / Huevos" },
            { word: "queso", category: "🥛 Lácteos / Huevos" },
            { word: "leche", category: "🥛 Lácteos / Huevos" },
            { word: "arroz", category: "🥣 Cereales" },
            { word: "avena", category: "🥣 Cereales" },
            { word: "quinoa", category: "🥣 Cereales" },
            { word: "pasta", category: "🥣 Cereales" },
            { word: "pan", category: "🥣 Cereales" },
            { word: "boniato", category: "🥣 Cereales" },
            { word: "brócoli", category: "🥦 Verduras" },
            { word: "tomate", category: "🥦 Verduras" },
            { word: "lechuga", category: "🥦 Verduras" },
            { word: "espárrago", category: "🥦 Verduras" },
            { word: "espinaca", category: "🥦 Verduras" },
            { word: "plátano", category: "🍎 Frutas" },
            { word: "manzana", category: "🍎 Frutas" },
            { word: "naranja", category: "🍎 Frutas" },
            { word: "fruta", category: "🍎 Frutas" },
            { word: "aceite", category: "🧂 Despensa" },
            { word: "almendra", category: "🧂 Despensa" },
            { word: "nuez", category: "🧂 Despensa" },
          ];

          const found = new Set<string>();
          allMealNames.forEach((name) => {
            keywords.forEach((k) => {
              if (name.toLowerCase().includes(k.word) && !found.has(k.word)) {
                found.add(k.word);
                categories[k.category].push({
                  name: k.word.charAt(0).toUpperCase() + k.word.slice(1),
                  category: k.category,
                  quantity: "",
                });
              }
            });
          });

          // Eliminar items de menú anteriores, mantener los manuales
          const manual = s.shoppingList.filter((i) => !i.fromMenu);
          const generated: ShoppingItem[] = Object.values(categories)
            .flat()
            .map((item) => ({
              id: `menu-${item.name}-${Date.now()}`,
              name: item.name,
              category: item.category,
              quantity: item.quantity,
              checked: false,
              fromMenu: true,
            }));

          return { shoppingList: [...manual, ...generated] };
        }),

      // ── Progreso ──
      weighIns: [],
      addWeighIn: (weight) =>
        set((s) => ({
          weighIns: [
            ...s.weighIns,
            { date: todayISO(), weight },
          ],
        })),

      // ── Fotos de progreso ──
      progressPhotos: [],
      addProgressPhoto: (dataUrl, note) =>
        set((s) => ({
          progressPhotos: [
            ...s.progressPhotos,
            { id: `photo-${Date.now()}`, date: todayISO(), dataUrl, note },
          ],
        })),
      removeProgressPhoto: (id) =>
        set((s) => ({
          progressPhotos: s.progressPhotos.filter((p) => p.id !== id),
        })),

      // ── Logros ──
      achievements: baseAchievements.map((a) => ({ ...a })),
      pendingAchievement: null,
      unlockAchievement: (id) =>
        set((s) => {
          const achievement = s.achievements.find((a) => a.id === id);
          if (!achievement || achievement.unlockedAt) return s;
          const updated = s.achievements.map((a) =>
            a.id === id ? { ...a, unlockedAt: new Date().toISOString() } : a
          );
          return {
            achievements: updated,
            xp: s.xp + (achievement.xpReward ?? 0),
            pendingAchievement: achievement,
          };
        }),
      clearPendingAchievement: () => set({ pendingAchievement: null }),

      // ── Retos ──
      challenges: baseChallenges.map((c) => ({ ...c })),
      updateChallengeProgress: (id, progress) =>
        set((s) => ({
          challenges: s.challenges.map((c) => {
            if (c.id !== id) return c;
            const completed = progress >= c.target;
            if (completed && !c.completed) {
              // Defer XP to next tick to avoid nested set
              setTimeout(() => get().addXp(c.xpReward), 0);
            }
            return { ...c, progress, completed };
          }),
        })),

      // ── Social / Amigos ──
      friends: [],
      friendRequests: [],
      feed: [],
      duels: [],
      sendFriendRequest: (name) =>
        set((s) => ({
          friendRequests: [
            ...s.friendRequests,
            {
              id: `fr-${Date.now()}`,
              name,
              level: 0,
              xp: 0,
              streak: 0,
              commitmentIndex: 0,
              position: 0,
              status: "pending_sent" as const,
            },
          ],
        })),
      acceptFriendRequest: (id) =>
        set((s) => {
          const req = s.friendRequests.find((r) => r.id === id);
          if (!req) return s;
          return {
            friends: [...s.friends, { ...req, status: "accepted" as const }],
            friendRequests: s.friendRequests.filter((r) => r.id !== id),
          };
        }),
      removeFriend: (id) =>
        set((s) => ({ friends: s.friends.filter((f) => f.id !== id) })),

      // ── Ranking ──
      userCommitmentIndex: 0,

      // ── Chat ──
      chatMessages: [],
      chatLoading: false,
      sendChatMessage: async (text) => {
        set((s) => ({
          chatMessages: [...s.chatMessages, { role: "user" as const, text }],
          chatLoading: true,
        }));

        try {
          const state = get();
          const context = {
            profile: state.profile,
            xp: state.xp,
            streak: state.streak,
            dailyStats: state.dailyStats,
            weighIns: state.weighIns.slice(-5),
            completedChallenges: state.challenges.filter((c) => c.completed).length,
            totalChallenges: state.challenges.length,
          };

          const systemPrompt = `Eres Titan, el entrenador personal con IA de la aplicación Titania. 
Eres experto en nutrición deportiva, entrenamiento de fuerza, hábitos saludables y psicología del rendimiento.
Siempre respondes en español, de forma concisa, motivadora y personalizada.
Contexto actual del usuario: ${JSON.stringify(context)}
Nunca digas que eres una IA de OpenAI. Eres Titan.`;

          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [
                { role: "system", content: systemPrompt },
                ...state.chatMessages.slice(-10).map((m) => ({
                  role: m.role === "titan" ? "assistant" : "user",
                  content: m.text,
                })),
                { role: "user", content: text },
              ],
            }),
          });

          if (!res.ok) throw new Error("API error");
          const data = await res.json() as { reply: string };
          set((s) => ({
            chatMessages: [
              ...s.chatMessages,
              { role: "titan" as const, text: data.reply },
            ],
            chatLoading: false,
          }));
        } catch {
          set((s) => ({
            chatMessages: [
              ...s.chatMessages,
              {
                role: "titan" as const,
                text: "En este momento no tengo conexión. Revisa tu clave de API en la configuración y vuelve a intentarlo.",
              },
            ],
            chatLoading: false,
          }));
        }
      },

      // ── Notificaciones ──
      notifications: defaultNotifications,
      updateNotifications: (settings) =>
        set((s) => ({ notifications: { ...s.notifications, ...settings } })),
    }),
    { name: "titan-store-v3" }
  )
);
