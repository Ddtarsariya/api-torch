// src/components/ResponsePanel.tsx
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { formatBytes } from '../lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Editor } from '@monaco-editor/react';
import { JsonView, darkStyles, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { 
  File, FileJson, Clock, Download, Copy, CheckCircle2, XCircle, AlertCircle, Loader2
} from 'lucide-react';
import { Button } from './ui/button';

export const ResponsePanel: React.FC = () => {
  const { activeResponse, theme } = useAppStore();
  const [editorTheme, setEditorTheme] = useState('vs');
  const [activeTab, setActiveTab] = useState('body');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Set editor theme based on app theme
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setEditorTheme(isDarkMode ? 'vs-dark' : 'vs');
  }, [theme]);
  
  // Reset copy success message
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);
  
  if (!activeResponse) {
    return (
      <div className={`w-full h-full overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <File size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">Response will appear here</h3>
        <p className="text-muted-foreground max-w-md">
          Send a request to see the response data, status code, and headers
        </p>
      </div>
    );
  }
  
  const isSuccess = activeResponse.status >= 200 && activeResponse.status < 300;
  const isRedirect = activeResponse.status >= 300 && activeResponse.status < 400;
  const isClientError = activeResponse.status >= 400 && activeResponse.status < 500;
  const isServerError = activeResponse.status >= 500;
  
  const getStatusColor = () => {
    if (isSuccess) return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30';
    if (isRedirect) return 'text-amber-500 bg-amber-50 dark:bg-amber-950/30';
    if (isClientError) return 'text-rose-500 bg-rose-50 dark:bg-rose-950/30';
    if (isServerError) return 'text-red-500 bg-red-50 dark:bg-red-950/30';
    return 'text-gray-500 bg-gray-50 dark:bg-gray-800/30';
  };
  
  const getStatusIcon = () => {
    if (isSuccess) return <CheckCircle2 size={16} className="text-emerald-500" />;
    if (isRedirect) return <AlertCircle size={16} className="text-amber-500" />;
    if (isClientError || isServerError) return <XCircle size={16} className="text-rose-500" />;
    return null;
  };
  
  const formatResponseBody = () => {
    try {
      if (typeof activeResponse.data === 'object') {
        return (
          <JsonView 
            data={activeResponse.data} 
            style={theme === 'dark' ? darkStyles : defaultStyles} 
          />
        );
      }
      
      // If it's a string but might be JSON
      if (typeof activeResponse.data === 'string' && 
          (activeResponse.data.startsWith('{') || activeResponse.data.startsWith('['))) {
        try {
          const jsonData = JSON.parse(activeResponse.data);
          return (
            <JsonView 
              data={jsonData} 
              style={theme === 'dark' ? darkStyles : defaultStyles} 
            />
          );
        } catch {
          // If parsing fails, treat as text
          return (
            <Editor
              height="100%"
              language="text"
              value={activeResponse.data}
              theme={editorTheme}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 13,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          );
        }
      }
      
      // Plain text or HTML
      const language = activeResponse.headers['content-type']?.includes('html') ? 'html' : 'text';
      return (
        <Editor
          height="100%"
          language={language}
          value={activeResponse.data}
          theme={editorTheme}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      );
    } catch (error) {
      return (
        <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-md">
          <p className="text-destructive font-medium mb-1">Error displaying response</p>
          <p className="text-sm">{String(error)}</p>
        </div>
      );
    }
  };
  
  const copyResponseToClipboard = () => {
    let content = '';
    
    if (activeTab === 'body') {
      content = typeof activeResponse.data === 'object' 
        ? JSON.stringify(activeResponse.data, null, 2) 
        : String(activeResponse.data);
    } else if (activeTab === 'headers') {
      content = Object.entries(activeResponse.headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    }
    
    navigator.clipboard.writeText(content);
    setCopySuccess(true);
  };
  
  const downloadResponse = () => {
    let content = '';
    let filename = '';
    let type = '';
    
    if (activeTab === 'body') {
      if (typeof activeResponse.data === 'object') {
        content = JSON.stringify(activeResponse.data, null, 2);
        filename = 'response.json';
        type = 'application/json';
      } else {
        content = String(activeResponse.data);
        filename = 'response.txt';
        type = 'text/plain';
      }
    } else if (activeTab === 'headers') {
      content = Object.entries(activeResponse.headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      filename = 'headers.txt';
      type = 'text/plain';
    }
    
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  return (
    <div className={`overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'w-full h-full'}`}>
      {/* Response header with status and actions */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur-sm">
        <div className="flex items-center">
          <div className={`flex items-center px-3 py-1 rounded-full ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="ml-1.5 font-semibold">
              {activeResponse.status}
            </span>
          </div>
          <span className="ml-3 text-muted-foreground">
            {activeResponse.statusText}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <div className="text-sm text-muted-foreground mr-2 flex items-center">
            <Clock size={14} className="mr-1" />
            {activeResponse.time}ms
            <span className="mx-1.5">•</span>
            {formatBytes(activeResponse.size)}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={copyResponseToClipboard}
            title={copySuccess ? "Copied!" : "Copy to clipboard"}
          >
            {copySuccess ? <CheckCircle2 size={16} /> : <Copy size={16} />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={downloadResponse}
            title="Download response"
          >
            <Download size={16} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            <FileJson size={16} />
          </Button>
        </div>
      </div>
      
      {/* Response content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs 
          defaultValue="body" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="px-4 pt-2 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="body" className="flex items-center">
              <FileJson size={14} className="mr-1.5" /> Body
            </TabsTrigger>
            <TabsTrigger value="headers" className="flex items-center">
              <File size={14} className="mr-1.5" /> Headers
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="body" className="flex-1 overflow-auto p-0 m-0">
            <div className="h-full overflow-auto">
              {formatResponseBody()}
            </div>
          </TabsContent>
          
          <TabsContent value="headers" className="flex-1 overflow-auto p-4">
            <div className="space-y-1">
              {Object.entries(activeResponse.headers).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle size={24} className="text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No headers found in the response</p>
                </div>
              ) : (
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                  {Object.entries(activeResponse.headers).map(([key, value]) => (
                    <React.Fragment key={key}>
                      <div className="font-medium text-sm">{key}:</div>
                      <div className="text-sm break-all">{value}</div>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
