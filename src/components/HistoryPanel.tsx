import type { FootprintRecord } from '../domain/types';
import { formatCo2 } from '../domain/format';

interface HistoryPanelProps {
  records: FootprintRecord[];
  onClear: () => void;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Shows saved snapshots over time so users can track their progress. */
export function HistoryPanel({ records, onClear }: HistoryPanelProps) {
  const ordered = [...records].reverse();
  const latest = ordered[0];
  const previous = ordered[1];

  const delta =
    latest && previous
      ? latest.breakdown.total - previous.breakdown.total
      : null;

  return (
    <section className="card" aria-labelledby="history-heading">
      <h2 id="history-heading">Your progress</h2>

      {records.length === 0 ? (
        <p className="empty-state">
          No saved snapshots yet. Use “Save this snapshot” to start tracking how
          your footprint changes over time.
        </p>
      ) : (
        <>
          {delta !== null ? (
            <p className="card__hint" role="status" aria-live="polite">
              {delta < 0
                ? `Down ${formatCo2(Math.abs(delta))} since your previous snapshot — nice progress!`
                : delta > 0
                  ? `Up ${formatCo2(delta)} since your previous snapshot.`
                  : 'No change since your previous snapshot.'}
            </p>
          ) : null}

          <ul className="history-list">
            {ordered.map((record) => (
              <li key={record.id} className="history-item">
                <span className="history-item__date">
                  {formatDate(record.createdAt)}
                </span>
                <span>{formatCo2(record.breakdown.total)} / yr</span>
              </li>
            ))}
          </ul>

          <div className="btn-row" style={{ marginTop: '1rem' }}>
            <button type="button" className="btn btn--ghost" onClick={onClear}>
              Clear history
            </button>
          </div>
        </>
      )}
    </section>
  );
}
