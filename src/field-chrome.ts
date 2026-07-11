/**
 * Shared field chrome for text inputs. One string so {@link Input} and
 * {@link Textarea} can't drift — border, bg, text token, and the folded
 * `focus:border-gousse-ink focus:outline-hidden` focus treatment.
 */
export const FIELD_CHROME =
  "rounded border border-gousse-line bg-gousse-panel px-2 py-1.5 text-sm text-gousse-ink focus:border-gousse-ink focus:outline-hidden";
