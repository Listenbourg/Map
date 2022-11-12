/**
 * Returns a lightened color
 * @param color A color in the format #RRGGBB
 */
export function lighten(color: string): string {
  let r = Math.min(
    255,
    Math.round(parseInt(color.substring(1, 3), 16) * 1.2)
  ).toString(16);
  let g = Math.min(
    255,
    Math.round(parseInt(color.substring(3, 5), 16) * 1.2)
  ).toString(16);
  let b = Math.min(
    255,
    Math.round(parseInt(color.substring(5, 7), 16) * 1.2)
  ).toString(16);
  r = r.length == 1 ? '0' + r : r;
  g = g.length == 1 ? '0' + g : g;
  b = b.length == 1 ? '0' + b : b;
  return '#' + r + g + b;
}
