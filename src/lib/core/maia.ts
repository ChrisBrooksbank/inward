/**
 * MAIA-2 (Multidimensional Assessment of Interoceptive Awareness, Version 2)
 * question definitions and scoring logic.
 *
 * Reference: Mehling et al. (2018), PLOS ONE 13(12): e0208034.
 * Scale: 0 = Never, 1 = Rarely, 2 = Sometimes, 3 = Often, 4 = Very Often, 5 = Always
 */

import type { MAIAScore, MAIASubscale } from '$lib/types/domain';

interface MAIAQuestion {
    readonly id: number; // 1–37
    readonly text: string;
    readonly subscale: MAIASubscale;
    readonly reversed: boolean;
}

// ---------------------------------------------------------------------------
// Question definitions grouped by subscale
// ---------------------------------------------------------------------------

const NOTICING: MAIAQuestion[] = [
    {
        id: 1,
        text: 'I notice when I am uncomfortable in my body.',
        subscale: 'noticing',
        reversed: false,
    },
    {
        id: 2,
        text: 'I notice where in my body I am uncomfortable.',
        subscale: 'noticing',
        reversed: false,
    },
    {
        id: 3,
        text: 'I notice when I am comfortable in my body.',
        subscale: 'noticing',
        reversed: false,
    },
    {
        id: 4,
        text: 'When I am tense, I notice where the tension is located in my body.',
        subscale: 'noticing',
        reversed: false,
    },
];

// All 6 Not-Distracting items are reverse-scored (high score = does NOT distract)
const NOT_DISTRACTING: MAIAQuestion[] = [
    {
        id: 5,
        text: 'When I feel pain or discomfort, I try to power through it.',
        subscale: 'not-distracting',
        reversed: true,
    },
    {
        id: 6,
        text: 'I push feelings of discomfort away by focusing on something.',
        subscale: 'not-distracting',
        reversed: true,
    },
    {
        id: 7,
        text: 'When I feel unpleasant body sensations, I occupy myself with something else to avoid feeling them.',
        subscale: 'not-distracting',
        reversed: true,
    },
    {
        id: 8,
        text: 'When I feel physical pain, I try to push it out of my mind.',
        subscale: 'not-distracting',
        reversed: true,
    },
    { id: 9, text: 'I try to ignore pain.', subscale: 'not-distracting', reversed: true },
    {
        id: 10,
        text: 'I push discomfort out of my mind.',
        subscale: 'not-distracting',
        reversed: true,
    },
];

// Items 11, 12, 14, 15 are reversed; item 13 is forward
const NOT_WORRYING: MAIAQuestion[] = [
    {
        id: 11,
        text: 'When I feel physical pain, I become upset.',
        subscale: 'not-worrying',
        reversed: true,
    },
    {
        id: 12,
        text: 'I start to worry that something is wrong if I feel any discomfort in my body.',
        subscale: 'not-worrying',
        reversed: true,
    },
    {
        id: 13,
        text: 'I can notice an unpleasant body sensation without worrying about it.',
        subscale: 'not-worrying',
        reversed: false,
    },
    {
        id: 14,
        text: "When I am in discomfort or pain, I can't stop focusing on it.",
        subscale: 'not-worrying',
        reversed: true,
    },
    {
        id: 15,
        text: 'When I feel unpleasant body sensations, I have trouble thinking of anything else.',
        subscale: 'not-worrying',
        reversed: true,
    },
];

const ATTENTION_REGULATION: MAIAQuestion[] = [
    {
        id: 16,
        text: 'I can pay attention to my breathing without being distracted by things happening around me.',
        subscale: 'attention-regulation',
        reversed: false,
    },
    {
        id: 17,
        text: 'I can maintain awareness of my inner bodily sensations even when there is a lot going on around me.',
        subscale: 'attention-regulation',
        reversed: false,
    },
    {
        id: 18,
        text: 'When I am in conversation, I can pay attention to my body at the same time.',
        subscale: 'attention-regulation',
        reversed: false,
    },
    {
        id: 19,
        text: 'I can decide for myself how long to attend to a body sensation.',
        subscale: 'attention-regulation',
        reversed: false,
    },
    {
        id: 20,
        text: 'I can return my attention to my body if I am distracted.',
        subscale: 'attention-regulation',
        reversed: false,
    },
    {
        id: 21,
        text: 'I can maintain awareness of the whole of my body even if part of it is in pain or discomfort.',
        subscale: 'attention-regulation',
        reversed: false,
    },
    {
        id: 22,
        text: 'I am able to refocus my attention from an unpleasant body sensation to my breath.',
        subscale: 'attention-regulation',
        reversed: false,
    },
];

