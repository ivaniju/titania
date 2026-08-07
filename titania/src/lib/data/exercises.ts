export type MuscleGroup =
  | "Pecho"
  | "Espalda"
  | "Hombro"
  | "Bíceps"
  | "Tríceps"
  | "Piernas"
  | "Glúteo"
  | "Core"
  | "Cardio";

export type ExerciseTemplate = {
  id: string;
  name: string;
  group: MuscleGroup;
  equipment: "Gimnasio" | "Casa" | "Peso corporal";
  defaultSets: number;
  defaultReps: string;
};

export const EXERCISES: ExerciseTemplate[] = [
  // Pecho
  { id: "ex-pecho-1", name: "Press banca barra", group: "Pecho", equipment: "Gimnasio", defaultSets: 4, defaultReps: "6-8" },
  { id: "ex-pecho-2", name: "Press banca mancuernas", group: "Pecho", equipment: "Gimnasio", defaultSets: 4, defaultReps: "8-10" },
  { id: "ex-pecho-3", name: "Press inclinado mancuernas", group: "Pecho", equipment: "Gimnasio", defaultSets: 3, defaultReps: "8-10" },
  { id: "ex-pecho-4", name: "Aperturas con mancuernas", group: "Pecho", equipment: "Gimnasio", defaultSets: 3, defaultReps: "12-15" },
  { id: "ex-pecho-5", name: "Fondos en paralelas", group: "Pecho", equipment: "Gimnasio", defaultSets: 3, defaultReps: "8-12" },
  { id: "ex-pecho-6", name: "Cruces en polea", group: "Pecho", equipment: "Gimnasio", defaultSets: 3, defaultReps: "12-15" },
  { id: "ex-pecho-7", name: "Flexiones", group: "Pecho", equipment: "Peso corporal", defaultSets: 4, defaultReps: "12-20" },
  { id: "ex-pecho-8", name: "Flexiones declinadas", group: "Pecho", equipment: "Peso corporal", defaultSets: 3, defaultReps: "10-15" },
  { id: "ex-pecho-9", name: "Press pecho con banda", group: "Pecho", equipment: "Casa", defaultSets: 3, defaultReps: "12-15" },

  // Espalda
  { id: "ex-espalda-1", name: "Dominadas", group: "Espalda", equipment: "Gimnasio", defaultSets: 4, defaultReps: "6-10" },
  { id: "ex-espalda-2", name: "Remo con barra", group: "Espalda", equipment: "Gimnasio", defaultSets: 4, defaultReps: "8-10" },
  { id: "ex-espalda-3", name: "Remo con mancuerna a una mano", group: "Espalda", equipment: "Gimnasio", defaultSets: 3, defaultReps: "10-12" },
  { id: "ex-espalda-4", name: "Jalón al pecho", group: "Espalda", equipment: "Gimnasio", defaultSets: 3, defaultReps: "10-12" },
  { id: "ex-espalda-5", name: "Remo en polea baja", group: "Espalda", equipment: "Gimnasio", defaultSets: 3, defaultReps: "10-12" },
  { id: "ex-espalda-6", name: "Peso muerto", group: "Espalda", equipment: "Gimnasio", defaultSets: 4, defaultReps: "5-8" },
  { id: "ex-espalda-7", name: "Peso muerto rumano", group: "Espalda", equipment: "Gimnasio", defaultSets: 3, defaultReps: "8-10" },
  { id: "ex-espalda-8", name: "Remo invertido", group: "Espalda", equipment: "Peso corporal", defaultSets: 3, defaultReps: "10-15" },
  { id: "ex-espalda-9", name: "Superman", group: "Espalda", equipment: "Peso corporal", defaultSets: 3, defaultReps: "15-20" },

  // Hombro
  { id: "ex-hombro-1", name: "Press militar barra", group: "Hombro", equipment: "Gimnasio", defaultSets: 4, defaultReps: "6-8" },
  { id: "ex-hombro-2", name: "Press militar mancuerna", group: "Hombro", equipment: "Gimnasio", defaultSets: 3, defaultReps: "8-10" },
  { id: "ex-hombro-3", name: "Elevaciones laterales", group: "Hombro", equipment: "Gimnasio", defaultSets: 3, defaultReps: "12-15" },
  { id: "ex-hombro-4", name: "Elevaciones frontales", group: "Hombro", equipment: "Gimnasio", defaultSets: 3, defaultReps: "12-15" },
  { id: "ex-hombro-5", name: "Pájaros / posterior en polea", group: "Hombro", equipment: "Gimnasio", defaultSets: 3, defaultReps: "12-15" },
  { id: "ex-hombro-6", name: "Face pull", group: "Hombro", equipment: "Gimnasio", defaultSets: 3, defaultReps: "15" },
  { id: "ex-hombro-7", name: "Pike push-up", group: "Hombro", equipment: "Peso corporal", defaultSets: 3, defaultReps: "8-12" },

  // Bíceps
  { id: "ex-biceps-1", name: "Curl de bíceps barra", group: "Bíceps", equipment: "Gimnasio", defaultSets: 3, defaultReps: "10-12" },
  { id: "ex-biceps-2", name: "Curl martillo", group: "Bíceps", equipment: "Gimnasio", defaultSets: 3, defaultReps: "10-12" },
  { id: "ex-biceps-3", name: "Curl banco Scott", group: "Bíceps", equipment: "Gimnasio", defaultSets: 3, defaultReps: "10-12" },
  { id: "ex-biceps-4", name: "Curl concentrado", group: "Bíceps", equipment: "Gimnasio", defaultSets: 3, defaultReps: "12-15" },
  { id: "ex-biceps-5", name: "Curl con banda elástica", group: "Bíceps", equipment: "Casa", defaultSets: 3, defaultReps: "15" },

  // Tríceps
  { id: "ex-triceps-1", name: "Extensión tríceps polea", group: "Tríceps", equipment: "Gimnasio", defaultSets: 3, defaultReps: "12-15" },
  { id: "ex-triceps-2", name: "Press francés", group: "Tríceps", equipment: "Gimnasio", defaultSets: 3, defaultReps: "10-12" },
  { id: "ex-triceps-3", name: "Fondos banco", group: "Tríceps", equipment: "Peso corporal", defaultSets: 3, defaultReps: "12-15" },
  { id: "ex-triceps-4", name: "Patada de tríceps", group: "Tríceps", equipment: "Gimnasio", defaultSets: 3, defaultReps: "12-15" },
  { id: "ex-triceps-5", name: "Flexiones diamante", group: "Tríceps", equipment: "Peso corporal", defaultSets: 3, defaultReps: "10-15" },

  // Piernas
  { id: "ex-piernas-1", name: "Sentadilla libre", group: "Piernas", equipment: "Gimnasio", defaultSets: 4, defaultReps: "6-8" },
  { id: "ex-piernas-2", name: "Prensa de piernas", group: "Piernas", equipment: "Gimnasio", defaultSets: 4, defaultReps: "10-12" },
  { id: "ex-piernas-3", name: "Zancadas con mancuernas", group: "Piernas", equipment: "Gimnasio", defaultSets: 3, defaultReps: "10-12 x pierna" },
  { id: "ex-piernas-4", name: "Extensión de cuádriceps", group: "Piernas", equipment: "Gimnasio", defaultSets: 3, defaultReps: "12-15" },
  { id: "ex-piernas-5", name: "Curl femoral", group: "Piernas", equipment: "Gimnasio", defaultSets: 3, defaultReps: "12-15" },
  { id: "ex-piernas-6", name: "Sentadilla búlgara", group: "Piernas", equipment: "Gimnasio", defaultSets: 3, defaultReps: "10-12 x pierna" },
  { id: "ex-piernas-7", name: "Elevación de gemelos", group: "Piernas", equipment: "Gimnasio", defaultSets: 4, defaultReps: "15-20" },
  { id: "ex-piernas-8", name: "Sentadilla con salto", group: "Piernas", equipment: "Peso corporal", defaultSets: 3, defaultReps: "15-20" },
  { id: "ex-piernas-9", name: "Zancadas sin peso", group: "Piernas", equipment: "Peso corporal", defaultSets: 3, defaultReps: "15 x pierna" },
  { id: "ex-piernas-10", name: "Sentadilla goblet", group: "Piernas", equipment: "Casa", defaultSets: 3, defaultReps: "12-15" },

  // Glúteo
  { id: "ex-gluteo-1", name: "Hip thrust", group: "Glúteo", equipment: "Gimnasio", defaultSets: 4, defaultReps: "8-12" },
  { id: "ex-gluteo-2", name: "Patada de glúteo en polea", group: "Glúteo", equipment: "Gimnasio", defaultSets: 3, defaultReps: "12-15" },
  { id: "ex-gluteo-3", name: "Puente de glúteo", group: "Glúteo", equipment: "Peso corporal", defaultSets: 3, defaultReps: "15-20" },
  { id: "ex-gluteo-4", name: "Abducción de cadera", group: "Glúteo", equipment: "Gimnasio", defaultSets: 3, defaultReps: "15" },

  // Core
  { id: "ex-core-1", name: "Plancha abdominal", group: "Core", equipment: "Peso corporal", defaultSets: 3, defaultReps: "30-60 seg" },
  { id: "ex-core-2", name: "Crunch abdominal", group: "Core", equipment: "Peso corporal", defaultSets: 3, defaultReps: "15-20" },
  { id: "ex-core-3", name: "Elevación de piernas colgado", group: "Core", equipment: "Gimnasio", defaultSets: 3, defaultReps: "12-15" },
  { id: "ex-core-4", name: "Rueda abdominal", group: "Core", equipment: "Casa", defaultSets: 3, defaultReps: "8-12" },
  { id: "ex-core-5", name: "Russian twist", group: "Core", equipment: "Peso corporal", defaultSets: 3, defaultReps: "20" },
  { id: "ex-core-6", name: "Plancha lateral", group: "Core", equipment: "Peso corporal", defaultSets: 3, defaultReps: "30-45 seg x lado" },
  { id: "ex-core-7", name: "Mountain climbers", group: "Core", equipment: "Peso corporal", defaultSets: 3, defaultReps: "30 seg" },

  // Cardio
  { id: "ex-cardio-1", name: "Carrera continua", group: "Cardio", equipment: "Peso corporal", defaultSets: 1, defaultReps: "20-40 min" },
  { id: "ex-cardio-2", name: "Series (HIIT) en pista", group: "Cardio", equipment: "Peso corporal", defaultSets: 8, defaultReps: "400 m" },
  { id: "ex-cardio-3", name: "Bicicleta estática", group: "Cardio", equipment: "Gimnasio", defaultSets: 1, defaultReps: "30 min" },
  { id: "ex-cardio-4", name: "Remo (máquina)", group: "Cardio", equipment: "Gimnasio", defaultSets: 1, defaultReps: "15-20 min" },
  { id: "ex-cardio-5", name: "Comba / cuerda", group: "Cardio", equipment: "Casa", defaultSets: 5, defaultReps: "2 min" },
  { id: "ex-cardio-6", name: "Burpees", group: "Cardio", equipment: "Peso corporal", defaultSets: 4, defaultReps: "15" },
];
