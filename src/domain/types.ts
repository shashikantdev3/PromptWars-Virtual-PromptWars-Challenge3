/**
 * Core domain types for CarbonWise.
 *
 * All carbon values are expressed in kilograms of CO2-equivalent (kg CO2e)
 * unless a name explicitly states another unit.
 */

export type CarFuel = 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'none';

export type DietType =
  | 'meatHeavy'
  | 'average'
  | 'lowMeat'
  | 'pescatarian'
  | 'vegetarian'
  | 'vegan';

export type ShoppingLevel = 'low' | 'average' | 'high';

/** Raw, user-supplied inputs collected by the calculator form. */
export interface FootprintInputs {
  /** Kilometres driven by car per week. */
  carKmPerWeek: number;
  /** Fuel type of the primary car. */
  carFuel: CarFuel;
  /** Kilometres travelled by bus/coach per week. */
  busKmPerWeek: number;
  /** Kilometres travelled by train/metro per week. */
  trainKmPerWeek: number;
  /** Number of short-haul return flights per year (< ~1500 km each way). */
  shortFlightsPerYear: number;
  /** Number of long-haul return flights per year (> ~1500 km each way). */
  longFlightsPerYear: number;
  /** Household electricity use in kWh per month. */
  electricityKwhPerMonth: number;
  /** Household natural gas use in kWh per month (0 if none). */
  gasKwhPerMonth: number;
  /** Number of people sharing the household's energy bills. */
  householdSize: number;
  /** Share of electricity from renewable sources, 0–1. */
  renewableShare: number;
  /** Dietary pattern. */
  diet: DietType;
  /** General consumption / shopping intensity. */
  shopping: ShoppingLevel;
}

export type FootprintCategory =
  | 'transport'
  | 'flights'
  | 'home'
  | 'food'
  | 'goods';

/** Per-category and total annual emissions in kg CO2e. */
export interface FootprintBreakdown {
  transport: number;
  flights: number;
  home: number;
  food: number;
  goods: number;
  total: number;
}

/** A single saved snapshot of a user's footprint over time. */
export interface FootprintRecord {
  /** Stable unique id. */
  id: string;
  /** ISO-8601 timestamp of when the record was saved. */
  createdAt: string;
  inputs: FootprintInputs;
  breakdown: FootprintBreakdown;
}

/** An actionable recommendation generated from a footprint. */
export interface Insight {
  id: string;
  category: FootprintCategory;
  title: string;
  description: string;
  /** Estimated annual saving in kg CO2e if the user adopts the action. */
  potentialAnnualSavingKg: number;
}
