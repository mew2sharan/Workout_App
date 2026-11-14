import {
  WorkoutSession,
  PersonalRecord,
  WorkoutPlan,
  BodyMetricEntry,
  DailyNutritionLog,
  NutritionTargets,
  EnrolledProgramProgress,
  WeightUnit,
  MuscleGroup,
  MealType,
  SetType,
  FoodItem
} from '../types/workout';

export interface AetherLiftDataBundle {
  unit: WeightUnit;
  activePlanId: string;
  sessions: WorkoutSession[];
  personalRecords: PersonalRecord[];
  plans: WorkoutPlan[];
  bodyMetrics: BodyMetricEntry[];
  todayNutrition: DailyNutritionLog;
  nutritionHistory: DailyNutritionLog[];
  nutritionTargets: NutritionTargets;
  enrolledProgress: EnrolledProgramProgress;
}

export interface OpenDataFilePayload {
  key:
    | 'sessions'
    | 'records'
    | 'plans'
    | 'metrics'
    | 'nutrition'
    | 'targets_programs'
    | 'full_json';
  fileName: string;
  label: string;
  description: string;
  mimeType: 'text/csv' | 'application/json';
  content: string;
  rowCount: number;
}

// RFC 4180 CSV field escaping
function escapeCsvCell(val: string | number | boolean | undefined | null): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(headers: string[], rows: (string | number | boolean | undefined | null)[][]): string {
  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(','))
  ];
  return lines.join('\n');
}

// RFC 4180 CSV parser handling quoted commas, escaped quotes, and multiline values
export function parseCsv(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const cleanText = csvText.replace(/^\uFEFF/, '').trim();
  if (!cleanText) return { headers: [], rows: [] };

  const records: string[][] = [];
  let currentField = '';
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\r' && nextChar === '\n') {
        currentRow.push(currentField);
        records.push(currentRow);
        currentRow = [];
        currentField = '';
        i++;
      } else if (char === '\n' || char === '\r') {
        currentRow.push(currentField);
        records.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    records.push(currentRow);
  }

  if (records.length === 0) return { headers: [], rows: [] };

  const headers = records[0].map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let r = 1; r < records.length; r++) {
    const rec = records[r];
    if (rec.length === 1 && rec[0].trim() === '') continue;
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = rec[idx] ?? '';
    });
    rows.push(obj);
  }

  return { headers, rows };
}

export function serializeSessionsToCsv(sessions: WorkoutSession[]): { csv: string; rowCount: number } {
  const headers = [
    'session_id',
    'session_name',
    'plan_id',
    'routine_id',
    'date_iso',
    'duration_seconds',
    'total_volume_kg',
    'energy_rating',
    'session_notes',
    'exercise_entry_id',
    'exercise_id',
    'exercise_name',
    'exercise_notes',
    'set_id',
    'set_number',
    'set_type',
    'weight_kg',
    'reps',
    'rpe',
    'completed',
    'is_pr',
    'set_notes'
  ];

  const rows: (string | number | boolean | undefined)[][] = [];
  sessions.forEach((s) => {
    if (s.exercises.length === 0) {
      rows.push([
        s.id,
        s.name,
        s.planId,
        s.routineId,
        s.date,
        s.durationSeconds,
        s.totalVolumeKg,
        s.energyRating,
        s.notes,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        ''
      ]);
      return;
    }

    s.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        rows.push([
          s.id,
          s.name,
          s.planId,
          s.routineId,
          s.date,
          s.durationSeconds,
          s.totalVolumeKg,
          s.energyRating,
          s.notes,
          ex.id,
          ex.exerciseId,
          ex.exerciseName,
          ex.notes,
          set.id,
          set.setNumber,
          set.type,
          set.weightKg,
          set.reps,
          set.rpe,
          set.completed,
          set.isPR,
          set.notes
        ]);
      });
    });
  });

  return { csv: toCsv(headers, rows), rowCount: rows.length };
}

