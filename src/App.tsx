import { Suspense, lazy, useMemo, useState } from 'react';
import { Header } from './components/Header';
const BreakdownChart = lazy(() => import('./components/BreakdownChart'));
import { Footer } from './components/Footer';
import { CalculatorForm } from './components/CalculatorForm';
import { ResultSummary } from './components/ResultSummary';
import { InsightsPanel } from './components/InsightsPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { DEFAULT_INPUTS, calculateFootprint } from './domain/calculator';
import { generateInsights } from './domain/insights';
import { useFootprintHistory } from './hooks/useFootprintHistory';
import type { FootprintInputs } from './domain/types';

/**
 * Root application. Holds the current calculator inputs, derives the footprint
 * breakdown and insights, and coordinates the saved-history feature.
 */
export default function App() {
  const [inputs, setInputs] = useState<FootprintInputs>(DEFAULT_INPUTS);
  const { records, save, clear } = useFootprintHistory();

  // Derived values are memoized so they only recompute when inputs change.
  const breakdown = useMemo(() => calculateFootprint(inputs), [inputs]);
  const insights = useMemo(() => generateInsights(inputs), [inputs]);

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Header />

      <main id="main-content" tabIndex={-1}>
        <div className="container">
          <div className="grid grid--two">
            <CalculatorForm
              initialInputs={DEFAULT_INPUTS}
              onChange={setInputs}
              onSave={save}
            />

            <div className="grid">
              <ResultSummary breakdown={breakdown} />
              <Suspense
                fallback={
                  <div className="card" aria-busy="true">
                    Loading breakdown…
                  </div>
                }
              >
                <BreakdownChart breakdown={breakdown} />
              </Suspense>
            </div>
          </div>

          <div className="grid grid--two" style={{ marginTop: '1.25rem' }}>
            <InsightsPanel insights={insights} />
            <HistoryPanel records={records} onClear={clear} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
