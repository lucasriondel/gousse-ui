/**
 * Circular loading spinner. Ported verbatim from web's Spinner brick:
 * hand-rolled `animate-spin` ring with `role="status"` + `aria-label` and the
 * `border-t-gousse-accent` accent tick. `size` is the px diameter.
 */
export const Spinner = ({ size = 16 }: { size?: number }) => (
  <span
    role="status"
    aria-label="Loading"
    className="inline-block animate-spin rounded-full border-2 border-gousse-line border-t-gousse-accent"
    style={{ width: size, height: size }}
  />
);
