import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-orange-600"
      >
        <rect x="2" y="2" width="36" height="36" rx="4" stroke="currentColor" strokeWidth="2" />
        <rect x="8" y="8" width="8" height="8" fill="currentColor" />
        <rect x="24" y="8" width="8" height="8" fill="currentColor" />
        <rect x="8" y="24" width="8" height="8" fill="currentColor" />
        <rect x="18" y="18" width="4" height="4" fill="currentColor" />
        <rect x="24" y="24" width="3" height="3" fill="currentColor" />
        <rect x="29" y="24" width="3" height="3" fill="currentColor" />
        <rect x="24" y="29" width="3" height="3" fill="currentColor" />
        <rect x="29" y="29" width="3" height="3" fill="currentColor" />
      </svg>
      <span className="text-2xl font-bold text-gray-800">Attendo</span>
    </div>
  );
};
