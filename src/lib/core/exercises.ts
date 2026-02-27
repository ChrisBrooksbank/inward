/**
 * Seed exercise data for Inward.
 * 18 exercises: 6 categories × 3 difficulty levels, covering all 16 body regions.
 *
 * Body region coverage:
 *   High-signal:   heart, stomach, lungs, throat
 *   Medium-signal: hands, feet, face, shoulders, chest, abdomen
 *   Low-signal:    back, arms, legs, neck, jaw, forehead
 */

import { z } from 'zod';
import { Exercise } from '$lib/types/domain';

type ExerciseType = z.infer<typeof Exercise>;
type ExerciseSeedData = Omit<
    z.input<typeof Exercise>,
    'id' | 'createdAt' | 'updatedAt' | 'isBuiltIn'
>;

const SEED_DATE = new Date('2026-01-01T00:00:00.000Z');

/** Parse seed data through Zod so .default() fields are applied automatically. */
function makeExercise(id: string, data: ExerciseSeedData): ExerciseType {
    return Exercise.parse({
        id,
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE,
        isBuiltIn: true,
        ...data,
    });
}

// =============================================================================
// Body Scan (systematic attention through body regions)
// =============================================================================

const BODY_SCAN_EXERCISES: ExerciseType[] = [
    makeExercise('00000000-0000-4000-8000-000000000001', {
        name: 'Quick Body Scan',
        description:
            'A short guided scan through four high-signal body regions. Ideal first practice for building interoceptive awareness.',
        category: 'body-scan',
        difficulty: 'beginner',
        bodyRegions: ['heart', 'stomach', 'lungs', 'hands'],
        signalTypes: ['cardiac', 'gastric', 'respiratory', 'muscular'],
        totalDurationSeconds: 125,
        requiredCompletions: 0,
        phases: [
            {
                id: 'p1',
                type: 'instruction',
                durationSeconds: 10,
                instruction:
                    "You'll slowly scan through four areas of your body, noticing whatever is there.",
            },
            {
                id: 'p2',
                type: 'notice',
                durationSeconds: 20,
                instruction: 'Bring attention to your heart area. What do you notice there?',
                bodyRegion: 'heart',
            },
            {
                id: 'p3',
                type: 'notice',
                durationSeconds: 20,
                instruction:
                    'Shift to your stomach. Any sensations — emptiness, fullness, movement?',
                bodyRegion: 'stomach',
            },
            {
                id: 'p4',
                type: 'notice',
                durationSeconds: 20,
                instruction: 'Now your lungs. Notice the movement of each breath.',
                bodyRegion: 'lungs',
            },
            {
                id: 'p5',
                type: 'notice',
                durationSeconds: 20,
                instruction: 'Finally, your hands. Temperature, tingling, pressure?',
                bodyRegion: 'hands',
            },
            {
                id: 'p6',
                type: 'describe',
                durationSeconds: 20,
                instruction: 'Which sensation stood out most? Describe it in your own words.',
                promptForDescription: true,
            },
            {
                id: 'p7',
                type: 'reflect',
                durationSeconds: 15,
                instruction: 'Is any of what you noticed connected to a feeling or emotion?',
                promptForEmotion: true,
            },
        ],
    }),

    makeExercise('00000000-0000-4000-8000-000000000002', {
        name: 'Upper Body Scan',
        description:
            'Guided attention through the face, shoulders, chest, and abdomen. Explores medium-signal regions.',
        category: 'body-scan',
        difficulty: 'intermediate',
        bodyRegions: ['face', 'shoulders', 'chest', 'abdomen'],
        signalTypes: ['thermal', 'muscular', 'cardiac', 'gastric'],
        totalDurationSeconds: 155,
        requiredCompletions: 5,
        requiredLevel: 'beginner',
        phases: [
            {
                id: 'p1',
                type: 'instruction',
                durationSeconds: 10,
                instruction:
                    "You'll move your attention slowly through your upper body, pausing to notice each area.",
            },
            {
                id: 'p2',
                type: 'notice',
                durationSeconds: 25,
                instruction:
                    'Start with your face. Notice the skin temperature, any tension around the eyes or jaw.',
                bodyRegion: 'face',
            },
            {
                id: 'p3',
                type: 'notice',
                durationSeconds: 25,
                instruction:
                    'Shift to your shoulders. Are they raised or relaxed? Any tightness or weight?',
                bodyRegion: 'shoulders',
            },
            {
                id: 'p4',
                type: 'notice',
                durationSeconds: 25,
                instruction:
                    'Bring attention to your chest. The rise and fall, any tightness or openness.',
                bodyRegion: 'chest',
            },
            {
                id: 'p5',
                type: 'notice',
                durationSeconds: 25,
                instruction:
                    'Now your abdomen. Subtle movements, pressure, warmth, or a sense of something there.',
                bodyRegion: 'abdomen',
            },
            {
                id: 'p6',
                type: 'describe',
                durationSeconds: 25,
                instruction: 'Pick the most vivid sensation. Describe it precisely.',
                promptForDescription: true,
            },
            {
                id: 'p7',
                type: 'reflect',
                durationSeconds: 20,
                instruction:
                    'Do any of these sensations feel connected to how you are feeling emotionally?',
                promptForEmotion: true,
            },
        ],
    }),

    makeExercise('00000000-0000-4000-8000-000000000003', {
        name: 'Deep Body Scan',
        description:
            'Advanced scan through subtle low-signal regions: back, arms, legs, and neck. Requires sustained attention.',
        category: 'body-scan',
        difficulty: 'advanced',
        bodyRegions: ['back', 'arms', 'legs', 'neck'],
        signalTypes: ['muscular', 'nociceptive'],
        totalDurationSeconds: 160,
        requiredCompletions: 5,
        requiredLevel: 'intermediate',
        phases: [
            {
                id: 'p1',
                type: 'instruction',
                durationSeconds: 10,
                instruction:
                    "You'll explore quieter, more subtle body regions. Let attention settle gently without forcing.",
            },
            {
                id: 'p2',
                type: 'notice',
                durationSeconds: 30,
                instruction:
                    'Bring your awareness to your back. Notice pressure against the surface you sit or stand on. Any ache or ease?',
                bodyRegion: 'back',
            },
            {
                id: 'p3',
                type: 'notice',
                durationSeconds: 25,
                instruction:
                    'Move to your arms. Temperature along the skin, weight of the limbs, any subtle tingling.',
                bodyRegion: 'arms',
            },
            {
                id: 'p4',
                type: 'notice',
                durationSeconds: 25,
                instruction:
                    'Now your legs. Heaviness or lightness, warmth or coolness, contact with the floor or seat.',
                bodyRegion: 'legs',
            },
            {
                id: 'p5',
                type: 'notice',
                durationSeconds: 25,
                instruction:
                    'Finally your neck. Tension, ease of movement, the pulse you may be able to sense there.',
                bodyRegion: 'neck',
            },
            {
                id: 'p6',
                type: 'describe',
                durationSeconds: 25,
                instruction:
                    'Describe the most nuanced thing you noticed. Precise language is welcome.',
                promptForDescription: true,
            },
            {
                id: 'p7',
                type: 'reflect',
                durationSeconds: 20,
                instruction:
                    'What, if anything, do these body sensations tell you about your current state?',
                promptForEmotion: true,
            },
        ],
    }),
];

