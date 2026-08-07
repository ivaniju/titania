/* XP necesaria para pasar del nivel N al N+1: crece progresivamente. */
export function xpForLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.35));
}

export function levelFromXp(totalXp: number): {
  level: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
  progress: number;
} {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  const need = xpForLevel(level);
  return {
    level,
    xpIntoLevel: remaining,
    xpToNextLevel: need,
    progress: Math.min(1, remaining / need),
  };
}

/* Índice de compromiso semanal (0-100): no premia solo entrenar.
   40% entrenamientos · 25% nutrición · 15% pasos · 10% hidratación · 10% sueño */
export type EngagementInputs = {
  workoutsDone: number;
  workoutsTarget: number;
  nutritionDaysOk: number;
  nutritionDaysTarget: number;
  stepsAvgRatio: number; // 0-1, promedio semanal respecto al objetivo
  hydrationDaysOk: number;
  hydrationDaysTarget: number;
  sleepDaysOk: number;
  sleepDaysTarget: number;
};

export function computeEngagementScore(i: EngagementInputs): number {
  const ratio = (a: number, b: number) => (b <= 0 ? 0 : Math.min(1, a / b));
  const workout = ratio(i.workoutsDone, i.workoutsTarget) * 40;
  const nutrition = ratio(i.nutritionDaysOk, i.nutritionDaysTarget) * 25;
  const steps = Math.min(1, i.stepsAvgRatio) * 15;
  const hydration = ratio(i.hydrationDaysOk, i.hydrationDaysTarget) * 10;
  const sleep = ratio(i.sleepDaysOk, i.sleepDaysTarget) * 10;
  return Math.round(workout + nutrition + steps + hydration + sleep);
}

/* Día del calendario según actividad registrada */
export function dayColor(status: "perfecto" | "aceptable" | "vacio"): string {
  if (status === "perfecto") return "#34d399"; // verde
  if (status === "aceptable") return "#fbbf24"; // amarillo
  return "#ef4444"; // rojo
}
