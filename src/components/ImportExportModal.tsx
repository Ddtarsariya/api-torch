import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { Button } from './ui/button';
import {
  importCollection,
  exportCollection,
  importEnvironment,
  exportEnvironment,
  importOpenAPI
} from '../lib/import-export';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { CustomSelect } from './ui/select';
interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'collection' | 'environment';
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  type
}) => {
  const {
    getCollections,
    getEnvironments,
    createCollection,
    createEnvironment,
    updateCollection,
    updateEnvironment
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [importText, setImportText] = useState('');
  const [exportText, setExportText] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const collections = getCollections();
  const environments = getEnvironments();


  const handleImport = async () => {
    setError('');
    setIsLoading(true);
  
    try {
      const parsedData = JSON.parse(importText);
      
      if (type === 'collection') {
        let collection;
        let environment;
  
        if (parsedData.openapi) {
          // Handle OpenAPI import
          const result = importOpenAPI(importText);
          collection = result;
          
          // Create baseUrl environment if it exists in the OpenAPI spec
          if (result.environment) {
            environment = result.environment;
          }
        } else {
          // Handle Postman import
          collection = importCollection(importText);
        }
  
        // Create the collection
        createCollection(collection.name, collection.description, collection.items);
  
        // Create the environment if it exists
        if (environment) {
          // Use the enhanced createEnvironment function with variables
          createEnvironment(environment.name, environment.variables);
        }
      } else {
        // Handle environment import
        const environment = importEnvironment(importText);
        
        // Use the enhanced createEnvironment function with variables
        createEnvironment(environment.name, environment.variables);
      }
  
      onClose();
    } catch (error) {
      console.error("Import error:", error);
      setError(`Invalid ${type} JSON format. Please check your input.`);
    } finally {
      setIsLoading(false);
    }
  };


  const handleExport = () => {
    setError('');
    try {
      if (type === 'collection') {
        const collection = collections.find(c => c.id === selectedItem);
        if (collection) setExportText(exportCollection(collection));
      } else {
        const environment = environments.find(e => e.id === selectedItem);
        if (environment) setExportText(exportEnvironment(environment));
      }
    } catch {
      setError(`Failed to export ${type}. Please try again.`);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(exportText);
  };

  if (!isOpen) return null;

  const items = type === 'collection' ? collections : environments;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{type === 'collection' ? 'Collection' : 'Environment'} Import/Export</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'import' | 'export')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4 mt-4">
            <div>
              <p className="mb-2">Paste your {type} JSON below:</p>
              <textarea
                className="w-full h-64 p-2 border rounded font-mono text-sm"
                value={importText}
                onChange={e => setImportText(e.target.value)}
                disabled={isLoading}
              />
              {error && <div className="mt-2 text-red-500">{error}</div>}

              <div className="mt-4 flex justify-end">
                <Button variant="outline" className="mr-2" onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={isLoading}>
                  {isLoading ? 'Importing...' : 'Import'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4 mt-4">
            <div>
              <label className="block mb-2">Select {type}:</label>

              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">No {type}s available to export.</p>
              ) : (
                <CustomSelect
                  value={selectedItem}
                  onValueChange={setSelectedItem}
                  options={items} // items should be an array of objects with 'id' and 'name' properties
                  placeholder={`Select ${type}...`}
                />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-end">
                <Button
                  onClick={handleExport}
                  disabled={!selectedItem}
                  size="sm"
                  className="mb-2"
                >
                  Generate Export
                </Button>
              </div>

              <textarea
                className="w-full h-48 p-2 border rounded font-mono text-sm"
                value={exportText}
                readOnly
                placeholder="Export data will appear here..."
              />
            </div>

            {error && <div className="text-sm text-red-500">{error}</div>}
          </TabsContent>
        </Tabs>

        {activeTab === 'export' && (
          <DialogFooter className="flex justify-between items-center">
            {exportText && (
              <Button onClick={handleCopyToClipboard} size="sm" variant="outline">
                Copy to Clipboard
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
