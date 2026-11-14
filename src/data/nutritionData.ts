import { FoodItem, DailyNutritionLog, NutritionTargets } from '../types/workout';

export const COMMON_FOOD_DATABASE: FoodItem[] = [
  {
    id: 'food-chicken-breast',
    name: 'Grilled Chicken Breast',
    servingSize: '150g cooked',
    calories: 247,
    protein: 46,
    carbs: 0,
    fat: 5.4,
    category: 'Protein'
  },
  {
    id: 'food-salmon-fillet',
    name: 'Atlantic Salmon Fillet',
    servingSize: '150g baked',
    calories: 312,
    protein: 34,
    carbs: 0,
    fat: 19,
    category: 'Protein'
  },
  {
    id: 'food-eggs-large',
    name: 'Whole Eggs (2 Large)',
    servingSize: '2 eggs (100g)',
    calories: 144,
    protein: 12.6,
    carbs: 0.8,
    fat: 9.8,
    category: 'Protein'
  },
  {
    id: 'food-egg-whites',
    name: 'Liquid Egg Whites',
    servingSize: '150ml (3/4 cup)',
    calories: 78,
    protein: 16.5,
    carbs: 1.1,
    fat: 0.3,
    category: 'Protein'
  },
  {
    id: 'food-greek-yogurt',
    name: '0% Fat Greek Yogurt',
    servingSize: '200g (approx 1 cup)',
    calories: 118,
    protein: 20.6,
    carbs: 7.2,
    fat: 0.4,
    category: 'Protein'
  },
  {
    id: 'food-whey-protein',
    name: 'Whey Protein Isolate',
    servingSize: '1 scoop (30g)',
    calories: 120,
    protein: 26,
    carbs: 1.5,
    fat: 1.0,
    category: 'Supplement'
  },
  {
    id: 'food-rolled-oats',
    name: 'Rolled Whole Oats',
    servingSize: '60g dry',
    calories: 228,
    protein: 8,
    carbs: 40,
    fat: 4.2,
    fiber: 6.4,
    category: 'Carb'
  },
  {
    id: 'food-jasmine-rice',
    name: 'Steamed Jasmine Rice',
    servingSize: '180g cooked',
    calories: 234,
    protein: 4.5,
    carbs: 51,
    fat: 0.6,
    category: 'Carb'
  },
  {
    id: 'food-sweet-potato',
    name: 'Roasted Sweet Potato',
    servingSize: '200g cubed',
    calories: 180,
    protein: 3.2,
    carbs: 41.4,
    fat: 0.3,
    fiber: 6.0,
    category: 'Carb'
  },
  {
    id: 'food-quinoa',
    name: 'Cooked Quinoa',
    servingSize: '150g cooked',
    calories: 180,
    protein: 6.6,
    carbs: 32,
    fat: 2.9,
    fiber: 4.2,
    category: 'Carb'
  },
  {
    id: 'food-avocado',
    name: 'Fresh Avocado',
    servingSize: '100g (half avocado)',
    calories: 160,
    protein: 2.0,
    carbs: 8.5,
    fat: 14.7,
    fiber: 6.7,
    category: 'Fat'
  },
  {
    id: 'food-almonds',
    name: 'Raw Whole Almonds',
    servingSize: '30g (approx 23 nuts)',
    calories: 174,
    protein: 6.4,
    carbs: 6.1,
    fat: 15.0,
    fiber: 3.7,
    category: 'Fat'
  },
  {
    id: 'food-olive-oil',
    name: 'Extra Virgin Olive Oil',
    servingSize: '1 tbsp (14g)',
    calories: 119,
    protein: 0,
    carbs: 0,
    fat: 13.5,
    category: 'Fat'
  },
  {
    id: 'food-peanut-butter',
    name: 'Natural Peanut Butter',
    servingSize: '2 tbsp (32g)',
    calories: 190,
    protein: 8.0,
    carbs: 7.0,
    fat: 16.0,
    fiber: 2.0,
    category: 'Fat'
  },
  {
    id: 'food-banana',
    name: 'Fresh Banana (Medium)',
    servingSize: '1 medium (118g)',
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.3,
    fiber: 3.1,
    category: 'Produce'
  },
  {
    id: 'food-blueberries',
    name: 'Fresh Blueberries',
    servingSize: '100g (3/4 cup)',
    calories: 57,
    protein: 0.7,
    carbs: 14.5,
    fat: 0.3,
    fiber: 2.4,
    category: 'Produce'
  },
  {
    id: 'food-broccoli',
    name: 'Steamed Broccoli Florets',
    servingSize: '150g',
    calories: 52,
    protein: 4.2,
    carbs: 10.2,
    fat: 0.6,
    fiber: 3.9,
    category: 'Produce'
  },
  {
    id: 'food-spinach',
    name: 'Fresh Baby Spinach',
    servingSize: '80g (large bowl)',
    calories: 18,
    protein: 2.3,
    carbs: 2.9,
    fat: 0.3,
    fiber: 1.8,
    category: 'Produce'
  }
];

