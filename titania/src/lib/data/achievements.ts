export type AchievementCategory = "Entrenamiento" | "Nutrición" | "Constancia" | "Cardio" | "Social" | "Ranking";

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  xp: number;
  /* clave usada por el store para calcular el progreso, ver lib/gamification.ts */
  metric:
    | "workoutsCompleted"
    | "streakDays"
    | "mealsLogged"
    | "pullUpsMax"
    | "runsCompleted"
    | "kmRun"
    | "duelsWon"
    | "weeklyTop1"
    | "totalPoints"
    | "friendsAdded";
  target: number;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "a1", name: "Primer paso", description: "Completa tu primer entrenamiento", icon: "🥇", category: "Entrenamiento", xp: 50, metric: "workoutsCompleted", target: 1 },
  { id: "a2", name: "Constancia de hierro", description: "7 días seguidos activo", icon: "🔥", category: "Constancia", xp: 100, metric: "streakDays", target: 7 },
  { id: "a3", name: "Mes perfecto", description: "30 días de racha", icon: "📅", category: "Constancia", xp: 300, metric: "streakDays", target: 30 },
  { id: "a4", name: "Centurión", description: "100 entrenamientos completados", icon: "💯", category: "Entrenamiento", xp: 500, metric: "workoutsCompleted", target: 100 },
  { id: "a5", name: "Nutrición al día", description: "Registra 100 comidas", icon: "🍽️", category: "Nutrición", xp: 200, metric: "mealsLogged", target: 100 },
  { id: "a6", name: "Primer 5K", description: "Completa una carrera de 5 km", icon: "🏃", category: "Cardio", xp: 80, metric: "kmRun", target: 5 },
  { id: "a7", name: "Primer 10K", description: "Completa una carrera de 10 km", icon: "🏃‍♂️", category: "Cardio", xp: 150, metric: "kmRun", target: 10 },
  { id: "a8", name: "100 km", description: "Acumula 100 km corridos", icon: "🛣️", category: "Cardio", xp: 400, metric: "kmRun", target: 100 },
  { id: "a9", name: "Primera dominada", description: "Realiza tu primera dominada estricta", icon: "🧗", category: "Entrenamiento", xp: 60, metric: "pullUpsMax", target: 1 },
  { id: "a10", name: "100 dominadas", description: "Acumula 100 dominadas totales", icon: "🏆", category: "Entrenamiento", xp: 250, metric: "pullUpsMax", target: 100 },
  { id: "a11", name: "Top 1 semanal", description: "Termina primero en el ranking de amigos", icon: "👑", category: "Ranking", xp: 200, metric: "weeklyTop1", target: 1 },
  { id: "a12", name: "10.000 puntos", description: "Alcanza 10.000 puntos de compromiso", icon: "⭐", category: "Ranking", xp: 300, metric: "totalPoints", target: 10000 },
  { id: "a13", name: "Duelista", description: "Gana tu primer duelo", icon: "⚔️", category: "Social", xp: 80, metric: "duelsWon", target: 1 },
  { id: "a14", name: "Rival temido", description: "Gana 10 duelos", icon: "🛡️", category: "Social", xp: 300, metric: "duelsWon", target: 10 },
  { id: "a15", name: "Círculo social", description: "Añade a 5 amigos", icon: "🤝", category: "Social", xp: 60, metric: "friendsAdded", target: 5 },
  { id: "a16", name: "Quincena activa", description: "14 días seguidos activo", icon: "🌟", category: "Constancia", xp: 150, metric: "streakDays", target: 14 },
  { id: "a17", name: "50 entrenos", description: "50 entrenamientos completados", icon: "🥈", category: "Entrenamiento", xp: 250, metric: "workoutsCompleted", target: 50 },
  { id: "a18", name: "Corredor de fondo", description: "10 carreras completadas", icon: "🏅", category: "Cardio", xp: 150, metric: "runsCompleted", target: 10 },
  { id: "a19", name: "200 comidas", description: "Registra 200 comidas", icon: "🥑", category: "Nutrición", xp: 350, metric: "mealsLogged", target: 200 },
  { id: "a20", name: "Leyenda de 100 días", description: "100 días de racha", icon: "🐉", category: "Constancia", xp: 800, metric: "streakDays", target: 100 },
];
