export type Macros = {
  calories: number;
  fat: number;
  protein: number;
};

export type MealItem = {
  name: string;
  macros: Macros;
};

export type Menu = MealItem[][];
export type DayPlan = MealItem[];
export type MealPlan = DayPlan[];

export enum RejectType {
  EXCEEDS_CALORIE_THRESHOLD,
  EXCEEDS_PROTEIN_THRESHOLD,
  NOT_FOUND,
}
