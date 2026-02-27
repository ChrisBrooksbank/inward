/**
 * Data export and delete logic for GDPR-compliant data portability.
 */

import { getAllSessions, getAllDescriptions, getAllAssessments, getSettings, getDb } from '$lib/db';
import { SEED_EXERCISES } from '$lib/core/exercises';
import type {
    ExerciseSession,
    SensationDescription,
    MAIAAssessment,
    UserProfile,
} from '$lib/types/domain';

// =============================================================================
// Export shape types
// =============================================================================

export interface ExportSession {
    id: string;
    exerciseId: string;
    exerciseName: string;
    startedAt: string;
    completedAt?: string;
    completed: boolean;
    descriptions: { phaseId: string; bodyRegion: string; text: string }[];
    emotions: { phaseId: string; emotion: string }[];
}

export interface ExportVocabEntry {
    id: string;
    text: string;
    category: string;
    bodyRegion: string;
    emotionConnection?: string;
    createdAt: string;
    shared: boolean;
}

export interface ExportAssessment {
    id: string;
    completedAt: string;
    answers: { questionId: number; value: number }[];
    scores: { subscale: string; score: number }[];
}

export interface ExportProfile {
    createdAt: string;
    onboardingCompletedAt?: string;
}

export interface ExportData {
    exportedAt: string;
    appVersion: string;
    profile: ExportProfile;
    sessions: ExportSession[];
    vocabulary: ExportVocabEntry[];
    assessments: ExportAssessment[];
}

// =============================================================================
// Mapping functions (exported for testing)
// =============================================================================

export function mapSession(session: ExerciseSession): ExportSession {
    const exercise = SEED_EXERCISES.find(e => e.id === session.exerciseId);
    return {
        id: session.id,
        exerciseId: session.exerciseId,
        exerciseName: exercise?.name ?? session.exerciseId,
        startedAt: session.startedAt.toISOString(),
        completedAt: session.completedAt?.toISOString(),
        completed: session.state === 'completed',
        descriptions: session.descriptions.map(d => ({
            phaseId: d.phaseId,
            bodyRegion: d.bodyRegion,
            text: d.text,
        })),
        emotions: session.emotionConnections.map(e => ({
            phaseId: e.phaseId,
            emotion: e.emotion,
        })),
    };
}

export function mapVocab(desc: SensationDescription): ExportVocabEntry {
    return {
        id: desc.id,
        text: desc.text,
        category: desc.category,
        bodyRegion: desc.bodyRegion,
        emotionConnection: desc.emotionConnection,
        createdAt: desc.createdAt.toISOString(),
        shared: desc.sharingLevel !== 'private',
    };
}

export function mapAssessment(a: MAIAAssessment): ExportAssessment {
    return {
        id: a.id,
        completedAt: a.completedAt.toISOString(),
        answers: a.responses.map((value, index) => ({
            questionId: index + 1,
            value,
        })),
        scores: a.scores.map(s => ({
            subscale: s.subscale,
            score: s.score,
        })),
    };
}

export function mapProfile(profile: UserProfile | undefined): ExportProfile {
    if (!profile) {
        return { createdAt: new Date().toISOString() };
    }
    return {
        createdAt: profile.createdAt.toISOString(),
        onboardingCompletedAt: profile.onboardingComplete
            ? profile.updatedAt.toISOString()
            : undefined,
    };
}

// =============================================================================
// Public API
// =============================================================================

export async function buildExportData(): Promise<ExportData> {
    const [sessions, descriptions, assessments, profile] = await Promise.all([
        getAllSessions(),
        getAllDescriptions(),
        getAllAssessments(),
        getSettings(),
    ]);
    return {
        exportedAt: new Date().toISOString(),
        appVersion: '1.0.0',
        profile: mapProfile(profile),
        sessions: sessions.map(mapSession),
        vocabulary: descriptions.map(mapVocab),
        assessments: assessments.map(mapAssessment),
    };
}

export function triggerDownload(data: ExportData): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inward-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export async function deleteAllData(): Promise<void> {
    const db = await getDb();
    await Promise.all([
        db.clear('sessions'),
        db.clear('descriptions'),
        db.clear('sharedDescriptions'),
        db.clear('confirmations'),
        db.clear('assessments'),
        db.clear('settings'),
        db.clear('offlineQueue'),
    ]);
}
