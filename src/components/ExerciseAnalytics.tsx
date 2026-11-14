import React, { useState, useMemo } from 'react';
import { WorkoutSession, PersonalRecord, WeightUnit, Exercise } from '../types/workout';
import { EXERCISE_LIBRARY } from '../data/exercises';
import { 
  TrendingUp, 
  Trophy, 
  Dumbbell, 
  Calendar, 
  Award, 
  Search, 
  ChevronRight, 
  Sparkles,
  Layers
} from 'lucide-react';

interface ExerciseAnalyticsProps {
  sessions: WorkoutSession[];
  personalRecords: PersonalRecord[];
  unit: WeightUnit;
}

export const ExerciseAnalytics: React.FC<ExerciseAnalyticsProps> = ({
  sessions,
  personalRecords,
  unit
}) => {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('barbell-bench-press');
  const [metricView, setMetricView] = useState<'estimated1RM' | 'maxWeight' | 'totalVolume'>('estimated1RM');
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  const selectedExercise = useMemo(
    () => EXERCISE_LIBRARY.find((e) => e.id === selectedExerciseId) || EXERCISE_LIBRARY[0],
    [selectedExerciseId]
  );

  const selectedPR = useMemo(
    () => personalRecords.find((pr) => pr.exerciseId === selectedExerciseId),
    [personalRecords, selectedExerciseId]
  );

  // Convert kg to unit
  const formatWeight = (kg: number): number => {
    if (unit === 'lbs') {
      return Math.round(kg * 2.20462 * 10) / 10;
    }
    return Math.round(kg * 10) / 10;
  };

  // Compute 1RM with Epley equation: Weight * (1 + Reps / 30)
  const calculate1RM = (weightKg: number, reps: number): number => {
    if (reps <= 0 || weightKg <= 0) return 0;
    if (reps === 1) return weightKg;
    return Math.round(weightKg * (1 + reps / 30));
  };

  // Extract historical data points for the selected exercise across sessions
  const chartData = useMemo(() => {
    const points: Array<{
      date: string;
      displayDate: string;
      maxWeightKg: number;
      bestSetReps: number;
      estimated1RMKg: number;
      exerciseVolumeKg: number;
      setsCount: number;
      rawSets: { setNum: number; weightKg: number; reps: number; completed: boolean }[];
    }> = [];

    // Sort chronologically ascending
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedSessions.forEach((s) => {
      const match = s.exercises.find((ex) => ex.exerciseId === selectedExerciseId);
      if (match && match.sets && match.sets.length > 0) {
        let maxWeight = 0;
        let bestReps = 0;
        let best1RM = 0;
        let exVol = 0;

        match.sets.forEach((set) => {
          if (set.completed && set.weightKg > 0) {
            exVol += set.weightKg * set.reps;
            const est1RM = calculate1RM(set.weightKg, set.reps);
            if (est1RM > best1RM) {
              best1RM = est1RM;
              maxWeight = set.weightKg;
              bestReps = set.reps;
            }
          }
        });

        if (best1RM > 0 || exVol > 0) {
          const d = new Date(s.date);
          points.push({
            date: s.date,
            displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            maxWeightKg: maxWeight,
            bestSetReps: bestReps,
            estimated1RMKg: best1RM,
            exerciseVolumeKg: exVol,
            setsCount: match.sets.length,
            rawSets: match.sets.map((set, idx) => ({
              setNum: idx + 1,
              weightKg: set.weightKg,
              reps: set.reps,
              completed: set.completed
            }))
          });
        }
      }
    });

    return points;
  }, [sessions, selectedExerciseId]);

  // SVG Chart Dimensions & Calculations
  const chartValues = useMemo(() => {
    return chartData.map((d) => {
      if (metricView === 'estimated1RM') return formatWeight(d.estimated1RMKg);
      if (metricView === 'maxWeight') return formatWeight(d.maxWeightKg);
      return formatWeight(d.exerciseVolumeKg);
    });
  }, [chartData, metricView, unit]);

  const minValue = chartValues.length > 0 ? Math.floor(Math.min(...chartValues) * 0.9) : 0;
  const maxValue = chartValues.length > 0 ? Math.ceil(Math.max(...chartValues) * 1.1) : 100;
  const valueRange = maxValue - minValue || 1;

  const svgWidth = 720;
  const svgHeight = 260;
  const paddingX = 45;
  const paddingY = 30;

  const pointsString = useMemo(() => {
    if (chartValues.length === 0) return '';
    return chartValues
      .map((val, idx) => {
        const x = paddingX + (idx / Math.max(1, chartValues.length - 1)) * (svgWidth - paddingX * 2);
        const y = svgHeight - paddingY - ((val - minValue) / valueRange) * (svgHeight - paddingY * 2);
        return `${x},${y}`;
      })
      .join(' ');
  }, [chartValues, minValue, valueRange]);

  const areaString = useMemo(() => {
    if (chartValues.length === 0) return '';
    const firstX = paddingX;
    const lastX = paddingX + (chartValues.length > 1 ? 1 : 0) * (svgWidth - paddingX * 2);
    const bottomY = svgHeight - paddingY;
    return `${pointsString} ${svgWidth - paddingX},${bottomY} ${firstX},${bottomY}`;
  }, [pointsString, chartValues.length]);

  return (
    <div className="space-y-6">
      {/* Exercise Selector Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-athletic text-2xl font-bold tracking-wide text-white uppercase flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span>Exercise Progression &amp; 1RM Analytics</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Track strength curves, calculated one-rep max trends, and total volume load per exercise.
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercise..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Horizontal Scrolling Exercise Badges */}
        <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
          {EXERCISE_LIBRARY.filter((ex) =>
            ex.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).map((ex) => {
            const isSelected = ex.id === selectedExerciseId;
            return (
              <button
                key={ex.id}
                onClick={() => setSelectedExerciseId(ex.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-950'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {ex.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Stats for Selected Exercise */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">All-Time PR Max Weight</div>
          <div className="font-mono-numbers text-2xl font-extrabold text-white mt-1">
            {selectedPR ? `${formatWeight(selectedPR.maxWeightKg)} ${unit}` : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {selectedPR ? `for ${selectedPR.maxWeightReps} reps (${selectedPR.maxWeightDate})` : 'Log to establish'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Estimated 1RM Peak</div>
          <div className="font-mono-numbers text-2xl font-extrabold text-amber-400 mt-1">
            {selectedPR ? `${formatWeight(selectedPR.estimated1RMKg)} ${unit}` : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Epley Formula 1-Rep Max</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Max Reps Single Set</div>
          <div className="font-mono-numbers text-2xl font-extrabold text-emerald-400 mt-1">
            {selectedPR ? `${selectedPR.maxReps} reps` : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {selectedPR ? `@ ${formatWeight(selectedPR.maxRepsWeightKg)} ${unit}` : 'Log to establish'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Max Session Volume</div>
          <div className="font-mono-numbers text-2xl font-extrabold text-orange-400 mt-1">
            {selectedPR ? `${formatWeight(selectedPR.maxVolumeSessionKg)} ${unit}` : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Sets × Reps × Weight</div>
        </div>
      </div>

      {/* Main SVG Interactive Progression Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        {/* Metric and Range Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Metric:</span>
            <div className="inline-flex bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setMetricView('estimated1RM')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  metricView === 'estimated1RM' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Estimated 1RM
              </button>
              <button
                onClick={() => setMetricView('maxWeight')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  metricView === 'maxWeight' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Top Set Weight
              </button>
              <button
                onClick={() => setMetricView('totalVolume')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  metricView === 'totalVolume' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Total Volume
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Data Points: <strong className="text-white font-mono">{chartData.length} sessions</strong></span>
          </div>
        </div>

        {/* SVG Canvas */}
        <div className="relative mt-4 w-full overflow-hidden bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
          {chartData.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto min-w-[550px] overflow-visible"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                  const y = paddingY + pct * (svgHeight - paddingY * 2);
                  const labelVal = Math.round(maxValue - pct * valueRange);
                  return (
                    <g key={idx}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={svgWidth - paddingX}
                        y2={y}
                        stroke="#1e293b"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 4}
                        fill="#64748b"
                        fontSize="10"
                        fontFamily="JetBrains Mono"
                        textAnchor="end"
                      >
                        {labelVal}
                      </text>
                    </g>
                  );
                })}

                {/* Area Fill */}
                <polygon points={areaString} fill="url(#chartGradient)" />

                {/* Main Curve Line */}
                <polyline
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pointsString}
                />

                {/* Data Points */}
                {chartData.map((d, idx) => {
                  const val = chartValues[idx];
                  const x = paddingX + (idx / Math.max(1, chartValues.length - 1)) * (svgWidth - paddingX * 2);
                  const y = svgHeight - paddingY - ((val - minValue) / valueRange) * (svgHeight - paddingY * 2);
                  const isHovered = hoveredPoint?.idx === idx;

                  return (
                    <g
                      key={idx}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint({ ...d, val, x, y, idx })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 7 : 4.5}
                        fill={isHovered ? '#fbbf24' : '#f97316'}
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="transition-all duration-200"
                      />
                      {/* Date label at bottom */}
                      <text
                        x={x}
                        y={svgHeight - 8}
                        fill="#64748b"
                        fontSize="10"
                        fontFamily="Plus Jakarta Sans"
                        textAnchor="middle"
                      >
                        {d.displayDate}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Tooltip Hover Overlay */}
              {hoveredPoint && (
                <div
                  className="absolute z-20 pointer-events-none bg-slate-900 border border-orange-500/60 p-3 rounded-xl shadow-2xl text-xs -translate-x-1/2 -translate-y-full mb-3"
                  style={{
                    left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                    top: `${(hoveredPoint.y / svgHeight) * 100}%`
                  }}
                >
                  <div className="font-bold text-white flex items-center justify-between gap-3">
                    <span>{hoveredPoint.displayDate}</span>
                    <span className="text-orange-400 font-mono">
                      {hoveredPoint.val} {unit}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 space-y-0.5">
                    <div>Top Set: {formatWeight(hoveredPoint.maxWeightKg)} {unit} × {hoveredPoint.bestSetReps} reps</div>
                    <div>Est. 1RM: {formatWeight(hoveredPoint.estimated1RMKg)} {unit}</div>
                    <div>Total Volume: {formatWeight(hoveredPoint.exerciseVolumeKg)} {unit}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-slate-500">
              No recorded workouts found for this exercise yet. Start an active workout to log your sets!
            </div>
          )}
        </div>
      </div>

      {/* Session-by-Session Historical Set Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="font-athletic text-xl font-bold tracking-wide text-white uppercase mb-3">
          Session-By-Session Set Logs ({selectedExercise.name})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Sets Completed</th>
                <th className="py-2.5 px-3">Top Set</th>
                <th className="py-2.5 px-3">Calculated 1RM</th>
                <th className="py-2.5 px-3">Session Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
              {chartData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 text-slate-300">
                  <td className="py-2.5 px-3 font-semibold text-white">
                    {new Date(row.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                      {row.rawSets.map((s) => (
                        <span
                          key={s.setNum}
                          className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300"
                        >
                          {formatWeight(s.weightKg)}×{s.reps}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-white">
                    {formatWeight(row.maxWeightKg)} {unit} × {row.bestSetReps}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-amber-400">
                    {formatWeight(row.estimated1RMKg)} {unit}
                  </td>
                  <td className="py-2.5 px-3 text-orange-400 font-semibold">
                    {formatWeight(row.exerciseVolumeKg)} {unit}
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
