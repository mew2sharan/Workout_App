export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Quads'
  | 'Hamstrings'
  | 'Glutes'
  | 'Calves'
  | 'Core'
  | 'Forearms';

export type EquipmentType =
  | 'Barbell'
  | 'Dumbbell'
  | 'Machine'
  | 'Cable'
  | 'Bodyweight'
  | 'Kettlebell';

export type ExerciseCategory = 'Push' | 'Pull' | 'Legs' | 'Core' | 'Full Body';

export interface Exercise {
  id: string;
  name: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment: EquipmentType;
  category: ExerciseCategory;
  formCues: string[];
  commonMistakes: string[];
  setupTips: string;
  tempoGuidance: string;
  image?: string;
  imageUrl?: string;
}

export type SetType = 'warmup' | 'normal' | 'drop' | 'failure';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  type: SetType;
  reps: number;
  weightKg: number;
  completed: boolean;
  rpe?: number;
  notes?: string;
  isPR?: boolean;
}

export interface ActiveWorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  name: string;
  planId?: string;
  routineId?: string;
  date: string; // ISO date string YYYY-MM-DDTHH:mm:ss
  durationSeconds: number;
  exercises: ActiveWorkoutExercise[];
  totalVolumeKg: number;
  notes?: string;
  energyRating?: number; // 1 to 5
}

export interface RoutineExerciseConfig {
  exerciseId: string;
  targetSets: number;
  targetReps: string;
  targetRpe?: number;
  restSeconds?: number;
}

export interface WorkoutPlanRoutine {
  id: string;
  name: string;
  targetMuscles: MuscleGroup[];
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ...
  exercises: RoutineExerciseConfig[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  weeksDuration: number;
  startDate: string; // YYYY-MM-DD
  routines: WorkoutPlanRoutine[];
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  maxWeightKg: number;
  maxWeightReps: number;
  maxWeightDate: string;
  maxReps: number;
  maxRepsWeightKg: number;
  maxRepsDate: string;
  estimated1RMKg: number;
  estimated1RMDate: string;
  maxVolumeSessionKg: number;
  maxVolumeDate: string;
}

export interface BodyMetricEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  bodyFatPct?: number;
  heightCm: number;
  bmi: number;
  calorieTarget: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  chestCm?: number;
  waistCm?: number;
  armsCm?: number;
  thighsCm?: number;
  notes?: string;
}

export type WeightUnit = 'kg' | 'lbs';

export interface UserSettings {
  unit: WeightUnit;
  defaultRestSeconds: number;
  soundEnabled: boolean;
  userHeightCm: number;
}

// Nutrition Module Types
export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  category: 'Protein' | 'Carb' | 'Fat' | 'Produce' | 'Supplement' | 'General';
}

export interface LoggedMealItem extends FoodItem {
  logId: string;
  servings: number;
  mealType: MealType;
  loggedAtTime: string;
}

export interface DailyNutritionLog {
  date: string; // YYYY-MM-DD
  meals: LoggedMealItem[];
  waterMl: number;
  notes?: string;
}

export interface NutritionTargets {
  calorieTarget: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
  waterGoalMl: number;
  strategy: 'Bulking' | 'Cutting' | 'Maintenance' | 'Recomposition' | 'Custom';
}

// Guided Workout Programs Types
export type ProgramGoal =
  | 'Beginner Strength'
  | 'Fat Loss'
  | 'Hypertrophy Muscle Builder'
  | 'Powerbuilding'
  | 'Marathon Prep';

export interface ProgramExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: string;
  restSeconds: number;
  rpe?: number;
  tempo?: string;
  notes?: string;
}

export interface ProgramWorkoutDay {
  dayNumber: number; // 1 to 7
  title: string;
  dayLabel: string; // "Day 1 - Push Hypertrophy" or "Rest & Active Recovery"
  focus: string;
  estimatedDurationMin: number;
  isRestDay: boolean;
  exercises: ProgramExercise[];
  cardioGuidance?: string;
  coachingTips: string[];
}

export interface ProgramWeek {
  weekNumber: number;
  phaseTitle: string;
  focusSummary: string;
  days: ProgramWorkoutDay[];
}

export interface GuidedProgram {
  id: string;
  title: string;
  goal: ProgramGoal;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  durationWeeks: number;
  daysPerWeek: number;
  description: string;
  overview: string[];
  keyBenefits: string[];
  imageUrl: string;
  weeks: ProgramWeek[];
}

export interface EnrolledProgramProgress {
  programId: string;
  enrolledDate: string; // YYYY-MM-DD
  completedWorkouts: {
    [workoutKey: string]: {
      date: string;
      sessionVolumeKg?: number;
      durationMinutes?: number;
    };
  }; // workoutKey: `w${weekNum}_d${dayNum}`
}

export type OutsideActivityType = 
  | 'None'
  | 'Running'
  | 'Cycling'
  | 'Swimming'
  | 'Recreational Sports'
  | 'Martial Arts'
  | 'High-Step Walking'
  | 'Physical Labor';

export interface OutsideActivityConfig {
  type: OutsideActivityType;
  sessionsPerWeek: number;
  intensity: 'Low' | 'Moderate' | 'High';
  estimatedKcalBurnPerSession: number;
}

export interface UserProgramPreferences {
  daysPerWeek: number; // 2, 3, 4, 5, 6
  outsideActivity: OutsideActivityConfig;
}

