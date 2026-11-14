import { DailyNutritionLog, LoggedMealItem } from '../types/workout';

// Helper to format date offset
const getDateString = (daysAgo: number): string => {
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return d.toISOString().split('T')[0];
};

// Generate 30 days of realistic nutrition history aligned with user's recomposition goal
export const generateSeedNutritionHistory = (): DailyNutritionLog[] => {
  const history: DailyNutritionLog[] = [];
  
  // Base daily template with natural variations
  const sampleDays = [
    { cal: 2480, p: 182, c: 255, f: 64, fib: 36, water: 3400, notes: 'Felt fueled for heavy squat session.' },
    { cal: 2420, p: 178, c: 245, f: 63, fib: 32, water: 3100, notes: 'Clean recovery day nutrition.' },
    { cal: 2510, p: 185, c: 260, f: 66, fib: 38, water: 3500, notes: 'Post-deadlift refeed with sweet potato.' },
    { cal: 2390, p: 175, c: 240, f: 62, fib: 30, water: 2900, notes: 'Rest day slight deficit.' },
    { cal: 2460, p: 180, c: 252, f: 65, fib: 35, water: 3300, notes: 'Upper power session: hit protein target early.' },
    { cal: 2620, p: 172, c: 285, f: 72, fib: 31, water: 3200, notes: 'Social dinner weekend - extra carbs and rice.' },
    { cal: 2350, p: 184, c: 230, f: 60, fib: 33, water: 3000, notes: 'Sunday meal prep day, hit high protein.' }
  ];

  for (let i = 29; i >= 1; i--) {
    const template = sampleDays[i % sampleDays.length];
    // Add small realistic noise (+/- 25 kcal, +/- 4g macros)
    const noise = ((i * 17) % 31) - 15;
    const cal = template.cal + noise;
    const p = template.p + Math.round(noise / 20);
    const c = template.c + Math.round(noise / 10);
    const f = template.f + Math.round(noise / 30);
    const fib = template.fib + Math.round(noise / 40);
    const water = template.water + (noise * 15);

    const dateStr = getDateString(i);

    const meals: LoggedMealItem[] = [
      {
        logId: `hist-${i}-m1`,
        id: 'food-rolled-oats',
        name: 'Rolled Whole Oats with Whey & Berries',
        servingSize: '1 bowl',
        calories: Math.round(cal * 0.25),
        protein: Math.round(p * 0.25),
        carbs: Math.round(c * 0.35),
        fat: Math.round(f * 0.2),
        fiber: Math.round(fib * 0.3),
        category: 'Carb',
        servings: 1,
        mealType: 'Breakfast',
        loggedAtTime: '08:00 AM'
      },
      {
        logId: `hist-${i}-m2`,
        id: 'food-chicken-breast',
        name: 'Grilled Chicken, Jasmine Rice & Greens',
        servingSize: '1 plate',
        calories: Math.round(cal * 0.35),
        protein: Math.round(p * 0.40),
        carbs: Math.round(c * 0.35),
        fat: Math.round(f * 0.3),
        fiber: Math.round(fib * 0.35),
        category: 'Protein',
        servings: 1,
        mealType: 'Lunch',
        loggedAtTime: '12:45 PM'
      },
      {
        logId: `hist-${i}-m3`,
        id: 'food-greek-yogurt',
        name: 'Greek Yogurt & Almond Snack',
        servingSize: '1 cup',
        calories: Math.round(cal * 0.15),
        protein: Math.round(p * 0.15),
        carbs: Math.round(c * 0.10),
        fat: Math.round(f * 0.25),
        fiber: Math.round(fib * 0.15),
        category: 'Produce',
        servings: 1,
        mealType: 'Snacks',
        loggedAtTime: '04:30 PM'
      },
      {
        logId: `hist-${i}-m4`,
        id: 'food-salmon-fillet',
        name: 'Baked Salmon, Sweet Potato & Asparagus',
        servingSize: '1 plate',
        calories: Math.round(cal * 0.25),
        protein: Math.round(p * 0.20),
        carbs: Math.round(c * 0.20),
        fat: Math.round(f * 0.25),
        fiber: Math.round(fib * 0.2),
        category: 'Protein',
        servings: 1,
        mealType: 'Dinner',
        loggedAtTime: '07:30 PM'
      }
    ];

    history.push({
      date: dateStr,
      waterMl: water,
      notes: template.notes,
      meals
    });
  }

  return history;
};

export const INITIAL_NUTRITION_HISTORY: DailyNutritionLog[] = generateSeedNutritionHistory();
