// Deterministic pseudo-random helpers used to seed illustrative demo state
// (e.g. "agent coverage %" placeholders). Deterministic so the same
// ward/LGA always shows the same demo numbers across reloads and between
// rehearsal and the live pitch — never random/flaky mid-demo.

export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// Returns a stable pseudo-random number in [0, 1) for a given id.
export function seededRatio(id: string): number {
  return (hashString(id) % 10000) / 10000;
}

// Stable pseudo-random integer in [min, max].
export function seededInt(id: string, min: number, max: number): number {
  const r = seededRatio(id);
  return Math.floor(min + r * (max - min + 1));
}

// Illustrative agent-coverage percentage for a ward/LGA, biased toward a
// realistic-looking mid-high range (55-98%) rather than uniform 0-100, so
// the demo reads as "mostly staffed, a few gaps" rather than random noise.
export function seededCoveragePct(id: string): number {
  return seededInt(id, 55, 98);
}
