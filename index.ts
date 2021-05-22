import breakfastItems from "./fixtures/breakfast.json";
import dinnerItems from "./fixtures/dinner.json";
import lunchItems from "./fixtures/lunch.json";
import snackItems from "./fixtures/snack.json";
import workoutItems from "./fixtures/workout.json";
import { MealItem } from "./types";

const threshold = 100;
const target = parseInt(process.argv[2]);

/** Helpers */
const withinThreshold = (num: number) =>
  num > target - threshold && num < target + threshold;

const groups: MealItem[][] = [
  breakfastItems,
  snackItems,
  lunchItems,
  workoutItems,
  dinnerItems,
];

// O(n^5) brute force problem
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

const compute = () => {
  return groups[0]
    .map((foodItem) => reducer([], 0, foodItem, 0))
    .flat(groups.length - 1)
    .filter((arr) => arr.length !== 0);
};

console.time("start");
console.log(compute());
console.timeEnd("start");
