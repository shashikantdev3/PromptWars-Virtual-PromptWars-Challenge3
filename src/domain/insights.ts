import { sanitizeInputs } from './calculator';
import {
  DIET_FACTORS_PER_YEAR,
  ELECTRICITY_FACTOR_PER_KWH,
  MONTHS_PER_YEAR,
  SHORT_HAUL_FLIGHT_KG,
  TRAIN_FACTOR_PER_KM,
  TRANSPORT_FACTORS_PER_KM,
  WEEKS_PER_YEAR,
} from './emissionFactors';
import type {
  FootprintBreakdown,
  FootprintCategory,
  FootprintInputs,
  Insight,
} from './types';

/**
 * Tunable thresholds and assumptions for the insight engine. Centralising them
 * as named constants keeps the rules readable and avoids magic numbers.
 */
const RULES = {
  /** Minimum annual saving (kg CO2e) for a suggestion to be worth showing. */
  minSavingKg: {
    switchToEv: 50,
    shiftToTransit: 30,
    greenElectricity: 40,
    energyEfficiency: 20,
    reduceMeat: 50,
  },
  /** Weekly car distance (km) above which transit-shift advice is relevant. */
  transitCarKmThreshold: 30,
  /** Share of car distance assumed shifted to rail/cycling. */
  carToTransitShift: 0.25,
  /** Renewable share above which a green-tariff switch adds little. */
  renewableNearFull: 0.9,
  /** Monthly electricity (kWh) above which efficiency advice is relevant. */
  highElectricityKwh: 150,
  /** Fraction of electricity efficiency measures conservatively save. */
  electricityEfficiencySaving: 0.1,
  /** Flat annual saving (kg CO2e) attributed to consuming less. */
  buyLessSavingKg: 700,
} as const;

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

/** A single rule: given sanitized inputs, return an insight or `null`. */
type InsightRule = (inputs: FootprintInputs) => Insight | null;

function evSwitchRule(inputs: FootprintInputs): Insight | null {
  if (inputs.carFuel !== 'petrol' && inputs.carFuel !== 'diesel') return null;
  const annualCarKm = inputs.carKmPerWeek * WEEKS_PER_YEAR;
  const current = annualCarKm * TRANSPORT_FACTORS_PER_KM[inputs.carFuel];
  const electric = annualCarKm * TRANSPORT_FACTORS_PER_KM.electric;
  const saving = Math.round(current - electric);
  if (saving <= RULES.minSavingKg.switchToEv) return null;
  return {
    id: 'switch-to-ev',
    category: 'transport',
    title: 'Switch your car to electric',
    description:
      'Replacing your petrol/diesel car with an electric vehicle charged on a typical grid would cut most of your driving emissions.',
    potentialAnnualSavingKg: saving,
  };
}

function transitShiftRule(inputs: FootprintInputs): Insight | null {
  if (inputs.carKmPerWeek < RULES.transitCarKmThreshold) return null;
  const shiftedKm =
    inputs.carKmPerWeek * RULES.carToTransitShift * WEEKS_PER_YEAR;
  const perKmSaving =
    TRANSPORT_FACTORS_PER_KM[inputs.carFuel] - TRAIN_FACTOR_PER_KM;
  const saving = Math.round(shiftedKm * perKmSaving);
  if (saving <= RULES.minSavingKg.shiftToTransit) return null;
  return {
    id: 'shift-car-to-transit',
    category: 'transport',
    title: 'Replace some car trips with rail or cycling',
    description:
      'Shifting roughly a quarter of your weekly car distance to train, cycling, or walking meaningfully lowers transport emissions and often saves money.',
    potentialAnnualSavingKg: saving,
  };
}

function shortFlightRule(inputs: FootprintInputs): Insight | null {
  if (inputs.shortFlightsPerYear < 1) return null;
  const saving = Math.round(inputs.shortFlightsPerYear * SHORT_HAUL_FLIGHT_KG);
  return {
    id: 'replace-short-flight',
    category: 'flights',
    title: 'Swap a short-haul flight for rail',
    description:
      'Short-haul flights are carbon-intensive per trip. Replacing them with rail where feasible avoids a large, concentrated chunk of emissions.',
    potentialAnnualSavingKg: saving,
  };
}

