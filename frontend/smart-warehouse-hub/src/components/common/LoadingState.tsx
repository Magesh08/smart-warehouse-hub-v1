import React from 'react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading warehouse data...',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 min-h-[300px] rounded-xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl transition-all duration-300 ${className}`}
    >
      <div className="relative w-16 h-16 mb-4">
        {/* Glow behind loader */}
        <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse"></div>
        {/* Outer animated track */}
        <div className="w-16 h-16 rounded-full border-2 border-white/5 border-t-cyan-500 border-r-indigo-500 animate-spin"></div>
        {/* Inner reverse spinner */}
        <div className="absolute top-2 left-2 w-12 h-12 rounded-full border-2 border-white/5 border-b-emerald-500 border-l-teal-500 animate-spin [animation-duration:1.5s] [animation-direction:reverse]"></div>
      </div>
      <p className="text-sm font-medium text-slate-300 animate-pulse tracking-wide">
        {message}
      </p>
    </div>
  );
};

export default LoadingState;