export function serializePersonalRecordsToCsv(records: PersonalRecord[]): { csv: string; rowCount: number } {
  const headers = [
    'exercise_id',
    'exercise_name',
    'max_weight_kg',
    'max_weight_reps',
    'max_weight_date',
    'max_reps',
    'max_reps_weight_kg',
    'max_reps_date',
    'estimated_1rm_kg',
    'estimated_1rm_date',
    'max_volume_session_kg',
    'max_volume_date'
  ];

  const rows = records.map((pr) => [
    pr.exerciseId,
    pr.exerciseName,
    pr.maxWeightKg,
    pr.maxWeightReps,
    pr.maxWeightDate,
    pr.maxReps,
    pr.maxRepsWeightKg,
    pr.maxRepsDate,
    pr.estimated1RMKg,
    pr.estimated1RMDate,
    pr.maxVolumeSessionKg,
    pr.maxVolumeDate
  ]);

  return { csv: toCsv(headers, rows), rowCount: rows.length };
}

export function serializeWorkoutPlansToCsv(plans: WorkoutPlan[]): { csv: string; rowCount: number } {
  const headers = [
    'plan_id',
    'plan_name',
    'plan_description',
    'weeks_duration',
    'start_date',
    'routine_id',
    'routine_name',
    'day_of_week',
    'target_muscles',
    'exercise_id',
    'target_sets',
    'target_reps',
    'target_rpe',
    'rest_seconds'
  ];

  const rows: (string | number | undefined)[][] = [];
  plans.forEach((plan) => {
    plan.routines.forEach((routine) => {
      if (routine.exercises.length === 0) {
        rows.push([
          plan.id,
          plan.name,
          plan.description,
          plan.weeksDuration,
          plan.startDate,
          routine.id,
          routine.name,
          routine.dayOfWeek,
          routine.targetMuscles.join('|'),
          '',
          '',
          '',
          '',
          ''
        ]);
        return;
      }
      routine.exercises.forEach((ex) => {
        rows.push([
          plan.id,
          plan.name,
          plan.description,
          plan.weeksDuration,
          plan.startDate,
          routine.id,
          routine.name,
          routine.dayOfWeek,
          routine.targetMuscles.join('|'),
          ex.exerciseId,
          ex.targetSets,
          ex.targetReps,
          ex.targetRpe,
          ex.restSeconds
        ]);
      });
    });
  });

  return { csv: toCsv(headers, rows), rowCount: rows.length };
}

export function serializeBodyMetricsToCsv(metrics: BodyMetricEntry[]): { csv: string; rowCount: number } {
  const headers = [
    'metric_id',
    'date',
    'weight_kg',
    'body_fat_pct',
    'height_cm',
    'bmi',
    'calorie_target',
    'protein_grams',
    'carbs_grams',
    'fat_grams',
    'chest_cm',
    'waist_cm',
    'arms_cm',
    'thighs_cm',
    'notes'
  ];

  const rows = metrics.map((m) => [
    m.id,
    m.date,
    m.weightKg,
    m.bodyFatPct,
    m.heightCm,
    m.bmi,
    m.calorieTarget,
    m.proteinGrams,
    m.carbsGrams,
    m.fatGrams,
    m.chestCm,
    m.waistCm,
    m.armsCm,
    m.thighsCm,
    m.notes
  ]);

  return { csv: toCsv(headers, rows), rowCount: rows.length };
}

export function serializeNutritionLogsToCsv(
  todayLog: DailyNutritionLog,
  history: DailyNutritionLog[]
): { csv: string; rowCount: number } {
  const headers = [
    'date',
    'water_ml',
    'daily_notes',
    'log_id',
    'meal_type',
    'logged_at_time',
    'food_id',
    'food_name',
    'brand',
    'serving_size',
    'servings',
    'calories_per_serving',
    'protein_g',
    'carbs_g',
    'fat_g',
    'fiber_g',
    'category'
  ];

  // Merge history + today uniquely by date
  const byDate = new Map<string, DailyNutritionLog>();
  history.forEach((h) => byDate.set(h.date, h));
  byDate.set(todayLog.date, todayLog);

  const sortedDays = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  const rows: (string | number | undefined)[][] = [];

  sortedDays.forEach((day) => {
    if (day.meals.length === 0) {
      rows.push([
        day.date,
        day.waterMl,
        day.notes,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        ''
      ]);
      return;
    }

    day.meals.forEach((m) => {
      rows.push([
        day.date,
        day.waterMl,
        day.notes,
        m.logId,
        m.mealType,
        m.loggedAtTime,
        m.id,
        m.name,
        m.brand,
        m.servingSize,
        m.servings,
        m.calories,
        m.protein,
        m.carbs,
        m.fat,
        m.fiber,
        m.category
      ]);
    });
  });

  return { csv: toCsv(headers, rows), rowCount: rows.length };
}

