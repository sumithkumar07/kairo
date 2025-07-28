import React from 'react';

// Enhanced Loading States for Better UX

export const QuantumSimulationLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-600 rounded-full animate-pulse"></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-ping"></div>
      </div>
    </div>
    <div className="text-center space-y-2">
      <h3 className="text-lg font-semibold text-blue-900">Quantum Simulation Running</h3>
      <p className="text-sm text-gray-600">Analyzing workflow possibilities across multiple quantum states...</p>
      <div className="flex justify-center space-x-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
);

export const HipaaComplianceLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-green-200 rounded-full">
        <div className="absolute inset-0 border-4 border-transparent border-t-green-600 rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-2 border-transparent border-r-green-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
    <div className="text-center space-y-2">
      <h3 className="text-lg font-semibold text-green-900">HIPAA Compliance Check</h3>
      <p className="text-sm text-gray-600">Verifying healthcare data protection standards...</p>
      <div className="w-full bg-green-200 rounded-full h-2">
        <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
      </div>
    </div>
  </div>
);

export const RealityFabricatorLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <div className="relative">
      <div className="w-20 h-20 relative">
        <div className="absolute inset-0 border-4 border-purple-200 rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
        <div className="absolute inset-4 border-4 border-transparent border-b-pink-400 rounded-full animate-spin" style={{ animationDuration: '0.5s' }}></div>
        <div className="absolute inset-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping"></div>
      </div>
    </div>
    <div className="text-center space-y-2">
      <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Reality Fabricator Active
      </h3>
      <p className="text-sm text-gray-600">Generating alternate reality scenarios...</p>
      <div className="flex justify-center space-x-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-1 h-4 bg-gradient-to-t from-purple-400 to-pink-400 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          ></div>
        ))}
      </div>
    </div>
  </div>
);

export const ConsciousnessLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <div className="relative">
      <div className="w-24 h-24 relative">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="absolute inset-0 border-2 border-transparent border-t-orange-400 rounded-full animate-spin"
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: `${1 + i * 0.2}s`,
              transform: `rotate(${i * 45}deg) scale(${0.3 + i * 0.1})`
            }}
          ></div>
        ))}
        <div className="absolute inset-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full animate-pulse"></div>
      </div>
    </div>
    <div className="text-center space-y-2">
      <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
        Global Consciousness Feed
      </h3>
      <p className="text-sm text-gray-600">Tapping into collective intelligence patterns...</p>
      <div className="text-xs text-orange-600 animate-pulse">
        ◯ ◯ ◯ Consciousness Nodes Active ◯ ◯ ◯
      </div>
    </div>
  </div>
);

// Generic Enhanced Loading Spinner
export const EnhancedSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; color?: string }> = ({ 
  size = 'md', 
  color = 'blue' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10', 
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <div className={`absolute inset-0 border-4 border-${color}-200 rounded-full animate-spin`}>
        <div className={`absolute inset-0 border-4 border-transparent border-t-${color}-600 rounded-full animate-ping`}></div>
      </div>
    </div>
  );
};

// Progress Bar with Percentage
export const ProgressBar: React.FC<{ progress: number; label?: string; color?: string }> = ({ 
  progress, 
  label, 
  color = 'blue' 
}) => {
  return (
    <div className="w-full space-y-2">
      {label && <div className="text-sm font-medium text-gray-700">{label}</div>}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-3 bg-gradient-to-r from-${color}-400 to-${color}-600 rounded-full transition-all duration-500 ease-out relative`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        >
          <div className="absolute inset-0 bg-white bg-opacity-30 animate-pulse"></div>
        </div>
      </div>
      <div className="text-xs text-gray-600 text-right">
        {Math.round(progress)}%
      </div>
    </div>
  );
};

// Skeleton Loading for Cards
export const CardSkeleton: React.FC = () => (
  <div className="border border-gray-200 rounded-lg p-6 space-y-4 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
    <div className="flex justify-between items-center">
      <div className="h-8 bg-gray-200 rounded w-24"></div>
      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
    </div>
  </div>
);

// Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-4 animate-pulse">
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-8 bg-gray-200 rounded font-semibold"></div>
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, colIndex) => (
          <div key={colIndex} className="h-6 bg-gray-100 rounded"></div>
        ))}
      </div>
    ))}
  </div>
);

// Toast Notification Component
export const ToastNotification: React.FC<{
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose: () => void;
}> = ({ type, title, message, onClose }) => {
  const typeStyles = {
    success: 'border-green-400 bg-green-50 text-green-800',
    error: 'border-red-400 bg-red-50 text-red-800',
    warning: 'border-yellow-400 bg-yellow-50 text-yellow-800',
    info: 'border-blue-400 bg-blue-50 text-blue-800'
  };

  const iconStyles = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ⓘ'
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 max-w-md border-l-4 p-4 rounded shadow-lg transition-all duration-300 ${typeStyles[type]} z-50`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold">{iconStyles[type]}</span>
          <div>
            <h4 className="font-semibold">{title}</h4>
            <p className="text-sm opacity-80">{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-lg hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Performance Metrics Display
export const PerformanceMetrics: React.FC<{
  responseTime?: number;
  cacheHit?: boolean;
  accuracy?: number;
}> = ({ responseTime, cacheHit, accuracy }) => (
  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
    {responseTime && (
      <span className="flex items-center space-x-1">
        <span>⚡</span>
        <span>{responseTime}ms</span>
      </span>
    )}
    {cacheHit && (
      <span className="flex items-center space-x-1 text-green-600">
        <span>📦</span>
        <span>Cached</span>
      </span>
    )}
    {accuracy && (
      <span className="flex items-center space-x-1">
        <span>🎯</span>
        <span>{accuracy.toFixed(1)}%</span>
      </span>
    )}
  </div>
);