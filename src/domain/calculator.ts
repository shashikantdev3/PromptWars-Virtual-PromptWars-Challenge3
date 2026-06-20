import {
  BUS_FACTOR_PER_KM,
  DIET_FACTORS_PER_YEAR,
  ELECTRICITY_FACTOR_PER_KWH,
  GAS_FACTOR_PER_KWH,
  KG_CO2_PER_TREE_YEAR,
  LONG_HAUL_FLIGHT_KG,
  MONTHS_PER_YEAR,
  SHORT_HAUL_FLIGHT_KG,
  SHOPPING_FACTORS_PER_YEAR,
  TRAIN_FACTOR_PER_KM,
  TRANSPORT_FACTORS_PER_KM,
  WEEKS_PER_YEAR,
} from './emissionFactors';
import type { FootprintBreakdown, FootprintInputs } from './types';

/** Sensible defaults representing a typical user starting point. */
export const DEFAULT_INPUTS: FootprintInputs = {
  carKmPerWeek: 150,
  carFuel: 'petrol',
  busKmPerWeek: 20,
  trainKmPerWeek: 20,
  shortFlightsPerYear: 1,
  longFlightsPerYear: 0,
  electricityKwhPerMonth: 300,
  gasKwhPerMonth: 400,
  householdSize: 2,
  renewableShare: 0.2,
  diet: 'average',
  shopping: 'average',
};

/**
 * Clamp a number into [min, max], coercing non-finite values to `min`.
 * Guards calculations against NaN / Infinity / malicious input.
 */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/** Normalise raw inputs into safe ranges before any maths is applied. */
export function sanitizeInputs(inputs: FootprintInputs): FootprintInputs {
  return {
    carKmPerWeek: clamp(inputs.carKmPerWeek, 0, 10_000),
    carFuel: inputs.carFuel,
    busKmPerWeek: clamp(inputs.busKmPerWeek, 0, 10_000),
    trainKmPerWeek: clamp(inputs.trainKmPerWeek, 0, 10_000),
    shortFlightsPerYear: clamp(inputs.shortFlightsPerYear, 0, 200),
    longFlightsPerYear: clamp(inputs.longFlightsPerYear, 0, 200),
    electricityKwhPerMonth: clamp(inputs.electricityKwhPerMonth, 0, 100_000),
    gasKwhPerMonth: clamp(inputs.gasKwhPerMonth, 0, 100_000),
    householdSize: clamp(Math.round(inputs.householdSize), 1, 20),
    renewableShare: clamp(inputs.renewableShare, 0, 1),
    diet: inputs.diet,
    shopping: inputs.shopping,
  };
}

function round(value: number): number {
  return Math.round(value);
}

/** Annual transport emissions from road and rail (kg CO2e). */
export function calcTransport(inputs: FootprintInputs): number {
  const car =
    inputs.carKmPerWeek *
    WEEKS_PER_YEAR *
    TRANSPORT_FACTORS_PER_KM[inputs.carFuel];
  const bus = inputs.busKmPerWeek * WEEKS_PER_YEAR * BUS_FACTOR_PER_KM;
  const train = inputs.trainKmPerWeek * WEEKS_PER_YEAR * TRAIN_FACTOR_PER_KM;
  return round(car + bus + train);
}

/** Annual aviation emissions (kg CO2e). */
export function calcFlights(inputs: FootprintInputs): number {
  return round(
    inputs.shortFlightsPerYear * SHORT_HAUL_FLIGHT_KG +
      inputs.longFlightsPerYear * LONG_HAUL_FLIGHT_KG,
  );
}

/**
 * Annual home-energy emissions allocated to this person (kg CO2e).
 * Energy bills are shared across the household, so the total is divided by
 * household size. Renewable electricity reduces the electricity component.
 */
export function calcHome(inputs: FootprintInputs): number {
  const electricity =
    inputs.electricityKwhPerMonth *
    MONTHS_PER_YEAR *
    ELECTRICITY_FACTOR_PER_KWH *
    (1 - inputs.renewableShare);
  const gas = inputs.gasKwhPerMonth * MONTHS_PER_YEAR * GAS_FACTOR_PER_KWH;
  const householdTotal = electricity + gas;
  return round(householdTotal / Math.max(1, inputs.householdSize));
}

/** Annual dietary emissions (kg CO2e). */
export function calcFood(inputs: FootprintInputs): number {
  return round(DIET_FACTORS_PER_YEAR[inputs.diet]);
}

/** Annual goods & services emissions (kg CO2e). */
export function calcGoods(inputs: FootprintInputs): number {
  return round(SHOPPING_FACTORS_PER_YEAR[inputs.shopping]);
}

/**
 * Compute the full annual footprint breakdown from raw inputs.
 * Inputs are sanitized first, so this is safe to call with any data.
 */
export function calculateFootprint(raw: FootprintInputs): FootprintBreakdown {
  const inputs = sanitizeInputs(raw);
  const transport = calcTransport(inputs);
  const flights = calcFlights(inputs);
  const home = calcHome(inputs);
  const food = calcFood(inputs);
  const goods = calcGoods(inputs);
  return {
    transport,
    flights,
    home,
    food,
    goods,
    total: transport + flights + home + food + goods,
  };
}

/** Convert an annual footprint (kg) into equivalent mature trees needed. */
export function treesEquivalent(annualKg: number): number {
  return Math.max(0, Math.round(annualKg / KG_CO2_PER_TREE_YEAR));
}
