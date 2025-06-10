// src/components/KeyboardShortcutsModal.tsx
import React from 'react';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  if (!isOpen) return null;
  
  const shortcuts = [
    { keys: ['Ctrl', 'Enter'], description: 'Send request' },
    { keys: ['Ctrl', 'S'], description: 'Save request' },
    { keys: ['Ctrl', 'N'], description: 'New request' },
    { keys: ['Ctrl', 'E'], description: 'Focus environment selector' },
    { keys: ['Ctrl', '/'], description: 'Show keyboard shortcuts' },
  ];
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{shortcut.description}</span>
                <div className="flex items-center space-x-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <React.Fragment key={keyIndex}>
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">
                        {key}
                      </kbd>
                      {keyIndex < shortcut.keys.length - 1 && <span>+</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
