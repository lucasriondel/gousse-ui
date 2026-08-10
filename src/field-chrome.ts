/**
 * Shared field chrome for text inputs. One string so {@link Input},
 * {@link Textarea} and {@link Select} can't drift — border, bg, text token, and
 * the folded `focus:border-gousse-ink focus:outline-hidden` focus treatment.
 *
 * Radius is deliberately **not** here. A single-line field is a pill
 * ({@link FIELD_PILL}) but a multi-line box is not, so each consumer picks its
 * own shape and only the shared chrome lives in this string.
 *
 * The inset is `px-4`, not the `px-2` a square field carried: a pill eats
 * padding at its ends, so text placed at the old inset collides with the
 * corner arc. Rounding a control means widening it.
 */
export const FIELD_CHROME =
  "border border-gousse-line bg-gousse-panel px-4 py-1.5 text-sm text-gousse-ink focus:border-gousse-ink focus:outline-hidden";

/**
 * Radius for single-line fields ({@link Input}, {@link Select}). Split out from
 * {@link FIELD_CHROME} so {@link Textarea}, whose multi-line box would look
 * broken as a pill, can share the chrome without inheriting the shape.
 */
export const FIELD_PILL = "rounded-full";

/**
 * Radius for multi-line fields ({@link Textarea}). Generous, but a corner
 * rather than a pill.
 */
export const FIELD_BOX = "rounded-2xl";
