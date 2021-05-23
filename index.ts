import breakfastItems from "./fixtures/breakfast.json";
import dinnerItems from "./fixtures/dinner.json";
import lunchItems from "./fixtures/lunch.json";
import snackItems from "./fixtures/snack.json";
import workoutItems from "./fixtures/workout.json";
import { Macros, MealItem } from "./types";

const targetCalories = parseInt(process.argv[2]);
const targetProtein = parseInt(process.argv[3]);
const targetFat = Math.floor((targetCalories * 0.2) / 9); // 9 calories per gram of fat. target: 20% of total calories

const _groups: MealItem[][] = [
  breakfastItems,
  snackItems,
  lunchItems,
  workoutItems,
  dinnerItems,
];

const THRESHOLD_CALORIES = 100; // should fit within 100 calories of their target calories
const THRESHOLD_PROTEIN = 20; // should fit within 20 grams of target protein

/** Helpers */
const withinThreshold = ({ calories, protein, fat }: Macros) =>
  calories > targetCalories - THRESHOLD_CALORIES &&
  calories < targetCalories + THRESHOLD_CALORIES &&
  protein > targetProtein - THRESHOLD_PROTEIN &&
  protein < targetProtein + THRESHOLD_PROTEIN &&
  fat >= targetFat; // should be at least 20% of total calories

const exceedsThreshold = ({ calories, protein }: Macros) =>
  calories > targetCalories + THRESHOLD_CALORIES ||
  protein > targetProtein + THRESHOLD_PROTEIN;

const compute = (groups: MealItem[][]) => {
  const reducer = (
    acc: MealItem[],
    accMacros: Macros,
    cur: MealItem,
    index: number
  ): MealItem[] | false => {
    const macros: Macros = {
      calories: accMacros.calories + cur.macros.calories,
      protein: accMacros.protein + cur.macros.protein,
      fat: accMacros.fat + cur.macros.fat,
    };

    if (exceedsThreshold(macros)) return false;
    if (!groups[index + 1]) {
      return withinThreshold(macros) ? [...acc, cur] : false;
    } else {
      for (const foodItem of groups[index + 1]) {
        const mealPlan = reducer([...acc, cur], macros, foodItem, index + 1);
        if (mealPlan) return mealPlan;
      }
    }
    return false;
  };

  for (const foodItem of groups[0]) {
    const mealPlan = reducer(
      [],
      { calories: 0, protein: 0, fat: 0 },
      foodItem,
      0
    );
    if (mealPlan) return mealPlan;
  }
  return false;
};

const buildMealPlan = (days: number) => {
  const result = [];

  let groups = _groups;
  for (let i = 0; i < days; i++) {
    const meal = compute(groups);

    result.push(meal);

    // filter selected meals from viable meals
    groups = groups.map((group, i) =>
      group.filter((foodItem) => foodItem !== meal[i])
    );
  }

  return result;
};

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

prettyPrint(buildMealPlan(3));