function greenElectricityRule(inputs: FootprintInputs): Insight | null {
  if (
    inputs.renewableShare >= RULES.renewableNearFull ||
    inputs.electricityKwhPerMonth <= 0
  ) {
    return null;
  }
  const annualKwh = inputs.electricityKwhPerMonth * MONTHS_PER_YEAR;
  const remainingFossil = 1 - inputs.renewableShare;
  const saving = Math.round(
    (annualKwh * ELECTRICITY_FACTOR_PER_KWH * remainingFossil) /
      Math.max(1, inputs.householdSize),
  );
  if (saving <= RULES.minSavingKg.greenElectricity) return null;
  return {
    id: 'green-electricity',
    category: 'home',
    title: 'Switch to a renewable electricity tariff',
    description:
      'Moving your remaining electricity to a certified renewable tariff (or adding rooftop solar) can eliminate most of your electricity emissions.',
    potentialAnnualSavingKg: saving,
  };
}

function energyEfficiencyRule(inputs: FootprintInputs): Insight | null {
  if (inputs.electricityKwhPerMonth <= RULES.highElectricityKwh) return null;
  const annualKwh = inputs.electricityKwhPerMonth * MONTHS_PER_YEAR;
  const saving = Math.round(
    (annualKwh *
      ELECTRICITY_FACTOR_PER_KWH *
      RULES.electricityEfficiencySaving) /
      Math.max(1, inputs.householdSize),
  );
  if (saving <= RULES.minSavingKg.energyEfficiency) return null;
  return {
    id: 'energy-efficiency',
    category: 'home',
    title: 'Cut standby and lighting energy',
    description:
      'LED lighting, switching off standby loads, and a slightly lower thermostat typically trim about 10% off household electricity use.',
    potentialAnnualSavingKg: saving,
  };
}

function reduceMeatRule(inputs: FootprintInputs): Insight | null {
  if (inputs.diet === 'vegan' || inputs.diet === 'vegetarian') return null;
  const saving = Math.round(
    DIET_FACTORS_PER_YEAR[inputs.diet] - DIET_FACTORS_PER_YEAR.vegetarian,
  );
  if (saving <= RULES.minSavingKg.reduceMeat) return null;
  return {
    id: 'reduce-meat',
    category: 'food',
    title: 'Eat more plant-based meals',
    description:
      'Reducing red meat and dairy — even a few days a week — is one of the most effective individual changes for lowering food emissions.',
    potentialAnnualSavingKg: saving,
  };
}

function buyLessRule(inputs: FootprintInputs): Insight | null {
  if (inputs.shopping !== 'high') return null;
  return {
    id: 'buy-less',
    category: 'goods',
    title: 'Buy less, choose durable and second-hand',
    description:
      'Extending the life of clothes, electronics, and furniture — and buying second-hand — cuts the embodied emissions of everything you own.',
    potentialAnnualSavingKg: RULES.buyLessSavingKg,
  };
}

/** All insight rules, evaluated independently for each footprint. */
const INSIGHT_RULES: readonly InsightRule[] = [
  evSwitchRule,
  transitShiftRule,
  shortFlightRule,
  greenElectricityRule,
  energyEfficiencyRule,
  reduceMeatRule,
  buyLessRule,
];

/**
 * Generate personalized, actionable insights ranked by estimated impact.
 *
 * Each insight quantifies the annual CO2e a user could avoid, so the UI can
 * show the highest-leverage actions first. Pure and deterministic: it runs
 * every rule against sanitized inputs, drops the ones that do not apply, and
 * sorts the rest by potential saving.
 */
export function generateInsights(rawInputs: FootprintInputs): Insight[] {
  const inputs = sanitizeInputs(rawInputs);
  return INSIGHT_RULES.map((rule) => rule(inputs))
    .filter((insight): insight is Insight => insight !== null)
    .sort((a, b) => b.potentialAnnualSavingKg - a.potentialAnnualSavingKg);
}
