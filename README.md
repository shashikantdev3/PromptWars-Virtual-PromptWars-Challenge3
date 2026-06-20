# 🌱 CarbonWise

**Understand, track, and reduce your personal carbon footprint — through simple actions and personalized insights.**

CarbonWise is a fast, private, accessible web app that turns everyday lifestyle
inputs (travel, home energy, diet, and consumption) into a clear annual
CO₂e estimate, an at-a-glance breakdown, ranked actions quantified by their
potential savings, and a progress tracker over time.

Built for **PromptWars Virtual — Challenge 3: Carbon Footprint Awareness
Platform**.

> _Problem statement:_ Design a solution that helps individuals understand,
> track, and reduce their carbon footprint through simple actions and
> personalized insights.

---

## ✨ Features

- **Transparent calculator** — estimate an annual footprint from travel, home
  energy, diet, and shopping, with results that update live as you type.
- **Clear breakdown** — a donut chart plus an accessible data table show
  exactly where your emissions come from and each category's share.
- **Personalized, quantified insights** — actions are ranked by the estimated
  kg CO₂e they would save each year, so the highest-leverage change is first.
- **Progress tracking** — save snapshots to local storage and watch your
  footprint change over time, with an automatic delta vs. your last snapshot.
- **Real-world context** — compares your footprint to the global average and a
  Paris-aligned target, and expresses it as "trees per year to offset".
- **Private by design** — no accounts, no servers, no tracking. All data stays
  in your browser.

## 🧮 How the estimate works

CarbonWise uses transparent, documented emission factors. They are deliberately
round, conservative figures meant for **personal awareness**, not certified
greenhouse-gas accounting. All factors live in one auditable file:
[`src/domain/emissionFactors.ts`](src/domain/emissionFactors.ts).

| Category    | Basis                                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| Transport   | Per-km factors by fuel type, plus bus and rail (kg CO₂e/km)                                               |
| Flights     | Per-trip factors for short- and long-haul return flights                                                  |
| Home energy | Electricity (grid intensity, reduced by your renewable share) + gas, **divided across household members** |
| Food        | Annual dietary footprint by eating pattern                                                                |
| Goods       | Annual consumption footprint by shopping intensity                                                        |

**Sources:** UK DESNZ/DEFRA greenhouse-gas conversion factors, US EPA
equivalencies, IEA grid intensity, and Our World in Data / Poore & Nemecek
(2018) for dietary footprints. See code comments for specifics.

## 🛠️ Tech stack

- **React 18** + **TypeScript** (strict mode) + **Vite**
- **Recharts** for the breakdown visualization
- **Vitest** + **Testing Library** for unit, component, and integration tests
- **ESLint** (incl. `jsx-a11y`) + **Prettier**
- **GitHub Actions** CI: type-check → lint → format check → tests+coverage → build

## 🚀 Getting started

```bash
# Requires Node 18+ (Node 20 recommended)
npm install
npm run dev        # start the dev server
```

Open the printed local URL in your browser.

### Useful scripts

| Script                  | What it does                         |
| ----------------------- | ------------------------------------ |
| `npm run dev`           | Start the Vite dev server            |
| `npm run build`         | Type-check and build for production  |
| `npm run preview`       | Preview the production build locally |
| `npm test`              | Run the test suite                   |
| `npm run test:coverage` | Run tests with a coverage report     |
| `npm run lint`          | Lint (zero warnings allowed)         |
| `npm run typecheck`     | Type-check without emitting          |
| `npm run format`        | Format with Prettier                 |

## 🌍 Deployment

The app is a static SPA and deploys anywhere. Configs are included for **Vercel**
([`vercel.json`](vercel.json)) and **Netlify** ([`netlify.toml`](netlify.toml)),
both with hardened security headers.

**Vercel (recommended):**

1. Push this repo to GitHub.
2. In Vercel, **Add New → Project** and import the repo.
3. Framework preset **Vite** is auto-detected (build `npm run build`, output
   `dist`). Click **Deploy**.

**Netlify:** New site from Git → pick the repo → build `npm run build`, publish
`dist`.

## ♿ Accessibility

Targets **WCAG 2.1 AA**:

- Semantic landmarks (`header`, `main`, `footer`), one `h1`, ordered headings.
- Every control has an associated `<label>`; grouped with `<fieldset>`/`<legend>`.
- A "skip to main content" link and visible keyboard focus styles throughout.
- The chart is paired with an accessible data table (the chart itself is hidden
  from assistive tech as a visual aid); live regions announce progress changes.
- Color choices meet AA contrast; respects `prefers-color-scheme` and
  `prefers-reduced-motion`. Linted with `eslint-plugin-jsx-a11y`.

## 🔒 Security & privacy

- **No backend, no accounts, no third-party calls** — nothing to breach and
  nothing to leak. All data is stored in the browser's `localStorage`.
- All user input is **clamped and sanitized** before any calculation, guarding
  against `NaN`/`Infinity` and out-of-range values.
- Stored data is **validated on read**, so corrupted or tampered storage cannot
  crash the app.
- A strict **Content-Security-Policy** and other security headers are set both
  via a meta tag and at the hosting layer (Vercel/Netlify).

## 🧪 Testing

The suite covers the calculation engine, the insights generator, persistence,
formatting, individual components, and a full app integration flow (live updates
and saving a snapshot). Run `npm run test:coverage` to see the report.

## 📁 Project structure

```
src/
  domain/        Pure, framework-free logic (factors, calculator, insights,
                 storage, formatting) — fully unit-tested
  components/    Accessible, focused React components
  hooks/         useFootprintHistory (localStorage-backed state)
  styles/        Global, themeable CSS (light/dark, reduced motion)
  test/          Test setup
```

## 📐 Architecture & contributing

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the layered design (pure domain
logic vs. presentation) and key decisions, and [`CONTRIBUTING.md`](CONTRIBUTING.md)
for the local pipeline and conventions.

## 📄 License

[MIT](LICENSE).

> Estimates are approximate and for awareness only; they are not a substitute
> for a professional carbon audit.
