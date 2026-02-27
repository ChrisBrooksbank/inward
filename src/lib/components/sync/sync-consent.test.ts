import { describe, it, expect } from 'vitest';
import type { UserSettings } from '$lib/types/domain';
import { hasSyncConsent, acceptSyncConsent, CONSENT_DETAILS } from './sync-consent';

function makeSettings(overrides: Partial<UserSettings> = {}): UserSettings {
    return {
        reducedMotion: false,
        fontSize: 'default',
        notificationsEnabled: false,
        syncConsentGiven: false,
        ...overrides,
    };
}

describe('hasSyncConsent', () => {
    it('returns false when syncConsentGiven is false', () => {
        expect(hasSyncConsent(makeSettings({ syncConsentGiven: false }))).toBe(false);
    });

    it('returns true when syncConsentGiven is true', () => {
        expect(hasSyncConsent(makeSettings({ syncConsentGiven: true }))).toBe(true);
    });
});

describe('acceptSyncConsent', () => {
    it('sets syncConsentGiven to true', () => {
        const result = acceptSyncConsent(makeSettings({ syncConsentGiven: false }));
        expect(result.syncConsentGiven).toBe(true);
    });

    it('preserves other settings fields', () => {
        const settings = makeSettings({ reducedMotion: true, notificationsEnabled: true });
        const result = acceptSyncConsent(settings);
        expect(result.reducedMotion).toBe(true);
        expect(result.notificationsEnabled).toBe(true);
        expect(result.fontSize).toBe('default');
    });

    it('does not mutate the original settings object', () => {
        const settings = makeSettings({ syncConsentGiven: false });
        acceptSyncConsent(settings);
        expect(settings.syncConsentGiven).toBe(false);
    });
});

describe('CONSENT_DETAILS', () => {
    it('is a non-empty array of strings', () => {
        expect(Array.isArray(CONSENT_DETAILS)).toBe(true);
        expect(CONSENT_DETAILS.length).toBeGreaterThan(0);
        CONSENT_DETAILS.forEach(item => expect(typeof item).toBe('string'));
    });

    it('mentions shared vocabulary descriptions', () => {
        const combined = CONSENT_DETAILS.join(' ').toLowerCase();
        expect(combined).toContain('vocabulary');
    });

    it('mentions device ID', () => {
        const combined = CONSENT_DETAILS.join(' ').toLowerCase();
        expect(combined).toContain('device id');
    });
});
