import React, { useState } from 'react';
import { Exercise, MuscleGroup, EquipmentType, WorkoutPlan } from '../types/workout';
import { EXERCISE_LIBRARY, MUSCLE_GROUPS } from '../data/exercises';
import { AnatomyModel } from './AnatomyModel';
import { 
  Dumbbell, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  BookOpen, 
  SlidersHorizontal,
  X,
  BookmarkPlus,
  Plus,
  Check,
  Calendar,
  Layers
} from 'lucide-react';

interface ExerciseLibraryProps {
  plans?: WorkoutPlan[];
  onSelectExerciseForWorkout?: (exercise: Exercise) => void;
  onAddExerciseToPlan?: (
    exercise: Exercise,
    planId: string,
    routineId: string,
    config: { targetSets: number; targetReps: string; restSeconds: number; targetRpe?: number }
  ) => void;
  onCreatePlanAndAdd?: (
    planName: string,
    routineName: string,
    exercise: Exercise,
    config: { targetSets: number; targetReps: string; restSeconds: number; targetRpe?: number }
  ) => void;
  onNavigateToPlans?: () => void;
}

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({
  plans = [],
  onSelectExerciseForWorkout,
  onAddExerciseToPlan,
  onCreatePlanAndAdd,
  onNavigateToPlans
}) => {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeExerciseModal, setActiveExerciseModal] = useState<Exercise | null>(null);
  const [showAnatomyExplorer, setShowAnatomyExplorer] = useState(true);

  // Add to plan modal state
  const [exerciseToAdd, setExerciseToAdd] = useState<Exercise | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '');
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>('');
  const [targetSets, setTargetSets] = useState<number>(3);
  const [targetReps, setTargetReps] = useState<string>('8-10');
  const [restSeconds, setRestSeconds] = useState<number>(90);
  const [targetRpe, setTargetRpe] = useState<number>(8);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick create new plan in modal
  const [isCreatingNewPlan, setIsCreatingNewPlan] = useState<boolean>(false);
  const [newPlanName, setNewPlanName] = useState<string>('');
  const [newRoutineName, setNewRoutineName] = useState<string>('Day 1 - Focus');

  const equipmentList: (EquipmentType | 'All')[] = [
    'All',
    'Barbell',
    'Dumbbell',
    'Cable',
    'Machine',
    'Bodyweight'
  ];

  const filteredExercises = EXERCISE_LIBRARY.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.primaryMuscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ex.secondaryMuscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMuscle =
      !selectedMuscle ||
      ex.primaryMuscles.includes(selectedMuscle) ||
      ex.secondaryMuscles.includes(selectedMuscle);

    const matchesEquipment =
      selectedEquipment === 'All' || ex.equipment === selectedEquipment;

    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const handleOpenAddToPlan = (exercise: Exercise) => {
    setExerciseToAdd(exercise);
    if (plans.length > 0) {
      setSelectedPlanId(plans[0].id);
      setSelectedRoutineId(plans[0].routines[0]?.id || '');
    }
  };

  const handleConfirmAddToPlan = () => {
    if (!exerciseToAdd) return;

    if (isCreatingNewPlan && newPlanName.trim()) {
      if (onCreatePlanAndAdd) {
        onCreatePlanAndAdd(newPlanName.trim(), newRoutineName.trim() || 'Day 1', exerciseToAdd, {
          targetSets,
          targetReps,
          restSeconds,
          targetRpe
        });
      }
      setToastMessage(`Created "${newPlanName}" and added ${exerciseToAdd.name}!`);
    } else if (onAddExerciseToPlan && selectedPlanId && selectedRoutineId) {
      onAddExerciseToPlan(exerciseToAdd, selectedPlanId, selectedRoutineId, {
        targetSets,
        targetReps,
        restSeconds,
        targetRpe
      });
      const planName = plans.find((p) => p.id === selectedPlanId)?.name || 'Plan';
      const routineName = selectedPlan?.routines.find((r) => r.id === selectedRoutineId)?.name || 'Routine';
      setToastMessage(`Added ${exerciseToAdd.name} to "${planName} · ${routineName}"!`);
    }

    setExerciseToAdd(null);
    setIsCreatingNewPlan(false);
    setNewPlanName('');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-900/90 border border-emerald-500/50 text-white px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-fade-in">
          <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
              Workout Plan Updated
            </div>
            <div className="text-xs text-white mt-0.5">{toastMessage}</div>
          </div>
          {onNavigateToPlans && (
            <button
              onClick={() => {
                setToastMessage(null);
                onNavigateToPlans();
              }}
              className="ml-2 text-xs font-semibold text-emerald-300 underline hover:text-white"
            >
              View Plan
            </button>
          )}
        </div>
      )}

      {/* Anatomy Explorer Toggle Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-athletic text-2xl font-bold tracking-wide text-white uppercase flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            <span>Biomechanics &amp; Exercise Form Library</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select exercises to add directly into your workout plans and view targeted kinetic muscle groups.
          </p>
        </div>

        <button
          onClick={() => setShowAnatomyExplorer(!showAnatomyExplorer)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-semibold text-slate-300 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400" />
          <span>{showAnatomyExplorer ? 'Collapse Muscle Chart' : 'Show Muscle Chart'}</span>
        </button>
      </div>

      {/* Anatomy Model */}
      {showAnatomyExplorer && (
        <AnatomyModel
          selectedMuscle={selectedMuscle}
          onSelectMuscle={(m) => setSelectedMuscle(m)}
        />
      )}

      {/* Filters Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search exercises, muscles, cues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto py-1 scrollbar-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Equipment:
          </span>
          {equipmentList.map((eq) => (
            <button
              key={eq}
              onClick={() => setSelectedEquipment(eq)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors border ${
                selectedEquipment === eq
                  ? 'bg-orange-500 text-white border-orange-400'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {eq}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Active Filter Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing <strong className="text-white font-mono">{filteredExercises.length}</strong> exercises
          {selectedMuscle && (
            <span>
              {' '}targeting <strong className="text-orange-400">{selectedMuscle}</strong>
            </span>
          )}
        </div>
        {selectedMuscle && (
          <button
            onClick={() => setSelectedMuscle(null)}
            className="text-orange-400 hover:text-orange-300 underline font-medium"
          >
            Clear Muscle Filter
          </button>
        )}
      </div>

      {/* Exercises Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl"
          >
            <div>
              {/* Image or Diagram Banner */}
              <div className="relative w-full aspect-[16/10] bg-slate-950 overflow-hidden border-b border-slate-800/80">
                {exercise.image ? (
                  <img
                    src={exercise.image}
                    alt={exercise.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
                    <Dumbbell className="w-10 h-10 text-orange-500/40 mb-2" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {exercise.equipment} · {exercise.category}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

                {/* Badges on image */}
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700">
                    {exercise.equipment}
                  </span>
                  <span className="text-[11px] font-semibold text-orange-300 bg-orange-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-orange-500/40">
                    {exercise.category}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <h3 className="font-athletic text-xl font-bold tracking-wide text-white uppercase leading-tight">
                  {exercise.name}
                </h3>

                {/* Primary and Secondary Muscles */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-[10px] font-bold uppercase text-slate-500 w-16">Primary:</span>
                    <div className="flex flex-wrap gap-1">
                      {exercise.primaryMuscles.map((m) => (
                        <span
                          key={m}
                          className="bg-orange-500/10 text-orange-400 border border-orange-500/30 text-[10px] font-semibold px-2 py-0.5 rounded"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {exercise.secondaryMuscles.length > 0 && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="text-[10px] font-bold uppercase text-slate-500 w-16">Synergists:</span>
                      <div className="flex flex-wrap gap-1">
                        {exercise.secondaryMuscles.map((m) => (
                          <span
                            key={m}
                            className="bg-slate-950 text-slate-400 border border-slate-800 text-[10px] px-2 py-0.5 rounded"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary cue preview */}
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 text-[11px] text-slate-300 line-clamp-2">
                  <span className="text-orange-400 font-semibold">Key Cue:</span> {exercise.formCues[0]}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 pt-0 flex flex-col gap-2 border-t border-slate-800/40 mt-2">
              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  onClick={() => setActiveExerciseModal(exercise)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white py-1 transition-colors"
                >
                  <Info className="w-4 h-4 text-orange-400" />
                  <span>Form Guide</span>
                </button>

                {onSelectExerciseForWorkout && (
                  <button
                    onClick={() => onSelectExerciseForWorkout(exercise)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                  >
                    Quick Log
                  </button>
                )}
              </div>

              {/* Add to Workout Plan Action */}
              <button
                onClick={() => handleOpenAddToPlan(exercise)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-500/15 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/30 hover:border-orange-500 text-xs font-bold rounded-xl transition-all active:scale-[0.98]"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>+ Add to My Workout Plan</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add To Workout Plan Dialog Modal */}
      {exerciseToAdd && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                  Plan Builder Integration
                </span>
                <h3 className="font-athletic text-2xl font-bold tracking-wide text-white uppercase mt-0.5">
                  Add {exerciseToAdd.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <span>Targets:</span>
                  <span className="text-orange-300 font-semibold">
                    {exerciseToAdd.primaryMuscles.join(', ')}
                  </span>
                  {exerciseToAdd.secondaryMuscles.length > 0 && (
                    <span className="text-slate-500">
                      (+{exerciseToAdd.secondaryMuscles.join(', ')})
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setExerciseToAdd(null)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Plan selection mode toggle */}
            <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setIsCreatingNewPlan(false)}
                className={`flex-1 py-1.5 font-semibold rounded-lg transition-colors ${
                  !isCreatingNewPlan
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Select Existing Plan ({plans.length})
              </button>
              <button
                onClick={() => setIsCreatingNewPlan(true)}
                className={`flex-1 py-1.5 font-semibold rounded-lg transition-colors ${
                  isCreatingNewPlan
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                + New Workout Plan
              </button>
            </div>

            {!isCreatingNewPlan ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Choose Workout Plan
                  </label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => {
                      setSelectedPlanId(e.target.value);
                      const plan = plans.find((p) => p.id === e.target.value);
                      if (plan && plan.routines.length > 0) {
                        setSelectedRoutineId(plan.routines[0].id);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-medium"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.routines.length} routines)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Choose Day / Routine in Plan
                  </label>
                  <select
                    value={selectedRoutineId}
                    onChange={(e) => setSelectedRoutineId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-medium"
                  >
                    {selectedPlan?.routines.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.targetMuscles.join(', ')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    New Plan Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., My 4-Day Muscle Builder"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Routine Day Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Day 1 - Upper Power"
                    value={newRoutineName}
                    onChange={(e) => setNewRoutineName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            )}

            {/* Prescribed Sets, Reps, Rest Config */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Prescribed Volume &amp; Rest Interval
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
                    value={targetSets}
                    onChange={(e) => setTargetSets(parseInt(e.target.value) || 3)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Target Reps
                  </label>
                  <input
                    type="text"
                    value={targetReps}
                    onChange={(e) => setTargetReps(e.target.value)}
                    placeholder="8-10"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Rest Time
                  </label>
                  <select
                    value={restSeconds}
                    onChange={(e) => setRestSeconds(parseInt(e.target.value) || 90)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value={60}>60s</option>
                    <option value={90}>90s</option>
                    <option value={120}>120s (2m)</option>
                    <option value={180}>180s (3m)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Target RPE
                  </label>
                  <select
                    value={targetRpe}
                    onChange={(e) => setTargetRpe(parseFloat(e.target.value) || 8)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value={7}>RPE 7</option>
                    <option value={7.5}>RPE 7.5</option>
                    <option value={8}>RPE 8</option>
                    <option value={8.5}>RPE 8.5</option>
                    <option value={9}>RPE 9</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setExerciseToAdd(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddToPlan}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-950 transition-all"
              >
                {isCreatingNewPlan ? 'Create Plan & Add Exercise' : 'Save to Workout Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Form Guide Modal */}
      {activeExerciseModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                  {activeExerciseModal.equipment} · {activeExerciseModal.category}
                </span>
                <h3 className="font-athletic text-3xl font-extrabold tracking-wide text-white uppercase mt-0.5">
                  {activeExerciseModal.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                  <span className="text-slate-400">Target Muscles:</span>
                  {activeExerciseModal.primaryMuscles.map((m) => (
                    <span
                      key={m}
                      className="bg-orange-500/20 text-orange-300 border border-orange-500/40 font-semibold px-2 py-0.5 rounded text-[11px]"
                    >
                      {m}
                    </span>
                  ))}
                  {activeExerciseModal.secondaryMuscles.map((m) => (
                    <span
                      key={m}
                      className="bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded text-[11px]"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setActiveExerciseModal(null)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo / Demonstration if available */}
            {activeExerciseModal.image && (
              <div className="rounded-xl overflow-hidden border border-slate-800 max-h-72 aspect-[16/9] w-full">
                <img
                  src={activeExerciseModal.image}
                  alt={activeExerciseModal.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Setup & Tempo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-[11px] font-bold uppercase tracking-wider text-orange-400 mb-1">
                  Equipment Setup &amp; Ergonomics
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeExerciseModal.setupTips}
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-[11px] font-bold uppercase tracking-wider text-orange-400 mb-1">
                  Prescribed Tempo Guidance
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {activeExerciseModal.tempoGuidance}
                </p>
                <div className="text-[10px] text-slate-500 mt-1">
                  Eccentric (lowering) - Pause - Concentric (lift) - Top lockout
                </div>
              </div>
            </div>

            {/* Form Cues */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Step-by-Step Form Cues &amp; Execution</span>
              </h4>
              <ol className="space-y-2">
                {activeExerciseModal.formCues.map((cue, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-xs text-slate-300"
                  >
                    <span className="font-athletic font-bold text-orange-400 w-5 shrink-0 text-sm">
                      {idx + 1}.
                    </span>
                    <span>{cue}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Common Mistakes */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Common Form Mistakes to Avoid</span>
              </h4>
              <ul className="space-y-2">
                {activeExerciseModal.commonMistakes.map((mistake, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 bg-red-950/20 border border-red-900/40 p-3 rounded-lg text-xs text-red-200"
                  >
                    <span className="text-red-400 font-bold shrink-0">✕</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  const ex = activeExerciseModal;
                  setActiveExerciseModal(null);
                  handleOpenAddToPlan(ex);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-md shadow-orange-950 transition-all"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>Add to My Workout Plan</span>
              </button>

              <button
                onClick={() => setActiveExerciseModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