export function serializeTargetsAndProgramsToCsv(bundle: AetherLiftDataBundle): { csv: string; rowCount: number } {
  const headers = ['record_type', 'key', 'value_1', 'value_2', 'value_3', 'value_4'];
  const rows: (string | number | undefined)[][] = [
    ['setting', 'weight_unit', bundle.unit, '', '', ''],
    ['setting', 'active_plan_id', bundle.activePlanId, '', '', ''],
    [
      'nutrition_target',
      'targets',
      bundle.nutritionTargets.calorieTarget,
      bundle.nutritionTargets.proteinGrams,
      bundle.nutritionTargets.carbsGrams,
      bundle.nutritionTargets.fatGrams
    ],
    [
      'nutrition_target_extra',
      'targets_extra',
      bundle.nutritionTargets.fiberGrams ?? 34,
      bundle.nutritionTargets.waterGoalMl,
      bundle.nutritionTargets.strategy,
      ''
    ],
    [
      'program_enrollment',
      bundle.enrolledProgress.programId,
      bundle.enrolledProgress.enrolledDate,
      '',
      '',
      ''
    ]
  ];

  Object.entries(bundle.enrolledProgress.completedWorkouts || {}).forEach(([workoutKey, info]) => {
    rows.push([
      'program_completed_day',
      workoutKey,
      info.date,
      info.sessionVolumeKg,
      info.durationMinutes,
      ''
    ]);
  });

  return { csv: toCsv(headers, rows), rowCount: rows.length };
}

/**
 * Build all open-format files (6 relational CSV files + 1 full JSON archive) for Google Drive or local export.
 */
export function buildAllOpenDataFiles(bundle: AetherLiftDataBundle): OpenDataFilePayload[] {
  const sessionsRes = serializeSessionsToCsv(bundle.sessions);
  const prsRes = serializePersonalRecordsToCsv(bundle.personalRecords);
  const plansRes = serializeWorkoutPlansToCsv(bundle.plans);
  const metricsRes = serializeBodyMetricsToCsv(bundle.bodyMetrics);
  const nutritionRes = serializeNutritionLogsToCsv(bundle.todayNutrition, bundle.nutritionHistory);
  const targetsProgRes = serializeTargetsAndProgramsToCsv(bundle);

  const jsonArchive = JSON.stringify(
    {
      schema: 'aetherlift-open-data-v1',
      exportedAt: new Date().toISOString(),
      data: bundle
    },
    null,
    2
  );

  return [
    {
      key: 'sessions',
      fileName: 'aetherlift_workout_sessions.csv',
      label: 'Workout Sessions & Sets',
      description: 'All logged sets, reps, weights, RPE, and timestamps.',
      mimeType: 'text/csv',
      content: sessionsRes.csv,
      rowCount: sessionsRes.rowCount
    },
    {
      key: 'records',
      fileName: 'aetherlift_personal_records.csv',
      label: 'Personal Records (PRs)',
      description: 'Max weights, rep PRs, estimated 1RMs, and volume records.',
      mimeType: 'text/csv',
      content: prsRes.csv,
      rowCount: prsRes.rowCount
    },
    {
      key: 'plans',
      fileName: 'aetherlift_workout_plans.csv',
      label: 'Workout Plans & Routines',
      description: 'All custom and preset workout splits, schedules, and exercises.',
      mimeType: 'text/csv',
      content: plansRes.csv,
      rowCount: plansRes.rowCount
    },
    {
      key: 'metrics',
      fileName: 'aetherlift_body_metrics.csv',
      label: 'Body Metrics & Measurements',
      description: 'Body weight, body fat %, BMI, waist/chest/arm measurements.',
      mimeType: 'text/csv',
      content: metricsRes.csv,
      rowCount: metricsRes.rowCount
    },
    {
      key: 'nutrition',
      fileName: 'aetherlift_nutrition_logs.csv',
      label: 'Nutrition & Meal Logs',
      description: 'Daily meals, calories, macros, fiber, and water history.',
      mimeType: 'text/csv',
      content: nutritionRes.csv,
      rowCount: nutritionRes.rowCount
    },
    {
      key: 'targets_programs',
      fileName: 'aetherlift_targets_and_programs.csv',
      label: 'Targets, Settings & Program Progress',
      description: 'Macro goals, unit preference, and guided program completions.',
      mimeType: 'text/csv',
      content: targetsProgRes.csv,
      rowCount: targetsProgRes.rowCount
    },
    {
      key: 'full_json',
      fileName: 'aetherlift_full_backup.json',
      label: 'Complete Open JSON Snapshot',
      description: 'Single portable JSON file containing the entire AetherLift dataset.',
      mimeType: 'application/json',
      content: jsonArchive,
      rowCount:
        sessionsRes.rowCount +
        prsRes.rowCount +
        plansRes.rowCount +
        metricsRes.rowCount +
        nutritionRes.rowCount
    }
  ];
}

