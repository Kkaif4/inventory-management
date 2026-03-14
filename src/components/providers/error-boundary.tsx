"use client";

import React, { ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center space-y-6 bg-white rounded-3xl border border-slate-200">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">
              Something went wrong
            </h2>
            <p className="text-slate-500 max-w-md mx-auto">
              An unexpected error occurred. We've been notified and are looking
              into it.
            </p>
          </div>
          {process.env.NODE_ENV === "development" && (
            <div className="p-4 bg-slate-50 rounded-xl text-left font-mono text-xs overflow-auto max-w-full">
              {this.state.error?.message}
            </div>
          )}
          <Button
            onClick={() => this.setState({ hasError: false })}
            className="rounded-xl px-8"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
