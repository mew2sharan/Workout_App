import React, { useState, useEffect } from 'react';
import { 
  WorkoutSession, 
  PersonalRecord, 
  WorkoutPlan, 
  BodyMetricEntry, 
  DailyNutritionLog, 
  NutritionTargets, 
  EnrolledProgramProgress, 
  WeightUnit,
  WorkoutPlanRoutine,
  ProgramWorkoutDay,
  Exercise
} from './types/workout';
import { INITIAL_WORKOUT_SESSIONS, INITIAL_PERSONAL_RECORDS, INITIAL_BODY_METRICS, INITIAL_ENROLLED_PROGRAM } from './data/seedData';
import { DEFAULT_WORKOUT_PLANS } from './data/defaultPlans';
import { INITIAL_TODAY_NUTRITION, DEFAULT_NUTRITION_TARGETS } from './data/nutritionData';
import { INITIAL_NUTRITION_HISTORY } from './data/nutritionHistory';
import { calculateMacrosFromCalories } from './utils/nutritionCalculations';
import { Navbar, ActiveNavTab } from './components/Navbar';
import { ActiveWorkout } from './components/ActiveWorkout';
import { RestTimer } from './components/RestTimer';
import { ExerciseAnalytics } from './components/ExerciseAnalytics';
import { PersonalRecords } from './components/PersonalRecords';
import { WorkoutPlans } from './components/WorkoutPlans';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { GuidedPrograms } from './components/GuidedPrograms';
import { NutritionTracker } from './components/NutritionTracker';
import { BodyMetrics } from './components/BodyMetrics';
import { TrainerReport } from './components/TrainerReport';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout, clearAccessToken } from './utils/googleAuth';
import { AetherLiftDataBundle } from './utils/openDataSerializer';
import { CloudDriveSync } from './components/CloudDriveSync';
import { 
  Trophy, 
  TrendingUp, 
  FileText, 
  Scale, 
  Dumbbell, 
  Sparkles, 
  Calendar,
  Layers,
  HeartPulse
} from 'lucide-react';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<ActiveNavTab>('active-workout');
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'progression' | 'prs'>('progression');
  const [bodySubTab, setBodySubTab] = useState<'metrics' | 'report'>('metrics');

  // Google Drive Auth & Cloud Sync State (access token strictly in memory)
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    return localStorage.getItem('aetherlift_last_synced');
  });

  // Preferences
  const [unit, setUnit] = useState<WeightUnit>(() => {
    return (localStorage.getItem('aetherlift_unit') as WeightUnit) || 'kg';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const userHeightCm = 180;

  // Workouts and Sessions
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => {
    const saved = localStorage.getItem('aetherlift_sessions');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_WORKOUT_SESSIONS;
  });

  // Personal Records
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>(() => {
    const saved = localStorage.getItem('aetherlift_prs');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_PERSONAL_RECORDS;
  });

  // Plans
  const [plans, setPlans] = useState<WorkoutPlan[]>(() => {
    const saved = localStorage.getItem('aetherlift_plans');
    if (saved) {
      try {
        const parsed: WorkoutPlan[] = JSON.parse(saved);
        const missingDefaults = DEFAULT_WORKOUT_PLANS.filter(
          (dp) => !parsed.some((p) => p.id === dp.id)
        );
        return [...parsed, ...missingDefaults];
      } catch {}
    }
    return DEFAULT_WORKOUT_PLANS;
  });
  const [activePlan, setActivePlan] = useState<WorkoutPlan>(plans[0]);

  // Body Metrics
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetricEntry[]>(() => {
    const saved = localStorage.getItem('aetherlift_metrics');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_BODY_METRICS;
  });

  // Nutrition
  const [nutritionLog, setNutritionLog] = useState<DailyNutritionLog>(() => {
    const saved = localStorage.getItem('aetherlift_nutrition');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_TODAY_NUTRITION;
  });

  const [nutritionTargets, setNutritionTargets] = useState<NutritionTargets>(() => {
    const saved = localStorage.getItem('aetherlift_targets');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_NUTRITION_TARGETS;
  });

  const [nutritionHistory, setNutritionHistory] = useState<DailyNutritionLog[]>(() => {
    const saved = localStorage.getItem('aetherlift_nutrition_history');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_NUTRITION_HISTORY;
  });

  // Guided Programs Progress
  const [enrolledProgress, setEnrolledProgress] = useState<EnrolledProgramProgress>(() => {
    const saved = localStorage.getItem('aetherlift_program_progress');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_ENROLLED_PROGRAM;
  });

  // Active workout setup
  const [routineForActiveWorkout, setRoutineForActiveWorkout] = useState<{
    name: string;
    exercises: { exerciseId: string; targetSets: number; targetReps: string; restSeconds?: number }[];
  } | null>(null);

  // Rest Timer State
  const [restInitialSeconds, setRestInitialSeconds] = useState<number>(90);
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number>(90);
  const [isRestTimerActive, setIsRestTimerActive] = useState<boolean>(false);
  const [isRestTimerDismissed, setIsRestTimerDismissed] = useState<boolean>(true);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('aetherlift_unit', unit);
  }, [unit]);

  useEffect(() => {
    localStorage.setItem('aetherlift_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('aetherlift_prs', JSON.stringify(personalRecords));
  }, [personalRecords]);

  useEffect(() => {
    localStorage.setItem('aetherlift_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('aetherlift_metrics', JSON.stringify(bodyMetrics));
  }, [bodyMetrics]);

  useEffect(() => {
    localStorage.setItem('aetherlift_nutrition', JSON.stringify(nutritionLog));
  }, [nutritionLog]);

  useEffect(() => {
    localStorage.setItem('aetherlift_targets', JSON.stringify(nutritionTargets));
  }, [nutritionTargets]);

  useEffect(() => {
    localStorage.setItem('aetherlift_nutrition_history', JSON.stringify(nutritionHistory));
  }, [nutritionHistory]);

  useEffect(() => {
    localStorage.setItem('aetherlift_program_progress', JSON.stringify(enrolledProgress));
  }, [enrolledProgress]);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    return initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleAccessToken(token);
        setNeedsAuth(false);
      },
      (partialUser) => {
        setGoogleUser(partialUser ?? null);
        setGoogleAccessToken(null);
        setNeedsAuth(true);
      }
    );
  }, []);

  // Google Sign-In & Drive OAuth Handlers
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const { user, accessToken } = await googleSignIn();
      setGoogleUser(user);
      setGoogleAccessToken(accessToken);
      setNeedsAuth(false);
    } catch (err) {
      console.error('Google sign-in failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logout();
    } finally {
      setGoogleUser(null);
      setGoogleAccessToken(null);
      setNeedsAuth(true);
    }
  };

  const handleRequireReauth = () => {
    clearAccessToken();
    setGoogleAccessToken(null);
    setNeedsAuth(true);
  };

  const handleUpdateLastSynced = (iso: string) => {
    setLastSyncedAt(iso);
    localStorage.setItem('aetherlift_last_synced', iso);
  };

  const handleRestoreDataPatch = (patch: Partial<AetherLiftDataBundle>) => {
    if (patch.unit) setUnit(patch.unit);
    if (patch.sessions) setSessions(patch.sessions);
    if (patch.personalRecords) setPersonalRecords(patch.personalRecords);
    if (patch.plans && patch.plans.length > 0) {
      setPlans(patch.plans);
      const matched =
        (patch.activePlanId && patch.plans.find((p) => p.id === patch.activePlanId)) ||
        patch.plans[0];
      setActivePlan(matched);
    } else if (patch.activePlanId) {
      const matched = plans.find((p) => p.id === patch.activePlanId);
      if (matched) setActivePlan(matched);
    }
    if (patch.bodyMetrics) setBodyMetrics(patch.bodyMetrics);
    if (patch.todayNutrition) setNutritionLog(patch.todayNutrition);
    if (patch.nutritionHistory) setNutritionHistory(patch.nutritionHistory);
    if (patch.nutritionTargets) setNutritionTargets(patch.nutritionTargets);
    if (patch.enrolledProgress) setEnrolledProgress(patch.enrolledProgress);
  };

  // Unit toggle handler
  const handleToggleUnit = () => {
    setUnit((prev) => (prev === 'kg' ? 'lbs' : 'kg'));
  };

  // Trigger Rest Timer
  const handleTriggerRestTimer = (seconds: number) => {
    setRestInitialSeconds(seconds);
    setRestSecondsRemaining(seconds);
    setIsRestTimerActive(true);
    setIsRestTimerDismissed(false);
  };

  // Complete Workout Session
  const handleFinishWorkout = (newSession: WorkoutSession) => {
    setSessions((prev) => [newSession, ...prev]);

    // Update PRs if applicable
    const updatedPRs = [...personalRecords];
    newSession.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.completed && set.weightKg > 0 && set.type !== 'warmup') {
          const est1RM = Math.round(set.weightKg * (1 + set.reps / 30));
          const existingPrIndex = updatedPRs.findIndex((pr) => pr.exerciseId === ex.exerciseId);

          if (existingPrIndex >= 0) {
            const current = updatedPRs[existingPrIndex];
            let modified = false;
            let newMaxWeight = current.maxWeightKg;
            let newMaxWeightReps = current.maxWeightReps;
            let newMaxWeightDate = current.maxWeightDate;

            if (set.weightKg > current.maxWeightKg) {
              newMaxWeight = set.weightKg;
              newMaxWeightReps = set.reps;
              newMaxWeightDate = newSession.date.split('T')[0];
              modified = true;
            }

            let newEst1RM = current.estimated1RMKg;
            let newEst1RMDate = current.estimated1RMDate;
            if (est1RM > current.estimated1RMKg) {
              newEst1RM = est1RM;
              newEst1RMDate = newSession.date.split('T')[0];
              modified = true;
            }

            if (modified) {
              updatedPRs[existingPrIndex] = {
                ...current,
                maxWeightKg: newMaxWeight,
                maxWeightReps: newMaxWeightReps,
                maxWeightDate: newMaxWeightDate,
                estimated1RMKg: newEst1RM,
                estimated1RMDate: newEst1RMDate
              };
            }
          } else {
            updatedPRs.push({
              exerciseId: ex.exerciseId,
              exerciseName: ex.exerciseName,
              maxWeightKg: set.weightKg,
              maxWeightReps: set.reps,
              maxWeightDate: newSession.date.split('T')[0],
              maxReps: set.reps,
              maxRepsWeightKg: set.weightKg,
              maxRepsDate: newSession.date.split('T')[0],
              estimated1RMKg: est1RM,
              estimated1RMDate: newSession.date.split('T')[0],
              maxVolumeSessionKg: newSession.totalVolumeKg,
              maxVolumeDate: newSession.date.split('T')[0]
            });
          }
        }
      });
    });
    setPersonalRecords(updatedPRs);

    // Navigate to Analytics
    setCurrentTab('exercise-analytics');
    setAnalyticsSubTab('progression');
  };

  // Launch a plan routine into live logger
  const handleStartRoutineWorkout = (routine: WorkoutPlanRoutine) => {
    setRoutineForActiveWorkout({
      name: routine.name,
      exercises: routine.exercises
    });
    setCurrentTab('active-workout');
  };

  // Launch a guided program workout into live logger
  const handleStartProgramWorkout = (day: ProgramWorkoutDay, programTitle: string) => {
    setRoutineForActiveWorkout({
      name: `${programTitle} - ${day.title}`,
      exercises: day.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        targetSets: ex.sets,
        targetReps: ex.reps,
        restSeconds: ex.restSeconds
      }))
    });
    setCurrentTab('active-workout');
  };

  // Launch an individual exercise from library into live logger
  const handleSelectExerciseFromLibrary = (exercise: Exercise) => {
    setRoutineForActiveWorkout({
      name: `Focused: ${exercise.name}`,
      exercises: [
        {
          exerciseId: exercise.id,
          targetSets: 3,
          targetReps: '8-12',
          restSeconds: 90
        }
      ]
    });
    setCurrentTab('active-workout');
  };

  // Add exercise to plan routine
  const handleAddExerciseToPlan = (
    exercise: Exercise,
    planId: string,
    routineId: string,
    config: { targetSets: number; targetReps: string; restSeconds: number; targetRpe?: number }
  ) => {
    setPlans((prevPlans) =>
      prevPlans.map((plan) => {
        if (plan.id !== planId) return plan;
        const updatedRoutines = plan.routines.map((routine) => {
          if (routine.id !== routineId) return routine;
          const updatedMuscles = Array.from(
            new Set([...routine.targetMuscles, ...exercise.primaryMuscles])
          );
          const newExerciseConfig = {
            exerciseId: exercise.id,
            targetSets: config.targetSets,
            targetReps: config.targetReps,
            restSeconds: config.restSeconds,
            targetRpe: config.targetRpe
          };
          return {
            ...routine,
            targetMuscles: updatedMuscles,
            exercises: [...routine.exercises, newExerciseConfig]
          };
        });
        const updated = { ...plan, routines: updatedRoutines };
        if (activePlan.id === planId) {
          setActivePlan(updated);
        }
        return updated;
      })
    );
  };

  // Create new plan and add exercise
  const handleCreatePlanAndAdd = (
    planName: string,
    routineName: string,
    exercise: Exercise,
    config: { targetSets: number; targetReps: string; restSeconds: number; targetRpe?: number }
  ) => {
    const newPlanId = `plan-${Date.now()}`;
    const newRoutineId = `rt-${Date.now()}`;
    const newPlan: WorkoutPlan = {
      id: newPlanId,
      name: planName,
      description: 'Custom personalized workout plan.',
      weeksDuration: 8,
      startDate: new Date().toISOString().split('T')[0],
      routines: [
        {
          id: newRoutineId,
          name: routineName,
          dayOfWeek: 1,
          targetMuscles: [...exercise.primaryMuscles],
          exercises: [
            {
              exerciseId: exercise.id,
              targetSets: config.targetSets,
              targetReps: config.targetReps,
              restSeconds: config.restSeconds,
              targetRpe: config.targetRpe
            }
          ]
        }
      ]
    };
    setPlans((prev) => [...prev, newPlan]);
    setActivePlan(newPlan);
  };

  // Update existing plan
  const handleUpdatePlan = (updatedPlan: WorkoutPlan) => {
    setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
    if (activePlan.id === updatedPlan.id) {
      setActivePlan(updatedPlan);
    }
  };

  // Delete plan
  const handleDeletePlan = (planId: string) => {
    if (plans.length <= 1) return;
    const remaining = plans.filter((p) => p.id !== planId);
    setPlans(remaining);
    if (activePlan.id === planId) {
      setActivePlan(remaining[0]);
    }
  };

  // Duplicate plan
  const handleDuplicatePlan = (planId: string) => {
    const target = plans.find((p) => p.id === planId);
    if (!target) return;
    const clone: WorkoutPlan = {
      ...target,
      id: `plan-${Date.now()}`,
      name: `${target.name} (Copy)`,
      routines: target.routines.map((r, i) => ({
        ...r,
        id: `rt-${Date.now()}-${i}`,
        exercises: [...r.exercises]
      }))
    };
    setPlans((prev) => [...prev, clone]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'exercise-analytics') setAnalyticsSubTab('progression');
          if (tab === 'personal-records') {
            setCurrentTab('exercise-analytics');
            setAnalyticsSubTab('prs');
          }
          if (tab === 'body-metrics') setBodySubTab('metrics');
          if (tab === 'trainer-report') {
            setCurrentTab('body-metrics');
            setBodySubTab('report');
          }
        }}
        unit={unit}
        onToggleUnit={handleToggleUnit}
        isWorkoutInProgress={true}
        onStartNewWorkout={() => {
          setRoutineForActiveWorkout(null);
          setCurrentTab('active-workout');
        }}
        googleUser={googleUser}
        needsAuth={needsAuth}
        isLoggingIn={isLoggingIn}
        onGoogleLogin={handleGoogleLogin}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: ACTIVE WORKOUT LIVE LOGGER */}
        {currentTab === 'active-workout' && (
          <ActiveWorkout
            unit={unit}
            personalRecords={personalRecords}
            allSessions={sessions}
            onFinishWorkout={handleFinishWorkout}
            onTriggerRestTimer={handleTriggerRestTimer}
            initialRoutineExercises={routineForActiveWorkout?.exercises}
            initialRoutineName={routineForActiveWorkout?.name}
          />
        )}

        {/* TAB 2: GUIDED WORKOUT PROGRAMS */}
        {currentTab === 'guided-programs' && (
          <GuidedPrograms
            enrolledProgress={enrolledProgress}
            onUpdateProgress={setEnrolledProgress}
            onStartProgramWorkout={handleStartProgramWorkout}
            onApplyCalorieOffsetToNutrition={(additionalKcal) => {
              const newCal = nutritionTargets.calorieTarget + additionalKcal;
              const computed = calculateMacrosFromCalories(newCal, nutritionTargets.strategy);
              setNutritionTargets({
                ...nutritionTargets,
                calorieTarget: newCal,
                proteinGrams: computed.proteinGrams,
                carbsGrams: computed.carbsGrams,
                fatGrams: computed.fatGrams,
                fiberGrams: computed.fiberGrams,
                waterGoalMl: computed.waterGoalMl
              });
            }}
          />
        )}

        {/* TAB 3: NUTRITION & MACROS */}
        {currentTab === 'nutrition-tracker' && (
          <NutritionTracker
            nutritionLog={nutritionLog}
            targets={nutritionTargets}
            nutritionHistory={nutritionHistory}
            bodyMetrics={bodyMetrics}
            unit={unit}
            latestBodyMetric={bodyMetrics[bodyMetrics.length - 1]}
            onUpdateNutritionLog={(updatedToday) => {
              setNutritionLog(updatedToday);
              setNutritionHistory((prev) => {
                const idx = prev.findIndex((item) => item.date === updatedToday.date);
                if (idx >= 0) {
                  const copy = [...prev];
                  copy[idx] = updatedToday;
                  return copy;
                }
                return [...prev, updatedToday];
              });
            }}
            onUpdateTargets={setNutritionTargets}
            onOpenBodyMetrics={() => {
              setCurrentTab('body-metrics');
              setBodySubTab('metrics');
            }}
          />
        )}

        {/* TAB 4: PLANS & MULTI-WEEK ADHERENCE */}
        {currentTab === 'plans-adherence' && (
          <WorkoutPlans
            plans={plans}
            activePlan={activePlan}
            sessions={sessions}
            onSelectPlan={setActivePlan}
            onSaveNewPlan={(newPlan) => {
              setPlans((prev) => [...prev, newPlan]);
              setActivePlan(newPlan);
            }}
            onUpdatePlan={handleUpdatePlan}
            onDeletePlan={handleDeletePlan}
            onDuplicatePlan={handleDuplicatePlan}
            onStartRoutineWorkout={handleStartRoutineWorkout}
            onNavigateToExerciseLibrary={() => setCurrentTab('exercise-library')}
          />
        )}

        {/* TAB 5: EXERCISE LIBRARY & BIOMECHANICS */}
        {currentTab === 'exercise-library' && (
          <ExerciseLibrary
            plans={plans}
            onSelectExerciseForWorkout={handleSelectExerciseFromLibrary}
            onAddExerciseToPlan={handleAddExerciseToPlan}
            onCreatePlanAndAdd={handleCreatePlanAndAdd}
            onNavigateToPlans={() => setCurrentTab('plans-adherence')}
          />
        )}

        {/* TAB 6: PROGRESSION ANALYTICS & PR HALL OF FAME */}
        {currentTab === 'exercise-analytics' && (
          <div className="space-y-6">
            {/* Sub-navigation tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
              <button
                onClick={() => setAnalyticsSubTab('progression')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  analyticsSubTab === 'progression'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Exercise 1RM &amp; Volume Charts</span>
              </button>
              <button
                onClick={() => setAnalyticsSubTab('prs')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  analyticsSubTab === 'prs'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Personal Records Hall of Fame</span>
              </button>
            </div>

            {analyticsSubTab === 'progression' ? (
              <ExerciseAnalytics
                sessions={sessions}
                personalRecords={personalRecords}
                unit={unit}
              />
            ) : (
              <PersonalRecords
                records={personalRecords}
                sessions={sessions}
                unit={unit}
                onSelectExercise={(exId) => {
                  setAnalyticsSubTab('progression');
                }}
              />
            )}
          </div>
        )}

        {/* TAB 7: BODY METRICS & EXPORTABLE TRAINER REPORT */}
        {currentTab === 'body-metrics' && (
          <div className="space-y-6">
            {/* Sub-navigation tabs */}
            <div className="no-print flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
              <button
                onClick={() => setBodySubTab('metrics')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  bodySubTab === 'metrics'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>Body Composition &amp; Weigh-Ins</span>
              </button>
              <button
                onClick={() => setBodySubTab('report')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  bodySubTab === 'report'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 text-orange-400" />
                <span>Trainer Progress Report</span>
              </button>
            </div>

            {bodySubTab === 'metrics' ? (
              <BodyMetrics
                metrics={bodyMetrics}
                unit={unit}
                userHeightCm={userHeightCm}
                onAddMetric={(entry) => setBodyMetrics((prev) => [...prev, entry])}
                onOpenTrainerReport={() => setBodySubTab('report')}
              />
            ) : (
              <TrainerReport
                sessions={sessions}
                personalRecords={personalRecords}
                bodyMetrics={bodyMetrics}
                nutritionLog={nutritionLog}
                nutritionTargets={nutritionTargets}
                unit={unit}
              />
            )}
          </div>
        )}

        {/* TAB 8: GOOGLE DRIVE SYNC & OPEN CSV PORTABILITY */}
        {currentTab === 'cloud-sync' && (
          <CloudDriveSync
            dataBundle={{
              unit,
              activePlanId: activePlan.id,
              sessions,
              personalRecords,
              plans,
              bodyMetrics,
              todayNutrition: nutritionLog,
              nutritionHistory,
              nutritionTargets,
              enrolledProgress
            }}
            user={googleUser}
            accessToken={googleAccessToken}
            needsAuth={needsAuth}
            isLoggingIn={isLoggingIn}
            lastSyncedAt={lastSyncedAt}
            onGoogleLogin={handleGoogleLogin}
            onGoogleLogout={handleGoogleLogout}
            onRequireReauth={handleRequireReauth}
            onUpdateLastSynced={handleUpdateLastSynced}
            onRestoreDataPatch={handleRestoreDataPatch}
          />
        )}
      </main>

      {/* Floating Rest Period Countdown Timer */}
      {!isRestTimerDismissed && (
        <RestTimer
          initialSeconds={restInitialSeconds}
          secondsRemaining={restSecondsRemaining}
          isActive={isRestTimerActive}
          soundEnabled={soundEnabled}
          onTick={setRestSecondsRemaining}
          onToggleActive={() => setIsRestTimerActive(!isRestTimerActive)}
          onReset={(newSec) => {
            const sec = newSec || restInitialSeconds;
            setRestInitialSeconds(sec);
            setRestSecondsRemaining(sec);
            setIsRestTimerActive(true);
          }}
          onAdjustSeconds={(delta) => {
            setRestSecondsRemaining((prev) => Math.max(0, prev + delta));
          }}
          onDismiss={() => setIsRestTimerDismissed(true)}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
        />
      )}

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-athletic text-base font-bold text-white uppercase tracking-wider">AetherLift</span>
            <span>·</span>
            <span>Strength, Hypertrophy &amp; Athletic Conditioning Suite</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>KG / LBS Real-Time Conversion</span>
            <span>·</span>
            <span>Web Audio Synced Rest Timer</span>
            <span>·</span>
            <span>Exportable Coach PDF</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
