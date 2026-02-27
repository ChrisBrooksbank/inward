import { test, expect, type Page } from '@playwright/test';

const DB_NAME = 'inward-db';

async function clearIndexedDB(page: Page): Promise<void> {
    await page.evaluate((dbName: string) => {
        return new Promise<void>((resolve, reject) => {
            const req = indexedDB.deleteDatabase(dbName);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }, DB_NAME);
}

interface OnboardingRecord {
    onboardingComplete: boolean;
    onboardingStep: number;
}

async function getSettingsFromDB(page: Page): Promise<OnboardingRecord | null> {
    return page.evaluate((dbName: string) => {
        return new Promise<OnboardingRecord | null>((resolve, reject) => {
            const req = indexedDB.open(dbName, 1);
            req.onsuccess = () => {
                const db = req.result;
                const tx = db.transaction('settings', 'readonly');
                const store = tx.objectStore('settings');
                const getAll = store.getAll();
                getAll.onsuccess = () => {
                    const records = getAll.result as OnboardingRecord[];
                    resolve(records.length > 0 ? records[0] : null);
                };
                getAll.onerror = () => reject(getAll.error);
            };
            req.onerror = () => reject(req.error);
        });
    }, DB_NAME);
}

test.describe('Onboarding flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await clearIndexedDB(page);
    });

    test('completes full flow skipping MAIA and sets onboardingComplete flag', async ({ page }) => {
        await page.goto('/onboarding');

        // Step 1: Welcome
        await expect(page.getByRole('heading', { name: 'Inward' })).toBeVisible();
        await page.getByRole('button', { name: 'Get Started' }).click();

        // Step 2: What is Interoception?
        await expect(page.getByRole('heading', { name: 'What is Interoception?' })).toBeVisible();
        await page.getByRole('button', { name: 'Continue' }).click();

        // Step 3: Privacy & Data
        await expect(page.getByRole('heading', { name: 'Your Data, Your Control' })).toBeVisible();
        await page.getByRole('button', { name: 'Continue' }).click();

        // Step 4: MAIA-2 — skip assessment
        await expect(
            page.getByRole('heading', { name: 'Optional Baseline Assessment' })
        ).toBeVisible();
        await page.getByRole('button', { name: 'Skip this assessment' }).click();

        // Step 5: First Exercise
        await expect(page.getByRole('heading', { name: 'Try Your First Exercise' })).toBeVisible();
        await page.getByRole('button', { name: 'Start Exercise' }).click();

        // Step 6: Complete
        await expect(page.getByRole('heading', { name: "You're All Set!" })).toBeVisible();
        await page.getByRole('button', { name: 'Go to Dashboard' }).click();

        // Redirected to dashboard
        await expect(page).toHaveURL(/\/dashboard/);

        // onboardingComplete flag persisted in IndexedDB
        const settings = await getSettingsFromDB(page);
        expect(settings?.onboardingComplete).toBe(true);
    });

    test('can skip entire onboarding from the welcome screen', async ({ page }) => {
        await page.goto('/onboarding');
        await expect(page.getByRole('heading', { name: 'Inward' })).toBeVisible();
        await page.getByRole('button', { name: /Skip Introduction/ }).click();

        await expect(page).toHaveURL(/\/dashboard/);

        const settings = await getSettingsFromDB(page);
        expect(settings?.onboardingComplete).toBe(true);
    });

    test('route guard redirects unauthenticated users to onboarding', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/onboarding/);
    });

    test('resumes from saved step after page refresh', async ({ page }) => {
        await page.goto('/onboarding');

        // Advance to step 2: Interoception
        await page.getByRole('button', { name: 'Get Started' }).click();
        await expect(page.getByRole('heading', { name: 'What is Interoception?' })).toBeVisible();

        // Reload page — should resume at step 2
        await page.reload();
        await expect(page.getByRole('heading', { name: 'What is Interoception?' })).toBeVisible();
    });

    test('step progress indicator shows current step number', async ({ page }) => {
        await page.goto('/onboarding');

        // Welcome is step 1 of 6
        await expect(page.getByText('Step 1 of 6')).toBeVisible();

        // Navigate to interoception step (step 2 of 6)
        await page.getByRole('button', { name: 'Get Started' }).click();
        await expect(page.getByRole('heading', { name: 'What is Interoception?' })).toBeVisible();
        await expect(page.getByText('Step 2 of 6')).toBeVisible();
    });
});
