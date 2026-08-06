import type { Profile } from "./store";

export type OnboardingStep = {
  field: keyof Profile;
  question: string;
  chips: string[];
};

export const onboardingSteps: OnboardingStep[] = [
  {
    field: "goal",
    question:
      "Hola, soy Titan. Vamos a conocernos — nada de formularios largos, solo una charla.\n\n¿Cuál es tu objetivo principal ahora mismo?",
    chips: ["Perder grasa", "Ganar músculo", "Recomposición", "Salud general"],
  },
  {
    field: "trainingDays",
    question:
      "Entendido. ¿Cuántos días a la semana puedes entrenar de verdad — no los que te gustaría poder?",
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
    field: "supermarket",
    question: "Última pregunta por ahora: ¿en qué supermercado sueles comprar?",
    chips: ["Mercadona", "Carrefour", "Lidl", "Otro"],
  },
];
