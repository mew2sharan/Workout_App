import { WorkoutPlan } from '../types/workout';

export const DEFAULT_WORKOUT_PLANS: WorkoutPlan[] = [
  {
    id: 'plan-ppl-hypertrophy',
    name: 'Push / Pull / Legs Hypertrophy Split',
    description: 'Gold standard 6-day split designed for maximal muscle hypertrophy, optimal weekly volume frequency, and progressive mechanical tension.',
    weeksDuration: 8,
    startDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 weeks ago
    routines: [
      {
        id: 'rt-push-1',
        name: 'Push A - Chest & Delts Focus',
        targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
        dayOfWeek: 1, // Monday
        exercises: [
          { exerciseId: 'barbell-bench-press', targetSets: 4, targetReps: '6-8', targetRpe: 8, restSeconds: 120 },
          { exerciseId: 'incline-dumbbell-press', targetSets: 3, targetReps: '8-10', targetRpe: 8, restSeconds: 90 },
          { exerciseId: 'overhead-press', targetSets: 3, targetReps: '8-10', targetRpe: 8, restSeconds: 90 },
          { exerciseId: 'dumbbell-lateral-raise', targetSets: 4, targetReps: '12-15', targetRpe: 9, restSeconds: 60 },
          { exerciseId: 'triceps-cable-pushdown', targetSets: 3, targetReps: '12-15', targetRpe: 9, restSeconds: 60 }
        ]
      },
      {
        id: 'rt-pull-1',
        name: 'Pull A - Upper Back & Lat Focus',
        targetMuscles: ['Back', 'Biceps', 'Forearms'],
        dayOfWeek: 2, // Tuesday
        exercises: [
          { exerciseId: 'conventional-deadlift', targetSets: 3, targetReps: '5', targetRpe: 8, restSeconds: 180 },
          { exerciseId: 'barbell-bent-over-row', targetSets: 4, targetReps: '8', targetRpe: 8, restSeconds: 90 },
          { exerciseId: 'lat-pulldown', targetSets: 3, targetReps: '10-12', targetRpe: 8.5, restSeconds: 75 },
          { exerciseId: 'cable-face-pull', targetSets: 3, targetReps: '15', targetRpe: 8.5, restSeconds: 60 },
          { exerciseId: 'barbell-bicep-curl', targetSets: 3, targetReps: '10-12', targetRpe: 9, restSeconds: 60 }
        ]
      },
      {
        id: 'rt-legs-1',
        name: 'Legs A - Quad Dominant',
        targetMuscles: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
        dayOfWeek: 3, // Wednesday
        exercises: [
          { exerciseId: 'barbell-back-squat', targetSets: 4, targetReps: '6-8', targetRpe: 8, restSeconds: 150 },
          { exerciseId: 'leg-press', targetSets: 3, targetReps: '10-12', targetRpe: 8.5, restSeconds: 90 },
          { exerciseId: 'romanian-deadlift', targetSets: 3, targetReps: '8-10', targetRpe: 8, restSeconds: 90 },
          { exerciseId: 'standing-calf-raise', targetSets: 4, targetReps: '15', targetRpe: 9, restSeconds: 60 },
          { exerciseId: 'hanging-leg-raise', targetSets: 3, targetReps: '12-15', targetRpe: 8.5, restSeconds: 60 }
        ]
      },
      {
        id: 'rt-push-2',
        name: 'Push B - Incline & Triceps Overload',
        targetMuscles: ['Chest', 'Triceps', 'Shoulders'],
        dayOfWeek: 4, // Thursday
        exercises: [
          { exerciseId: 'incline-dumbbell-press', targetSets: 4, targetReps: '8-10', targetRpe: 8, restSeconds: 90 },
          { exerciseId: 'barbell-bench-press', targetSets: 3, targetReps: '10', targetRpe: 8, restSeconds: 90 },
          { exerciseId: 'dumbbell-lateral-raise', targetSets: 4, targetReps: '12-15', targetRpe: 9, restSeconds: 60 },
          { exerciseId: 'triceps-cable-pushdown', targetSets: 4, targetReps: '10-12', targetRpe: 9, restSeconds: 60 }
        ]
      },
      {
        id: 'rt-pull-2',
        name: 'Pull B - Vertical Pull & Biceps',
        targetMuscles: ['Back', 'Biceps'],
        dayOfWeek: 5, // Friday
        exercises: [
          { exerciseId: 'pull-ups', targetSets: 4, targetReps: '6-10', targetRpe: 8.5, restSeconds: 90 },
          { exerciseId: 'seated-cable-row', targetSets: 4, targetReps: '10-12', targetRpe: 8.5, restSeconds: 75 },
          { exerciseId: 'barbell-bent-over-row', targetSets: 3, targetReps: '10', targetRpe: 8, restSeconds: 90 },
          { exerciseId: 'barbell-bicep-curl', targetSets: 4, targetReps: '8-10', targetRpe: 9, restSeconds: 60 },
          { exerciseId: 'cable-face-pull', targetSets: 3, targetReps: '15', targetRpe: 8, restSeconds: 60 }
        ]
      },
      {
        id: 'rt-legs-2',
        name: 'Legs B - Posterior Chain & Hamstrings',
        targetMuscles: ['Hamstrings', 'Glutes', 'Quads', 'Calves'],
        dayOfWeek: 6, // Saturday
        exercises: [
          { exerciseId: 'romanian-deadlift', targetSets: 4, targetReps: '8-10', targetRpe: 8, restSeconds: 120 },
          { exerciseId: 'bulgarian-split-squat', targetSets: 3, targetReps: '10', targetRpe: 8.5, restSeconds: 90 },
          { exerciseId: 'leg-press', targetSets: 3, targetReps: '12-15', targetRpe: 8.5, restSeconds: 90 },
          { exerciseId: 'standing-calf-raise', targetSets: 4, targetReps: '15', targetRpe: 9, restSeconds: 60 }
        ]
      }
    ]
  },
  {
    id: 'plan-upper-lower',
    name: 'Upper / Lower Heavy Strength Split',
    description: '4-day split emphasizing heavy primary compound lifts with 3 full recovery days per week. Ideal for busy lifters.',
    weeksDuration: 8,
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    routines: [
      {
        id: 'rt-ul-upper-1',
        name: 'Upper Power A',
        targetMuscles: ['Chest', 'Back', 'Shoulders', 'Triceps', 'Biceps'],
        dayOfWeek: 1, // Monday
        exercises: [
          { exerciseId: 'barbell-bench-press', targetSets: 4, targetReps: '5', targetRpe: 8.5, restSeconds: 150 },
          { exerciseId: 'barbell-bent-over-row', targetSets: 4, targetReps: '6', targetRpe: 8, restSeconds: 120 },
          { exerciseId: 'overhead-press', targetSets: 3, targetReps: '6-8', targetRpe: 8, restSeconds: 90 },
          { exerciseId: 'lat-pulldown', targetSets: 3, targetReps: '8-10', targetRpe: 8, restSeconds: 75 }
        ]
      },
      {
        id: 'rt-ul-lower-1',
        name: 'Lower Power A',
        targetMuscles: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
        dayOfWeek: 2, // Tuesday
        exercises: [
          { exerciseId: 'barbell-back-squat', targetSets: 4, targetReps: '5', targetRpe: 8.5, restSeconds: 180 },
          { exerciseId: 'romanian-deadlift', targetSets: 3, targetReps: '8', targetRpe: 8, restSeconds: 120 },
          { exerciseId: 'leg-press', targetSets: 3, targetReps: '10', targetRpe: 8, restSeconds: 90 },
          { exerciseId: 'standing-calf-raise', targetSets: 4, targetReps: '12-15', targetRpe: 8.5, restSeconds: 60 }
        ]
      },
      {
        id: 'rt-ul-upper-2',
        name: 'Upper Hypertrophy B',
        targetMuscles: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'],
        dayOfWeek: 4, // Thursday
        exercises: [
          { exerciseId: 'incline-dumbbell-press', targetSets: 4, targetReps: '8-10', targetRpe: 8, restSeconds: 90 },
          { exerciseId: 'pull-ups', targetSets: 4, targetReps: '8', targetRpe: 8.5, restSeconds: 90 },
          { exerciseId: 'dumbbell-lateral-raise', targetSets: 4, targetReps: '12-15', targetRpe: 9, restSeconds: 60 },
          { exerciseId: 'barbell-bicep-curl', targetSets: 3, targetReps: '10', targetRpe: 8.5, restSeconds: 60 },
          { exerciseId: 'triceps-cable-pushdown', targetSets: 3, targetReps: '12', targetRpe: 9, restSeconds: 60 }
        ]
      },
      {
        id: 'rt-ul-lower-2',
        name: 'Lower Power & Posterior B',
        targetMuscles: ['Back', 'Hamstrings', 'Glutes', 'Quads'],
        dayOfWeek: 5, // Friday
        exercises: [
          { exerciseId: 'conventional-deadlift', targetSets: 3, targetReps: '5', targetRpe: 8.5, restSeconds: 180 },
          { exerciseId: 'bulgarian-split-squat', targetSets: 3, targetReps: '8-10', targetRpe: 8, restSeconds: 90 },
          { exerciseId: 'leg-press', targetSets: 3, targetReps: '12', targetRpe: 8, restSeconds: 90 },
          { exerciseId: 'hanging-leg-raise', targetSets: 3, targetReps: '12', targetRpe: 8, restSeconds: 60 }
        ]
      }
    ]
  },
  {
    id: 'plan-full-body-frequency',
    name: 'Full Body High-Frequency Split (3-Day)',
    description: 'Scientifically proven 3-day split hitting every major muscle group 3x weekly with undulating compound focus. Optimal for maximizing weekly protein synthesis and joint recovery.',
    weeksDuration: 8,
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    routines: [
      {
        id: 'rt-fb-1',
        name: 'Full Body A - Squat & Horizontal Focus',
        targetMuscles: ['Quads', 'Chest', 'Back', 'Hamstrings', 'Shoulders', 'Core'],
        dayOfWeek: 1, // Monday
        exercises: [
          { exerciseId: 'barbell-back-squat', targetSets: 4, targetReps: '6-8', targetRpe: 8, restSeconds: 150 },
          { exerciseId: 'barbell-bench-press', targetSets: 4, targetReps: '6-8', targetRpe: 8, restSeconds: 120 },
          { exerciseId: 'barbell-bent-over-row', targetSets: 4, targetReps: '8', targetRpe: 8, restSeconds: 90 },
          { exerciseId: 'romanian-deadlift', targetSets: 3, targetReps: '8-10', targetRpe: 8, restSeconds: 120 },
          { exerciseId: 'dumbbell-lateral-raise', targetSets: 3, targetReps: '12-15', targetRpe: 9, restSeconds: 60 },
          { exerciseId: 'hanging-leg-raise', targetSets: 3, targetReps: '12-15', targetRpe: 8.5, restSeconds: 60 }
        ]
      },
      {
        id: 'rt-fb-2',
        name: 'Full Body B - Hinge & Vertical Focus',
        targetMuscles: ['Back', 'Shoulders', 'Quads', 'Biceps', 'Triceps', 'Glutes'],
        dayOfWeek: 3, // Wednesday
        exercises: [
          { exerciseId: 'conventional-deadlift', targetSets: 3, targetReps: '5', targetRpe: 8.5, restSeconds: 180 },
          { exerciseId: 'overhead-press', targetSets: 4, targetReps: '6-8', targetRpe: 8, restSeconds: 120 },
          { exerciseId: 'pull-ups', targetSets: 4, targetReps: '6-10', targetRpe: 8.5, restSeconds: 90 },
          { exerciseId: 'leg-press', targetSets: 3, targetReps: '10-12', targetRpe: 8.5, restSeconds: 90 },
          { exerciseId: 'barbell-bicep-curl', targetSets: 3, targetReps: '10-12', targetRpe: 9, restSeconds: 60 },
          { exerciseId: 'triceps-cable-pushdown', targetSets: 3, targetReps: '12-15', targetRpe: 9, restSeconds: 60 }
        ]
      },
      {
        id: 'rt-fb-3',
        name: 'Full Body C - Unilateral & Hypertrophy Overload',
        targetMuscles: ['Quads', 'Chest', 'Back', 'Calves', 'Shoulders', 'Glutes'],
        dayOfWeek: 5, // Friday
        exercises: [
          { exerciseId: 'bulgarian-split-squat', targetSets: 3, targetReps: '8-10', targetRpe: 8.5, restSeconds: 90 },
          { exerciseId: 'incline-dumbbell-press', targetSets: 4, targetReps: '8-10', targetRpe: 8, restSeconds: 90 },
          { exerciseId: 'seated-cable-row', targetSets: 4, targetReps: '10-12', targetRpe: 8.5, restSeconds: 75 },
          { exerciseId: 'cable-face-pull', targetSets: 3, targetReps: '15', targetRpe: 8.5, restSeconds: 60 },
          { exerciseId: 'standing-calf-raise', targetSets: 4, targetReps: '12-15', targetRpe: 9, restSeconds: 60 },
          { exerciseId: 'plank-hold', targetSets: 3, targetReps: '45-60s', targetRpe: 8, restSeconds: 60 }
        ]
      }
    ]
  }
];

