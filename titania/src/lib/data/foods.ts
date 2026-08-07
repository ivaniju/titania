/* ---------------------------------------------------------------------
 * Base de datos de alimentos — valores nutricionales por 100 g (aprox.)
 * Fuente: valores estándar de referencia (tipo USDA/BEDCA), redondeados.
 * Úsalo como base editable: son valores medios, no de un producto exacto.
 * ------------------------------------------------------------------- */

export type FoodCategory =
  | "Carnes"
  | "Pescados"
  | "Mariscos"
  | "Huevos"
  | "Lácteos"
  | "Frutas"
  | "Verduras"
  | "Legumbres"
  | "Cereales"
  | "Arroz y pasta"
  | "Bebidas"
  | "Frutos secos"
  | "Aceites y grasas"
  | "Salsas"
  | "Comida rápida"
  | "Snacks"
  | "Postres"
  | "Suplementos";

export type Food = {
  id: string;
  name: string;
  category: FoodCategory;
  /* por 100 g o 100 ml */
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  /* unidad habitual de ración, solo informativa */
  portion?: string;
};

function f(
  id: string,
  name: string,
  category: FoodCategory,
  kcal: number,
  protein: number,
  carbs: number,
  fat: number,
  fiber = 0,
  portion?: string
): Food {
  return { id, name, category, kcal, protein, carbs, fat, fiber, portion };
}

