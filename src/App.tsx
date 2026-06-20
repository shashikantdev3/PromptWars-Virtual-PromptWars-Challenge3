import { Suspense, lazy, useMemo, useState } from 'react';
import { CalculatorForm } from './components/CalculatorForm';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HistoryPanel } from './components/HistoryPanel';
import { InsightsPanel } from './components/InsightsPanel';
import { ResultSummary } from './components/ResultSummary';
import { DEFAULT_INPUTS, calculateFootprint } from './domain/calculator';
import { generateInsights } from './domain/insights';
import type { FootprintInputs } from './domain/types';
import { useFootprintHistory } from './hooks/useFootprintHistory';

// The chart pulls in a relatively large library, so it is code-split and
// loaded on demand to keep the initial JavaScript payload small.
const BreakdownChart = lazy(() => import('./components/BreakdownChart'));

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
        <ErrorBoundary>
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

            <div className="grid grid--two grid--stacked">
              <InsightsPanel insights={insights} />
              <HistoryPanel records={records} onClear={clear} />
            </div>
          </div>
        </ErrorBoundary>
      </main>

      <Footer />
    </div>
  );
}
