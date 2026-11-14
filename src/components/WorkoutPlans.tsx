import React, { useState, useMemo } from 'react';
import { 
  WorkoutPlan, 
  WorkoutPlanRoutine, 
  WorkoutSession, 
  MuscleGroup, 
  RoutineExerciseConfig, 
  Exercise 
} from '../types/workout';
import { EXERCISE_LIBRARY, MUSCLE_GROUPS } from '../data/exercises';
import { 
  CalendarCheck, 
  Flame, 
  Plus, 
  Play, 
  Target, 
  CheckCircle2, 
  Clock, 
  Dumbbell, 
  Filter, 
  Trash2, 
  Copy, 
  FolderKanban, 
  Activity, 
  Sparkles, 
  AlertCircle, 
  Layers, 
  Check, 
  X,
  ChevronRight,
  Edit3
} from 'lucide-react';

interface WorkoutPlansProps {
  plans: WorkoutPlan[];
  activePlan: WorkoutPlan;
  sessions: WorkoutSession[];
  onSelectPlan: (plan: WorkoutPlan) => void;
  onSaveNewPlan: (plan: WorkoutPlan) => void;
  onUpdatePlan: (plan: WorkoutPlan) => void;
  onDeletePlan: (planId: string) => void;
  onDuplicatePlan: (planId: string) => void;
  onStartRoutineWorkout: (routine: WorkoutPlanRoutine) => void;
  onNavigateToExerciseLibrary?: () => void;
}

