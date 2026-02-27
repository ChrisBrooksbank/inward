/**
 * Core domain types for Inward interoception training.
 * Based on EXERCISE-SYSTEM.md and SENSATION-VOCABULARY.md specifications.
 */

import { z } from 'zod';

// =============================================================================
// Body Regions & Signal Types (from EXERCISE-SYSTEM.md)
// =============================================================================

/**
 * Body regions based on Mahler's curriculum, organized by signal detectability.
 */
export const BodyRegion = z.enum([
    // High signal regions (easier detection)
    'heart',
    'stomach',
    'lungs',
    'throat',

    // Medium signal regions
    'hands',
    'feet',
    'face',
    'shoulders',
    'chest',
    'abdomen',

    // Lower signal regions (subtle detection)
    'back',
    'arms',
    'legs',
    'neck',
    'jaw',
    'forehead',
]);

export type BodyRegion = z.infer<typeof BodyRegion>;

/**
 * Interoceptive signal categories from research.
 */
export const SignalType = z.enum([
    'cardiac', // Heart, blood vessels, pulse
    'respiratory', // Lungs, diaphragm, breath
    'gastric', // Stomach, intestines, hunger/fullness
    'thermal', // Temperature, sweating, flushing
    'nociceptive', // Pain, aches, discomfort
    'muscular', // Tension, fatigue, trembling
    'affective', // Emotional body sensations
]);

export type SignalType = z.infer<typeof SignalType>;

// =============================================================================
// Vocabulary Types (from SENSATION-VOCABULARY.md)
// =============================================================================

/**
 * Categories to organize and search vocabulary.
 */
export const VocabularyCategory = z.enum([
    'physical', // Direct physical sensations (tight, warm, heavy)
    'emotional', // Emotion-body connections (anxious flutter, calm warmth)
    'metaphorical', // Figurative descriptions (butterflies, knot, weight)
    'quality', // Sensation qualities (sharp, dull, pulsing)
    'intensity', // Intensity descriptors (slight, moderate, overwhelming)
]);

export type VocabularyCategory = z.infer<typeof VocabularyCategory>;

/**
 * Privacy controls for vocabulary sharing.
 */
export const SharingLevel = z.enum([
    'private', // Only visible to creator
    'anonymous', // Shared without attribution
    'attributed', // Shared with optional username
]);

export type SharingLevel = z.infer<typeof SharingLevel>;

/**
 * Track how shared vocabulary is received.
 */
export const ConfirmationStatus = z.enum([
    'unconfirmed', // Not yet confirmed by others
    'confirmed', // At least one confirmation
    'popular', // Many confirmations (threshold: 5+)
]);

export type ConfirmationStatus = z.infer<typeof ConfirmationStatus>;

/**
 * Core vocabulary unit - a user's description of a sensation.
 */
export const SensationDescription = z.object({
    id: z.string().uuid(),

    // Content
    text: z.string().min(1).max(200),
    category: VocabularyCategory,

    // Context
    bodyRegion: BodyRegion,
    signalType: SignalType.optional(),
    emotionConnection: z.string().max(50).optional(),

    // Source
    exerciseId: z.string().uuid().optional(),
    sessionId: z.string().uuid().optional(),

    // Metadata
    createdAt: z.date(),
    updatedAt: z.date(),

    // Sharing
    sharingLevel: SharingLevel.default('private'),
    sharedAt: z.date().optional(),
});

export type SensationDescription = z.infer<typeof SensationDescription>;

/**
 * Extended schema for P2P shared vocabulary.
 */
export const SharedDescription = z.object({
    id: z.string().uuid(),

    // Content (from SensationDescription)
    text: z.string().min(1).max(200),
    category: VocabularyCategory,
    bodyRegion: BodyRegion,
    signalType: SignalType.optional(),
    emotionConnection: z.string().max(50).optional(),

    // Attribution
    sharingLevel: SharingLevel,
    contributorId: z.string().uuid().optional(), // null if anonymous
    contributorName: z.string().max(50).optional(),

    // P2P metrics
    confirmationCount: z.number().default(0),
    confirmationStatus: ConfirmationStatus.default('unconfirmed'),

    // Timestamps
    sharedAt: z.date(),
    lastConfirmedAt: z.date().optional(),
});

export type SharedDescription = z.infer<typeof SharedDescription>;

/**
 * Records when a user confirms shared vocabulary.
 */
export const VocabularyConfirmation = z.object({
    id: z.string().uuid(),
    sharedDescriptionId: z.string().uuid(),
    userId: z.string().uuid(),
    confirmedAt: z.date(),

    // Optional context
    bodyRegion: BodyRegion.optional(), // May differ from original
    note: z.string().max(100).optional(),
});

export type VocabularyConfirmation = z.infer<typeof VocabularyConfirmation>;

// =============================================================================
// Exercise System Types (from docs/EXERCISE-SYSTEM.md)
// =============================================================================

/**
 * Six exercise categories addressing different training mechanisms.
 */
export const ExerciseCategory = z.enum([
    'body-scan',
    'focused-attention',
    'movement-integrated',
    'heartbeat-detection',
    'breath-awareness',
    'thermal-awareness',
]);

export type ExerciseCategory = z.infer<typeof ExerciseCategory>;

/**
 * Progressive difficulty levels based on signal intensity.
 */
export const DifficultyLevel = z.enum(['beginner', 'intermediate', 'advanced']);

export type DifficultyLevel = z.infer<typeof DifficultyLevel>;

/**
 * Types of phases within an exercise.
 */
export const PhaseType = z.enum([
    'instruction',
    'movement',
    'rest',
    'notice',
    'describe',
    'reflect',
]);