const EMOTIONAL_AWARENESS: MAIAQuestion[] = [
    {
        id: 23,
        text: 'I notice how my body changes when I am angry.',
        subscale: 'emotional-awareness',
        reversed: false,
    },
    {
        id: 24,
        text: 'When something is wrong in my life, I can feel it in my body.',
        subscale: 'emotional-awareness',
        reversed: false,
    },
    {
        id: 25,
        text: 'I notice that my body feels different after a peaceful experience.',
        subscale: 'emotional-awareness',
        reversed: false,
    },
    {
        id: 26,
        text: 'I notice how my body changes when I feel happy.',
        subscale: 'emotional-awareness',
        reversed: false,
    },
    {
        id: 27,
        text: 'I notice changes in my breathing, such as whether it slows down or speeds up.',
        subscale: 'emotional-awareness',
        reversed: false,
    },
];

const SELF_REGULATION: MAIAQuestion[] = [
    {
        id: 28,
        text: "When I am upset, I can find a calm place inside by focusing on my body's rhythms.",
        subscale: 'self-regulation',
        reversed: false,
    },
    {
        id: 29,
        text: 'When I feel overwhelmed, I can find relief by paying attention to body sensations.',
        subscale: 'self-regulation',
        reversed: false,
    },
    {
        id: 30,
        text: "When I am in discomfort or pain, I can let go of the sensations' hold on me.",
        subscale: 'self-regulation',
        reversed: false,
    },
    {
        id: 31,
        text: 'When I feel body sensations, I am able to tell when I need to calm down.',
        subscale: 'self-regulation',
        reversed: false,
    },
];

const BODY_LISTENING: MAIAQuestion[] = [
    {
        id: 32,
        text: 'I listen to my body to inform me about what to do.',
        subscale: 'body-listening',
        reversed: false,
    },
    {
        id: 33,
        text: 'I notice that my body senses the same impression that my brain does.',
        subscale: 'body-listening',
        reversed: false,
    },
    {
        id: 34,
        text: 'Noticing my body helps me to know how I really feel.',
        subscale: 'body-listening',
        reversed: false,
    },
];

const TRUSTING: MAIAQuestion[] = [
    { id: 35, text: 'I feel my body is a safe place.', subscale: 'trusting', reversed: false },
    { id: 36, text: 'I feel at home in my body.', subscale: 'trusting', reversed: false },
    { id: 37, text: 'I trust my body sensations.', subscale: 'trusting', reversed: false },
];

/** All 37 MAIA-2 questions in order. */
export const MAIA_QUESTIONS: readonly MAIAQuestion[] = [
    ...NOTICING,
    ...NOT_DISTRACTING,
    ...NOT_WORRYING,
    ...ATTENTION_REGULATION,
    ...EMOTIONAL_AWARENESS,
    ...SELF_REGULATION,
    ...BODY_LISTENING,
    ...TRUSTING,
];

/** Expected number of items per subscale. */
export const SUBSCALE_ITEM_COUNTS: Record<MAIASubscale, number> = {
    noticing: 4,
    'not-distracting': 6,
    'not-worrying': 5,
    'attention-regulation': 7,
    'emotional-awareness': 5,
    'self-regulation': 4,
    'body-listening': 3,
    trusting: 3,
};

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

/** Apply reverse scoring: reversed items score 5 − raw response. */
function scoreItem(response: number, reversed: boolean): number {
    return reversed ? 5 - response : response;
}

/** Compute the mean subscale score from the 37 raw responses. */
function calcSubscaleScore(
    responses: readonly number[],
    subscale: MAIASubscale,
    measuredAt: Date
): MAIAScore {
    const items = MAIA_QUESTIONS.filter(q => q.subscale === subscale);
    const total = items.reduce((sum, q) => sum + scoreItem(responses[q.id - 1], q.reversed), 0);
    const score = Math.round((total / items.length) * 100) / 100;
    return { subscale, score, measuredAt };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const SUBSCALE_ORDER: MAIASubscale[] = [
    'noticing',
    'not-distracting',
    'not-worrying',
    'attention-regulation',
    'emotional-awareness',
    'self-regulation',
    'body-listening',
    'trusting',
];

/**
 * Score a complete MAIA-2 assessment.
 *
 * @param responses  37 raw item responses, each 0 (Never) – 5 (Always).
 * @param measuredAt Timestamp to attach to each returned score.
 * @returns          Array of 8 subscale scores.
 */
export function scoreMaiaAssessment(responses: readonly number[], measuredAt: Date): MAIAScore[] {
    if (responses.length !== 37) {
        throw new Error(`MAIA-2 requires 37 responses, received ${responses.length}`);
    }
    return SUBSCALE_ORDER.map(subscale => calcSubscaleScore(responses, subscale, measuredAt));
}
