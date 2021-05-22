import fs from "fs";
import { MealItem } from "../types";

const generateFixtures = (
  name: string,
  minCalories: number,
  maxCalories: number,
  numRecipes: number
) => {
  const fixtures: MealItem[] = new Array(numRecipes).fill(0).map((_, i) => {
    return {
      name: `${name}-${i}`,
      calories:
        minCalories + Math.floor(Math.random() * (maxCalories - minCalories)),
      protein: Math.floor(Math.random() * 30),
      fat: Math.floor(Math.random() * 25),
    };
  });
  fs.writeFileSync(`./fixtures/${name}.json`, JSON.stringify(fixtures));
};

generateFixtures("breakfast", 50, 500, 20);
generateFixtures("snack", 50, 300, 20);
generateFixtures("lunch", 300, 800, 20);
generateFixtures("workout", 200, 600, 20);
generateFixtures("dinner", 400, 1500, 20);
