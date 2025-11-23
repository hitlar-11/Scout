import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-destructive mb-4">حدث خطأ ما</h1>
            <p className="text-muted-foreground mb-4">
              نعتذر، حدث خطأ غير متوقع. يرجى تحديث الصفحة.
            </p>
            <div className="mb-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
              >
                تحديث الصفحة
              </button>
            </div>
            {/* Debug: show error details to help troubleshooting (remove in production) */}
            {this.state.error && (
              <details className="text-left mt-4 p-4 bg-gray-100 rounded-lg text-sm max-w-2xl mx-auto break-words">
                <summary className="cursor-pointer font-medium">عرض تفاصيل الخطأ</summary>
                <pre className="whitespace-pre-wrap mt-2">{String(this.state.error?.message || this.state.error)}</pre>
                <pre className="whitespace-pre-wrap mt-2 text-xs text-muted-foreground">{(this.state.error as any)?.stack}</pre>
                <div className="mt-2">
                  <button
                    onClick={() => {
                      try {
                        const text = `Error: ${String(this.state.error?.message || this.state.error)}\n\nStack:\n${(this.state.error as any)?.stack || ''}`;
                        navigator.clipboard.writeText(text);
                      } catch (e) {
                        // ignore
                      }
                    }}
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    نسخ التفاصيل
                  </button>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


