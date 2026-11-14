import React, { useState, useMemo, useEffect } from 'react';
import { 
  GuidedProgram, 
  ProgramGoal, 
  EnrolledProgramProgress, 
  ProgramWorkoutDay,
  OutsideActivityType,
  OutsideActivityConfig
} from '../types/workout';
import { GUIDED_PROGRAMS } from '../data/guidedPrograms';
import { 
  adaptProgramSchedule, 
  OUTSIDE_ACTIVITY_DETAILS 
} from '../utils/programScheduler';
import { 
  Award, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Play, 
  Dumbbell, 
  HeartPulse, 
  Flame, 
  ChevronRight, 
  Activity,
  Layers,
  Sparkles,
  Sliders,
  Check,
  Zap,
  Info,
  ShieldCheck,
  Droplet
} from 'lucide-react';

interface GuidedProgramsProps {
  enrolledProgress: EnrolledProgramProgress;
  onUpdateProgress: (progress: EnrolledProgramProgress) => void;
  onStartProgramWorkout: (day: ProgramWorkoutDay, programTitle: string) => void;
  onApplyCalorieOffsetToNutrition?: (additionalKcal: number) => void;
}

export const GuidedPrograms: React.FC<GuidedProgramsProps> = ({
  enrolledProgress,
  onUpdateProgress,
  onStartProgramWorkout,
  onApplyCalorieOffsetToNutrition
}) => {
  const [selectedGoal, setSelectedGoal] = useState<ProgramGoal | 'All'>('All');
  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    enrolledProgress.programId || GUIDED_PROGRAMS[0].id
  );
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1);
  const [syncAppliedMessage, setSyncAppliedMessage] = useState<string | null>(null);

  // User Frequency Preference (2, 3, 4, 5, 6 days/week)
  const [daysPerWeek, setDaysPerWeek] = useState<number>(() => {
    const saved = localStorage.getItem('aetherlift_user_days_per_week');
    return saved ? parseInt(saved, 10) : 3;
  });

  // User Outside-Gym Activity Preference
  const [outsideActivityType, setOutsideActivityType] = useState<OutsideActivityType>(() => {
    const saved = localStorage.getItem('aetherlift_outside_activity_type');
    return (saved as OutsideActivityType) || 'Running';
  });

  const [outsideSessionsPerWeek, setOutsideSessionsPerWeek] = useState<number>(() => {
    const saved = localStorage.getItem('aetherlift_outside_activity_sessions');
    return saved ? parseInt(saved, 10) : 2;
  });

  const [outsideIntensity, setOutsideIntensity] = useState<'Low' | 'Moderate' | 'High'>(() => {
    const saved = localStorage.getItem('aetherlift_outside_activity_intensity');
    return (saved as 'Low' | 'Moderate' | 'High') || 'Moderate';
  });

  // Save preferences
  useEffect(() => {
    localStorage.setItem('aetherlift_user_days_per_week', daysPerWeek.toString());
  }, [daysPerWeek]);

  useEffect(() => {
    localStorage.setItem('aetherlift_outside_activity_type', outsideActivityType);
  }, [outsideActivityType]);

  useEffect(() => {
    localStorage.setItem('aetherlift_outside_activity_sessions', outsideSessionsPerWeek.toString());
  }, [outsideSessionsPerWeek]);

  useEffect(() => {
    localStorage.setItem('aetherlift_outside_activity_intensity', outsideIntensity);
  }, [outsideIntensity]);

  // Compute active OutsideActivityConfig
  const outsideActivityConfig: OutsideActivityConfig = useMemo(() => {
    const details = OUTSIDE_ACTIVITY_DETAILS[outsideActivityType] || OUTSIDE_ACTIVITY_DETAILS.None;
    const intensityMultiplier = outsideIntensity === 'High' ? 1.25 : outsideIntensity === 'Low' ? 0.8 : 1.0;
    const estimatedKcal = Math.round(details.kcalPerSession * intensityMultiplier);

    return {
      type: outsideActivityType,
      sessionsPerWeek: outsideActivityType === 'None' ? 0 : outsideSessionsPerWeek,
      intensity: outsideIntensity,
      estimatedKcalBurnPerSession: estimatedKcal
    };
  }, [outsideActivityType, outsideSessionsPerWeek, outsideIntensity]);

  const provisionDetails = OUTSIDE_ACTIVITY_DETAILS[outsideActivityType] || OUTSIDE_ACTIVITY_DETAILS.None;
  const weeklyExtraBurnKcal = outsideActivityConfig.estimatedKcalBurnPerSession * outsideActivityConfig.sessionsPerWeek;
  const dailyAverageBurnKcal = Math.round(weeklyExtraBurnKcal / 7);

  // Dynamic programs adapting based on user's daysPerWeek and outsideActivity
  const adaptedPrograms = useMemo(() => {
    return GUIDED_PROGRAMS.map((baseProg) => {
      return adaptProgramSchedule(baseProg, daysPerWeek, outsideActivityConfig);
    });
  }, [daysPerWeek, outsideActivityConfig]);

  const activeProgram = adaptedPrograms.find((p) => p.id === selectedProgramId) || adaptedPrograms[0];
  const activeWeek = activeProgram.weeks.find((w) => w.weekNumber === selectedWeekNum) || activeProgram.weeks[0];

  const filteredPrograms = adaptedPrograms.filter((p) => {
    if (selectedGoal === 'All') return true;
    return p.goal === selectedGoal;
  });

  // Calculate completion percentage for the active program
  const totalDaysInProgram = activeProgram.weeks.reduce((sum, w) => {
    return sum + w.days.filter((d) => !d.isRestDay).length;
  }, 0);

  const completedDaysCount = Object.keys(enrolledProgress.completedWorkouts || {}).filter(
    (key) => key.startsWith('w')
  ).length;

  const completionPct = totalDaysInProgram > 0
    ? Math.min(100, Math.round((completedDaysCount / totalDaysInProgram) * 100))
    : 0;

  const isWorkoutCompleted = (weekNum: number, dayNum: number): boolean => {
    const key = `w${weekNum}_d${dayNum}`;
    return !!enrolledProgress.completedWorkouts?.[key];
  };

  const handleToggleWorkoutComplete = (weekNum: number, dayNum: number) => {
    const key = `w${weekNum}_d${dayNum}`;
    const currentCompleted = { ...(enrolledProgress.completedWorkouts || {}) };

    if (currentCompleted[key]) {
      delete currentCompleted[key];
    } else {
      currentCompleted[key] = {
        date: new Date().toISOString(),
        durationMinutes: 50
      };
    }

    onUpdateProgress({
      ...enrolledProgress,
      programId: activeProgram.id,
      completedWorkouts: currentCompleted
    });
  };

  const handleApplyCalorieOffset = () => {
    if (!onApplyCalorieOffsetToNutrition || dailyAverageBurnKcal <= 0) return;
    onApplyCalorieOffsetToNutrition(dailyAverageBurnKcal);
    setSyncAppliedMessage(`Added +${dailyAverageBurnKcal} kcal to daily nutrition targets.`);
    setTimeout(() => setSyncAppliedMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: INTERACTIVE USER QUESTIONNAIRE & PROGRAM TUNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="font-athletic text-2xl font-bold tracking-wide text-white uppercase flex items-center gap-2">
              <Sliders className="w-5 h-5 text-orange-500" />
              <span>Program Schedule &amp; Activity Personalization</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tell us your training frequency and external sport activities. All program blueprints adapt their volume, routine splits, and recovery automatically.
            </p>
          </div>

          <div className="text-xs font-mono text-orange-400 bg-orange-950/60 border border-orange-500/30 px-3 py-1.5 rounded-xl">
            Active: {daysPerWeek} Gym Days/Wk + {outsideActivityType !== 'None' ? `${outsideSessionsPerWeek}x ${outsideActivityType}` : 'Pure Lifting'}
          </div>
        </div>

        {/* Question 1: How many days per week do you workout? */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-orange-400" />
              <span>How many days per week do you workout in the gym?</span>
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              {daysPerWeek === 2 && '2 Days · Full Body Compound Power Split'}
              {daysPerWeek === 3 && '3 Days · Full Body A/B/C High-Frequency Split'}
              {daysPerWeek === 4 && '4 Days · Upper / Lower Heavy Strength Split'}
              {daysPerWeek === 5 && '5 Days · Power & Hypertrophy PHAT Split'}
              {daysPerWeek === 6 && '6 Days · Push / Pull / Legs Hypertrophy 2x'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[2, 3, 4, 5, 6].map((num) => {
              const isSelected = daysPerWeek === num;
              return (
                <button
                  key={num}
                  onClick={() => setDaysPerWeek(num)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-950 font-bold'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-athletic text-xl font-bold">{num} Days</span>
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <div className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-orange-100' : 'text-slate-500'}`}>
                    {num === 2 && 'Full Body 2x'}
                    {num === 3 && 'Full Body 3x'}
                    {num === 4 && 'Upper / Lower'}
                    {num === 5 && 'Power + Pump'}
                    {num === 6 && 'PPL x 2 Split'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question 2: Outside Gym Activities & Sports */}
        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-emerald-400" />
              <span>Do you perform any sports or physical activity outside the gym?</span>
            </label>
            <span className="text-[11px] text-slate-400">
              Integrated for recovery &amp; caloric expenditure
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Activity Type Dropdown */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Activity / Sport Type</span>
              <select
                value={outsideActivityType}
                onChange={(e) => setOutsideActivityType(e.target.value as OutsideActivityType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-orange-500"
              >
                <option value="None">None (Pure Gym Lifting Only)</option>
                <option value="Running">Running / Jogging (5k-21k+)</option>
                <option value="Cycling">Cycling / Road Biking</option>
                <option value="Swimming">Swimming / Aquatics</option>
                <option value="Recreational Sports">Recreational Sports (Soccer, Basketball, Tennis)</option>
                <option value="Martial Arts">Martial Arts / Boxing / BJJ</option>
                <option value="High-Step Walking">High-Step Walking (10k-20k steps/day)</option>
                <option value="Physical Labor">Heavy Physical Labor / Trade Job</option>
              </select>
            </div>

            {/* Sessions per Week */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Weekly Outside Frequency</span>
              <select
                disabled={outsideActivityType === 'None'}
                value={outsideSessionsPerWeek}
                onChange={(e) => setOutsideSessionsPerWeek(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-orange-500 disabled:opacity-40"
              >
                <option value={1}>1 session / week</option>
                <option value={2}>2 sessions / week (Recommended)</option>
                <option value={3}>3 sessions / week</option>
                <option value={4}>4+ sessions / week</option>
              </select>
            </div>

            {/* Intensity Level */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Average Session Intensity</span>
              <select
                disabled={outsideActivityType === 'None'}
                value={outsideIntensity}
                onChange={(e) => setOutsideIntensity(e.target.value as 'Low' | 'Moderate' | 'High')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-orange-500 disabled:opacity-40"
              >
                <option value="Low">Low (Zone 1-2 Recovery / Casual)</option>
                <option value="Moderate">Moderate (Steady Aerobic / Tempo)</option>
                <option value="High">High (HIIT / Hard Match Play)</option>
              </select>
            </div>
          </div>

          {/* Provisions & Goal Integration Callout */}
          {outsideActivityType !== 'None' && (
            <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-4 mt-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Provisions for {provisionDetails.title}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Calculated energy offset &amp; neuromuscular recovery adjustments
                    </span>
                  </div>
                </div>

                {/* Energy Offset & Sync Button */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Extra Caloric Burn</span>
                    <span className="text-xs font-mono font-bold text-orange-400">
                      +{outsideActivityConfig.estimatedKcalBurnPerSession} kcal/session (~+{dailyAverageBurnKcal} kcal/day)
                    </span>
                  </div>

                  {onApplyCalorieOffsetToNutrition && (
                    <button
                      onClick={handleApplyCalorieOffset}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition-colors whitespace-nowrap"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Sync +{dailyAverageBurnKcal} kcal to Nutrition</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Success Notification */}
              {syncAppliedMessage && (
                <div className="mt-2 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>{syncAppliedMessage}</span>
                </div>
              )}

              {/* Provisions Guidance Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-xs">
                {/* Guidance 1: Spacing & Fatigue */}
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-[10px] uppercase font-bold text-orange-400 block mb-1">
                    Neuromuscular Spacing
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {provisionDetails.recommendedSpacing}
                  </p>
                </div>

                {/* Guidance 2: Nutrition & Carbohydrates */}
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                    Carbohydrate &amp; Hydration Bonus
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Add +{provisionDetails.carbGramsBonus}g carbohydrates and +{provisionDetails.hydrationMlBonus}ml water on session days to replenish glycogen.
                  </p>
                </div>

                {/* Guidance 3: Biomechanical Care */}
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">
                    Injury Prevention Cues
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {provisionDetails.recoveryCues[0]}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: GOAL BLUEPRINTS CATALOG */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="font-athletic text-2xl font-bold tracking-wide text-white uppercase flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-500" />
              <span>Goal Blueprints (Tuned to {daysPerWeek} Days/Week)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a target goal. Workouts, sets, reps, and recovery schedules are calibrated for your {daysPerWeek}-day frequency.
            </p>
          </div>

          {/* Goal Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {(['All', 'Beginner Strength', 'Fat Loss', 'Marathon Prep'] as const).map((goal) => (
              <button
                key={goal}
                onClick={() => setSelectedGoal(goal)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors border ${
                  selectedGoal === goal
                    ? 'bg-orange-500 text-white border-orange-400'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        {/* Program Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {filteredPrograms.map((prog) => {
            const isSelected = prog.id === activeProgram.id;
            const isEnrolled = enrolledProgress.programId === prog.id;

            return (
              <div
                key={prog.id}
                onClick={() => setSelectedProgramId(prog.id)}
                className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-orange-950/20 border-orange-500 shadow-md shadow-orange-950'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-3 border border-slate-800">
                    <img
                      src={prog.imageUrl}
                      alt={prog.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
                        {prog.level}
                      </span>
                      <span className="text-[10px] font-semibold text-orange-400 bg-orange-950/90 px-2 py-0.5 rounded border border-orange-500/30">
                        {prog.durationWeeks} Weeks
                      </span>
                    </div>
                  </div>

                  <h3 className="font-athletic text-lg font-bold text-white uppercase leading-tight">
                    {prog.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {prog.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-orange-400 font-mono font-bold text-[11px]">
                    {prog.daysPerWeek} gym days/wk
                  </span>
                  {isEnrolled && (
                    <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: SELECTED PROGRAM DEEP-DIVE & DYNAMIC 7-DAY SCHEDULE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-6">
        {/* Program Header & Enrollment Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                {activeProgram.goal} Blueprint
              </span>
              <span>·</span>
              <span className="text-xs text-slate-400">{activeProgram.level} Level</span>
              <span>·</span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">{daysPerWeek} Sessions/Wk</span>
            </div>
            <h3 className="font-athletic text-3xl font-extrabold tracking-wide text-white uppercase mt-0.5">
              {activeProgram.title}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              {activeProgram.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {enrolledProgress.programId === activeProgram.id ? (
              <div className="bg-emerald-950/30 border border-emerald-500/50 px-4 py-2 rounded-xl text-center">
                <div className="text-[10px] uppercase font-bold text-emerald-400">Program Progress</div>
                <div className="font-mono text-base font-bold text-white">
                  {completedDaysCount} / {totalDaysInProgram} completed ({completionPct}%)
                </div>
              </div>
            ) : (
              <button
                onClick={() =>
                  onUpdateProgress({
                    programId: activeProgram.id,
                    enrolledDate: new Date().toISOString().split('T')[0],
                    completedWorkouts: {}
                  })
                }
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-950 transition-all"
              >
                Enroll in This Program
              </button>
            )}
          </div>
        </div>

        {/* Key Pillars & Method */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Curriculum Overview &amp; Strategy ({daysPerWeek}-Day Architecture)
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {activeProgram.overview.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-orange-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Target Outcomes &amp; Adaptations
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {activeProgram.keyBenefits.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Phase Summary & Daily Workouts Outline */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-athletic text-xl font-bold tracking-wide text-white uppercase">
                {activeWeek.phaseTitle}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">{activeWeek.focusSummary}</p>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Week {selectedWeekNum} of {activeProgram.durationWeeks}
            </div>
          </div>

          {/* Daily Workouts Accordion / Cards */}
          <div className="space-y-4">
            {activeWeek.days.map((day) => {
              const completed = isWorkoutCompleted(activeWeek.weekNumber, day.dayNumber);
              const isOutsideDay = day.title.includes(provisionDetails.title) || (day.cardioGuidance && day.exercises.length === 0);

              return (
                <div
                  key={day.dayNumber}
                  className={`border rounded-xl p-4 transition-all ${
                    completed
                      ? 'bg-emerald-950/10 border-emerald-500/40'
                      : isOutsideDay
                      ? 'bg-blue-950/20 border-blue-500/40'
                      : day.isRestDay
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-orange-400 font-athletic uppercase">
                          {day.dayLabel}
                        </span>
                        <span className="text-xs text-slate-500">·</span>
                        <span className="text-xs text-slate-300 font-medium">{day.focus}</span>
                        {isOutsideDay && (
                          <span className="text-[10px] font-bold text-blue-400 bg-blue-950/80 border border-blue-500/30 px-2 py-0.5 rounded">
                            External Activity
                          </span>
                        )}
                      </div>
                      <h4 className="font-athletic text-lg font-bold text-white uppercase mt-0.5">
                        {day.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {day.estimatedDurationMin}m
                      </span>

                      {!day.isRestDay && day.exercises.length > 0 && (
                        <>
                          <button
                            onClick={() => onStartProgramWorkout(day, activeProgram.title)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-transform active:scale-95"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Start in Logger</span>
                          </button>

                          <button
                            onClick={() =>
                              handleToggleWorkoutComplete(activeWeek.weekNumber, day.dayNumber)
                            }
                            className={`p-1.5 rounded-lg border transition-colors ${
                              completed
                                ? 'bg-emerald-500 text-white border-emerald-400'
                                : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-white'
                            }`}
                            title={completed ? 'Mark Incomplete' : 'Mark Completed'}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Outside activity day completion button */}
                      {isOutsideDay && (
                        <button
                          onClick={() =>
                            handleToggleWorkoutComplete(activeWeek.weekNumber, day.dayNumber)
                          }
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                            completed
                              ? 'bg-emerald-500 text-white border-emerald-400'
                              : 'bg-blue-600/80 hover:bg-blue-600 text-white border-blue-500'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{completed ? 'Activity Logged' : 'Log Outside Session'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cardio Guidance / Outside Activity Instructions */}
                  {day.cardioGuidance && (
                    <div className="mt-3 p-3 rounded-lg bg-orange-950/20 border border-orange-500/30 flex items-start gap-2 text-xs text-orange-200">
                      <HeartPulse className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-orange-300">Activity &amp; Recovery Protocol:</strong>{' '}
                        {day.cardioGuidance}
                      </div>
                    </div>
                  )}

                  {/* Exercises Table */}
                  {day.exercises.length > 0 && (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1.5">
                            <th className="py-1.5 px-2">Exercise</th>
                            <th className="py-1.5 px-2 text-center w-20">Sets</th>
                            <th className="py-1.5 px-2 text-center w-24">Reps</th>
                            <th className="py-1.5 px-2 text-center w-24">Rest Period</th>
                            <th className="py-1.5 px-2 text-center w-20">Target RPE</th>
                            <th className="py-1.5 px-2 hidden md:table-cell">Notes &amp; Cues</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 text-slate-300">
                          {day.exercises.map((ex, exIdx) => (
                            <tr key={exIdx} className="hover:bg-slate-800/30">
                              <td className="py-2 px-2 font-semibold text-white">
                                {ex.exerciseName}
                              </td>
                              <td className="py-2 px-2 text-center font-mono font-bold text-orange-400">
                                {ex.sets}
                              </td>
                              <td className="py-2 px-2 text-center font-mono">
                                {ex.reps}
                              </td>
                              <td className="py-2 px-2 text-center font-mono text-slate-400">
                                {ex.restSeconds}s
                              </td>
                              <td className="py-2 px-2 text-center font-mono">
                                {ex.rpe ? `RPE ${ex.rpe}` : '—'}
                              </td>
                              <td className="py-2 px-2 hidden md:table-cell text-slate-400 text-[11px]">
                                {ex.notes || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Coaching tips */}
                  {day.coachingTips && day.coachingTips.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="text-orange-400 font-bold uppercase">Coach Tip:</span>
                      <span>{day.coachingTips.join(' ')}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
