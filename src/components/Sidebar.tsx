// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { useAppStore } from '../store';
import type { Collection, ApiRequest } from '../types';
import { Button } from './ui/button';
import { 
  PlusCircle, FolderPlus, ChevronDown, ChevronRight, 
  MoreHorizontal, Edit, Trash, Download, Upload, 
  Search, Plus, Folder, FileText, MoreVertical
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ImportExportModal } from './ImportExportModal';

interface SidebarProps {
  onItemClick?: () => void;
}

interface CollectionItemProps {
  collection: Collection;
  level?: number;
  onItemClick?: () => void;
}

const CollectionItem: React.FC<CollectionItemProps> = ({ collection, level = 0, onItemClick }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const { createRequest, setActiveRequest, updateCollection, deleteCollection } = useAppStore();
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  
  const handleAddRequest = () => {
    const id = createRequest(collection.id, {
      name: 'New Request',
      method: 'GET',
      url: '',
      headers: [],
      params: [],
      body: { contentType: 'none', content: '' },
      preRequestScript: '',
      testScript: '',
    });
    setActiveRequest(id);
    if (onItemClick) onItemClick();
  };
  
  const handleRename = () => {
    const newName = prompt('Enter new collection name:', collection.name);
    if (newName && newName.trim()) {
      updateCollection(collection.id, { name: newName });
    }
    setShowMenu(false);
  };
  
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${collection.name}" collection?`)) {
      deleteCollection(collection.id);
    }
    setShowMenu(false);
  };
  
  const handleImportExport = () => {
    setIsImportExportModalOpen(true);
    setShowMenu(false);
  };
  
  return (
    <div className="mb-1 relative group">
      <div 
        className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-accent/70 cursor-pointer"
        style={{ paddingLeft: `${(level * 8) + 8}px` }}
      >
        <div 
          className="flex items-center flex-1 min-w-0" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <button className="p-0.5 rounded-sm hover:bg-accent/80 mr-1">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <Folder size={14} className="mr-1.5 text-indigo-500 flex-shrink-0" />
          <span className="font-medium truncate text-sm">{collection.name}</span>
        </div>
        
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={handleAddRequest}
            title="Add Request"
          >
            <Plus size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={() => setShowMenu(!showMenu)}
            title="More Options"
          >
            <MoreVertical size={14} />
          </Button>
        </div>
      </div>
      
      {showMenu && (
        <div className="absolute right-0 mt-1 w-48 bg-popover border rounded-md shadow-lg z-10">
          <div className="py-1">
            <button 
              className="flex items-center w-full px-3 py-1.5 text-sm text-left hover:bg-accent"
              onClick={handleRename}
            >
              <Edit size={14} className="mr-2" /> Rename
            </button>
            <button 
              className="flex items-center w-full px-3 py-1.5 text-sm text-left hover:bg-accent"
              onClick={handleImportExport}
            >
              <Download size={14} className="mr-2" /> Export/Import
            </button>
            <button 
              className="flex items-center w-full px-3 py-1.5 text-sm text-left text-destructive hover:bg-accent"
              onClick={handleDelete}
            >
              <Trash size={14} className="mr-2" /> Delete
            </button>
          </div>
        </div>
      )}
      
      {isOpen && (
        <div className="ml-2">
          {collection.items.map(item => (
            'method' in item ? (
              <RequestItem 
                key={item.id} 
                request={item} 
                level={level + 1} 
                onItemClick={onItemClick}
              />
            ) : (
              <CollectionItem 
                key={item.id} 
                collection={item} 
                level={level + 1} 
                onItemClick={onItemClick}
              />
            )
          ))}
        </div>
      )}
      
      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        type="collection"
      />
    </div>
  );
};

interface RequestItemProps {
  request: ApiRequest;
  level?: number;
  onItemClick?: () => void;
}

