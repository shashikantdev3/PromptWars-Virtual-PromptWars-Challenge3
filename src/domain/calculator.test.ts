import { describe, expect, it } from 'vitest';
import {
  DEFAULT_INPUTS,
  calcFlights,
  calcFood,
  calcHome,
  calcTransport,
  calculateFootprint,
  clamp,
  sanitizeInputs,
  treesEquivalent,
} from './calculator';
import type { FootprintInputs } from './types';

describe('clamp', () => {
  it('keeps values within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(50, 0, 10)).toBe(10);
  });

  it('coerces non-finite values to the minimum', () => {
    expect(clamp(NaN, 1, 10)).toBe(1);
    expect(clamp(Infinity, 1, 10)).toBe(1);
    expect(clamp(-Infinity, 1, 10)).toBe(1);
  });
});

describe('sanitizeInputs', () => {
  it('clamps out-of-range and hostile values', () => {
    const hostile: FootprintInputs = {
      ...DEFAULT_INPUTS,
      carKmPerWeek: -100,
      electricityKwhPerMonth: Number.POSITIVE_INFINITY,
      householdSize: 0,
      renewableShare: 5,
    };
    const safe = sanitizeInputs(hostile);
    expect(safe.carKmPerWeek).toBe(0);
    expect(safe.electricityKwhPerMonth).toBe(0);
    expect(safe.householdSize).toBe(1);
    expect(safe.renewableShare).toBe(1);
  });

  it('rounds household size to a whole number', () => {
    const safe = sanitizeInputs({ ...DEFAULT_INPUTS, householdSize: 2.7 });
    expect(safe.householdSize).toBe(3);
  });
});

describe('category calculators', () => {
  it('returns zero transport when there is no travel', () => {
    const inputs: FootprintInputs = {
      ...DEFAULT_INPUTS,
      carKmPerWeek: 0,
      busKmPerWeek: 0,
      trainKmPerWeek: 0,
      carFuel: 'none',
    };
    expect(calcTransport(inputs)).toBe(0);
  });

  it('computes petrol car transport from a known case', () => {
    const inputs: FootprintInputs = {
      ...DEFAULT_INPUTS,
      carKmPerWeek: 100,
      carFuel: 'petrol',
      busKmPerWeek: 0,
      trainKmPerWeek: 0,
    };
    // 100 km * 52 weeks * 0.192 = 998.4 -> 998
    expect(calcTransport(inputs)).toBe(998);
  });

  it('values electric driving far below petrol for the same distance', () => {
    const petrol = calcTransport({
      ...DEFAULT_INPUTS,
      carFuel: 'petrol',
      busKmPerWeek: 0,
      trainKmPerWeek: 0,
    });
    const electric = calcTransport({
      ...DEFAULT_INPUTS,
      carFuel: 'electric',
      busKmPerWeek: 0,
      trainKmPerWeek: 0,
    });
    expect(electric).toBeLessThan(petrol);
  });

  it('computes flights from per-trip factors', () => {
    const inputs: FootprintInputs = {
      ...DEFAULT_INPUTS,
      shortFlightsPerYear: 2,
      longFlightsPerYear: 1,
    };
    // 2 * 500 + 1 * 1800 = 2800
    expect(calcFlights(inputs)).toBe(2800);
  });

  it('divides home energy across the household', () => {
    const base: FootprintInputs = {
      ...DEFAULT_INPUTS,
      householdSize: 1,
      renewableShare: 0,
    };
    const shared: FootprintInputs = { ...base, householdSize: 2 };
    expect(calcHome(shared)).toBe(Math.round(calcHome(base) / 2));
  });

  it('reduces home electricity emissions with renewable share', () => {
    const grid = calcHome({ ...DEFAULT_INPUTS, renewableShare: 0 });
    const green = calcHome({ ...DEFAULT_INPUTS, renewableShare: 1 });
    expect(green).toBeLessThan(grid);
  });

  it('maps diet types to documented annual factors', () => {
    expect(calcFood({ ...DEFAULT_INPUTS, diet: 'vegan' })).toBe(1100);
    expect(calcFood({ ...DEFAULT_INPUTS, diet: 'meatHeavy' })).toBe(3300);
  });
});

describe('calculateFootprint', () => {
  it('totals all categories', () => {
    const b = calculateFootprint(DEFAULT_INPUTS);
    expect(b.total).toBe(b.transport + b.flights + b.home + b.food + b.goods);
  });

  it('never produces negative or non-finite totals', () => {
    const b = calculateFootprint({
      ...DEFAULT_INPUTS,
      carKmPerWeek: -999,
      electricityKwhPerMonth: NaN,
    });
    expect(b.total).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(b.total)).toBe(true);
  });
});

describe('treesEquivalent', () => {
  it('converts kg to whole trees, never negative', () => {
    expect(treesEquivalent(21)).toBe(1);
    expect(treesEquivalent(210)).toBe(10);
    expect(treesEquivalent(-50)).toBe(0);
  });
});
