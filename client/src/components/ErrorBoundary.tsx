import { Component, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { hasError: boolean; error: string }

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, error: "" };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error: error.message };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 bg-app-cream">
                    <h1 className="text-2xl font-bold text-app-green">Something went wrong</h1>
                    <p className="text-sm text-app-text-light max-w-md text-center">{this.state.error}</p>
                    <button
                        onClick={() => window.location.replace("/")}
                        className="btn-green !rounded-xl !px-6"
                    >
                        Go Home
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
