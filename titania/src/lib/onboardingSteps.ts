import type { Profile } from "./store";

export type OnboardingStep = {
  field: keyof Profile;
  question: string;
  chips: string[];
  freeTextPlaceholder?: string;
};

export const onboardingSteps: OnboardingStep[] = [
  {
    field: "name",
    question: "Hola, soy Titan 👋\n\nVoy a ser tu entrenador personal. Para empezar, ¿cómo te llamas?",
    chips: [],
    freeTextPlaceholder: "Tu nombre...",
  },
  {
    field: "goal",
    question: "Encantado. ¿Cuál es tu objetivo principal ahora mismo?",
    chips: ["Perder grasa", "Ganar músculo", "Recomposición corporal", "Mantener peso", "Mejorar rendimiento"],
  },
  {
    field: "sex",
    question: "Para personalizar bien tus macros y tu plan de entreno, necesito saber tu sexo biológico.",
    chips: ["Hombre", "Mujer"],
  },
  {
    field: "age",
    question: "¿Cuántos años tienes?",
    chips: ["18-24", "25-34", "35-44", "45-54", "55+"],
  },
  {
    field: "height",
    question: "¿Cuánto mides? (en cm)",
    chips: ["Menos de 160", "160-170", "171-180", "181-190", "Más de 190"],
    freeTextPlaceholder: "Ej. 178",
  },
  {
    field: "weight",
    question: "¿Cuánto pesas actualmente? (en kg)",
    chips: ["50-60kg", "61-70kg", "71-80kg", "81-90kg", "91-100kg", "Más de 100kg"],
    freeTextPlaceholder: "Ej. 82.5",
  },
  {
    field: "targetWeight",
    question: "¿Cuál es tu peso objetivo?",
    chips: ["Bajar 5kg", "Bajar 10kg", "Bajar 15kg+", "Mantener", "Subir 5kg", "Subir 10kg+"],
    freeTextPlaceholder: "Ej. 75",
  },
  {
    field: "level",
    question: "¿Cómo describirías tu experiencia entrenando?",
    chips: ["Principiante (0-6 meses)", "Intermedio (6m-2 años)", "Avanzado (2-5 años)", "Experto (5+ años)"],
  },
  {
    field: "trainingPlace",
    question: "¿Dónde sueles entrenar habitualmente?",
    chips: ["Gimnasio completo", "Casa con material", "Solo peso corporal", "Combinado"],
  },
  {
    field: "equipment",
    question: "¿Qué material tienes disponible?",
    chips: ["Máquinas + pesas libres", "Mancuernas y barra", "Solo mancuernas", "Bandas y peso corporal", "Nada especial"],
  },
  {
    field: "trainingDays",
    question: "¿Cuántos días a la semana puedes entrenar de verdad — no los que te gustaría, los que realmente vas a hacer?",
    chips: ["2 días", "3 días", "4 días", "5 días", "6 días"],
  },
  {
    field: "injury",
    question: "¿Alguna lesión o molestia que deba tener en cuenta al planificar?",
    chips: ["No, ninguna", "Rodilla", "Hombro", "Espalda baja", "Cadera", "Muñeca/codo"],
    freeTextPlaceholder: "Describe si tienes otra...",
  },
  {
    field: "allergies",
    question: "¿Tienes alguna alergia o intolerancia alimentaria?",
    chips: ["Ninguna", "Gluten", "Lactosa", "Frutos secos", "Huevo", "Mariscos"],
  },
  {
    field: "dietPreference",
    question: "¿Sigues algún tipo de dieta o preferencia alimentaria?",
    chips: ["Sin restricciones", "Vegetariano", "Vegano", "Sin gluten", "Paleo / Cetogénica", "Mediterránea"],
  },
  {
    field: "sleepHours",
    question: "¿Cuántas horas sueles dormir de media?",
    chips: ["Menos de 6h", "6 horas", "7 horas", "8 horas", "Más de 8h"],
  },
  {
    field: "dailyActivity",
    question: "¿Cómo es tu actividad fuera del gimnasio durante el día?",
    chips: ["Muy sedentario (oficina)", "Moderado (algo de movimiento)", "Activo (estoy en pie)", "Muy activo (trabajo físico)"],
  },
  {
    field: "supermarket",
    question: "Última pregunta: ¿en qué supermercado sueles comprar? Lo usaré para adaptar tu lista de la compra.",
    chips: ["Mercadona", "Carrefour", "Lidl", "Aldi", "El Corte Inglés", "Otro"],
  },
];