export const FOODS: Food[] = [
  // ---------------- Carnes ----------------
  f("c1", "Pechuga de pollo", "Carnes", 165, 31, 0, 3.6),
  f("c2", "Muslo de pollo sin piel", "Carnes", 172, 24, 0, 8),
  f("c3", "Pavo (pechuga)", "Carnes", 135, 29, 0, 1.5),
  f("c4", "Ternera magra", "Carnes", 172, 26, 0, 7),
  f("c5", "Solomillo de ternera", "Carnes", 158, 27, 0, 5),
  f("c6", "Carne picada de ternera 10% grasa", "Carnes", 176, 20, 0, 10),
  f("c7", "Cerdo lomo", "Carnes", 143, 21, 0, 6),
  f("c8", "Secreto ibérico", "Carnes", 280, 18, 0, 23),
  f("c9", "Jamón serrano", "Carnes", 241, 31, 0, 13),
  f("c10", "Jamón cocido", "Carnes", 113, 18, 1.5, 3.5),
  f("c11", "Cordero pierna", "Carnes", 206, 25, 0, 11),
  f("c12", "Conejo", "Carnes", 173, 21, 0, 8),
  f("c13", "Bacon / panceta", "Carnes", 541, 37, 1.4, 42),
  f("c14", "Chorizo", "Carnes", 455, 24, 2, 38),
  f("c15", "Salchichas de pollo", "Carnes", 165, 15, 3, 10),
  f("c16", "Hígado de ternera", "Carnes", 135, 20, 4, 4),
  f("c17", "Pato", "Carnes", 337, 19, 0, 28),
  f("c18", "Codorniz", "Carnes", 134, 22, 0, 5),

  // ---------------- Pescados ----------------
  f("p1", "Salmón", "Pescados", 208, 20, 0, 13),
  f("p2", "Atún fresco", "Pescados", 144, 23, 0, 5),
  f("p3", "Atún en lata (al natural)", "Pescados", 116, 26, 0, 1),
  f("p4", "Merluza", "Pescados", 86, 17, 0, 1.3),
  f("p5", "Bacalao fresco", "Pescados", 82, 18, 0, 0.7),
  f("p6", "Bacalao desalado", "Pescados", 78, 17, 0, 0.6),
  f("p7", "Lubina", "Pescados", 97, 18, 0, 2.5),
  f("p8", "Dorada", "Pescados", 96, 20, 0, 2),
  f("p9", "Trucha", "Pescados", 119, 20, 0, 4),
  f("p10", "Sardina fresca", "Pescados", 208, 20, 0, 14),
  f("p11", "Sardina en lata (aceite)", "Pescados", 208, 25, 0, 12),
  f("p12", "Caballa", "Pescados", 205, 19, 0, 14),
  f("p13", "Boquerón", "Pescados", 131, 20, 0, 5),
  f("p14", "Rape", "Pescados", 76, 15, 0, 1.5),
  f("p15", "Lenguado", "Pescados", 91, 19, 0, 1.5),
  f("p16", "Panga", "Pescados", 90, 15, 0, 3),
  f("p17", "Anchoas en aceite", "Pescados", 210, 29, 0, 10),
  f("p18", "Emperador / pez espada", "Pescados", 121, 20, 0, 4),

  // ---------------- Mariscos ----------------
  f("m1", "Gambas / langostinos", "Mariscos", 99, 21, 0.9, 1.4),
  f("m2", "Mejillones", "Mariscos", 86, 12, 4, 2.2),
  f("m3", "Calamar", "Mariscos", 92, 16, 3, 1.4),
  f("m4", "Pulpo", "Mariscos", 82, 15, 2.2, 1),
  f("m5", "Almejas", "Mariscos", 74, 13, 2.6, 1),
  f("m6", "Vieiras", "Mariscos", 88, 17, 3, 0.8),
  f("m7", "Cangrejo", "Mariscos", 97, 19, 0, 1.5),
  f("m8", "Sepia", "Mariscos", 79, 16, 0.8, 1),
  f("m9", "Langosta", "Mariscos", 89, 19, 0.5, 0.9),
  f("m10", "Percebes", "Mariscos", 81, 16, 1, 1),

  // ---------------- Huevos ----------------
  f("h1", "Huevo entero", "Huevos", 155, 13, 1.1, 11, 0, "1 huevo ≈ 50 g"),
  f("h2", "Clara de huevo", "Huevos", 52, 11, 0.7, 0.2, 0, "1 clara ≈ 33 g"),
  f("h3", "Yema de huevo", "Huevos", 322, 16, 3.6, 27, 0, "1 yema ≈ 17 g"),
  f("h4", "Huevo de codorniz", "Huevos", 158, 13, 0.4, 11),
  f("h5", "Huevo cocido", "Huevos", 155, 13, 1.1, 11),
  f("h6", "Tortilla francesa (2 huevos)", "Huevos", 154, 12.6, 0.8, 11),

  // ---------------- Lácteos ----------------
  f("l1", "Leche entera", "Lácteos", 61, 3.2, 4.8, 3.3, 0, "por 100 ml"),
  f("l2", "Leche semidesnatada", "Lácteos", 46, 3.3, 4.8, 1.6, 0, "por 100 ml"),
  f("l3", "Leche desnatada", "Lácteos", 35, 3.4, 5, 0.1, 0, "por 100 ml"),
  f("l4", "Yogur natural", "Lácteos", 61, 3.5, 4.7, 3.3),
  f("l5", "Yogur griego", "Lácteos", 97, 9, 4, 5),
  f("l6", "Yogur griego 0%", "Lácteos", 59, 10, 3.6, 0.4),
  f("l7", "Skyr", "Lácteos", 63, 11, 4, 0.2),
  f("l8", "Queso fresco batido", "Lácteos", 74, 8, 4, 3),
  f("l9", "Requesón", "Lácteos", 98, 11, 3.4, 4.3),
  f("l10", "Queso cottage", "Lácteos", 98, 11, 3.4, 4.3),
  f("l11", "Queso curado (manchego)", "Lácteos", 400, 26, 1, 33),
  f("l12", "Queso mozzarella", "Lácteos", 280, 22, 2.2, 21),
  f("l13", "Queso fresco tipo Burgos", "Lácteos", 174, 13, 3.4, 12),
  f("l14", "Queso feta", "Lácteos", 264, 14, 4, 21),
  f("l15", "Queso de untar", "Lácteos", 342, 6, 4, 34),
  f("l16", "Mantequilla", "Lácteos", 717, 0.9, 0.1, 81),
  f("l17", "Nata para cocinar", "Lácteos", 292, 2.5, 3, 30),
  f("l18", "Leche de almendra sin azúcar", "Lácteos", 15, 0.5, 0.3, 1.1),
  f("l19", "Leche de avena", "Lácteos", 46, 1, 6.5, 1.5),
  f("l20", "Kéfir", "Lácteos", 55, 3.3, 4.5, 2),

  // ---------------- Frutas ----------------
  f("fr1", "Plátano", "Frutas", 89, 1.1, 23, 0.3, 2.6),
  f("fr2", "Manzana", "Frutas", 52, 0.3, 14, 0.2, 2.4),
  f("fr3", "Pera", "Frutas", 57, 0.4, 15, 0.1, 3.1),
  f("fr4", "Naranja", "Frutas", 47, 0.9, 12, 0.1, 2.4),
  f("fr5", "Mandarina", "Frutas", 53, 0.8, 13, 0.3, 1.8),
  f("fr6", "Fresas", "Frutas", 32, 0.7, 7.7, 0.3, 2),
  f("fr7", "Arándanos", "Frutas", 57, 0.7, 14, 0.3, 2.4),
  f("fr8", "Frambuesas", "Frutas", 52, 1.2, 12, 0.7, 6.5),
  f("fr9", "Piña", "Frutas", 50, 0.5, 13, 0.1, 1.4),
  f("fr10", "Sandía", "Frutas", 30, 0.6, 8, 0.2, 0.4),
  f("fr11", "Melón", "Frutas", 34, 0.8, 8, 0.2, 0.9),
  f("fr12", "Uvas", "Frutas", 69, 0.7, 18, 0.2, 0.9),
  f("fr13", "Kiwi", "Frutas", 61, 1.1, 15, 0.5, 3),
  f("fr14", "Aguacate", "Frutas", 160, 2, 8.5, 14.7, 6.7),
  f("fr15", "Mango", "Frutas", 60, 0.8, 15, 0.4, 1.6),
  f("fr16", "Papaya", "Frutas", 43, 0.5, 11, 0.3, 1.7),
  f("fr17", "Cerezas", "Frutas", 63, 1.1, 16, 0.2, 2.1),
  f("fr18", "Melocotón", "Frutas", 39, 0.9, 10, 0.3, 1.5),
  f("fr19", "Ciruela", "Frutas", 46, 0.7, 11, 0.3, 1.4),
  f("fr20", "Higo", "Frutas", 74, 0.8, 19, 0.3, 2.9),
  f("fr21", "Granada", "Frutas", 83, 1.7, 19, 1.2, 4),
  f("fr22", "Limón", "Frutas", 29, 1.1, 9, 0.3, 2.8),
  f("fr23", "Dátil", "Frutas", 282, 2.5, 75, 0.4, 8, "seco"),
  f("fr24", "Pasas", "Frutas", 299, 3.1, 79, 0.5, 3.7),

  // ---------------- Verduras ----------------
  f("v1", "Brócoli", "Verduras", 34, 2.8, 7, 0.4, 2.6),
  f("v2", "Espinacas", "Verduras", 23, 2.9, 3.6, 0.4, 2.2),
  f("v3", "Lechuga", "Verduras", 15, 1.4, 2.9, 0.2, 1.3),
  f("v4", "Tomate", "Verduras", 18, 0.9, 3.9, 0.2, 1.2),
  f("v5", "Pepino", "Verduras", 15, 0.7, 3.6, 0.1, 0.5),
  f("v6", "Zanahoria", "Verduras", 41, 0.9, 10, 0.2, 2.8),
  f("v7", "Calabacín", "Verduras", 17, 1.2, 3.1, 0.3, 1),
  f("v8", "Berenjena", "Verduras", 25, 1, 6, 0.2, 3),
  f("v9", "Pimiento rojo", "Verduras", 31, 1, 6, 0.3, 2.1),
  f("v10", "Pimiento verde", "Verduras", 20, 0.9, 4.6, 0.2, 1.7),
  f("v11", "Cebolla", "Verduras", 40, 1.1, 9.3, 0.1, 1.7),
  f("v12", "Ajo", "Verduras", 149, 6.4, 33, 0.5, 2.1),
  f("v13", "Puerro", "Verduras", 61, 1.5, 14, 0.3, 1.8),
  f("v14", "Coliflor", "Verduras", 25, 1.9, 5, 0.3, 2),
  f("v15", "Col rizada (kale)", "Verduras", 49, 4.3, 9, 0.9, 3.6),
  f("v16", "Repollo", "Verduras", 25, 1.3, 6, 0.1, 2.5),
  f("v17", "Espárragos", "Verduras", 20, 2.2, 3.9, 0.1, 2.1),
  f("v18", "Champiñones", "Verduras", 22, 3.1, 3.3, 0.3, 1),
  f("v19", "Setas variadas", "Verduras", 25, 2.9, 4, 0.3, 1.5),
  f("v20", "Judías verdes", "Verduras", 31, 1.8, 7, 0.2, 3.4),
  f("v21", "Guisantes", "Verduras", 81, 5.4, 14, 0.4, 5.1),
  f("v22", "Alcachofa", "Verduras", 47, 3.3, 10.5, 0.2, 5.4),
  f("v23", "Remolacha", "Verduras", 43, 1.6, 10, 0.2, 2.8),
  f("v24", "Rábano", "Verduras", 16, 0.7, 3.4, 0.1, 1.6),
  f("v25", "Apio", "Verduras", 16, 0.7, 3, 0.2, 1.6),
  f("v26", "Boniato / batata", "Verduras", 86, 1.6, 20, 0.1, 3),
  f("v27", "Patata", "Verduras", 77, 2, 17, 0.1, 2.2),
  f("v28", "Calabaza", "Verduras", 26, 1, 6.5, 0.1, 0.5),

  // ---------------- Legumbres ----------------
  f("le1", "Lentejas cocidas", "Legumbres", 116, 9, 20, 0.4, 8),
  f("le2", "Garbanzos cocidos", "Legumbres", 164, 8.9, 27, 2.6, 7.6),
  f("le3", "Alubias blancas cocidas", "Legumbres", 127, 8.7, 23, 0.5, 6.3),
  f("le4", "Alubias rojas cocidas", "Legumbres", 127, 8.7, 23, 0.5, 6.4),
  f("le5", "Soja cocida (edamame)", "Legumbres", 122, 11, 10, 5, 5),
  f("le6", "Guisantes secos cocidos", "Legumbres", 118, 8, 21, 0.4, 8.3),
  f("le7", "Hummus", "Legumbres", 166, 8, 14, 10, 6),
  f("le8", "Tofu", "Legumbres", 76, 8, 1.9, 4.8),
  f("le9", "Tempeh", "Legumbres", 192, 20, 8, 11),
  f("le10", "Judías pintas cocidas", "Legumbres", 143, 9, 26, 0.6, 8.9),

  // ---------------- Cereales ----------------
  f("ce1", "Avena en copos", "Cereales", 389, 17, 66, 7, 10),
  f("ce2", "Pan integral", "Cereales", 247, 13, 41, 3.4, 7),
  f("ce3", "Pan blanco", "Cereales", 265, 9, 49, 3.2, 2.7),
  f("ce4", "Pan de centeno", "Cereales", 259, 9, 48, 3.3, 5.8),
  f("ce5", "Tortitas de maíz", "Cereales", 384, 8, 82, 3.5, 4),
  f("ce6", "Tortitas de arroz", "Cereales", 387, 8, 81, 2.8, 4.3),
  f("ce7", "Muesli", "Cereales", 362, 10, 66, 6, 8),
  f("ce8", "Cereales de maíz (corn flakes)", "Cereales", 357, 7, 84, 0.9, 3),
  f("ce9", "Granola", "Cereales", 471, 10, 64, 20, 7),
  f("ce10", "Salvado de trigo", "Cereales", 216, 16, 64, 4.3, 43),
  f("ce11", "Trigo sarraceno", "Cereales", 343, 13, 71, 3.4, 10),
  f("ce12", "Harina de trigo", "Cereales", 364, 10, 76, 1),
  f("ce13", "Harina de avena", "Cereales", 389, 17, 66, 7, 10),
  f("ce14", "Maíz dulce", "Cereales", 86, 3.2, 19, 1.2, 2),

  // ---------------- Arroz y pasta ----------------
  f("ap1", "Arroz blanco cocido", "Arroz y pasta", 130, 2.7, 28, 0.3, 0.4),
  f("ap2", "Arroz integral cocido", "Arroz y pasta", 123, 2.7, 26, 1, 1.8),
  f("ap3", "Arroz basmati cocido", "Arroz y pasta", 121, 2.9, 25, 0.4),
  f("ap4", "Pasta cocida", "Arroz y pasta", 158, 5.8, 31, 0.9, 1.8),
  f("ap5", "Pasta integral cocida", "Arroz y pasta", 149, 5.3, 30, 1.4, 3.9),
  f("ap6", "Quinoa cocida", "Arroz y pasta", 120, 4.4, 21, 1.9, 2.8),
  f("ap7", "Cuscús cocido", "Arroz y pasta", 112, 3.8, 23, 0.2, 1.4),
  f("ap8", "Fideos de arroz", "Arroz y pasta", 109, 1.8, 25, 0.2),
  f("ap9", "Ñoquis", "Arroz y pasta", 156, 3.5, 32, 1),
  f("ap10", "Pasta fresca al huevo", "Arroz y pasta", 285, 11, 55, 2.5),

  // ---------------- Bebidas ----------------
  f("b1", "Agua", "Bebidas", 0, 0, 0, 0),
  f("b2", "Café solo", "Bebidas", 2, 0.3, 0, 0),
  f("b3", "Zumo de naranja natural", "Bebidas", 45, 0.7, 10, 0.2),
  f("b4", "Refresco de cola", "Bebidas", 42, 0, 10.6, 0),
  f("b5", "Refresco cola zero", "Bebidas", 0.3, 0, 0, 0),
  f("b6", "Cerveza", "Bebidas", 43, 0.5, 3.6, 0),
  f("b7", "Vino tinto", "Bebidas", 85, 0.1, 2.6, 0),
  f("b8", "Bebida isotónica", "Bebidas", 24, 0, 6, 0),
  f("b9", "Té sin azúcar", "Bebidas", 1, 0, 0.3, 0),
  f("b10", "Batido de proteína (agua)", "Bebidas", 103, 20, 3, 1.5, 0, "1 scoop 30 g"),
  f("b11", "Horchata", "Bebidas", 92, 0.8, 16, 2.7),
  f("b12", "Leche con cacao", "Bebidas", 83, 3.3, 12, 2.6),

  // ---------------- Frutos secos ----------------
  f("fs1", "Almendras", "Frutos secos", 579, 21, 22, 50, 12.5),
  f("fs2", "Nueces", "Frutos secos", 654, 15, 14, 65, 6.7),
  f("fs3", "Anacardos", "Frutos secos", 553, 18, 30, 44, 3.3),
  f("fs4", "Cacahuetes", "Frutos secos", 567, 26, 16, 49, 8.5),
  f("fs5", "Pistachos", "Frutos secos", 560, 20, 28, 45, 10),
  f("fs6", "Avellanas", "Frutos secos", 628, 15, 17, 61, 9.7),
  f("fs7", "Crema de cacahuete", "Frutos secos", 588, 25, 20, 50, 6),
  f("fs8", "Semillas de chía", "Frutos secos", 486, 17, 42, 31, 34),
  f("fs9", "Semillas de lino", "Frutos secos", 534, 18, 29, 42, 27),
  f("fs10", "Pipas de girasol", "Frutos secos", 584, 21, 20, 51, 8.6),
  f("fs11", "Pipas de calabaza", "Frutos secos", 559, 30, 11, 49, 6),
  f("fs12", "Coco rallado", "Frutos secos", 660, 6.9, 24, 65, 16),

  // ---------------- Aceites y grasas ----------------
  f("ac1", "Aceite de oliva virgen extra", "Aceites y grasas", 884, 0, 0, 100),
  f("ac2", "Aceite de girasol", "Aceites y grasas", 884, 0, 0, 100),
  f("ac3", "Aceite de coco", "Aceites y grasas", 862, 0, 0, 100),
  f("ac4", "Aguacate (grasa)", "Aceites y grasas", 160, 2, 8.5, 14.7),
  f("ac5", "Ghee / mantequilla clarificada", "Aceites y grasas", 900, 0, 0, 100),
  f("ac6", "Margarina", "Aceites y grasas", 717, 0.2, 0.9, 80),

  // ---------------- Salsas ----------------
  f("sa1", "Salsa de tomate frito", "Salsas", 82, 1.6, 11, 3.5),
  f("sa2", "Mayonesa", "Salsas", 680, 1, 1, 75),
  f("sa3", "Ketchup", "Salsas", 101, 1.3, 24, 0.3),
  f("sa4", "Mostaza", "Salsas", 66, 4.4, 5, 3.3),
  f("sa5", "Salsa de soja", "Salsas", 53, 8, 5, 0),
  f("sa6", "Alioli", "Salsas", 570, 1, 3, 60),
  f("sa7", "Pesto", "Salsas", 458, 4, 6, 45),
  f("sa8", "Salsa barbacoa", "Salsas", 172, 1, 40, 0.5),
  f("sa9", "Vinagreta", "Salsas", 330, 0, 2, 36),
  f("sa10", "Guacamole", "Salsas", 155, 2, 8, 13),

  // ---------------- Comida rápida ----------------
  f("ff1", "Hamburguesa con queso (fast food)", "Comida rápida", 250, 13, 22, 12, 0, "1 unidad ~110 g"),
  f("ff2", "Patatas fritas", "Comida rápida", 312, 3.4, 41, 15),
  f("ff3", "Pizza margarita", "Comida rápida", 266, 11, 33, 10),
  f("ff4", "Pizza pepperoni", "Comida rápida", 296, 13, 30, 14),
  f("ff5", "Nuggets de pollo", "Comida rápida", 296, 15, 16, 20),
  f("ff6", "Kebab (plato)", "Comida rápida", 220, 15, 18, 11),
  f("ff7", "Perrito caliente", "Comida rápida", 290, 10, 22, 18),
  f("ff8", "Burrito de carne", "Comida rápida", 206, 10, 24, 8),
  f("ff9", "Donut", "Comida rápida", 452, 5, 51, 25),
  f("ff10", "Sándwich club", "Comida rápida", 250, 14, 26, 10),

  // ---------------- Snacks ----------------
  f("sn1", "Patatas chips", "Snacks", 536, 6.6, 53, 34),
  f("sn2", "Palomitas de maíz", "Snacks", 387, 12, 78, 4.5, 15),
  f("sn3", "Galletas María", "Snacks", 435, 7, 75, 12),
  f("sn4", "Barrita de cereales", "Snacks", 400, 6, 68, 12),
  f("sn5", "Barrita de proteína", "Snacks", 370, 30, 35, 12),
  f("sn6", "Aceitunas", "Snacks", 145, 1, 4, 15),
  f("sn7", "Frutos secos tostados y salados", "Snacks", 600, 20, 15, 52),
  f("sn8", "Torrijas de arroz con chocolate", "Snacks", 470, 6, 63, 21),
  f("sn9", "Regaliz", "Snacks", 325, 3, 78, 0.5),
  f("sn10", "Gominolas", "Snacks", 343, 4, 77, 0.3),

  // ---------------- Postres ----------------
  f("po1", "Chocolate negro 70%", "Postres", 598, 7.8, 46, 43, 11),
  f("po2", "Chocolate con leche", "Postres", 535, 7.6, 59, 30),
  f("po3", "Helado de vainilla", "Postres", 207, 3.5, 24, 11),
  f("po4", "Flan", "Postres", 130, 4, 20, 4),
  f("po5", "Natillas", "Postres", 120, 3.5, 18, 4),
  f("po6", "Tarta de queso", "Postres", 321, 6, 25, 22),
  f("po7", "Bizcocho casero", "Postres", 371, 6, 52, 15),
  f("po8", "Yogur helado", "Postres", 159, 4, 26, 4.5),
  f("po9", "Mousse de chocolate", "Postres", 280, 4, 26, 18),
  f("po10", "Arroz con leche", "Postres", 130, 3.5, 22, 3),

  // ---------------- Suplementos ----------------
  f("su1", "Whey proteína (polvo)", "Suplementos", 380, 80, 7, 5, 0, "por 100 g / ~33 g scoop"),
  f("su2", "Proteína vegana (polvo)", "Suplementos", 370, 75, 8, 5),
  f("su3", "Caseína (polvo)", "Suplementos", 360, 78, 5, 2),
  f("su4", "Creatina monohidrato", "Suplementos", 0, 0, 0, 0, 0, "5 g/día, sin calorías relevantes"),
  f("su5", "BCAA (polvo)", "Suplementos", 0, 0, 0, 0),
  f("su6", "Maltodextrina", "Suplementos", 380, 0, 95, 0),
  f("su7", "Avena instantánea + proteína (mezcla)", "Suplementos", 370, 25, 50, 6),
  f("su8", "Gel energético", "Suplementos", 260, 0, 65, 0, 0, "1 unidad ~40 g"),
  f("su9", "Colágeno hidrolizado", "Suplementos", 355, 90, 0, 0),
  f("su10", "Multivitamínico", "Suplementos", 0, 0, 0, 0, 0, "sin aporte calórico relevante"),
];

export const FOOD_CATEGORIES: FoodCategory[] = [
  "Carnes",
  "Pescados",
  "Mariscos",
  "Huevos",
  "Lácteos",
  "Frutas",
  "Verduras",
  "Legumbres",
  "Cereales",
  "Arroz y pasta",
  "Bebidas",
  "Frutos secos",
  "Aceites y grasas",
  "Salsas",
  "Comida rápida",
  "Snacks",
  "Postres",
  "Suplementos",
];

export function searchFoods(query: string, category?: FoodCategory): Food[] {
  const q = query.trim().toLowerCase();
  return FOODS.filter((food) => {
    const matchesCategory = !category || food.category === category;
    const matchesQuery = !q || food.name.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });
}
