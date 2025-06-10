// src/components/ImportExportModal.tsx
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Button } from './ui/button';
import { importCollection, exportCollection, importEnvironment, exportEnvironment } from '../lib/import-export';
import { X } from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'collection' | 'environment';
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({ isOpen, onClose, type }) => {
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
  
  const collections = getCollections();
  const environments = getEnvironments();
  
  const handleImport = () => {
    setError('');
    
    try {
      if (type === 'collection') {
        const collection = importCollection(importText);
        createCollection(collection.name, collection.description);
      } else {
        const environment = importEnvironment(importText);
        createEnvironment(environment.name);
        updateEnvironment(environment.id, { variables: environment.variables });
      }
      
      onClose();
    } catch (error) {
      setError((error as Error).message);
    }
  };
  
  const handleExport = () => {
    setError('');
    
    try {
      if (type === 'collection') {
        const collection = collections.find(c => c.id === selectedItem);
        if (collection) {
          setExportText(exportCollection(collection));
        }
      } else {
        const environment = environments.find(e => e.id === selectedItem);
        if (environment) {
          setExportText(exportEnvironment(environment));
        }
      }
    } catch (error) {
      setError((error as Error).message);
    }
  };
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(exportText);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">
            {type === 'collection' ? 'Collection' : 'Environment'} Import/Export
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="flex mb-4 border-b">
            <button
              className={`px-4 py-2 ${activeTab === 'import' ? 'border-b-2 border-primary' : ''}`}
              onClick={() => setActiveTab('import')}
            >
              Import
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'export' ? 'border-b-2 border-primary' : ''}`}
              onClick={() => setActiveTab('export')}
            >
              Export
            </button>
          </div>
          
          {activeTab === 'import' ? (
            <div>
              <p className="mb-2">
                Paste your {type === 'collection' ? 'Postman Collection' : 'Environment'} JSON below:
              </p>
              <textarea
                className="w-full h-64 p-2 border rounded font-mono text-sm"
                value={importText}
                onChange={e => setImportText(e.target.value)}
              />
              
              {error && (
                <div className="mt-2 text-red-500">{error}</div>
              )}
              
              <div className="mt-4 flex justify-end">
                <Button variant="outline" className="mr-2" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleImport}>
                  Import
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <label className="block mb-2">
                  Select {type === 'collection' ? 'Collection' : 'Environment'}:
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedItem}
                  onChange={e => setSelectedItem(e.target.value)}
                >
                  <option value="">Select...</option>
                  {type === 'collection' 
                    ? collections.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))
                    : environments.map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))
                  }
                </select>
              </div>
              
              <div className="mb-4">
                <Button 
                  onClick={handleExport} 
                  disabled={!selectedItem}
                  className="mb-2"
                >
                  Generate Export
                </Button>
                
                <textarea
                  className="w-full h-48 p-2 border rounded font-mono text-sm"
                  value={exportText}
                  readOnly
                />
              </div>
              
              {error && (
                <div className="mt-2 text-red-500">{error}</div>
              )}
              
              <div className="mt-4 flex justify-end">
                <Button variant="outline" className="mr-2" onClick={onClose}>
                  Close
                </Button>
                <Button 
                  onClick={handleCopyToClipboard} 
                  disabled={!exportText}
                >
                  Copy to Clipboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
