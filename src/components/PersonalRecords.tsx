import React, { useMemo, useState } from 'react';
import { PersonalRecord, WeightUnit, WorkoutSession } from '../types/workout';
import { EXERCISE_LIBRARY } from '../data/exercises';
import {
  Trophy,
  Search,
  TrendingUp
} from 'lucide-react';

interface PersonalRecordsProps {
  records: PersonalRecord[];
  sessions?: WorkoutSession[];
  unit: WeightUnit;
  onSelectExercise: (exerciseId: string) => void;
}

interface WeightPoint {
  date: string;
  shortDate: string;
  weightKg: number;
  reps: number;
}

interface ExerciseSparklineProps {
  exerciseId: string;
  points: WeightPoint[];
  unit: WeightUnit;
  formatWeight: (kg: number) => number;
}

const ExerciseSparkline: React.FC<ExerciseSparklineProps> = ({
  exerciseId,
  points,
  unit,
  formatWeight
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 128;
  const height = 46;
  const padX = 7;
  const padY = 7;

  const first = points[0];
  const last = points[points.length - 1];
  const deltaKg = points.length >= 2 ? last.weightKg - first.weightKg : 0;
  const deltaFormatted = formatWeight(Math.abs(deltaKg));

  const coords = useMemo(() => {
    if (points.length === 0) return [];
    const weights = points.map((p) => p.weightKg);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const range = maxW - minW;

    return points.map((p, idx) => {
      const x =
        points.length === 1
          ? width / 2
          : padX + (idx / (points.length - 1)) * (width - padX * 2);
      const y =
        range === 0
          ? height / 2
          : height - padY - ((p.weightKg - minW) / range) * (height - padY * 2);
      return { x, y, point: p };
    });
  }, [points]);

  const activeCoord =
    hoveredIdx !== null && coords[hoveredIdx]
      ? coords[hoveredIdx]
      : coords.length > 0
      ? coords[coords.length - 1]
      : null;

  if (points.length === 0) {
    return (
      <div className="w-32 h-14 rounded-lg bg-slate-900/70 border border-slate-800/70 flex flex-col items-center justify-center px-2 text-center shrink-0">
        <div className="w-16 h-0.5 bg-slate-700 rounded-full mb-1" />
        <span className="text-[10px] font-mono text-slate-500">No session log</span>
      </div>
    );
  }

  const linePoints = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const areaPath =
    coords.length >= 2
      ? `M ${coords[0].x.toFixed(1)},${height - 2} L ${coords
          .map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`)
          .join(' L ')} L ${coords[coords.length - 1].x.toFixed(1)},${height - 2} Z`
      : '';

  const gradientId = `spark-grad-${exerciseId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const isPositiveOrFlat = deltaKg >= 0;
  const strokeColor = isPositiveOrFlat ? '#f59e0b' : '#fb7185';

  return (
    <div className="flex flex-col items-end shrink-0">
      <div className="flex items-center justify-between w-32 mb-1 px-0.5">
        <span className="text-[10px] font-mono text-slate-400 truncate">
          {activeCoord
            ? `${formatWeight(activeCoord.point.weightKg)} ${unit} · ${activeCoord.point.shortDate}`
            : `${points.length} logs`}
        </span>
        {points.length >= 2 && (
          <span
            className={`text-[10px] font-mono font-bold ml-1 shrink-0 ${
              deltaKg > 0
                ? 'text-emerald-400'
                : deltaKg < 0
                ? 'text-rose-400'
                : 'text-slate-400'
            }`}
          >
            {deltaKg > 0 ? `+${deltaFormatted}` : deltaKg < 0 ? `-${deltaFormatted}` : '0'}
          </span>
        )}
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible bg-slate-900/60 border border-slate-800/80 rounded-lg"
        role="img"
        aria-label={`Historical weight progression sparkline for ${exerciseId}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.32" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {coords.length >= 2 && (
          <>
            <path d={areaPath} fill={`url(#${gradientId})`} />
            <polyline
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={linePoints}
            />
          </>
        )}

        {coords.map((c, idx) => {
          const isLast = idx === coords.length - 1;
          const isHovered = hoveredIdx === idx;
          return (
            <g key={`${c.point.date}-${idx}`}>
              <circle
                cx={c.x}
                cy={c.y}
                r={isHovered ? 4 : isLast ? 3 : 2.2}
                fill={isHovered || isLast ? '#fbbf24' : '#0f172a'}
                stroke={strokeColor}
                strokeWidth={isHovered || isLast ? 1.5 : 1.5}
              />
              <circle
                cx={c.x}
                cy={c.y}
                r={8}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <title>
                  {`${c.point.shortDate}: ${formatWeight(c.point.weightKg)} ${unit} (${c.point.reps} reps)`}
                </title>
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const PersonalRecords: React.FC<PersonalRecordsProps> = ({
  records,
  sessions = [],
  unit,
  onSelectExercise
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const formatWeight = (kg: number): number => {
    if (unit === 'lbs') {
      return Math.round(kg * 2.20462 * 10) / 10;
    }
    return Math.round(kg * 10) / 10;
  };

  // Build chronological weight history per exerciseId from logged sessions
  const historyByExercise = useMemo(() => {
    const map = new Map<string, WeightPoint[]>();
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedSessions.forEach((session) => {
      const d = new Date(session.date);
      const shortDate = Number.isNaN(d.getTime())
        ? session.date.slice(5, 10)
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      session.exercises.forEach((ex) => {
        const validSets = ex.sets.filter((s) => s.completed && s.weightKg > 0);
        if (validSets.length === 0) return;

        let heaviestSet = validSets[0];
        validSets.forEach((s) => {
          if (s.weightKg > heaviestSet.weightKg) {
            heaviestSet = s;
          }
        });

        const existing = map.get(ex.exerciseId) || [];
        existing.push({
          date: session.date,
          shortDate,
          weightKg: heaviestSet.weightKg,
          reps: heaviestSet.reps
        });
        map.set(ex.exerciseId, existing);
      });
    });

    return map;
  }, [sessions]);

  const filteredRecords = records.filter((rec) => {
    const meta = EXERCISE_LIBRARY.find((e) => e.id === rec.exerciseId);
    const matchesCategory = filterCategory === 'All' || meta?.category === filterCategory;
    const matchesSearch =
      rec.exerciseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (meta && meta.primaryMuscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="font-athletic text-2xl font-bold tracking-wide text-white uppercase">
                Personal Records &amp; Hall of Fame
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              All-time lifetime records for max load lifted, estimated 1-rep maximums, and historical progression trends.
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search PR records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto py-1 scrollbar-none">
          {['All', 'Push', 'Pull', 'Legs', 'Core'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors border ${
                filterCategory === cat
                  ? 'bg-orange-500 text-white border-orange-400 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {cat === 'All' ? 'All Disciplines' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* PR Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRecords.map((rec) => {
          const meta = EXERCISE_LIBRARY.find((e) => e.id === rec.exerciseId);
          const weightHistory = historyByExercise.get(rec.exerciseId) || [];

          return (
            <div
              key={rec.exerciseId}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm hover:shadow-xl group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800/80">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                      {meta?.equipment || 'Barbell'} · {meta?.category || 'Strength'}
                    </span>
                    <h3 className="font-athletic text-xl font-bold tracking-wide text-white uppercase mt-0.5">
                      {rec.exerciseName}
                    </h3>
                  </div>

                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 shrink-0">
                    <Trophy className="w-5 h-5" />
                  </div>
                </div>

                {/* Big Stat: Max Weight + Historical Sparkline */}
                <div className="mt-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Heaviest Lift
                    </div>
                    <div className="font-mono-numbers text-3xl font-extrabold text-amber-400 mt-0.5 leading-tight">
                      {formatWeight(rec.maxWeightKg)} {unit}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-1">
                      <span className="text-white font-bold">{rec.maxWeightReps} reps</span> · {rec.maxWeightDate}
                    </div>
                  </div>

                  <ExerciseSparkline
                    exerciseId={rec.exerciseId}
                    points={weightHistory}
                    unit={unit}
                    formatWeight={formatWeight}
                  />
                </div>

                {/* Breakdown Grid */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/60">
                    <div className="text-[10px] font-bold uppercase text-slate-500">Est. 1RM Peak</div>
                    <div className="font-mono-numbers text-sm font-bold text-white mt-0.5">
                      {formatWeight(rec.estimated1RMKg)} {unit}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/60">
                    <div className="text-[10px] font-bold uppercase text-slate-500">Max Reps Set</div>
                    <div className="font-mono-numbers text-sm font-bold text-emerald-400 mt-0.5">
                      {rec.maxReps} reps @ {formatWeight(rec.maxRepsWeightKg)} {unit}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 col-span-2">
                    <div className="text-[10px] font-bold uppercase text-slate-500">Max Session Volume</div>
                    <div className="font-mono-numbers text-sm font-bold text-orange-400 mt-0.5">
                      {formatWeight(rec.maxVolumeSessionKg)} {unit} total work
                    </div>
                  </div>
                </div>
              </div>

              {/* View Progress Action */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-end">
                <button
                  onClick={() => onSelectExercise(rec.exerciseId)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>View Progression Chart</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

