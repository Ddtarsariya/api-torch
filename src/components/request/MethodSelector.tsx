// src/components/request/MethodSelector.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { HttpMethod } from '../../types';

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

// Method badge component with appropriate colors and animations
export const MethodBadge: React.FC<{ method: HttpMethod; onClick?: () => void }> = ({ method, onClick }) => {
  const getMethodColor = () => {
    switch (method) {
      case 'GET': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
      case 'POST': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
      case 'PUT': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
      case 'DELETE': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800/50';
      case 'PATCH': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800/50';
      case 'OPTIONS': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50';
      case 'HEAD': return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200 dark:border-slate-800/50';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800/50';
    }
  };

  return (
    <span
      className={`px-3 py-1.5 rounded-md font-medium text-sm border ${getMethodColor()} transition-all duration-150 ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-105 active:scale-95' : ''}`}
      onClick={onClick}
    >
      {method}
    </span>
  );
};

interface MethodSelectorProps {
  value: HttpMethod;
  onChange: (method: HttpMethod) => void;
}

export const MethodSelector: React.FC<MethodSelectorProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div
        className="cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MethodBadge method={value} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-popover border rounded-md shadow-lg z-20 w-32 py-1 animate-in fade-in-50 zoom-in-95 slide-in-from-top-2">
          {HTTP_METHODS.map(method => (
            <div
              key={method}
              className={`px-3 py-2 cursor-pointer hover:bg-accent flex items-center ${method === value ? 'bg-accent/50 font-medium' : ''}`}
              onClick={() => {
                onChange(method);
                setIsOpen(false);
              }}
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${method === value ? 'bg-primary' : 'bg-transparent'}`}></div>
              {method}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
