import breakfastItems from "./fixtures/breakfast.json";
import dinnerItems from "./fixtures/dinner.json";
import lunchItems from "./fixtures/lunch.json";
import snackItems from "./fixtures/snack.json";
import workoutItems from "./fixtures/workout.json";
import { DayPlan, Macros, MealItem, MealPlan, Menu, RejectType } from "./types";

const menu: Menu = [
  breakfastItems,
  snackItems,
  lunchItems,
  workoutItems,
  dinnerItems,
];

const targetCalories = parseInt(process.argv[2]);
const targetProtein = parseInt(process.argv[3]);
const targetFat = Math.floor((targetCalories * 0.2) / 9); // 9 calories per gram of fat. target: 20% of total calories

const THRESHOLD_CALORIES = 100; // should fit within 100 calories of their target calories
const THRESHOLD_PROTEIN = 20; // should fit within 20 grams of target protein

/**
 * Helpers
 * */

const withinThreshold = ({ calories, protein, fat }: Macros) =>
  calories > targetCalories - THRESHOLD_CALORIES &&
  calories < targetCalories + THRESHOLD_CALORIES &&
  protein > targetProtein - THRESHOLD_PROTEIN &&
  protein < targetProtein + THRESHOLD_PROTEIN &&
  fat >= targetFat; // should be at least 20% of total calories

const exceedsCalories = ({ calories }: Macros) =>
  calories > targetCalories + THRESHOLD_CALORIES;

const exceedsProtein = ({ protein }: Macros) =>
  protein > targetProtein + THRESHOLD_PROTEIN;

/**
 * Calculation functions
 */

const buildDayPlan = (menu: Menu): DayPlan => {
  const backtrack = (acc: MealItem[], accMacros: Macros, index: number) => {
    for (const foodItem of menu[index]) {
      const mealPlan = backtrackStep(acc, accMacros, foodItem, index);

      // since food items are sorted by calories
      // terminate traversing with food item if calorie threshold is reached.
      if (mealPlan === RejectType.EXCEEDS_CALORIE_THRESHOLD) break;
      if (
        mealPlan === RejectType.NOT_FOUND ||
        mealPlan === RejectType.EXCEEDS_PROTEIN_THRESHOLD
      )
        continue;

      if (mealPlan) return mealPlan;
    }

    return RejectType.NOT_FOUND;
  };

  const backtrackStep = (
    acc: MealItem[],
    accMacros: Macros,
    cur: MealItem,
    index: number
  ): MealItem[] | RejectType => {
    const macros: Macros = {
      calories: accMacros.calories + cur.macros.calories,
      protein: accMacros.protein + cur.macros.protein,
      fat: accMacros.fat + cur.macros.fat,
    };

    if (exceedsCalories(macros)) return RejectType.EXCEEDS_CALORIE_THRESHOLD;
    if (exceedsProtein(macros)) return RejectType.EXCEEDS_PROTEIN_THRESHOLD;

    if (!menu[index + 1]) {
      return withinThreshold(macros) ? [...acc, cur] : RejectType.NOT_FOUND;
    } else {
      return backtrack([...acc, cur], macros, index + 1);
    }
  };

  const result = backtrack([], { calories: 0, protein: 0, fat: 0 }, 0);
  return result === RejectType.NOT_FOUND ? undefined : result;
};

const buildMealPlan = (days: number) => {
  const mealPlan: MealPlan = [];

  let curMenu = menu;
  for (let i = 0; i < days; i++) {
    const meal = buildDayPlan(menu);
    if (!meal) throw Error("Could not build meal plan. Unsatisfiable.");

    mealPlan.push(meal);

    // filter selected meals from viable meals
    curMenu = curMenu.map((group, i) =>
      group.filter((foodItem) => foodItem !== meal[i])
    );
  }

  return mealPlan;
};

// ** Main

const prettyPrint = (mealPlans: MealItem[][]) => {
  console.table(
    mealPlans.reduce(
      (acc, mealPlan) => {
        mealPlan.forEach((mealItem, i) => {
          if (!acc[i]) acc[i] = [];
          acc[i] = [
            ...acc[i],
            `Name: ${mealItem.name}\nCalories: ${mealItem.macros.calories}`,
          ];
        });
        return acc;
      },
      [[]]
    )
  );
};

console.time("start");
prettyPrint(buildMealPlan(5));
console.timeEnd("start");
