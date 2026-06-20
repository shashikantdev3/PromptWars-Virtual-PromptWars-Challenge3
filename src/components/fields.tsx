import { useId } from 'react';

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  help?: string;
}

/** Accessible numeric input with label, help text, and range validation. */
export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 1_000_000,
  step = 1,
  unit,
  help,
}: NumberFieldProps) {
  const id = useId();
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const invalid = value < min || value > max || Number.isNaN(value);

  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {unit ? ` (${unit})` : ''}
        {help ? <span className="field__help">{help}</span> : null}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        value={Number.isNaN(value) ? '' : value}
        min={min}
        max={max}
        step={step}
        aria-invalid={invalid}
        aria-describedby={`${help ? helpId : ''} ${invalid ? errorId : ''}`.trim()}
        onChange={(e) => onChange(e.target.valueAsNumber)}
      />
      {invalid ? (
        <p id={errorId} className="field__error" role="alert">
          Enter a value between {min} and {max}.
        </p>
      ) : null}
    </div>
  );
}

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: ReadonlyArray<SelectOption<T>>;
  onChange: (value: T) => void;
  help?: string;
}

/** Accessible select with associated label and optional help text. */
export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  help,
}: SelectFieldProps<T>) {
  const id = useId();
  const helpId = `${id}-help`;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {help ? <span className="field__help">{help}</span> : null}
      </label>
      <select
        id={id}
        value={value}
        aria-describedby={help ? helpId : undefined}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface RangeFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Render the current value (e.g. as a percentage). */
  format?: (value: number) => string;
  help?: string;
}

/** Accessible range slider with a live-updating value readout. */
export function RangeField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  format = (v) => String(v),
  help,
}: RangeFieldProps) {
  const id = useId();
  const helpId = `${id}-help`;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {help ? <span className="field__help">{help}</span> : null}
      </label>
      <div className="range-row">
        <input
          id={id}
          type="range"
          value={value}
          min={min}
          max={max}
          step={step}
          aria-describedby={help ? helpId : undefined}
          aria-valuetext={format(value)}
          onChange={(e) => onChange(e.target.valueAsNumber)}
        />
        <output htmlFor={id}>{format(value)}</output>
      </div>
    </div>
  );
}
