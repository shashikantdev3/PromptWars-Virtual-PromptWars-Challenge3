import { REFERENCE_FOOTPRINTS } from './emissionFactors';

/**
 * Format a kg CO2e value into a compact, human-readable string.
 * Values >= 1000 kg are shown in tonnes with one decimal.
 */
export function formatCo2(kg: number): string {
  const safe = Number.isFinite(kg) ? Math.max(0, kg) : 0;
  if (safe >= 1000) {
    const tonnes = safe / 1000;
    return `${tonnes.toFixed(1)} t`;
  }
  return `${Math.round(safe)} kg`;
}

/** Format a 0–1 ratio as a whole-number percentage string. */
export function formatPercent(ratio: number): string {
  const safe = Number.isFinite(ratio) ? ratio : 0;
  return `${Math.round(safe * 100)}%`;
}

export type ComparisonRating = 'excellent' | 'good' | 'average' | 'high';

export interface FootprintComparison {
  rating: ComparisonRating;
  label: string;
  /** Ratio of the user's footprint to the global average. */
  vsGlobalAverage: number;
  /** Ratio of the user's footprint to the Paris-aligned target. */
  vsParisTarget: number;
}

/**
 * Compare an annual footprint against reference levels and return a friendly,
 * non-judgemental rating used for messaging and color coding.
 */
export function compareFootprint(annualKg: number): FootprintComparison {
  const safe = Number.isFinite(annualKg) ? Math.max(0, annualKg) : 0;
  const vsGlobalAverage = safe / REFERENCE_FOOTPRINTS.globalAverage;
  const vsParisTarget = safe / REFERENCE_FOOTPRINTS.parisTarget;

  let rating: ComparisonRating;
  let label: string;
  if (safe <= REFERENCE_FOOTPRINTS.parisTarget) {
    rating = 'excellent';
    label = 'Within the Paris-aligned target — outstanding.';
  } else if (safe <= REFERENCE_FOOTPRINTS.globalAverage) {
    rating = 'good';
    label = 'Below the global average — a solid place to build on.';
  } else if (safe <= REFERENCE_FOOTPRINTS.highIncomeAverage) {
    rating = 'average';
    label = 'Around the high-income-country average — room to improve.';
  } else {
    rating = 'high';
    label = 'Above typical levels — the insights below can help.';
  }

  return { rating, label, vsGlobalAverage, vsParisTarget };
}
