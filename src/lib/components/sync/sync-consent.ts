/**
 * Logic for sync privacy consent dialog.
 *
 * The consent is a one-time opt-in that must be shown before any data is
 * sent to the relay server. Once accepted, `syncConsentGiven` is stored in
 * UserSettings (IndexedDB settings store).
 */

import type { UserSettings } from '$lib/types/domain';

/**
 * Human-readable list of exactly what leaves the device when sync is enabled.
 * Shown to the user inside the consent dialog.
 */
export const CONSENT_DETAILS: string[] = [
    'Vocabulary descriptions you mark as "shared" or "attributed"',
    '"Yes, I feel this too" confirmations you give to others\' descriptions',
    'An anonymous device ID (randomly generated, never linked to your identity)',
];

/**
 * Returns true if the user has already given sync consent.
 */
export function hasSyncConsent(settings: UserSettings): boolean {
    return settings.syncConsentGiven;
}

/**
 * Returns a new settings object with sync consent accepted.
 */
export function acceptSyncConsent(settings: UserSettings): UserSettings {
    return { ...settings, syncConsentGiven: true };
}
