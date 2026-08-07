export type ChallengeFrequency = "Diario" | "Semanal" | "Mensual";

export type ChallengeTemplate = {
  id: string;
  name: string;
  frequency: ChallengeFrequency;
  xp: number;
  metric:
    | "workouts"
    | "kmRun"
    | "proteinDays"
    | "waterLiters"
    | "sleepHours"
    | "steps"
    | "routineCompleted";
  target: number;
  icon: string;
};

/* Sistema fácilmente ampliable: basta con añadir una nueva entrada aquí
   para que aparezca en /retos y se pueda completar y otorgar XP. */
export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  { id: "d1", name: "Bebe 2 litros de agua", frequency: "Diario", xp: 15, metric: "waterLiters", target: 2, icon: "💧" },
  { id: "d2", name: "Duerme 8 horas", frequency: "Diario", xp: 15, metric: "sleepHours", target: 8, icon: "😴" },
  { id: "d3", name: "10.000 pasos", frequency: "Diario", xp: 20, metric: "steps", target: 10000, icon: "👣" },
  { id: "d4", name: "Cumple tu objetivo de proteína", frequency: "Diario", xp: 20, metric: "proteinDays", target: 1, icon: "🍗" },
  { id: "s1", name: "Entrena 4 veces esta semana", frequency: "Semanal", xp: 100, metric: "workouts", target: 4, icon: "🏋️" },
  { id: "s2", name: "Corre 20 km esta semana", frequency: "Semanal", xp: 120, metric: "kmRun", target: 20, icon: "🏃" },
  { id: "s3", name: "Cumple proteína 5 días", frequency: "Semanal", xp: 90, metric: "proteinDays", target: 5, icon: "🥩" },
  { id: "s4", name: "Completa un Push Pull Legs completo", frequency: "Semanal", xp: 150, metric: "routineCompleted", target: 1, icon: "🔁" },
  { id: "m1", name: "Entrena 16 veces este mes", frequency: "Mensual", xp: 400, metric: "workouts", target: 16, icon: "📆" },
  { id: "m2", name: "Corre 80 km este mes", frequency: "Mensual", xp: 450, metric: "kmRun", target: 80, icon: "🛣️" },
];
