import type { Profile } from "./store";

export type OnboardingStep = {
  field: keyof Profile;
  question: string;
  chips: string[];
};

export const onboardingSteps: OnboardingStep[] = [
  {
    field: "name",
    question:
      "Hola, soy Titan. Vamos a conocernos — nada de formularios largos, solo una charla.\n\n¿Cómo te llamas?",
    chips: [],
  },
  {
    field: "sex",
    question: "Encantado. ¿Cuál es tu sexo? Lo uso para calcular mejor tus objetivos calóricos.",
    chips: ["Hombre", "Mujer", "Prefiero no decirlo"],
  },
  {
    field: "age",
    question: "¿Cuántos años tienes?",
    chips: ["18-25", "26-35", "36-45", "46+"],
  },
  {
    field: "height",
    question: "¿Cuál es tu altura aproximada, en centímetros?",
    chips: ["160", "170", "180", "190"],
  },
  {
    field: "weight",
    question: "¿Y tu peso actual, en kilos?",
    chips: [],
  },
  {
    field: "weightGoal",
    question: "¿Cuál sería tu peso objetivo?",
    chips: [],
  },
  {
    field: "goal",
    question: "¿Cuál es tu objetivo principal ahora mismo?",
    chips: ["Perder grasa", "Ganar músculo", "Recomposición", "Mantener peso", "Mejorar rendimiento"],
  },
  {
    field: "sportLevel",
    question: "¿Cómo describirías tu nivel deportivo actual?",
    chips: ["Principiante", "Intermedio", "Avanzado"],
  },
  {
    field: "trainingDays",
    question: "¿Cuántos días a la semana puedes entrenar de verdad — no los que te gustaría poder?",
    chips: ["2–3 días", "4 días", "5 o más"],
  },
  {
    field: "equipment",
    question: "¿Qué material tienes disponible normalmente?",
    chips: ["Gimnasio completo", "Mancuernas en casa", "Solo peso corporal"],
  },
  {
    field: "injury",
    question: "¿Alguna lesión o molestia que deba tener en cuenta al planificar?",
    chips: ["No, ninguna", "Rodilla", "Hombro", "Espalda baja"],
  },
  {
    field: "foodPreferences",
    question: "¿Tienes alguna preferencia alimentaria?",
    chips: ["Omnívora", "Vegetariana", "Vegana", "Baja en carbohidratos"],
  },
  {
    field: "sleepHours",
    question: "De media, ¿cuántas horas duermes al día?",
    chips: ["Menos de 6", "6-7", "7-8", "Más de 8"],
  },
  {
    field: "dailyActivity",
    question: "Fuera del entreno, ¿cómo describirías tu actividad diaria?",
    chips: ["Sedentario", "Moderado", "Muy activo"],
  },
  {
    field: "supermarket",
    question: "Última pregunta por ahora: ¿en qué supermercado sueles comprar?",
    chips: ["Mercadona", "Carrefour", "Lidl", "Otro"],
  },
];
