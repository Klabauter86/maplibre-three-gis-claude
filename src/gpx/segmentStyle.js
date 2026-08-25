// Cycled by segmentIndex % length for segments that match neither keyword
// below, so unrelated tracks still get visually distinct colors.
const FALLBACK_COLORS = ['#ff5a3d', '#22d3ee', '#a3e635', '#f472b6', '#fbbf24', '#818cf8'];

// Standard via-ferrata (Klettersteig) difficulty scale A (easiest) through E
// (hardest), colored along the conventional blue → red → black gradient
// (as used for ski-run-style difficulty coding), with B and D as the
// blue/red and red/black midpoints.
const GRADE_COLORS = {
  A: '#2563eb',
  B: '#814589',
  C: '#dc2626',
  D: '#771c1c',
  E: '#171717',
};

const KLETTERSTEIG_GRADE_RE = /klettersteig[^a-eA-E]*([a-eA-E])\b/i;

// Derives a line color + dash style from a segment's name: "Gehen" sections
// render as a yellow dotted trail, "Klettersteig <A-E>" sections are colored
// by via-ferrata difficulty, and anything else falls back to a rotating
// palette by segment index.
export function segmentStyle(name, segmentIndex) {
  if (/gehen/i.test(name)) {
    return { color: '#eab308', dashed: true };
  }

  const match = name.match(KLETTERSTEIG_GRADE_RE);
  if (match) {
    return { color: GRADE_COLORS[match[1].toUpperCase()], dashed: false };
  }

  return { color: FALLBACK_COLORS[segmentIndex % FALLBACK_COLORS.length], dashed: false };
}
