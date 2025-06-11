// src/pages/Environments.tsx
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Button } from '../components/ui/button';
import { Plus, Edit, Trash, Copy, Server, Check, Download, Upload } from 'lucide-react';
import { EnvironmentModal } from '../components/EnvironmentModal';
import { ImportExportModal } from '../components/ImportExportModal';
import { KeyValueEditor } from '../components/request/KeyValueEditor';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';

export const Environments: React.FC = () => {
  const { 
    getEnvironments, 
    getActiveWorkspace, 
    setActiveEnvironment,
    createEnvironment,
    deleteEnvironment
  } = useAppStore();
  
  const environments = getEnvironments();
  const workspace = getActiveWorkspace();
  const activeEnvironmentId = workspace.activeEnvironmentId;
  
  const [isEnvironmentModalOpen, setIsEnvironmentModalOpen] = useState(false);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | undefined>(undefined);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  
  const handleCreateEnvironment = () => {
    setSelectedEnvironmentId(undefined);
    setIsEnvironmentModalOpen(true);
  };
  
  const handleEditEnvironment = (id: string) => {
    setSelectedEnvironmentId(id);
    setIsEnvironmentModalOpen(true);
  };
  
  const handleSetActive = (id: string) => {
    setActiveEnvironment(id);
  };
  
  const handleImportExport = () => {
    setIsImportExportModalOpen(true);
  };
  
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Environments</h1>
          <p className="text-muted-foreground mt-1">
            Manage your environments and variables
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleImportExport}
            className="flex items-center"
          >
            <Download size={16} className="mr-1.5" /> Import/Export
          </Button>
          
          <Button 
            onClick={handleCreateEnvironment}
            className="flex items-center"
          >
            <Plus size={16} className="mr-1.5" /> New Environment
          </Button>
        </div>
      </div>
      
      {environments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Server size={48} className="text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Environments</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Environments allow you to store and reuse variables across requests.
          </p>
          <Button onClick={handleCreateEnvironment}>
            <Plus size={16} className="mr-1.5" /> Create Environment
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {environments.map(env => (
            <Card key={env.id} className={`overflow-hidden ${env.id === activeEnvironmentId ? 'border-primary/50 shadow-md' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Server size={16} className="mr-2 text-primary" />
                    {env.name}
                  </CardTitle>
                  
                  {env.id === activeEnvironmentId && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      Active
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {env.variables.length} variable{env.variables.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="max-h-48 overflow-y-auto border rounded-md">
                  {env.variables.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No variables defined
                    </div>
                  ) : (
                    <div className="p-2">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-2 font-medium">Variable</th>
                            <th className="text-left p-2 font-medium">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {env.variables.filter(v => v.enabled).slice(0, 5).map(variable => (
                            <tr key={variable.id} className="border-t border-border">
                              <td className="p-2 font-medium">{variable.key}</td>
                              <td className="p-2 truncate max-w-[150px]">{variable.value}</td>
                            </tr>
                          ))}
                          {env.variables.length > 5 && (
                            <tr className="border-t border-border">
                              <td colSpan={2} className="p-2 text-center text-muted-foreground">
                                +{env.variables.length - 5} more variables
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between pt-2">
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditEnvironment(env.id)}
                    className="h-8 px-2"
                  >
                    <Edit size={14} className="mr-1" /> Edit
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 px-2 text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${env.name}"?`)) {
                        deleteEnvironment(env.id);
                      }
                    }}
                  >
                    <Trash size={14} className="mr-1" /> Delete
                  </Button>
                </div>
                
                {env.id !== activeEnvironmentId ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSetActive(env.id)}
                    className="h-8"
                  >
                    Set Active
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 bg-primary/10 text-primary border-primary/20"
                    disabled
                  >
                    <Check size={14} className="mr-1" /> Active
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <EnvironmentModal
        isOpen={isEnvironmentModalOpen}
        onClose={() => setIsEnvironmentModalOpen(false)}
        environmentId={selectedEnvironmentId}
      />
      
      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        type="environment"
      />
    </div>
  );
};
