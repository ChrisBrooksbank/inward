# Accessibility Specification

Technical specification for accessibility in the Inward interoception training app, with emphasis on the needs of the target user population.

---

## Table of Contents

1. [Overview](#overview)
2. [Target User Needs Analysis](#target-user-needs-analysis)
3. [WCAG 2.2 Compliance Matrix](#wcag-22-compliance-matrix)
4. [Cognitive Accessibility (COGA)](#cognitive-accessibility-coga)
5. [Sensory Accommodations](#sensory-accommodations)
6. [Motor Accessibility](#motor-accessibility)
7. [Content Guidelines](#content-guidelines)
8. [Component Accessibility Requirements](#component-accessibility-requirements)
9. [Testing Protocol](#testing-protocol)
10. [Implementation Checklist](#implementation-checklist)

---

## Overview

### Goals

Accessibility in Inward serves three core objectives:

1. **Inclusion** - Ensure the app is usable by people with the conditions it aims to help
2. **Autonomy** - Allow users to control their experience without barriers
3. **Safety** - Prevent accessibility failures from causing distress to sensitive users

### Design Philosophy

> "The people most likely to benefit from interoception training are often those who face the greatest barriers to using digital tools."

Inward's target users include people with autism, ADHD, anxiety disorders, trauma, and alexithymia. These conditions frequently co-occur with:

- Sensory processing differences
- Executive function challenges
- Attention regulation difficulties
- Heightened sensitivity to unexpected stimuli

**The app must be accessible not just by WCAG standards, but by the specific needs of its users.**

### Compliance Targets

| Standard             | Level | Rationale                                  |
| -------------------- | ----- | ------------------------------------------ |
| WCAG 2.2             | AA    | Baseline web accessibility                 |
| WCAG 2.2 (cognitive) | AAA   | Critical for target population             |
| COGA guidelines      | Full  | Cognitive accessibility is primary concern |
| ARIA 1.2             | Full  | Screen reader support                      |

---

## Target User Needs Analysis

### Autism Spectrum

**Common challenges:**

- Sensory sensitivities (visual, auditory, tactile)
- Need for predictability and routine
- Literal interpretation of language
- Difficulty with implicit instructions
- Overwhelm from too many options

**Accessibility requirements:**

| Need                     | Implementation                                 |
| ------------------------ | ---------------------------------------------- |
| Reduced sensory input    | Option to disable animations, simplify visuals |
| Predictable interactions | Consistent layouts, clear state changes        |
| Explicit instructions    | No ambiguity, step-by-step guidance            |
| Processing time          | No time pressure, user controls pace           |
| Customization            | Multiple ways to accomplish tasks              |

### ADHD

**Common challenges:**

- Difficulty sustaining attention
- Working memory limitations
- Time blindness
- Hyperfocus/distraction cycles
- Executive function deficits

**Accessibility requirements:**

| Need                | Implementation                               |
| ------------------- | -------------------------------------------- |
| Maintained focus    | Minimal distractions, clear visual hierarchy |
| Progress visibility | Always show where user is in process         |
| Chunked information | Break into small, manageable pieces          |
| Easy resumption     | Save state, easy to return                   |
| Time awareness      | Clear timers, gentle notifications           |

### Anxiety Disorders

**Common challenges:**

- Hypervigilance to changes
- Catastrophic interpretation of errors
- Avoidance of uncertain situations
- Physical symptoms from stress
- Need for control

**Accessibility requirements:**

| Need            | Implementation                                 |
| --------------- | ---------------------------------------------- |
| Predictability  | Warn before changes, explain what happens next |
| Reassurance     | Non-alarming error messages, easy recovery     |
| Control         | Always able to pause, exit, or undo            |
| Calm aesthetics | Soothing colors, gentle transitions            |
| Privacy         | Clear data handling, user controls sharing     |

### Alexithymia

**Common challenges:**

- Difficulty identifying emotions
- Limited emotional vocabulary
- Confusion about body-emotion connection
- Frustration with emotion-focused content

**Accessibility requirements:**

| Need                     | Implementation                         |
| ------------------------ | -------------------------------------- |
| No forced emotion labels | "No connection" always valid response  |
| Physical over emotional  | Describe body first, emotions optional |
| Vocabulary support       | Suggestions without prescription       |
| Patience                 | No judgment for blank responses        |

### Trauma/PTSD

**Common challenges:**

- Body perceived as unsafe
- Triggered by unexpected stimuli
- Dissociation from body awareness
- Need for safety and control
- Hyperarousal or hypoarousal

**Accessibility requirements:**

| Need                     | Implementation                           |
| ------------------------ | ---------------------------------------- |
| Trauma-informed language | "Notice" not "feel", agency-focused      |
| Opt-in body attention    | Never force body focus                   |
| Grounding support        | Exit to present moment, external anchors |
| Slow pace                | User controls all timing                 |
| Safe exit                | Immediate exit available, progress saved |

---

## WCAG 2.2 Compliance Matrix

### Perceivable (Principle 1)

#### 1.1 Text Alternatives

| Criterion              | Level | Requirement              | Implementation                                        |
| ---------------------- | ----- | ------------------------ | ----------------------------------------------------- |
| 1.1.1 Non-text Content | A     | All images have alt text | `alt` attribute on all `<img>`, `aria-label` on icons |

**Specific requirements:**

- Body diagram regions have descriptive labels: "Heart region highlighted"
- Decorative images use `alt=""`
- Complex visualizations have text summaries

#### 1.2 Time-based Media

| Criterion               | Level | Requirement            | Implementation                             |
| ----------------------- | ----- | ---------------------- | ------------------------------------------ |
| 1.2.1 Audio-only        | A     | Transcripts for audio  | All audio instructions also shown as text  |
| 1.2.5 Audio Description | AA    | Descriptions for video | Movement animations have text descriptions |

#### 1.3 Adaptable

| Criterion                     | Level | Requirement                | Implementation                              |
| ----------------------------- | ----- | -------------------------- | ------------------------------------------- |
| 1.3.1 Info and Relationships  | A     | Semantic structure         | Proper heading hierarchy, form labels       |
| 1.3.2 Meaningful Sequence     | A     | Logical reading order      | DOM order matches visual order              |
| 1.3.3 Sensory Characteristics | A     | Not rely solely on sensory | Don't use only color to convey meaning      |
| 1.3.4 Orientation             | AA    | Support both orientations  | Works in portrait and landscape             |
| 1.3.5 Identify Input Purpose  | AA    | Input purpose identifiable | `autocomplete` attributes where appropriate |

#### 1.4 Distinguishable

| Criterion                     | Level | Requirement                   | Implementation                             |
| ----------------------------- | ----- | ----------------------------- | ------------------------------------------ |
| 1.4.1 Use of Color            | A     | Not rely solely on color      | Icons/text accompany color indicators      |
| 1.4.3 Contrast (Minimum)      | AA    | 4.5:1 for text                | All text meets contrast requirements       |
| 1.4.4 Resize Text             | AA    | 200% zoom without loss        | Responsive layouts, no fixed heights       |
| 1.4.5 Images of Text          | AA    | Use real text                 | No text in images except logos             |
| 1.4.10 Reflow                 | AA    | No horizontal scroll at 320px | Single column at narrow widths             |
| 1.4.11 Non-text Contrast      | AA    | 3:1 for UI components         | Buttons, inputs, focus indicators          |
| 1.4.12 Text Spacing           | AA    | Support user text spacing     | No content loss with increased spacing     |
| 1.4.13 Content on Hover/Focus | AA    | Dismissible, hoverable        | Tooltips can be dismissed, don't disappear |

### Operable (Principle 2)

#### 2.1 Keyboard Accessible

| Criterion                     | Level | Requirement                    | Implementation                       |
| ----------------------------- | ----- | ------------------------------ | ------------------------------------ |
| 2.1.1 Keyboard                | A     | All functionality via keyboard | Tab through all interactive elements |
| 2.1.2 No Keyboard Trap        | A     | Focus can leave components     | No modal traps, Esc closes overlays  |
| 2.1.4 Character Key Shortcuts | A     | Shortcuts can be turned off    | No single-character shortcuts        |

#### 2.2 Enough Time

| Criterion               | Level | Requirement                 | Implementation               |
| ----------------------- | ----- | --------------------------- | ---------------------------- |
| 2.2.1 Timing Adjustable | A     | Time limits can be extended | Pause available in exercises |
| 2.2.2 Pause, Stop, Hide | A     | Moving content controllable | All animations can be paused |

**Critical for Inward:**

- Exercise timers can always be paused
- No auto-advancing content without user control
- Assessment can be saved and resumed

#### 2.3 Seizures and Physical Reactions

| Criterion                         | Level | Requirement                | Implementation                   |
| --------------------------------- | ----- | -------------------------- | -------------------------------- |
| 2.3.1 Three Flashes               | A     | No content flashes >3x/sec | No flashing content              |
| 2.3.3 Animation from Interactions | AAA   | Disable motion             | Respect `prefers-reduced-motion` |

#### 2.4 Navigable

| Criterion                       | Level | Requirement             | Implementation                   |
| ------------------------------- | ----- | ----------------------- | -------------------------------- |
| 2.4.1 Bypass Blocks             | A     | Skip navigation         | Skip to main content link        |
| 2.4.2 Page Titled               | A     | Descriptive titles      | Unique `<title>` per page        |
| 2.4.3 Focus Order               | A     | Logical focus sequence  | Tab order matches visual order   |
| 2.4.4 Link Purpose (In Context) | A     | Clear link text         | No "click here" links            |
| 2.4.6 Headings and Labels       | AA    | Descriptive headings    | Clear, hierarchical headings     |
| 2.4.7 Focus Visible             | AA    | Visible focus indicator | Clear focus ring on all elements |
| 2.4.11 Focus Not Obscured       | AA    | Focus not hidden        | No sticky headers covering focus |

#### 2.5 Input Modalities

| Criterion                    | Level | Requirement                   | Implementation                             |
| ---------------------------- | ----- | ----------------------------- | ------------------------------------------ |
| 2.5.1 Pointer Gestures       | A     | Single pointer alternative    | No multi-touch required                    |
| 2.5.2 Pointer Cancellation   | A     | Actions on up event           | Use `click`/`pointerup`, not `pointerdown` |
| 2.5.3 Label in Name          | A     | Label matches accessible name | Button text matches aria-label             |
| 2.5.4 Motion Actuation       | A     | Motion not required           | No shake-to-undo or tilt controls          |
| 2.5.5 Target Size (Enhanced) | AAA   | 44x44px minimum               | All touch targets at least 44px            |
| 2.5.8 Target Size (Minimum)  | AA    | 24x24px minimum               | Meets minimum with adequate spacing        |

### Understandable (Principle 3)

#### 3.1 Readable

| Criterion               | Level | Requirement           | Implementation                |
| ----------------------- | ----- | --------------------- | ----------------------------- |
| 3.1.1 Language of Page  | A     | `lang` attribute      | `<html lang="en">`            |
| 3.1.2 Language of Parts | AA    | Mark language changes | `lang` on non-English content |

#### 3.2 Predictable

| Criterion                       | Level | Requirement                 | Implementation                     |
| ------------------------------- | ----- | --------------------------- | ---------------------------------- |
| 3.2.1 On Focus                  | A     | No context change on focus  | Focus doesn't trigger navigation   |
| 3.2.2 On Input                  | A     | No unexpected changes       | Form input doesn't auto-submit     |
| 3.2.3 Consistent Navigation     | AA    | Consistent nav placement    | Bottom nav always in same position |
| 3.2.4 Consistent Identification | AA    | Consistent component naming | Same icons/labels across app       |

#### 3.3 Input Assistance

| Criterion                      | Level | Requirement               | Implementation                        |
| ------------------------------ | ----- | ------------------------- | ------------------------------------- |
| 3.3.1 Error Identification     | A     | Errors clearly identified | Error messages describe issue         |
| 3.3.2 Labels or Instructions   | A     | Labels for inputs         | All form fields have visible labels   |
| 3.3.3 Error Suggestion         | AA    | Suggest corrections       | Provide fix suggestions when possible |
| 3.3.4 Error Prevention (Legal) | AA    | Confirm important actions | Confirm before data deletion          |
| 3.3.7 Redundant Entry          | A     | Don't require re-entry    | Remember user's information           |

### Robust (Principle 4)

#### 4.1 Compatible

| Criterion               | Level | Requirement              | Implementation                  |
| ----------------------- | ----- | ------------------------ | ------------------------------- |
| 4.1.2 Name, Role, Value | A     | Accessible name and role | ARIA attributes where needed    |
| 4.1.3 Status Messages   | AA    | Announce status changes  | `aria-live` for dynamic content |

---

## Cognitive Accessibility (COGA)

Based on W3C Cognitive Accessibility Guidelines.

### Design Patterns

#### 1. Clear Purpose

Every screen should answer:

- Where am I?
- What can I do here?
- How do I proceed?

```svelte
<!-- Example: Exercise library header -->
<header>
    <h1>Practice</h1>
    <p class="subtitle">Choose an exercise to begin.</p>
</header>
```

#### 2. Familiar Patterns

Use standard UI patterns:

- Bottom navigation for primary destinations
- Pull-to-refresh for content updates
- Swipe for pagination
- Back arrow to return

#### 3. Consistent Layout

Maintain consistent placement:

- Navigation always at bottom
- Page title always at top
- Primary action always prominent
- Back/close always in same position

#### 4. Error Prevention and Recovery

```svelte
<!-- Good: Clear, reassuring error -->
<div class="error-message" role="alert">
    <p><strong>Couldn't save your response.</strong></p>
    <p>Your text is still here. Try saving again, or continue without saving.</p>
    <button>Try Again</button>
    <button>Continue Anyway</button>
</div>
```

```svelte
<!-- Bad: Alarming, vague error --><div class="error">Error: Save failed</div>
```

#### 5. Simple and Clear Language

| Instead of                | Use                                            |
| ------------------------- | ---------------------------------------------- |
| "Authenticate"            | "Sign in"                                      |
| "Insufficient privileges" | "You need permission to do this"               |
| "Session timeout"         | "You've been signed out because you were away" |
| "Invalid input"           | "Please enter a valid email address"           |

#### 6. Chunked Information

Break content into small, digestible pieces:

```svelte
<!-- Onboarding: One concept per screen -->
<Screen step={1}>
    <h2>What is Interoception?</h2>
    <p>Your sense of what's happening inside your body.</p>
    <!-- No other concepts on this screen -->
</Screen>
```

#### 7. Support for Memory

- Show progress indicators
- Provide summaries of what was done
- Allow saving and resuming
- Don't require remembering information across screens

### COGA Objectives Matrix

| Objective                                                 | Implementation                                    |
| --------------------------------------------------------- | ------------------------------------------------- |
| Help users understand what things are and how to use them | Clear labels, familiar icons, consistent patterns |
| Help users find what they need                            | Simple navigation, search, clear hierarchy        |
| Use clear content                                         | Plain language, short sentences, defined terms    |
| Help users avoid mistakes                                 | Validation, confirmation, undo support            |
| Help users focus                                          | Minimal distractions, clear visual hierarchy      |
| Ensure processes don't rely on memory                     | Progress saving, visible context, summaries       |
| Provide help and support                                  | Contextual help, clear instructions               |
| Support adaptation and personalization                    | User preferences, multiple paths                  |

---

## Sensory Accommodations

### Visual Accommodations

#### Color and Contrast

**Default palette:**

| Element      | Foreground | Background | Ratio  |
| ------------ | ---------- | ---------- | ------ |
| Body text    | #1a1a2e    | #ffffff    | 15.5:1 |
| Muted text   | #666666    | #ffffff    | 5.7:1  |
| Link text    | #0066cc    | #ffffff    | 5.9:1  |
| Error text   | #cc0000    | #ffffff    | 5.9:1  |
| Success text | #006600    | #ffffff    | 7.1:1  |

**High contrast mode:**

```css
@media (prefers-contrast: more) {
    :root {
        --color-text: #000000;
        --color-background: #ffffff;
        --color-link: #0000cc;
        --color-focus: #000000;
    }
}
```

#### Color Blindness Support

Never rely solely on color:

```svelte
<!-- Good: Color + icon + text -->
<div class="status success">
    <SuccessIcon aria-hidden="true" />
    <span>Exercise completed</span>
</div>

<!-- Bad: Color only -->
<div class="status" style="color: green;">Completed</div>
```

#### Text Scaling

Support up to 200% text scaling without layout breakage:

```css
/* Use relative units */
.instruction-text {
    font-size: 1.25rem;
    line-height: 1.6;
    max-width: 65ch;
}

/* Avoid fixed heights with text */
.card {
    min-height: 4rem; /* Not height: 4rem */
    padding: 1rem;
}
```

#### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

**Component-level implementation:**

```svelte
<script lang="ts">
    import { reducedMotion } from '$lib/stores/preferences';

    const transition = $reducedMotion ? 'none' : 'fade';
</script>

{#if showContent}
    <div transition:{transition}>
        <!-- content -->
    </div>
{/if}
```

### Auditory Accommodations

#### No Audio Required

All audio content has visual equivalent:

| Audio Feature          | Visual Equivalent                   |
| ---------------------- | ----------------------------------- |
| Phase transition sound | Visual indicator, text announcement |
| Timer completion beep  | Visual countdown, vibration option  |
| Error sound            | Visual error message, icon          |

#### Audio Cues (Optional)

```svelte
<script lang="ts">
    import { audioEnabled } from '$lib/stores/preferences';

    function playPhaseComplete() {
        if ($audioEnabled) {
            audioPlayer.play('phase-complete');
        }
    }
</script>
```

### Motion Sensitivity

Beyond `prefers-reduced-motion`:

```svelte
<script lang="ts">
    import { motionLevel } from '$lib/stores/preferences';
    // motionLevel: 'full' | 'reduced' | 'none'
</script>

{#if $motionLevel === 'full'}
    <AnimatedTransition>
        <slot />
    </AnimatedTransition>
{:else if $motionLevel === 'reduced'}
    <FadeTransition>
        <slot />
    </FadeTransition>
{:else}
    <slot />
{/if}
```

---

## Motor Accessibility

### Touch Targets

Minimum sizes for all interactive elements:

| Element Type    | Minimum Size | Recommended Size |
| --------------- | ------------ | ---------------- |
| Primary buttons | 44x44px      | 48x48px          |
| Icon buttons    | 44x44px      | 44x44px          |
| Form inputs     | 44px height  | 48px height      |
| List items      | 44px height  | 56px height      |
| Tab bar items   | 44x44px      | 64x64px          |

```css
.button {
    min-height: 44px;
    min-width: 44px;
    padding: 12px 24px;
}

.icon-button {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
}
```

### Touch Target Spacing

Adjacent targets must have adequate spacing:

```css
.button-group {
    gap: 8px; /* Minimum 8px between targets */
}
```

### Keyboard Navigation

#### Focus Management

```svelte
<script lang="ts">
    import { onMount } from 'svelte';

    let firstFocusable: HTMLElement;

    onMount(() => {
        // Focus first element when modal opens
        firstFocusable?.focus();
    });
</script>

<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <h2 id="modal-title">End Exercise?</h2>
    <button bind:this={firstFocusable}>Continue Exercise</button>
    <button>End and Save</button>
</div>
```

#### Focus Trapping

```typescript
function trapFocus(container: HTMLElement) {
    const focusable = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;

    container.addEventListener('keydown', e => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });
}
```

#### Skip Links

```svelte
<a href="#main-content" class="skip-link"> Skip to main content </a>

<nav aria-label="Main navigation">
    <!-- nav content -->
</nav>

<main id="main-content" tabindex="-1">
    <!-- page content -->
</main>

<style>
    .skip-link {
        position: absolute;
        left: -10000px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
    }

    .skip-link:focus {
        position: static;
        width: auto;
        height: auto;
    }
</style>
```

### Voice Input Support

Enable voice dictation for text inputs:

```svelte
<input
    type="text"
    aria-label="Describe the sensation in your own words"
    autocomplete="off"
    inputmode="text"
    x-webkit-speech
/>
```

### Single-Hand Operation

All controls reachable with one hand:

- Primary actions at bottom of screen
- No stretch-to-reach elements
- Swipe gestures have button alternatives

---

## Content Guidelines

### Language Level

**Target**: 8th grade reading level (Flesch-Kincaid Grade Level 8)

**Guidelines:**

- Sentences: 15-20 words maximum
- Paragraphs: 3-4 sentences maximum
- Words: Prefer common, concrete words
- Voice: Active voice preferred

### Vocabulary

| Instead of              | Use                    |
| ----------------------- | ---------------------- |
| Interoceptive awareness | Body awareness         |
| Sensation               | Feeling (in your body) |
| Cardiac                 | Heart                  |
| Gastric                 | Stomach                |
| Utilize                 | Use                    |
| Subsequently            | Then                   |
| Terminate               | End                    |
| Commence                | Start                  |

### Instructions

**Do:**

- Use numbered steps for multi-step processes
- One action per instruction
- Include the expected result

**Don't:**

- Combine multiple actions
- Use vague language ("appropriately")
- Assume prior knowledge

```
✓ Good:
1. Close your eyes.
2. Take a slow breath.
3. Notice your heartbeat.

✗ Bad:
Close your eyes and breathe slowly while noticing your heartbeat.
```

### Error Messages

**Structure:**

1. What happened (brief)
2. Why it matters (if not obvious)
3. How to fix it

```
✓ Good:
"Couldn't save your description. Your text is still here—tap Save to try again."

✗ Bad:
"Error: Network failure (code 500)"
```

### Confirmation Messages

```
✓ Good:
"Exercise saved! You completed 4 of 6 phases."

✗ Bad:
"Success"
```

### Empty States

Provide guidance, not just absence:

```svelte
<EmptyState>
    <h2>No exercises yet</h2>
    <p>Start your first practice to see your history here.</p>
    <Button href="/exercises">Browse Exercises</Button>
</EmptyState>
```

---

## Component Accessibility Requirements

### Buttons

```svelte
<button type="button" aria-label="Close dialog" aria-pressed={isPressed} disabled={isDisabled}>
    <CloseIcon aria-hidden="true" />
    <span class="sr-only">Close</span>
</button>

<style>
    button {
        min-height: 44px;
        min-width: 44px;
    }

    button:focus-visible {
        outline: 2px solid var(--color-focus);
        outline-offset: 2px;
    }

    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
```

### Form Inputs

```svelte
<div class="form-field">
    <label for="description" id="description-label"> Describe the sensation </label>
    <textarea
        id="description"
        aria-labelledby="description-label"
        aria-describedby="description-hint description-error"
        aria-invalid={hasError}
        maxlength="200"
    ></textarea>
    <p id="description-hint" class="hint">Use your own words. There are no wrong answers.</p>
    {#if hasError}
        <p id="description-error" class="error" role="alert">
            {errorMessage}
        </p>
    {/if}
</div>
```

### Progress Indicators

```svelte
<div
    role="progressbar"
    aria-valuenow={currentPhase}
    aria-valuemin={1}
    aria-valuemax={totalPhases}
    aria-label="Exercise progress"
>
    <span class="sr-only">
        Phase {currentPhase} of {totalPhases}
    </span>
    <!-- Visual progress bar -->
</div>
```

### Timers

```svelte
<script>
    // Announce at key points only (not every second)
    $: if (seconds === 30 || seconds === 10 || seconds === 3) {
        announceTime(seconds);
    }

    function announceTime(seconds: number) {
        const announcement = `${seconds} seconds remaining`;
        ariaLive.announce(announcement, 'polite');
    }
</script>

<div role="timer" aria-live="off" aria-label="Time remaining: {seconds} seconds">
    <span class="timer-display">{seconds}</span>
</div>
```

### Navigation

```svelte
<nav aria-label="Main navigation">
    <ul role="list">
        {#each navItems as item}
            <li>
                <a href={item.path} aria-current={isActive(item.path) ? 'page' : undefined}>
                    <item.icon aria-hidden="true" />
                    <span>{item.label}</span>
                </a>
            </li>
        {/each}
    </ul>
</nav>
```

### Modals/Dialogs

```svelte
<div
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
>
    <h2 id="dialog-title">End Exercise?</h2>
    <p id="dialog-description">You've completed 3 of 6 phases. Your progress will be saved.</p>

    <div class="dialog-actions">
        <button autofocus>Continue Exercise</button>
        <button>End and Save</button>
    </div>
</div>
```

### Data Visualizations

```svelte
<!-- Radar chart with accessible alternative -->
<figure>
    <RadarChart data={maiaScores} aria-hidden="true" />

    <figcaption class="sr-only">
        <h3>MAIA-2 Assessment Scores</h3>
        <dl>
            {#each maiaScores as score}
                <dt>{score.subscale}</dt>
                <dd>{score.value} out of 5</dd>
            {/each}
        </dl>
    </figcaption>
</figure>

<!-- Table alternative available -->
<details>
    <summary>View as table</summary>
    <table>
        <thead>
            <tr>
                <th>Subscale</th>
                <th>Score</th>
            </tr>
        </thead>
        <tbody>
            {#each maiaScores as score}
                <tr>
                    <td>{score.subscale}</td>
                    <td>{score.value}/5</td>
                </tr>
            {/each}
        </tbody>
    </table>
</details>
```

---

## Testing Protocol

### Automated Testing

Run on every build:

```typescript
// vitest.config.ts
export default {
    test: {
        setupFiles: ['./tests/setup/a11y.ts'],
    },
};

// tests/setup/a11y.ts
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

// Example test
it('has no accessibility violations', async () => {
    const { container } = render(ExercisePlayer);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
});
```

**Tools:**

- axe-core (via jest-axe)
- eslint-plugin-jsx-a11y (adapted for Svelte)
- Playwright accessibility testing

### Manual Testing

#### Keyboard Testing Checklist

| Test                                 | Pass Criteria                      |
| ------------------------------------ | ---------------------------------- |
| Tab through all interactive elements | Focus moves in logical order       |
| Use Enter/Space to activate buttons  | All buttons respond                |
| Use Escape to close dialogs          | Dialogs close, focus returns       |
| Navigate without mouse               | All features accessible            |
| No keyboard traps                    | Can always Tab out                 |
| Focus visible                        | Clear focus indicator always shown |

#### Screen Reader Testing

Test with:

- VoiceOver (macOS/iOS)
- NVDA (Windows)
- TalkBack (Android)

| Test                  | Pass Criteria                 |
| --------------------- | ----------------------------- |
| Page titles announced | Correct title on each page    |
| Headings navigable    | H1-H6 hierarchy correct       |
| Form labels announced | All inputs have labels        |
| Buttons purpose clear | Button text/label descriptive |
| Images described      | Alt text present and useful   |
| Errors announced      | Error messages read aloud     |
| Live regions work     | Dynamic content announced     |

#### Zoom Testing

| Level          | Pass Criteria                   |
| -------------- | ------------------------------- |
| 100%           | Baseline rendering              |
| 150%           | All content visible, no overlap |
| 200%           | All content visible, may reflow |
| Text-only 200% | Content accessible              |

### User Testing

**Recruit from target populations:**

- Autistic adults
- People with ADHD
- People with anxiety disorders
- People with alexithymia

**Testing protocol:**

1. Think-aloud usability testing
2. Task completion observation
3. Post-task questionnaire
4. Follow-up interview

**Key tasks to test:**

- Complete onboarding
- Do first exercise
- Record a description
- View progress
- Change settings

---

## Implementation Checklist

### Per-Component Checklist

- [ ] Keyboard accessible (Tab, Enter, Space, Escape)
- [ ] Focus indicator visible
- [ ] Touch target >= 44x44px
- [ ] Color contrast >= 4.5:1 (text) / 3:1 (UI)
- [ ] Works with text zoom to 200%
- [ ] Works with reduced motion preference
- [ ] Has accessible name (label/aria-label)
- [ ] Role appropriate for function
- [ ] State communicated (aria-pressed, aria-expanded, etc.)

### Per-Page Checklist

- [ ] Unique, descriptive `<title>`
- [ ] Single `<h1>` describing page purpose
- [ ] Logical heading hierarchy
- [ ] Skip link to main content
- [ ] Focus managed on navigation
- [ ] Error messages associated with inputs
- [ ] Loading states announced
- [ ] No content relies solely on color

### Per-Feature Checklist

- [ ] Works without JavaScript (where applicable)
- [ ] Works offline
- [ ] Can be paused/stopped
- [ ] Progress can be saved
- [ ] Errors have recovery path
- [ ] No time limits (or can be extended)
- [ ] No unexpected context changes

### Release Checklist

- [ ] Automated a11y tests pass
- [ ] Manual keyboard testing complete
- [ ] Screen reader testing complete
- [ ] Zoom testing complete
- [ ] User testing with target population
- [ ] WCAG 2.2 AA audit passed

---

## Related Specifications

- [ONBOARDING-FLOW.md](./ONBOARDING-FLOW.md) - Onboarding accessibility
- [EXERCISE-PLAYER-UI.md](./EXERCISE-PLAYER-UI.md) - Exercise player accessibility
- [PROGRESS-DASHBOARD.md](./PROGRESS-DASHBOARD.md) - Visualization accessibility
- [APP-NAVIGATION.md](./APP-NAVIGATION.md) - Navigation accessibility

---

_Last updated: February 2026_
