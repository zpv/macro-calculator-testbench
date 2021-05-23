export type Macros = {
  calories: number;
  fat: number;
  protein: number;
};

export type MealItem = {
  name: string;
  macros: Macros;
};
