import { WorkoutSession, PersonalRecord, BodyMetricEntry, EnrolledProgramProgress } from '../types/workout';

// Generate dates relative to today
const now = new Date();
const daysAgo = (days: number): string => {
  const d = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return d.toISOString();
};

const dateStrAgo = (days: number): string => {
  const d = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return d.toISOString().split('T')[0];
};

export const INITIAL_WORKOUT_SESSIONS: WorkoutSession[] = [
  {
    id: 'session-28d',
    name: 'Push A - Chest & Delts',
    planId: 'plan-ppl-hypertrophy',
    routineId: 'rt-push-1',
    date: daysAgo(27),
    durationSeconds: 3420,
    totalVolumeKg: 7820,
    energyRating: 4,
    notes: 'Starting block. Bench felt steady, kept 2 reps in reserve.',
    exercises: [
      {
        id: 'se-1',
        exerciseId: 'barbell-bench-press',
        exerciseName: 'Barbell Flat Bench Press',
        sets: [
          { id: 's1', setNumber: 1, type: 'warmup', reps: 10, weightKg: 60, completed: true, rpe: 6 },
          { id: 's2', setNumber: 2, type: 'normal', reps: 8, weightKg: 85, completed: true, rpe: 7.5 },
          { id: 's3', setNumber: 3, type: 'normal', reps: 8, weightKg: 85, completed: true, rpe: 8 },
          { id: 's4', setNumber: 4, type: 'normal', reps: 7, weightKg: 85, completed: true, rpe: 8.5 }
        ]
      },
      {
        id: 'se-2',
        exerciseId: 'incline-dumbbell-press',
        exerciseName: 'Incline Dumbbell Press',
        sets: [
          { id: 's5', setNumber: 1, type: 'normal', reps: 10, weightKg: 28, completed: true, rpe: 8 },
          { id: 's6', setNumber: 2, type: 'normal', reps: 9, weightKg: 28, completed: true, rpe: 8.5 },
          { id: 's7', setNumber: 3, type: 'normal', reps: 8, weightKg: 28, completed: true, rpe: 9 }
        ]
      },
      {
        id: 'se-3',
        exerciseId: 'overhead-press',
        exerciseName: 'Standing Barbell Overhead Press',
        sets: [
          { id: 's8', setNumber: 1, type: 'normal', reps: 8, weightKg: 50, completed: true, rpe: 8 },
          { id: 's9', setNumber: 2, type: 'normal', reps: 8, weightKg: 50, completed: true, rpe: 8.5 },
          { id: 's10', setNumber: 3, type: 'normal', reps: 7, weightKg: 50, completed: true, rpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'session-26d',
    name: 'Pull A - Deadlift & Rows',
    planId: 'plan-ppl-hypertrophy',
    routineId: 'rt-pull-1',
    date: daysAgo(26),
    durationSeconds: 3750,
    totalVolumeKg: 9450,
    energyRating: 5,
    notes: 'Conventional deadlifts felt crisp and fast off the floor.',
    exercises: [
      {
        id: 'se-4',
        exerciseId: 'conventional-deadlift',
        exerciseName: 'Barbell Conventional Deadlift',
        sets: [
          { id: 's11', setNumber: 1, type: 'warmup', reps: 8, weightKg: 80, completed: true, rpe: 6 },
          { id: 's12', setNumber: 2, type: 'normal', reps: 5, weightKg: 130, completed: true, rpe: 7.5 },
          { id: 's13', setNumber: 3, type: 'normal', reps: 5, weightKg: 130, completed: true, rpe: 8 },
          { id: 's14', setNumber: 4, type: 'normal', reps: 5, weightKg: 130, completed: true, rpe: 8 }
        ]
      },
      {
        id: 'se-5',
        exerciseId: 'barbell-bent-over-row',
        exerciseName: 'Barbell Bent-Over Row',
        sets: [
          { id: 's15', setNumber: 1, type: 'normal', reps: 8, weightKg: 70, completed: true, rpe: 8 },
          { id: 's16', setNumber: 2, type: 'normal', reps: 8, weightKg: 70, completed: true, rpe: 8 },
          { id: 's17', setNumber: 3, type: 'normal', reps: 8, weightKg: 70, completed: true, rpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'session-25d',
    name: 'Legs A - Squat Focus',
    planId: 'plan-ppl-hypertrophy',
    routineId: 'rt-legs-1',
    date: daysAgo(25),
    durationSeconds: 3600,
    totalVolumeKg: 10200,
    energyRating: 4,
    notes: 'Solid depth on squats, good hamstring recruitment on RDLs.',
    exercises: [
      {
        id: 'se-6',
        exerciseId: 'barbell-back-squat',
        exerciseName: 'Barbell Back Squat',
        sets: [
          { id: 's18', setNumber: 1, type: 'warmup', reps: 10, weightKg: 60, completed: true, rpe: 5 },
          { id: 's19', setNumber: 2, type: 'normal', reps: 8, weightKg: 100, completed: true, rpe: 7.5 },
          { id: 's20', setNumber: 3, type: 'normal', reps: 8, weightKg: 100, completed: true, rpe: 8 },
          { id: 's21', setNumber: 4, type: 'normal', reps: 8, weightKg: 100, completed: true, rpe: 8.5 }
        ]
      },
      {
        id: 'se-7',
        exerciseId: 'romanian-deadlift',
        exerciseName: 'Romanian Deadlift (RDL)',
        sets: [
          { id: 's22', setNumber: 1, type: 'normal', reps: 10, weightKg: 85, completed: true, rpe: 7.5 },
          { id: 's23', setNumber: 2, type: 'normal', reps: 10, weightKg: 85, completed: true, rpe: 8 },
          { id: 's24', setNumber: 3, type: 'normal', reps: 9, weightKg: 85, completed: true, rpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'session-20d',
    name: 'Push A - Progressive Overload',
    planId: 'plan-ppl-hypertrophy',
    routineId: 'rt-push-1',
    date: daysAgo(20),
    durationSeconds: 3500,
    totalVolumeKg: 8200,
    energyRating: 5,
    notes: 'Moved bench to 87.5 kg comfortably.',
    exercises: [
      {
        id: 'se-8',
        exerciseId: 'barbell-bench-press',
        exerciseName: 'Barbell Flat Bench Press',
        sets: [
          { id: 's25', setNumber: 1, type: 'warmup', reps: 8, weightKg: 60, completed: true, rpe: 6 },
          { id: 's26', setNumber: 2, type: 'normal', reps: 8, weightKg: 87.5, completed: true, rpe: 8 },
          { id: 's27', setNumber: 3, type: 'normal', reps: 8, weightKg: 87.5, completed: true, rpe: 8.5 },
          { id: 's28', setNumber: 4, type: 'normal', reps: 7, weightKg: 87.5, completed: true, rpe: 9 }
        ]
      },
      {
        id: 'se-9',
        exerciseId: 'incline-dumbbell-press',
        exerciseName: 'Incline Dumbbell Press',
        sets: [
          { id: 's29', setNumber: 1, type: 'normal', reps: 10, weightKg: 30, completed: true, rpe: 8 },
          { id: 's30', setNumber: 2, type: 'normal', reps: 9, weightKg: 30, completed: true, rpe: 8.5 },
          { id: 's31', setNumber: 3, type: 'normal', reps: 8, weightKg: 30, completed: true, rpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'session-18d',
    name: 'Pull A - Deadlift Progression',
    planId: 'plan-ppl-hypertrophy',
    routineId: 'rt-pull-1',
    date: daysAgo(18),
    durationSeconds: 3800,
    totalVolumeKg: 10100,
    energyRating: 5,
    notes: 'Pulled 137.5 kg for 5s. Core braced tightly.',
    exercises: [
      {
        id: 'se-10',
        exerciseId: 'conventional-deadlift',
        exerciseName: 'Barbell Conventional Deadlift',
        sets: [
          { id: 's32', setNumber: 1, type: 'warmup', reps: 6, weightKg: 80, completed: true, rpe: 6 },
          { id: 's33', setNumber: 2, type: 'normal', reps: 5, weightKg: 137.5, completed: true, rpe: 7.5 },
          { id: 's34', setNumber: 3, type: 'normal', reps: 5, weightKg: 137.5, completed: true, rpe: 8 },
          { id: 's35', setNumber: 4, type: 'normal', reps: 5, weightKg: 137.5, completed: true, rpe: 8.5 }
        ]
      },
      {
        id: 'se-11',
        exerciseId: 'barbell-bent-over-row',
        exerciseName: 'Barbell Bent-Over Row',
        sets: [
          { id: 's36', setNumber: 1, type: 'normal', reps: 8, weightKg: 72.5, completed: true, rpe: 8 },
          { id: 's37', setNumber: 2, type: 'normal', reps: 8, weightKg: 72.5, completed: true, rpe: 8 },
          { id: 's38', setNumber: 3, type: 'normal', reps: 8, weightKg: 72.5, completed: true, rpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'session-17d',
    name: 'Legs A - Heavy Squats',
    planId: 'plan-ppl-hypertrophy',
    routineId: 'rt-legs-1',
    date: daysAgo(17),
    durationSeconds: 3650,
    totalVolumeKg: 10900,
    energyRating: 4,
    notes: 'Moved squats to 105 kg. Knees tracked out nicely.',
    exercises: [
      {
        id: 'se-12',
        exerciseId: 'barbell-back-squat',
        exerciseName: 'Barbell Back Squat',
        sets: [
          { id: 's39', setNumber: 1, type: 'warmup', reps: 8, weightKg: 70, completed: true, rpe: 6 },
          { id: 's40', setNumber: 2, type: 'normal', reps: 8, weightKg: 105, completed: true, rpe: 8 },
          { id: 's41', setNumber: 3, type: 'normal', reps: 8, weightKg: 105, completed: true, rpe: 8.5 },
          { id: 's42', setNumber: 4, type: 'normal', reps: 7, weightKg: 105, completed: true, rpe: 9 }
        ]
      },
      {
        id: 'se-13',
        exerciseId: 'romanian-deadlift',
        exerciseName: 'Romanian Deadlift (RDL)',
        sets: [
          { id: 's43', setNumber: 1, type: 'normal', reps: 10, weightKg: 90, completed: true, rpe: 8 },
          { id: 's44', setNumber: 2, type: 'normal', reps: 10, weightKg: 90, completed: true, rpe: 8 },
          { id: 's45', setNumber: 3, type: 'normal', reps: 9, weightKg: 90, completed: true, rpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'session-12d',
    name: 'Push A - Heavy Bench Milestone',
    planId: 'plan-ppl-hypertrophy',
    routineId: 'rt-push-1',
    date: daysAgo(12),
    durationSeconds: 3550,
    totalVolumeKg: 8900,
    energyRating: 5,
    notes: 'Bench press touched 92.5 kg for 6 reps. PR achieved!',
    exercises: [
      {
        id: 'se-14',
        exerciseId: 'barbell-bench-press',
        exerciseName: 'Barbell Flat Bench Press',
        sets: [
          { id: 's46', setNumber: 1, type: 'warmup', reps: 8, weightKg: 60, completed: true, rpe: 6 },
          { id: 's47', setNumber: 2, type: 'normal', reps: 7, weightKg: 92.5, completed: true, rpe: 8.5, isPR: true },
          { id: 's48', setNumber: 3, type: 'normal', reps: 6, weightKg: 92.5, completed: true, rpe: 9 },
          { id: 's49', setNumber: 4, type: 'normal', reps: 6, weightKg: 92.5, completed: true, rpe: 9.5 }
        ]
      },
      {
        id: 'se-15',
        exerciseId: 'overhead-press',
        exerciseName: 'Standing Barbell Overhead Press',
        sets: [
          { id: 's50', setNumber: 1, type: 'normal', reps: 8, weightKg: 52.5, completed: true, rpe: 8 },
          { id: 's51', setNumber: 2, type: 'normal', reps: 7, weightKg: 52.5, completed: true, rpe: 8.5 },
          { id: 's52', setNumber: 3, type: 'normal', reps: 7, weightKg: 52.5, completed: true, rpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'session-10d',
    name: 'Pull A - Heavy Deadlift Peak',
    planId: 'plan-ppl-hypertrophy',
    routineId: 'rt-pull-1',
    date: daysAgo(10),
    durationSeconds: 3900,
    totalVolumeKg: 10800,
    energyRating: 5,
    notes: 'Pulled 145 kg x 5. Felt explosive.',
    exercises: [
      {
        id: 'se-16',
        exerciseId: 'conventional-deadlift',
        exerciseName: 'Barbell Conventional Deadlift',
        sets: [
          { id: 's53', setNumber: 1, type: 'warmup', reps: 5, weightKg: 100, completed: true, rpe: 6 },
          { id: 's54', setNumber: 2, type: 'normal', reps: 5, weightKg: 145, completed: true, rpe: 8.5, isPR: true },
          { id: 's55', setNumber: 3, type: 'normal', reps: 5, weightKg: 145, completed: true, rpe: 8.5 },
          { id: 's56', setNumber: 4, type: 'normal', reps: 4, weightKg: 145, completed: true, rpe: 9 }
        ]
      },
      {
        id: 'se-17',
        exerciseId: 'barbell-bent-over-row',
        exerciseName: 'Barbell Bent-Over Row',
        sets: [
          { id: 's57', setNumber: 1, type: 'normal', reps: 8, weightKg: 75, completed: true, rpe: 8 },
          { id: 's58', setNumber: 2, type: 'normal', reps: 8, weightKg: 75, completed: true, rpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'session-9d',
    name: 'Legs A - Squat Volume Record',
    planId: 'plan-ppl-hypertrophy',
    routineId: 'rt-legs-1',
    date: daysAgo(9),
    durationSeconds: 3700,
    totalVolumeKg: 11400,
    energyRating: 5,
    notes: 'Squatted 110 kg x 7. Clean depth.',
    exercises: [
      {
        id: 'se-18',
        exerciseId: 'barbell-back-squat',
        exerciseName: 'Barbell Back Squat',
        sets: [
          { id: 's59', setNumber: 1, type: 'warmup', reps: 8, weightKg: 70, completed: true, rpe: 6 },
          { id: 's60', setNumber: 2, type: 'normal', reps: 7, weightKg: 110, completed: true, rpe: 8.5, isPR: true },
          { id: 's61', setNumber: 3, type: 'normal', reps: 7, weightKg: 110, completed: true, rpe: 8.5 },
          { id: 's62', setNumber: 4, type: 'normal', reps: 6, weightKg: 110, completed: true, rpe: 9 }
        ]
      },
      {
        id: 'se-19',
        exerciseId: 'romanian-deadlift',
        exerciseName: 'Romanian Deadlift (RDL)',
        sets: [
          { id: 's63', setNumber: 1, type: 'normal', reps: 10, weightKg: 95, completed: true, rpe: 8 },
          { id: 's64', setNumber: 2, type: 'normal', reps: 9, weightKg: 95, completed: true, rpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'session-4d',
    name: 'Push A - Heavy Peak',
    planId: 'plan-ppl-hypertrophy',
    routineId: 'rt-push-1',
    date: daysAgo(4),
    durationSeconds: 3600,
    totalVolumeKg: 9200,
    energyRating: 5,
    notes: 'Hit 95 kg on Bench Press for 6 reps! Highest 1RM estimate ever.',
    exercises: [
      {
        id: 'se-20',
        exerciseId: 'barbell-bench-press',
        exerciseName: 'Barbell Flat Bench Press',
        sets: [
          { id: 's65', setNumber: 1, type: 'warmup', reps: 8, weightKg: 60, completed: true, rpe: 6 },
          { id: 's66', setNumber: 2, type: 'normal', reps: 6, weightKg: 95, completed: true, rpe: 8.5, isPR: true },
          { id: 's67', setNumber: 3, type: 'normal', reps: 6, weightKg: 95, completed: true, rpe: 9 },
          { id: 's68', setNumber: 4, type: 'normal', reps: 5, weightKg: 95, completed: true, rpe: 9.5 }
        ]
      },
      {
        id: 'se-21',
        exerciseId: 'incline-dumbbell-press',
        exerciseName: 'Incline Dumbbell Press',
        sets: [
          { id: 's69', setNumber: 1, type: 'normal', reps: 10, weightKg: 32, completed: true, rpe: 8.5 },
          { id: 's70', setNumber: 2, type: 'normal', reps: 9, weightKg: 32, completed: true, rpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'session-2d',
    name: 'Pull A - Deadlift PR',
    planId: 'plan-ppl-hypertrophy',
    routineId: 'rt-pull-1',
    date: daysAgo(2),
    durationSeconds: 3850,
    totalVolumeKg: 11200,
    energyRating: 5,
    notes: 'Conventional Deadlift PR: 152.5 kg x 4 reps!',
    exercises: [
      {
        id: 'se-22',
        exerciseId: 'conventional-deadlift',
        exerciseName: 'Barbell Conventional Deadlift',
        sets: [
          { id: 's71', setNumber: 1, type: 'warmup', reps: 5, weightKg: 100, completed: true, rpe: 6 },
          { id: 's72', setNumber: 2, type: 'normal', reps: 4, weightKg: 152.5, completed: true, rpe: 9, isPR: true },
          { id: 's73', setNumber: 3, type: 'normal', reps: 4, weightKg: 150, completed: true, rpe: 9 },
          { id: 's74', setNumber: 4, type: 'normal', reps: 4, weightKg: 140, completed: true, rpe: 8.5 }
        ]
      },
      {
        id: 'se-23',
        exerciseId: 'barbell-bent-over-row',
        exerciseName: 'Barbell Bent-Over Row',
        sets: [
          { id: 's75', setNumber: 1, type: 'normal', reps: 8, weightKg: 77.5, completed: true, rpe: 8 },
          { id: 's76', setNumber: 2, type: 'normal', reps: 8, weightKg: 77.5, completed: true, rpe: 8.5 }
        ]
      }
    ]
  }
];

export const INITIAL_PERSONAL_RECORDS: PersonalRecord[] = [
  {
    exerciseId: 'barbell-bench-press',
    exerciseName: 'Barbell Flat Bench Press',
    maxWeightKg: 95,
    maxWeightReps: 6,
    maxWeightDate: dateStrAgo(4),
    maxReps: 12,
    maxRepsWeightKg: 80,
    maxRepsDate: dateStrAgo(27),
    estimated1RMKg: 114,
    estimated1RMDate: dateStrAgo(4),
    maxVolumeSessionKg: 3500,
    maxVolumeDate: dateStrAgo(4)
  },
  {
    exerciseId: 'barbell-back-squat',
    exerciseName: 'Barbell Back Squat',
    maxWeightKg: 110,
    maxWeightReps: 7,
    maxWeightDate: dateStrAgo(9),
    maxReps: 10,
    maxRepsWeightKg: 95,
    maxRepsDate: dateStrAgo(25),
    estimated1RMKg: 135,
    estimated1RMDate: dateStrAgo(9),
    maxVolumeSessionKg: 4620,
    maxVolumeDate: dateStrAgo(9)
  },
  {
    exerciseId: 'conventional-deadlift',
    exerciseName: 'Barbell Conventional Deadlift',
    maxWeightKg: 152.5,
    maxWeightReps: 4,
    maxWeightDate: dateStrAgo(2),
    maxReps: 8,
    maxRepsWeightKg: 120,
    maxRepsDate: dateStrAgo(26),
    estimated1RMKg: 172,
    estimated1RMDate: dateStrAgo(2),
    maxVolumeSessionKg: 5200,
    maxVolumeDate: dateStrAgo(2)
  },
  {
    exerciseId: 'overhead-press',
    exerciseName: 'Standing Barbell Overhead Press',
    maxWeightKg: 55,
    maxWeightReps: 6,
    maxWeightDate: dateStrAgo(12),
    maxReps: 10,
    maxRepsWeightKg: 45,
    maxRepsDate: dateStrAgo(27),
    estimated1RMKg: 66,
    estimated1RMDate: dateStrAgo(12),
    maxVolumeSessionKg: 1550,
    maxVolumeDate: dateStrAgo(12)
  },
  {
    exerciseId: 'romanian-deadlift',
    exerciseName: 'Romanian Deadlift (RDL)',
    maxWeightKg: 95,
    maxWeightReps: 10,
    maxWeightDate: dateStrAgo(9),
    maxReps: 12,
    maxRepsWeightKg: 80,
    maxRepsDate: dateStrAgo(25),
    estimated1RMKg: 126,
    estimated1RMDate: dateStrAgo(9),
    maxVolumeSessionKg: 2850,
    maxVolumeDate: dateStrAgo(9)
  },
  {
    exerciseId: 'incline-dumbbell-press',
    exerciseName: 'Incline Dumbbell Press',
    maxWeightKg: 32,
    maxWeightReps: 10,
    maxWeightDate: dateStrAgo(4),
    maxReps: 12,
    maxRepsWeightKg: 26,
    maxRepsDate: dateStrAgo(27),
    estimated1RMKg: 42,
    estimated1RMDate: dateStrAgo(4),
    maxVolumeSessionKg: 1850,
    maxVolumeDate: dateStrAgo(4)
  }
];

export const INITIAL_BODY_METRICS: BodyMetricEntry[] = [
  {
    id: 'bm-6',
    date: dateStrAgo(35),
    weightKg: 82.4,
    bodyFatPct: 17.6,
    heightCm: 180,
    bmi: 25.4,
    calorieTarget: 2500,
    proteinGrams: 170,
    carbsGrams: 270,
    fatGrams: 70,
    waistCm: 84.5,
    chestCm: 103.0,
    armsCm: 37.0,
    thighsCm: 61.5,
    notes: 'Initial weigh-in before starting hypertrophy cycle.'
  },
  {
    id: 'bm-5',
    date: dateStrAgo(28),
    weightKg: 81.8,
    bodyFatPct: 17.1,
    heightCm: 180,
    bmi: 25.2,
    calorieTarget: 2500,
    proteinGrams: 175,
    carbsGrams: 265,
    fatGrams: 68,
    waistCm: 83.8,
    chestCm: 103.2,
    armsCm: 37.2,
    thighsCm: 61.5,
    notes: 'Energy high, sleep 8 hrs.'
  },
  {
    id: 'bm-4',
    date: dateStrAgo(21),
    weightKg: 81.1,
    bodyFatPct: 16.5,
    heightCm: 180,
    bmi: 25.0,
    calorieTarget: 2450,
    proteinGrams: 175,
    carbsGrams: 260,
    fatGrams: 67,
    waistCm: 83.0,
    chestCm: 103.5,
    armsCm: 37.4,
    thighsCm: 61.8,
    notes: 'Waist down 1.5 cm from start.'
  },
  {
    id: 'bm-3',
    date: dateStrAgo(14),
    weightKg: 80.4,
    bodyFatPct: 15.8,
    heightCm: 180,
    bmi: 24.8,
    calorieTarget: 2450,
    proteinGrams: 180,
    carbsGrams: 255,
    fatGrams: 65,
    waistCm: 82.2,
    chestCm: 104.0,
    armsCm: 37.6,
    thighsCm: 62.0,
    notes: 'Visible upper ab definition emerging in morning lighting.'
  },
  {
    id: 'bm-2',
    date: dateStrAgo(7),
    weightKg: 79.7,
    bodyFatPct: 15.2,
    heightCm: 180,
    bmi: 24.6,
    calorieTarget: 2450,
    proteinGrams: 180,
    carbsGrams: 255,
    fatGrams: 65,
    waistCm: 81.4,
    chestCm: 104.2,
    armsCm: 37.8,
    thighsCm: 62.2,
    notes: 'Strength increasing while scale weight drops (clean recomposition).'
  },
  {
    id: 'bm-1',
    date: dateStrAgo(0),
    weightKg: 79.1,
    bodyFatPct: 14.7,
    heightCm: 180,
    bmi: 24.4,
    calorieTarget: 2450,
    proteinGrams: 180,
    carbsGrams: 255,
    fatGrams: 65,
    waistCm: 80.8,
    chestCm: 104.5,
    armsCm: 38.0,
    thighsCm: 62.4,
    notes: 'Trainer check-in weight: -3.3 kg total, body fat down 2.9%, arm size +1 cm.'
  }
];

export const INITIAL_ENROLLED_PROGRAM: EnrolledProgramProgress = {
  programId: 'prog-beginner-strength',
  enrolledDate: dateStrAgo(21),
  completedWorkouts: {
    'w1_d1': { date: dateStrAgo(21), sessionVolumeKg: 8200, durationMinutes: 52 },
    'w1_d3': { date: dateStrAgo(19), sessionVolumeKg: 9100, durationMinutes: 56 },
    'w1_d5': { date: dateStrAgo(17), sessionVolumeKg: 8750, durationMinutes: 54 }
  }
};
