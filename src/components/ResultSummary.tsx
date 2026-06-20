import type { FootprintBreakdown } from '../domain/types';
import { treesEquivalent } from '../domain/calculator';
import { compareFootprint, formatCo2 } from '../domain/format';
import { REFERENCE_FOOTPRINTS } from '../domain/emissionFactors';

interface ResultSummaryProps {
  breakdown: FootprintBreakdown;
}

/** Headline result: total footprint, rating, and relatable comparisons. */
export function ResultSummary({ breakdown }: ResultSummaryProps) {
  const comparison = compareFootprint(breakdown.total);
  const trees = treesEquivalent(breakdown.total);
  const vsGlobal = Math.round(comparison.vsGlobalAverage * 100);

  return (
    <section className="card" aria-labelledby="result-heading">
      <h2 id="result-heading">Your estimated annual footprint</h2>

      <div className="result-total">
        <div>
          <span
            className="result-total__value"
            aria-label={`${formatCo2(breakdown.total)} of carbon dioxide equivalent per year`}
          >
            {formatCo2(breakdown.total)}
          </span>{' '}
          <span className="result-total__unit">CO₂e / year</span>
        </div>
        <span className={`badge badge--${comparison.rating}`}>
          {comparison.rating}
        </span>
        <p className="rating-label">{comparison.label}</p>
      </div>

      <div className="stat-row" role="list">
        <div className="stat" role="listitem">
          <div className="stat__num">{vsGlobal}%</div>
          <div className="stat__label">of the global average</div>
        </div>
        <div className="stat" role="listitem">
          <div className="stat__num">{trees}</div>
          <div className="stat__label">trees / year to offset</div>
        </div>
        <div className="stat" role="listitem">
          <div className="stat__num">
            {formatCo2(REFERENCE_FOOTPRINTS.parisTarget)}
          </div>
          <div className="stat__label">Paris-aligned target</div>
        </div>
      </div>
    </section>
  );
}
