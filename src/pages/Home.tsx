// src/pages/Home.tsx
import React, { useState, useRef, useEffect } from 'react';
import { RequestPanel } from '../components/RequestPanel';
import { ResponsePanel } from '../components/ResponsePanel';

export const Home: React.FC = () => {
  const [splitPosition, setSplitPosition] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
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
  }, [isDragging]);
  
  return (
    <div ref={containerRef} className="flex-1 flex overflow-hidden relative w-full h-full">
      {/* Request panel with dynamic width */}
      <div 
        className="h-full overflow-auto"
        style={{ width: `${splitPosition}%` }}
      >
        <RequestPanel />
      </div>
      
      {/* Resizable divider */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-border hover:bg-primary/30 cursor-ew-resize z-10 transition-colors"
        style={{ left: `calc(${splitPosition}% - 0.5px)` }}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-8 flex flex-col items-center justify-center space-y-1 opacity-0 hover:opacity-100 transition-opacity">
          <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
          <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
          <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
        </div>
      </div>
      
      {/* Response panel with dynamic width */}
      <div 
        className="h-full overflow-auto"
        style={{ width: `${100 - splitPosition}%` }}
      >
        <ResponsePanel />
      </div>
      
      {/* Overlay when dragging to improve UX */}
      {isDragging && (
        <div className="absolute inset-0 z-20 bg-transparent cursor-ew-resize" />
      )}
    </div>
  );
};
