import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback UI shown when a render error is caught. */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches unexpected render-time errors anywhere in the subtree and shows a
 * friendly, accessible fallback instead of a blank screen. This keeps a single
 * failing widget from taking down the whole app.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface the error for debugging without leaking details to the UI.
    console.error('Unexpected error caught by ErrorBoundary:', error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="card" role="alert">
            <h2>Something went wrong</h2>
            <p className="card__hint">
              Please reload the page to continue. Your saved data is safe in
              your browser.
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
