// src/hooks/use-keyboard-shortcuts.ts
import { useEffect } from 'react';
import { useAppStore } from '../store';
import { sendRequest } from '../lib/request-service';

export function useKeyboardShortcuts() {
  const { 
    activeRequestId, 
    getRequests, 
    getActiveWorkspace,
    getEnvironments,
    setActiveResponse
  } = useAppStore();
  
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Send request with Ctrl+Enter
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        
        if (!activeRequestId) return;
        
        const requests = getRequests();
        const activeRequest = requests.find(r => r.id === activeRequestId);
        
        if (!activeRequest) return;
        
        const workspace = getActiveWorkspace();
        const environments = getEnvironments();
        const activeEnvironment = environments.find(e => e.id === workspace.activeEnvironmentId);
        
        try {
          const { response } = await sendRequest(activeRequest, activeEnvironment);
          setActiveResponse(response);
        } catch (error) {
          console.error('Error sending request:', error);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeRequestId, getRequests, getActiveWorkspace, getEnvironments, setActiveResponse]);
}
