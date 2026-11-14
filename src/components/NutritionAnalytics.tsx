import React, { useState, useMemo } from 'react';
import { DailyNutritionLog, NutritionTargets, BodyMetricEntry, WeightUnit } from '../types/workout';
import { 
  TrendingUp, 
  Target, 
  Flame, 
  Droplet, 
  Wheat, 
  Award, 
  Calendar, 
  ChevronRight, 
  Info,
  Scale,
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface NutritionAnalyticsProps {
  history: DailyNutritionLog[];
  todayLog: DailyNutritionLog;
  targets: NutritionTargets;
  bodyMetrics: BodyMetricEntry[];
  unit: WeightUnit;
}

export const NutritionAnalytics: React.FC<NutritionAnalyticsProps> = ({
  history,
  todayLog,
  targets,
  bodyMetrics,
  unit
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('14d');
  const [macroDisplayMode, setMacroDisplayMode] = useState<'grams' | 'calories'>('grams');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  // Combine history and today's log into sorted chronological array
  const fullHistory = useMemo(() => {
    const list = [...history];
    // Check if today is already in history, if not append
    const todayIndex = list.findIndex((item) => item.date === todayLog.date);
    if (todayIndex >= 0) {
      list[todayIndex] = todayLog;
    } else {
      list.push(todayLog);
    }
    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [history, todayLog]);

  // Filter based on selected time range
  const daysToShow = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
  const filteredData = useMemo(() => {
    return fullHistory.slice(-daysToShow);
  }, [fullHistory, daysToShow]);

  // Aggregate stats per day
  const dailyStats = useMemo(() => {
    return filteredData.map((day) => {
      let cal = 0;
      let p = 0;
      let c = 0;
      let f = 0;
      let fib = 0;

      day.meals.forEach((m) => {
        cal += m.calories * m.servings;
        p += m.protein * m.servings;
        c += m.carbs * m.servings;
        f += m.fat * m.servings;
        fib += (m.fiber || 0) * m.servings;
      });

      const calDiff = Math.round(cal - targets.calorieTarget);
      const isCompliant = Math.abs(calDiff) <= 150; // Within +/- 150 kcal

      return {
        date: day.date,
        calories: Math.round(cal),
        protein: Math.round(p),
        carbs: Math.round(c),
        fat: Math.round(f),
        fiber: Math.round(fib),
        waterMl: day.waterMl || 0,
        notes: day.notes,
        mealsCount: day.meals.length,
        calDiff,
        isCompliant
      };
    });
  }, [filteredData, targets]);

  // Overall KPIs
  const summaryKPIs = useMemo(() => {
    if (dailyStats.length === 0) return null;

    const totalCal = dailyStats.reduce((sum, d) => sum + d.calories, 0);
    const avgCal = Math.round(totalCal / dailyStats.length);
    const totalP = dailyStats.reduce((sum, d) => sum + d.protein, 0);
    const avgP = Math.round(totalP / dailyStats.length);
    const totalC = dailyStats.reduce((sum, d) => sum + d.carbs, 0);
    const avgC = Math.round(totalC / dailyStats.length);
    const totalF = dailyStats.reduce((sum, d) => sum + d.fat, 0);
    const avgF = Math.round(totalF / dailyStats.length);
    const totalFib = dailyStats.reduce((sum, d) => sum + d.fiber, 0);
    const avgFib = Math.round(totalFib / dailyStats.length);
    const totalWater = dailyStats.reduce((sum, d) => sum + d.waterMl, 0);
    const avgWater = Math.round(totalWater / dailyStats.length);

    const compliantDays = dailyStats.filter((d) => d.isCompliant).length;
    const adherenceRate = Math.round((compliantDays / dailyStats.length) * 100);

    const netCalorieDelta = totalCal - targets.calorieTarget * dailyStats.length;
    // Approx 7700 kcal per kg of fat tissue
    const estimatedFatWeightDeltaKg = (netCalorieDelta / 7700).toFixed(2);

    return {
      avgCal,
      avgP,
      avgC,
      avgF,
      avgFib,
      avgWater,
      adherenceRate,
      netCalorieDelta,
      estimatedFatWeightDeltaKg
    };
  }, [dailyStats, targets]);

  // Active hover/selected point
  const selectedDay = selectedDayIndex !== null && dailyStats[selectedDayIndex] 
    ? dailyStats[selectedDayIndex] 
    : dailyStats[dailyStats.length - 1];

  // SVG dimensions for Calorie Chart
  const svgWidth = 700;
  const svgHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartInnerWidth = svgWidth - paddingLeft - paddingRight;
  const chartInnerHeight = svgHeight - paddingTop - paddingBottom;

  const maxCal = Math.max(
    ...dailyStats.map((d) => d.calories),
    targets.calorieTarget + 300,
    3000
  );
  const minCal = Math.min(
    ...dailyStats.map((d) => d.calories),
    targets.calorieTarget - 300,
    1500
  );

  const getCalY = (cal: number) => {
    const clamped = Math.max(minCal, Math.min(maxCal, cal));
    return paddingTop + chartInnerHeight - ((clamped - minCal) / (maxCal - minCal)) * chartInnerHeight;
  };

  const getDayX = (index: number) => {
    if (dailyStats.length <= 1) return paddingLeft + chartInnerWidth / 2;
    return paddingLeft + (index / (dailyStats.length - 1)) * chartInnerWidth;
  };

  // Target line Y coordinate
  const targetY = getCalY(targets.calorieTarget);

  // SVG dimensions for Macronutrient Multi-Series Chart
  const macroMax = Math.max(
    ...dailyStats.map((d) => 
      macroDisplayMode === 'grams' 
        ? Math.max(d.protein, d.carbs, d.fat)
        : Math.max(d.protein * 4, d.carbs * 4, d.fat * 9)
    ),
    macroDisplayMode === 'grams' ? 300 : 1200
  );

  const getMacroY = (val: number) => {
    return paddingTop + chartInnerHeight - (val / macroMax) * chartInnerHeight;
  };

  // Protein polyline
  const proteinPoints = dailyStats
    .map((d, i) => {
      const val = macroDisplayMode === 'grams' ? d.protein : d.protein * 4;
      return `${getDayX(i)},${getMacroY(val)}`;
    })
    .join(' ');

  // Carbs polyline
  const carbsPoints = dailyStats
    .map((d, i) => {
      const val = macroDisplayMode === 'grams' ? d.carbs : d.carbs * 4;
      return `${getDayX(i)},${getMacroY(val)}`;
    })
    .join(' ');

  // Fat polyline
  const fatPoints = dailyStats
    .map((d, i) => {
      const val = macroDisplayMode === 'grams' ? d.fat : d.fat * 9;
      return `${getDayX(i)},${getMacroY(val)}`;
    })
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Top Banner & Time Range Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <h2 className="font-athletic text-2xl font-bold tracking-wide text-white uppercase">
                Nutrition &amp; Macro Over-Time Analytics
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Longitudinal tracking of caloric balance, macronutrient distribution, fiber adherence, and body weight correlation.
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl w-fit">
            {(['7d', '14d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range === '7d' ? 'Last 7 Days' : range === '14d' ? 'Last 14 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Executive KPI Summary Grid */}
        {summaryKPIs && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {/* KPI 1: Average Calories */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Avg Daily Intake</span>
                <Flame className="w-3.5 h-3.5 text-orange-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-athletic text-2xl font-bold text-white">
                  {summaryKPIs.avgCal}
                </span>
                <span className="text-[11px] font-mono text-slate-400">kcal / day</span>
              </div>
              <div className="text-[11px] mt-1 flex items-center gap-1 text-slate-400">
                <span>Target: {targets.calorieTarget}</span>
                <span className={`font-mono ${summaryKPIs.avgCal <= targets.calorieTarget ? 'text-emerald-400' : 'text-amber-400'}`}>
                  ({summaryKPIs.avgCal - targets.calorieTarget > 0 ? '+' : ''}{summaryKPIs.avgCal - targets.calorieTarget} kcal)
                </span>
              </div>
            </div>

            {/* KPI 2: Target Adherence Score */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Target Adherence</span>
                <Target className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-athletic text-2xl font-bold text-emerald-400">
                  {summaryKPIs.adherenceRate}%
                </span>
                <span className="text-[11px] text-slate-400">compliance</span>
              </div>
              <div className="text-[11px] mt-1 text-slate-400 truncate">
                {summaryKPIs.adherenceRate >= 80 ? 'Optimal discipline' : 'Moderate consistency'}
              </div>
            </div>

            {/* KPI 3: Average Daily Protein */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Avg Daily Protein</span>
                <Award className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-athletic text-2xl font-bold text-emerald-400">
                  {summaryKPIs.avgP}g
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  ({Math.round((summaryKPIs.avgP / targets.proteinGrams) * 100)}% goal)
                </span>
              </div>
              <div className="text-[11px] mt-1 text-slate-400">
                Target: {targets.proteinGrams}g / day
              </div>
            </div>

            {/* KPI 4: Cumulative Energy Delta */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Cumulative Net Energy</span>
                <Scale className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`font-athletic text-2xl font-bold ${
                  summaryKPIs.netCalorieDelta <= 0 ? 'text-blue-400' : 'text-orange-400'
                }`}>
                  {summaryKPIs.netCalorieDelta > 0 ? '+' : ''}{summaryKPIs.netCalorieDelta.toLocaleString()}
                </span>
                <span className="text-[11px] font-mono text-slate-400">kcal</span>
              </div>
              <div className="text-[11px] mt-1 text-slate-400 flex items-center gap-1">
                {summaryKPIs.netCalorieDelta <= 0 ? (
                  <>
                    <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400 inline" />
                    <span>~{Math.abs(Number(summaryKPIs.estimatedFatWeightDeltaKg))} kg tissue deficit</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-3.5 h-3.5 text-orange-400 inline" />
                    <span>+{summaryKPIs.estimatedFatWeightDeltaKg} kg energy surplus</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CHART 1: DAILY CALORIE INTAKE VS TARGET (INTERACTIVE SVG) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-athletic text-lg font-bold text-white uppercase flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>Daily Calorie Intake vs. Target</span>
            </h3>
            <p className="text-xs text-slate-400">
              Interactive timeline. Hover or click any date column to view precise daily totals and surplus/deficit.
            </p>
          </div>

          {/* Target Reference Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500/80 inline-block" />
              <span className="text-slate-300">Target Range (±150 kcal)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-500/80 inline-block" />
              <span className="text-slate-300">Deficit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500/80 inline-block" />
              <span className="text-slate-300">Surplus</span>
            </div>
          </div>
        </div>

        {/* Selected Date Callout Bar */}
        {selectedDay && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-white">
                {new Date(selectedDay.date + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
              {selectedDay.isCompliant ? (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Target Met
                </span>
              ) : selectedDay.calDiff > 0 ? (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
                  +{selectedDay.calDiff} kcal Surplus
                </span>
              ) : (
                <span className="text-[10px] font-bold text-blue-400 bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 rounded">
                  {selectedDay.calDiff} kcal Deficit
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400">Calories: </span>
                <span className="text-white font-bold">{selectedDay.calories} kcal</span>
              </div>
              <div>
                <span className="text-emerald-400 font-bold">P: {selectedDay.protein}g</span>
              </div>
              <div>
                <span className="text-amber-400 font-bold">C: {selectedDay.carbs}g</span>
              </div>
              <div>
                <span className="text-rose-400 font-bold">F: {selectedDay.fat}g</span>
              </div>
              <div>
                <span className="text-cyan-400 font-bold">Fib: {selectedDay.fiber}g</span>
              </div>
            </div>
          </div>
        )}

        {/* SVG Calorie Chart */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-56 select-none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="calBarGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="calBarAmber" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#b45309" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="calBarBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines */}
            {[minCal, (minCal + maxCal) / 2, maxCal].map((val, idx) => {
              const y = getCalY(val);
              return (
                <g key={idx}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={svgWidth - paddingRight}
                    y2={y}
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] font-mono fill-slate-500"
                  >
                    {Math.round(val)}
                  </text>
                </g>
              );
            })}

            {/* Target Calorie Horizontal Reference Line */}
            <line
              x1={paddingLeft}
              y1={targetY}
              x2={svgWidth - paddingRight}
              y2={targetY}
              stroke="#f97316"
              strokeWidth="2"
              strokeDasharray="6 3"
            />
            <text
              x={svgWidth - paddingRight}
              y={targetY - 6}
              textAnchor="end"
              className="text-[10px] font-mono font-bold fill-orange-400"
            >
              Target: {targets.calorieTarget} kcal
            </text>

            {/* Calorie Bars */}
            {dailyStats.map((d, i) => {
              const x = getDayX(i);
              const barWidth = Math.max(12, Math.min(28, (chartInnerWidth / dailyStats.length) * 0.65));
              const barY = getCalY(d.calories);
              const barHeight = Math.max(4, paddingTop + chartInnerHeight - barY);
              const isSelected = selectedDayIndex === i || (selectedDayIndex === null && i === dailyStats.length - 1);

              let fillGrad = 'url(#calBarGreen)';
              if (!d.isCompliant) {
                fillGrad = d.calDiff > 0 ? 'url(#calBarAmber)' : 'url(#calBarBlue)';
              }

              return (
                <g 
                  key={i} 
                  className="cursor-pointer transition-opacity"
                  onClick={() => setSelectedDayIndex(i)}
                  onMouseEnter={() => setSelectedDayIndex(i)}
                >
                  <rect
                    x={x - barWidth / 2}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={fillGrad}
                    rx="3"
                    className={`transition-all duration-150 ${isSelected ? 'stroke-2 stroke-white filter drop-shadow-md' : 'opacity-85 hover:opacity-100'}`}
                  />

                  {/* Dot on top */}
                  <circle
                    cx={x}
                    cy={barY}
                    r={isSelected ? 4 : 2}
                    className={isSelected ? 'fill-white stroke-slate-900 stroke-2' : 'fill-slate-300'}
                  />

                  {/* Date label at bottom */}
                  {(dailyStats.length <= 14 || i % 2 === 0 || i === dailyStats.length - 1) && (
                    <text
                      x={x}
                      y={svgHeight - 10}
                      textAnchor="middle"
                      className={`text-[9px] font-mono ${isSelected ? 'fill-white font-bold' : 'fill-slate-500'}`}
                    >
                      {d.date.slice(5)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* CHART 2: MACRONUTRIENT DISTRIBUTION OVER TIME (MULTI-SERIES) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-athletic text-lg font-bold text-white uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Macronutrient Breakdown Trends</span>
            </h3>
            <p className="text-xs text-slate-400">
              Daily grams of Protein, Carbohydrates, and Fats tracked against muscle-building protein targets.
            </p>
          </div>

          {/* Unit Toggle and Legends */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Protein ({targets.proteinGrams}g target)
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                Carbs
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                Fat
              </span>
            </div>

            <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setMacroDisplayMode('grams')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  macroDisplayMode === 'grams' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                }`}
              >
                Grams (g)
              </button>
              <button
                onClick={() => setMacroDisplayMode('calories')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  macroDisplayMode === 'calories' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                }`}
              >
                Calories (kcal)
              </button>
            </div>
          </div>
        </div>

        {/* SVG Macronutrients Multi-Series Chart */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-56 select-none"
            preserveAspectRatio="none"
          >
            {/* Horizontal Grid */}
            {[0, macroMax * 0.5, macroMax].map((val, idx) => {
              const y = getMacroY(val);
              return (
                <g key={idx}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={svgWidth - paddingRight}
                    y2={y}
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] font-mono fill-slate-500"
                  >
                    {Math.round(val)}{macroDisplayMode === 'grams' ? 'g' : ''}
                  </text>
                </g>
              );
            })}

            {/* Protein Target Line */}
            {macroDisplayMode === 'grams' && (
              <>
                <line
                  x1={paddingLeft}
                  y1={getMacroY(targets.proteinGrams)}
                  x2={svgWidth - paddingRight}
                  y2={getMacroY(targets.proteinGrams)}
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={svgWidth - paddingRight}
                  y={getMacroY(targets.proteinGrams) - 4}
                  textAnchor="end"
                  className="text-[10px] font-mono font-semibold fill-emerald-400"
                >
                  Protein Goal: {targets.proteinGrams}g
                </text>
              </>
            )}

            {/* Polyline: Carbs (Amber) */}
            <polyline
              points={carbsPoints}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Polyline: Protein (Emerald) */}
            <polyline
              points={proteinPoints}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Polyline: Fat (Rose) */}
            <polyline
              points={fatPoints}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points on lines */}
            {dailyStats.map((d, i) => {
              const x = getDayX(i);
              const pVal = macroDisplayMode === 'grams' ? d.protein : d.protein * 4;
              const cVal = macroDisplayMode === 'grams' ? d.carbs : d.carbs * 4;
              const fVal = macroDisplayMode === 'grams' ? d.fat : d.fat * 9;
              const isSelected = selectedDayIndex === i;

              return (
                <g key={i} className="cursor-pointer" onClick={() => setSelectedDayIndex(i)}>
                  <circle cx={x} cy={getMacroY(cVal)} r={isSelected ? 4 : 2.5} fill="#f59e0b" />
                  <circle cx={x} cy={getMacroY(pVal)} r={isSelected ? 4 : 2.5} fill="#10b981" />
                  <circle cx={x} cy={getMacroY(fVal)} r={isSelected ? 4 : 2.5} fill="#f43f5e" />

                  {/* Date label at bottom */}
                  {(dailyStats.length <= 14 || i % 2 === 0 || i === dailyStats.length - 1) && (
                    <text
                      x={x}
                      y={svgHeight - 10}
                      textAnchor="middle"
                      className="text-[9px] font-mono fill-slate-500"
                    >
                      {d.date.slice(5)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* DUAL SECTION: FIBER & HYDRATION + WEIGHT CORRELATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metric A: Fiber & Hydration Consistency */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-athletic text-base font-bold text-white uppercase flex items-center gap-2">
                <Wheat className="w-4 h-4 text-cyan-400" />
                <span>Fiber &amp; Hydration Compliance</span>
              </h3>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                Daily Gut &amp; Osmotic Health
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Tracking fiber intake ({targets.fiberGrams || 34}g target, 14g/1000kcal standard) and hydration ({targets.waterGoalMl}ml goal).
            </p>

            {/* Daily Bars Breakdown */}
            <div className="space-y-3">
              {dailyStats.slice(-5).map((day, idx) => {
                const fiberPct = Math.min(100, Math.round((day.fiber / (targets.fiberGrams || 34)) * 100));
                const waterPct = Math.min(100, Math.round((day.waterMl / targets.waterGoalMl) * 100));

                return (
                  <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-300">
                        {new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        <span className="text-cyan-400">Fiber: {day.fiber}g / {targets.fiberGrams || 34}g</span>
                        <span className="text-blue-400">Water: {(day.waterMl / 1000).toFixed(1)}L / {(targets.waterGoalMl / 1000).toFixed(1)}L</span>
                      </div>
                    </div>
                    {/* Fiber Progress Bar */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                      <div
                        className="bg-cyan-500 h-full rounded-full transition-all"
                        style={{ width: `${fiberPct}%` }}
                      />
                    </div>
                    {/* Water Progress Bar */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all"
                        style={{ width: `${waterPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 mt-4 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Optimal soluble &amp; insoluble fiber regulates gastric emptying and stabilizes postprandial glucose.</span>
          </div>
        </div>

        {/* Metric B: Weight vs. Caloric Intake Correlation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-athletic text-base font-bold text-white uppercase flex items-center gap-2">
                <Scale className="w-4 h-4 text-orange-400" />
                <span>Calorie Deficit vs. Scale Weight Correlation</span>
              </h3>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                Thermodynamic Law
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Real-world correlation between your multi-week average calorie intake and progressive body weight changes.
            </p>

            {/* Correlation Milestones Table */}
            <div className="space-y-2.5">
              {bodyMetrics.slice(-4).map((entry, idx) => {
                const prev = idx > 0 ? bodyMetrics.slice(-4)[idx - 1] : null;
                const weightDiff = prev ? (entry.weightKg - prev.weightKg).toFixed(1) : '0.0';

                return (
                  <div key={entry.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Target: {entry.calorieTarget} kcal | Body Fat: {entry.bodyFatPct}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-athletic text-lg font-bold text-white">
                        {unit === 'kg' ? entry.weightKg : (entry.weightKg * 2.20462).toFixed(1)} {unit}
                      </div>
                      <div className="text-[11px] font-mono">
                        {Number(weightDiff) < 0 ? (
                          <span className="text-emerald-400">{weightDiff} kg drop</span>
                        ) : Number(weightDiff) > 0 ? (
                          <span className="text-amber-400">+{weightDiff} kg gain</span>
                        ) : (
                          <span className="text-slate-400">baseline</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 mt-4 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span>Adherence to the 2,450 kcal recomposition target drove consistent 0.5-0.7 kg drops per week without muscle loss.</span>
          </div>
        </div>
      </div>

      {/* Historical Daily Log Drill-Down Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h3 className="font-athletic text-lg font-bold text-white uppercase mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-500" />
          <span>Historical Daily Nutrition Log ({dailyStats.length} Days)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Calories</th>
                <th className="py-2.5 px-3">Protein</th>
                <th className="py-2.5 px-3">Carbs</th>
                <th className="py-2.5 px-3">Fat</th>
                <th className="py-2.5 px-3">Fiber</th>
                <th className="py-2.5 px-3">Water</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {dailyStats.slice().reverse().map((day, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 text-white font-semibold whitespace-nowrap">
                    {new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="py-2.5 px-3 text-white font-bold whitespace-nowrap">
                    {day.calories} kcal
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400 whitespace-nowrap">
                    {day.protein}g
                  </td>
                  <td className="py-2.5 px-3 text-amber-400 whitespace-nowrap">
                    {day.carbs}g
                  </td>
                  <td className="py-2.5 px-3 text-rose-400 whitespace-nowrap">
                    {day.fat}g
                  </td>
                  <td className="py-2.5 px-3 text-cyan-400 whitespace-nowrap">
                    {day.fiber}g
                  </td>
                  <td className="py-2.5 px-3 text-blue-400 whitespace-nowrap">
                    {(day.waterMl / 1000).toFixed(1)}L
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {day.isCompliant ? (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                        On Target
                      </span>
                    ) : day.calDiff > 0 ? (
                      <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.5 rounded">
                        +{day.calDiff} kcal
                      </span>
                    ) : (
                      <span className="text-[10px] text-blue-400 bg-blue-950/60 border border-blue-500/30 px-1.5 py-0.5 rounded">
                        {day.calDiff} kcal
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-400 max-w-xs truncate">
                    {day.notes || `${day.mealsCount} meals logged`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