// =============================================================================
// Focused Attention (sustained focus on a single region at rest)
// =============================================================================

const FOCUSED_ATTENTION_EXERCISES: ExerciseType[] = [
    makeExercise('00000000-0000-4000-8000-000000000004', {
        name: 'Hand Focus',
        description:
            'Bring sustained attention to your hands at rest. Hands are richly innervated and offer clear thermal and pressure signals.',
        category: 'focused-attention',
        difficulty: 'beginner',
        bodyRegions: ['hands'],
        signalTypes: ['thermal', 'muscular'],
        totalDurationSeconds: 100,
        requiredCompletions: 0,
        phases: [
            {
                id: 'p1',
                type: 'instruction',
                durationSeconds: 10,
                instruction:
                    'Rest your hands comfortably in your lap, palms up. You will focus entirely on what you can feel in your hands.',
            },
            {
                id: 'p2',
                type: 'notice',
                durationSeconds: 45,
                instruction:
                    'Close your eyes. Notice your hands. Temperature — warm or cool? Weight? Tingling, pulsing, pressure from resting on your legs? Just observe.',
                bodyRegion: 'hands',
            },
            {
                id: 'p3',
                type: 'describe',
                durationSeconds: 25,
                instruction: 'How would you describe what you felt? Use your own words.',
                bodyRegion: 'hands',
                promptForDescription: true,
            },
            {
                id: 'p4',
                type: 'reflect',
                durationSeconds: 20,
                instruction: 'Is there any emotional quality to what you noticed in your hands?',
                promptForEmotion: true,
            },
        ],
    }),

    makeExercise('00000000-0000-4000-8000-000000000005', {
        name: 'Stomach at Rest',
        description:
            'Sustained attention to the stomach and abdomen without movement. Notice subtle gastric signals, gut feelings, or neutral absence.',
        category: 'focused-attention',
        difficulty: 'intermediate',
        bodyRegions: ['stomach', 'abdomen'],
        signalTypes: ['gastric', 'affective'],
        totalDurationSeconds: 100,
        requiredCompletions: 5,
        requiredLevel: 'beginner',
        phases: [
            {
                id: 'p1',
                type: 'instruction',
                durationSeconds: 10,
                instruction:
                    "Find a comfortable position. You'll bring quiet attention to your stomach area.",
            },
            {
                id: 'p2',
                type: 'notice',
                durationSeconds: 45,
                instruction:
                    'Close your eyes. Bring your attention to your stomach. Notice any sensations — hunger, fullness, tightness, movement, warmth, or nothing at all.',
                bodyRegion: 'stomach',
            },
            {
                id: 'p3',
                type: 'describe',
                durationSeconds: 25,
                instruction: 'What words describe what you noticed? There are no wrong answers.',
                bodyRegion: 'stomach',
                promptForDescription: true,
            },
            {
                id: 'p4',
                type: 'reflect',
                durationSeconds: 20,
                instruction: 'Do these stomach sensations connect to any feeling or emotion?',
                promptForEmotion: true,
            },
        ],
    }),

    makeExercise('00000000-0000-4000-8000-000000000006', {
        name: 'Jaw & Forehead',
        description:
            'Focused attention on two subtle low-signal areas: the jaw and forehead. These regions often carry tension that goes unnoticed.',
        category: 'focused-attention',
        difficulty: 'advanced',
        bodyRegions: ['jaw', 'forehead'],
        signalTypes: ['muscular', 'nociceptive'],
        totalDurationSeconds: 130,
        requiredCompletions: 5,
        requiredLevel: 'intermediate',
        phases: [
            {
                id: 'p1',
                type: 'instruction',
                durationSeconds: 10,
                instruction:
                    "You'll gently explore your jaw and forehead — areas that often hold unnoticed tension. No need to change anything, just observe.",
            },
            {
                id: 'p2',
                type: 'notice',
                durationSeconds: 40,
                instruction:
                    'Close your eyes. Bring attention to your jaw. Are the teeth touching? Is there clenching, aching, or ease? Let your jaw be as it is.',
                bodyRegion: 'jaw',
            },
            {
                id: 'p3',
                type: 'notice',
                durationSeconds: 35,
                instruction:
                    'Now shift to your forehead. Notice any furrowing, tightness, pressure behind the eyes or brow.',
                bodyRegion: 'forehead',
            },
            {
                id: 'p4',
                type: 'describe',
                durationSeconds: 25,
                instruction: 'Describe the most distinct thing you noticed in either area.',
                promptForDescription: true,
            },
            {
                id: 'p5',
                type: 'reflect',
                durationSeconds: 20,
                instruction:
                    'What does the state of your jaw and forehead tell you about how you feel right now?',
                promptForEmotion: true,
            },
        ],
    }),
];

