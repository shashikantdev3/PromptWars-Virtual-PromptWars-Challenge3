import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultSummary } from './ResultSummary';
import type { FootprintBreakdown } from '../domain/types';

const breakdown: FootprintBreakdown = {
  transport: 1000,
  flights: 500,
  home: 800,
  food: 2500,
  goods: 1500,
  total: 6300,
};

describe('ResultSummary', () => {
  it('renders the total footprint and a heading', () => {
    render(<ResultSummary breakdown={breakdown} />);
    expect(
      screen.getByRole('heading', { name: /annual footprint/i }),
    ).toBeInTheDocument();
    // 6300 kg -> "6.3 t"
    expect(screen.getByText('6.3 t')).toBeInTheDocument();
  });

  it('shows the comparison stats list', () => {
    render(<ResultSummary breakdown={breakdown} />);
    expect(screen.getByText(/global average/i)).toBeInTheDocument();
    expect(screen.getByText(/trees \/ year/i)).toBeInTheDocument();
  });
});
