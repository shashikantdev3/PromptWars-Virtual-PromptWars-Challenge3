import { describe, expect, it } from 'vitest';
import { compareFootprint, formatCo2, formatPercent } from './format';

describe('formatCo2', () => {
  it('shows kg below one tonne', () => {
    expect(formatCo2(450)).toBe('450 kg');
  });

  it('shows tonnes at or above 1000 kg', () => {
    expect(formatCo2(2500)).toBe('2.5 t');
  });

  it('handles invalid input gracefully', () => {
    expect(formatCo2(NaN)).toBe('0 kg');
    expect(formatCo2(-100)).toBe('0 kg');
  });
});

describe('formatPercent', () => {
  it('formats ratios as whole percentages', () => {
    expect(formatPercent(0.25)).toBe('25%');
    expect(formatPercent(1)).toBe('100%');
    expect(formatPercent(NaN)).toBe('0%');
  });
});

describe('compareFootprint', () => {
  it('rates a low footprint as excellent', () => {
    expect(compareFootprint(2000).rating).toBe('excellent');
  });

  it('rates a mid footprint as good', () => {
    expect(compareFootprint(4000).rating).toBe('good');
  });

  it('rates a large footprint as high', () => {
    expect(compareFootprint(15000).rating).toBe('high');
  });

  it('reports the ratio against the global average', () => {
    const c = compareFootprint(4700);
    expect(c.vsGlobalAverage).toBeCloseTo(1, 5);
  });
});
