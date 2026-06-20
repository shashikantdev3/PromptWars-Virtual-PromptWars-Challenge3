import type { CarFuel, DietType, ShoppingLevel } from './types';

/**
 * Emission factors used by the calculator.
 *
 * These are transparent, documented approximations drawn from widely cited
 * public sources. They are deliberately conservative, round figures intended
 * for personal awareness — not a certified greenhouse-gas audit.
 *
 * Primary sources:
 *  - UK DESNZ / DEFRA "Greenhouse gas reporting: conversion factors" (2023)
 *  - US EPA "Greenhouse Gas Equivalencies" references
 *  - IEA grid electricity intensity (global average ~0.4–0.48 kg CO2e/kWh)
 *  - Our World in Data, "Food: greenhouse gas emissions across the supply chain"
 *  - Poore & Nemecek (2018), Science, dietary footprint estimates
 *
 * All values are kg CO2e unless noted.
 */

/** Per-kilometre factors for road and rail transport (kg CO2e / km). */
export const TRANSPORT_FACTORS_PER_KM: Record<CarFuel, number> = {
  petrol: 0.192,
  diesel: 0.171,
  hybrid: 0.12,
  electric: 0.05,
  none: 0,
};

export const BUS_FACTOR_PER_KM = 0.105;
export const TRAIN_FACTOR_PER_KM = 0.041;

/**
 * Per-flight factors (kg CO2e for one return trip, economy class).
 * Includes a radiative-forcing uplift consistent with common methodologies.
 */
export const SHORT_HAUL_FLIGHT_KG = 500;
export const LONG_HAUL_FLIGHT_KG = 1800;

/** Electricity grid intensity (kg CO2e / kWh), global average. */
export const ELECTRICITY_FACTOR_PER_KWH = 0.42;

/** Natural gas combustion intensity (kg CO2e / kWh of gas). */
export const GAS_FACTOR_PER_KWH = 0.183;

/** Annual dietary footprint by pattern (kg CO2e / year / person). */
export const DIET_FACTORS_PER_YEAR: Record<DietType, number> = {
  meatHeavy: 3300,
  average: 2500,
  lowMeat: 1900,
  pescatarian: 1700,
  vegetarian: 1500,
  vegan: 1100,
};

/** Annual consumption ("goods & services") footprint (kg CO2e / year). */
export const SHOPPING_FACTORS_PER_YEAR: Record<ShoppingLevel, number> = {
  low: 800,
  average: 1500,
  high: 2800,
};

export const WEEKS_PER_YEAR = 52;
export const MONTHS_PER_YEAR = 12;

/**
 * Reference annual footprints for context (kg CO2e / year / person).
 * Source: Our World in Data per-capita consumption-based emissions and the
 * widely cited ~2 t target compatible with the Paris Agreement.
 */
export const REFERENCE_FOOTPRINTS = {
  /** Global average per-capita emissions. */
  globalAverage: 4700,
  /** Representative high-income-country average. */
  highIncomeAverage: 10000,
  /** Per-capita level broadly compatible with 1.5°C by ~2030. */
  parisTarget: 2300,
} as const;

/**
 * A relatable real-world comparison: kg CO2e absorbed by one mature tree
 * per year. Source: commonly cited US EPA / forestry estimate (~21 kg/yr).
 */
export const KG_CO2_PER_TREE_YEAR = 21;