export const DEFAULT_NUTRITION_TARGETS: NutritionTargets = {
  calorieTarget: 2450,
  proteinGrams: 175,
  carbsGrams: 260,
  fatGrams: 65,
  fiberGrams: 34,
  waterGoalMl: 3200,
  strategy: 'Recomposition'
};

export const INITIAL_TODAY_NUTRITION: DailyNutritionLog = {
  date: new Date().toISOString().split('T')[0],
  waterMl: 2100,
  meals: [
    {
      logId: 'seed-nutri-1',
      id: 'food-rolled-oats',
      name: 'Rolled Whole Oats',
      servingSize: '60g dry',
      calories: 228,
      protein: 8,
      carbs: 40,
      fat: 4.2,
      fiber: 6.4,
      category: 'Carb',
      servings: 1.2,
      mealType: 'Breakfast',
      loggedAtTime: '07:45 AM'
    },
    {
      logId: 'seed-nutri-2',
      id: 'food-whey-protein',
      name: 'Whey Protein Isolate',
      servingSize: '1 scoop (30g)',
      calories: 120,
      protein: 26,
      carbs: 1.5,
      fat: 1.0,
      category: 'Supplement',
      servings: 1,
      mealType: 'Breakfast',
      loggedAtTime: '07:45 AM'
    },
    {
      logId: 'seed-nutri-3',
      id: 'food-blueberries',
      name: 'Fresh Blueberries',
      servingSize: '100g (3/4 cup)',
      calories: 57,
      protein: 0.7,
      carbs: 14.5,
      fat: 0.3,
      fiber: 2.4,
      category: 'Produce',
      servings: 1,
      mealType: 'Breakfast',
      loggedAtTime: '07:45 AM'
    },
    {
      logId: 'seed-nutri-4',
      id: 'food-chicken-breast',
      name: 'Grilled Chicken Breast',
      servingSize: '150g cooked',
      calories: 247,
      protein: 46,
      carbs: 0,
      fat: 5.4,
      category: 'Protein',
      servings: 1.3,
      mealType: 'Lunch',
      loggedAtTime: '12:30 PM'
    },
    {
      logId: 'seed-nutri-5',
      id: 'food-jasmine-rice',
      name: 'Steamed Jasmine Rice',
      servingSize: '180g cooked',
      calories: 234,
      protein: 4.5,
      carbs: 51,
      fat: 0.6,
      category: 'Carb',
      servings: 1.2,
      mealType: 'Lunch',
      loggedAtTime: '12:30 PM'
    },
    {
      logId: 'seed-nutri-6',
      id: 'food-broccoli',
      name: 'Steamed Broccoli Florets',
      servingSize: '150g',
      calories: 52,
      protein: 4.2,
      carbs: 10.2,
      fat: 0.6,
      fiber: 3.9,
      category: 'Produce',
      servings: 1,
      mealType: 'Lunch',
      loggedAtTime: '12:30 PM'
    },
    {
      logId: 'seed-nutri-7',
      id: 'food-olive-oil',
      name: 'Extra Virgin Olive Oil',
      servingSize: '1 tbsp (14g)',
      calories: 119,
      protein: 0,
      carbs: 0,
      fat: 13.5,
      category: 'Fat',
      servings: 1,
      mealType: 'Lunch',
      loggedAtTime: '12:30 PM'
    },
    {
      logId: 'seed-nutri-8',
      id: 'food-greek-yogurt',
      name: '0% Fat Greek Yogurt',
      servingSize: '200g (approx 1 cup)',
      calories: 118,
      protein: 20.6,
      carbs: 7.2,
      fat: 0.4,
      category: 'Protein',
      servings: 1,
      mealType: 'Snacks',
      loggedAtTime: '04:15 PM'
    },
    {
      logId: 'seed-nutri-9',
      id: 'food-banana',
      name: 'Fresh Banana (Medium)',
      servingSize: '1 medium (118g)',
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.3,
      fiber: 3.1,
      category: 'Produce',
      servings: 1,
      mealType: 'Snacks',
      loggedAtTime: '04:15 PM'
    }
  ]
};
