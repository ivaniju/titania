"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ACHIEVEMENTS } from "./data/achievements";
import { CHALLENGE_TEMPLATES } from "./data/challenges";
import { MOCK_FRIENDS, DUEL_TYPES, type DuelType } from "./data/social";
import { ROUTINES } from "./data/routines";

/* ---------------- tipos ---------------- */

export type ChatTurn = { role: "titan" | "user"; text: string };

export type Profile = {
  name?: string;
  sex?: string;
  age?: string;
  height?: string;
  weight?: string;
  weightGoal?: string;
  goal?: string;
  sportLevel?: string;
  trainingDays?: string;
  equipment?: string;
  injury?: string;
  foodPreferences?: string;
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

export type CalendarDayStatus = "perfecto" | "aceptable" | "vacio";
export type CalendarDay = {
  trained: boolean;
  mealsOk: boolean;
  waterOk: boolean;
};

export type DuelRecord = {
  id: string;
  opponentId: string;
  opponentName: string;
  type: DuelType;
  myScore: number;
  opponentScore: number;
  status: "en curso" | "ganado" | "perdido" | "empate";
  createdAt: string;
};

/* ---------------- datos de demo ---------------- */

const initialExercises: Exercise[] = [
  { id: "e1", name: "Press banca", targetSets: 4, targetReps: "6-8", loggedSets: [] },
  { id: "e2", name: "Press militar mancuerna", targetSets: 3, targetReps: "8-10", loggedSets: [] },
  { id: "e3", name: "Fondos en paralelas", targetSets: 3, targetReps: "10-12", loggedSets: [] },
  { id: "e4", name: "Elevaciones laterales", targetSets: 3, targetReps: "12-15", loggedSets: [] },
  { id: "e5", name: "Extensión tríceps polea", targetSets: 3, targetReps: "12-15", loggedSets: [] },
];

const initialMeals: Meal[] = [
  {
    id: "desayuno",
    icon: "🍳",
    name: "Tortilla de claras con avena",
    kcal: 480,
    protein: 38,
    carbs: 45,
    fat: 14,
    alternatives: [
      { name: "Yogur griego con frutos rojos y granola", kcal: 470, protein: 34, carbs: 50, fat: 12 },
      { name: "Tostadas integrales con aguacate y huevo", kcal: 500, protein: 30, carbs: 48, fat: 20 },
    ],
  },
  {
    id: "comida",
    icon: "🥗",
    name: "Pechuga de pollo con arroz y brócoli",
    kcal: 720,
    protein: 55,
    carbs: 80,
    fat: 16,
    alternatives: [
      { name: "Salmón con quinoa y espárragos", kcal: 710, protein: 48, carbs: 70, fat: 24 },
      { name: "Ternera magra con boniato asado", kcal: 730, protein: 52, carbs: 75, fat: 18 },
    ],
  },
  {
    id: "cena",
    icon: "🍗",
    name: "Merluza al horno con patata",
    kcal: 540,
    protein: 42,
    carbs: 50,
    fat: 14,
    alternatives: [
      { name: "Tofu salteado con verduras y arroz", kcal: 530, protein: 30, carbs: 60, fat: 16 },
      { name: "Pavo a la plancha con ensalada templada", kcal: 520, protein: 45, carbs: 35, fat: 18 },
    ],
  },
  {
    id: "snack",
    icon: "🥤",
    name: "Batido de proteína con plátano",
    kcal: 260,
    protein: 28,
    carbs: 32,
    fat: 4,
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
  { date: "Semana 1", weight: 82.4 },
  { date: "Semana 2", weight: 81.9 },
  { date: "Semana 3", weight: 81.5 },
  { date: "Semana 4", weight: 81.3 },
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/* ---------------- store ---------------- */

type TitanState = {
  // onboarding / perfil
  onboardingCompleted: boolean;
  stepIndex: number;
  profile: Profile;
  history: ChatTurn[];
  answerStep: (field: keyof Profile, value: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  // entrenamiento
  todayWorkout: { title: string; meta: string; exercises: Exercise[]; completed: boolean };
  logSet: (exerciseId: string, set: LoggedSet) => void;
  completeWorkout: () => void;
  selectedRoutineId: string;
  setRoutine: (routineId: string) => void;

  // nutrición
  meals: Meal[];
  mealsCompleted: Record<string, boolean>;
  toggleMealDone: (mealId: string) => void;
  swapMeal: (mealId: string) => void;
  mealsLoggedTotal: number;

  // compra
  shoppingList: ShoppingItem[];
  toggleShoppingItem: (id: string) => void;
  resetShoppingList: () => void;

  // progreso
  weighIns: WeighIn[];
  addWeighIn: (weight: number) => void;

  // chat con Titan
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;

  // ---- gamificación ----
  xp: number;
  streakDays: number;
  lastActiveDate: string | null;
  workoutsCompletedTotal: number;
  kmRunTotal: number;
  pullUpsTotal: number;
  duelsWonTotal: number;
  unlockedAchievementIds: string[];
  addXp: (amount: number) => void;
  registerActivityToday: () => void;
  logRun: (km: number) => void;
  logPullUps: (reps: number) => void;

  // hábitos diarios
  todayWater: number;
  todaySteps: number;
  todaySleep: number;
  logWater: (liters: number) => void;
  logSteps: (steps: number) => void;
  logSleep: (hours: number) => void;

  // calendario
  calendarLog: Record<string, CalendarDay>;

  // retos
  challengeProgress: Record<string, number>;
  completedChallengeIds: string[];
  incrementChallenge: (templateId: string, amount: number) => void;

  // social (simulado, sin backend real)
  friendIds: string[];
  addFriend: (id: string) => void;
  removeFriend: (id: string) => void;

  // duelos (simulado)
  duels: DuelRecord[];
  startDuel: (opponentId: string, type: DuelType) => void;
  updateMyDuelScore: (duelId: string, score: number) => void;

  // base de datos de alimentos: favoritos y recientes
  favoriteFoodIds: string[];
  recentFoodIds: string[];
  toggleFavoriteFood: (id: string) => void;
  registerRecentFood: (id: string) => void;
};

function generateTitanReply(userText: string, profile: Profile): string {
  const t = userText.toLowerCase();
  if (t.includes("pollo") || t.includes("arroz") || t.includes("tomate") || t.includes("tengo")) {
    return "Con eso puedo montarte algo rápido: saltea el pollo en dados, añade el arroz ya cocido y el tomate troceado al final con un chorrito de aceite de oliva y comino. Encaja bien en tus macros de hoy.";
  }
  if (t.includes("cansad") || t.includes("dormido") || t.includes("sueño") || t.includes("mal dormido")) {
    return "Entendido. He suavizado un poco la intensidad del entreno de hoy — bajamos el RPE objetivo de las últimas series. Prioriza dormir esta noche, el plan se adapta contigo.";
  }
  if (t.includes("dolor") || t.includes("molest") || t.includes("lesion")) {
    return "Gracias por avisar. He quitado temporalmente los ejercicios que puedan cargar esa zona y los sustituyo por variantes más seguras hasta que me digas que ha mejorado.";
  }
  if (t.includes("cerveza") || t.includes("alcohol") || t.includes("fin de semana") || t.includes("finde")) {
    return "Disfrutar también forma parte de una vida saludable. Esta semana simplemente volveremos poco a poco a la rutina, sin prisa.";
  }
  if (t.includes("gracias")) {
    return "Para eso estoy. Cualquier cosa, aquí me tienes.";
  }
  return `Anotado${profile.goal ? `, sigo ajustando todo en función de tu objetivo (${profile.goal.toLowerCase()})` : ""}. Cuéntame más si quieres que cambie algo del plan de esta semana.`;
}

/* comprueba logros desbloqueados según las métricas actuales del estado */
function checkAchievements(state: TitanState): { unlocked: string[]; gainedXp: number } {
  const metrics: Record<string, number> = {
    workoutsCompleted: state.workoutsCompletedTotal,
    streakDays: state.streakDays,
    mealsLogged: state.mealsLoggedTotal,
    pullUpsMax: state.pullUpsTotal,
    runsCompleted: state.kmRunTotal > 0 ? Math.floor(state.kmRunTotal / 5) : 0,
    kmRun: state.kmRunTotal,
    duelsWon: state.duelsWonTotal,
    weeklyTop1: 0,
    totalPoints: state.xp,
    friendsAdded: state.friendIds.length,
  };
  const newlyUnlocked: string[] = [];
  let gainedXp = 0;
  for (const a of ACHIEVEMENTS) {
    if (state.unlockedAchievementIds.includes(a.id)) continue;
    const value = metrics[a.metric] ?? 0;
    if (value >= a.target) {
      newlyUnlocked.push(a.id);
      gainedXp += a.xp;
    }
  }
  return { unlocked: newlyUnlocked, gainedXp };
}

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

      todayWorkout: {
        title: "Empuje — Fuerza",
        meta: "5 ejercicios · ~52 min · Gimnasio completo",
        exercises: initialExercises,
        completed: false,
      },
      selectedRoutineId: ROUTINES[0].id,
      setRoutine: (routineId) => set({ selectedRoutineId: routineId }),
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
      completeWorkout: () => {
        set((state) => ({
          todayWorkout: { ...state.todayWorkout, completed: true },
          workoutsCompletedTotal: state.workoutsCompletedTotal + 1,
          chatMessages: [
            ...state.chatMessages,
            {
              role: "titan",
              text: "Entreno registrado 💪 Con los pesos y RPE de hoy voy a ajustar la carga de la próxima semana.",
            },
          ],
        }));
        get().registerActivityToday();
        get().addXp(40);
        set((state) => ({
          calendarLog: {
            ...state.calendarLog,
            [todayIso()]: { ...(state.calendarLog[todayIso()] ?? { mealsOk: false, waterOk: false }), trained: true },
          },
        }));
      },

      meals: initialMeals,
      mealsCompleted: {},
      mealsLoggedTotal: 0,
      toggleMealDone: (mealId) => {
        const wasDone = get().mealsCompleted[mealId];
        set((state) => ({
          mealsCompleted: {
            ...state.mealsCompleted,
            [mealId]: !state.mealsCompleted[mealId],
          },
          mealsLoggedTotal: !wasDone ? state.mealsLoggedTotal + 1 : Math.max(0, state.mealsLoggedTotal - 1),
        }));
        if (!wasDone) {
          get().addXp(10);
          const allDone = Object.values({ ...get().mealsCompleted }).filter(Boolean).length >= 3;
          set((state) => ({
            calendarLog: {
              ...state.calendarLog,
              [todayIso()]: { ...(state.calendarLog[todayIso()] ?? { trained: false, waterOk: false }), mealsOk: allDone },
            },
          }));
        }
      },
      swapMeal: (mealId) =>
        set((state) => ({
          meals: state.meals.map((meal) => {
            if (meal.id !== mealId || meal.alternatives.length === 0) return meal;
            const [nextAlt, ...rest] = meal.alternatives;
            const currentAsAlt: MealMacros = {
              name: meal.name,
              kcal: meal.kcal,
              protein: meal.protein,
              carbs: meal.carbs,
              fat: meal.fat,
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
            { date: `Semana ${state.weighIns.length + 1}`, weight },
          ],
        })),

      chatMessages: [
        {
          role: "titan",
          text: "Hola, soy Titan. Cuéntame cómo va tu día, qué tienes en la nevera, o si algo no te está funcionando del plan.",
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

      // ---- gamificación ----
      xp: 0,
      streakDays: 0,
      lastActiveDate: null,
      workoutsCompletedTotal: 0,
      kmRunTotal: 0,
      pullUpsTotal: 0,
      duelsWonTotal: 0,
      unlockedAchievementIds: [],
      addXp: (amount) => {
        set((state) => ({ xp: state.xp + amount }));
        const { unlocked, gainedXp } = checkAchievements(get());
        if (unlocked.length > 0) {
          set((state) => ({
            unlockedAchievementIds: [...state.unlockedAchievementIds, ...unlocked],
            xp: state.xp + gainedXp,
          }));
        }
      },
      registerActivityToday: () =>
        set((state) => {
          const today = todayIso();
          if (state.lastActiveDate === today) return {};
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
          const continuesStreak = state.lastActiveDate === yesterday;
          return {
            lastActiveDate: today,
            streakDays: continuesStreak ? state.streakDays + 1 : 1,
          };
        }),
      logRun: (km) => {
        set((state) => ({ kmRunTotal: Math.round((state.kmRunTotal + km) * 10) / 10 }));
        get().registerActivityToday();
        get().addXp(Math.round(km * 5));
      },
      logPullUps: (reps) => {
        set((state) => ({ pullUpsTotal: state.pullUpsTotal + reps }));
        get().addXp(Math.round(reps * 1.5));
      },

      // hábitos diarios
      todayWater: 0,
      todaySteps: 0,
      todaySleep: 0,
      logWater: (liters) => {
        set({ todayWater: liters });
        if (liters >= 2) {
          get().addXp(5);
          set((state) => ({
            calendarLog: {
              ...state.calendarLog,
              [todayIso()]: { ...(state.calendarLog[todayIso()] ?? { trained: false, mealsOk: false }), waterOk: true },
            },
          }));
        }
      },
      logSteps: (steps) => set({ todaySteps: steps }),
      logSleep: (hours) => set({ todaySleep: hours }),

      calendarLog: {},

      // retos
      challengeProgress: {},
      completedChallengeIds: [],
      incrementChallenge: (templateId, amount) => {
        const template = CHALLENGE_TEMPLATES.find((c) => c.id === templateId);
        if (!template) return;
        const current = get().challengeProgress[templateId] ?? 0;
        const next = Math.min(template.target, current + amount);
        set((state) => ({
          challengeProgress: { ...state.challengeProgress, [templateId]: next },
        }));
        if (next >= template.target && !get().completedChallengeIds.includes(templateId)) {
          set((state) => ({
            completedChallengeIds: [...state.completedChallengeIds, templateId],
          }));
          get().addXp(template.xp);
        }
      },

      // social simulado
      friendIds: [MOCK_FRIENDS[0].id, MOCK_FRIENDS[1].id],
      addFriend: (id) =>
        set((state) =>
          state.friendIds.includes(id) ? {} : { friendIds: [...state.friendIds, id] }
        ),
      removeFriend: (id) =>
        set((state) => ({ friendIds: state.friendIds.filter((f) => f !== id) })),

      // duelos simulado
      duels: [],
      startDuel: (opponentId, type) => {
        const opponent = MOCK_FRIENDS.find((f) => f.id === opponentId);
        if (!opponent) return;
        const duel: DuelRecord = {
          id: `duel-${Date.now()}`,
          opponentId,
          opponentName: opponent.name,
          type,
          myScore: 0,
          opponentScore: Math.round(opponent.engagementScore * (0.5 + Math.random())),
          status: "en curso",
          createdAt: todayIso(),
        };
        set((state) => ({ duels: [duel, ...state.duels] }));
      },
      updateMyDuelScore: (duelId, score) => {
        set((state) => ({
          duels: state.duels.map((d) => {
            if (d.id !== duelId) return d;
            const status: DuelRecord["status"] =
              score > d.opponentScore ? "ganado" : score < d.opponentScore ? "perdido" : "empate";
            return { ...d, myScore: score, status };
          }),
        }));
        const duel = get().duels.find((d) => d.id === duelId);
        if (duel?.status === "ganado") {
          set((state) => ({ duelsWonTotal: state.duelsWonTotal + 1 }));
          get().addXp(60);
        }
      },
      favoriteFoodIds: [],
      recentFoodIds: [],
      toggleFavoriteFood: (id) =>
        set((state) => ({
          favoriteFoodIds: state.favoriteFoodIds.includes(id)
            ? state.favoriteFoodIds.filter((f) => f !== id)
            : [...state.favoriteFoodIds, id],
        })),
      registerRecentFood: (id) =>
        set((state) => ({
          recentFoodIds: [id, ...state.recentFoodIds.filter((f) => f !== id)].slice(0, 15),
        })),
    }),
    { name: "titan-store" }
  )
);

export { DUEL_TYPES };
