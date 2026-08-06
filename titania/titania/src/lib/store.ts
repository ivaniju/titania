"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ─────────────────────────────────────────────
   TIPOS
───────────────────────────────────────────── */

export type ChatTurn = { role: "titan" | "user"; text: string };

export type Profile = {
  // datos personales
  name?: string;
  age?: string;
  sex?: string;
  height?: string;
  weight?: string;
  targetWeight?: string;
  // objetivo
  goal?: string;
  // entrenamiento
  level?: string;
  trainingDays?: string;
  trainingPlace?: string;
  equipment?: string;
  injury?: string;
  // nutrición
  allergies?: string;
  dietPreference?: string;
  // hábitos
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
  id: "desayuno" | "comida" | "cena" | "snack";
  icon: string;
  alternatives: MealMacros[];
};

export type ShoppingItem = {
  id: string;
  name: string;
  category: string;
  checked: boolean;
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

export type Challenge = {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "monthly";
  progress: number;
  target: number;
  unit: string;
  xpReward: number;
  completed: boolean;
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
  water: number;
  steps: number;
  sleepHours: number;
  caloriesBurned: number;
  workoutMinutes: number;
  proteinGrams: number;
};

/* ─────────────────────────────────────────────
   DATOS INICIALES
───────────────────────────────────────────── */

const initialExercises: Exercise[] = [
  { id: "e1", name: "Press banca", targetSets: 4, targetReps: "6-8", muscleGroup: "Pecho", loggedSets: [] },
  { id: "e2", name: "Press militar mancuerna", targetSets: 3, targetReps: "8-10", muscleGroup: "Hombro", loggedSets: [] },
  { id: "e3", name: "Fondos en paralelas", targetSets: 3, targetReps: "10-12", muscleGroup: "Tríceps", loggedSets: [] },
  { id: "e4", name: "Elevaciones laterales", targetSets: 3, targetReps: "12-15", muscleGroup: "Hombro", loggedSets: [] },
  { id: "e5", name: "Extensión tríceps polea", targetSets: 3, targetReps: "12-15", muscleGroup: "Tríceps", loggedSets: [] },
];

const initialMeals: Meal[] = [
  {
    id: "desayuno", icon: "🍳",
    name: "Tortilla de claras con avena",
    kcal: 480, protein: 38, carbs: 45, fat: 14,
    alternatives: [
      { name: "Yogur griego con frutos rojos y granola", kcal: 470, protein: 34, carbs: 50, fat: 12 },
      { name: "Tostadas integrales con aguacate y huevo", kcal: 500, protein: 30, carbs: 48, fat: 20 },
    ],
  },
  {
    id: "comida", icon: "🥗",
    name: "Pechuga de pollo con arroz y brócoli",
    kcal: 720, protein: 55, carbs: 80, fat: 16,
    alternatives: [
      { name: "Salmón con quinoa y espárragos", kcal: 710, protein: 48, carbs: 70, fat: 24 },
      { name: "Ternera magra con boniato asado", kcal: 730, protein: 52, carbs: 75, fat: 18 },
    ],
  },
  {
    id: "cena", icon: "🍗",
    name: "Merluza al horno con patata",
    kcal: 540, protein: 42, carbs: 50, fat: 14,
    alternatives: [
      { name: "Tofu salteado con verduras y arroz", kcal: 530, protein: 30, carbs: 60, fat: 16 },
      { name: "Pavo a la plancha con ensalada templada", kcal: 520, protein: 45, carbs: 35, fat: 18 },
    ],
  },
  {
    id: "snack", icon: "🥤",
    name: "Batido de proteína con plátano",
    kcal: 260, protein: 28, carbs: 32, fat: 4,
    alternatives: [
      { name: "Puñado de almendras y una manzana", kcal: 250, protein: 8, carbs: 28, fat: 14 },
      { name: "Queso fresco batido con nueces", kcal: 240, protein: 20, carbs: 14, fat: 12 },
    ],
  },
];

const initialShoppingList: ShoppingItem[] = [
  { id: "s1", name: "Pechuga de pollo", category: "🥩 Carnicería", checked: false },
  { id: "s2", name: "Ternera magra picada", category: "🥩 Carnicería", checked: false },
  { id: "s3", name: "Merluza", category: "🐟 Pescadería", checked: false },
  { id: "s4", name: "Salmón", category: "🐟 Pescadería", checked: false },
  { id: "s5", name: "Brócoli", category: "🥦 Frutas y verduras", checked: false },
  { id: "s6", name: "Espárragos", category: "🥦 Frutas y verduras", checked: false },
  { id: "s7", name: "Plátanos", category: "🥦 Frutas y verduras", checked: false },
  { id: "s8", name: "Aguacates", category: "🥦 Frutas y verduras", checked: false },
  { id: "s9", name: "Yogur griego", category: "🥛 Lácteos", checked: false },
  { id: "s10", name: "Huevos", category: "🥛 Lácteos", checked: false },
  { id: "s11", name: "Avena", category: "🥣 Cereales", checked: false },
  { id: "s12", name: "Arroz", category: "🥣 Cereales", checked: false },
  { id: "s13", name: "Quinoa", category: "🥣 Cereales", checked: false },
  { id: "s14", name: "Aceite de oliva", category: "🧂 Despensa", checked: false },
  { id: "s15", name: "Almendras", category: "🧂 Despensa", checked: false },
];

const initialWeighIns: WeighIn[] = [
  { date: "Sem 1", weight: 82.4 },
  { date: "Sem 2", weight: 81.9 },
  { date: "Sem 3", weight: 81.5 },
  { date: "Sem 4", weight: 81.3 },
  { date: "Sem 5", weight: 80.8 },
  { date: "Sem 6", weight: 80.2 },
];

const initialAchievements: Achievement[] = [
  { id: "a1", title: "Primer entreno", description: "Completaste tu primer entrenamiento", icon: "🏋️", xpReward: 100, unlockedAt: "2024-01-15" },
  { id: "a2", title: "7 días seguidos", description: "Racha de 7 días activos", icon: "🔥", xpReward: 250, unlockedAt: "2024-01-22" },
  { id: "a3", title: "Hidratado", description: "Bebiste 2L durante 5 días", icon: "💧", xpReward: 150 },
  { id: "a4", title: "30 días activo", description: "Mantuviste actividad 30 días", icon: "🗓️", xpReward: 500 },
  { id: "a5", title: "100 entrenos", description: "Completaste 100 entrenamientos", icon: "💯", xpReward: 1000 },
  { id: "a6", title: "Primer 5K", description: "Corriste 5 kilómetros", icon: "🏃", xpReward: 300 },
  { id: "a7", title: "Proteína perfecta", description: "Cumpliste tu objetivo de proteína 7 días", icon: "🥩", xpReward: 200 },
  { id: "a8", title: "Top 10", description: "Entraste en el top 10 del ranking", icon: "🏆", xpReward: 400 },
  { id: "a9", title: "Primer duelo", description: "Participaste en tu primer duelo", icon: "⚔️", xpReward: 150 },
  { id: "a10", title: "Guerrero del fin de semana", description: "Ganaste un duelo de fin de semana", icon: "🛡️", xpReward: 350 },
  { id: "a11", title: "Madrugador", description: "Entrena antes de las 8am 5 veces", icon: "🌅", xpReward: 200 },
  { id: "a12", title: "Consistente", description: "4 semanas entrenando mínimo 3 días", icon: "📅", xpReward: 600 },
];

const initialChallenges: Challenge[] = [
  { id: "c1", title: "Entrena hoy", description: "Completa 1 entrenamiento", type: "daily", progress: 0, target: 1, unit: "entrenos", xpReward: 50, completed: false },
  { id: "c2", title: "Hidratación diaria", description: "Bebe 2 litros de agua", type: "daily", progress: 1.4, target: 2, unit: "litros", xpReward: 30, completed: false },
  { id: "c3", title: "10.000 pasos", description: "Camina 10.000 pasos", type: "daily", progress: 6204, target: 10000, unit: "pasos", xpReward: 40, completed: false },
  { id: "c4", title: "Semana activa", description: "Entrena 4 veces esta semana", type: "weekly", progress: 2, target: 4, unit: "entrenos", xpReward: 150, completed: false },
  { id: "c5", title: "Corre 20km", description: "Acumula 20 km corriendo", type: "weekly", progress: 8.5, target: 20, unit: "km", xpReward: 200, completed: false },
  { id: "c6", title: "Proteína 5 días", description: "Cumple tu objetivo de proteína 5 días", type: "weekly", progress: 3, target: 5, unit: "días", xpReward: 120, completed: false },
  { id: "c7", title: "Mes activo", description: "Entrena 16 veces este mes", type: "monthly", progress: 8, target: 16, unit: "entrenos", xpReward: 500, completed: false },
  { id: "c8", title: "Push Pull Legs", description: "Completa un ciclo PPL completo", type: "monthly", progress: 2, target: 3, unit: "días", xpReward: 300, completed: false },
];

const initialFriends: Friend[] = [
  { id: "f1", name: "Carlos M.", level: 12, xp: 8420, streak: 15, commitmentIndex: 84, position: 1 },
  { id: "f2", name: "Laura G.", level: 10, xp: 7100, streak: 10, commitmentIndex: 79, position: 2 },
  { id: "f3", name: "Pedro R.", level: 8, xp: 5800, streak: 6, commitmentIndex: 71, position: 3 },
  { id: "f4", name: "Ana S.", level: 14, xp: 11200, streak: 22, commitmentIndex: 91, position: 4 },
];

const initialFeed: FeedItem[] = [
  { id: "feed1", userId: "f1", userName: "Carlos", action: "completó Push Day 💪", timestamp: "hace 2h", icon: "🏋️" },
  { id: "feed2", userId: "f2", userName: "Laura", action: "consiguió una racha de 10 días 🔥", timestamp: "hace 4h", icon: "🔥" },
  { id: "feed3", userId: "f4", userName: "Ana", action: "subió al Top 5 🏆", timestamp: "hace 6h", icon: "🏆" },
  { id: "feed4", userId: "f3", userName: "Pedro", action: "ganó un duelo de flexiones ⚔️", timestamp: "ayer", icon: "⚔️" },
  { id: "feed5", userId: "f1", userName: "Carlos", action: "corrió 10 km en 48 min 🏃", timestamp: "ayer", icon: "🏃" },
];

const initialDailyStats: DailyStats = {
  date: new Date().toISOString().split("T")[0],
  water: 1.4,
  steps: 6204,
  sleepHours: 7.3,
  caloriesBurned: 480,
  workoutMinutes: 0,
  proteinGrams: 0,
};

/* ─────────────────────────────────────────────
   FUNCIONES DE UTILIDAD
───────────────────────────────────────────── */

export function xpToLevel(xp: number): { level: number; levelXp: number; nextLevelXp: number } {
  // Cada nivel requiere 500 * nivel XP
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

function generateTitanReply(userText: string, profile: Profile): string {
  const t = userText.toLowerCase();
  if (t.includes("pollo") || t.includes("arroz") || t.includes("tengo")) {
    return "Con eso puedo montarte algo rápido: saltea el pollo en dados, añade el arroz ya cocido y el tomate troceado al final con un chorrito de aceite de oliva y comino. Encaja bien en tus macros de hoy.";
  }
  if (t.includes("cansad") || t.includes("dormido") || t.includes("sueño") || t.includes("mal dormido")) {
    return "Entendido. He suavizado un poco la intensidad del entreno de hoy — bajamos el RPE objetivo de las últimas series. Prioriza dormir esta noche, el plan se adapta contigo.";
  }
  if (t.includes("dolor") || t.includes("molest") || t.includes("lesion")) {
    return "Gracias por avisar. He quitado temporalmente los ejercicios que puedan cargar esa zona y los sustituyo por variantes más seguras hasta que me digas que ha mejorado.";
  }
  if (t.includes("cerveza") || t.includes("alcohol") || t.includes("finde") || t.includes("fin de semana")) {
    return "Disfrutar también forma parte de una vida saludable. Esta semana simplemente volveremos poco a poco a la rutina, sin prisa.";
  }
  if (t.includes("ranking") || t.includes("posici")) {
    return "Ahora mismo estás en el puesto 7 entre tus amigos. Con un buen entreno hoy y cumpliendo tus proteínas puedes subir 2 posiciones mañana.";
  }
  if (t.includes("reto") || t.includes("challenge")) {
    return "Tienes 3 retos activos hoy. El más urgente: solo te faltan 600ml de agua para cumplir el reto de hidratación diaria. ¡Venga!";
  }
  if (t.includes("gracias")) {
    return "Para eso estoy. Cualquier cosa, aquí me tienes.";
  }
  return `Anotado${profile.goal ? `, sigo ajustando todo en función de tu objetivo (${profile.goal.toLowerCase()})` : ""}. Cuéntame más si quieres que cambie algo del plan de esta semana.`;
}

/* ─────────────────────────────────────────────
   STORE
───────────────────────────────────────────── */

type TitanState = {
  // onboarding / perfil
  onboardingCompleted: boolean;
  stepIndex: number;
  profile: Profile;
  history: ChatTurn[];
  answerStep: (field: keyof Profile, value: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  // XP y niveles
  xp: number;
  addXp: (amount: number) => void;

  // racha
  streak: number;
  lastActiveDate: string;
  updateStreak: () => void;

  // estadísticas diarias
  dailyStats: DailyStats;
  updateWater: (liters: number) => void;
  updateSteps: (steps: number) => void;

  // entrenamiento
  todayWorkout: { title: string; meta: string; exercises: Exercise[]; completed: boolean };
  logSet: (exerciseId: string, set: LoggedSet) => void;
  completeWorkout: () => void;

  // nutrición
  meals: Meal[];
  mealsCompleted: Record<string, boolean>;
  toggleMealDone: (mealId: string) => void;
  swapMeal: (mealId: string) => void;

  // compra
  shoppingList: ShoppingItem[];
  toggleShoppingItem: (id: string) => void;
  resetShoppingList: () => void;

  // progreso
  weighIns: WeighIn[];
  addWeighIn: (weight: number) => void;

  // logros
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  pendingAchievement: Achievement | null;
  clearPendingAchievement: () => void;

  // retos
  challenges: Challenge[];
  updateChallengeProgress: (id: string, progress: number) => void;

  // social
  friends: Friend[];
  feed: FeedItem[];
  duels: Duel[];

  // ranking — posición del usuario
  userRankPosition: number;
  userCommitmentIndex: number;

  // chat con Titan
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;
};

export const useTitanStore = create<TitanState>()(
  persist(
    (set, get) => ({
      onboardingCompleted: false,
      stepIndex: 0,
      profile: {},
      history: [],
      answerStep: (field, value) =>
        set((state) => ({
          profile: { ...state.profile, [field]: value },
          history: [...state.history, { role: "user", text: value }],
          stepIndex: state.stepIndex + 1,
        })),
      completeOnboarding: () => set({ onboardingCompleted: true }),
      resetOnboarding: () =>
        set({ onboardingCompleted: false, stepIndex: 0, profile: {}, history: [] }),

      xp: 3240,
      addXp: (amount) =>
        set((state) => ({ xp: state.xp + amount })),

      streak: 7,
      lastActiveDate: new Date().toISOString().split("T")[0],
      updateStreak: () => {
        const today = new Date().toISOString().split("T")[0];
        set((state) => {
          if (state.lastActiveDate === today) return state;
          const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
          const newStreak = state.lastActiveDate === yesterday ? state.streak + 1 : 1;
          return { streak: newStreak, lastActiveDate: today };
        });
      },

      dailyStats: initialDailyStats,
      updateWater: (liters) =>
        set((state) => ({ dailyStats: { ...state.dailyStats, water: liters } })),
      updateSteps: (steps) =>
        set((state) => ({ dailyStats: { ...state.dailyStats, steps } })),

      todayWorkout: {
        title: "Empuje — Fuerza",
        meta: "5 ejercicios · ~52 min · Gimnasio completo",
        exercises: initialExercises,
        completed: false,
      },
      logSet: (exerciseId, newSet) =>
        set((state) => ({
          todayWorkout: {
            ...state.todayWorkout,
            exercises: state.todayWorkout.exercises.map((ex) =>
              ex.id === exerciseId
                ? { ...ex, loggedSets: [...ex.loggedSets, newSet] }
                : ex
            ),
          },
        })),
      completeWorkout: () =>
        set((state) => ({
          todayWorkout: { ...state.todayWorkout, completed: true },
          xp: state.xp + 120,
          dailyStats: { ...state.dailyStats, workoutMinutes: state.dailyStats.workoutMinutes + 52 },
          chatMessages: [
            ...state.chatMessages,
            {
              role: "titan",
              text: "Entreno registrado 💪 +120 XP. Con los pesos y RPE de hoy voy a ajustar la carga de la próxima semana.",
            },
          ],
        })),

      meals: initialMeals,
      mealsCompleted: {},
      toggleMealDone: (mealId) =>
        set((state) => ({
          mealsCompleted: {
            ...state.mealsCompleted,
            [mealId]: !state.mealsCompleted[mealId],
          },
          xp: !state.mealsCompleted[mealId] ? state.xp + 15 : state.xp - 15,
        })),
      swapMeal: (mealId) =>
        set((state) => ({
          meals: state.meals.map((meal) => {
            if (meal.id !== mealId || meal.alternatives.length === 0) return meal;
            const [nextAlt, ...rest] = meal.alternatives;
            const currentAsAlt: MealMacros = {
              name: meal.name, kcal: meal.kcal, protein: meal.protein, carbs: meal.carbs, fat: meal.fat,
            };
            return { ...meal, ...nextAlt, alternatives: [...rest, currentAsAlt] };
          }),
        })),

      shoppingList: initialShoppingList,
      toggleShoppingItem: (id) =>
        set((state) => ({
          shoppingList: state.shoppingList.map((item) =>
            item.id === id ? { ...item, checked: !item.checked } : item
          ),
        })),
      resetShoppingList: () =>
        set((state) => ({
          shoppingList: state.shoppingList.map((item) => ({ ...item, checked: false })),
        })),

      weighIns: initialWeighIns,
      addWeighIn: (weight) =>
        set((state) => ({
          weighIns: [
            ...state.weighIns,
            { date: `Sem ${state.weighIns.length + 1}`, weight },
          ],
        })),

      achievements: initialAchievements,
      pendingAchievement: null,
      unlockAchievement: (id) =>
        set((state) => {
          const achievement = state.achievements.find((a) => a.id === id);
          if (!achievement || achievement.unlockedAt) return state;
          const updated = state.achievements.map((a) =>
            a.id === id ? { ...a, unlockedAt: new Date().toISOString() } : a
          );
          return {
            achievements: updated,
            xp: state.xp + (achievement.xpReward ?? 0),
            pendingAchievement: achievement,
          };
        }),
      clearPendingAchievement: () => set({ pendingAchievement: null }),

      challenges: initialChallenges,
      updateChallengeProgress: (id, progress) =>
        set((state) => ({
          challenges: state.challenges.map((c) => {
            if (c.id !== id) return c;
            const completed = progress >= c.target;
            return { ...c, progress, completed };
          }),
        })),

      friends: initialFriends,
      feed: initialFeed,
      duels: [],

      userRankPosition: 7,
      userCommitmentIndex: 68,

      chatMessages: [
        {
          role: "titan",
          text: "Hola, soy Titan 👋 Cuéntame cómo va tu día, qué tienes en la nevera, o si algo no te está funcionando del plan.",
        },
      ],
      sendChatMessage: (text) =>
        set((state) => ({
          chatMessages: [
            ...state.chatMessages,
            { role: "user", text },
            { role: "titan", text: generateTitanReply(text, get().profile) },
          ],
        })),
    }),
    { name: "titan-store-v2" }
  )
);
