import { AlertTriangle } from 'lucide-react';
import type { ErrorInfo, ReactNode } from 'react';
import { Component, Suspense } from 'react';
import { Alert, Spinner } from 'reactstrap';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class MonacoErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Monaco Editor Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border rounded" style={{ height: '400px' }}>
          <Alert color="warning" className="h-100 d-flex align-items-center justify-content-center">
            <div className="text-center">
              <AlertTriangle size={24} className="mb-2" />
              <div>Code editor failed to load</div>
              <small className="text-muted">
                Please refresh the page or use a text area fallback
              </small>
              <div className="mt-2">
                <button 
                  className="btn btn-outline-warning btn-sm"
                  onClick={() => this.setState({ hasError: false })}
                >
                  Try Again
                </button>
              </div>
            </div>
          </Alert>
        </div>
      );
    }

    return (
      <Suspense fallback={
        <div className="p-4 border rounded d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
          <div className="text-center">
            <Spinner color="primary" className="mb-2" />
            <div>Loading code editor...</div>
          </div>
        </div>
      }>
        {this.props.children}
      </Suspense>
    );
  }
}

export default MonacoErrorBoundary;