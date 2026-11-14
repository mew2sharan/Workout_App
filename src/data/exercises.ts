import { Exercise, MuscleGroup } from '../types/workout';

export const EXERCISE_LIBRARY: Exercise[] = [
  {
    id: 'barbell-bench-press',
    name: 'Barbell Flat Bench Press',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Shoulders'],
    equipment: 'Barbell',
    category: 'Push',
    formCues: [
      'Set eyes directly below the racked barbell before unracking.',
      'Retract and depress scapulae into the bench, maintain slight lumbar arch.',
      'Grip the bar slightly wider than shoulder width with knuckles pointing upward.',
      'Lower under control to lower sternum with elbows tucked at roughly 45–60°.',
      'Drive feet flat through the floor and press bar up in a slight J-curve.'
    ],
    commonMistakes: [
      'Flaring elbows out at 90 degrees (high shoulder impingement risk).',
      'Bouncing the bar off the sternum.',
      'Allowing hips or glutes to lift off the bench.'
    ],
    setupTips: 'Position bench so feet can stay planted firmly without heel rise. Ensure barbell collars are locked.',
    tempoGuidance: '3-1-1-0 (3s eccentric, 1s pause on chest, 1s explosive drive)',
    image: '/src/assets/images/exercise_bench_press_form_1794312107723.jpg'
  },
  {
    id: 'barbell-back-squat',
    name: 'Barbell Back Squat',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core', 'Calves'],
    equipment: 'Barbell',
    category: 'Legs',
    formCues: [
      'Rest bar firmly across upper traps (high bar) or rear delts (low bar).',
      'Take 2-3 precise walkout steps, feet shoulder-width, toes angled 15–30° outward.',
      'Inhale deeply into abdomen (Valsalva maneuver) and brace core like preparing for a punch.',
      'Break at hips and knees simultaneously; descend until hip crease is below the knee cap.',
      'Drive knees out tracking over toes, keep chest proud, and push the floor away.'
    ],
    commonMistakes: [
      'Knees caving inward (valgus collapse) on the ascent.',
      'Forward pitch causing the hips to shoot up first (good-morning squat).',
      'Cutting depth high above parallel.'
    ],
    setupTips: 'Set rack pins so the bar is at mid-chest height before unracking.',
    tempoGuidance: '3-1-1-0 (3s controlled descent, 1s at parallel, explosive ascent)',
    image: '/src/assets/images/exercise_barbell_squat_form_1794312109578.jpg'
  },
  {
    id: 'conventional-deadlift',
    name: 'Barbell Conventional Deadlift',
    primaryMuscles: ['Back', 'Hamstrings', 'Glutes'],
    secondaryMuscles: ['Core', 'Forearms', 'Quads'],
    equipment: 'Barbell',
    category: 'Pull',
    formCues: [
      'Stand with mid-foot directly beneath the barbell, shins 1 inch away.',
      'Hinge hips back and grip bar just outside knees with double overhand or mixed grip.',
      'Bring shins forward to touch the bar without moving it; wedge hips down and chest up.',
      'Pull slack out of the barbell until you hear a metallic click; brace lats like squeezing oranges in armpits.',
      'Drive the floor away with your legs; extend knees and hips together to lock out tall without hyperextending.'
    ],
    commonMistakes: [
      'Rounding the lumbar spine while initiating the pull.',
      'Yanking the bar off the floor before taking out the slack.',
      'Letting the bar drift forward away from the shins and thighs.'
    ],
    setupTips: 'Wear flat-soled shoes or deadlift in socks to maximize ground contact leverage.',
    tempoGuidance: '1-0-2-0 (1s explosive pull, lockout pause, 2s controlled lowering)',
    image: '/src/assets/images/exercise_deadlift_form_1794312108778.jpg'
  },
  {
    id: 'overhead-press',
    name: 'Standing Barbell Overhead Press',
    primaryMuscles: ['Shoulders', 'Triceps'],
    secondaryMuscles: ['Core', 'Chest'],
    equipment: 'Barbell',
    category: 'Push',
    formCues: [
      'Rack position: bar resting on anterior deltoids, wrists neutral and elbows slightly in front of bar.',
      'Squeeze glutes and brace abdominal wall tight to form an immovable pillar.',
      'Tilt head back slightly as the bar clears your chin, then push head through the window at lockout.',
      'Lock out elbows fully overhead with bar aligned directly over the mid-foot.'
    ],
    commonMistakes: [
      'Excessive backward lean through the lower spine to mimic an incline press.',
      'Pressing the bar in an outward arch instead of a vertical path.',
      'Flaring ribs and losing pelvic neutrality.'
    ],
    setupTips: 'Keep vertical forearms under the barbell throughout the initial drive.',
    tempoGuidance: '2-1-1-0',
    image: '/src/assets/images/overhead_press_1794340332451.jpg'
  },
  {
    id: 'barbell-bent-over-row',
    name: 'Barbell Bent-Over Row',
    primaryMuscles: ['Back'],
    secondaryMuscles: ['Biceps', 'Forearms', 'Core', 'Hamstrings'],
    equipment: 'Barbell',
    category: 'Pull',
    formCues: [
      'Hinge forward at the hips at approximately 45° with neutral spine and soft knees.',
      'Grip the bar overhand slightly wider than shoulder width.',
      'Pull the bar toward your lower ribcage / navel, pulling elbows past the torso.',
      'Squeeze your scapulae together at the top for 1 full second before lowering under control.'
    ],
    commonMistakes: [
      'Using aggressive hip jerking momentum to bounce the weight up.',
      'Standing too upright (turning it into a shrug).',
      'Rounding the upper and lower back.'
    ],
    setupTips: 'Keep neck in neutral alignment by gazing at the floor 4 feet ahead.',
    tempoGuidance: '3-1-1-0',
    image: '/src/assets/images/bent_over_row_1794340332279.jpg'
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Shoulders', 'Triceps'],
    equipment: 'Dumbbell',
    category: 'Push',
    formCues: [
      'Set bench angle to 30 degrees (higher angles recruit anterior deltoid over clavicular chest).',
      'Kick dumbbells up using knees into position over upper chest.',
      'Maintain pinched shoulder blades; lower dumbbells until hands are level with upper chest.',
      'Press inward along an arc, stopping just before dumbbells clash at the apex.'
    ],
    commonMistakes: [
      'Setting bench at 45–60° incline where delts overpower chest.',
      'Bouncing dumbbells together at top.',
      'Flaring elbows out perpendicular to torso.'
    ],
    setupTips: 'Tuck elbows at 45° to keep glenohumeral joint centered and protect the rotator cuff.',
    tempoGuidance: '3-0-1-0',
    image: '/src/assets/images/incline_db_press_1794340332593.jpg'
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift (RDL)',
    primaryMuscles: ['Hamstrings', 'Glutes'],
    secondaryMuscles: ['Back', 'Forearms', 'Core'],
    equipment: 'Barbell',
    category: 'Legs',
    formCues: [
      'Unrack barbell from standing position with soft knee bend (approx 15°).',
      'Keep knees fixed at this angle and initiate movement entirely by pushing hips backward.',
      'Keep barbell skimming down thighs and shins, feeling a deep stretch across hamstrings.',
      'Reverse motion once hips stop traveling backward (usually below knee level); drive hips forward to lockout.'
    ],
    commonMistakes: [
      'Bending knees further as you descend (turning it into a conventional deadlift or squat).',
      'Letting the bar drift away from the legs, putting shear stress on lower back.',
      'Hyperextending spine backward at top lockout.'
    ],
    setupTips: 'Focus on reaching your tailbone to the wall behind you.',
    tempoGuidance: '3-1-1-0',
    image: '/src/assets/images/romanian_deadlift_1794340349175.jpg'
  },
  {
    id: 'lat-pulldown',
    name: 'Wide-Grip Lat Pulldown',
    primaryMuscles: ['Back'],
    secondaryMuscles: ['Biceps', 'Forearms', 'Shoulders'],
    equipment: 'Cable',
    category: 'Pull',
    formCues: [
      'Adjust thigh pads snug so feet stay planted flat.',
      'Grip the bar 1.5x shoulder width with thumbless or standard grip.',
      'Lean back very slightly (10–15°), depress scapulae before bending elbows.',
      'Drive elbows down and back toward your back pockets, drawing bar to upper chest.'
    ],
    commonMistakes: [
      'Swinging torso violently backward to yank the weight.',
      'Pulling the bar behind the neck.',
      'Letting shoulders shrug up violently at the stretch.'
    ],
    setupTips: 'Think of hands as hooks; initiate the pull strictly through your lats.',
    tempoGuidance: '3-1-1-0',
    image: '/src/assets/images/lat_pulldown_1794340349636.jpg'
  },
  {
    id: 'pull-ups',
    name: 'Bodyweight Pull-Up',
    primaryMuscles: ['Back'],
    secondaryMuscles: ['Biceps', 'Forearms', 'Core'],
    equipment: 'Bodyweight',
    category: 'Pull',
    formCues: [
      'Hang from bar with overhand grip just outside shoulder width (dead hang).',
      'Engage scapulae down and back first into an active hang.',
      'Drive elbows down toward the ground and pull until your chin clears the bar cleanly.',
      'Lower under complete control back to full dead hang.'
    ],
    commonMistakes: [
      'Kicking legs or kipping for momentum.',
      'Only performing half-reps without full arm extension.',
      'Reaching chin forward without pulling chest up.'
    ],
    setupTips: 'Keep legs straight or crossed behind, glutes squeezed tight.',
    tempoGuidance: '2-1-1-0',
    image: '/src/assets/images/pull_up_exercise_1794340351579.jpg'
  },
  {
    id: 'dumbbell-lateral-raise',
    name: 'Dumbbell Lateral Raise',
    primaryMuscles: ['Shoulders'],
    secondaryMuscles: ['Forearms'],
    equipment: 'Dumbbell',
    category: 'Push',
    formCues: [
      'Hinge torso forward slightly (5-10°) with knees soft.',
      'Raise dumbbells out in the scapular plane (approx 30° in front of the frontal plane).',
      'Lead with elbows, keeping pinkies slightly higher than thumbs or hands neutral.',
      'Pause at parallel to the ground; resist the weight on the way down.'
    ],
    commonMistakes: [
      'Using body momentum or hip thrusts to swing dumbbells up.',
      'Shrugging traps up to the ears on every rep.',
      'Lifting way past shoulder height.'
    ],
    setupTips: 'Use lighter weights and focus on strict time under tension and peak contraction.',
    tempoGuidance: '2-1-1-0',
    image: '/src/assets/images/db_lateral_raise_1794340371271.jpg'
  },
  {
    id: 'leg-press',
    name: '45-Degree Leg Press',
    primaryMuscles: ['Quads'],
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Calves'],
    equipment: 'Machine',
    category: 'Legs',
    formCues: [
      'Sit with back and hips firmly pressed against the seat backrest.',
      'Position feet shoulder-width on platform, toes slightly angled outward.',
      'Lower sled until knees reach 90 degrees without lower back peeling off pad.',
      'Press sled away through mid-foot and heels; stop just short of locking knees.'
    ],
    commonMistakes: [
      'Hyperextending and locking out knees violently at the top.',
      'Allowing lower back to curl up off the seat (spinal flexion under load).',
      'Placing hands on knees rather than grip handles.'
    ],
    setupTips: 'Keep hands on side safety handles to pull pelvis securely down into the seat.',
    tempoGuidance: '3-0-1-0',
    image: '/src/assets/images/leg_press_sled_1794340371232.jpg'
  },
  {
    id: 'barbell-bicep-curl',
    name: 'Barbell Biceps Curl',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    equipment: 'Barbell',
    category: 'Pull',
    formCues: [
      'Stand tall with feet hip-width, holding bar with underhand shoulder-width grip.',
      'Pin elbows beside ribcage, keeping upper arms immobile.',
      'Curl bar up toward collarbones, focusing on rotating pinkies inward.',
      'Squeeze biceps hard at top; lower slowly through full range of motion.'
    ],
    commonMistakes: [
      'Swinging hips and back backward on the upward phase.',
      'Flaring elbows forward and turning the exercise into a front raise.',
      'Short-changing the bottom stretch.'
    ],
    setupTips: 'Stand with back against a wall or post if you struggle with body swinging.',
    tempoGuidance: '3-1-1-0',
    image: '/src/assets/images/barbell_bicep_curl_1794340370579.jpg'
  },
  {
    id: 'triceps-cable-pushdown',
    name: 'Triceps Rope Pushdown',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Forearms'],
    equipment: 'Cable',
    category: 'Push',
    formCues: [
      'Attach rope to high pulley; step back slightly with slight forward torso lean.',
      'Fix elbows close to torso sides; keep them locked in space throughout.',
      'Extend arms downward, spreading rope handles apart at bottom lockout.',
      'Control the return until forearms are parallel to the floor.'
    ],
    commonMistakes: [
      'Allowing elbows to drift forward and backward like a pendulum.',
      'Using shoulder press motion instead of isolated elbow extension.',
      'Rounding shoulders over the rope.'
    ],
    setupTips: 'Spread the rope at peak contraction for maximal lateral and long head tricep engagement.',
    tempoGuidance: '2-1-1-0',
    image: '/src/assets/images/tricep_rope_pushdown_1794340388135.jpg'
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Dumbbell Bulgarian Split Squat',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Calves', 'Core'],
    equipment: 'Dumbbell',
    category: 'Legs',
    formCues: [
      'Place top of rear foot flat on bench 2-3 feet behind working front foot.',
      'Descend straight down until rear knee is hovering 1 inch above floor.',
      'Maintain upright or slight forward torso lean depending on quad vs glute bias.',
      'Drive up through the front heel and mid-foot to starting stance.'
    ],
    commonMistakes: [
      'Placing front foot too close (causes excessive ankle collapse).',
      'Putting excessive weight on the rear leg instead of working front leg.',
      'Front knee caving inward.'
    ],
    setupTips: 'Hold dumbbells at sides with relaxed shoulders, looking forward.',
    tempoGuidance: '3-0-1-0',
    image: '/src/assets/images/bulgarian_split_squat_1794340387410.jpg'
  },
  {
    id: 'seated-cable-row',
    name: 'Seated Cable Row',
    primaryMuscles: ['Back'],
    secondaryMuscles: ['Biceps', 'Forearms', 'Shoulders'],
    equipment: 'Cable',
    category: 'Pull',
    formCues: [
      'Sit tall with knees slightly bent, feet on footrests.',
      'Maintain an upright torso with a natural arch in your lower back.',
      'Pull handle toward belly button while pulling shoulder blades back and down.',
      'Hold contraction for 1 second, then release with control without collapsing forward.'
    ],
    commonMistakes: [
      'Excessive backward rocking to pull the weight with lower back momentum.',
      'Rounding thoracic spine excessively on return.',
      'Pulling too high toward chest with flared elbows.'
    ],
    setupTips: 'Keep chest lifted tall toward the ceiling throughout the movement.',
    tempoGuidance: '2-1-1-0',
    image: '/src/assets/images/seated_cable_row_1794340388401.jpg'
  },
  {
    id: 'standing-calf-raise',
    name: 'Standing Calf Raise',
    primaryMuscles: ['Calves'],
    secondaryMuscles: [],
    equipment: 'Machine',
    category: 'Legs',
    formCues: [
      'Place balls of feet on edge of step with heels hanging off.',
      'Lower heels as deep as possible into a full calf stretch; hold for 2 seconds.',
      'Explosively press up onto big toes and peak contract calves for 1 second.',
      'Maintain straight knees to target the gastrocnemius muscle.'
    ],
    commonMistakes: [
      'Bouncing rapidly at the bottom with Achilles tendon elasticity instead of muscle work.',
      'Short range of motion without full stretch.',
      'Rolling weight onto outside edges of feet.'
    ],
    setupTips: 'A 2-second pause at the bottom removes the stretch reflex for maximum calf hypertrophy.',
    tempoGuidance: '3-2-1-1',
    image: '/src/assets/images/calf_raise_gym_1794340405659.jpg'
  },
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg & Knee Raise',
    primaryMuscles: ['Core'],
    secondaryMuscles: ['Forearms'],
    equipment: 'Bodyweight',
    category: 'Core',
    formCues: [
      'Hang from pull-up bar with overhand grip; stabilize body to prevent swinging.',
      'Curl pelvis upward toward ribcage rather than simply swinging thighs up.',
      'Raise legs/knees until thighs are parallel or higher than waist level.',
      'Lower legs slowly with resistance without letting heels swing behind body.'
    ],
    commonMistakes: [
      'Using swinging pendulum momentum.',
      'Only flexing hip flexors without curling the pelvis forward (no ab flexion).',
      'Arching lower back violently at the bottom.'
    ],
    setupTips: 'Imagine tucking your belt buckle up into your sternum.',
    tempoGuidance: '2-1-2-0',
    image: '/src/assets/images/hanging_leg_raise_1794340404741.jpg'
  },
  {
    id: 'cable-face-pull',
    name: 'Cable Face Pull with External Rotation',
    primaryMuscles: ['Shoulders', 'Back'],
    secondaryMuscles: ['Triceps'],
    equipment: 'Cable',
    category: 'Pull',
    formCues: [
      'Set cable pulley at eye or forehead level with double-rope attachment.',
      'Grip rope with thumbs pointing backward toward your face.',
      'Pull hands toward eyes/ears while rotating hands back so knuckles finish high.',
      'Squeeze rear delts, rhomboids, and external rotators for 1 full second.'
    ],
    commonMistakes: [
      'Using too much weight and leaning body backward.',
      'Pulling down to chest level instead of forehead level.',
      'Failing to externally rotate hands back at peak.'
    ],
    setupTips: 'Crucial for shoulder health, posture, and rotator cuff durability.',
    tempoGuidance: '2-1-1-1',
    image: '/src/assets/images/cable_face_pull_1794340405414.jpg'
  },
  {
    id: 'plank-hold',
    name: 'Standard Forearm Plank Hold',
    primaryMuscles: ['Core'],
    secondaryMuscles: ['Shoulders', 'Glutes', 'Quads'],
    equipment: 'Bodyweight',
    category: 'Core',
    formCues: [
      'Position elbows directly under shoulders with forearms parallel on the floor.',
      'Extend legs straight back, resting on balls of feet at hip-width.',
      'Brace abdominal wall tightly like preparing for a punch, squeezing glutes and quads.',
      'Maintain an unbroken straight line from crowns of head to heels without sagging hips.'
    ],
    commonMistakes: [
      'Allowing lower back to sag downward into excessive lumbar lordosis.',
      'Piking hips into the air to relieve core tension.',
      'Holding breath instead of diaphragmatic breathing under tension.'
    ],
    setupTips: 'Actively pull elbows towards toes on the floor to maximize anterior core tension.',
    tempoGuidance: 'Hold isometric tension for 45-60 seconds',
    image: '/src/assets/images/plank_hold_core_1794340489164.jpg'
  }
];

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Core',
  'Forearms'
];