const RequestItem: React.FC<RequestItemProps> = ({ request, level = 0, onItemClick }) => {
  const { activeRequestId, setActiveRequest, updateRequest, deleteRequest } = useAppStore();
  const [showMenu, setShowMenu] = useState(false);
  
  const isActive = activeRequestId === request.id;
  
  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30';
      case 'POST': return 'text-blue-500 bg-blue-50 dark:bg-blue-950/30';
      case 'PUT': return 'text-amber-500 bg-amber-50 dark:bg-amber-950/30';
      case 'DELETE': return 'text-rose-500 bg-rose-50 dark:bg-rose-950/30';
      case 'PATCH': return 'text-purple-500 bg-purple-50 dark:bg-purple-950/30';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-800/30';
    }
  };
  
  const handleClick = () => {
    setActiveRequest(request.id);
    if (onItemClick) onItemClick();
  };
  
  const handleRename = () => {
    const newName = prompt('Enter new request name:', request.name);
    if (newName && newName.trim()) {
      updateRequest(request.id, { name: newName });
    }
    setShowMenu(false);
  };
  
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${request.name}" request?`)) {
      deleteRequest(request.id);
    }
    setShowMenu(false);
  };
  
  const handleDuplicate = () => {
    const newRequest = { ...request, id: uuidv4(), name: `${request.name} (Copy)` };
    // This would need to be implemented in the store
    // duplicateRequest(newRequest);
    setShowMenu(false);
  };
  
  return (
    <div className="relative group">
      <div 
        className={`
          flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer
          ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-accent/70'} `}
        style={{ paddingLeft: `${(level * 8) + 24}px` }}
        onClick={handleClick}
      >
        <div className="flex items-center flex-1 min-w-0">
          <span className={`mr-2 text-xs font-bold px-1.5 py-0.5 rounded-sm ${getMethodColor(request.method)}`}>
            {request.method}
          </span>
          <span className="truncate text-sm">{request.name}</span>
        </div>
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreVertical size={14} />
          </Button>
        </div>
      </div>
      
      {showMenu && (
        <div className="absolute right-0 mt-1 w-48 bg-popover border rounded-md shadow-lg z-10">
          <div className="py-1">
            <button 
              className="flex items-center w-full px-3 py-1.5 text-sm text-left hover:bg-accent"
              onClick={handleRename}
            >
              <Edit size={14} className="mr-2" /> Rename
            </button>
            <button 
              className="flex items-center w-full px-3 py-1.5 text-sm text-left hover:bg-accent"
              onClick={handleDuplicate}
            >
              <PlusCircle size={14} className="mr-2" /> Duplicate
            </button>
            <button 
              className="flex items-center w-full px-3 py-1.5 text-sm text-left text-destructive hover:bg-accent"
              onClick={handleDelete}
            >
              <Trash size={14} className="mr-2" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const { getCollections, createCollection } = useAppStore();
  const collections = getCollections();
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleAddCollection = () => {
    createCollection('New Collection');
  };
  
  const handleImportCollection = () => {
    setIsImportExportModalOpen(true);
  };
  
  return (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-sm">
      {/* Header with search */}
      <div className="p-3 border-b border-border">
        <div className="relative mb-3">
          <Search size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search collections..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs h-8"
            onClick={handleAddCollection}
          >
            <FolderPlus size={14} className="mr-1.5" /> New Collection
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-9 h-8 px-0"
            onClick={handleImportCollection}
            title="Import Collection"
          >
            <Upload size={14} />
          </Button>
        </div>
      </div>
      
      {/* Collections list */}
      <div className="flex-1 overflow-y-auto p-2">
        {collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <FolderPlus size={32} className="text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">No collections yet</p>
            <p className="text-muted-foreground text-xs mt-1">Create a collection to organize your requests</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={handleAddCollection}
            >
              <Plus size={14} className="mr-1.5" /> New Collection
            </Button>
          </div>
        ) : (
          collections
            .filter(collection => 
              searchQuery === '' || 
              collection.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map(collection => (
              <CollectionItem 
                key={collection.id} 
                collection={collection} 
                onItemClick={onItemClick}
              />
            ))
        )}
      </div>
      
      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        type="collection"
      />
    </div>
  );
};
