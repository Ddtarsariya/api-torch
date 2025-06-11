// src/pages/Home.tsx

import React, { useState, useRef, useEffect } from 'react';
import { RequestPanel } from '../components/RequestPanel';
import { ResponsePanel } from '../components/ResponsePanel';
import { Button } from '../components/ui/button';

export const Home: React.FC = () => {
  const [splitPosition, setSplitPosition] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const [layout, setLayout] = useState<'bottom' | 'right'>('right');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newPosition = layout === 'bottom'
        ? ((e.clientY - containerRect.top) / containerRect.height) * 100
        : ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Limit the range to prevent panels from becoming too small
      if (newPosition >= 20 && newPosition <= 80) {
        setSplitPosition(newPosition);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Prevent text selection while dragging
      document.body.style.userSelect = 'none';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, layout]);
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden relative w-full h-full">
      <div className="flex justify-end p-2">
        <Button onClick={() => setLayout(layout === 'bottom' ? 'right' : 'bottom')}>
          Toggle Layout
        </Button>
      </div>
      <div ref={containerRef} className={`flex-1 flex overflow-hidden relative ${layout === 'bottom' ? 'flex-col' : 'flex-row'}`}>
        {/* Request panel with dynamic width/height */}
        <div 
          className="overflow-auto"
          style={layout === 'bottom' ? { height: `${splitPosition}%` } : { width: `${splitPosition}%` }}
        >
          <RequestPanel />
        </div>
        
        {/* Resizable divider */}
        <div 
          className={`absolute ${layout === 'bottom' ? 'left-0 right-0 h-1 cursor-ns-resize' : 'top-0 bottom-0 w-1 cursor-ew-resize'} bg-border hover:bg-primary/30 z-10 transition-colors`}
          style={layout === 'bottom' ? { top: `calc(${splitPosition}% - 0.5px)` } : { left: `calc(${splitPosition}% - 0.5px)` }}
          onMouseDown={handleMouseDown}
        >
          <div className={`absolute ${layout === 'bottom' ? 'left-1/2 transform -translate-x-1/2' : 'top-1/2 transform -translate-y-1/2'} w-4 h-8 flex flex-col items-center justify-center space-y-1 opacity-0 hover:opacity-100 transition-opacity`}>
            <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
            <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
            <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
          </div>
        </div>
        
        {/* Response panel with dynamic width/height */}
        <div 
          className="overflow-auto"
          style={layout === 'bottom' ? { height: `${100 - splitPosition}%` } : { width: `${100 - splitPosition}%` }}
        >
          <ResponsePanel />
        </div>
        
        {/* Overlay when dragging to improve UX */}
        {isDragging && (
          <div className="absolute inset-0 z-20 bg-transparent cursor-ew-resize" />
        )}
      </div>
    </div>
  );
};