// =============================================================================
// Movement-Integrated (brief movement followed by noticing)
// =============================================================================

const MOVEMENT_INTEGRATED_EXERCISES: ExerciseType[] = [
    makeExercise('00000000-0000-4000-8000-000000000007', {
        name: 'Heart After Movement',
        description:
            'Notice your heartbeat after brief physical activity. Movement amplifies cardiac signals, making them easier to detect.',
        category: 'movement-integrated',
        difficulty: 'beginner',
        bodyRegions: ['heart', 'chest'],
        signalTypes: ['cardiac'],
        totalDurationSeconds: 100,
        requiredCompletions: 0,
        phases: [
            {
                id: 'p1',
                type: 'instruction',
                durationSeconds: 10,
                instruction: "In a moment, you'll do some jumping jacks, then notice your heart.",
            },
            {
                id: 'p2',
                type: 'movement',
                durationSeconds: 20,
                instruction: 'Do jumping jacks or march in place vigorously.',
            },
            {
                id: 'p3',
                type: 'rest',
                durationSeconds: 5,
                instruction: 'Stop and stand still.',
            },
            {
                id: 'p4',
                type: 'notice',
                durationSeconds: 30,
                instruction:
                    'Close your eyes. Notice your heart. Where do you feel it? What does it feel like?',
                bodyRegion: 'heart',
            },
            {
                id: 'p5',
                type: 'describe',
                durationSeconds: 20,
                instruction: 'Describe what you noticed about your heartbeat in your own words.',
                bodyRegion: 'heart',
                promptForDescription: true,
            },
            {
                id: 'p6',
                type: 'reflect',
                durationSeconds: 15,
                instruction: 'Is there any emotion connected to this sensation?',
                promptForEmotion: true,
            },
        ],
    }),

    makeExercise('00000000-0000-4000-8000-000000000008', {
        name: 'Shoulder Roll & Notice',
        description:
            'Gentle shoulder rolls to release tension, followed by noticing sensations in the shoulders and arms.',
        category: 'movement-integrated',
        difficulty: 'intermediate',
        bodyRegions: ['shoulders', 'arms'],
        signalTypes: ['muscular', 'thermal'],
        totalDurationSeconds: 125,
        requiredCompletions: 5,
        requiredLevel: 'beginner',
        phases: [
            {
                id: 'p1',
                type: 'instruction',
                durationSeconds: 10,
                instruction:
                    "You'll roll your shoulders to bring sensations to the surface, then notice what changed.",
            },
            {
                id: 'p2',
                type: 'movement',
                durationSeconds: 20,
                instruction:
                    'Slowly roll your shoulders — forward, up, back, and down — in large circles. Repeat continuously.',
            },
            {
                id: 'p3',
                type: 'rest',
                durationSeconds: 10,
                instruction: 'Let your arms drop and rest. Stay still.',
            },
            {
                id: 'p4',
                type: 'notice',
                durationSeconds: 30,
                instruction:
                    'Notice your shoulders. Warmth? Tingling? A sense of looseness or remaining tension?',
                bodyRegion: 'shoulders',
            },
            {
                id: 'p5',
                type: 'notice',
                durationSeconds: 20,
                instruction:
                    'Move attention to your arms. Warmth, heaviness, or blood-flow sensation?',
                bodyRegion: 'arms',
            },
            {
                id: 'p6',
                type: 'describe',
                durationSeconds: 20,
                instruction: 'Describe the post-movement sensation in your shoulders or arms.',
                promptForDescription: true,
            },
            {
                id: 'p7',
                type: 'reflect',
                durationSeconds: 15,
                instruction: 'Did the movement change how you feel emotionally? Notice any shift.',
                promptForEmotion: true,
            },
        ],
    }),

    makeExercise('00000000-0000-4000-8000-000000000009', {
        name: 'Leg Awakening',
        description:
            'Activate the legs and feet with brief movement, then attend to the subtle post-movement sensations in these lower-signal regions.',
        category: 'movement-integrated',
        difficulty: 'advanced',
        bodyRegions: ['legs', 'feet'],
        signalTypes: ['muscular', 'cardiac'],
        totalDurationSeconds: 150,
        requiredCompletions: 5,
        requiredLevel: 'intermediate',
        phases: [
            {
                id: 'p1',
                type: 'instruction',
                durationSeconds: 10,
                instruction:
                    "You'll briefly engage your legs and feet, then turn attention to the fading sensations. Notice what arises in these quieter regions.",
            },
            {
                id: 'p2',
                type: 'movement',
                durationSeconds: 20,
                instruction:
                    'Stand and do 20 calf raises, pressing through the balls of your feet.',
            },
            {
                id: 'p3',
                type: 'rest',
                durationSeconds: 15,
                instruction: 'Sit back down and remain completely still.',
            },
            {
                id: 'p4',
                type: 'notice',
                durationSeconds: 40,
                instruction:
                    'Notice your legs. Warmth, tingling, pulsing, fatigue? Let attention rest there without judging.',
                bodyRegion: 'legs',
            },
            {
                id: 'p5',
                type: 'notice',
                durationSeconds: 30,
                instruction:
                    'Move awareness to the soles of your feet. Warmth, pressure, tingling fading in or out?',
                bodyRegion: 'feet',
            },
            {
                id: 'p6',
                type: 'describe',
                durationSeconds: 20,
                instruction:
                    'Use precise language to describe what you detected in your legs or feet.',
                promptForDescription: true,
            },
            {
                id: 'p7',
                type: 'reflect',
                durationSeconds: 15,
                instruction: 'Any emotional tone to the post-movement state in your lower body?',
                promptForEmotion: true,
            },
        ],
    }),
];