/**
 * Parse a restored open-format file (JSON snapshot or individual CSV table) back into partial app state.
 */
export function parseOpenDataFile(
  fileName: string,
  content: string,
  todayDateStr: string = new Date().toISOString().split('T')[0]
): { summary: string; patch: Partial<AetherLiftDataBundle> } {
  const lower = fileName.toLowerCase();

  // 1. Full JSON backup
  if (lower.endsWith('.json')) {
    const parsed = JSON.parse(content);
    const data: Partial<AetherLiftDataBundle> = parsed.data ? parsed.data : parsed;
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON structure: expected AetherLift backup object.');
    }
    return {
      summary: `Restored complete JSON backup (${data.sessions?.length || 0} sessions, ${data.plans?.length || 0} plans, ${data.bodyMetrics?.length || 0} body entries).`,
      patch: data
    };
  }

  // 2. CSV parsing based on filename or header signature
  const { headers, rows } = parseCsv(content);
  if (headers.length === 0) {
    throw new Error('CSV file appears to be empty or malformed.');
  }

  if (lower.includes('session') || headers.includes('session_id')) {
    const sessionMap = new Map<string, WorkoutSession>();
    const exerciseMap = new Map<string, Map<string, number>>();

    rows.forEach((r) => {
      const sid = r.session_id;
      if (!sid) return;
      if (!sessionMap.has(sid)) {
        sessionMap.set(sid, {
          id: sid,
          name: r.session_name || 'Restored Workout',
          planId: r.plan_id || undefined,
          routineId: r.routine_id || undefined,
          date: r.date_iso || new Date().toISOString(),
          durationSeconds: Number(r.duration_seconds) || 0,
          totalVolumeKg: Number(r.total_volume_kg) || 0,
          energyRating: r.energy_rating ? Number(r.energy_rating) : undefined,
          notes: r.session_notes || undefined,
          exercises: []
        });
        exerciseMap.set(sid, new Map());
      }

      const session = sessionMap.get(sid)!;
      const exEntryId = r.exercise_entry_id;
      if (exEntryId && r.exercise_id) {
        const sExMap = exerciseMap.get(sid)!;
        let exIdx = sExMap.get(exEntryId);
        if (exIdx === undefined) {
          exIdx = session.exercises.length;
          sExMap.set(exEntryId, exIdx);
          session.exercises.push({
            id: exEntryId,
            exerciseId: r.exercise_id,
            exerciseName: r.exercise_name || r.exercise_id,
            notes: r.exercise_notes || undefined,
            sets: []
          });
        }
        if (r.set_id) {
          session.exercises[exIdx].sets.push({
            id: r.set_id,
            setNumber: Number(r.set_number) || session.exercises[exIdx].sets.length + 1,
            type: (r.set_type as SetType) || 'normal',
            weightKg: Number(r.weight_kg) || 0,
            reps: Number(r.reps) || 0,
            rpe: r.rpe ? Number(r.rpe) : undefined,
            completed: r.completed === 'true' || r.completed === 'YES',
            isPR: r.is_pr === 'true' ? true : undefined,
            notes: r.set_notes || undefined
          });
        }
      }
    });

    const sessions = Array.from(sessionMap.values());
    return {
      summary: `Restored ${sessions.length} workout sessions from CSV.`,
      patch: { sessions }
    };
  }

  if (lower.includes('personal_record') || headers.includes('estimated_1rm_kg')) {
    const personalRecords: PersonalRecord[] = rows
      .filter((r) => r.exercise_id)
      .map((r) => ({
        exerciseId: r.exercise_id,
        exerciseName: r.exercise_name || r.exercise_id,
        maxWeightKg: Number(r.max_weight_kg) || 0,
        maxWeightReps: Number(r.max_weight_reps) || 0,
        maxWeightDate: r.max_weight_date || todayDateStr,
        maxReps: Number(r.max_reps) || 0,
        maxRepsWeightKg: Number(r.max_reps_weight_kg) || 0,
        maxRepsDate: r.max_reps_date || todayDateStr,
        estimated1RMKg: Number(r.estimated_1rm_kg) || 0,
        estimated1RMDate: r.estimated_1rm_date || todayDateStr,
        maxVolumeSessionKg: Number(r.max_volume_session_kg) || 0,
        maxVolumeDate: r.max_volume_date || todayDateStr
      }));
    return {
      summary: `Restored ${personalRecords.length} personal records from CSV.`,
      patch: { personalRecords }
    };
  }

  if (lower.includes('plan') || headers.includes('plan_id')) {
    const planMap = new Map<string, WorkoutPlan>();
    rows.forEach((r) => {
      const pid = r.plan_id;
      if (!pid) return;
      if (!planMap.has(pid)) {
        planMap.set(pid, {
          id: pid,
          name: r.plan_name || 'Restored Plan',
          description: r.plan_description || '',
          weeksDuration: Number(r.weeks_duration) || 8,
          startDate: r.start_date || todayDateStr,
          routines: []
        });
      }
      const plan = planMap.get(pid)!;
      const rid = r.routine_id;
      if (rid) {
        let routine = plan.routines.find((rt) => rt.id === rid);
        if (!routine) {
          routine = {
            id: rid,
            name: r.routine_name || 'Routine',
            dayOfWeek: Number(r.day_of_week) || 1,
            targetMuscles: (r.target_muscles ? r.target_muscles.split('|').filter(Boolean) : []) as MuscleGroup[],
            exercises: []
          };
          plan.routines.push(routine);
        }
        if (r.exercise_id) {
          routine.exercises.push({
            exerciseId: r.exercise_id,
            targetSets: Number(r.target_sets) || 3,
            targetReps: r.target_reps || '8-12',
            targetRpe: r.target_rpe ? Number(r.target_rpe) : undefined,
            restSeconds: r.rest_seconds ? Number(r.rest_seconds) : undefined
          });
        }
      }
    });
    const plans = Array.from(planMap.values());
    return {
      summary: `Restored ${plans.length} workout plans from CSV.`,
      patch: { plans }
    };
  }

  if (lower.includes('metric') || headers.includes('weight_kg')) {
    const bodyMetrics: BodyMetricEntry[] = rows
      .filter((r) => r.date)
      .map((r, i) => ({
        id: r.metric_id || `bm-restored-${i}`,
        date: r.date,
        weightKg: Number(r.weight_kg) || 0,
        bodyFatPct: r.body_fat_pct ? Number(r.body_fat_pct) : undefined,
        heightCm: Number(r.height_cm) || 180,
        bmi: Number(r.bmi) || 0,
        calorieTarget: Number(r.calorie_target) || 2400,
        proteinGrams: Number(r.protein_grams) || 180,
        carbsGrams: Number(r.carbs_grams) || 250,
        fatGrams: Number(r.fat_grams) || 65,
        chestCm: r.chest_cm ? Number(r.chest_cm) : undefined,
        waistCm: r.waist_cm ? Number(r.waist_cm) : undefined,
        armsCm: r.arms_cm ? Number(r.arms_cm) : undefined,
        thighsCm: r.thighs_cm ? Number(r.thighs_cm) : undefined,
        notes: r.notes || undefined
      }));
    return {
      summary: `Restored ${bodyMetrics.length} body metric logs from CSV.`,
      patch: { bodyMetrics }
    };
  }

  if (lower.includes('nutrition') || headers.includes('meal_type')) {
    const dayMap = new Map<string, DailyNutritionLog>();
    rows.forEach((r) => {
      if (!r.date) return;
      if (!dayMap.has(r.date)) {
        dayMap.set(r.date, {
          date: r.date,
          waterMl: Number(r.water_ml) || 0,
          notes: r.daily_notes || undefined,
          meals: []
        });
      }
      const day = dayMap.get(r.date)!;
      if (r.log_id && r.food_name) {
        day.meals.push({
          logId: r.log_id,
          id: r.food_id || r.log_id,
          name: r.food_name,
          brand: r.brand || undefined,
          servingSize: r.serving_size || '1 serving',
          servings: Number(r.servings) || 1,
          calories: Number(r.calories_per_serving) || 0,
          protein: Number(r.protein_g) || 0,
          carbs: Number(r.carbs_g) || 0,
          fat: Number(r.fat_g) || 0,
          fiber: r.fiber_g ? Number(r.fiber_g) : undefined,
          category: (r.category as FoodItem['category']) || 'General',
          mealType: (r.meal_type as MealType) || 'Snacks',
          loggedAtTime: r.logged_at_time || '12:00 PM'
        });
      }
    });

    const allDays = Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    const todayEntry = dayMap.get(todayDateStr);
    return {
      summary: `Restored ${allDays.length} days of nutrition logs from CSV.`,
      patch: {
        nutritionHistory: allDays,
        ...(todayEntry ? { todayNutrition: todayEntry } : {})
      }
    };
  }

  if (lower.includes('targets') || headers.includes('record_type')) {
    const patch: Partial<AetherLiftDataBundle> = {};
    const targets: NutritionTargets = {
      calorieTarget: 2450,
      proteinGrams: 180,
      carbsGrams: 255,
      fatGrams: 65,
      fiberGrams: 34,
      waterGoalMl: 3200,
      strategy: 'Recomposition'
    };
    const progress: EnrolledProgramProgress = {
      programId: 'prog-beginner-strength',
      enrolledDate: todayDateStr,
      completedWorkouts: {}
    };

    rows.forEach((r) => {
      if (r.record_type === 'setting' && r.key === 'weight_unit') {
        patch.unit = r.value_1 === 'lbs' ? 'lbs' : 'kg';
      } else if (r.record_type === 'setting' && r.key === 'active_plan_id') {
        patch.activePlanId = r.value_1;
      } else if (r.record_type === 'nutrition_target') {
        targets.calorieTarget = Number(r.value_1) || targets.calorieTarget;
        targets.proteinGrams = Number(r.value_2) || targets.proteinGrams;
        targets.carbsGrams = Number(r.value_3) || targets.carbsGrams;
        targets.fatGrams = Number(r.value_4) || targets.fatGrams;
      } else if (r.record_type === 'nutrition_target_extra') {
        targets.fiberGrams = Number(r.value_1) || 34;
        targets.waterGoalMl = Number(r.value_2) || 3200;
        targets.strategy = (r.value_3 as NutritionTargets['strategy']) || 'Recomposition';
      } else if (r.record_type === 'program_enrollment') {
        progress.programId = r.key || progress.programId;
        progress.enrolledDate = r.value_1 || todayDateStr;
      } else if (r.record_type === 'program_completed_day' && r.key) {
        progress.completedWorkouts[r.key] = {
          date: r.value_1 || todayDateStr,
          sessionVolumeKg: r.value_2 ? Number(r.value_2) : undefined,
          durationMinutes: r.value_3 ? Number(r.value_3) : undefined
        };
      }
    });

    patch.nutritionTargets = targets;
    patch.enrolledProgress = progress;

    return {
      summary: 'Restored macro targets, settings, and guided program progress from CSV.',
      patch
    };
  }

  throw new Error(`Unrecognized open-format file: ${fileName}`);
}
