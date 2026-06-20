# Contributing

Thanks for your interest in improving CarbonWise!

## Development setup

```bash
npm install
npm run dev
```

## Before opening a pull request

Please make sure the full local pipeline passes (this mirrors CI):

```bash
npm run typecheck     # TypeScript, no emit
npm run lint          # ESLint, zero warnings allowed
npm run format:check  # Prettier
npm run test:coverage # Vitest + coverage
npm run build         # Production build
```

## Conventions

- Keep business logic in `src/domain` as pure, tested functions. Components
  should stay focused on rendering and event wiring.
- Add or update tests for any behaviour you change.
- Run `npm run format` to auto-apply the Prettier style.
- Update emission factors only with a cited source in a code comment.

## Code of conduct

Be respectful and constructive. Assume good intent.
