export type DietMeal = {
  slot: "Desayuno" | "Almuerzo" | "Comida" | "Merienda" | "Cena";
  description: string;
};

export type DietPlan = {
  id: string;
  name: string;
  description: string;
  goal: "Déficit calórico" | "Superávit calórico" | "Mantenimiento";
  style:
    | "Omnívora"
    | "Vegetariana"
    | "Vegana"
    | "Mediterránea"
    | "Baja en carbohidratos";
  kcalApprox: string;
  proteinApprox: string;
  meals: DietMeal[];
};

/* Planes de ejemplo, editables, pensados como punto de partida —
   no sustituyen la valoración de un nutricionista. */
export const DIET_PLANS: DietPlan[] = [
  {
    id: "deficit-omnivoro",
    name: "Déficit — Omnívora clásica",
    description: "Dieta alta en proteína para perder grasa manteniendo masa muscular.",
    goal: "Déficit calórico",
    style: "Omnívora",
    kcalApprox: "≈ 1.800–2.000 kcal",
    proteinApprox: "≈ 2 g/kg de peso",
    meals: [
      { slot: "Desayuno", description: "Claras revueltas con avena y fruta" },
      { slot: "Almuerzo", description: "Yogur griego con frutos rojos" },
      { slot: "Comida", description: "Pechuga de pollo a la plancha, arroz y brócoli" },
      { slot: "Merienda", description: "Batido de proteína con plátano" },
      { slot: "Cena", description: "Merluza al horno con verduras salteadas" },
    ],
  },
  {
    id: "superavit-omnivoro",
    name: "Superávit — Ganancia muscular",
    description: "Aporte calórico elevado con alta densidad energética para volumen limpio.",
    goal: "Superávit calórico",
    style: "Omnívora",
    kcalApprox: "≈ 2.800–3.200 kcal",
    proteinApprox: "≈ 2 g/kg de peso",
    meals: [
      { slot: "Desayuno", description: "Tortilla de 3 huevos, pan integral y aguacate" },
      { slot: "Almuerzo", description: "Batido con avena, plátano y crema de cacahuete" },
      { slot: "Comida", description: "Ternera magra, pasta integral y ensalada" },
      { slot: "Merienda", description: "Yogur griego con granola y frutos secos" },
      { slot: "Cena", description: "Salmón, boniato asado y espárragos" },
    ],
  },
  {
    id: "mantenimiento-mediterraneo",
    name: "Mantenimiento — Mediterránea",
    description: "Patrón mediterráneo equilibrado, rico en pescado, legumbres y aceite de oliva.",
    goal: "Mantenimiento",
    style: "Mediterránea",
    kcalApprox: "≈ 2.200–2.400 kcal",
    proteinApprox: "≈ 1.6 g/kg de peso",
    meals: [
      { slot: "Desayuno", description: "Tostada con tomate, aceite de oliva y jamón" },
      { slot: "Almuerzo", description: "Puñado de almendras y una pieza de fruta" },
      { slot: "Comida", description: "Lentejas estofadas con verduras" },
      { slot: "Merienda", description: "Queso fresco con nueces" },
      { slot: "Cena", description: "Dorada a la plancha con ensalada y pimientos asados" },
    ],
  },
  {
    id: "deficit-vegetariano",
    name: "Déficit — Vegetariana",
    description: "Alta en proteína vegetal y huevo/lácteos, pensada para perder grasa.",
    goal: "Déficit calórico",
    style: "Vegetariana",
    kcalApprox: "≈ 1.800–2.000 kcal",
    proteinApprox: "≈ 1.8 g/kg de peso",
    meals: [
      { slot: "Desayuno", description: "Skyr con avena y arándanos" },
      { slot: "Almuerzo", description: "Hummus con crudités" },
      { slot: "Comida", description: "Tofu salteado con verduras y quinoa" },
      { slot: "Merienda", description: "Batido de proteína vegetal" },
      { slot: "Cena", description: "Tortilla de espinacas y champiñones" },
    ],
  },
  {
    id: "superavit-vegano",
    name: "Superávit — Vegana",
    description: "Volumen calórico 100% vegetal combinando legumbres, tofu y frutos secos.",
    goal: "Superávit calórico",
    style: "Vegana",
    kcalApprox: "≈ 2.700–3.000 kcal",
    proteinApprox: "≈ 1.8 g/kg de peso",
    meals: [
      { slot: "Desayuno", description: "Porridge de avena con leche de almendra, plátano y crema de cacahuete" },
      { slot: "Almuerzo", description: "Batido con proteína vegana, dátiles y frutos secos" },
      { slot: "Comida", description: "Tempeh salteado con arroz integral y edamame" },
      { slot: "Merienda", description: "Hummus con pan integral" },
      { slot: "Cena", description: "Garbanzos guisados con verduras y aguacate" },
    ],
  },
  {
    id: "bajo-carbohidrato",
    name: "Baja en carbohidratos",
    description: "Reduce cereales y azúcares, prioriza proteína, verdura y grasas saludables.",
    goal: "Déficit calórico",
    style: "Baja en carbohidratos",
    kcalApprox: "≈ 1.700–1.900 kcal",
    proteinApprox: "≈ 2.2 g/kg de peso",
    meals: [
      { slot: "Desayuno", description: "Huevos revueltos con aguacate" },
      { slot: "Almuerzo", description: "Puñado de nueces" },
      { slot: "Comida", description: "Solomillo de ternera con verduras salteadas" },
      { slot: "Merienda", description: "Queso curado y aceitunas" },
      { slot: "Cena", description: "Salmón al horno con espárragos y ensalada" },
    ],
  },
];
