import {
  DIET_FACTORS_PER_YEAR,
  ELECTRICITY_FACTOR_PER_KWH,
  MONTHS_PER_YEAR,
  SHORT_HAUL_FLIGHT_KG,
  TRANSPORT_FACTORS_PER_KM,
  WEEKS_PER_YEAR,
} from './emissionFactors';
import type {
  FootprintBreakdown,
  FootprintCategory,
  FootprintInputs,
  Insight,
} from './types';
import { sanitizeInputs } from './calculator';

const CATEGORY_LABELS: Record<FootprintCategory, string> = {
  transport: 'Ground transport',
  flights: 'Flights',
  home: 'Home energy',
  food: 'Food & diet',
  goods: 'Goods & shopping',
};

export function categoryLabel(category: FootprintCategory): string {
  return CATEGORY_LABELS[category];
}

/**
 * Identify the largest-emitting category from a breakdown.
 * Returns `null` when every category is zero.
 */
export function topCategory(
  breakdown: FootprintBreakdown,
): FootprintCategory | null {
  const entries: Array<[FootprintCategory, number]> = [
    ['transport', breakdown.transport],
    ['flights', breakdown.flights],
    ['home', breakdown.home],
    ['food', breakdown.food],
    ['goods', breakdown.goods],
  ];
  let best: [FootprintCategory, number] | null = null;
  for (const entry of entries) {
    if (entry[1] > 0 && (best === null || entry[1] > best[1])) {
      best = entry;
    }
  }
  return best ? best[0] : null;
}

/**
 * Generate personalized, actionable insights ranked by estimated impact.
 *
 * Each insight quantifies the annual CO2e a user could avoid, so the UI can
 * show the highest-leverage actions first. Pure function — deterministic for
 * a given input.
 */
export function generateInsights(rawInputs: FootprintInputs): Insight[] {
  const inputs = sanitizeInputs(rawInputs);
  const insights: Insight[] = [];

  // --- Transport ---------------------------------------------------------
  if (inputs.carFuel === 'petrol' || inputs.carFuel === 'diesel') {
    const annualCarKm = inputs.carKmPerWeek * WEEKS_PER_YEAR;
    const current = annualCarKm * TRANSPORT_FACTORS_PER_KM[inputs.carFuel];
    const electric = annualCarKm * TRANSPORT_FACTORS_PER_KM.electric;
    const saving = Math.round(current - electric);
    if (saving > 50) {
      insights.push({
        id: 'switch-to-ev',
        category: 'transport',
        title: 'Switch your car to electric',
        description:
          'Replacing your petrol/diesel car with an electric vehicle charged on a typical grid would cut most of your driving emissions.',
        potentialAnnualSavingKg: saving,
      });
    }
  }

  if (inputs.carKmPerWeek >= 30) {
    // Shifting 25% of car km to train.
    const shifted = inputs.carKmPerWeek * 0.25 * WEEKS_PER_YEAR;
    const saving = Math.round(
      shifted * (TRANSPORT_FACTORS_PER_KM[inputs.carFuel] - 0.041) /* train */,
    );
    if (saving > 30) {
      insights.push({
        id: 'shift-car-to-transit',
        category: 'transport',
        title: 'Replace some car trips with rail or cycling',
        description:
          'Shifting roughly a quarter of your weekly car distance to train, cycling, or walking meaningfully lowers transport emissions and often saves money.',
        potentialAnnualSavingKg: saving,
      });
    }
  }

  // --- Flights -----------------------------------------------------------
  if (inputs.shortFlightsPerYear >= 1) {
    const saving = Math.round(
      inputs.shortFlightsPerYear * SHORT_HAUL_FLIGHT_KG,
    );
    insights.push({
      id: 'replace-short-flight',
      category: 'flights',
      title: 'Swap a short-haul flight for rail',
      description:
        'Short-haul flights are carbon-intensive per trip. Replacing them with rail where feasible avoids a large, concentrated chunk of emissions.',
      potentialAnnualSavingKg: saving,
    });
  }

  // --- Home energy -------------------------------------------------------
  if (inputs.renewableShare < 0.9 && inputs.electricityKwhPerMonth > 0) {
    const annualKwh = inputs.electricityKwhPerMonth * MONTHS_PER_YEAR;
    const remainingFossil = 1 - inputs.renewableShare;
    const saving = Math.round(
      (annualKwh * ELECTRICITY_FACTOR_PER_KWH * remainingFossil) /
        Math.max(1, inputs.householdSize),
    );
    if (saving > 40) {
      insights.push({
        id: 'green-electricity',
        category: 'home',
        title: 'Switch to a renewable electricity tariff',
        description:
          'Moving your remaining electricity to a certified renewable tariff (or adding rooftop solar) can eliminate most of your electricity emissions.',
        potentialAnnualSavingKg: saving,
      });
    }
  }

  if (inputs.electricityKwhPerMonth > 150) {
    // Efficiency measures conservatively save ~10% of electricity.
    const annualKwh = inputs.electricityKwhPerMonth * MONTHS_PER_YEAR;
    const saving = Math.round(
      (annualKwh * ELECTRICITY_FACTOR_PER_KWH * 0.1) /
        Math.max(1, inputs.householdSize),
    );
    if (saving > 20) {
      insights.push({
        id: 'energy-efficiency',
        category: 'home',
        title: 'Cut standby and lighting energy',
        description:
          'LED lighting, switching off standby loads, and a slightly lower thermostat typically trim about 10% off household electricity use.',
        potentialAnnualSavingKg: saving,
      });
    }
  }

  // --- Food --------------------------------------------------------------
  if (inputs.diet !== 'vegan' && inputs.diet !== 'vegetarian') {
    const current = DIET_FACTORS_PER_YEAR[inputs.diet];
    const target = DIET_FACTORS_PER_YEAR.vegetarian;
    const saving = Math.round(current - target);
    if (saving > 50) {
      insights.push({
        id: 'reduce-meat',
        category: 'food',
        title: 'Eat more plant-based meals',
        description:
          'Reducing red meat and dairy — even a few days a week — is one of the most effective individual changes for lowering food emissions.',
        potentialAnnualSavingKg: saving,
      });
    }
  }

  // --- Goods -------------------------------------------------------------
  if (inputs.shopping === 'high') {
    insights.push({
      id: 'buy-less',
      category: 'goods',
      title: 'Buy less, choose durable and second-hand',
      description:
        'Extending the life of clothes, electronics, and furniture — and buying second-hand — cuts the embodied emissions of everything you own.',
      potentialAnnualSavingKg: 700,
    });
  }

  return insights.sort(
    (a, b) => b.potentialAnnualSavingKg - a.potentialAnnualSavingKg,
  );
}
