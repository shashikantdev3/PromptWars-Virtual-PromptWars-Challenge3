import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App integration', () => {
  it('renders the core sections', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /estimate your footprint/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /personalized actions/i }),
    ).toBeInTheDocument();
  });

  it('provides a skip link to main content', () => {
    render(<App />);
    expect(
      screen.getByRole('link', { name: /skip to main content/i }),
    ).toBeInTheDocument();
  });

  it('updates results live when an input changes', async () => {
    const user = userEvent.setup();
    render(<App />);

    const result = screen.getByRole('region', {
      name: /annual footprint/i,
    });
    const before = result.textContent;

    // Switching to vegan should lower the food component and the total.
    await user.selectOptions(screen.getByLabelText(/typical diet/i), 'vegan');

    expect(result.textContent).not.toBe(before);
  });

  it('saves a snapshot into the progress panel', async () => {
    const user = userEvent.setup();
    render(<App />);

    const progress = screen.getByRole('region', { name: /your progress/i });
    expect(
      within(progress).getByText(/no saved snapshots/i),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /save this snapshot/i }),
    );

    expect(
      within(progress).queryByText(/no saved snapshots/i),
    ).not.toBeInTheDocument();
    expect(within(progress).getByText(/\/ yr/i)).toBeInTheDocument();
  });
});
