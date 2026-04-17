import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        errorMessage: '',
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, errorMessage: error.message };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', textAlign: 'center', background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '8px', margin: '1rem' }}>
                    <h2 style={{ color: '#c53030' }}>Something went wrong.</h2>
                    <p style={{ color: '#742a2a' }}>{this.state.errorMessage}</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '1rem' }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