export type PhaseType = z.infer<typeof PhaseType>;

/**
 * A single phase within an exercise (attention, movement, description, etc.).
 */
export const ExercisePhase = z.object({
    id: z.string(),
    type: PhaseType,
    durationSeconds: z.number().min(5).max(120),
    instruction: z.string(),
    bodyRegion: BodyRegion.optional(),
    promptForDescription: z.boolean().default(false),
    promptForEmotion: z.boolean().default(false),
});

export type ExercisePhase = z.infer<typeof ExercisePhase>;

/**
 * Complete exercise definition with phases, difficulty, and unlock criteria.
 */
export const Exercise = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100),
    description: z.string().max(500),
    category: ExerciseCategory,
    difficulty: DifficultyLevel,
    bodyRegions: z.array(BodyRegion).min(1),
    signalTypes: z.array(SignalType).min(1),
    phases: z.array(ExercisePhase).min(1),
    totalDurationSeconds: z.number(),
    createdAt: z.date(),
    updatedAt: z.date(),
    isBuiltIn: z.boolean().default(true),
    requiredCompletions: z.number().default(0),
    requiredLevel: DifficultyLevel.optional(),
});

export type Exercise = z.infer<typeof Exercise>;

/**
 * State machine states for an exercise session.
 */
export const SessionState = z.enum(['idle', 'playing', 'paused', 'completed', 'abandoned']);

export type SessionState = z.infer<typeof SessionState>;

const PhaseDescription = z.object({
    phaseId: z.string(),
    bodyRegion: BodyRegion,
    text: z.string(),
    timestamp: z.date(),
});

const EmotionConnection = z.object({
    phaseId: z.string(),
    emotion: z.string(),
    bodyRegion: BodyRegion,
    timestamp: z.date(),
});

/**
 * Records a single user exercise attempt with state, descriptions, and emotions.
 */
export const ExerciseSession = z.object({
    id: z.string().uuid(),
    exerciseId: z.string().uuid(),
    state: SessionState,
    startedAt: z.date(),
    completedAt: z.date().optional(),
    phasesCompleted: z.number(),
    totalPhases: z.number(),
    descriptions: z.array(PhaseDescription),
    emotionConnections: z.array(EmotionConnection),
    difficultyRating: z.number().min(1).max(5).optional(),
    notes: z.string().optional(),
});

export type ExerciseSession = z.infer<typeof ExerciseSession>;

/**
 * Aggregated user progress for a single exercise (unlock state, completion stats).
 */
export const ExerciseProgress = z.object({
    exerciseId: z.string().uuid(),
    totalAttempts: z.number(),
    completedAttempts: z.number(),
    lastAttemptAt: z.date().optional(),
    uniqueDescriptions: z.number(),
    unlocked: z.boolean(),
    unlockedAt: z.date().optional(),
});

export type ExerciseProgress = z.infer<typeof ExerciseProgress>;

// =============================================================================
// MAIA-2 Assessment Types (from docs/INTEROCEPTION-RESEARCH.md)
// =============================================================================

/**
 * Eight subscales of the MAIA-2 interoceptive awareness questionnaire.
 */
export const MAIASubscale = z.enum([
    'noticing',
    'not-distracting',
    'not-worrying',
    'attention-regulation',
    'emotional-awareness',
    'self-regulation',
    'body-listening',
    'trusting',
]);

export type MAIASubscale = z.infer<typeof MAIASubscale>;

/**
 * Score for one MAIA-2 subscale (0–5 average of items in that subscale).
 */
export const MAIAScore = z.object({
    subscale: MAIASubscale,
    score: z.number().min(0).max(5),
    measuredAt: z.date(),
});

export type MAIAScore = z.infer<typeof MAIAScore>;

/**
 * Full MAIA-2 assessment: 37 raw item responses and 8 computed subscale scores.
 */
export const MAIAAssessment = z.object({
    id: z.string().uuid(),
    responses: z.array(z.number().min(0).max(5)).length(37),
    scores: z.array(MAIAScore),
    completedAt: z.date(),
});

export type MAIAAssessment = z.infer<typeof MAIAAssessment>;

// =============================================================================
// User Profile (from specs/02-onboarding.md, specs/01-foundation.md)
// =============================================================================

/**
 * App-level user preferences stored in IndexedDB.
 */
export const UserSettings = z.object({
    reducedMotion: z.boolean().default(false),
    fontSize: z.enum(['default', 'large', 'larger']).default('default'),
    notificationsEnabled: z.boolean().default(false),
    syncConsentGiven: z.boolean().default(false),
});

export type UserSettings = z.infer<typeof UserSettings>;

/**
 * User profile tracking onboarding state and settings.
 */
export const UserProfile = z.object({
    id: z.string().uuid(),
    onboardingComplete: z.boolean().default(false),
    onboardingStep: z.number().min(0).max(6).default(0),
    settings: UserSettings,
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type UserProfile = z.infer<typeof UserProfile>;

/**
 * Aggregated vocabulary statistics for a user.
 */
export const UserVocabularyProfile = z.object({
    userId: z.string().uuid(),

    // Counts
    totalDescriptions: z.number(),
    sharedDescriptions: z.number(),
    confirmationsReceived: z.number(),
    confirmationsGiven: z.number(),

    // Coverage
    bodyRegionsCovered: z.array(BodyRegion),
    categoriesUsed: z.array(VocabularyCategory),

    // Discovery
    vocabularyDiscovered: z.number(), // Adopted from others

    // Timestamps
    firstDescriptionAt: z.date().optional(),
    lastDescriptionAt: z.date().optional(),
});

export type UserVocabularyProfile = z.infer<typeof UserVocabularyProfile>;
