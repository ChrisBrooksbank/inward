import { describe, it, expect, beforeEach } from 'vitest';
import { SEED_VOCABULARY, initSeedVocabulary } from './vocabulary';
import { SharedDescription } from '$lib/types/domain';
import {
    DB_NAME,
    resetDb,
    getAllSharedDescriptions,
    countSharedDescriptions,
    putSharedDescription,
} from '$lib/db';

async function deleteTestDb(): Promise<void> {
    return new Promise<void>(resolve => {
        const req = indexedDB.deleteDatabase(DB_NAME);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
    });
}

beforeEach(async () => {
    resetDb();
    await deleteTestDb();
});

// =============================================================================
// SEED_VOCABULARY — static data checks
// =============================================================================

describe('SEED_VOCABULARY', () => {
    it('contains exactly 25 terms', () => {
        expect(SEED_VOCABULARY).toHaveLength(25);
    });

    it('has unique IDs across all terms', () => {
        const ids = SEED_VOCABULARY.map(t => t.id);
        expect(new Set(ids).size).toBe(SEED_VOCABULARY.length);
    });

    it('each term validates against the SharedDescription Zod schema', () => {
        for (const term of SEED_VOCABULARY) {
            expect(() => SharedDescription.parse(term)).not.toThrow();
        }
    });

    it('all terms have sharingLevel anonymous', () => {
        for (const term of SEED_VOCABULARY) {
            expect(term.sharingLevel).toBe('anonymous');
        }
    });

    it('covers heart, stomach, throat, chest, shoulders, hands, face, jaw, lungs regions', () => {
        const regions = new Set(SEED_VOCABULARY.map(t => t.bodyRegion));
        const expected = [
            'heart',
            'stomach',
            'throat',
            'chest',
            'shoulders',
            'hands',
            'face',
            'jaw',
            'lungs',
        ];
        for (const region of expected) {
            expect(regions.has(region as never)).toBe(true);
        }
    });

    it('covers all 5 vocabulary categories', () => {
        const categories = new Set(SEED_VOCABULARY.map(t => t.category));
        expect(categories.has('physical')).toBe(true);
        expect(categories.has('metaphorical')).toBe(true);
        expect(categories.has('quality')).toBe(true);
        expect(categories.has('intensity')).toBe(true);
    });
});

// =============================================================================
// initSeedVocabulary — DB seeding behaviour
// =============================================================================

describe('initSeedVocabulary', () => {
    it('inserts all 25 terms when the store is empty', async () => {
        await initSeedVocabulary();
        const all = await getAllSharedDescriptions();
        expect(all).toHaveLength(25);
    });

    it('does not insert when terms already exist', async () => {
        await initSeedVocabulary();
        await initSeedVocabulary(); // second call should be a no-op
        const count = await countSharedDescriptions();
        expect(count).toBe(25);
    });

    it('skips seeding when a user-created term already exists', async () => {
        await putSharedDescription(SEED_VOCABULARY[0]);
        await initSeedVocabulary();
        const count = await countSharedDescriptions();
        // Only the one pre-existing term, seeding was skipped
        expect(count).toBe(1);
    });

    it('persisted terms match the seed vocabulary IDs', async () => {
        await initSeedVocabulary();
        const all = await getAllSharedDescriptions();
        const ids = new Set(all.map(t => t.id));
        for (const term of SEED_VOCABULARY) {
            expect(ids.has(term.id)).toBe(true);
        }
    });
});
