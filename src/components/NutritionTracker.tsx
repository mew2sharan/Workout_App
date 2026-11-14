import React, { useState, useMemo, useEffect } from 'react';
import { 
  DailyNutritionLog, 
  NutritionTargets, 
  LoggedMealItem, 
  MealType, 
  FoodItem, 
  BodyMetricEntry,
  WeightUnit
} from '../types/workout';
import { COMMON_FOOD_DATABASE } from '../data/nutritionData';
import { INITIAL_NUTRITION_HISTORY } from '../data/nutritionHistory';
import { calculateMacrosFromCalories, NutritionGoalStrategy } from '../utils/nutritionCalculations';
import { NutritionAnalytics } from './NutritionAnalytics';
import { 
  Utensils, 
  Plus, 
  Trash2, 
  Target, 
  Droplet, 
  Flame, 
  Search, 
  Sliders, 
  Sparkles,
  Info,
  Wheat,
  RotateCcw,
  Zap,
  Lock,
  Unlock,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface NutritionTrackerProps {
  nutritionLog: DailyNutritionLog;
  targets: NutritionTargets;
  nutritionHistory?: DailyNutritionLog[];
  bodyMetrics?: BodyMetricEntry[];
  latestBodyMetric?: BodyMetricEntry;
  unit?: WeightUnit;
  onUpdateNutritionLog: (log: DailyNutritionLog) => void;
  onUpdateTargets: (targets: NutritionTargets) => void;
  onOpenBodyMetrics?: () => void;
}

export const NutritionTracker: React.FC<NutritionTrackerProps> = ({
  nutritionLog,
  targets,
  nutritionHistory,
  bodyMetrics = [],
  latestBodyMetric,
  unit = 'kg',
  onUpdateNutritionLog,
  onUpdateTargets,
  onOpenBodyMetrics
}) => {
  const [nutritionSubTab, setNutritionSubTab] = useState<'logger' | 'analytics'>('logger');
  const [activeMealType, setActiveMealType] = useState<MealType>('Breakfast');
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [searchFoodQuery, setSearchFoodQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'database' | 'custom'>('database');

  // Custom food state
  const [customName, setCustomName] = useState('');
  const [customServing, setCustomServing] = useState('1 serving (100g)');
  const [customCalories, setCustomCalories] = useState(200);
  const [customProtein, setCustomProtein] = useState(20);
  const [customCarbs, setCustomCarbs] = useState(25);
  const [customFat, setCustomFat] = useState(5);
  const [customFiber, setCustomFiber] = useState(3);
  const [customServings, setCustomServings] = useState(1);

  // Targets editor state
  const [editCalorie, setEditCalorie] = useState(targets.calorieTarget);
  const [editProtein, setEditProtein] = useState(targets.proteinGrams);
  const [editCarbs, setEditCarbs] = useState(targets.carbsGrams);
  const [editFat, setEditFat] = useState(targets.fatGrams);
  const [editFiber, setEditFiber] = useState(targets.fiberGrams || 34);
  const [editWater, setEditWater] = useState(targets.waterGoalMl);
  const [editStrategy, setEditStrategy] = useState<NutritionGoalStrategy>(targets.strategy);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(true);

  // Synchronize when targets prop updates
  useEffect(() => {
    setEditCalorie(targets.calorieTarget);
    setEditProtein(targets.proteinGrams);
    setEditCarbs(targets.carbsGrams);
    setEditFat(targets.fatGrams);
    setEditFiber(targets.fiberGrams || 34);
    setEditWater(targets.waterGoalMl);
    setEditStrategy(targets.strategy);
  }, [targets]);

  // Totals calculations
  const totals = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let fiber = 0;

    nutritionLog.meals.forEach((item) => {
      calories += item.calories * item.servings;
      protein += item.protein * item.servings;
      carbs += item.carbs * item.servings;
      fat += item.fat * item.servings;
      fiber += (item.fiber || 0) * item.servings;
    });

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      fiber: Math.round(fiber * 10) / 10
    };
  }, [nutritionLog.meals]);

  const fiberTarget = targets.fiberGrams || 34;
  const caloriesRemaining = targets.calorieTarget - totals.calories;
  const calPercent = Math.min(100, Math.round((totals.calories / targets.calorieTarget) * 100));
  const proteinPercent = Math.min(100, Math.round((totals.protein / targets.proteinGrams) * 100));
  const carbsPercent = Math.min(100, Math.round((totals.carbs / targets.carbsGrams) * 100));
  const fatPercent = Math.min(100, Math.round((totals.fat / targets.fatGrams) * 100));
  const fiberPercent = Math.min(100, Math.round((totals.fiber / fiberTarget) * 100));
  const waterPercent = Math.min(100, Math.round((nutritionLog.waterMl / targets.waterGoalMl) * 100));

  const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  /**
   * Automatic macro partitioner:
   * When calories or goal changes, automatically updates protein, carbs, fiber, and water targets.
   */
  const handleCalorieChange = (newCalories: number, strategy = editStrategy) => {
    setEditCalorie(newCalories);
    if (autoSyncEnabled) {
      const computed = calculateMacrosFromCalories(newCalories, strategy);
      setEditProtein(computed.proteinGrams);
      setEditCarbs(computed.carbsGrams);
      setEditFat(computed.fatGrams);
      setEditFiber(computed.fiberGrams);
      setEditWater(computed.waterGoalMl);
    }
  };

  const handleStrategyChange = (newStrategy: NutritionGoalStrategy) => {
    setEditStrategy(newStrategy);
    const computed = calculateMacrosFromCalories(editCalorie, newStrategy);
    setEditProtein(computed.proteinGrams);
    setEditCarbs(computed.carbsGrams);
    setEditFat(computed.fatGrams);
    setEditFiber(computed.fiberGrams);
    setEditWater(computed.waterGoalMl);
  };

  const handleQuickAdjustCalories = (delta: number) => {
    const newCal = Math.max(1200, targets.calorieTarget + delta);
    const computed = calculateMacrosFromCalories(newCal, targets.strategy);
    onUpdateTargets({
      ...targets,
      calorieTarget: newCal,
      proteinGrams: computed.proteinGrams,
      carbsGrams: computed.carbsGrams,
      fatGrams: computed.fatGrams,
      fiberGrams: computed.fiberGrams,
      waterGoalMl: computed.waterGoalMl
    });
  };

  const handleAddFoodItem = (food: FoodItem, servingsMultiplier: number = 1) => {
    const newItem: LoggedMealItem = {
      ...food,
      logId: `meal-${Date.now()}-${Math.random()}`,
      servings: servingsMultiplier,
      mealType: activeMealType,
      loggedAtTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onUpdateNutritionLog({
      ...nutritionLog,
      meals: [...nutritionLog.meals, newItem]
    });
    setShowAddFoodModal(false);
  };

  const handleAddCustomFood = () => {
    if (!customName.trim()) return;
    const customFood: FoodItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      servingSize: customServing,
      calories: Number(customCalories) || 0,
      protein: Number(customProtein) || 0,
      carbs: Number(customCarbs) || 0,
      fat: Number(customFat) || 0,
      fiber: Number(customFiber) || 0,
      category: 'General'
    };
    handleAddFoodItem(customFood, customServings);
    setCustomName('');
  };

  const handleDeleteMealItem = (logId: string) => {
    onUpdateNutritionLog({
      ...nutritionLog,
      meals: nutritionLog.meals.filter((m) => m.logId !== logId)
    });
  };

  const handleAddWater = (deltaMl: number) => {
    const newWater = Math.max(0, nutritionLog.waterMl + deltaMl);
    onUpdateNutritionLog({
      ...nutritionLog,
      waterMl: newWater
    });
  };

  const handleSaveTargets = () => {
    onUpdateTargets({
      calorieTarget: Number(editCalorie),
      proteinGrams: Number(editProtein),
      carbsGrams: Number(editCarbs),
      fatGrams: Number(editFat),
      fiberGrams: Number(editFiber),
      waterGoalMl: Number(editWater),
      strategy: editStrategy
    });
    setShowTargetModal(false);
  };

  const filteredFoods = COMMON_FOOD_DATABASE.filter((f) =>
    f.name.toLowerCase().includes(searchFoodQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchFoodQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Switcher: Daily Logger vs Over-Time Analytics */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
          <button
            onClick={() => setNutritionSubTab('logger')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              nutritionSubTab === 'logger'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Today's Meal Logger</span>
          </button>
          <button
            onClick={() => setNutritionSubTab('analytics')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              nutritionSubTab === 'analytics'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Over-Time Trends &amp; Macro Plots</span>
            <span className="text-[10px] bg-orange-950 text-orange-400 border border-orange-500/30 px-1.5 py-0.2 rounded font-mono">
              New
            </span>
          </button>
        </div>

        {/* Global Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Calorie Nudge (+/- 100 kcal) */}
          <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 p-1 text-xs">
            <button
              onClick={() => handleQuickAdjustCalories(-100)}
              className="px-2.5 py-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors font-mono"
              title="-100 kcal (auto-adjusts macros)"
            >
              -100
            </button>
            <span className="px-2 text-white font-mono font-bold">
              {targets.calorieTarget} kcal
            </span>
            <button
              onClick={() => handleQuickAdjustCalories(100)}
              className="px-2.5 py-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors font-mono"
              title="+100 kcal (auto-adjusts macros)"
            >
              +100
            </button>
          </div>

          <button
            onClick={() => {
              setEditCalorie(targets.calorieTarget);
              setEditProtein(targets.proteinGrams);
              setEditCarbs(targets.carbsGrams);
              setEditFat(targets.fatGrams);
              setEditFiber(targets.fiberGrams || 34);
              setEditWater(targets.waterGoalMl);
              setEditStrategy(targets.strategy);
              setShowTargetModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl border border-slate-800 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-orange-400" />
            <span>Configure Targets</span>
          </button>
        </div>
      </div>

      {nutritionSubTab === 'analytics' ? (
        <NutritionAnalytics
          history={nutritionHistory || INITIAL_NUTRITION_HISTORY}
          todayLog={nutritionLog}
          targets={targets}
          bodyMetrics={bodyMetrics}
          unit={unit}
        />
      ) : (
        <>
          {/* Nutrition Hero & Daily Macro Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                    Daily Nutrition &amp; Macro Energy
                  </span>
                  <span>·</span>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    Strategy: {targets.strategy}
                  </span>
                  <span>·</span>
                  <span className="text-[11px] text-slate-400">
                    Auto-synced to {targets.calorieTarget} kcal
                  </span>
                </div>
                <h2 className="font-athletic text-2xl font-bold tracking-wide text-white uppercase mt-0.5 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-orange-500" />
                  <span>Caloric Budget &amp; Macro Distribution</span>
                </h2>
              </div>

          <div className="flex items-center gap-2">
            {/* Quick Calorie Nudge (+/- 100 kcal) */}
            <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-1 text-xs">
              <button
                onClick={() => handleQuickAdjustCalories(-100)}
                className="px-2.5 py-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors font-mono"
                title="-100 kcal (auto-adjusts macros)"
              >
                -100
              </button>
              <span className="px-2 text-white font-mono font-bold">
                {targets.calorieTarget} kcal
              </span>
              <button
                onClick={() => handleQuickAdjustCalories(100)}
                className="px-2.5 py-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors font-mono"
                title="+100 kcal (auto-adjusts macros)"
              >
                +100
              </button>
            </div>

            <button
              onClick={() => {
                setEditCalorie(targets.calorieTarget);
                setEditProtein(targets.proteinGrams);
                setEditCarbs(targets.carbsGrams);
                setEditFat(targets.fatGrams);
                setEditFiber(targets.fiberGrams || 34);
                setEditWater(targets.waterGoalMl);
                setEditStrategy(targets.strategy);
                setShowTargetModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-orange-400" />
              <span>Configure Targets</span>
            </button>
          </div>
        </div>

        {/* Holistic Correlation with Body Metrics */}
        {latestBodyMetric && (
          <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="p-1 rounded-md bg-orange-500/20 text-orange-400">
                <Target className="w-4 h-4" />
              </span>
              <span>
                Current Body Weight: <strong className="text-white font-mono">{latestBodyMetric.weightKg} kg</strong> (BMI {latestBodyMetric.bmi}, Body Fat {latestBodyMetric.bodyFatPct || 14.7}%)
              </span>
            </div>
            <div className="text-slate-400 text-[11px] flex items-center gap-2">
              <span>
                Target Protein: <strong className="text-emerald-400 font-mono">{targets.proteinGrams}g</strong> ({Math.round((targets.proteinGrams / latestBodyMetric.weightKg) * 10) / 10}g/kg bodyweight)
              </span>
              <span>·</span>
              <span>
                Hydration: <strong className="text-blue-400 font-mono">{targets.waterGoalMl} ml</strong>
              </span>
            </div>
          </div>
        )}

        {/* 5 Macro & Fiber Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-5">
          {/* Calories */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Calories</span>
              <Flame className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <div className="font-mono-numbers text-xl font-extrabold text-white mt-1">
              {totals.calories}
              <span className="text-xs text-slate-500 font-normal ml-1">/ {targets.calorieTarget}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-300"
                style={{ width: `${calPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1.5 flex justify-between">
              <span>{calPercent}%</span>
              <span className={caloriesRemaining >= 0 ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                {caloriesRemaining >= 0 ? `${caloriesRemaining} left` : `+${Math.abs(caloriesRemaining)} over`}
              </span>
            </div>
          </div>

          {/* Protein */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Protein</span>
              <span className="text-[10px] text-emerald-400 font-bold">4 kcal/g</span>
            </div>
            <div className="font-mono-numbers text-xl font-extrabold text-emerald-400 mt-1">
              {totals.protein}g
              <span className="text-xs text-slate-500 font-normal ml-1">/ {targets.proteinGrams}g</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${proteinPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1.5 flex justify-between">
              <span>{proteinPercent}%</span>
              <span>{Math.max(0, targets.proteinGrams - totals.protein)}g left</span>
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Carbs</span>
              <span className="text-[10px] text-amber-400 font-bold">4 kcal/g</span>
            </div>
            <div className="font-mono-numbers text-xl font-extrabold text-amber-400 mt-1">
              {totals.carbs}g
              <span className="text-xs text-slate-500 font-normal ml-1">/ {targets.carbsGrams}g</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${carbsPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1.5 flex justify-between">
              <span>{carbsPercent}%</span>
              <span>{Math.max(0, targets.carbsGrams - totals.carbs)}g left</span>
            </div>
          </div>

          {/* Fats */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Fats</span>
              <span className="text-[10px] text-blue-400 font-bold">9 kcal/g</span>
            </div>
            <div className="font-mono-numbers text-xl font-extrabold text-blue-400 mt-1">
              {totals.fat}g
              <span className="text-xs text-slate-500 font-normal ml-1">/ {targets.fatGrams}g</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${fatPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1.5 flex justify-between">
              <span>{fatPercent}%</span>
              <span>{Math.max(0, targets.fatGrams - totals.fat)}g left</span>
            </div>
          </div>

          {/* Dietary Fiber */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1">
                <Wheat className="w-3.5 h-3.5 text-teal-400" />
                <span>Fiber</span>
              </span>
              <span className="text-[10px] text-teal-400 font-bold">14g/1000k</span>
            </div>
            <div className="font-mono-numbers text-xl font-extrabold text-teal-400 mt-1">
              {totals.fiber}g
              <span className="text-xs text-slate-500 font-normal ml-1">/ {fiberTarget}g</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="h-full bg-teal-500 transition-all duration-300"
                style={{ width: `${fiberPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1.5 flex justify-between">
              <span>{fiberPercent}%</span>
              <span>{Math.max(0, Math.round((fiberTarget - totals.fiber) * 10) / 10)}g left</span>
            </div>
          </div>
        </div>

        {/* Water Hydration Quick Tracker */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Hydration Tracker
              </div>
              <div className="text-xs text-slate-400">
                <span className="font-mono font-bold text-blue-400">{nutritionLog.waterMl} ml</span> / {targets.waterGoalMl} ml target ({waterPercent}%)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleAddWater(250)}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-blue-300 border border-slate-800 rounded-lg transition-colors"
            >
              +250 ml (Glass)
            </button>
            <button
              onClick={() => handleAddWater(500)}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-blue-300 border border-slate-800 rounded-lg transition-colors"
            >
              +500 ml (Bottle)
            </button>
            <button
              onClick={() => handleAddWater(-250)}
              className="px-2.5 py-1 text-xs text-slate-500 hover:text-white bg-slate-950 rounded-lg transition-colors"
            >
              -250 ml
            </button>
          </div>
        </div>
      </div>

      {/* Meals Sections: Breakfast, Lunch, Dinner, Snacks */}
      <div className="space-y-4">
        {mealTypes.map((mealType) => {
          const mealItems = nutritionLog.meals.filter((m) => m.mealType === mealType);
          const mealCalories = mealItems.reduce((sum, item) => sum + item.calories * item.servings, 0);
          const mealProtein = mealItems.reduce((sum, item) => sum + item.protein * item.servings, 0);
          const mealCarbs = mealItems.reduce((sum, item) => sum + item.carbs * item.servings, 0);
          const mealFat = mealItems.reduce((sum, item) => sum + item.fat * item.servings, 0);
          const mealFiber = mealItems.reduce((sum, item) => sum + (item.fiber || 0) * item.servings, 0);

          return (
            <div
              key={mealType}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <h3 className="font-athletic text-xl font-bold tracking-wide text-white uppercase">
                    {mealType}
                  </h3>
                  <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/30">
                    {Math.round(mealCalories)} kcal
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-400">
                    <span>P: <strong className="text-emerald-400">{Math.round(mealProtein)}g</strong></span>
                    <span>·</span>
                    <span>C: <strong className="text-amber-400">{Math.round(mealCarbs)}g</strong></span>
                    <span>·</span>
                    <span>F: <strong className="text-blue-400">{Math.round(mealFat)}g</strong></span>
                    {mealFiber > 0 && (
                      <>
                        <span>·</span>
                        <span>Fiber: <strong className="text-teal-400">{Math.round(mealFiber * 10) / 10}g</strong></span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setActiveMealType(mealType);
                      setShowAddFoodModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-transform active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Food</span>
                  </button>
                </div>
              </div>

              {/* Logged Food Rows */}
              {mealItems.length > 0 ? (
                <div className="mt-3 divide-y divide-slate-800/40">
                  {mealItems.map((item) => (
                    <div
                      key={item.logId}
                      className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-800/30 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{item.name}</span>
                          <span className="text-[10px] text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                            {item.servings}x ({item.servingSize})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2 font-mono">
                          <span className="text-emerald-400">{Math.round(item.protein * item.servings)}g Protein</span>
                          <span>·</span>
                          <span className="text-amber-400">{Math.round(item.carbs * item.servings)}g Carbs</span>
                          <span>·</span>
                          <span className="text-blue-400">{Math.round(item.fat * item.servings)}g Fat</span>
                          {item.fiber !== undefined && (
                            <>
                              <span>·</span>
                              <span className="text-teal-400">{Math.round(item.fiber * item.servings * 10) / 10}g Fiber</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono-numbers font-bold text-white text-xs">
                          {Math.round(item.calories * item.servings)} kcal
                        </span>
                        <button
                          onClick={() => handleDeleteMealItem(item.logId)}
                          className="text-slate-600 hover:text-red-400 p-1 rounded transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-500">
                  No foods logged yet for {mealType}. Tap "+ Add Food" to search or create an entry.
                </div>
              )}
            </div>
          );
        })}
      </div>
      </>
      )}

      {/* Add Food Modal */}
      {showAddFoodModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-athletic text-2xl font-bold tracking-wide text-white uppercase">
                  Add Food to {activeMealType}
                </h3>
                <p className="text-xs text-slate-400">Search database or record custom meal macros.</p>
              </div>
              <button
                onClick={() => setShowAddFoodModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Sub-tabs: Database vs Custom */}
            <div className="px-5 pt-3 pb-2 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2">
              <button
                onClick={() => setActiveTab('database')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'database'
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Food Database
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'custom'
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Custom Food / Quick Macro Entry
              </button>
            </div>

            {activeTab === 'database' ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-800">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search chicken, oats, rice, eggs, protein..."
                      value={searchFoodQuery}
                      onChange={(e) => setSearchFoodQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-800/40">
                  {filteredFoods.map((food) => (
                    <div
                      key={food.id}
                      className="pt-2 flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/50 transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{food.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {food.servingSize} · <strong className="text-orange-400">{food.calories} kcal</strong>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          P: {food.protein}g · C: {food.carbs}g · F: {food.fat}g {food.fiber ? `· Fiber: ${food.fiber}g` : ''}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddFoodItem(food, 1)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Log 1x</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-5 space-y-4 overflow-y-auto">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Food Name / Meal Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Post-Workout Shake or Steak & Sweet Potato"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                      Serving Size Label
                    </label>
                    <input
                      type="text"
                      value={customServing}
                      onChange={(e) => setCustomServing(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                      Servings Logged
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={customServings}
                      onChange={(e) => setCustomServings(parseFloat(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-orange-400 block mb-1">
                      Calories
                    </label>
                    <input
                      type="number"
                      value={customCalories}
                      onChange={(e) => setCustomCalories(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-emerald-400 block mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      value={customProtein}
                      onChange={(e) => setCustomProtein(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-amber-400 block mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      value={customCarbs}
                      onChange={(e) => setCustomCarbs(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-blue-400 block mb-1">
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      value={customFat}
                      onChange={(e) => setCustomFat(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleAddCustomFood}
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-orange-950"
                  >
                    Add Custom Food
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Adjust Targets Modal with Automatic Macro Partitioning */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-orange-400">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Dynamic Macro Engine</span>
                </div>
                <h3 className="font-athletic text-2xl font-bold tracking-wide text-white uppercase mt-0.5">
                  Calorie &amp; Macro Targets
                </h3>
                <p className="text-xs text-slate-400">
                  Changing calories automatically computes protein, carbs, fats, fiber, and hydration based on your goal.
                </p>
              </div>
              <button
                onClick={() => setShowTargetModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Goal Strategy Selection */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                1. Select Program Goal &amp; Strategy
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Cutting', 'Recomposition', 'Bulking'] as const).map((strat) => (
                  <button
                    key={strat}
                    type="button"
                    onClick={() => handleStrategyChange(strat)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all text-center ${
                      editStrategy === strat
                        ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-950'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {strat}
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-slate-500 mt-1.5 italic">
                {editStrategy === 'Cutting' && 'Fat loss focus: 33% high protein to preserve muscle, 25% fats, 42% carbs.'}
                {editStrategy === 'Bulking' && 'Muscle building focus: 26% protein, 50% high carbs for glycogen, 24% fats.'}
                {editStrategy === 'Recomposition' && 'Athletic balance: 29% protein, 45% carbs, 26% healthy fats.'}
              </div>
            </div>

            {/* Calorie Target with Real-Time Auto-Partitioning */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-white">
                  2. Daily Calorie Target (kcal)
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCalorieChange(Math.max(1200, editCalorie - 100))}
                    className="px-2 py-0.5 text-xs font-mono bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded text-slate-300"
                  >
                    -100
                  </button>
                  <button
                    onClick={() => handleCalorieChange(editCalorie + 100)}
                    className="px-2 py-0.5 text-xs font-mono bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded text-slate-300"
                  >
                    +100
                  </button>
                </div>
              </div>

              <input
                type="number"
                step="25"
                min="1200"
                max="5500"
                value={editCalorie}
                onChange={(e) => handleCalorieChange(parseInt(e.target.value) || 2000)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-base text-white font-mono font-bold focus:outline-none focus:border-orange-500"
              />

              <input
                type="range"
                min="1400"
                max="4200"
                step="50"
                value={editCalorie}
                onChange={(e) => handleCalorieChange(parseInt(e.target.value) || 2000)}
                className="w-full accent-orange-500 cursor-pointer"
              />

              {/* Real-time auto-calculation banner */}
              <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                <span className="flex items-center gap-1 text-orange-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-calculating macros &amp; water
                </span>
                <button
                  type="button"
                  onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
                  className="flex items-center gap-1 text-slate-400 hover:text-white"
                  title="Toggle lock to customize grams manually"
                >
                  {autoSyncEnabled ? (
                    <>
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px]">Synced to Goal</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3 text-amber-400" />
                      <span className="text-[10px]">Manual Edit</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Auto-Calculated Macro, Fiber & Hydration Outputs */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                3. Calculated Macronutrients &amp; Hydration
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 block">
                    Protein
                  </span>
                  <input
                    type="number"
                    disabled={autoSyncEnabled}
                    value={editProtein}
                    onChange={(e) => setEditProtein(parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent text-center text-sm font-mono font-bold text-white mt-0.5 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">grams</span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold uppercase text-amber-400 block">
                    Carbs
                  </span>
                  <input
                    type="number"
                    disabled={autoSyncEnabled}
                    value={editCarbs}
                    onChange={(e) => setEditCarbs(parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent text-center text-sm font-mono font-bold text-white mt-0.5 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">grams</span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold uppercase text-blue-400 block">
                    Fat
                  </span>
                  <input
                    type="number"
                    disabled={autoSyncEnabled}
                    value={editFat}
                    onChange={(e) => setEditFat(parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent text-center text-sm font-mono font-bold text-white mt-0.5 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">grams</span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold uppercase text-teal-400 block">
                    Fiber
                  </span>
                  <input
                    type="number"
                    disabled={autoSyncEnabled}
                    value={editFiber}
                    onChange={(e) => setEditFiber(parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent text-center text-sm font-mono font-bold text-white mt-0.5 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">grams</span>
                </div>
              </div>

              {/* Water Target Output */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Daily Hydration Target</div>
                    <div className="text-[10px] text-slate-400">Indexed to caloric intake &amp; sweat compensation</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-blue-400">{editWater} ml</span>
                  <span className="text-[10px] text-slate-500 block">({Math.round((editWater / 250) * 10) / 10} glasses)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowTargetModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTargets}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-950"
              >
                Save Nutrition Targets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
