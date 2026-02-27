import { test, expect, type Page } from '@playwright/test';

const DB_NAME = 'inward-db';
const QUICK_BODY_SCAN_ID = '00000000-0000-4000-8000-000000000001';

async function clearIndexedDB(page: Page): Promise<void> {
    await page.evaluate((dbName: string) => {
        return new Promise<void>((resolve, reject) => {
            const req = indexedDB.deleteDatabase(dbName);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }, DB_NAME);
}

/**
 * Seeds IndexedDB with a completed onboarding profile so the route guard
 * doesn't redirect to /onboarding. Creates all required object stores if
 * the database doesn't exist yet (i.e. after clearIndexedDB).
 */
async function seedOnboardingComplete(page: Page): Promise<void> {
    await page.evaluate((dbName: string) => {
        return new Promise<void>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1);
            req.onupgradeneeded = () => {
                const db = req.result;
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('sessions')) {
                    const s = db.createObjectStore('sessions', { keyPath: 'id' });
                    s.createIndex('exerciseId', 'exerciseId');
                    s.createIndex('state', 'state');
                }
                if (!db.objectStoreNames.contains('descriptions')) {
                    const d = db.createObjectStore('descriptions', { keyPath: 'id' });
                    d.createIndex('bodyRegion', 'bodyRegion');
                    d.createIndex('sharingLevel', 'sharingLevel');
                }
                if (!db.objectStoreNames.contains('confirmations')) {
                    const c = db.createObjectStore('confirmations', { keyPath: 'id' });
                    c.createIndex('sharedDescriptionId', 'sharedDescriptionId');
                }
                if (!db.objectStoreNames.contains('assessments')) {
                    db.createObjectStore('assessments', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('offlineQueue')) {
                    const q = db.createObjectStore('offlineQueue', { keyPath: 'id' });
                    q.createIndex('type', 'type');
                }
            };
            req.onsuccess = () => {
                const db = req.result;
                const tx = db.transaction('settings', 'readwrite');
                const store = tx.objectStore('settings');
                store.put({
                    id: '00000000-0000-4000-8000-000000000099',
                    onboardingComplete: true,
                    onboardingStep: 6,
                    settings: {
                        reducedMotion: false,
                        fontSize: 'default',
                        notificationsEnabled: false,
                    },
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            };
            req.onerror = () => reject(req.error);
        });
    }, DB_NAME);
}

interface SessionRecord {
    exerciseId: string;
    state: string;
}

async function getAllSessions(page: Page): Promise<SessionRecord[]> {
    return page.evaluate((dbName: string) => {
        return new Promise<SessionRecord[]>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1);
            req.onsuccess = () => {
                const db = req.result;
                const tx = db.transaction('sessions', 'readonly');
                const getAll = tx.objectStore('sessions').getAll();
                getAll.onsuccess = () => resolve(getAll.result as SessionRecord[]);
                getAll.onerror = () => reject(getAll.error);
            };
            req.onerror = () => reject(req.error);
        });
    }, DB_NAME);
}

