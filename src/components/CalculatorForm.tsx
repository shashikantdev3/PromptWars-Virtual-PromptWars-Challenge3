import { useState } from 'react';
import type {
  CarFuel,
  DietType,
  FootprintInputs,
  ShoppingLevel,
} from '../domain/types';
import { DEFAULT_INPUTS } from '../domain/calculator';
import { formatPercent } from '../domain/format';
import { NumberField, RangeField, SelectField } from './fields';

const FUEL_OPTIONS: ReadonlyArray<{ value: CarFuel; label: string }> = [
  { value: 'none', label: 'No car / I do not drive' },
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'electric', label: 'Electric' },
];

const DIET_OPTIONS: ReadonlyArray<{ value: DietType; label: string }> = [
  { value: 'meatHeavy', label: 'Meat with every meal' },
  { value: 'average', label: 'Average mixed diet' },
  { value: 'lowMeat', label: 'Low meat' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
];

const SHOPPING_OPTIONS: ReadonlyArray<{ value: ShoppingLevel; label: string }> =
  [
    { value: 'low', label: 'Minimal — buy little, mostly second-hand' },
    { value: 'average', label: 'Average consumer' },
    { value: 'high', label: 'Frequent — lots of new goods' },
  ];

interface CalculatorFormProps {
  initialInputs?: FootprintInputs;
  /** Called on every change so results can update live. */
  onChange: (inputs: FootprintInputs) => void;
  /** Called when the user explicitly saves a snapshot. */
  onSave: (inputs: FootprintInputs) => void;
}

/**
 * Controlled, fully accessible form that collects the data needed to estimate
 * a personal carbon footprint. Results update live as values change.
 */
export function CalculatorForm({
  initialInputs = DEFAULT_INPUTS,
  onChange,
  onSave,
}: CalculatorFormProps) {
  const [inputs, setInputs] = useState<FootprintInputs>(initialInputs);

  function update<K extends keyof FootprintInputs>(
    key: K,
    value: FootprintInputs[K],
  ) {
    setInputs((prev) => {
      const next = { ...prev, [key]: value };
      onChange(next);
      return next;
    });
  }

  function handleReset() {
    setInputs(DEFAULT_INPUTS);
    onChange(DEFAULT_INPUTS);
  }

  return (
    <form
      className="card"
      aria-labelledby="calc-heading"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(inputs);
      }}
    >
      <h2 id="calc-heading">Estimate your footprint</h2>
      <p className="card__hint">
        Adjust the values to match your lifestyle. Results update as you type.
      </p>

      <fieldset>
        <legend>Travel</legend>
        <NumberField
          label="Car distance"
          unit="km / week"
          value={inputs.carKmPerWeek}
          min={0}
          max={10000}
          onChange={(v) => update('carKmPerWeek', v)}
        />
        <SelectField
          label="Car fuel type"
          value={inputs.carFuel}
          options={FUEL_OPTIONS}
          onChange={(v) => update('carFuel', v)}
        />
        <NumberField
          label="Bus / coach distance"
          unit="km / week"
          value={inputs.busKmPerWeek}
          min={0}
          max={10000}
          onChange={(v) => update('busKmPerWeek', v)}
        />
        <NumberField
          label="Train / metro distance"
          unit="km / week"
          value={inputs.trainKmPerWeek}
          min={0}
          max={10000}
          onChange={(v) => update('trainKmPerWeek', v)}
        />
        <NumberField
          label="Short-haul return flights"
          unit="per year"
          help="Trips under ~1,500 km each way."
          value={inputs.shortFlightsPerYear}
          min={0}
          max={200}
          onChange={(v) => update('shortFlightsPerYear', v)}
        />
        <NumberField
          label="Long-haul return flights"
          unit="per year"
          help="Trips over ~1,500 km each way."
          value={inputs.longFlightsPerYear}
          min={0}
          max={200}
          onChange={(v) => update('longFlightsPerYear', v)}
        />
      </fieldset>

      <fieldset>
        <legend>Home energy</legend>
        <NumberField
          label="Electricity use"
          unit="kWh / month"
          value={inputs.electricityKwhPerMonth}
          min={0}
          max={100000}
          onChange={(v) => update('electricityKwhPerMonth', v)}
        />
        <NumberField
          label="Natural gas use"
          unit="kWh / month"
          help="Enter 0 if you do not use gas."
          value={inputs.gasKwhPerMonth}
          min={0}
          max={100000}
          onChange={(v) => update('gasKwhPerMonth', v)}
        />
        <NumberField
          label="People sharing the household"
          value={inputs.householdSize}
          min={1}
          max={20}
          onChange={(v) => update('householdSize', v)}
        />
        <RangeField
          label="Share of renewable electricity"
          value={Math.round(inputs.renewableShare * 100)}
          min={0}
          max={100}
          step={5}
          format={(v) => formatPercent(v / 100)}
          help="From a green tariff or your own solar."
          onChange={(v) => update('renewableShare', v / 100)}
        />
      </fieldset>

      <fieldset>
        <legend>Lifestyle</legend>
        <SelectField
          label="Typical diet"
          value={inputs.diet}
          options={DIET_OPTIONS}
          onChange={(v) => update('diet', v)}
        />
        <SelectField
          label="Shopping & consumption"
          value={inputs.shopping}
          options={SHOPPING_OPTIONS}
          onChange={(v) => update('shopping', v)}
        />
      </fieldset>

      <div className="btn-row">
        <button type="submit" className="btn btn--primary">
          Save this snapshot
        </button>
        <button type="button" className="btn btn--ghost" onClick={handleReset}>
          Reset to defaults
        </button>
      </div>
    </form>
  );
}
