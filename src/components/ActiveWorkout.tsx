import React, { useState, useEffect } from 'react';
import { 
  ActiveWorkoutExercise, 
  WorkoutSet, 
  SetType, 
  Exercise, 
  WeightUnit, 
  PersonalRecord,
  WorkoutSession 
} from '../types/workout';
import { EXERCISE_LIBRARY } from '../data/exercises';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Plus, 
  Trash2, 
  Check, 
  Trophy, 
  Clock, 
  Dumbbell, 
  Flame, 
  ChevronDown, 
  Search, 
  Save, 
  X,
  Sparkles
} from 'lucide-react';

interface ActiveWorkoutProps {
  unit: WeightUnit;
  personalRecords: PersonalRecord[];
  allSessions: WorkoutSession[];
  onFinishWorkout: (session: WorkoutSession) => void;
  onTriggerRestTimer: (seconds: number) => void;
  initialRoutineExercises?: { exerciseId: string; targetSets: number; targetReps: string; restSeconds?: number }[];
  initialRoutineName?: string;
  onCancelWorkout?: () => void;
}

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({
  unit,
  personalRecords,
  allSessions,
  onFinishWorkout,
  onTriggerRestTimer,
  initialRoutineExercises,
  initialRoutineName,
  onCancelWorkout
}) => {
  const [workoutName, setWorkoutName] = useState(initialRoutineName || 'Custom Strength Session');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [energyRating, setEnergyRating] = useState<number>(4);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [searchExercise, setSearchExercise] = useState('');
  const [filterMuscle, setFilterMuscle] = useState<string>('All');
  const [newPRsHit, setNewPRsHit] = useState<{ exerciseName: string; weightKg: number; reps: number }[]>([]);

  // Initialize exercises from routine or default to Bench Press + Squat
  const [activeExercises, setActiveExercises] = useState<ActiveWorkoutExercise[]>(() => {
    if (initialRoutineExercises && initialRoutineExercises.length > 0) {
      return initialRoutineExercises.map((re, exIdx) => {
        const matched = EXERCISE_LIBRARY.find((e) => e.id === re.exerciseId);
        const name = matched ? matched.name : re.exerciseId;
        const sets: WorkoutSet[] = Array.from({ length: re.targetSets || 3 }).map((_, sIdx) => ({
          id: `set-${exIdx}-${sIdx}-${Date.now()}`,
          setNumber: sIdx + 1,
          type: sIdx === 0 ? 'warmup' : 'normal',
          reps: parseInt(re.targetReps) || 8,
          weightKg: sIdx === 0 ? 60 : 80,
          completed: false,
          rpe: 8
        }));
        return {
          id: `ex-${exIdx}-${Date.now()}`,
          exerciseId: re.exerciseId,
          exerciseName: name,
          sets
        };
      });
    }

    // Default starting workout: Barbell Bench Press + Bent Over Row
    return [
      {
        id: `ex-bench-${Date.now()}`,
        exerciseId: 'barbell-bench-press',
        exerciseName: 'Barbell Flat Bench Press',
        sets: [
          { id: 's1', setNumber: 1, type: 'warmup', reps: 10, weightKg: 60, completed: false, rpe: 6 },
          { id: 's2', setNumber: 2, type: 'normal', reps: 8, weightKg: 85, completed: false, rpe: 8 },
          { id: 's3', setNumber: 3, type: 'normal', reps: 8, weightKg: 85, completed: false, rpe: 8 },
          { id: 's4', setNumber: 4, type: 'normal', reps: 8, weightKg: 85, completed: false, rpe: 8.5 }
        ]
      },
      {
        id: `ex-row-${Date.now()}`,
        exerciseId: 'barbell-bent-over-row',
        exerciseName: 'Barbell Bent-Over Row',
        sets: [
          { id: 's5', setNumber: 1, type: 'normal', reps: 8, weightKg: 70, completed: false, rpe: 7.5 },
          { id: 's6', setNumber: 2, type: 'normal', reps: 8, weightKg: 70, completed: false, rpe: 8 },
          { id: 's7', setNumber: 3, type: 'normal', reps: 8, weightKg: 70, completed: false, rpe: 8.5 }
        ]
      }
    ];
  });

  // Elapsed workout stopwatch
  useEffect(() => {
    let interval: number;
    if (isTimerRunning) {
      interval = window.setInterval(() => {
        setElapsedSeconds((sec) => sec + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Convert kg to display unit
  const formatWeight = (kg: number): number => {
    if (unit === 'lbs') {
      return Math.round(kg * 2.20462 * 10) / 10;
    }
    return Math.round(kg * 10) / 10;
  };

  const toKg = (val: number): number => {
    if (unit === 'lbs') {
      return Math.round((val / 2.20462) * 10) / 10;
    }
    return val;
  };

  // Helper to find previous session's performance for this exercise
  const getPreviousSessionPerformance = (exerciseId: string, setIdx: number): string | null => {
    for (const session of allSessions) {
      const match = session.exercises.find((e) => e.exerciseId === exerciseId);
      if (match && match.sets && match.sets.length > setIdx) {
        const prevSet = match.sets[setIdx];
        return `${formatWeight(prevSet.weightKg)} ${unit} × ${prevSet.reps}`;
      }
    }
    return null;
  };

  // Compute 1RM with Epley equation: Weight * (1 + Reps / 30)
  const calculate1RM = (weightKg: number, reps: number): number => {
    if (reps <= 0 || weightKg <= 0) return 0;
    if (reps === 1) return weightKg;
    return Math.round(weightKg * (1 + reps / 30));
  };

  // Total volume of completed sets
  const totalVolumeKg = activeExercises.reduce((sum, ex) => {
    return (
      sum +
      ex.sets.reduce((exSum, s) => {
        return s.completed ? exSum + s.weightKg * s.reps : exSum;
      }, 0)
    );
  }, 0);

  const completedSetsCount = activeExercises.reduce((sum, ex) => {
    return sum + ex.sets.filter((s) => s.completed).length;
  }, 0);

  const totalSetsCount = activeExercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  // Check set completion & PR check
  const handleToggleSetComplete = (exId: string, setId: string) => {
    setActiveExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => {
            if (s.id !== setId) return s;
            const newCompleted = !s.completed;

            if (newCompleted) {
              // Trigger Rest Timer (default 90s, or exercise specific)
              onTriggerRestTimer(90);

              // Check if beats PR
              const existingPr = personalRecords.find((pr) => pr.exerciseId === ex.exerciseId);
              const est1RM = calculate1RM(s.weightKg, s.reps);
              const isHeaviest = !existingPr || s.weightKg > existingPr.maxWeightKg;
              const isHighest1RM = !existingPr || est1RM > existingPr.estimated1RMKg;

              if ((isHeaviest || isHighest1RM) && s.weightKg > 0 && s.type !== 'warmup') {
                soundManager.playRecordFanfare();
                confetti({
                  particleCount: 70,
                  spread: 60,
                  origin: { y: 0.75 }
                });
                setNewPRsHit((prevPRs) => [
                  ...prevPRs,
                  {
                    exerciseName: ex.exerciseName,
                    weightKg: s.weightKg,
                    reps: s.reps
                  }
                ]);
                return { ...s, completed: true, isPR: true };
              }
            }

            return { ...s, completed: newCompleted };
          })
        };
      })
    );
  };

  const handleUpdateSet = (exId: string, setId: string, updates: Partial<WorkoutSet>) => {
    setActiveExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s))
        };
      })
    );
  };

  const handleAddSet = (exId: string) => {
    setActiveExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: WorkoutSet = {
          id: `set-${Date.now()}-${Math.random()}`,
          setNumber: ex.sets.length + 1,
          type: 'normal',
          reps: lastSet ? lastSet.reps : 8,
          weightKg: lastSet ? lastSet.weightKg : 60,
          completed: false,
          rpe: 8
        };
        return {
          ...ex,
          sets: [...ex.sets, newSet]
        };
      })
    );
  };

  const handleRemoveSet = (exId: string, setId: string) => {
    setActiveExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex;
        const remaining = ex.sets.filter((s) => s.id !== setId);
        const renumbered = remaining.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        return { ...ex, sets: renumbered };
      })
    );
  };

  const handleRemoveExercise = (exId: string) => {
    setActiveExercises((prev) => prev.filter((e) => e.id !== exId));
  };

  const handleAddExerciseFromLibrary = (exercise: Exercise) => {
    const newEx: ActiveWorkoutExercise = {
      id: `ex-${Date.now()}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: [
        { id: `s-${Date.now()}-1`, setNumber: 1, type: 'warmup', reps: 10, weightKg: 40, completed: false, rpe: 6 },
        { id: `s-${Date.now()}-2`, setNumber: 2, type: 'normal', reps: 8, weightKg: 60, completed: false, rpe: 8 },
        { id: `s-${Date.now()}-3`, setNumber: 3, type: 'normal', reps: 8, weightKg: 60, completed: false, rpe: 8 }
      ]
    };
    setActiveExercises((prev) => [...prev, newEx]);
    setShowAddExerciseModal(false);
  };

  const handleCompleteSession = () => {
    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      name: workoutName,
      date: new Date().toISOString(),
      durationSeconds: elapsedSeconds,
      exercises: activeExercises,
      totalVolumeKg,
      notes: workoutNotes,
      energyRating
    };
    onFinishWorkout(newSession);
  };

  const formatElapsedTime = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const filteredExercises = EXERCISE_LIBRARY.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchExercise.toLowerCase()) ||
      ex.primaryMuscles.some(m => m.toLowerCase().includes(searchExercise.toLowerCase()));
    const matchesMuscle = filterMuscle === 'All' || ex.primaryMuscles.includes(filterMuscle as any);
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Workout Meta */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="text-2xl font-athletic font-extrabold tracking-wide text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-orange-500 focus:outline-none transition-colors w-full uppercase"
            />
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-4 h-4 text-orange-400" />
                <span className="font-mono font-bold text-white">{formatElapsedTime(elapsedSeconds)}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Dumbbell className="w-4 h-4 text-amber-400" />
                <span className="font-mono font-bold text-white">{formatWeight(totalVolumeKg)} {unit}</span> volume
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Flame className="w-4 h-4 text-emerald-400" />
                <span className="font-mono font-bold text-white">{completedSetsCount}/{totalSetsCount}</span> sets done
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
              title={isTimerRunning ? 'Pause Elapsed Timer' : 'Resume Timer'}
            >
              {isTimerRunning ? <Clock className="w-4 h-4 text-orange-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={() => setShowAddExerciseModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4 text-orange-400" />
              <span>Add Exercise</span>
            </button>
            <button
              onClick={() => setShowFinishModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-950/60 transition-transform active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Finish Workout</span>
            </button>
          </div>
        </div>
      </div>

      {/* PR Achievement Alert if hit in current session */}
      {newPRsHit.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-slate-900 border border-amber-500/40 rounded-xl p-4 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>Personal Record Shattered!</span>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                Latest: <strong>{newPRsHit[newPRsHit.length - 1].exerciseName}</strong> lifted{' '}
                <strong className="text-white">{formatWeight(newPRsHit[newPRsHit.length - 1].weightKg)} {unit}</strong> for{' '}
                <strong className="text-white">{newPRsHit[newPRsHit.length - 1].reps} reps</strong>!
              </div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30">
            +{newPRsHit.length} PRs Today
          </span>
        </div>
      )}

      {/* Exercise Cards List */}
      <div className="space-y-4">
        {activeExercises.map((exercise, exIndex) => {
          const exerciseMeta = EXERCISE_LIBRARY.find((e) => e.id === exercise.exerciseId);

          return (
            <div
              key={exercise.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 transition-shadow hover:shadow-md"
            >
              {/* Exercise Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  {exerciseMeta?.image ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-750 shrink-0 shadow-sm">
                      <img
                        src={exerciseMeta.image}
                        alt={exercise.exerciseName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 font-athletic text-base font-bold flex items-center justify-center border border-orange-500/20">
                      {exIndex + 1}
                    </div>
                  )}
                  <div>
                    <h3 className="font-athletic text-lg font-bold tracking-wide text-white uppercase">
                      {exercise.exerciseName}
                    </h3>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{exerciseMeta?.equipment || 'Free Weight'}</span>
                      <span>·</span>
                      <span className="text-orange-400 font-medium">
                        {exerciseMeta?.primaryMuscles.join(', ') || 'Primary'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRemoveExercise(exercise.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Remove Exercise"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sets Table */}
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/60 pb-2">
                      <th className="py-2 px-2 text-center w-12">Set</th>
                      <th className="py-2 px-2 w-28">Type</th>
                      <th className="py-2 px-2 hidden sm:table-cell text-slate-500 w-32">Previous</th>
                      <th className="py-2 px-2 w-28">Weight ({unit})</th>
                      <th className="py-2 px-2 w-24">Reps</th>
                      <th className="py-2 px-2 w-20 hidden md:table-cell">RPE</th>
                      <th className="py-2 px-2 text-center w-16">Est. 1RM</th>
                      <th className="py-2 px-2 text-center w-14">Done</th>
                      <th className="py-2 px-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-xs">
                    {exercise.sets.map((set, sIdx) => {
                      const prevPerf = getPreviousSessionPerformance(exercise.exerciseId, sIdx);
                      const estimated1RM = calculate1RM(set.weightKg, set.reps);

                      return (
                        <tr
                          key={set.id}
                          className={`transition-colors ${
                            set.completed ? 'bg-orange-950/10 text-white' : 'hover:bg-slate-800/30 text-slate-300'
                          }`}
                        >
                          {/* Set Number */}
                          <td className="py-2.5 px-2 text-center font-athletic font-bold text-sm text-slate-400">
                            {set.setNumber}
                          </td>

                          {/* Set Tag Type */}
                          <td className="py-2.5 px-2">
                            <select
                              value={set.type}
                              onChange={(e) =>
                                handleUpdateSet(exercise.id, set.id, { type: e.target.value as SetType })
                              }
                              className="bg-slate-950 border border-slate-800 text-[11px] rounded-md px-2 py-1 text-slate-300 focus:outline-none focus:border-orange-500 font-medium"
                            >
                              <option value="warmup">Warm-up</option>
                              <option value="normal">Working</option>
                              <option value="drop">Drop Set</option>
                              <option value="failure">Failure</option>
                            </select>
                          </td>

                          {/* Previous Set Performance */}
                          <td className="py-2.5 px-2 hidden sm:table-cell font-mono text-[11px] text-slate-500">
                            {prevPerf || '—'}
                          </td>

                          {/* Weight Input */}
                          <td className="py-2.5 px-2">
                            <input
                              type="number"
                              step="0.5"
                              value={formatWeight(set.weightKg) || ''}
                              onChange={(e) =>
                                handleUpdateSet(exercise.id, set.id, {
                                  weightKg: toKg(parseFloat(e.target.value) || 0)
                                })
                              }
                              className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white font-mono font-semibold focus:outline-none focus:border-orange-500"
                              placeholder="0"
                            />
                          </td>

                          {/* Reps Input */}
                          <td className="py-2.5 px-2">
                            <input
                              type="number"
                              value={set.reps || ''}
                              onChange={(e) =>
                                handleUpdateSet(exercise.id, set.id, {
                                  reps: parseInt(e.target.value) || 0
                                })
                              }
                              className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white font-mono font-semibold focus:outline-none focus:border-orange-500"
                              placeholder="0"
                            />
                          </td>

                          {/* RPE */}
                          <td className="py-2.5 px-2 hidden md:table-cell">
                            <select
                              value={set.rpe || 8}
                              onChange={(e) =>
                                handleUpdateSet(exercise.id, set.id, {
                                  rpe: parseFloat(e.target.value)
                                })
                              }
                              className="bg-slate-950 border border-slate-800 text-[11px] rounded-md px-2 py-1 text-slate-300 focus:outline-none focus:border-orange-500"
                            >
                              <option value={6}>RPE 6 (4 RIR)</option>
                              <option value={7}>RPE 7 (3 RIR)</option>
                              <option value={8}>RPE 8 (2 RIR)</option>
                              <option value={8.5}>RPE 8.5 (1-2 RIR)</option>
                              <option value={9}>RPE 9 (1 RIR)</option>
                              <option value={9.5}>RPE 9.5 (Maybe 1)</option>
                              <option value={10}>RPE 10 (Failure)</option>
                            </select>
                          </td>

                          {/* 1RM calculation */}
                          <td className="py-2.5 px-2 text-center font-mono text-[11px] text-slate-400">
                            {estimated1RM > 0 ? (
                              <span className={set.isPR ? 'text-amber-400 font-bold' : ''}>
                                {formatWeight(estimated1RM)} {unit}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>

                          {/* Complete Checkbox */}
                          <td className="py-2.5 px-2 text-center">
                            <button
                              onClick={() => handleToggleSetComplete(exercise.id, set.id)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                set.completed
                                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950'
                                  : 'bg-slate-950 border border-slate-700 text-slate-600 hover:text-white hover:border-slate-500'
                              }`}
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </button>
                          </td>

                          {/* Delete Set */}
                          <td className="py-2.5 px-2 text-right">
                            <button
                              onClick={() => handleRemoveSet(exercise.id, set.id)}
                              className="text-slate-600 hover:text-red-400 p-1 rounded transition-colors"
                              title="Delete set"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add Set Row Button */}
              <div className="mt-3 pt-2 flex items-center justify-between border-t border-slate-800/60">
                <button
                  onClick={() => handleAddSet(exercise.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 py-1 px-2 rounded-md hover:bg-orange-500/10 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Set</span>
                </button>

                {exerciseMeta && (
                  <span className="text-[11px] text-slate-500 italic">
                    Tempo: {exerciseMeta.tempoGuidance}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Exercise Modal */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-athletic text-2xl font-bold tracking-wide text-white uppercase">
                  Add Exercise to Session
                </h3>
                <p className="text-xs text-slate-400">Search by name or filter by targeted muscle group.</p>
              </div>
              <button
                onClick={() => setShowAddExerciseModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Search and Filter */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search bench, squat, pull up, chest..."
                  value={searchExercise}
                  onChange={(e) => setSearchExercise(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <select
                value={filterMuscle}
                onChange={(e) => setFilterMuscle(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-orange-500"
              >
                <option value="All">All Muscles</option>
                <option value="Chest">Chest</option>
                <option value="Back">Back</option>
                <option value="Shoulders">Shoulders</option>
                <option value="Quads">Quads</option>
                <option value="Hamstrings">Hamstrings</option>
                <option value="Glutes">Glutes</option>
                <option value="Biceps">Biceps</option>
                <option value="Triceps">Triceps</option>
                <option value="Calves">Calves</option>
                <option value="Core">Core</option>
              </select>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-800/40">
              {filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="pt-2 flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 transition-colors"
                >
                  <div>
                    <div className="text-sm font-bold text-white">{ex.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span className="text-orange-400 font-medium">{ex.primaryMuscles.join(', ')}</span>
                      <span>·</span>
                      <span>{ex.equipment}</span>
                      <span>·</span>
                      <span className="text-slate-500">{ex.category}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddExerciseFromLibrary(ex)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Select</span>
                  </button>
                </div>
              ))}
              {filteredExercises.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">
                  No exercises match your search criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Finish Workout Summary Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-athletic text-2xl font-bold tracking-wide text-white uppercase">
                  Workout Summary &amp; Save
                </h3>
                <p className="text-xs text-slate-400">Review training volume, duration, and personal notes.</p>
              </div>
              <button
                onClick={() => setShowFinishModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] uppercase tracking-wider text-slate-400">Duration</div>
                <div className="font-mono-numbers text-lg font-bold text-white mt-1">
                  {formatElapsedTime(elapsedSeconds)}
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] uppercase tracking-wider text-slate-400">Total Volume</div>
                <div className="font-mono-numbers text-lg font-bold text-orange-400 mt-1">
                  {formatWeight(totalVolumeKg)} {unit}
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] uppercase tracking-wider text-slate-400">Sets Done</div>
                <div className="font-mono-numbers text-lg font-bold text-emerald-400 mt-1">
                  {completedSetsCount}/{totalSetsCount}
                </div>
              </div>
            </div>

            {/* Energy / Pump Rating */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Session Energy &amp; Performance (1-5)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEnergyRating(star)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                      energyRating >= star
                        ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    ★ {star}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Training Notes &amp; RPE Summary
              </label>
              <textarea
                rows={3}
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                placeholder="E.g., Great mind-muscle connection on chest press; felt explosive on bent over rows; good hydration."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowFinishModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Keep Logging
              </button>
              <button
                onClick={handleCompleteSession}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-950 transition-all"
              >
                Confirm &amp; Save Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
