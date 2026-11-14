import { 
  GuidedProgram, 
  ProgramWorkoutDay, 
  ProgramExercise, 
  OutsideActivityConfig, 
  OutsideActivityType 
} from '../types/workout';

// Activity-specific coaching advice and energy expenditure estimates
export interface ActivityProvisionDetails {
  title: string;
  kcalPerSession: number;
  carbGramsBonus: number;
  hydrationMlBonus: number;
  fatigueGuidance: string;
  recommendedSpacing: string;
  recoveryCues: string[];
}

export const OUTSIDE_ACTIVITY_DETAILS: Record<OutsideActivityType, ActivityProvisionDetails> = {
  None: {
    title: 'Pure Gym Training',
    kcalPerSession: 0,
    carbGramsBonus: 0,
    hydrationMlBonus: 0,
    fatigueGuidance: 'All recovery capacity is directed strictly into resistance training and progressive overload.',
    recommendedSpacing: 'Standard 48-hour recovery between identical muscle groups.',
    recoveryCues: [
      'Focus 100% of systemic energy on lifting intensity and muscle protein synthesis.',
      'Maintain standard 7-8 hours sleep and target macros.'
    ]
  },
  Running: {
    title: 'Running / Jogging',
    kcalPerSession: 450,
    carbGramsBonus: 50,
    hydrationMlBonus: 750,
    fatigueGuidance: 'High eccentric impact on lower joints and calf/quad tendons. Concurrent interference can blunt leg hypertrophy if not timed correctly.',
    recommendedSpacing: 'Space heavy squats and deadlifts at least 24-48 hours away from high-intensity or long weekend runs.',
    recoveryCues: [
      'Add 40-60g fast-digesting carbohydrates within 60 mins of finishing runs to restock liver/muscle glycogen.',
      'Incorporate single-leg calf raises and tibialis stretches to shield Achilles tendons.',
      'Prioritize foam rolling on IT bands, hip flexors, and glutes.'
    ]
  },
  Cycling: {
    title: 'Cycling / Road Biking',
    kcalPerSession: 420,
    carbGramsBonus: 45,
    hydrationMlBonus: 800,
    fatigueGuidance: 'Low joint impact but heavy concentric quadriceps demand and chronic hip-flexor shortening from the saddle.',
    recommendedSpacing: 'Keep high-cadence spin days on active rest days; separate heavy leg press/squats by 24 hours.',
    recoveryCues: [
      'Prioritize hip extension (Romanian Deadlifts, Glute Bridges) in the gym to counterbalance quad dominance.',
      'Stretch psoas and chest muscles to undo forward-hunched cycling posture.',
      'Hydrate with electrolytes (sodium + potassium) after rides over 60 minutes.'
    ]
  },
  Swimming: {
    title: 'Swimming / Aquatics',
    kcalPerSession: 400,
    carbGramsBonus: 40,
    hydrationMlBonus: 600,
    fatigueGuidance: 'Zero joint impact, high latissimus and anterior deltoid engagement. Excellent for cardiovascular conditioning without skeletal stress.',
    recommendedSpacing: 'Schedule swim sessions on non-pull days or as active recovery flushes.',
    recoveryCues: [
      'Include Cable Face Pulls and external rotator cuff drills to prevent swimmer’s shoulder impingement.',
      'Take advantage of hydrostatic water pressure for full-body lymphatic drainage and muscle relaxation.'
    ]
  },
  'Recreational Sports': {
    title: 'Recreational Sports (Soccer, Basketball, Tennis, Pickleball)',
    kcalPerSession: 500,
    carbGramsBonus: 55,
    hydrationMlBonus: 900,
    fatigueGuidance: 'High anaerobic burst and multi-directional decelerations. High demand on adductors, hamstrings, and ankles.',
    recommendedSpacing: 'Schedule sports matches on non-heavy leg days to avoid knee shear stress or pulled hamstrings.',
    recoveryCues: [
      'Warm up with dynamic groin and hip mobility before match play.',
      'Consume electrolytes and hydration immediately post-match.',
      'Allow extra CNS recovery buffer if playing consecutive competitive tournaments.'
    ]
  },
  'Martial Arts': {
    title: 'Martial Arts / Boxing / BJJ',
    kcalPerSession: 550,
    carbGramsBonus: 60,
    hydrationMlBonus: 1000,
    fatigueGuidance: 'High grip, neck, thoracic, and central nervous system fatigue from grappling and striking.',
    recommendedSpacing: 'Separate heavy compound deadlifts and bench pressing from intense sparring days.',
    recoveryCues: [
      'Deliberately keep gym RPE at 7-8 to preserve energy for sparring reflexes.',
      'Focus gym work on core rotational stability (Planks, Pallof Press) and posterior chain armor.',
      'Increase magnesium and water intake to prevent evening muscle cramping.'
    ]
  },
  'High-Step Walking': {
    title: 'High-Step Walking / Hiking (10k-20k steps)',
    kcalPerSession: 350,
    carbGramsBonus: 30,
    hydrationMlBonus: 500,
    fatigueGuidance: 'Ideal Non-Exercise Activity Thermogenesis (NEAT). Accelerates fat burning without CNS fatigue or muscle loss.',
    recommendedSpacing: 'Can be performed daily with zero interference on heavy lifting progression.',
    recoveryCues: [
      'Wear supportive footwear with adequate arch support.',
      'Acknowledge additional 250-400 kcal daily expenditure in your nutrition targets.',
      'Perform light calf and plantar fascia rolling before bed.'
    ]
  },
  'Physical Labor': {
    title: 'Heavy Physical Labor / Trade Job',
    kcalPerSession: 600,
    carbGramsBonus: 70,
    hydrationMlBonus: 1200,
    fatigueGuidance: 'Significant daily systemic spinal loading and forearms/lower back fatigue from occupational duties.',
    recommendedSpacing: 'Keep lifting sessions concise (40-45 mins) with higher intensity per set but lower total junk volume.',
    recoveryCues: [
      'Prioritize spinal decompression (dead hangs from pull-up bar for 60-90s post-work).',
      'Increase caloric intake significantly (+400-600 kcal) to prevent involuntary muscle catabolism.',
      'Ensure 8+ hours of quality deep sleep for joint and disc recovery.'
    ]
  }
};

