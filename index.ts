import breakfastItems from "./fixtures/breakfast.json";
import dinnerItems from "./fixtures/dinner.json";
import lunchItems from "./fixtures/lunch.json";
import snackItems from "./fixtures/snack.json";
import workoutItems from "./fixtures/workout.json";
import { MealItem } from "./types";

const threshold = 100;
const target = parseInt(process.argv[2]);

const _groups: MealItem[][] = [
  breakfastItems,
  snackItems,
  lunchItems,
  workoutItems,
  dinnerItems,
];

/** Helpers */
const withinThreshold = (num: number) =>
  num > target - threshold && num < target + threshold;

// O(n^5) brute force problem
const compute = (groups: MealItem[][]) => {
  const reducer = (
    acc: MealItem[],
    accCalories: number,
    cur: MealItem,
    index: number
  ) => {
    const calories = accCalories + cur.calories;

    if (!groups[index + 1]) {
      return withinThreshold(calories) ? [...acc, cur] : [];
    }

    return groups[index + 1].map((foodItem) =>
      reducer([...acc, cur], calories, foodItem, index + 1)
    );
  };

  return groups[0]
    .map((foodItem) => reducer([], 0, foodItem, 0))
    .flat(groups.length - 1)
    .filter((arr) => arr.length !== 0);
};

const buildMealPlan = (days: number) => {
  const result = [];

  let groups = _groups;
  for (let i = 0; i < days; i++) {
    const candidates = compute(groups);
    const meal = candidates[Math.floor(Math.random() * candidates.length)];

    result.push(meal);

    // filter select meals from viable meals
    groups = groups.map((group, i) =>
      group.filter((foodItem) => foodItem !== meal[i])
    );
  }

  return result;
};

const prettyPrint = (mealPlans: MealItem[][]) => {
  const printMealInformation = (groupName: string, mealItem: MealItem) => {
    return `|
| ${groupName}:                     
|                                    
|      Name: ${mealItem.name}        
|      Calories: ${mealItem.calories}    
|      Protein: ${mealItem.protein}    
|      Fat: ${mealItem.fat}            
|                                    
---------------------------`;
  };

  const days: string[] = [];
  mealPlans.forEach((mealPlan, index) => {
    days.push(`
|====== Meal (Day ${index + 1}) =======
${printMealInformation("Breakfast", mealPlan[0])}
${printMealInformation("Snack", mealPlan[1])}
${printMealInformation("Lunch", mealPlan[2])}
${printMealInformation("Workout", mealPlan[3])}
${printMealInformation("Dinner", mealPlan[4])}
    `);
  });

  days.forEach((day) => console.log(day));
};

prettyPrint(buildMealPlan(2));
