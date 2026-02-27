import { describe, it, expect } from 'vitest';
import { MAIA_QUESTIONS, SUBSCALE_ITEM_COUNTS } from '$lib/core/maia';
import type { MAIASubscale } from '$lib/types/domain';

// Mirror the data exported/used by MAIAStep.svelte so tests stay in sync
const SUBSCALE_LABELS: Record<MAIASubscale, string> = {
    noticing: 'Noticing',
    'not-distracting': 'Not Distracting',
    'not-worrying': 'Not Worrying',
    'attention-regulation': 'Attention Regulation',
    'emotional-awareness': 'Emotional Awareness',
    'self-regulation': 'Self-Regulation',
    'body-listening': 'Body Listening',
    trusting: 'Trusting',
};

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

const LIKERT_LABELS = ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often', 'Always'];

const questionGroups = SUBSCALE_ORDER.map(subscale => ({
    subscale,
    label: SUBSCALE_LABELS[subscale],
    questions: MAIA_QUESTIONS.filter(q => q.subscale === subscale),
}));

describe('MAIA question data', () => {
    it('has exactly 37 questions', () => {
        expect(MAIA_QUESTIONS).toHaveLength(37);
    });

    it('questions are numbered 1 through 37', () => {
        for (let i = 0; i < 37; i++) {
            expect(MAIA_QUESTIONS[i].id).toBe(i + 1);
        }
    });

    it('each question has a non-empty text', () => {
        for (const q of MAIA_QUESTIONS) {
            expect(q.text.length).toBeGreaterThan(0);
        }
    });
});

describe('SUBSCALE_LABELS', () => {
    it('covers all 8 subscales', () => {
        expect(Object.keys(SUBSCALE_LABELS)).toHaveLength(8);
    });

    it('each label is a non-empty string', () => {
        for (const label of Object.values(SUBSCALE_LABELS)) {
            expect(typeof label).toBe('string');
            expect(label.length).toBeGreaterThan(0);
        }
    });

    it('maps noticing correctly', () => {
        expect(SUBSCALE_LABELS['noticing']).toBe('Noticing');
    });

    it('maps attention-regulation correctly', () => {
        expect(SUBSCALE_LABELS['attention-regulation']).toBe('Attention Regulation');
    });
});

describe('SUBSCALE_ORDER', () => {
    it('has 8 entries', () => {
        expect(SUBSCALE_ORDER).toHaveLength(8);
    });

    it('starts with noticing', () => {
        expect(SUBSCALE_ORDER[0]).toBe('noticing');
    });

    it('ends with trusting', () => {
        expect(SUBSCALE_ORDER[SUBSCALE_ORDER.length - 1]).toBe('trusting');
    });
});

describe('LIKERT_LABELS', () => {
    it('has 6 labels', () => {
        expect(LIKERT_LABELS).toHaveLength(6);
    });

    it('starts with Never', () => {
        expect(LIKERT_LABELS[0]).toBe('Never');
    });

    it('ends with Always', () => {
        expect(LIKERT_LABELS[5]).toBe('Always');
    });
});

describe('questionGroups', () => {
    it('produces 8 groups', () => {
        expect(questionGroups).toHaveLength(8);
    });

    it('total questions across all groups is 37', () => {
        const total = questionGroups.reduce((sum, g) => sum + g.questions.length, 0);
        expect(total).toBe(37);
    });

    it('each group count matches SUBSCALE_ITEM_COUNTS', () => {
        for (const group of questionGroups) {
            expect(group.questions).toHaveLength(SUBSCALE_ITEM_COUNTS[group.subscale]);
        }
    });

    it('noticing group has 4 questions', () => {
        const noticing = questionGroups.find(g => g.subscale === 'noticing');
        expect(noticing?.questions).toHaveLength(4);
    });

    it('not-distracting group has 6 questions', () => {
        const group = questionGroups.find(g => g.subscale === 'not-distracting');
        expect(group?.questions).toHaveLength(6);
    });

    it('attention-regulation group has 7 questions', () => {
        const group = questionGroups.find(g => g.subscale === 'attention-regulation');
        expect(group?.questions).toHaveLength(7);
    });

    it('each group has a label matching SUBSCALE_LABELS', () => {
        for (const group of questionGroups) {
            expect(group.label).toBe(SUBSCALE_LABELS[group.subscale]);
        }
    });

    it('all questions in each group belong to that subscale', () => {
        for (const group of questionGroups) {
            for (const q of group.questions) {
                expect(q.subscale).toBe(group.subscale);
            }
        }
    });
});

describe('response tracking logic', () => {
    it('initial responses array of -1 values has 0 answered', () => {
        const responses = Array(37).fill(-1);
        const answered = responses.filter(r => r >= 0).length;
        expect(answered).toBe(0);
    });

    it('all responses set to 0 reports 37 answered', () => {
        const responses = Array(37).fill(0);
        const answered = responses.filter(r => r >= 0).length;
        expect(answered).toBe(37);
    });

    it('setting a single response changes answered count', () => {
        const responses = Array(37).fill(-1);
        responses[0] = 3;
        const answered = responses.filter(r => r >= 0).length;
        expect(answered).toBe(1);
    });

    it('isComplete is true when all 37 are answered', () => {
        const responses = Array(37).fill(2);
        expect(responses.filter(r => r >= 0).length === 37).toBe(true);
    });
});
