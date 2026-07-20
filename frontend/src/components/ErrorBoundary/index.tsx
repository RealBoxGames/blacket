import { Component, ErrorInfo, ReactNode } from "react";
import styles from "./errorBoundary.module.scss";

interface ErrorBoundaryProps {
    children: ReactNode;
    label?: string;
}

interface ErrorBoundaryState {
    error: Error | null;
}

// scopes a render crash to the section that threw instead of letting it
// bubble to the router's top-level error page (which replaces the entire
// screen) - also surfaces the real error message instead of a generic one
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error(`[ErrorBoundary${this.props.label ? `: ${this.props.label}` : ""}]`, error, info.componentStack);
    }

    render() {
        if (this.state.error) {
            return (
                <div className={styles.container}>
                    <div className={styles.title}>Something went wrong{this.props.label ? ` in ${this.props.label}` : ""}.</div>
                    <div className={styles.message}>{this.state.error.message}</div>
                    <button className={styles.retryButton} onClick={() => this.setState({ error: null })}>Try Again</button>
                </div>
            );
        }

        return this.props.children;
    }
}