// =============================================================================
// Heartbeat Detection (specific cardiac awareness)
// =============================================================================

const HEARTBEAT_DETECTION_EXERCISES: ExerciseType[] = [
    makeExercise('00000000-0000-4000-8000-000000000010', {
        name: 'Find Your Pulse',
        description:
            'Amplify your heartbeat with brief movement, then locate and describe the cardiac sensations you can detect.',
        category: 'heartbeat-detection',
        difficulty: 'beginner',
        bodyRegions: ['heart', 'chest'],
        signalTypes: ['cardiac'],
        totalDurationSeconds: 100,
        requiredCompletions: 0,
        phases: [
            {
                id: 'p1',
                type: 'instruction',
                durationSeconds: 10,
                instruction:
                    "You'll get your heart rate up briefly, then try to locate and feel your heartbeat.",
            },
            {
                id: 'p2',
                type: 'movement',
                durationSeconds: 15,
                instruction:
                    'March in place quickly or do jumping jacks to get your heart beating faster.',
            },
            {
                id: 'p3',
                type: 'rest',
                durationSeconds: 10,
                instruction: 'Stop and be completely still.',
            },
            {
                id: 'p4',
                type: 'notice',
                durationSeconds: 30,
                instruction:
                    'Without touching your body, notice your heartbeat. Where do you feel it? What does it feel like — pounding, fluttering, steady?',
                bodyRegion: 'heart',
            },
            {
                id: 'p5',
                type: 'describe',
                durationSeconds: 20,
                instruction: 'Describe the heartbeat you detected. Location, quality, rhythm.',
                bodyRegion: 'heart',
                promptForDescription: true,
            },
            {
                id: 'p6',
                type: 'reflect',
                durationSeconds: 15,
                instruction: 'Any feeling or emotion connected to noticing your heartbeat?',
                promptForEmotion: true,
            },
        ],
    }),

    makeExercise('00000000-0000-4000-8000-000000000011', {
        name: 'Resting Heartbeat',
        description:
            'Detect your heartbeat at rest in two locations: the heart area and the throat, where the carotid pulse can sometimes be felt.',
        category: 'heartbeat-detection',
        difficulty: 'intermediate',
        bodyRegions: ['heart', 'throat'],
        signalTypes: ['cardiac'],
        totalDurationSeconds: 110,
        requiredCompletions: 5,
        requiredLevel: 'beginner',
        phases: [
            {
                id: 'p1',
                type: 'instruction',
                durationSeconds: 10,
                instruction:
                    "Without movement, you'll try to detect your heartbeat in two different places. This is harder — quiet your mind and be patient.",
            },
            {
                id: 'p2',
                type: 'notice',
                durationSeconds: 30,
                instruction:
                    'Close your eyes. Bring attention to your heart or chest area. Wait for a beat or flutter. It may be very subtle.',
                bodyRegion: 'heart',
            },
            {
                id: 'p3',
                type: 'notice',
                durationSeconds: 25,
                instruction:
                    'Now move attention to your throat. Some people can sense the pulse there. Notice any regular pulsing, warmth, or movement.',
                bodyRegion: 'throat',
            },
            {
                id: 'p4',
                type: 'describe',
                durationSeconds: 25,
                instruction:
                    'What did you notice? Describe any pulse sensations — or describe the experience of trying to find them.',
                promptForDescription: true,
            },
            {
                id: 'p5',
                type: 'reflect',
                durationSeconds: 20,
                instruction: 'How does noticing your resting heartbeat make you feel?',
                promptForEmotion: true,
            },
        ],
    }),

    makeExercise('00000000-0000-4000-8000-000000000012', {
        name: 'Subtle Pulse Awareness',
        description:
            'Advanced cardiac detection: locate the heartbeat in the heart, neck, and forehead — progressively subtler locations.',
        category: 'heartbeat-detection',
        difficulty: 'advanced',
        bodyRegions: ['heart', 'neck', 'forehead'],
        signalTypes: ['cardiac'],
        totalDurationSeconds: 150,
        requiredCompletions: 5,
        requiredLevel: 'intermediate',
        phases: [
            {
                id: 'p1',
                type: 'instruction',
                durationSeconds: 10,
                instruction:
                    "You'll try to sense your heartbeat in three locations, each more subtle than the last. Allow 30+ seconds in each area.",
            },
            {
                id: 'p2',
                type: 'notice',
                durationSeconds: 35,
                instruction:
                    'Begin with your heart area. Notice any pulsing, warmth, or rhythm — however faint.',
                bodyRegion: 'heart',
            },
            {
                id: 'p3',
                type: 'notice',
                durationSeconds: 30,
                instruction:
                    'Shift to your neck. Some people can sense the carotid pulse here. Give it time.',
                bodyRegion: 'neck',
            },
            {
                id: 'p4',
                type: 'notice',
                durationSeconds: 30,
                instruction:
                    'Now your forehead. A faint pulsing may be detectable near the temples. Stay very still and patient.',
                bodyRegion: 'forehead',
            },
            {
                id: 'p5',
                type: 'describe',
                durationSeconds: 25,
                instruction:
                    'Describe each location where you detected or tried to detect a pulse.',
                promptForDescription: true,
            },
            {
                id: 'p6',
                type: 'reflect',
                durationSeconds: 20,
                instruction: 'What was it like to search for your heartbeat in these quiet areas?',
                promptForEmotion: true,
            },
        ],
    }),
];

