export type RoutineDay = {
  day: string;
  title: string;
  exerciseIds: string[];
};

export type Routine = {
  id: string;
  name: string;
  description: string;
  level: "Principiante" | "Intermedio" | "Avanzado";
  daysPerWeek: number;
  equipment: "Gimnasio completo" | "Mancuernas en casa" | "Solo peso corporal";
  goal: "Fuerza" | "Hipertrofia" | "Pérdida de grasa" | "Resistencia" | "General";
  days: RoutineDay[];
};

/* Rutinas basadas en estructuras de entrenamiento ampliamente utilizadas:
   Push/Pull/Legs, Torso-Pierna, Full Body, 5x5 de fuerza y calistenia en casa. */
export const ROUTINES: Routine[] = [
  {
    id: "ppl-6d",
    name: "Push / Pull / Legs (6 días)",
    description:
      "Split clásico de hipertrofia dividido en empuje, tirón y pierna, repetido dos veces por semana.",
    level: "Intermedio",
    daysPerWeek: 6,
    equipment: "Gimnasio completo",
    goal: "Hipertrofia",
    days: [
      { day: "Lunes", title: "Push A — Pecho/Hombro/Tríceps", exerciseIds: ["ex-pecho-1", "ex-pecho-3", "ex-hombro-2", "ex-hombro-3", "ex-triceps-1"] },
      { day: "Martes", title: "Pull A — Espalda/Bíceps", exerciseIds: ["ex-espalda-1", "ex-espalda-2", "ex-espalda-4", "ex-biceps-1", "ex-biceps-3"] },
      { day: "Miércoles", title: "Legs A — Pierna completa", exerciseIds: ["ex-piernas-1", "ex-piernas-2", "ex-piernas-5", "ex-gluteo-1", "ex-piernas-7"] },
      { day: "Jueves", title: "Push B — Fuerza", exerciseIds: ["ex-pecho-2", "ex-hombro-1", "ex-pecho-6", "ex-triceps-2", "ex-core-1"] },
      { day: "Viernes", title: "Pull B — Volumen", exerciseIds: ["ex-espalda-6", "ex-espalda-3", "ex-espalda-5", "ex-biceps-2", "ex-hombro-6"] },
      { day: "Sábado", title: "Legs B — Glúteo/Isquios", exerciseIds: ["ex-piernas-6", "ex-espalda-7", "ex-gluteo-2", "ex-piernas-3", "ex-core-5"] },
    ],
  },
  {
    id: "torso-pierna-4d",
    name: "Torso / Pierna (4 días)",
    description:
      "Ideal para quien entrena 4 días: alterna sesiones de tren superior e inferior con buen volumen semanal.",
    level: "Intermedio",
    daysPerWeek: 4,
    equipment: "Gimnasio completo",
    goal: "Hipertrofia",
    days: [
      { day: "Lunes", title: "Torso A", exerciseIds: ["ex-pecho-1", "ex-espalda-2", "ex-hombro-2", "ex-biceps-1", "ex-triceps-1"] },
      { day: "Martes", title: "Pierna A", exerciseIds: ["ex-piernas-1", "ex-piernas-5", "ex-gluteo-1", "ex-piernas-7", "ex-core-1"] },
      { day: "Jueves", title: "Torso B", exerciseIds: ["ex-espalda-1", "ex-pecho-3", "ex-hombro-3", "ex-biceps-3", "ex-triceps-3"] },
      { day: "Viernes", title: "Pierna B", exerciseIds: ["ex-espalda-6", "ex-piernas-3", "ex-piernas-6", "ex-gluteo-4", "ex-core-5"] },
    ],
  },
  {
    id: "full-body-3d",
    name: "Full Body (3 días)",
    description:
      "Cuerpo completo tres días por semana, perfecto para principiantes o para quien entrena poco tiempo.",
    level: "Principiante",
    daysPerWeek: 3,
    equipment: "Gimnasio completo",
    goal: "General",
    days: [
      { day: "Lunes", title: "Full Body A", exerciseIds: ["ex-piernas-1", "ex-pecho-1", "ex-espalda-4", "ex-hombro-3", "ex-core-1"] },
      { day: "Miércoles", title: "Full Body B", exerciseIds: ["ex-piernas-2", "ex-espalda-2", "ex-pecho-3", "ex-biceps-1", "ex-triceps-1"] },
      { day: "Viernes", title: "Full Body C", exerciseIds: ["ex-gluteo-1", "ex-espalda-1", "ex-hombro-2", "ex-core-5", "ex-piernas-7"] },
    ],
  },
  {
    id: "fuerza-5x5",
    name: "Fuerza 5×5",
    description:
      "Programa de fuerza basado en los básicos con series de 5 repeticiones y progresión de carga semanal.",
    level: "Principiante",
    daysPerWeek: 3,
    equipment: "Gimnasio completo",
    goal: "Fuerza",
    days: [
      { day: "Lunes", title: "Fuerza A", exerciseIds: ["ex-piernas-1", "ex-pecho-1", "ex-espalda-2"] },
      { day: "Miércoles", title: "Fuerza B", exerciseIds: ["ex-piernas-1", "ex-hombro-1", "ex-espalda-6"] },
      { day: "Viernes", title: "Fuerza A", exerciseIds: ["ex-piernas-1", "ex-pecho-1", "ex-espalda-2"] },
    ],
  },
  {
    id: "casa-mancuernas-4d",
    name: "En casa con mancuernas (4 días)",
    description:
      "Rutina completa para entrenar en casa solo con un par de mancuernas ajustables y bandas.",
    level: "Principiante",
    daysPerWeek: 4,
    equipment: "Mancuernas en casa",
    goal: "General",
    days: [
      { day: "Lunes", title: "Empuje", exerciseIds: ["ex-pecho-2", "ex-hombro-2", "ex-triceps-2", "ex-core-1"] },
      { day: "Martes", title: "Tirón", exerciseIds: ["ex-espalda-3", "ex-espalda-8", "ex-biceps-5", "ex-core-6"] },
      { day: "Jueves", title: "Pierna", exerciseIds: ["ex-piernas-10", "ex-piernas-3", "ex-gluteo-3", "ex-piernas-7"] },
      { day: "Viernes", title: "Full body ligero", exerciseIds: ["ex-pecho-9", "ex-espalda-8", "ex-piernas-9", "ex-core-5"] },
    ],
  },
  {
    id: "calistenia-3d",
    name: "Calistenia sin material (3 días)",
    description:
      "Entrenamiento con el propio peso corporal, sin necesidad de gimnasio ni material.",
    level: "Principiante",
    daysPerWeek: 3,
    equipment: "Solo peso corporal",
    goal: "Resistencia",
    days: [
      { day: "Lunes", title: "Tren superior", exerciseIds: ["ex-pecho-7", "ex-espalda-8", "ex-triceps-3", "ex-hombro-7"] },
      { day: "Miércoles", title: "Tren inferior", exerciseIds: ["ex-piernas-8", "ex-piernas-9", "ex-gluteo-3", "ex-piernas-7"] },
      { day: "Viernes", title: "Core y cardio", exerciseIds: ["ex-core-1", "ex-core-4", "ex-core-7", "ex-cardio-6"] },
    ],
  },
  {
    id: "running-perdida-grasa",
    name: "Running + fuerza para pérdida de grasa (5 días)",
    description:
      "Combina cardio de intensidad variable con fuerza de cuerpo completo para maximizar el déficit calórico.",
    level: "Intermedio",
    daysPerWeek: 5,
    equipment: "Gimnasio completo",
    goal: "Pérdida de grasa",
    days: [
      { day: "Lunes", title: "Fuerza full body", exerciseIds: ["ex-piernas-1", "ex-pecho-1", "ex-espalda-4", "ex-core-1"] },
      { day: "Martes", title: "Carrera continua", exerciseIds: ["ex-cardio-1"] },
      { day: "Miércoles", title: "Fuerza full body", exerciseIds: ["ex-piernas-2", "ex-espalda-2", "ex-hombro-3", "ex-core-5"] },
      { day: "Jueves", title: "HIIT series", exerciseIds: ["ex-cardio-2"] },
      { day: "Sábado", title: "Carrera larga suave", exerciseIds: ["ex-cardio-1"] },
    ],
  },
];
