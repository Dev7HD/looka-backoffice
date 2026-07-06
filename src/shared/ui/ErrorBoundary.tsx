import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorState } from "./Feedback/Feedback";

interface Props {
  children: ReactNode;
  /** Reset the boundary when this value changes (e.g. route path). */
  resetKey?: unknown;
}
interface State {
  error: Error | null;
}

/** Catches render-time errors in a subtree and shows a recoverable card. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Hook for a real error reporter (Sentry, etc.).
    console.error("Uncaught render error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorState
          detail={this.state.error.message}
          onRetry={() => this.setState({ error: null })}
        />
      );
    }
    return this.props.children;
  }
}
