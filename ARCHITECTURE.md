# Architecture

CarbonWise is a small, single-page React application with a deliberately strict
separation between **pure domain logic** and the **presentation layer**. This
keeps the core calculations easy to reason about, exhaustively unit-testable,
and independent of React.

## Layers

```
┌─────────────────────────────────────────────────────────┐
│ Presentation (src/components, src/App.tsx)               │
│  - Accessible, focused React components                  │
│  - No business rules; only rendering + event wiring      │
├─────────────────────────────────────────────────────────┤
│ State (src/hooks)                                         │
│  - useFootprintHistory: localStorage-backed snapshots    │
├─────────────────────────────────────────────────────────┤
│ Domain (src/domain) — pure, framework-free               │
│  - emissionFactors.ts : documented constants + sources   │
│  - calculator.ts      : sanitize + compute breakdown     │
│  - insights.ts        : ranked, quantified suggestions   │
│  - storage.ts         : validated persistence helpers    │
│  - format.ts          : display formatting + comparisons │
│  - types.ts           : shared domain types              │
└─────────────────────────────────────────────────────────┘
```

## Key decisions

- **Pure domain functions.** Everything in `src/domain` is deterministic and
  side-effect-free (except `storage.ts`, which isolates all `localStorage`
  access). This is why the domain has ~100% test coverage.
- **Defensive inputs.** `sanitizeInputs` clamps and coerces every value before
  any arithmetic, so the UI can pass raw form data without risking `NaN`,
  `Infinity`, or negative results.
- **Validated persistence.** Saved records are structurally validated on read,
  so corrupted or tampered storage degrades gracefully to an empty history.
- **Data flow is one-directional.** `App` owns the current inputs, derives the
  breakdown and insights with `useMemo`, and passes them down as props.
- **Resilience.** An `ErrorBoundary` wraps the main content so a single failing
  widget cannot blank the whole page.
- **Performance.** The chart library is lazy-loaded via `React.lazy`, keeping
  the initial bundle small.

## Testing strategy

- Domain logic: unit tests covering known cases, boundary/hostile inputs, and
  invariants (totals are non-negative and finite).
- Components: render + interaction tests via Testing Library.
- Integration: an `App`-level test that drives a real user flow (live updates
  and saving a snapshot).