// Generate adapted week days based on requested frequency and outside activity
export const adaptProgramSchedule = (
  baseProgram: GuidedProgram,
  daysPerWeek: number,
  outsideActivity: OutsideActivityConfig
): GuidedProgram => {
  const provision = OUTSIDE_ACTIVITY_DETAILS[outsideActivity.type] || OUTSIDE_ACTIVITY_DETAILS.None;
  const hasOutsideActivity = outsideActivity.type !== 'None' && outsideActivity.sessionsPerWeek > 0;

  // Build adapted weeks
  const adaptedWeeks = baseProgram.weeks.map((week) => {
    const originalGymDays = week.days.filter((d) => !d.isRestDay);
    
    // Create new 7-day template
    const newDays: ProgramWorkoutDay[] = [];

    if (daysPerWeek === 2) {
      // 2-Day Split: Full Body A & Full Body B
      const day1Exercises = originalGymDays[0]?.exercises.slice(0, 5) || [
        { exerciseId: 'barbell-back-squat', exerciseName: 'Barbell Back Squat', sets: 4, reps: '6-8', restSeconds: 150, rpe: 8 },
        { exerciseId: 'barbell-bench-press', exerciseName: 'Barbell Flat Bench Press', sets: 4, reps: '6-8', restSeconds: 120, rpe: 8 },
        { exerciseId: 'barbell-bent-over-row', exerciseName: 'Barbell Bent-Over Row', sets: 4, reps: '8', restSeconds: 90, rpe: 8 },
        { exerciseId: 'romanian-deadlift', exerciseName: 'Romanian Deadlift', sets: 3, reps: '8-10', restSeconds: 120, rpe: 8 },
        { exerciseId: 'hanging-leg-raise', exerciseName: 'Hanging Leg & Knee Raise', sets: 3, reps: '12', restSeconds: 60, rpe: 8 }
      ];

      const day2Exercises = originalGymDays[1]?.exercises.slice(0, 5) || [
        { exerciseId: 'conventional-deadlift', exerciseName: 'Conventional Barbell Deadlift', sets: 3, reps: '5', restSeconds: 180, rpe: 8.5 },
        { exerciseId: 'overhead-press', exerciseName: 'Standing Barbell Overhead Press', sets: 4, reps: '6-8', restSeconds: 120, rpe: 8 },
        { exerciseId: 'pull-ups', exerciseName: 'Overhand Pull-ups', sets: 4, reps: '6-10', restSeconds: 90, rpe: 8.5 },
        { exerciseId: 'leg-press', exerciseName: 'Incline Leg Press', sets: 3, reps: '10-12', restSeconds: 90, rpe: 8 },
        { exerciseId: 'dumbbell-lateral-raise', exerciseName: 'Dumbbell Lateral Raise', sets: 4, reps: '12-15', restSeconds: 60, rpe: 9 }
      ];

      newDays.push({
        dayNumber: 1,
        title: 'Full Body Compound Primary (Squat & Press)',
        dayLabel: 'Day 1: Full Body High Mechanical Tension',
        focus: 'Quads, Chest, Upper Back, Posterior Chain',
        estimatedDurationMin: 60,
        isRestDay: false,
        coachingTips: [
          'High efficiency session: ensure 100% effort on compound sets since frequency is 2x/week.',
          'Hit 2 reps in reserve on all primary lifts.'
        ],
        exercises: day1Exercises
      });

      newDays.push({
        dayNumber: 2,
        title: hasOutsideActivity ? `${provision.title} Session` : 'Active Rest & Recovery',
        dayLabel: hasOutsideActivity ? `Day 2: ${provision.title}` : 'Day 2: Rest & Tissue Regeneration',
        focus: hasOutsideActivity ? 'Endurance & Active Caloric Burn' : 'Recovery & Walking',
        estimatedDurationMin: hasOutsideActivity ? 45 : 30,
        isRestDay: !hasOutsideActivity,
        cardioGuidance: hasOutsideActivity ? `${provision.fatigueGuidance}` : 'Light 20-30 min mobility or walk.',
        coachingTips: [
          hasOutsideActivity ? provision.recommendedSpacing : 'Keep systemic stress low to rebuild muscle glycogen.'
        ],
        exercises: []
      });

      newDays.push({
        dayNumber: 3,
        title: 'Mobility & Spinal Decompression',
        dayLabel: 'Day 3: Mid-Week Restoration',
        focus: 'Hip flexors, Hamstring mobility, Core',
        estimatedDurationMin: 20,
        isRestDay: true,
        coachingTips: ['Hydrate well and prepare for Day 4 compound workout.'],
        exercises: []
      });

      newDays.push({
        dayNumber: 4,
        title: 'Full Body Compound Secondary (Hinge & Vertical)',
        dayLabel: 'Day 4: Posterior Chain & Shoulder Armor',
        focus: 'Back, Hamstrings, Deltoids, Arms',
        estimatedDurationMin: 60,
        isRestDay: false,
        coachingTips: [
          'Deadlift warmup is paramount. Brace abdominal wall before every rep.',
          'Super-set arm isolation if short on time.'
        ],
        exercises: day2Exercises
      });

      newDays.push({
        dayNumber: 5,
        title: hasOutsideActivity && outsideActivity.sessionsPerWeek >= 2 ? `${provision.title} Conditioning` : 'Active Flush & Rest',
        dayLabel: 'Day 5: Restoration / Cross-Training',
        focus: 'Cardiovascular Health & Recovery',
        estimatedDurationMin: 40,
        isRestDay: !(hasOutsideActivity && outsideActivity.sessionsPerWeek >= 2),
        cardioGuidance: provision.fatigueGuidance,
        coachingTips: ['Maintain proper hydration and carbohydrate replenishment.'],
        exercises: []
      });

      newDays.push({
        dayNumber: 6,
        title: 'Weekend Active Lifestyle & Walking',
        dayLabel: 'Day 6: Outdoor Movement',
        focus: 'General Health & Steps',
        estimatedDurationMin: 45,
        isRestDay: true,
        coachingTips: ['Hit 8,000 to 10,000 casual steps outdoors.'],
        exercises: []
      });

      newDays.push({
        dayNumber: 7,
        title: 'Macro Review & Deep Sleep Recovery',
        dayLabel: 'Day 7: Weekly Check-in',
        focus: 'Nutrition Targets & Central Nervous System Recovery',
        estimatedDurationMin: 15,
        isRestDay: true,
        coachingTips: ['Review week adherence and prepare meal plan for upcoming week.'],
        exercises: []
      });

    } else if (daysPerWeek === 3) {
      // 3-Day Split: Full Body A / B / C or Push / Pull / Legs
      const day1 = originalGymDays[0] || {
        dayNumber: 1,
        title: 'Workout A - Squat & Push Foundation',
        dayLabel: 'Day 1: Heavy Squat & Bench',
        focus: 'Quads, Chest, Upper Back',
        estimatedDurationMin: 55,
        isRestDay: false,
        coachingTips: ['Pause at chest on bench press.', 'Keep chest tall in the bottom of squat.'],
        exercises: [
          { exerciseId: 'barbell-back-squat', exerciseName: 'Barbell Back Squat', sets: 4, reps: '6-8', restSeconds: 150, rpe: 8 },
          { exerciseId: 'barbell-bench-press', exerciseName: 'Barbell Flat Bench Press', sets: 4, reps: '6-8', restSeconds: 120, rpe: 8 },
          { exerciseId: 'barbell-bent-over-row', exerciseName: 'Barbell Bent-Over Row', sets: 4, reps: '8', restSeconds: 90, rpe: 8 },
          { exerciseId: 'hanging-leg-raise', exerciseName: 'Hanging Leg & Knee Raise', sets: 3, reps: '12', restSeconds: 60, rpe: 8 }
        ]
      };

      const day2 = originalGymDays[1] || {
        dayNumber: 3,
        title: 'Workout B - Hinge & Vertical Pull',
        dayLabel: 'Day 3: Deadlift & Overhead Strength',
        focus: 'Hamstrings, Lats, Shoulders',
        estimatedDurationMin: 55,
        isRestDay: false,
        coachingTips: ['Reset hips between deadlift reps.', 'Lock out barbell overhead with head through the window.'],
        exercises: [
          { exerciseId: 'conventional-deadlift', exerciseName: 'Conventional Barbell Deadlift', sets: 3, reps: '5', restSeconds: 180, rpe: 8.5 },
          { exerciseId: 'overhead-press', exerciseName: 'Standing Barbell Overhead Press', sets: 4, reps: '6-8', restSeconds: 120, rpe: 8 },
          { exerciseId: 'pull-ups', exerciseName: 'Overhand Pull-ups', sets: 4, reps: '6-10', restSeconds: 90, rpe: 8.5 },
          { exerciseId: 'barbell-bicep-curl', exerciseName: 'Barbell Bicep Curl', sets: 3, reps: '10', restSeconds: 60, rpe: 9 }
        ]
      };

      const day3 = originalGymDays[2] || {
        dayNumber: 5,
        title: 'Workout C - Unilateral & Hypertrophy Overload',
        dayLabel: 'Day 5: Dumbbell & Isolation Finish',
        focus: 'Glutes, Delts, Triceps, Calves',
        estimatedDurationMin: 50,
        isRestDay: false,
        coachingTips: ['Keep torso upright on split squats.', 'Controlled eccentric on lateral raises.'],
        exercises: [
          { exerciseId: 'bulgarian-split-squat', exerciseName: 'Bulgarian Split Squat', sets: 3, reps: '8-10', restSeconds: 90, rpe: 8.5 },
          { exerciseId: 'incline-dumbbell-press', exerciseName: 'Incline Dumbbell Press', sets: 3, reps: '8-10', restSeconds: 90, rpe: 8 },
          { exerciseId: 'dumbbell-lateral-raise', exerciseName: 'Dumbbell Lateral Raise', sets: 4, reps: '12-15', restSeconds: 60, rpe: 9 },
          { exerciseId: 'triceps-cable-pushdown', exerciseName: 'Triceps Cable Rope Pushdown', sets: 3, reps: '12-15', restSeconds: 60, rpe: 9 },
          { exerciseId: 'standing-calf-raise', exerciseName: 'Standing Calf Raise', sets: 4, reps: '15', restSeconds: 60, rpe: 9 }
        ]
      };

      newDays.push({ ...day1, dayNumber: 1 });
      newDays.push({
        dayNumber: 2,
        title: hasOutsideActivity ? `${provision.title} (Session 1)` : 'Rest & Tissue Recovery',
        dayLabel: hasOutsideActivity ? `Day 2: ${provision.title}` : 'Day 2: Rest & Hydration',
        focus: hasOutsideActivity ? 'Cardio Conditioning & Energy Burn' : 'Restoration',
        estimatedDurationMin: hasOutsideActivity ? 45 : 20,
        isRestDay: !hasOutsideActivity,
        cardioGuidance: hasOutsideActivity ? provision.fatigueGuidance : undefined,
        coachingTips: [hasOutsideActivity ? provision.recommendedSpacing : 'Rehydrate and sleep at least 7.5 hours.'],
        exercises: []
      });
      newDays.push({ ...day2, dayNumber: 3 });
      newDays.push({
        dayNumber: 4,
        title: 'Active Recovery & Mobility Flow',
        dayLabel: 'Day 4: Mid-Week Restoration',
        focus: 'Spine decompression, Hips, Ankles',
        estimatedDurationMin: 25,
        isRestDay: true,
        coachingTips: ['Perform 10 minutes of hip 90/90s and world’s greatest stretch.'],
        exercises: []
      });
      newDays.push({ ...day3, dayNumber: 5 });
      newDays.push({
        dayNumber: 6,
        title: hasOutsideActivity && outsideActivity.sessionsPerWeek >= 2 ? `${provision.title} (Session 2)` : 'Weekend Active Recovery',
        dayLabel: 'Day 6: Outside Activity & Mobility',
        focus: hasOutsideActivity ? 'Endurance & Skill Play' : 'Walking & Sunlight',
        estimatedDurationMin: hasOutsideActivity ? 50 : 30,
        isRestDay: !(hasOutsideActivity && outsideActivity.sessionsPerWeek >= 2),
        cardioGuidance: provision.fatigueGuidance,
        coachingTips: [provision.recoveryCues[0]],
        exercises: []
      });
      newDays.push({
        dayNumber: 7,
        title: 'Rest & Nutrition Planning',
        dayLabel: 'Day 7: Weekly Reflection',
        focus: 'Caloric Targets & Macro Review',
        estimatedDurationMin: 15,
        isRestDay: true,
        coachingTips: ['Log your body weight and review adherence analytics.'],
        exercises: []
      });

    } else if (daysPerWeek === 4) {
      // 4-Day Split: Upper A, Lower A, Upper B, Lower B
      newDays.push({
        dayNumber: 1,
        title: 'Upper Body Power A (Bench & Row Focus)',
        dayLabel: 'Day 1: Heavy Upper Strength',
        focus: 'Chest, Back, Shoulders, Triceps',
        estimatedDurationMin: 55,
        isRestDay: false,
        coachingTips: ['Explosive concentric phase on bench press.', 'Retract scapulae fully on row.'],
        exercises: [
          { exerciseId: 'barbell-bench-press', exerciseName: 'Barbell Flat Bench Press', sets: 4, reps: '5', restSeconds: 150, rpe: 8.5 },
          { exerciseId: 'barbell-bent-over-row', exerciseName: 'Barbell Bent-Over Row', sets: 4, reps: '6', restSeconds: 120, rpe: 8 },
          { exerciseId: 'overhead-press', exerciseName: 'Standing Barbell Overhead Press', sets: 3, reps: '6-8', restSeconds: 90, rpe: 8 },
          { exerciseId: 'lat-pulldown', exerciseName: 'Wide-Grip Lat Pulldown', sets: 3, reps: '8-10', restSeconds: 75, rpe: 8 }
        ]
      });

      newDays.push({
        dayNumber: 2,
        title: 'Lower Body Power A (Squat & Posterior)',
        dayLabel: 'Day 2: Heavy Lower Strength',
        focus: 'Quads, Hamstrings, Glutes, Calves',
        estimatedDurationMin: 55,
        isRestDay: false,
        coachingTips: ['Brace core 360-degrees before descent.', 'Drive feet through the floor on squat.'],
        exercises: [
          { exerciseId: 'barbell-back-squat', exerciseName: 'Barbell Back Squat', sets: 4, reps: '5', restSeconds: 180, rpe: 8.5 },
          { exerciseId: 'romanian-deadlift', exerciseName: 'Romanian Deadlift', sets: 3, reps: '8', restSeconds: 120, rpe: 8 },
          { exerciseId: 'leg-press', exerciseName: 'Incline Leg Press', sets: 3, reps: '10', restSeconds: 90, rpe: 8 },
          { exerciseId: 'standing-calf-raise', exerciseName: 'Standing Calf Raise', sets: 4, reps: '12-15', restSeconds: 60, rpe: 8.5 }
        ]
      });

      newDays.push({
        dayNumber: 3,
        title: hasOutsideActivity ? `${provision.title} Conditioning` : 'Mid-Week Rest & Recharge',
        dayLabel: hasOutsideActivity ? `Day 3: ${provision.title}` : 'Day 3: Active Recovery',
        focus: hasOutsideActivity ? 'Aerobic Capacity & Energy Output' : 'Restoration',
        estimatedDurationMin: hasOutsideActivity ? 45 : 20,
        isRestDay: !hasOutsideActivity,
        cardioGuidance: provision.fatigueGuidance,
        coachingTips: [provision.recommendedSpacing],
        exercises: []
      });

      newDays.push({
        dayNumber: 4,
        title: 'Upper Body Hypertrophy B (Incline & Arms)',
        dayLabel: 'Day 4: Upper Volume & Density',
        focus: 'Chest, Lats, Deltoids, Biceps, Triceps',
        estimatedDurationMin: 50,
        isRestDay: false,
        coachingTips: ['Deep chest stretch on dumbbell incline press.', 'Keep elbows pinned on curls.'],
        exercises: [
          { exerciseId: 'incline-dumbbell-press', exerciseName: 'Incline Dumbbell Press', sets: 4, reps: '8-10', restSeconds: 90, rpe: 8 },
          { exerciseId: 'pull-ups', exerciseName: 'Overhand Pull-ups', sets: 4, reps: '8', restSeconds: 90, rpe: 8.5 },
          { exerciseId: 'dumbbell-lateral-raise', exerciseName: 'Dumbbell Lateral Raise', sets: 4, reps: '12-15', restSeconds: 60, rpe: 9 },
          { exerciseId: 'barbell-bicep-curl', exerciseName: 'Barbell Bicep Curl', sets: 3, reps: '10', restSeconds: 60, rpe: 8.5 },
          { exerciseId: 'triceps-cable-pushdown', exerciseName: 'Triceps Cable Rope Pushdown', sets: 3, reps: '12', restSeconds: 60, rpe: 9 }
        ]
      });

      newDays.push({
        dayNumber: 5,
        title: 'Lower Body & Posterior B (Deadlift & Unilateral)',
        dayLabel: 'Day 5: Posterior Chain & Core Armor',
        focus: 'Back, Hamstrings, Glutes, Abs',
        estimatedDurationMin: 50,
        isRestDay: false,
        coachingTips: ['Legs locked out cleanly with glutes engaged on deadlifts.', 'Strict knee alignment on split squats.'],
        exercises: [
          { exerciseId: 'conventional-deadlift', exerciseName: 'Conventional Barbell Deadlift', sets: 3, reps: '5', restSeconds: 180, rpe: 8.5 },
          { exerciseId: 'bulgarian-split-squat', exerciseName: 'Bulgarian Split Squat', sets: 3, reps: '8-10', restSeconds: 90, rpe: 8 },
          { exerciseId: 'leg-press', exerciseName: 'Incline Leg Press', sets: 3, reps: '12', restSeconds: 90, rpe: 8 },
          { exerciseId: 'hanging-leg-raise', exerciseName: 'Hanging Leg & Knee Raise', sets: 3, reps: '12', restSeconds: 60, rpe: 8 }
        ]
      });

      newDays.push({
        dayNumber: 6,
        title: hasOutsideActivity && outsideActivity.sessionsPerWeek >= 2 ? `${provision.title} (Weekend Match/Play)` : 'Weekend Active Recovery',
        dayLabel: 'Day 6: Outside Cross-Training',
        focus: 'Endurance & Mobility',
        estimatedDurationMin: hasOutsideActivity ? 50 : 30,
        isRestDay: !(hasOutsideActivity && outsideActivity.sessionsPerWeek >= 2),
        cardioGuidance: provision.fatigueGuidance,
        coachingTips: [provision.recoveryCues[0]],
        exercises: []
      });

      newDays.push({
        dayNumber: 7,
        title: 'Weekly Nutrition & Body Metrics Check-in',
        dayLabel: 'Day 7: Full Rest Day',
        focus: 'Rest, Protein Targets, Sleep',
        estimatedDurationMin: 15,
        isRestDay: true,
        coachingTips: ['Ensure you hit daily protein and water goals for tissue repair.'],
        exercises: []
      });

    } else if (daysPerWeek === 5) {
      // 5-Day Split: Upper Power, Lower Power, Push Hypertrophy, Pull Hypertrophy, Legs Hypertrophy
      newDays.push({
        dayNumber: 1,
        title: 'Upper Power (Bench & Heavy Row)',
        dayLabel: 'Day 1: Upper Primary Strength',
        focus: 'Chest, Upper Back, Shoulders',
        estimatedDurationMin: 55,
        isRestDay: false,
        coachingTips: ['Heavy neural recruitment: RPE 8.5.'],
        exercises: [
          { exerciseId: 'barbell-bench-press', exerciseName: 'Barbell Flat Bench Press', sets: 4, reps: '5', restSeconds: 150, rpe: 8.5 },
          { exerciseId: 'barbell-bent-over-row', exerciseName: 'Barbell Bent-Over Row', sets: 4, reps: '6', restSeconds: 120, rpe: 8 },
          { exerciseId: 'overhead-press', exerciseName: 'Standing Barbell Overhead Press', sets: 3, reps: '6', restSeconds: 120, rpe: 8.5 }
        ]
      });

      newDays.push({
        dayNumber: 2,
        title: 'Lower Power (Squat & Deadlift Foundation)',
        dayLabel: 'Day 2: Lower Primary Strength',
        focus: 'Quads, Posterior Chain, Glutes',
        estimatedDurationMin: 55,
        isRestDay: false,
        coachingTips: ['Heavy compound drive. Rest 3 mins between top sets.'],
        exercises: [
          { exerciseId: 'barbell-back-squat', exerciseName: 'Barbell Back Squat', sets: 4, reps: '5', restSeconds: 180, rpe: 8.5 },
          { exerciseId: 'conventional-deadlift', exerciseName: 'Conventional Barbell Deadlift', sets: 3, reps: '5', restSeconds: 180, rpe: 8.5 },
          { exerciseId: 'standing-calf-raise', exerciseName: 'Standing Calf Raise', sets: 4, reps: '10', restSeconds: 60, rpe: 9 }
        ]
      });

      newDays.push({
        dayNumber: 3,
        title: 'Push Hypertrophy (Chest, Delts, Triceps)',
        dayLabel: 'Day 3: Mechanical Tension & Pump',
        focus: 'Pectorals, Anterior/Lateral Delts, Triceps',
        estimatedDurationMin: 50,
        isRestDay: false,
        coachingTips: ['Focus on constant tension and deep stretch.'],
        exercises: [
          { exerciseId: 'incline-dumbbell-press', exerciseName: 'Incline Dumbbell Press', sets: 4, reps: '8-10', restSeconds: 90, rpe: 8 },
          { exerciseId: 'dumbbell-lateral-raise', exerciseName: 'Dumbbell Lateral Raise', sets: 4, reps: '12-15', restSeconds: 60, rpe: 9 },
          { exerciseId: 'triceps-cable-pushdown', exerciseName: 'Triceps Cable Rope Pushdown', sets: 4, reps: '12', restSeconds: 60, rpe: 9 }
        ]
      });

      newDays.push({
        dayNumber: 4,
        title: 'Pull Hypertrophy (Back, Lats, Biceps)',
        dayLabel: 'Day 4: Vertical & Horizontal Pulls',
        focus: 'Lats, Rhomboids, Biceps, Rear Delts',
        estimatedDurationMin: 50,
        isRestDay: false,
        coachingTips: ['Drive through elbows. Keep lower back neutral.'],
        exercises: [
          { exerciseId: 'pull-ups', exerciseName: 'Overhand Pull-ups', sets: 4, reps: '8', restSeconds: 90, rpe: 8.5 },
          { exerciseId: 'seated-cable-row', exerciseName: 'Seated Cable Row', sets: 4, reps: '10-12', restSeconds: 75, rpe: 8.5 },
          { exerciseId: 'barbell-bicep-curl', exerciseName: 'Barbell Bicep Curl', sets: 3, reps: '10', restSeconds: 60, rpe: 9 },
          { exerciseId: 'cable-face-pull', exerciseName: 'Cable Face Pull', sets: 3, reps: '15', restSeconds: 60, rpe: 8.5 }
        ]
      });

      newDays.push({
        dayNumber: 5,
        title: 'Legs Hypertrophy & Unilateral Volume',
        dayLabel: 'Day 5: Quads, Hamstrings & Core Finish',
        focus: 'Quads, Hamstrings, Glutes, Abs',
        estimatedDurationMin: 50,
        isRestDay: false,
        coachingTips: ['High volume: push split squats and leg press close to failure.'],
        exercises: [
          { exerciseId: 'bulgarian-split-squat', exerciseName: 'Bulgarian Split Squat', sets: 3, reps: '10', restSeconds: 90, rpe: 8.5 },
          { exerciseId: 'romanian-deadlift', exerciseName: 'Romanian Deadlift', sets: 4, reps: '8-10', restSeconds: 90, rpe: 8 },
          { exerciseId: 'leg-press', exerciseName: 'Incline Leg Press', sets: 3, reps: '12-15', restSeconds: 90, rpe: 8.5 },
          { exerciseId: 'hanging-leg-raise', exerciseName: 'Hanging Leg & Knee Raise', sets: 3, reps: '12', restSeconds: 60, rpe: 8 }
        ]
      });

      newDays.push({
        dayNumber: 6,
        title: hasOutsideActivity ? `${provision.title} Cross-Training` : 'Active Weekend Flush',
        dayLabel: hasOutsideActivity ? `Day 6: ${provision.title}` : 'Day 6: Walking & Recovery',
        focus: hasOutsideActivity ? 'Endurance & Active Burn' : 'Restoration',
        estimatedDurationMin: hasOutsideActivity ? 45 : 30,
        isRestDay: !hasOutsideActivity,
        cardioGuidance: provision.fatigueGuidance,
        coachingTips: [provision.recommendedSpacing],
        exercises: []
      });

      newDays.push({
        dayNumber: 7,
        title: 'Deep Rest, Refeed & Recovery',
        dayLabel: 'Day 7: Weekly Renewal',
        focus: 'Sleep, Meal Prep & Macro Tracking',
        estimatedDurationMin: 15,
        isRestDay: true,
        coachingTips: ['Allow full nervous system reset for the upcoming microcycle.'],
        exercises: []
      });

    } else {
      // 6-Day Split: Push / Pull / Legs x 2
      newDays.push({
        dayNumber: 1,
        title: 'Push A - Heavy Bench & Overhead',
        dayLabel: 'Day 1: Chest & Deltoids Overload',
        focus: 'Chest, Shoulders, Triceps',
        estimatedDurationMin: 50,
        isRestDay: false,
        coachingTips: ['Retract scapulae tightly.'],
        exercises: [
          { exerciseId: 'barbell-bench-press', exerciseName: 'Barbell Flat Bench Press', sets: 4, reps: '6-8', restSeconds: 120, rpe: 8 },
          { exerciseId: 'overhead-press', exerciseName: 'Standing Barbell Overhead Press', sets: 3, reps: '8', restSeconds: 90, rpe: 8 },
          { exerciseId: 'incline-dumbbell-press', exerciseName: 'Incline Dumbbell Press', sets: 3, reps: '8-10', restSeconds: 90, rpe: 8 },
          { exerciseId: 'triceps-cable-pushdown', exerciseName: 'Triceps Cable Rope Pushdown', sets: 3, reps: '12', restSeconds: 60, rpe: 9 }
        ]
      });

      newDays.push({
        dayNumber: 2,
        title: 'Pull A - Deadlift & Heavy Back',
        dayLabel: 'Day 2: Back & Posterior Thickness',
        focus: 'Back, Hamstrings, Biceps',
        estimatedDurationMin: 55,
        isRestDay: false,
        coachingTips: ['Solid abdominal bracing on pulls.'],
        exercises: [
          { exerciseId: 'conventional-deadlift', exerciseName: 'Conventional Barbell Deadlift', sets: 3, reps: '5', restSeconds: 180, rpe: 8.5 },
          { exerciseId: 'barbell-bent-over-row', exerciseName: 'Barbell Bent-Over Row', sets: 4, reps: '8', restSeconds: 90, rpe: 8 },
          { exerciseId: 'lat-pulldown', exerciseName: 'Wide-Grip Lat Pulldown', sets: 3, reps: '10', restSeconds: 75, rpe: 8.5 },
          { exerciseId: 'barbell-bicep-curl', exerciseName: 'Barbell Bicep Curl', sets: 3, reps: '10', restSeconds: 60, rpe: 9 }
        ]
      });

      newDays.push({
        dayNumber: 3,
        title: 'Legs A - Heavy Squat & Quads',
        dayLabel: 'Day 3: Quad Drive & Calves',
        focus: 'Quads, Calves, Abs',
        estimatedDurationMin: 50,
        isRestDay: false,
        coachingTips: ['Hit full depth on squat.'],
        exercises: [
          { exerciseId: 'barbell-back-squat', exerciseName: 'Barbell Back Squat', sets: 4, reps: '6-8', restSeconds: 150, rpe: 8 },
          { exerciseId: 'leg-press', exerciseName: 'Incline Leg Press', sets: 3, reps: '10-12', restSeconds: 90, rpe: 8.5 },
          { exerciseId: 'standing-calf-raise', exerciseName: 'Standing Calf Raise', sets: 4, reps: '15', restSeconds: 60, rpe: 9 },
          { exerciseId: 'hanging-leg-raise', exerciseName: 'Hanging Leg & Knee Raise', sets: 3, reps: '12', restSeconds: 60, rpe: 8.5 }
        ]
      });

      newDays.push({
        dayNumber: 4,
        title: 'Push B - Incline & Shoulder Density',
        dayLabel: 'Day 4: Upper Volume Push',
        focus: 'Chest, Lateral Delts, Triceps',
        estimatedDurationMin: 45,
        isRestDay: false,
        coachingTips: ['Focus on deltoid isolation.'],
        exercises: [
          { exerciseId: 'incline-dumbbell-press', exerciseName: 'Incline Dumbbell Press', sets: 4, reps: '8-10', restSeconds: 90, rpe: 8 },
          { exerciseId: 'dumbbell-lateral-raise', exerciseName: 'Dumbbell Lateral Raise', sets: 4, reps: '12-15', restSeconds: 60, rpe: 9 },
          { exerciseId: 'triceps-cable-pushdown', exerciseName: 'Triceps Cable Rope Pushdown', sets: 4, reps: '12', restSeconds: 60, rpe: 9 }
        ]
      });

      newDays.push({
        dayNumber: 5,
        title: 'Pull B - Vertical Pull & Biceps',
        dayLabel: 'Day 5: Lat Width & Arms',
        focus: 'Lats, Rhomboids, Biceps',
        estimatedDurationMin: 45,
        isRestDay: false,
        coachingTips: ['Squeeze peak contraction at bottom of pull-up.'],
        exercises: [
          { exerciseId: 'pull-ups', exerciseName: 'Overhand Pull-ups', sets: 4, reps: '8', restSeconds: 90, rpe: 8.5 },
          { exerciseId: 'seated-cable-row', exerciseName: 'Seated Cable Row', sets: 4, reps: '10-12', restSeconds: 75, rpe: 8.5 },
          { exerciseId: 'barbell-bicep-curl', exerciseName: 'Barbell Bicep Curl', sets: 4, reps: '8-10', restSeconds: 60, rpe: 9 },
          { exerciseId: 'cable-face-pull', exerciseName: 'Cable Face Pull', sets: 3, reps: '15', restSeconds: 60, rpe: 8.5 }
        ]
      });

      newDays.push({
        dayNumber: 6,
        title: 'Legs B - Romanian Deadlift & Hamstrings',
        dayLabel: 'Day 6: Posterior Chain & Hamstrings',
        focus: 'Hamstrings, Glutes, Calves',
        estimatedDurationMin: 45,
        isRestDay: false,
        coachingTips: ['Hips back on Romanian deadlift until deep stretch.'],
        exercises: [
          { exerciseId: 'romanian-deadlift', exerciseName: 'Romanian Deadlift', sets: 4, reps: '8-10', restSeconds: 120, rpe: 8 },
          { exerciseId: 'bulgarian-split-squat', exerciseName: 'Bulgarian Split Squat', sets: 3, reps: '10', restSeconds: 90, rpe: 8.5 },
          { exerciseId: 'standing-calf-raise', exerciseName: 'Standing Calf Raise', sets: 4, reps: '15', restSeconds: 60, rpe: 9 }
        ]
      });

      newDays.push({
        dayNumber: 7,
        title: hasOutsideActivity ? `${provision.title} / Active Recovery` : 'Full Systemic Rest & Macro Review',
        dayLabel: 'Day 7: Deep Rest & Recovery',
        focus: 'Restoration & Nutrition',
        estimatedDurationMin: hasOutsideActivity ? 40 : 15,
        isRestDay: true,
        cardioGuidance: provision.fatigueGuidance,
        coachingTips: ['Essential rest day after 6 consecutive days of training.'],
        exercises: []
      });
    }

    return {
      ...week,
      days: newDays
    };
  });

  return {
    ...baseProgram,
    daysPerWeek,
    weeks: adaptedWeeks
  };
};