// =============================================================================
// Breath Awareness (respiratory signal focus)
// =============================================================================

const BREATH_AWARENESS_EXERCISES: ExerciseType[] = [
    makeExercise('00000000-0000-4000-8000-000000000013', {
        name: 'Breath Basics',
        description:
            'Introductory breath awareness: simply notice the natural movement of each breath in the lungs and chest.',
        category: 'breath-awareness',
        difficulty: 'beginner',
        bodyRegions: ['lungs', 'chest'],
        signalTypes: ['respiratory'],
        totalDurationSeconds: 90,
        requiredCompletions: 0,
        phases: [
            {
                id: 'p1',
                type: 'instruction',
                durationSeconds: 10,
                instruction:
                    "You don't need to change your breathing. Simply notice it as it is — natural and uncontrolled.",
            },
            {
                id: 'p2',
                type: 'notice',
                durationSeconds: 45,
                instruction:
                    'Close your eyes. Notice the air moving in through your nose or mouth, filling your lungs, and releasing. The rise and fall of your chest. No need to deepen or slow your breath.',
                bodyRegion: 'lungs',
            },
            {
                id: 'p3',
                type: 'describe',
                durationSeconds: 20,
                instruction:
                    'Describe what your breath felt like — rhythm, depth, texture, temperature.',
                promptForDescription: true,
            },
            {
                id: 'p4',
                type: 'reflect',
                durationSeconds: 15,
                instruction: 'What emotion, if any, was present while you watched your breath?',
                promptForEmotion: true,
            },
        ],
    }),

    makeExercise('00000000-0000-4000-8000-000000000014', {
        name: 'Throat Breath',
        description:
            'Focus on the sensation of breath passing through the throat and into the lungs — notice the two distinct sensations.',
        category: 'breath-awareness',
        difficulty: 'intermediate',
        bodyRegions: ['throat', 'lungs'],
        signalTypes: ['respiratory'],
        totalDurationSeconds: 125,
        requiredCompletions: 5,
        requiredLevel: 'beginner',
        phases: [
            {
                id: 'p1',
                type: 'instruction',
                durationSeconds: 10,
                instruction:
                    "You'll pay close attention to your throat as air passes through it, then follow that air into your lungs.",
            },
            {
                id: 'p2',
                type: 'notice',
                durationSeconds: 40,
                instruction:
                    'Close your eyes. Notice your throat with each breath. Coolness on the inhale? Warmth on the exhale? Subtle friction or movement?',
                bodyRegion: 'throat',
            },
            {
                id: 'p3',
                type: 'notice',
                durationSeconds: 30,
                instruction:
                    'Now follow each breath deeper. Notice where the breath lands in your lungs — high in the chest or lower? Full or shallow?',
                bodyRegion: 'lungs',
            },
            {
                id: 'p4',
                type: 'describe',
                durationSeconds: 25,
                instruction: 'Describe the journey of one breath — from throat to lungs.',
                promptForDescription: true,
            },
            {
                id: 'p5',
                type: 'reflect',
                durationSeconds: 20,
                instruction: 'Any emotional quality to the act of breathing right now?',
                promptForEmotion: true,
            },
        ],
    }),

    makeExercise('00000000-0000-4000-8000-000000000015', {
        name: 'Abdominal Breath',
        description:
            'Advanced breath awareness: detect breathing movement in the abdomen and lower back — areas often unnoticed.',
        category: 'breath-awareness',
        difficulty: 'advanced',
        bodyRegions: ['abdomen', 'back'],
        signalTypes: ['respiratory', 'muscular'],
        totalDurationSeconds: 135,
        requiredCompletions: 5,
        requiredLevel: 'intermediate',
        phases: [
            {
                id: 'p1',
                type: 'instruction',
                durationSeconds: 10,
                instruction:
                    "You'll look for breathing movement in lower, less obvious places — the abdomen and lower back. This requires patient, fine-grained attention.",
            },
            {
                id: 'p2',
                type: 'notice',
                durationSeconds: 45,
                instruction:
                    'Close your eyes. Bring attention to your abdomen. Can you detect any movement with each breath — subtle rise, gentle pressure, warmth?',
                bodyRegion: 'abdomen',
            },
            {
                id: 'p3',
                type: 'notice',
                durationSeconds: 35,
                instruction:
                    'Shift awareness to your lower back. With each inhale, does the back expand slightly? Is there any movement, pressure, or relief of pressure?',
                bodyRegion: 'back',
            },
            {
                id: 'p4',
                type: 'describe',
                durationSeconds: 25,
                instruction:
                    'Describe what you detected — however faint — in your abdomen or back.',
                promptForDescription: true,
            },
            {
                id: 'p5',
                type: 'reflect',
                durationSeconds: 20,
                instruction:
                    'What does your breath quality tell you about your current emotional state?',
                promptForEmotion: true,
            },
        ],
    }),
];

