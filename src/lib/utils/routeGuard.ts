/**
 * Route guard utilities for enforcing onboarding completion.
 */

import { getSettings } from '$lib/db';

/**
 * Returns the path to redirect to, or null if no redirect is needed.
 * App routes use this to redirect new users to onboarding.
 */
export async function getOnboardingRedirect(): Promise<string | null> {
    const profile = await getSettings();
    if (!profile?.onboardingComplete) {
        return '/onboarding';
    }
    return null;
}