test.describe('Exercise flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await clearIndexedDB(page);
        await seedOnboardingComplete(page);
    });

    test('can browse and select a beginner exercise', async ({ page }) => {
        await page.goto('/exercises');
        await expect(page.getByRole('heading', { name: 'Practice' })).toBeVisible();

        // Filter by Beginner
        await page.getByRole('button', { name: 'Beginner', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Beginner', exact: true })).toHaveAttribute(
            'aria-pressed',
            'true'
        );

        // Quick Body Scan should be visible
        await expect(page.getByRole('link', { name: /Quick Body Scan/ })).toBeVisible();
    });

    test('select and complete a beginner exercise end-to-end', async ({ page }) => {
        await page.goto('/exercises');
        await expect(page.getByRole('heading', { name: 'Practice' })).toBeVisible();

        // Navigate directly to Quick Body Scan (beginner, no lock)
        await page.goto(`/exercise/${QUICK_BODY_SCAN_ID}`);

        // Ready screen shows exercise name and start button
        await expect(page.getByRole('heading', { name: 'Quick Body Scan' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Start Exercise' })).toBeVisible();

        // Install fake clock before starting (intercepts the setInterval created by start())
        await page.clock.install();

        // Start the exercise
        await page.getByRole('button', { name: 'Start Exercise' }).click();

        // Phase 1: instruction — has a Skip button
        await expect(page.getByText('Instruction', { exact: true })).toBeVisible();
        await page.getByRole('button', { name: 'Skip' }).click();

        // Phases 2–5: notice — minimal UI (no buttons), advance through each via fake clock
        for (let i = 0; i < 4; i++) {
            await expect(page.getByText('Notice', { exact: true })).toBeVisible();
            await page.clock.tick(21_000);
        }

        // Phase 6: describe — text input + Continue button
        await expect(page.getByText('Describe', { exact: true })).toBeVisible();
        await page.getByLabel('Describe your sensation').fill('tight and warm');
        await page.getByRole('button', { name: 'Continue' }).click();

        // Phase 7: reflect — emotion chips + Continue button
        await expect(page.getByText('Reflect', { exact: true })).toBeVisible();
        await page.getByRole('button', { name: 'Continue' }).click();

        // Completion: skip post-exercise emotion tagging
        await expect(page.getByRole('heading', { name: 'How did that feel?' })).toBeVisible();
        await page.getByRole('button', { name: 'Skip' }).click();

        // Well done screen
        await expect(page.getByRole('heading', { name: 'Well done!' })).toBeVisible();
        await page.getByRole('button', { name: 'Done' }).click();

        // Redirected back to exercise list
        await expect(page).toHaveURL(/\/exercises/);

        // Session persisted in IndexedDB with completed state
        const sessions = await getAllSessions(page);
        expect(sessions.length).toBeGreaterThan(0);
        const session = sessions.find(s => s.exerciseId === QUICK_BODY_SCAN_ID);
        expect(session).toBeDefined();
        expect(session?.state).toBe('completed');
    });

    test('can pause and resume an exercise', async ({ page }) => {
        await page.goto(`/exercise/${QUICK_BODY_SCAN_ID}`);
        await expect(page.getByRole('heading', { name: 'Quick Body Scan' })).toBeVisible();

        await page.clock.install();
        await page.getByRole('button', { name: 'Start Exercise' }).click();
        await expect(page.getByText('Instruction', { exact: true })).toBeVisible();

        // Pause the exercise
        await page.getByRole('button', { name: 'Pause exercise' }).click();
        await expect(page.getByRole('heading', { name: 'Paused' })).toBeVisible();

        // Resume from paused overlay
        await page.getByRole('button', { name: 'Resume' }).click();
        await expect(page.getByText('Instruction', { exact: true })).toBeVisible();
    });

    test('can abandon an exercise and have progress saved', async ({ page }) => {
        await page.goto(`/exercise/${QUICK_BODY_SCAN_ID}`);
        await expect(page.getByRole('heading', { name: 'Quick Body Scan' })).toBeVisible();

        await page.clock.install();
        await page.getByRole('button', { name: 'Start Exercise' }).click();
        await expect(page.getByText('Instruction', { exact: true })).toBeVisible();

        // Exit via the × button
        await page.getByRole('button', { name: 'Exit exercise' }).click();
        await expect(page.getByRole('heading', { name: 'End Exercise?' })).toBeVisible();

        // Confirm exit
        await page.getByRole('button', { name: 'End and Save' }).click();

        // Progress saved screen
        await expect(page.getByRole('heading', { name: 'Progress saved' })).toBeVisible();

        // Session persisted with abandoned state
        const sessions = await getAllSessions(page);
        expect(sessions.length).toBeGreaterThan(0);
        expect(sessions[0].state).toBe('abandoned');
    });
});
