/**
 * Seed vocabulary for Inward.
 * 25 pre-loaded shared descriptions covering common interoceptive sensations.
 * Based on SENSATION-VOCABULARY.md specification.
 */

import { z } from 'zod';
import { SharedDescription } from '$lib/types/domain';
import { countSharedDescriptions, putSharedDescription } from '$lib/db';

type SharedDescriptionType = z.infer<typeof SharedDescription>;
type SeedData = Omit<z.input<typeof SharedDescription>, 'id' | 'sharedAt'>;

const SEED_DATE = new Date('2026-01-01T00:00:00.000Z');

function makeSeed(id: string, data: SeedData): SharedDescriptionType {
    return SharedDescription.parse({ id, sharedAt: SEED_DATE, ...data });
}

// =============================================================================
// Seed Vocabulary — 25 terms across body regions
// =============================================================================

export const SEED_VOCABULARY: SharedDescriptionType[] = [
    // Heart — cardiac
    makeSeed('00000000-0000-4000-a000-000000000001', {
        text: 'pounding',
        category: 'physical',
        bodyRegion: 'heart',
        signalType: 'cardiac',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),
    makeSeed('00000000-0000-4000-a000-000000000002', {
        text: 'fluttering',
        category: 'physical',
        bodyRegion: 'heart',
        signalType: 'cardiac',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),
    makeSeed('00000000-0000-4000-a000-000000000003', {
        text: 'racing',
        category: 'physical',
        bodyRegion: 'heart',
        signalType: 'cardiac',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),

    // Stomach — gastric
    makeSeed('00000000-0000-4000-a000-000000000004', {
        text: 'butterflies',
        category: 'metaphorical',
        bodyRegion: 'stomach',
        signalType: 'gastric',
        emotionConnection: 'anxiety',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),
    makeSeed('00000000-0000-4000-a000-000000000005', {
        text: 'churning',
        category: 'physical',
        bodyRegion: 'stomach',
        signalType: 'gastric',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),
    makeSeed('00000000-0000-4000-a000-000000000006', {
        text: 'hollow',
        category: 'physical',
        bodyRegion: 'stomach',
        signalType: 'gastric',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),
    makeSeed('00000000-0000-4000-a000-000000000007', {
        text: 'knot',
        category: 'metaphorical',
        bodyRegion: 'stomach',
        signalType: 'gastric',
        emotionConnection: 'anxiety',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),

    // Throat — muscular
    makeSeed('00000000-0000-4000-a000-000000000008', {
        text: 'lump',
        category: 'metaphorical',
        bodyRegion: 'throat',
        signalType: 'muscular',
        emotionConnection: 'sadness',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),
    makeSeed('00000000-0000-4000-a000-000000000009', {
        text: 'tight',
        category: 'physical',
        bodyRegion: 'throat',
        signalType: 'muscular',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),

    // Chest — affective
    makeSeed('00000000-0000-4000-a000-000000000010', {
        text: 'heavy',
        category: 'physical',
        bodyRegion: 'chest',
        signalType: 'affective',
        emotionConnection: 'sadness',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),
    makeSeed('00000000-0000-4000-a000-000000000011', {
        text: 'weight',
        category: 'metaphorical',
        bodyRegion: 'chest',
        signalType: 'affective',
        emotionConnection: 'sadness',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),
    makeSeed('00000000-0000-4000-a000-000000000012', {
        text: 'expanding',
        category: 'physical',
        bodyRegion: 'chest',
        signalType: 'affective',
        emotionConnection: 'joy',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),

    // Shoulders — muscular
    makeSeed('00000000-0000-4000-a000-000000000013', {
        text: 'knotted',
        category: 'metaphorical',
        bodyRegion: 'shoulders',
        signalType: 'muscular',
        emotionConnection: 'stress',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),
    makeSeed('00000000-0000-4000-a000-000000000014', {
        text: 'raised',
        category: 'physical',
        bodyRegion: 'shoulders',
        signalType: 'muscular',
        emotionConnection: 'anxiety',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),

    // Hands — thermal / muscular
    makeSeed('00000000-0000-4000-a000-000000000015', {
        text: 'tingling',
        category: 'physical',
        bodyRegion: 'hands',
        signalType: 'thermal',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),
    makeSeed('00000000-0000-4000-a000-000000000016', {
        text: 'cold and clammy',
        category: 'physical',
        bodyRegion: 'hands',
        signalType: 'thermal',
        emotionConnection: 'anxiety',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),
    makeSeed('00000000-0000-4000-a000-000000000017', {
        text: 'trembling',
        category: 'physical',
        bodyRegion: 'hands',
        signalType: 'muscular',
        emotionConnection: 'fear',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),

    // Face — thermal
    makeSeed('00000000-0000-4000-a000-000000000018', {
        text: 'flushed',
        category: 'physical',
        bodyRegion: 'face',
        signalType: 'thermal',
        emotionConnection: 'anger',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),
    makeSeed('00000000-0000-4000-a000-000000000019', {
        text: 'hot',
        category: 'physical',
        bodyRegion: 'face',
        signalType: 'thermal',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),

    // Jaw — muscular
    makeSeed('00000000-0000-4000-a000-000000000020', {
        text: 'clenched',
        category: 'physical',
        bodyRegion: 'jaw',
        signalType: 'muscular',
        emotionConnection: 'anger',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),

    // Lungs — respiratory
    makeSeed('00000000-0000-4000-a000-000000000021', {
        text: 'constricted',
        category: 'physical',
        bodyRegion: 'lungs',
        signalType: 'respiratory',
        emotionConnection: 'anxiety',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),
    makeSeed('00000000-0000-4000-a000-000000000022', {
        text: 'shallow',
        category: 'quality',
        bodyRegion: 'lungs',
        signalType: 'respiratory',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),

    // Intensity descriptors (chest as generic region)
    makeSeed('00000000-0000-4000-a000-000000000023', {
        text: 'subtle',
        category: 'intensity',
        bodyRegion: 'chest',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),
    makeSeed('00000000-0000-4000-a000-000000000024', {
        text: 'overwhelming',
        category: 'intensity',
        bodyRegion: 'chest',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),

    // Quality descriptor
    makeSeed('00000000-0000-4000-a000-000000000025', {
        text: 'pulsing',
        category: 'quality',
        bodyRegion: 'heart',
        signalType: 'cardiac',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    }),
];

// =============================================================================
// Seed initialiser — idempotent, runs once per fresh install
// =============================================================================

/**
 * Loads the 25 seed vocabulary terms into IndexedDB if the store is empty.
 * Safe to call on every app start — skips if already seeded.
 */
export async function initSeedVocabulary(): Promise<void> {
    const count = await countSharedDescriptions();
    if (count > 0) return;
    await Promise.all(SEED_VOCABULARY.map(term => putSharedDescription(term)));
}
