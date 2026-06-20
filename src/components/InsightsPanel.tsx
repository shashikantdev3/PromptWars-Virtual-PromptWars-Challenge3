import type { Insight } from '../domain/types';
import { formatCo2 } from '../domain/format';

interface InsightsPanelProps {
  insights: Insight[];
}

/** Ranked list of personalized, quantified actions the user can take. */
export function InsightsPanel({ insights }: InsightsPanelProps) {
  const totalPotential = insights.reduce(
    (sum, i) => sum + i.potentialAnnualSavingKg,
    0,
  );

  return (
    <section className="card" aria-labelledby="insights-heading">
      <h2 id="insights-heading">Your personalized actions</h2>
      {insights.length === 0 ? (
        <p className="empty-state">
          Great news — we have no high-impact suggestions based on these inputs.
          Keep it up!
        </p>
      ) : (
        <>
          <p className="card__hint">
            Adopting all {insights.length} actions could avoid up to{' '}
            <strong>{formatCo2(totalPotential)}</strong> of CO₂e per year.
            Listed by impact.
          </p>
          <ol
            className="insight-list"
            aria-label="Recommended actions by impact"
          >
            {insights.map((insight) => (
              <li key={insight.id} className="insight">
                <div className="insight__head">
                  <h3 className="insight__title">{insight.title}</h3>
                  <span
                    className="insight__saving"
                    aria-label={`Saves up to ${formatCo2(insight.potentialAnnualSavingKg)} per year`}
                  >
                    −{formatCo2(insight.potentialAnnualSavingKg)}/yr
                  </span>
                </div>
                <p className="insight__desc">{insight.description}</p>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
