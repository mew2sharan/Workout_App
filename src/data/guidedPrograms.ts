import { GuidedProgram } from '../types/workout';

export const GUIDED_PROGRAMS: GuidedProgram[] = [
  {
    id: 'prog-beginner-strength',
    title: 'Beginner Strength Foundation',
    goal: 'Beginner Strength',
    level: 'Beginner',
    durationWeeks: 6,
    daysPerWeek: 3,
    description: 'Master the core barbell and dumbbell lifts with systematic linear progression, rapid strength gains, and tendon conditioning.',
    imageUrl: '/src/assets/images/exercise_barbell_squat_form_1794312109578.jpg',
    overview: [
      'Focuses strictly on compound multi-joint movements for maximum neuromuscular adaptation.',
      'Linear progression scheme: add 2.5 kg to upper lifts and 5 kg to lower lifts weekly.',
      '3 full-body sessions per week with at least 1 day of recovery between sessions.'
    ],
    keyBenefits: [
      'Rapid linear strength adaptation for primary lifts',
      'Solid biomechanical foundation and movement pattern mastery',
      'High muscle recruitment with minimal training fatigue'
    ],
    weeks: [
      {
        weekNumber: 1,
        phaseTitle: 'Phase 1: Neuromuscular Calibration',
        focusSummary: 'Dial in form cues, establish baseline working weights with 2 reps in reserve (RIR 2).',
        days: [
          {
            dayNumber: 1,
            title: 'Full Body A - Squat & Bench Foundation',
            dayLabel: 'Day 1: Heavy Squat + Bench Focus',
            focus: 'Quads, Chest, Upper Back',
            estimatedDurationMin: 50,
            isRestDay: false,
            coachingTips: [
              'Warm up hips and thoracic spine thoroughly before squatting.',
              'Pause 1 full second at chest on all bench press reps.'
            ],
            exercises: [
              {
                exerciseId: 'barbell-back-squat',
                exerciseName: 'Barbell Back Squat',
                sets: 3,
                reps: '5 reps',
                restSeconds: 150,
                rpe: 7,
                notes: 'Focus on hitting parallel depth on all 5 reps.'
              },
              {
                exerciseId: 'barbell-bench-press',
                exerciseName: 'Barbell Flat Bench Press',
                sets: 3,
                reps: '5 reps',
                restSeconds: 120,
                rpe: 7,
                notes: 'Tuck shoulder blades tightly into bench.'
              },
              {
                exerciseId: 'barbell-bent-over-row',
                exerciseName: 'Barbell Bent-Over Row',
                sets: 3,
                reps: '8 reps',
                restSeconds: 90,
                rpe: 7,
                notes: 'Pull to lower ribs, strict pause at top.'
              },
              {
                exerciseId: 'hanging-leg-raise',
                exerciseName: 'Hanging Leg & Knee Raise',
                sets: 3,
                reps: '10-12 reps',
                restSeconds: 60,
                rpe: 8,
                notes: 'Controlled curl without swinging.'
              }
            ]
          },
          {
            dayNumber: 2,
            title: 'Active Rest & Mobility',
            dayLabel: 'Day 2: Recovery Walk & Mobility',
            focus: 'Hip flexors, Hamstrings, Thoracic Spine',
            estimatedDurationMin: 25,
            isRestDay: true,
            coachingTips: ['Hydrate well and complete 20 minutes of brisk walking.'],
            exercises: []
          },
          {
            dayNumber: 3,
            title: 'Full Body B - Deadlift & Overhead Press',
            dayLabel: 'Day 3: Deadlift + Overhead Press Focus',
            focus: 'Posterior Chain, Shoulders, Lats',
            estimatedDurationMin: 55,
            isRestDay: false,
            coachingTips: [
              'Take the slack out of the barbell before deadlifting.',
              'Brace abdominal wall before pressing overhead.'
            ],
            exercises: [
              {
                exerciseId: 'conventional-deadlift',
                exerciseName: 'Barbell Conventional Deadlift',
                sets: 3,
                reps: '5 reps',
                restSeconds: 180,
                rpe: 7.5,
                notes: 'Reset stance on each rep; no touch-and-go bouncing.'
              },
              {
                exerciseId: 'overhead-press',
                exerciseName: 'Standing Barbell Overhead Press',
                sets: 3,
                reps: '5 reps',
                restSeconds: 120,
                rpe: 7.5,
                notes: 'Lock out fully over the crown of your head.'
              },
              {
                exerciseId: 'lat-pulldown',
                exerciseName: 'Wide-Grip Lat Pulldown',
                sets: 3,
                reps: '10 reps',
                restSeconds: 90,
                rpe: 8,
                notes: 'Drive elbows down to waist level.'
              },
              {
                exerciseId: 'cable-face-pull',
                exerciseName: 'Cable Face Pull with External Rotation',
                sets: 3,
                reps: '15 reps',
                restSeconds: 60,
                rpe: 8,
                notes: 'Rotate knuckles backward at peak.'
              }
            ]
          },
          {
            dayNumber: 4,
            title: 'Rest & Nutrient Replenishment',
            dayLabel: 'Day 4: Rest Day',
            focus: 'Recovery',
            estimatedDurationMin: 0,
            isRestDay: true,
            coachingTips: ['Hit your daily protein target (1.8-2.2g per kg bodyweight).'],
            exercises: []
          },
          {
            dayNumber: 5,
            title: 'Full Body C - Hypertrophy Reinforcement',
            dayLabel: 'Day 5: Volume & Accessory Balance',
            focus: 'Chest, Glutes, Hamstrings, Arms',
            estimatedDurationMin: 55,
            isRestDay: false,
            coachingTips: ['Focus on deliberate 3-second negative eccentric tempo.'],
            exercises: [
              {
                exerciseId: 'romanian-deadlift',
                exerciseName: 'Romanian Deadlift (RDL)',
                sets: 3,
                reps: '8-10 reps',
                restSeconds: 120,
                rpe: 7.5,
                notes: 'Keep knees soft, push hips back for deep hamstring stretch.'
              },
              {
                exerciseId: 'incline-dumbbell-press',
                exerciseName: 'Incline Dumbbell Press',
                sets: 3,
                reps: '8-10 reps',
                restSeconds: 90,
                rpe: 8,
                notes: 'Elbows at 45 degree angle relative to torso.'
              },
              {
                exerciseId: 'leg-press',
                exerciseName: '45-Degree Leg Press',
                sets: 3,
                reps: '10-12 reps',
                restSeconds: 90,
                rpe: 8,
                notes: 'Deep knee flexion without rounding lower back.'
              },
              {
                exerciseId: 'barbell-bicep-curl',
                exerciseName: 'Barbell Biceps Curl',
                sets: 3,
                reps: '10-12 reps',
                restSeconds: 60,
                rpe: 8.5,
                notes: 'Strict upper arm stability; no torso sway.'
              }
            ]
          },
          {
            dayNumber: 6,
            title: 'Weekend Active Rest',
            dayLabel: 'Day 6: Recovery',
            focus: 'Recovery',
            estimatedDurationMin: 0,
            isRestDay: true,
            coachingTips: ['Light recreational activity or leisurely cycle.'],
            exercises: []
          },
          {
            dayNumber: 7,
            title: 'Weekly Review & Meal Prep',
            dayLabel: 'Day 7: Weekly Check-In',
            focus: 'Body Metrics & Meal Planning',
            estimatedDurationMin: 15,
            isRestDay: true,
            coachingTips: ['Record Sunday morning body weight and body fat %.'],
            exercises: []
          }
        ]
      }
    ]
  },
  {
    id: 'prog-fat-loss-density',
    title: 'Metabolic Fat Loss & Density',
    goal: 'Fat Loss',
    level: 'Intermediate',
    durationWeeks: 8,
    daysPerWeek: 4,
    description: 'High-density strength pairings, paired antagonist supersets, and targeted conditioning to preserve lean muscle while maximizing caloric expenditure.',
    imageUrl: '/src/assets/images/exercise_bench_press_form_1794312107723.jpg',
    overview: [
      'Preserves high mechanical tension with heavy compound work to prevent muscle loss in a deficit.',
      'Antagonist supersets maintain elevated cardiac output and EPOC (afterburn effect).',
      'Pairs structured lifting with post-workout Zone 2 cardio intervals.'
    ],
    keyBenefits: [
      'Maximum retention of lean skeletal muscle during caloric restriction',
      'Elevated post-exercise metabolic expenditure',
      'Time-efficient 45-minute training sessions with strict rest timers'
    ],
    weeks: [
      {
        weekNumber: 1,
        phaseTitle: 'Phase 1: Density Primer',
        focusSummary: 'Strict 60-second rest windows; focus on consistent rep velocity under fatigue.',
        days: [
          {
            dayNumber: 1,
            title: 'Upper Body Density Circuit',
            dayLabel: 'Day 1: Upper Push / Pull Antagonist',
            focus: 'Chest, Upper Back, Deltoids',
            estimatedDurationMin: 45,
            isRestDay: false,
            cardioGuidance: '15 min steady Zone 2 incline treadmill walk (heart rate 120-135 bpm).',
            coachingTips: ['Alternate Chest and Back exercises with exactly 60 seconds rest between sets.'],
            exercises: [
              {
                exerciseId: 'incline-dumbbell-press',
                exerciseName: 'Incline Dumbbell Press',
                sets: 4,
                reps: '10-12 reps',
                restSeconds: 60,
                rpe: 8,
                notes: 'Superset with Seated Cable Rows.'
              },
              {
                exerciseId: 'seated-cable-row',
                exerciseName: 'Seated Cable Row',
                sets: 4,
                reps: '10-12 reps',
                restSeconds: 60,
                rpe: 8,
                notes: 'Hold peak contraction for 1 second.'
              },
              {
                exerciseId: 'dumbbell-lateral-raise',
                exerciseName: 'Dumbbell Lateral Raise',
                sets: 4,
                reps: '15 reps',
                restSeconds: 45,
                rpe: 8.5,
                notes: 'Lead with elbows in scapular plane.'
              },
              {
                exerciseId: 'triceps-cable-pushdown',
                exerciseName: 'Triceps Rope Pushdown',
                sets: 3,
                reps: '12-15 reps',
                restSeconds: 45,
                rpe: 9,
                notes: 'Flare rope handles at bottom lockout.'
              }
            ]
          },
          {
            dayNumber: 2,
            title: 'Lower Body Metabolic Drive',
            dayLabel: 'Day 2: Quads, Hamstrings & Core Density',
            focus: 'Quads, Posterior Chain, Abdominals',
            estimatedDurationMin: 48,
            isRestDay: false,
            cardioGuidance: 'Optional: 10 min assault bike or rowing cooldown.',
            coachingTips: ['Stay mentally tough during leg press and split squats.'],
            exercises: [
              {
                exerciseId: 'barbell-back-squat',
                exerciseName: 'Barbell Back Squat',
                sets: 4,
                reps: '8 reps',
                restSeconds: 90,
                rpe: 8,
                notes: 'Maintain steady tempo, no resting at top.'
              },
              {
                exerciseId: 'romanian-deadlift',
                exerciseName: 'Romanian Deadlift (RDL)',
                sets: 3,
                reps: '10-12 reps',
                restSeconds: 75,
                rpe: 8,
                notes: 'Deep hamstring stretch on every repetition.'
              },
              {
                exerciseId: 'bulgarian-split-squat',
                exerciseName: 'Dumbbell Bulgarian Split Squat',
                sets: 3,
                reps: '10 reps/leg',
                restSeconds: 60,
                rpe: 8.5,
                notes: 'Drive through front heel.'
              },
              {
                exerciseId: 'hanging-leg-raise',
                exerciseName: 'Hanging Leg & Knee Raise',
                sets: 3,
                reps: '12-15 reps',
                restSeconds: 45,
                rpe: 8.5,
                notes: 'Controlled pelvic curl.'
              }
            ]
          },
          {
            dayNumber: 3,
            title: 'Active Recovery & Zone 2 Base',
            dayLabel: 'Day 3: Aerobic Engine & Mobility',
            focus: 'Cardiovascular Conditioning',
            estimatedDurationMin: 35,
            isRestDay: true,
            cardioGuidance: '30 min continuous low-impact Zone 2 cycling or outdoor brisk walk.',
            coachingTips: ['Breathe through nose to ensure conversational pace.'],
            exercises: []
          },
          {
            dayNumber: 4,
            title: 'Posterior & Pull Hypertrophy',
            dayLabel: 'Day 4: Deadlift & Back Focus',
            focus: 'Lats, Rhomboids, Hamstrings, Glutes',
            estimatedDurationMin: 45,
            isRestDay: false,
            cardioGuidance: '12 min rowing intervals (1 min fast, 1 min easy).',
            coachingTips: ['Keep spine neutral on all pulls.'],
            exercises: [
              {
                exerciseId: 'conventional-deadlift',
                exerciseName: 'Barbell Conventional Deadlift',
                sets: 4,
                reps: '6 reps',
                restSeconds: 120,
                rpe: 8,
                notes: 'Solid lockouts; tight lats throughout.'
              },
              {
                exerciseId: 'pull-ups',
                exerciseName: 'Bodyweight Pull-Up',
                sets: 4,
                reps: '6-8 reps',
                restSeconds: 60,
                rpe: 8.5,
                notes: 'Use resistance band if needed to hit target reps.'
              },
              {
                exerciseId: 'cable-face-pull',
                exerciseName: 'Cable Face Pull with External Rotation',
                sets: 3,
                reps: '15 reps',
                restSeconds: 45,
                rpe: 8,
                notes: 'High elbows, squeeze upper back.'
              }
            ]
          },
          {
            dayNumber: 5,
            title: 'Full Body Deltoid & Pump Finisher',
            dayLabel: 'Day 5: Delts, Arms & Calves',
            focus: 'Shoulders, Arms, Calves',
            estimatedDurationMin: 40,
            isRestDay: false,
            cardioGuidance: '15 min stair climber or incline treadmill.',
            coachingTips: ['Keep rest periods strict under 60 seconds.'],
            exercises: [
              {
                exerciseId: 'overhead-press',
                exerciseName: 'Standing Barbell Overhead Press',
                sets: 4,
                reps: '8 reps',
                restSeconds: 75,
                rpe: 8,
                notes: 'Firm glute contraction throughout set.'
              },
              {
                exerciseId: 'standing-calf-raise',
                exerciseName: 'Standing Calf Raise',
                sets: 4,
                reps: '15 reps',
                restSeconds: 45,
                rpe: 9,
                notes: '2-second dead stop at the bottom of each rep.'
              },
              {
                exerciseId: 'barbell-bicep-curl',
                exerciseName: 'Barbell Biceps Curl',
                sets: 3,
                reps: '12 reps',
                restSeconds: 45,
                rpe: 8.5,
                notes: 'Slow 3-second negative.'
              }
            ]
          },
          {
            dayNumber: 6,
            title: 'Weekend Rest & Hydration',
            dayLabel: 'Day 6: Complete Rest',
            focus: 'Recovery',
            estimatedDurationMin: 0,
            isRestDay: true,
            coachingTips: ['Target 3-4 liters of water and plenty of electrolyte rich veggies.'],
            exercises: []
          },
          {
            dayNumber: 7,
            title: 'Macro Review & Body Scan',
            dayLabel: 'Day 7: Weekly Check-In',
            focus: 'Nutrition Calibration',
            estimatedDurationMin: 15,
            isRestDay: true,
            coachingTips: ['Compare 7-day average body weight to check caloric deficit pace (0.5-0.8% weight loss per week).'],
            exercises: []
          }
        ]
      }
    ]
  },
  {
    id: 'prog-marathon-prep-hybrid',
    title: 'Marathon Prep & Hybrid Durability',
    goal: 'Marathon Prep',
    level: 'Advanced',
    durationWeeks: 12,
    daysPerWeek: 5,
    description: 'The definitive hybrid program integrating endurance mileage with strength armor to prevent IT band friction, runner knee, and posterior chain collapse.',
    imageUrl: '/src/assets/images/marathon_running_conditioning_1794312209504.jpg',
    overview: [
      'Balances running performance with bulletproofing resistance training.',
      'Protects knee stability, ankle dorsiflexion, hip abductors, and core rotational control.',
      'Periodized so heavy lifting days do not coincide with long weekend threshold runs.'
    ],
    keyBenefits: [
      'Eliminates common running injuries (shin splints, IT band, patellofemoral pain)',
      'Improves running economy and ground force production per stride',
      'Provides integrated mileage and strength tracking in one place'
    ],
    weeks: [
      {
        weekNumber: 1,
        phaseTitle: 'Phase 1: Base Mileage & Glute-Core Activation',
        focusSummary: 'Running Base: 35 km total weekly mileage + 2 focused durability strength sessions.',
        days: [
          {
            dayNumber: 1,
            title: 'Runner Strength: Posterior Chain & Hip Stability',
            dayLabel: 'Day 1: Leg Armor & Glute Durability',
            focus: 'Glutes, Hamstrings, Single-Leg Stability',
            estimatedDurationMin: 45,
            isRestDay: false,
            cardioGuidance: 'Easy 6 km recovery run in the morning (Zone 2, conversational pace).',
            coachingTips: [
              'Focus on single-leg balance and hip alignment on split squats.',
              'Romanian Deadlifts strengthen hamstrings to resist eccentric fatigue at mile 20.'
            ],
            exercises: [
              {
                exerciseId: 'romanian-deadlift',
                exerciseName: 'Romanian Deadlift (RDL)',
                sets: 3,
                reps: '8-10 reps',
                restSeconds: 90,
                rpe: 7.5,
                notes: 'Emphasize hamstring stretch and hip hinge.'
              },
              {
                exerciseId: 'bulgarian-split-squat',
                exerciseName: 'Dumbbell Bulgarian Split Squat',
                sets: 3,
                reps: '8 reps/leg',
                restSeconds: 75,
                rpe: 8,
                notes: 'Eliminates left-right strength imbalances for stride symmetry.'
              },
              {
                exerciseId: 'standing-calf-raise',
                exerciseName: 'Standing Calf Raise',
                sets: 4,
                reps: '15 reps',
                restSeconds: 60,
                rpe: 8.5,
                notes: 'Strengthens Achilles tendon and soleus for energy return.'
              },
              {
                exerciseId: 'hanging-leg-raise',
                exerciseName: 'Hanging Leg & Knee Raise',
                sets: 3,
                reps: '12 reps',
                restSeconds: 60,
                rpe: 8,
                notes: 'Prevents pelvic drop during late marathon fatigue.'
              }
            ]
          },
          {
            dayNumber: 2,
            title: 'Speed Intervals Workout',
            dayLabel: 'Day 2: Track Intervals (Speed Development)',
            focus: 'VO2 Max & Stride Pacing',
            estimatedDurationMin: 55,
            isRestDay: true,
            cardioGuidance: 'Track workout: 2 km warm-up, 6 x 800m repeats at 5k race pace (with 2 min jog recovery), 2 km cool-down. Total ~10 km.',
            coachingTips: ['Keep cadence above 175 spm. Focus on smooth arm carriage and upright torso.'],
            exercises: []
          },
          {
            dayNumber: 3,
            title: 'Upper Torso & Postural Armor',
            dayLabel: 'Day 3: Upper Back & Thoracic Resilience',
            focus: 'Upper Back, Chest, Core Anti-Rotation',
            estimatedDurationMin: 40,
            isRestDay: false,
            cardioGuidance: '5 km recovery run or light cycling.',
            coachingTips: ['Strong rhomboids and lats prevent runner shoulder slouch and maintain lung capacity.'],
            exercises: [
              {
                exerciseId: 'barbell-bent-over-row',
                exerciseName: 'Barbell Bent-Over Row',
                sets: 3,
                reps: '10 reps',
                restSeconds: 75,
                rpe: 7.5,
                notes: 'Keeps upper spine open during long endurance efforts.'
              },
              {
                exerciseId: 'incline-dumbbell-press',
                exerciseName: 'Incline Dumbbell Press',
                sets: 3,
                reps: '10 reps',
                restSeconds: 75,
                rpe: 7.5,
                notes: 'Open chest expansion for rib cage mobility.'
              },
              {
                exerciseId: 'cable-face-pull',
                exerciseName: 'Cable Face Pull with External Rotation',
                sets: 3,
                reps: '15 reps',
                restSeconds: 45,
                rpe: 8,
                notes: 'Reverses forward head posture from long miles.'
              }
            ]
          },
          {
            dayNumber: 4,
            title: 'Tempo Threshold Run',
            dayLabel: 'Day 4: Lactate Threshold Run',
            focus: 'Lactate Clearance & Aerobic Power',
            estimatedDurationMin: 60,
            isRestDay: true,
            cardioGuidance: 'Tempo run: 2 km warm-up, 6 km sustained at half-marathon pace, 2 km cool-down. Total 10 km.',
            coachingTips: ['Control breathing in a 2:2 rhythm (2 strides inhale, 2 strides exhale).'],
            exercises: []
          },
          {
            dayNumber: 5,
            title: 'Rest & Carb Loading Preparation',
            dayLabel: 'Day 5: Complete Rest & Mobility',
            focus: 'Rest & Glycogen Replenishment',
            estimatedDurationMin: 20,
            isRestDay: true,
            coachingTips: ['Foam roll quads and calves. Consume healthy complex carbohydrates ahead of long run.'],
            exercises: []
          },
          {
            dayNumber: 6,
            title: 'Long Endurance Weekend Run',
            dayLabel: 'Day 6: Long Steady Run (16 km)',
            focus: 'Aerobic Base & Fat Oxidation',
            estimatedDurationMin: 95,
            isRestDay: true,
            cardioGuidance: 'Long run: 16 km at Zone 2 conversational pace (60-90 seconds slower than marathon target pace). Practice fuel gel every 45 minutes.',
            coachingTips: ['Start conservative. The goal is time on feet and lipid metabolic efficiency.'],
            exercises: []
          },
          {
            dayNumber: 7,
            title: 'Active Flush & Weekly Metrics',
            dayLabel: 'Day 7: Walk & Recovery',
            focus: 'Recovery Flush',
            estimatedDurationMin: 30,
            isRestDay: true,
            coachingTips: ['20-30 min gentle walk. Record hydration, total weekly volume, and body weight.'],
            exercises: []
          }
        ]
      }
    ]
  }
];