// =============================================================================
// Thermal Awareness (temperature and blood flow detection)
// =============================================================================

const THERMAL_AWARENESS_EXERCISES: ExerciseType[] = [
    makeExercise('00000000-0000-4000-8000-000000000016', {
        name: 'Hand Warmth',
        description:
            'Detect thermal sensations in your hands at rest. Temperature awareness is one of the most accessible interoceptive signals.',
        category: 'thermal-awareness',
        difficulty: 'beginner',
        bodyRegions: ['hands'],
        signalTypes: ['thermal'],
        totalDurationSeconds: 90,
        requiredCompletions: 0,
        phases: [
            {
                id: 'p1',
                type: 'instruction',
                durationSeconds: 10,
                instruction:
                    'Rest your hands on your lap, palms facing up. You will focus on temperature — nothing else.',
            },
            {
                id: 'p2',
                type: 'notice',
                durationSeconds: 45,
                instruction:
                    'Close your eyes. Notice the temperature of your hands. Warm? Cool? Different in the palms versus fingertips? Does the warmth change as you pay attention?',
                bodyRegion: 'hands',
            },
            {
                id: 'p3',
                type: 'describe',
                durationSeconds: 20,
                instruction: 'Describe the temperature in your hands. Be specific.',
                bodyRegion: 'hands',
                promptForDescription: true,
            },
            {
                id: 'p4',
                type: 'reflect',
                durationSeconds: 15,
                instruction:
                    'Any emotions or associations that arose from attending to temperature?',
                promptForEmotion: true,
            },
        ],
    }),

    makeExercise('00000000-0000-4000-8000-000000000017', {
        name: 'Face Temperature',
        description:
            'Attend to thermal sensations across the face — flushing, coolness, asymmetry, or blood-flow changes.',
        category: 'thermal-awareness',
        difficulty: 'intermediate',
        bodyRegions: ['face'],
        signalTypes: ['thermal', 'affective'],
        totalDurationSeconds: 100,
        requiredCompletions: 5,
        requiredLevel: 'beginner',
        phases: [
            {
                id: 'p1',
                type: 'instruction',
                durationSeconds: 10,
                instruction:
                    "You'll pay close attention to temperature and blood flow across your face. This can reveal subtle emotional states.",
            },
            {
                id: 'p2',
                type: 'notice',
                durationSeconds: 45,
                instruction:
                    'Close your eyes. Notice your face. Is it warm or cool? Uniform or patchy? Any flushing, coolness around the nose or cheeks, warmth near the ears?',
                bodyRegion: 'face',
            },
            {
                id: 'p3',
                type: 'describe',
                durationSeconds: 25,
                instruction: 'Describe the temperature landscape of your face right now.',
                bodyRegion: 'face',
                promptForDescription: true,
            },
            {
                id: 'p4',
                type: 'reflect',
                durationSeconds: 20,
                instruction: 'Facial temperature often reflects emotion. What does yours signal?',
                promptForEmotion: true,
            },
        ],
    }),

    makeExercise('00000000-0000-4000-8000-000000000018', {
        name: 'Back Warmth',
        description:
            'Advanced thermal awareness: detect temperature and blood-flow sensations in the back — a low-signal region that requires sustained attention.',
        category: 'thermal-awareness',
        difficulty: 'advanced',
        bodyRegions: ['back'],
        signalTypes: ['thermal'],
        totalDurationSeconds: 100,
        requiredCompletions: 5,
        requiredLevel: 'intermediate',
        phases: [
            {
                id: 'p1',
                type: 'instruction',
                durationSeconds: 10,
                instruction:
                    "You'll look for thermal sensations in your back — a quiet area. This takes patience. Separate temperature from pressure or contact.",
            },
            {
                id: 'p2',
                type: 'notice',
                durationSeconds: 45,
                instruction:
                    'Close your eyes. Bring attention to your back. Notice temperature — distinct from the contact of your clothing or chair. Any warmth, coolness, or blood-flow spreading?',
                bodyRegion: 'back',
            },
            {
                id: 'p3',
                type: 'describe',
                durationSeconds: 25,
                instruction:
                    'Describe any thermal sensation you detected in your back, however faint.',
                bodyRegion: 'back',
                promptForDescription: true,
            },
            {
                id: 'p4',
                type: 'reflect',
                durationSeconds: 20,
                instruction:
                    'What was the experience of looking for subtle temperature like? Any emotion present?',
                promptForEmotion: true,
            },
        ],
    }),
];

// =============================================================================
// All seed exercises combined
// =============================================================================

export const SEED_EXERCISES: ExerciseType[] = [
    ...BODY_SCAN_EXERCISES,
    ...FOCUSED_ATTENTION_EXERCISES,
    ...MOVEMENT_INTEGRATED_EXERCISES,
    ...HEARTBEAT_DETECTION_EXERCISES,
    ...BREATH_AWARENESS_EXERCISES,
    ...THERMAL_AWARENESS_EXERCISES,
];
