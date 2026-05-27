import React from 'react';
import { Button } from '../ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Connection Interrupted',
  message = 'We encountered an error syncing with the warehouse API. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center min-h-[300px] rounded-xl border border-red-500/20 bg-red-950/20 backdrop-blur-md shadow-2xl transition-all duration-300 ${className}`}
    >
      <div className="relative p-4 mb-4 rounded-full bg-red-500/10 text-red-400">
        <div className="absolute inset-0 rounded-full bg-red-500/5 blur-lg"></div>
        <AlertTriangle className="w-8 h-8" />
      </div>
      
      <h3 className="mb-2 text-lg font-bold text-white tracking-tight">{title}</h3>
      <p className="max-w-md mb-6 text-sm text-red-200/70 leading-relaxed">{message}</p>
      
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-red-500/30 hover:border-red-500/50 hover:bg-red-950/40 text-red-200 gap-2 transition-all duration-300"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
