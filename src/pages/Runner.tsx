// src/pages/Runner.tsx
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import type { Collection, ApiRequest, RunResult } from '../types';
import { Button } from '../components/ui/button';
import { 
  Play, StopCircle, ChevronDown, ChevronRight, 
  CheckCircle, XCircle, Clock, AlertCircle, Loader2
} from 'lucide-react';
import { sendRequest } from '../lib/request-service';

interface CollectionRunnerProps {
  collection: Collection;
}

const CollectionRunner: React.FC<CollectionRunnerProps> = ({ collection }) => {
  const { 
    getActiveWorkspace, 
    getEnvironments, 
    setRunResults, 
    addRunResult, 
    clearRunResults,
    setIsRunning,
    isRunning,
    runResults
  } = useAppStore();
  
  const workspace = getActiveWorkspace();
  const environments = getEnvironments();
  const activeEnvironment = environments.find(e => e.id === workspace.activeEnvironmentId);
  
  const [progress, setProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  
  const getAllRequests = (items: (Collection | ApiRequest)[]): ApiRequest[] => {
    const requests: ApiRequest[] = [];
    
    items.forEach(item => {
      if ('method' in item) {
        requests.push(item as ApiRequest);
      } else {
        requests.push(...getAllRequests((item as Collection).items));
      }
    });
    
    return requests;
  };
  
  const requests = getAllRequests(collection.items);
  const collectionResults = runResults.filter(result => 
    requests.some(req => req.id === result.requestId)
  );
  
  const passedTests = collectionResults.reduce((count, result) => {
    const passedTestsInResult = result.testResults.filter(test => test.passed).length;
    return count + passedTestsInResult;
  }, 0);
  
  const totalTests = collectionResults.reduce((count, result) => {
    return count + result.testResults.length;
  }, 0);
  
  const handleRunCollection = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    clearRunResults();
    setProgress(0);
    
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      const startTime = Date.now();
      
      try {
        const { response, testResults } = await sendRequest(request, activeEnvironment);
        
        const runResult: RunResult = {
          requestId: request.id,
          requestName: request.name,
          response,
          testResults,
          duration: Date.now() - startTime,
        };
        
        addRunResult(runResult);
      } catch (error) {
        const runResult: RunResult = {
          requestId: request.id,
          requestName: request.name,
          response: null,
          error: (error as Error).message,
          testResults: [],
          duration: Date.now() - startTime,
        };
        
        addRunResult(runResult);
      }
      
      setProgress(((i + 1) / requests.length) * 100);
    }
    
    setIsRunning(false);
  };
  
  const handleStopRun = () => {
    setIsRunning(false);
  };
  
  return (
    <div className="bg-card rounded-lg border border-border mb-6 overflow-hidden">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <h2 className="text-lg font-semibold ml-2">{collection.name}</h2>
          
          {collectionResults.length > 0 && (
            <div className="ml-4 flex items-center text-sm">
              <span className={totalTests > 0 ? (
                passedTests === totalTests 
                  ? "text-emerald-500" 
                  : passedTests === 0 
                    ? "text-rose-500" 
                    : "text-amber-500"
              ) : "text-muted-foreground"}>
                {passedTests}/{totalTests} tests passed
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              handleRunCollection();
            }} 
            disabled={isRunning || requests.length === 0}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isRunning ? (
              <>
                <Loader2 size={14} className="mr-1.5 animate-spin" /> Running...
              </>
            ) : (
              <>
                <Play size={14} className="mr-1.5" /> Run Collection
              </>
            )}
          </Button>
          
          {isRunning && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                handleStopRun();
              }}
            >
              <StopCircle size={14} className="mr-1.5" /> Stop
            </Button>
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t border-border">
          {isRunning && (
            <div className="p-4 border-b border-border">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <div>Running {Math.ceil((progress / 100) * requests.length)} of {requests.length} requests</div>
                <div>{Math.round(progress)}%</div>
              </div>
            </div>
          )}
          
          <div className="divide-y divide-border">
            <div className="grid grid-cols-12 gap-4 p-3 font-medium text-sm text-muted-foreground bg-muted/50">
              <div className="col-span-5 md:col-span-6">Request</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 md:col-span-1">Time</div>
              <div className="col-span-3">Tests</div>
            </div>
            
            <div className="divide-y divide-border">
              {requests.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">No requests in this collection</p>
                </div>
              ) : (
                requests.map(request => (
                  <RunnerRequestItem key={request.id} request={request} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface RunnerRequestItemProps {
  request: ApiRequest;
}

const RunnerRequestItem: React.FC<RunnerRequestItemProps> = ({ request }) => {
  const { runResults } = useAppStore();
  
  const result = runResults.find(r => r.requestId === request.id);
  
  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30';
      case 'POST': return 'text-blue-600 bg-blue-50 dark:bg-blue-950/30';
      case 'PUT': return 'text-amber-600 bg-amber-50 dark:bg-amber-950/30';
      case 'DELETE': return 'text-rose-600 bg-rose-50 dark:bg-rose-950/30';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800/30';
    }
  };
  
  const getStatusColor = () => {
    if (!result?.response) return 'text-muted-foreground';
    
    const status = result.response.status;
    if (status >= 200 && status < 300) return 'text-emerald-500';
    if (status >= 400) return 'text-rose-500';
    return 'text-amber-500';
  };
  
  const getStatusIcon = () => {
    if (!result?.response) return null;
    
    const status = result.response.status;
    if (status >= 200 && status < 300) return <CheckCircle size={14} className="mr-1.5" />;
    if (status >= 400) return <XCircle size={14} className="mr-1.5" />;
    return <AlertCircle size={14} className="mr-1.5" />;
  };
  
  const getTestsStatus = () => {
    if (!result?.testResults.length) return 'No tests';
    
    const passed = result.testResults.filter(t => t.passed).length;
    const total = result.testResults.length;
    
    return `${passed}/${total}`;
  };
  
  const getTestsColor = () => {
    if (!result?.testResults.length) return 'text-muted-foreground';
    
    const passed = result.testResults.filter(t => t.passed).length;
    const total = result.testResults.length;
    
    if (passed === total) return 'text-emerald-500';
    if (passed === 0) return 'text-rose-500';
    return 'text-amber-500';
  };
  
  const getTestsIcon = () => {
    if (!result?.testResults.length) return null;
    
    const passed = result.testResults.filter(t => t.passed).length;
    const total = result.testResults.length;
    
    if (passed === total) return <CheckCircle size={14} className="mr-1.5" />;
    if (passed === 0) return <XCircle size={14} className="mr-1.5" />;
    return <AlertCircle size={14} className="mr-1.5" />;
  };
  
  return (
    <div className="grid gri d-cols-12 gap-4 p-3 text-sm hover:bg-accent/30 transition-colors">
      <div className="col-span-5 md:col-span-6 flex items-center">
        <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded mr-2 ${getMethodColor(request.method)}`}>
          {request.method}
        </span>
        <span className="truncate">{request.name}</span>
      </div>
      
      <div className={`col-span-2 flex items-center ${getStatusColor()}`}>
        {getStatusIcon()}
        {result?.response 
          ? `${result.response.status}` 
          : result?.error 
            ? 'Error' 
            : 'Pending'}
      </div>
      
      <div className="col-span-2 md:col-span-1 flex items-center text-muted-foreground">
        {result?.duration ? (
          <><Clock size={14} className="mr-1.5" />{result.duration}ms</>
        ) : '-'}
      </div>
      
      <div className={`col-span-3 flex items-center ${getTestsColor()}`}>
        {getTestsIcon()}
        {getTestsStatus()}
      </div>
    </div>
  );
};

export const Runner: React.FC = () => {
  const { getCollections } = useAppStore();
  const collections = getCollections();
  
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Collection Runner</h1>
        
        {collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-card border border-dashed border-border rounded-lg">
            <AlertCircle size={32} className="text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Collections Available</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Create a collection in the sidebar to start running tests against your APIs.
            </p>
            <Button variant="outline">
              Create Collection
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {collections.map(collection => (
              <CollectionRunner key={collection.id} collection={collection} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
