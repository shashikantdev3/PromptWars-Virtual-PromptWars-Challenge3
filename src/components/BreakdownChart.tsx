import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { FootprintBreakdown } from '../domain/types';
import { formatCo2 } from '../domain/format';
import { CATEGORY_HEX, CATEGORY_META } from './categoryMeta';

interface BreakdownChartProps {
  breakdown: FootprintBreakdown;
}

/**
 * Visualises the footprint breakdown as a donut chart, paired with an
 * accessible data table. The chart is hidden from assistive tech (it is a
 * visual aid); the table is the screen-reader-friendly source of truth.
 */
function BreakdownChart({ breakdown }: BreakdownChartProps) {
  const data = CATEGORY_META.map((meta) => ({
    key: meta.key,
    name: meta.label,
    value: breakdown[meta.key],
    color: CATEGORY_HEX[meta.key],
  }));

  const total = breakdown.total;
  const hasData = total > 0;

  return (
    <section className="card" aria-labelledby="breakdown-heading">
      <h2 id="breakdown-heading">Where it comes from</h2>

      {hasData ? (
        <div className="chart-wrap" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="55%"
                outerRadius="85%"
                paddingAngle={2}
                isAnimationActive={false}
              >
                {data.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCo2(value),
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="empty-state">
          Enter your details to see a breakdown by category.
        </p>
      )}

      <table className="breakdown">
        <caption>Annual emissions by category (CO₂e).</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Emissions</th>
            <th scope="col">Share</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const share = total > 0 ? Math.round((row.value / total) * 100) : 0;
            return (
              <tr key={row.key}>
                <th scope="row">
                  <span
                    className="swatch"
                    style={{ background: row.color }}
                    aria-hidden="true"
                  />
                  {row.name}
                </th>
                <td>{formatCo2(row.value)}</td>
                <td>{share}%</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Total</th>
            <td>{formatCo2(total)}</td>
            <td>100%</td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
}

export default BreakdownChart;
