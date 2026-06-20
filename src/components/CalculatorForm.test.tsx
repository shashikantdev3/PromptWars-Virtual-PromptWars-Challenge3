import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalculatorForm } from './CalculatorForm';

describe('CalculatorForm', () => {
  it('renders grouped, labelled fields', () => {
    render(<CalculatorForm onChange={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getByRole('group', { name: /travel/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/car distance/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/typical diet/i)).toBeInTheDocument();
  });

  it('emits changes as the user edits inputs', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<CalculatorForm onChange={onChange} onSave={vi.fn()} />);

    const diet = screen.getByLabelText(/typical diet/i);
    await user.selectOptions(diet, 'vegan');

    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1)?.[0];
    expect(last.diet).toBe('vegan');
  });

  it('saves a snapshot when the form is submitted', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<CalculatorForm onChange={vi.fn()} onSave={onSave} />);

    await user.click(
      screen.getByRole('button', { name: /save this snapshot/i }),
    );
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('resets to defaults', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<CalculatorForm onChange={onChange} onSave={vi.fn()} />);

    await user.click(
      screen.getByRole('button', { name: /reset to defaults/i }),
    );
    const last = onChange.mock.calls.at(-1)?.[0];
    expect(last.diet).toBe('average');
  });
});
