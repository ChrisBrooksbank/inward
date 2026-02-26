/**
 * Shared prop constants for Button and Card components.
 * Extracted to a separate module so they can be unit-tested
 * without triggering Svelte CSS preprocessing in the test environment.
 */

export const BUTTON_VARIANTS = ['primary', 'secondary', 'ghost'] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

export const BUTTON_TYPES = ['button', 'submit', 'reset'] as const;
export type ButtonType = (typeof BUTTON_TYPES)[number];

export const CARD_PADDINGS = ['sm', 'md', 'lg'] as const;
export type CardPadding = (typeof CARD_PADDINGS)[number];
