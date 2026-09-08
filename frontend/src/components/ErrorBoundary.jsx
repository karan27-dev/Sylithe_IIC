import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    // eslint-disable-next-line no-unused-vars
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Dashboard Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-10 text-red-600 bg-red-50 h-screen w-screen overflow-auto">
                    <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
                    <pre className="font-mono text-xs whitespace-pre-wrap">
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
