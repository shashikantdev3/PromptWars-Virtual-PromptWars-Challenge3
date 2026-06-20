import { describe, expect, it } from 'vitest';
import { DEFAULT_INPUTS } from './calculator';
import { categoryLabel, generateInsights, topCategory } from './insights';
import type { FootprintBreakdown, FootprintInputs } from './types';

describe('topCategory', () => {
  it('returns the largest non-zero category', () => {
    const breakdown: FootprintBreakdown = {
      transport: 100,
      flights: 900,
      home: 200,
      food: 300,
      goods: 50,
      total: 1550,
    };
    expect(topCategory(breakdown)).toBe('flights');
  });

  it('returns null when everything is zero', () => {
    const breakdown: FootprintBreakdown = {
      transport: 0,
      flights: 0,
      home: 0,
      food: 0,
      goods: 0,
      total: 0,
    };
    expect(topCategory(breakdown)).toBeNull();
  });
});

describe('generateInsights', () => {
  it('sorts insights by descending potential saving', () => {
    const insights = generateInsights(DEFAULT_INPUTS);
    for (let i = 1; i < insights.length; i += 1) {
      expect(insights[i - 1]!.potentialAnnualSavingKg).toBeGreaterThanOrEqual(
        insights[i]!.potentialAnnualSavingKg,
      );
    }
  });

  it('suggests an EV switch for petrol drivers', () => {
    const insights = generateInsights({
      ...DEFAULT_INPUTS,
      carFuel: 'petrol',
      carKmPerWeek: 200,
    });
    expect(insights.some((i) => i.id === 'switch-to-ev')).toBe(true);
  });

  it('does not suggest an EV switch for someone with no car', () => {
    const noCar: FootprintInputs = {
      ...DEFAULT_INPUTS,
      carFuel: 'none',
      carKmPerWeek: 0,
    };
    const insights = generateInsights(noCar);
    expect(insights.some((i) => i.id === 'switch-to-ev')).toBe(false);
  });

  it('does not suggest eating less meat to a vegan', () => {
    const insights = generateInsights({ ...DEFAULT_INPUTS, diet: 'vegan' });
    expect(insights.some((i) => i.id === 'reduce-meat')).toBe(false);
  });

  it('produces only positive, finite savings', () => {
    const insights = generateInsights(DEFAULT_INPUTS);
    for (const insight of insights) {
      expect(insight.potentialAnnualSavingKg).toBeGreaterThan(0);
      expect(Number.isFinite(insight.potentialAnnualSavingKg)).toBe(true);
    }
  });
});

describe('categoryLabel', () => {
  it('returns human-readable labels', () => {
    expect(categoryLabel('flights')).toBe('Flights');
    expect(categoryLabel('home')).toBe('Home energy');
  });
});
