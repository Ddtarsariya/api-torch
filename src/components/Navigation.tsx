// src/components/Navigation.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Play, Server, Settings, FileText } from 'lucide-react';

export const Navigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: <Home size={16} />, label: 'Requests' },
    { path: '/environments', icon: <Server size={16} />, label: 'Environments' },
    { path: '/runner', icon: <Play size={16} />, label: 'Runner' },
  ];
  
  return (
    <div className="flex md:items-center md:space-x-1 md:h-full w-full md:w-auto">
      {/* Mobile: bottom navigation */}
      <div className="flex justify-around w-full md:hidden">
        {navItems.map(item => (
          <Link 
            key={item.path}
            to={item.path} 
            className={`
              flex flex-col items-center justify-center py-2 px-4 rounded-md
              ${location.pathname === item.path 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}
            `}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
      
      {/* Desktop: horizontal navigation */}
      <div className="hidden md:flex md:items-center md:space-x-1">
        {navItems.map(item => (
          <Link 
            key={item.path}
            to={item.path} 
            className={`
              flex items-center px-3 py-2 rounded-md transition-colors
              ${location.pathname === item.path 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}
            `}
          >
            <span className="mr-2">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
