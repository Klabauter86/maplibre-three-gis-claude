// Cycled by segmentIndex % length for segments that match neither keyword
// below, so unrelated tracks still get visually distinct colors.
const FALLBACK_COLORS = ['#ff5a3d', '#22d3ee', '#a3e635', '#f472b6', '#fbbf24', '#818cf8'];

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]) {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;
}

function mixColors(hexA, hexB, t = 0.5) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex(a.map((v, i) => v + (b[i] - v) * t));
}

// Standard via-ferrata (Klettersteig) difficulty scale A (easiest) through E
// (hardest), colored along the conventional blue → red → black gradient (as
// used for ski-run-style difficulty coding). Only A/C/E are true anchors; B
// and D — and any combined grade like "B/C" — are colored as the midpoint
// between their neighboring anchors, computed below rather than hardcoded,
// so a combined grade always lands visually between its two letters.
const GRADE_ANCHORS = { A: '#2563eb', C: '#dc2626', E: '#171717' };
const GRADE_COLORS = {
  A: GRADE_ANCHORS.A,
  B: mixColors(GRADE_ANCHORS.A, GRADE_ANCHORS.C),
  C: GRADE_ANCHORS.C,
  D: mixColors(GRADE_ANCHORS.C, GRADE_ANCHORS.E),
  E: GRADE_ANCHORS.E,
};

// Matches "Klettersteig A", "Klettersteig B/C", "Klettersteig C-D", etc.
// The second grade requires an explicit "/" or "-" separator (not just a
// space) so it doesn't accidentally swallow the first letter of the next
// word, e.g. "Klettersteig B Erweiterung".
const KLETTERSTEIG_GRADE_RE = /klettersteig[^a-eA-E]*\b([a-eA-E])\b(?:\s*[/-]\s*\b([a-eA-E])\b)?/i;

// Real-world track exports often skip the word "Klettersteig" entirely and
// name a segment just by its grade — "A", "A/B", "C-D". This only matches
// when the *entire* (trimmed) name is such a grade, so it can't misfire on
// an unrelated name that merely starts with a letter A-E.
const BARE_GRADE_RE = /^([a-eA-E])(?:\s*[/-]\s*([a-eA-E]))?$/i;

function gradeMatchColor(gradeA, gradeB) {
  const colorA = GRADE_COLORS[gradeA.toUpperCase()];
  return gradeB ? mixColors(colorA, GRADE_COLORS[gradeB.toUpperCase()]) : colorA;
}

// Derives a line color + dash style from a segment's name: "Gehen" sections
// render as a yellow dotted trail, a via-ferrata grade — "Klettersteig
// <A-E>" or just the bare grade itself, e.g. "B/C" — is colored by
// difficulty (a combined grade as the color between its two letters), and
// anything else falls back to a rotating palette by segment index.
export function segmentStyle(name, segmentIndex) {
  if (/gehen/i.test(name)) {
    return { color: '#eab308', dashed: true };
  }

  const match = name.match(KLETTERSTEIG_GRADE_RE) ?? name.trim().match(BARE_GRADE_RE);
  if (match) {
    return { color: gradeMatchColor(match[1], match[2]), dashed: false };
  }

  return { color: FALLBACK_COLORS[segmentIndex % FALLBACK_COLORS.length], dashed: false };
}
