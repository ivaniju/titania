"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ---------------- tipos ---------------- */

export type ChatTurn = { role: "titan" | "user"; text: string };

export type Profile = {
  goal?: string;
  trainingDays?: string;
  equipment?: string;
  injury?: string;
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

  // chat con Titan
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;
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
          chatMessages: [
            ...state.chatMessages,
            {
              role: "titan",
              text: "Entreno registrado 💪 Con los pesos y RPE de hoy voy a ajustar la carga de la próxima semana.",
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
        })),
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
    }),
    { name: "titan-store" }
  )
);