export const WorkoutPlans: React.FC<WorkoutPlansProps> = ({
  plans,
  activePlan,
  sessions,
  onSelectPlan,
  onSaveNewPlan,
  onUpdatePlan,
  onDeletePlan,
  onDuplicatePlan,
  onStartRoutineWorkout,
  onNavigateToExerciseLibrary
}) => {
  // Navigation tabs within Plans module
  const [activeTab, setActiveTab] = useState<'plan-editor' | 'muscle-coverage' | 'plans-collection' | 'adherence-matrix'>('muscle-coverage');

  // Currently inspected plan (can inspect any plan in collection)
  const [inspectedPlanId, setInspectedPlanId] = useState<string>(activePlan.id);
  const currentPlan = plans.find((p) => p.id === inspectedPlanId) || activePlan;

  // Muscle filter and routine scope
  const [selectedMuscleFocus, setSelectedMuscleFocus] = useState<MuscleGroup | 'All'>('All');
  const [selectedRoutineScope, setSelectedRoutineScope] = useState<string>('all'); // 'all' or routine.id

  // Create Plan Modal
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [newPlanWeeks, setNewPlanWeeks] = useState(8);
  const [newPlanTemplate, setNewPlanTemplate] = useState<'ppl' | 'upper_lower' | 'full_body' | 'blank'>('ppl');

  // Add Exercise to Routine Modal
  const [showAddExerciseModal, setShowAddExerciseModal] = useState<string | null>(null); // routineId
  const [selectedExerciseIdToAdd, setSelectedExerciseIdToAdd] = useState<string>(EXERCISE_LIBRARY[0].id);
  const [modalTargetSets, setModalTargetSets] = useState<number>(3);
  const [modalTargetReps, setModalTargetReps] = useState<string>('8-10');
  const [modalRestSec, setModalRestSec] = useState<number>(90);
  const [modalRpe, setModalRpe] = useState<number>(8);

  // Add Routine Day Modal
  const [showAddRoutineModal, setShowAddRoutineModal] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineDayOfWeek, setNewRoutineDayOfWeek] = useState(1);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Sync inspected plan when active plan changes if matching
  React.useEffect(() => {
    if (!plans.some((p) => p.id === inspectedPlanId)) {
      setInspectedPlanId(activePlan.id);
    }
  }, [activePlan, plans, inspectedPlanId]);

  // -------------------------------------------------------------
  // DYNAMIC MUSCLE IMPACT & KINETIC COVERAGE ENGINE
  // Based on exercises added to the plan, calculates how many and which muscles are hit!
  // -------------------------------------------------------------
  const muscleAnalysis = useMemo(() => {
    // Determine routines to analyze
    const routinesToAnalyze = selectedRoutineScope === 'all'
      ? currentPlan.routines
      : currentPlan.routines.filter((r) => r.id === selectedRoutineScope);

    // Map each muscle to its direct sets, synergist sets, and contributing exercises
    const muscleMap = new Map<
      MuscleGroup,
      {
        primarySets: number;
        synergistSets: number;
        totalSets: number;
        exercises: { exerciseName: string; sets: number; isPrimary: boolean; routineName: string }[];
      }
    >();

    // Initialize all 11 muscle groups
    MUSCLE_GROUPS.forEach((mg) => {
      muscleMap.set(mg, {
        primarySets: 0,
        synergistSets: 0,
        totalSets: 0,
        exercises: []
      });
    });

    let totalWorkingSetsInPlan = 0;
    const allExercisesInPlanSet = new Set<string>();

    routinesToAnalyze.forEach((routine) => {
      routine.exercises.forEach((re) => {
        const exMeta = EXERCISE_LIBRARY.find((e) => e.id === re.exerciseId);
        if (!exMeta) return;

        totalWorkingSetsInPlan += re.targetSets;
        allExercisesInPlanSet.add(re.exerciseId);

        // Add primary muscles
        exMeta.primaryMuscles.forEach((pm) => {
          const entry = muscleMap.get(pm);
          if (entry) {
            entry.primarySets += re.targetSets;
            entry.totalSets += re.targetSets;
            entry.exercises.push({
              exerciseName: exMeta.name,
              sets: re.targetSets,
              isPrimary: true,
              routineName: routine.name
            });
          }
        });

        // Add synergist muscles
        exMeta.secondaryMuscles.forEach((sm) => {
          const entry = muscleMap.get(sm);
          if (entry) {
            entry.synergistSets += re.targetSets;
            entry.totalSets += Math.round(re.targetSets * 0.5 * 10) / 10; // secondary fractional stimulus
            entry.exercises.push({
              exerciseName: exMeta.name,
              sets: re.targetSets,
              isPrimary: false,
              routineName: routine.name
            });
          }
        });
      });
    });

    // Muscles with at least 1 set
    const hitMuscles: {
      muscle: MuscleGroup;
      primarySets: number;
      synergistSets: number;
      totalSets: number;
      exercises: { exerciseName: string; sets: number; isPrimary: boolean; routineName: string }[];
    }[] = [];

    const unhitMuscles: MuscleGroup[] = [];

    MUSCLE_GROUPS.forEach((mg) => {
      const data = muscleMap.get(mg)!;
      if (data.primarySets > 0 || data.synergistSets > 0) {
        hitMuscles.push({ muscle: mg, ...data });
      } else {
        unhitMuscles.push(mg);
      }
    });

    // Sort hit muscles by total volume descending
    hitMuscles.sort((a, b) => b.totalSets - a.totalSets);

    const hitCount = hitMuscles.length;
    const totalCount = MUSCLE_GROUPS.length;
    const coveragePercentage = Math.round((hitCount / totalCount) * 100);

    return {
      hitCount,
      totalCount,
      coveragePercentage,
      hitMuscles,
      unhitMuscles,
      totalWorkingSetsInPlan,
      totalExercisesCount: allExercisesInPlanSet.size
    };
  }, [currentPlan, selectedRoutineScope]);

  // -------------------------------------------------------------
  // MULTI-WEEK ADHERENCE CALCULATIONS
  // -------------------------------------------------------------
  const adherenceStats = useMemo(() => {
    const totalWeeks = 6;
    const now = new Date();
    const sessionDatesSet = new Set(sessions.map((s) => s.date.split('T')[0]));
    const adherenceWeeks = [];
    let totalPlannedDays = 0;
    let totalCompletedPlannedDays = 0;

    for (let w = totalWeeks - 1; w >= 0; w--) {
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const daysBack = w * 7 + (6 - d);
        const targetDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
        const dateStr = targetDate.toISOString().split('T')[0];
        const dayOfWeek = targetDate.getDay();

        const scheduledRoutine = activePlan.routines.find((r) => r.dayOfWeek === dayOfWeek);
        const isPlanned = !!scheduledRoutine;
        const isCompleted = sessionDatesSet.has(dateStr);
        const isPastOrToday = targetDate <= now;

        if (isPlanned && isPastOrToday) {
          totalPlannedDays++;
          if (isCompleted) totalCompletedPlannedDays++;
        }

        weekDays.push({
          dateStr,
          dayOfWeek,
          dayName: dayNames[dayOfWeek],
          dateNum: targetDate.getDate(),
          isPlanned,
          routineName: scheduledRoutine?.name,
          isCompleted,
          isToday: targetDate.toDateString() === now.toDateString(),
          isPast: targetDate < now
        });
      }
      adherenceWeeks.push({ weekNumber: totalWeeks - w, days: weekDays });
    }

    const adherencePercentage = totalPlannedDays > 0
      ? Math.round((totalCompletedPlannedDays / totalPlannedDays) * 100)
      : 100;

    return {
      adherenceWeeks,
      totalPlannedDays,
      totalCompletedPlannedDays,
      adherencePercentage
    };
  }, [activePlan, sessions]);

  // Handlers for Plan modification
  const handleRemoveExerciseFromRoutine = (routineId: string, exerciseIndex: number) => {
    const updatedRoutines = currentPlan.routines.map((r) => {
      if (r.id !== routineId) return r;
      const updatedEx = [...r.exercises];
      updatedEx.splice(exerciseIndex, 1);
      return { ...r, exercises: updatedEx };
    });

    onUpdatePlan({ ...currentPlan, routines: updatedRoutines });
  };

  const handleConfirmAddExercise = () => {
    if (!showAddExerciseModal) return;

    const newConfig: RoutineExerciseConfig = {
      exerciseId: selectedExerciseIdToAdd,
      targetSets: modalTargetSets,
      targetReps: modalTargetReps,
      restSeconds: modalRestSec,
      targetRpe: modalRpe
    };

    const exMeta = EXERCISE_LIBRARY.find((e) => e.id === selectedExerciseIdToAdd);

    const updatedRoutines = currentPlan.routines.map((r) => {
      if (r.id !== showAddExerciseModal) return r;
      const newTargetMuscles = Array.from(
        new Set([...r.targetMuscles, ...(exMeta?.primaryMuscles || [])])
      );
      return {
        ...r,
        targetMuscles: newTargetMuscles,
        exercises: [...r.exercises, newConfig]
      };
    });

    onUpdatePlan({ ...currentPlan, routines: updatedRoutines });
    setShowAddExerciseModal(null);
  };

  const handleAddRoutineDay = () => {
    if (!newRoutineName.trim()) return;

    const newRoutine: WorkoutPlanRoutine = {
      id: `rt-${Date.now()}`,
      name: newRoutineName.trim(),
      dayOfWeek: Number(newRoutineDayOfWeek),
      targetMuscles: [],
      exercises: []
    };

    onUpdatePlan({
      ...currentPlan,
      routines: [...currentPlan.routines, newRoutine]
    });
    setShowAddRoutineModal(false);
    setNewRoutineName('');
  };

  const handleDeleteRoutine = (routineId: string) => {
    const updatedRoutines = currentPlan.routines.filter((r) => r.id !== routineId);
    onUpdatePlan({ ...currentPlan, routines: updatedRoutines });
  };

  const handleCreateNewPlan = () => {
    if (!newPlanName.trim()) return;

    let templateRoutines: WorkoutPlanRoutine[] = [];

    if (newPlanTemplate === 'ppl') {
      templateRoutines = [
        {
          id: `rt-push-${Date.now()}`,
          name: 'Day 1: Push (Chest & Shoulders)',
          dayOfWeek: 1,
          targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
          exercises: [
            { exerciseId: 'barbell-bench-press', targetSets: 4, targetReps: '6-8', restSeconds: 120 },
            { exerciseId: 'incline-dumbbell-press', targetSets: 3, targetReps: '8-10', restSeconds: 90 },
            { exerciseId: 'dumbbell-lateral-raise', targetSets: 4, targetReps: '12-15', restSeconds: 60 }
          ]
        },
        {
          id: `rt-pull-${Date.now()}`,
          name: 'Day 2: Pull (Back & Biceps)',
          dayOfWeek: 2,
          targetMuscles: ['Back', 'Biceps'],
          exercises: [
            { exerciseId: 'conventional-deadlift', targetSets: 3, targetReps: '5', restSeconds: 180 },
            { exerciseId: 'barbell-bent-over-row', targetSets: 4, targetReps: '8', restSeconds: 90 },
            { exerciseId: 'lat-pulldown', targetSets: 3, targetReps: '10', restSeconds: 75 }
          ]
        },
        {
          id: `rt-legs-${Date.now()}`,
          name: 'Day 3: Legs (Quads & Posterior)',
          dayOfWeek: 3,
          targetMuscles: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
          exercises: [
            { exerciseId: 'barbell-back-squat', targetSets: 4, targetReps: '6-8', restSeconds: 150 },
            { exerciseId: 'romanian-deadlift', targetSets: 3, targetReps: '8-10', restSeconds: 90 },
            { exerciseId: 'standing-calf-raise', targetSets: 4, targetReps: '15', restSeconds: 60 }
          ]
        }
      ];
    } else if (newPlanTemplate === 'upper_lower') {
      templateRoutines = [
        {
          id: `rt-upper-${Date.now()}`,
          name: 'Day 1: Upper Power',
          dayOfWeek: 1,
          targetMuscles: ['Chest', 'Back', 'Shoulders', 'Triceps', 'Biceps'],
          exercises: [
            { exerciseId: 'barbell-bench-press', targetSets: 4, targetReps: '5', restSeconds: 120 },
            { exerciseId: 'barbell-bent-over-row', targetSets: 4, targetReps: '6', restSeconds: 90 }
          ]
        },
        {
          id: `rt-lower-${Date.now()}`,
          name: 'Day 2: Lower Power',
          dayOfWeek: 2,
          targetMuscles: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
          exercises: [
            { exerciseId: 'barbell-back-squat', targetSets: 4, targetReps: '5', restSeconds: 150 },
            { exerciseId: 'romanian-deadlift', targetSets: 3, targetReps: '8', restSeconds: 90 }
          ]
        }
      ];
    } else if (newPlanTemplate === 'blank') {
      templateRoutines = [
        {
          id: `rt-blank-${Date.now()}`,
          name: 'Day 1: Custom Focus',
          dayOfWeek: 1,
          targetMuscles: [],
          exercises: []
        }
      ];
    }

    const createdPlan: WorkoutPlan = {
      id: `plan-${Date.now()}`,
      name: newPlanName.trim(),
      description: newPlanDescription.trim() || 'Custom periodized training plan.',
      weeksDuration: newPlanWeeks,
      startDate: new Date().toISOString().split('T')[0],
      routines: templateRoutines
    };

    onSaveNewPlan(createdPlan);
    setInspectedPlanId(createdPlan.id);
    setShowCreatePlanModal(false);
    setNewPlanName('');
    setNewPlanDescription('');
    setActiveTab('muscle-coverage');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Plan Selector and Module Sub-Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                Plan Architecture
              </span>
              <span>·</span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                Active: {activePlan.name}
              </span>
            </div>
            <h2 className="font-athletic text-2xl font-bold tracking-wide text-white uppercase mt-0.5 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-orange-500" />
              <span>{currentPlan.name}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">{currentPlan.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Plan Switcher Dropdown */}
            <select
              value={inspectedPlanId}
              onChange={(e) => {
                setInspectedPlanId(e.target.value);
                const plan = plans.find((p) => p.id === e.target.value);
                if (plan) onSelectPlan(plan);
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-medium"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.id === activePlan.id ? '(Active)' : ''}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowCreatePlanModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-950 transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Plan</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs: Muscle Coverage, Plan Routines, Plan Collection, Adherence */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto py-1 scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('muscle-coverage')}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-semibold rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'muscle-coverage'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Muscle Coverage ({muscleAnalysis.hitCount}/11 Hit)</span>
          </button>

          <button
            onClick={() => setActiveTab('plan-editor')}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-semibold rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'plan-editor'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Routines &amp; Exercises ({currentPlan.routines.length} Days)</span>
          </button>

          <button
            onClick={() => setActiveTab('plans-collection')}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-semibold rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'plans-collection'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>All Plans Collection ({plans.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('adherence-matrix')}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-semibold rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'adherence-matrix'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Adherence Matrix ({adherenceStats.adherencePercentage}%)</span>
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* VIEW 1: DYNAMIC MUSCLE IMPACT & COVERAGE ANALYZER */}
      {/* ============================================================= */}
      {activeTab === 'muscle-coverage' && (
        <div className="space-y-6">
          {/* Top Kinetic Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-athletic text-xl font-bold tracking-wide text-white uppercase flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-500" />
                  <span>Kinetic Muscle Balance &amp; Direct Volume Analysis</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calculates every primary and synergist muscle hit by the exercises you have added to this plan.
                </p>
              </div>

              {/* Routine Scope Filter (All Days vs Specific Day) */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Scope:</span>
                <select
                  value={selectedRoutineScope}
                  onChange={(e) => setSelectedRoutineScope(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 font-medium"
                >
                  <option value="all">Entire Plan (All Days Combined)</option>
                  {currentPlan.routines.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* KPI Cards Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Muscles Targeted
                </div>
                <div className="font-mono-numbers text-2xl font-extrabold text-emerald-400 mt-1">
                  {muscleAnalysis.hitCount} of {muscleAnalysis.totalCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {muscleAnalysis.coveragePercentage}% Full-Body Coverage
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Working Sets
                </div>
                <div className="font-mono-numbers text-2xl font-extrabold text-orange-400 mt-1">
                  {muscleAnalysis.totalWorkingSetsInPlan} Sets
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Across {currentPlan.routines.length} scheduled sessions
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Unique Exercises
                </div>
                <div className="font-mono-numbers text-2xl font-extrabold text-white mt-1">
                  {muscleAnalysis.totalExercisesCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Compound &amp; isolation movements
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Physique Balance
                </div>
                <div className="font-mono-numbers text-xl font-extrabold text-amber-400 mt-1">
                  {muscleAnalysis.unhitMuscles.length === 0 ? 'Full Equilibrium' : `${muscleAnalysis.unhitMuscles.length} Untargeted`}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {muscleAnalysis.unhitMuscles.length === 0 ? 'Zero muscular gaps' : 'Review gap alerts below'}
                </div>
              </div>
            </div>

            {/* Coverage Progress Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-300">Total Kinetic Coverage Indicator</span>
                <span className="font-mono font-bold text-emerald-400">{muscleAnalysis.coveragePercentage}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${muscleAnalysis.coveragePercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Untargeted Gaps Alert if any muscles have 0 sets */}
          {muscleAnalysis.unhitMuscles.length > 0 && (
            <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Muscular Balance Gap Alert ({muscleAnalysis.unhitMuscles.length} Untargeted Muscles)
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Your current plan has zero direct volume for:{' '}
                    <strong className="text-white">{muscleAnalysis.unhitMuscles.join(', ')}</strong>.
                  </p>
                </div>
              </div>

              {onNavigateToExerciseLibrary && (
                <button
                  onClick={onNavigateToExerciseLibrary}
                  className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-white border border-amber-500/50 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0"
                >
                  Browse Exercises to Fill Gaps
                </button>
              )}
            </div>
          )}

          {/* Detailed Muscles Breakdown Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <h3 className="font-athletic text-xl font-bold tracking-wide text-white uppercase">
                Detailed Muscle Load &amp; Contributing Exercises
              </h3>
              <div className="text-xs text-slate-400">
                Click any muscle to isolate exercises
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {/* Hit Muscles */}
              {muscleAnalysis.hitMuscles.map((item) => {
                const isSelected = selectedMuscleFocus === item.muscle;

                let volumeLabel = 'Maintenance';
                let volumeColor = 'text-blue-400 bg-blue-950/60 border-blue-500/30';
                if (item.primarySets >= 10) {
                  volumeLabel = 'High Hypertrophy';
                  volumeColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30';
                } else if (item.primarySets >= 6) {
                  volumeLabel = 'Optimal Growth';
                  volumeColor = 'text-orange-400 bg-orange-950/60 border-orange-500/30';
                }

                return (
                  <div
                    key={item.muscle}
                    onClick={() => setSelectedMuscleFocus(isSelected ? 'All' : item.muscle)}
                    className={`cursor-pointer bg-slate-950 rounded-xl p-4 border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-md'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-athletic text-lg font-bold text-white uppercase">
                          {item.muscle}
                        </h4>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${volumeColor}`}>
                          {volumeLabel}
                        </span>
                      </div>

                      {/* Sets stats */}
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="font-mono-numbers text-2xl font-black text-white">
                          {item.primarySets}
                        </span>
                        <span className="text-xs text-slate-400">
                          primary sets {item.synergistSets > 0 && `(+${item.synergistSets} synergist)`}
                        </span>
                      </div>

                      {/* Contributing exercises list */}
                      <div className="mt-3 pt-2.5 border-t border-slate-900 space-y-1.5">
                        <div className="text-[10px] uppercase font-bold text-slate-400">
                          Contributing Exercises ({item.exercises.length}):
                        </div>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {item.exercises.map((ex, idx) => (
                            <li key={idx} className="flex items-center justify-between text-[11px]">
                              <span className="truncate max-w-[190px]">
                                {ex.exerciseName}
                              </span>
                              <span className="font-mono text-orange-400 text-[10px] shrink-0">
                                {ex.sets} sets {ex.isPrimary ? '(pri)' : '(syn)'}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Unhit Gaps */}
              {muscleAnalysis.unhitMuscles.map((unhit) => (
                <div
                  key={unhit}
                  className="bg-slate-950/40 rounded-xl p-4 border border-dashed border-red-900/60 flex flex-col justify-between opacity-80"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-athletic text-lg font-bold text-slate-400 uppercase">
                        {unhit}
                      </h4>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-800/40">
                        0 Sets (Gap)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      No direct exercises currently hit {unhit} in this routine schedule.
                    </p>
                  </div>

                  {onNavigateToExerciseLibrary && (
                    <button
                      onClick={onNavigateToExerciseLibrary}
                      className="mt-3 text-left text-xs font-semibold text-orange-400 hover:text-orange-300 underline"
                    >
                      + Find {unhit} Exercises in Library
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* VIEW 2: PLAN ROUTINES & EXERCISE BUILDER */}
      {/* ============================================================= */}
      {activeTab === 'plan-editor' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-athletic text-xl font-bold tracking-wide text-white uppercase flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-orange-500" />
                <span>Routines &amp; Daily Splits in "{currentPlan.name}"</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Add, reorder, or customize sets, reps, and exercises in each training day.
              </p>
            </div>

            <button
              onClick={() => setShowAddRoutineModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-orange-400" />
              <span>+ Add Day / Routine</span>
            </button>
          </div>

          {/* Routine Day Cards */}
          <div className="space-y-5">
            {currentPlan.routines.map((routine) => (
              <div
                key={routine.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4"
              >
                {/* Routine Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-orange-400 font-athletic">
                        {dayNames[routine.dayOfWeek]} · Day {routine.dayOfWeek === 0 ? 7 : routine.dayOfWeek}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs text-slate-400 font-mono">
                        {routine.exercises.length} exercises
                      </span>
                    </div>
                    <h4 className="font-athletic text-2xl font-bold text-white uppercase mt-0.5">
                      {routine.name}
                    </h4>

                    {/* Target Muscle Badges */}
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {routine.targetMuscles.map((tm) => (
                        <span
                          key={tm}
                          className="text-[10px] font-semibold bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded"
                        >
                          {tm}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onStartRoutineWorkout(routine)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-950 transition-transform active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start This Workout</span>
                    </button>

                    <button
                      onClick={() => setShowAddExerciseModal(routine.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                      title="Add exercise to this day"
                    >
                      <Plus className="w-3.5 h-3.5 text-orange-400" />
                      <span>Add Exercise</span>
                    </button>

                    {currentPlan.routines.length > 1 && (
                      <button
                        onClick={() => handleDeleteRoutine(routine.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete this routine day"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Exercises Table in Routine */}
                {routine.exercises.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-2">
                          <th className="py-2 px-3">Order</th>
                          <th className="py-2 px-3">Exercise Name</th>
                          <th className="py-2 px-3">Target Muscles</th>
                          <th className="py-2 px-3 text-center">Sets</th>
                          <th className="py-2 px-3 text-center">Target Reps</th>
                          <th className="py-2 px-3 text-center">Rest</th>
                          <th className="py-2 px-3 text-center">RPE</th>
                          <th className="py-2 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40 text-slate-300">
                        {routine.exercises.map((re, exIdx) => {
                          const exMeta = EXERCISE_LIBRARY.find((e) => e.id === re.exerciseId);

                          return (
                            <tr key={exIdx} className="hover:bg-slate-800/30">
                              <td className="py-2.5 px-3 font-mono text-slate-500 w-12">
                                #{exIdx + 1}
                              </td>
                              <td className="py-2.5 px-3 font-bold text-white">
                                <div className="flex items-center gap-2.5">
                                  {exMeta?.image && (
                                    <img
                                      src={exMeta.image}
                                      alt={exMeta.name}
                                      className="w-8 h-8 rounded-lg object-cover border border-slate-800 shrink-0"
                                      referrerPolicy="no-referrer"
                                    />
                                  )}
                                  <span>{exMeta?.name || re.exerciseId}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="text-orange-400 font-semibold text-[11px]">
                                  {exMeta?.primaryMuscles.join(', ') || 'Primary'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono font-bold text-white">
                                {re.targetSets}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono">
                                {re.targetReps}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                                {re.restSeconds || 90}s
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                                {re.targetRpe ? `RPE ${re.targetRpe}` : '—'}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  onClick={() => handleRemoveExerciseFromRoutine(routine.id, exIdx)}
                                  className="text-slate-600 hover:text-red-400 p-1 rounded transition-colors"
                                  title="Remove exercise from day"
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
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                    No exercises added to this routine yet.{' '}
                    <button
                      onClick={() => setShowAddExerciseModal(routine.id)}
                      className="text-orange-400 hover:underline font-semibold"
                    >
                      Click here to add your first exercise
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* VIEW 3: ALL WORKOUT PLANS COLLECTION */}
      {/* ============================================================= */}
      {activeTab === 'plans-collection' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-athletic text-xl font-bold tracking-wide text-white uppercase flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-orange-500" />
                <span>My Workout Plans Collection ({plans.length} Plans)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage, duplicate, or switch your active workout plan.
              </p>
            </div>

            <button
              onClick={() => setShowCreatePlanModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-950 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Workout Plan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans.map((plan) => {
              const isActive = plan.id === activePlan.id;
              const totalExercises = plan.routines.reduce((sum, r) => sum + r.exercises.length, 0);
              const totalSets = plan.routines.reduce(
                (sum, r) => sum + r.exercises.reduce((es, e) => es + e.targetSets, 0),
                0
              );

              // Distinct muscles
              const coveredMuscles = Array.from(
                new Set(plan.routines.flatMap((r) => r.targetMuscles))
              );

              return (
                <div
                  key={plan.id}
                  className={`bg-slate-900 rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-sm hover:shadow-xl ${
                    isActive ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Header badge */}
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {plan.weeksDuration} Weeks · {plan.routines.length} Days/Wk
                      </span>
                      {isActive ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/40">
                          <CheckCircle2 className="w-3 h-3" /> Active Plan
                        </span>
                      ) : (
                        <button
                          onClick={() => onSelectPlan(plan)}
                          className="text-[11px] font-semibold text-orange-400 hover:text-orange-300 underline"
                        >
                          Set as Active
                        </button>
                      )}
                    </div>

                    <h4 className="font-athletic text-2xl font-bold text-white uppercase mt-3">
                      {plan.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {plan.description}
                    </p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                        <span className="text-[10px] uppercase text-slate-500 block">Routines</span>
                        <span className="font-bold text-white">{plan.routines.length} Days</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                        <span className="text-[10px] uppercase text-slate-500 block">Weekly Sets</span>
                        <span className="font-bold text-orange-400">{totalSets} Sets</span>
                      </div>
                    </div>

                    {/* Muscle Coverage tags */}
                    <div className="mt-3">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        Muscles Hit ({coveredMuscles.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {coveredMuscles.slice(0, 5).map((m) => (
                          <span
                            key={m}
                            className="text-[10px] font-semibold bg-slate-950 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded"
                          >
                            {m}
                          </span>
                        ))}
                        {coveredMuscles.length > 5 && (
                          <span className="text-[10px] text-slate-500">
                            +{coveredMuscles.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setInspectedPlanId(plan.id);
                        setActiveTab('plan-editor');
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                    >
                      Inspect / Edit
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onDuplicatePlan(plan.id)}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
                        title="Duplicate Plan"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {plans.length > 1 && (
                        <button
                          onClick={() => onDeletePlan(plan.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
                          title="Delete Plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* VIEW 4: MULTI-WEEK ADHERENCE MATRIX */}
      {/* ============================================================= */}
      {activeTab === 'adherence-matrix' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-athletic text-xl font-bold tracking-wide text-white uppercase flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-400" />
                <span>Multi-Week Adherence Matrix ({activePlan.name})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Review planned workouts vs completed sessions across a rolling 6-week mesocycle.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Done
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-orange-500/50" /> Planned
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-slate-950 border border-slate-800" /> Rest
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {adherenceStats.adherenceWeeks.map((week) => (
              <div
                key={week.weekNumber}
                className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60"
              >
                <div className="w-20 shrink-0 font-athletic font-bold text-xs uppercase text-slate-400 tracking-wider">
                  Week {week.weekNumber}
                </div>

                <div className="grid grid-cols-7 gap-2 flex-1">
                  {week.days.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      className={`p-2 rounded-lg text-center flex flex-col items-center justify-center border transition-all ${
                        day.isCompleted
                          ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                          : day.isPlanned && day.isPast
                          ? 'bg-red-950/20 border-red-900/60 text-red-400'
                          : day.isPlanned
                          ? 'bg-orange-500/10 border-orange-500/40 text-orange-300'
                          : 'bg-slate-900/40 border-slate-800/40 text-slate-600'
                      } ${day.isToday ? 'ring-2 ring-orange-500' : ''}`}
                    >
                      <span className="text-[10px] font-bold uppercase">{day.dayName}</span>
                      <span className="font-mono text-xs font-bold mt-0.5">{day.dateNum}</span>
                      <span className="text-[9px] truncate max-w-full mt-1">
                        {day.isCompleted ? '✓ Done' : day.isPlanned ? 'Planned' : 'Rest'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 1: ADD EXERCISE TO ROUTINE */}
      {/* ============================================================= */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-athletic text-2xl font-bold tracking-wide text-white uppercase">
                Add Exercise to Routine
              </h3>
              <button
                onClick={() => setShowAddExerciseModal(null)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Select Exercise from Library
              </label>
              <select
                value={selectedExerciseIdToAdd}
                onChange={(e) => setSelectedExerciseIdToAdd(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-medium"
              >
                {EXERCISE_LIBRARY.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.primaryMuscles.join(', ')})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Target Sets
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={modalTargetSets}
                  onChange={(e) => setModalTargetSets(parseInt(e.target.value) || 3)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Target Reps
                </label>
                <input
                  type="text"
                  value={modalTargetReps}
                  onChange={(e) => setModalTargetReps(e.target.value)}
                  placeholder="8-10"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Rest Seconds
                </label>
                <select
                  value={modalRestSec}
                  onChange={(e) => setModalRestSec(parseInt(e.target.value) || 90)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                >
                  <option value={60}>60s</option>
                  <option value={90}>90s</option>
                  <option value={120}>120s</option>
                  <option value={180}>180s</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Target RPE
                </label>
                <select
                  value={modalRpe}
                  onChange={(e) => setModalRpe(parseFloat(e.target.value) || 8)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                >
                  <option value={7}>RPE 7</option>
                  <option value={8}>RPE 8</option>
                  <option value={8.5}>RPE 8.5</option>
                  <option value={9}>RPE 9</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAddExerciseModal(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddExercise}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-950"
              >
                Add Exercise to Routine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 2: ADD NEW ROUTINE DAY */}
      {/* ============================================================= */}
      {showAddRoutineModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-athletic text-2xl font-bold tracking-wide text-white uppercase">
                Add New Training Day
              </h3>
              <button
                onClick={() => setShowAddRoutineModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Routine Day Title
              </label>
              <input
                type="text"
                placeholder="e.g., Day 4: Arm & Deltoid Overload"
                value={newRoutineName}
                onChange={(e) => setNewRoutineName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Scheduled Day of the Week
              </label>
              <select
                value={newRoutineDayOfWeek}
                onChange={(e) => setNewRoutineDayOfWeek(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-medium"
              >
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
                <option value={0}>Sunday</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAddRoutineModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRoutineDay}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-950"
              >
                Add Routine Day
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 3: CREATE WORKOUT PLAN */}
      {/* ============================================================= */}
      {showCreatePlanModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-athletic text-2xl font-bold tracking-wide text-white uppercase">
                Create New Workout Plan
              </h3>
              <button
                onClick={() => setShowCreatePlanModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Plan Name
              </label>
              <input
                type="text"
                placeholder="e.g., 8-Week Hypertrophy Overload"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Plan Description
              </label>
              <textarea
                rows={2}
                placeholder="Target muscle growth, weekly volume progression..."
                value={newPlanDescription}
                onChange={(e) => setNewPlanDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Starting Split Template
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'ppl', label: 'Push / Pull / Legs (3-Day)' },
                  { id: 'upper_lower', label: 'Upper / Lower (2-4 Day)' },
                  { id: 'blank', label: 'Blank Custom Slate' }
                ].map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setNewPlanTemplate(tmpl.id as any)}
                    className={`p-2.5 text-xs font-semibold rounded-xl border text-left transition-all ${
                      newPlanTemplate === tmpl.id
                        ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Duration (Weeks)
              </label>
              <input
                type="number"
                min={4}
                max={24}
                value={newPlanWeeks}
                onChange={(e) => setNewPlanWeeks(parseInt(e.target.value) || 8)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowCreatePlanModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewPlan}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-950"
              >
                Create Workout Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
