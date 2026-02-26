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
