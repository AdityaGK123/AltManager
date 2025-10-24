import { Component, ReactNode } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Bug } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error to console for development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In production, send to error monitoring service
    // Example: sendErrorToMonitoring(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[200px] w-full flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Oops! Something broke
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  This component encountered an unexpected error. Try refreshing or let us know if it keeps happening.
                </p>
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mb-4 w-full">
                    <summary className="cursor-pointer text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <Bug className="h-3 w-3" />
                      Error Details
                    </summary>
                    <pre className="text-xs bg-muted p-2 rounded text-left overflow-auto max-h-32">
                      {this.state.error.message}
                    </pre>
                  </details>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={this.handleReset}
                    size="sm"
                    variant="outline"
                    data-testid="button-error-retry"
                  >
                    Try Again
                  </Button>
                  
                  <Button
                    onClick={this.handleRefresh}
                    size="sm"
                    variant="default"
                    className="flex items-center gap-1"
                    data-testid="button-error-refresh"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryComponent(props: T) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}