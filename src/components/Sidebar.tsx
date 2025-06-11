// src/components/Sidebar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Collection, ApiRequest, Environment } from '../types';
import { Button } from './ui/button';
import {
  ChevronDown, ChevronRight,
  MoreHorizontal, Edit, Trash, Download, Upload,
  Search, Plus, Folder, FileText, FolderPlus,
  Server, Globe, CheckCircle2, Copy, Settings,
  Star, StarOff, ArrowUpDown, ExternalLink, Save,
  BookmarkPlus, Layers, Command, Bookmark
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ImportExportModal } from './ImportExportModal';
import { EnvironmentModal } from './EnvironmentModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Badge } from './ui/badge';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { ScrollArea } from '@radix-ui/react-scroll-area';

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const { getCollections, createCollection, getEnvironments, createEnvironment, getActiveWorkspace } = useAppStore();
  const collections = getCollections();
  const environments = getEnvironments();
  const workspace = getActiveWorkspace();
  const activeEnvironmentId = workspace.activeEnvironmentId;

  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isEnvironmentModalOpen, setIsEnvironmentModalOpen] = useState(false);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [importExportType, setImportExportType] = useState<'collection' | 'environment'>('collection');
  const [favorites, setFavorites] = useState<string[]>([]);

  const location = useLocation();
  const navigate = useNavigate();
  const isEnvironmentsPage = location.pathname === '/environments';
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Reset search when switching pages
  useEffect(() => {
    setSearchQuery('');
  }, [location.pathname]);

  // Focus search with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddCollection = () => {
    createCollection('New Collection');
  };

  const handleAddEnvironment = () => {
    setSelectedEnvironmentId(undefined);
    setIsEnvironmentModalOpen(true);
  };

  const handleImportCollection = () => {
    setImportExportType('collection');
    setIsImportExportModalOpen(true);
  };

  const handleImportEnvironment = () => {
    setImportExportType('environment');
    setIsImportExportModalOpen(true);
  };

  const handleEditEnvironment = (id: string) => {
    setSelectedEnvironmentId(id);
    setIsEnvironmentModalOpen(true);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  // Filter collections or environments based on search query
  const filteredCollections = searchQuery
    ? collections.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : collections;

  const filteredEnvironments = searchQuery
    ? environments.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : environments;

  // Get favorite collections
  const favoriteCollections = collections.filter(c => favorites.includes(c.id));

  return (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-sm border-r border-border">
      {/* Header with search - more compact */}
      <div className="p-3 border-b border-border">
        <div className="relative mb-2">
          <Search size={14} className="absolute left-2.5 top-2 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={isEnvironmentsPage ? "Search environments..." : "Search collections..."}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-10 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="absolute right-2.5 top-1.5 text-xs text-muted-foreground">
            <kbd className="px-1 py-0.5 bg-muted border rounded text-[10px]">⌘K</kbd>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h3 className="text-xs font-semibold flex items-center">
            {isEnvironmentsPage ? (
              <>
                <Server size={12} className="mr-1 text-primary" /> Environments
              </>
            ) : (
              <>
                <Layers size={12} className="mr-1 text-primary" /> Collections
              </>
            )}
          </h3>
          <div className="flex space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-md hover:bg-accent"
                    onClick={isEnvironmentsPage ? handleImportEnvironment : handleImportCollection}
                  >
                    <Upload size={12} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{isEnvironmentsPage ? "Import Environment" : "Import Collection"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-md hover:bg-accent"
                    onClick={isEnvironmentsPage ? handleAddEnvironment : handleAddCollection}
                  >
                    <Plus size={12} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{isEnvironmentsPage ? "New Environment" : "New Collection"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Collections View - more compact */}
      {!isEnvironmentsPage && (
        <ScrollArea className="flex-1">
          <div className="p-1.5">
            {/* Favorites Section */}
            {favoriteCollections.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center px-2 py-1 text-[10px] font-medium text-muted-foreground">
                  <Star size={10} className="mr-1 text-amber-400" /> FAVORITES
                </div>
                <div className="space-y-0.5 mt-0.5">
                  {favoriteCollections.map(collection => (
                    <CollectionItem
                      key={collection.id}
                      collection={collection}
                      onItemClick={onItemClick}
                      isFavorite={true}
                      onToggleFavorite={() => toggleFavorite(collection.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Collections */}
            <div className="flex items-center px-2 py-1 text-[10px] font-medium text-muted-foreground">
              <Layers size={10} className="mr-1" /> ALL COLLECTIONS
            </div>

            {filteredCollections.length === 0 ? (
              <div className="text-center py-4 px-2">
                {searchQuery ? (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <Search size={18} className="mx-auto text-muted-foreground mb-2 opacity-50" />
                    <p className="text-xs text-muted-foreground">No collections match your search</p>
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <FolderPlus size={18} className="mx-auto text-muted-foreground mb-2 opacity-50" />
                    <p className="text-xs text-muted-foreground mb-2">No collections yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddCollection}
                      className="text-[10px] h-6 px-2"
                    >
                      <Plus size={10} className="mr-1" /> New Collection
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-0.5 mt-0.5">
                {filteredCollections.map(collection => (
                  <CollectionItem
                    key={collection.id}
                    collection={collection}
                    onItemClick={onItemClick}
                    isFavorite={favorites.includes(collection.id)}
                    onToggleFavorite={() => toggleFavorite(collection.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      {/* Environments View - more compact */}
      {isEnvironmentsPage && (
        <ScrollArea className="flex-1">
          <div className="p-1.5">
            <div className="flex items-center px-2 py-1 text-[10px] font-medium text-muted-foreground">
              <Server size={10} className="mr-1" /> ENVIRONMENTS
            </div>

            {filteredEnvironments.length === 0 ? (
              <div className="text-center py-4 px-2">
                {searchQuery ? (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <Search size={18} className="mx-auto text-muted-foreground mb-2 opacity-50" />
                    <p className="text-xs text-muted-foreground">No environments match your search</p>
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <Server size={18} className="mx-auto text-muted-foreground mb-2 opacity-50" />
                    <p className="text-xs text-muted-foreground mb-2">No environments yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddEnvironment}
                      className="text-[10px] h-6 px-2"
                    >
                      <Plus size={10} className="mr-1" /> New Environment
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-0.5 mt-0.5">
                {filteredEnvironments.map(env => (
                  <EnvironmentItem
                    key={env.id}
                    environment={env}
                    isActive={env.id === activeEnvironmentId}
                    onEdit={() => handleEditEnvironment(env.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      {/* Footer with navigation links - more compact */}
      <div className="p-2 border-t border-border bg-card/80">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-[10px] h-6 px-2 flex items-center"
            onClick={() => navigate(isEnvironmentsPage ? '/' : '/environments')}
          >
            {isEnvironmentsPage ? (
              <>
                <Layers size={12} className="mr-1" /> Collections
              </>
            ) : (
              <>
                <Server size={12} className="mr-1" /> Environments
              </>
            )}
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-md hover:bg-accent"
                  onClick={() => {/* Settings functionality */ }}
                >
                  <Settings size={12} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        type={importExportType}
      />

      <EnvironmentModal
        isOpen={isEnvironmentModalOpen}
        onClose={() => setIsEnvironmentModalOpen(false)}
        environmentId={selectedEnvironmentId}
      />
    </div>
  );
};

interface CollectionItemProps {
  collection: Collection;
  level?: number;
  onItemClick?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const CollectionItem: React.FC<CollectionItemProps> = ({
  collection,
  level = 0,
  onItemClick,
  isFavorite = false,
  onToggleFavorite
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const { createRequest, setActiveRequest, updateCollection, deleteCollection } = useAppStore();
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(collection.name);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [isRenaming]);

  const handleAddRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    setIsRenaming(true);
    setNewName(collection.name);
  };

  const submitRename = () => {
    if (newName.trim()) {
      updateCollection(collection.id, { name: newName.trim() });
    }
    setIsRenaming(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${collection.name}"?`)) {
      deleteCollection(collection.id);
    }
  };
  return (
    <div className="mb-0.5 group">
      <div
        className={`
          flex items-center justify-between py-1 px-2 rounded-md hover:bg-accent/50 cursor-pointer
          ${level > 0 ? 'text-xs' : 'text-xs'}
        `}
        style={{ paddingLeft: `${level * 10 + 8}px` }}
      >
        {isRenaming ? (
          <div className="flex-1 flex items-center" onClick={e => e.stopPropagation()}>
            <button className="mr-1 text-muted-foreground">
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <Folder size={14} className="mr-1.5 text-muted-foreground" />
            <input
              ref={renameInputRef}
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onBlur={submitRename}
              onKeyDown={e => {
                if (e.key === 'Enter') submitRename();
                if (e.key === 'Escape') setIsRenaming(false);
              }}
              className="flex-1 bg-background border border-input px-2 py-0.5 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        ) : (
          <div className="flex items-center flex-1 overflow-hidden" onClick={() => setIsOpen(!isOpen)}>
            <button className="mr-1 text-muted-foreground">
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <Folder size={14} className="mr-1.5 text-muted-foreground" />
            <span className="truncate font-medium">{collection.name}</span>
            {collection.items.length > 0 && (
              <Badge variant="outline" className="ml-1.5 text-[10px] px-1 py-0 h-3.5 min-w-3.5 flex items-center justify-center">
                {collection.items.length}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                  onClick={onToggleFavorite}
                >
                  {isFavorite ? (
                    <Star size={12} className="text-amber-400" />
                  ) : (
                    <StarOff size={12} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{isFavorite ? "Remove from favorites" : "Add to favorites"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                  onClick={handleAddRequest}
                >
                  <Plus size={12} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">New Request</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="relative">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                  >
                    <MoreHorizontal size={12} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">More options</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-popover border rounded-md shadow-lg z-10 animate-in fade-in-50 zoom-in-95">
                <div className="py-0.5">
                  <button
                    className="flex items-center w-full px-3 py-1 text-xs text-left hover:bg-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRename();
                      setShowMenu(false);
                    }}
                  >
                    <Edit size={12} className="mr-2" /> Rename
                  </button>
                  <button
                    className="flex items-center w-full px-3 py-1 text-xs text-left hover:bg-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsImportExportModalOpen(true);
                      setShowMenu(false);
                    }}
                  >
                    <Download size={12} className="mr-2" /> Export
                  </button>
                  <button
                    className="flex items-center w-full px-3 py-1 text-xs text-left hover:bg-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Duplicate functionality
                      setShowMenu(false);
                    }}
                  >
                    <Copy size={12} className="mr-2" /> Duplicate
                  </button>
                  <Separator className="my-0.5" />
                  <button
                    className="flex items-center w-full px-3 py-1 text-xs text-left hover:bg-accent text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                      setShowMenu(false);
                    }}
                  >
                    <Trash size={12} className="mr-2" /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div> {isOpen && (
        <div className="ml-3">
          {collection.items.map(item => {
            if ('method' in item) {
              // It's a request
              return (
                <RequestItem
                  key={item.id}
                  request={item as ApiRequest}
                  level={level + 1}
                  onItemClick={onItemClick}
                />
              );
            } else {
              // It's a folder
              return (
                <CollectionItem
                  key={item.id}
                  collection={item as Collection}
                  level={level + 1}
                  onItemClick={onItemClick}
                  isFavorite={isFavorite}
                  onToggleFavorite={onToggleFavorite}
                />
              );
            }
          })}
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
  const { setActiveRequest, activeRequestId, deleteRequest } = useAppStore();
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(request.name);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [isRenaming]);

  const handleClick = () => {
    setActiveRequest(request.id);
    if (onItemClick) onItemClick();
  };

  const handleRename = () => {
    setIsRenaming(true);
    setNewName(request.name);
  };

  const submitRename = () => {
    if (newName.trim()) {
      // Update request name functionality would go here
    }
    setIsRenaming(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${request.name}"?`)) {
      deleteRequest(request.id);
    }
  };

  const getMethodColor = () => {
    switch (request.method) {
      case 'GET': return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30';
      case 'POST': return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30';
      case 'PUT': return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30';
      case 'DELETE': return 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30';
      case 'PATCH': return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/30';
      default: return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800/30';
    }
  };

  return (
    <div
      className={`
        flex items-center justify-between py-1 px-2 rounded-md cursor-pointer group
        ${activeRequestId === request.id ? 'bg-primary/10 text-primary' : 'hover:bg-accent/50'}
      `}
      style={{ paddingLeft: `${level * 10 + 8}px` }}
      onClick={isRenaming ? undefined : handleClick}
    >
      {isRenaming ? (
        <div className="flex-1 flex items-center" onClick={e => e.stopPropagation()}>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-sm mr-1.5 ${getMethodColor()}`}>
            {request.method}
          </span>
          <input
            ref={renameInputRef}
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onBlur={submitRename}
            onKeyDown={e => {
              if (e.key === 'Enter') submitRename();
              if (e.key === 'Escape') setIsRenaming(false);
            }}
            className="flex-1 bg-background border border-input px-2 py-0.5 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      ) : (
        <div className="flex items-center flex-1 overflow-hidden">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-sm mr-1.5 ${getMethodColor()}`}>
            {request.method}
          </span>
          <span className="truncate text-xs">{request.name}</span>
        </div>
      )}

      <div className="relative">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
              >
                <MoreHorizontal size={12} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">More options</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {showMenu && (
          <div className="absolute right-0 mt-1 w-48 bg-popover border rounded-md shadow-lg z-10 animate-in fade-in-50 zoom-in-95">
            <div className="py-0.5">
              <button
                className="flex items-center w-full px-3 py-1 text-xs text-left hover:bg-accent"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRename();
                  setShowMenu(false);
                }}
              >
                <Edit size={12} className="mr-2" /> Rename
              </button>
              <button
                className="flex items-center w-full px-3 py-1 text-xs text-left hover:bg-accent"
                onClick={(e) => {
                  e.stopPropagation();
                  // Duplicate functionality
                  setShowMenu(false);
                }}
              >
                <Copy size={12} className="mr-2" /> Duplicate
              </button>
              <Separator className="my-0.5" />
              <button
                className="flex items-center w-full px-3 py-1 text-xs text-left hover:bg-accent text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                  setShowMenu(false);
                }}
              >
                <Trash size={12} className="mr-2" /> Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface EnvironmentItemProps {
  environment: Environment;
  isActive: boolean;
  onEdit: () => void;
}

const EnvironmentItem: React.FC<EnvironmentItemProps> = ({ environment, isActive, onEdit }) => {
  const { setActiveEnvironment, deleteEnvironment } = useAppStore();
  const [showMenu, setShowMenu] = useState(false);

  const handleSetActive = () => {
    setActiveEnvironment(environment.id);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${environment.name}"?`)) {
      deleteEnvironment(environment.id);
    }
  };

  return (
    <div
      className={`
        flex items-center justify-between py-1.5 px-2.5 rounded-md cursor-pointer group
        ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-accent/50'}
      `}
    >
      <div className="flex items-center flex-1 overflow-hidden" onClick={handleSetActive}>
        {isActive ? (
          <Server size={14} className="mr-1.5 text-primary" />
        ) : (
          <Globe size={14} className="mr-1.5 text-muted-foreground" />
        )}
        <span className="truncate text-xs font-medium">{environment.name}</span>
        {isActive && (
          <Badge variant="outline" className="ml-1.5 text-[10px] px-1 py-0 h-4 bg-primary/10 text-primary border-primary/20">
            Active
          </Badge>
        )}
      </div>

      <div className="relative">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
              >
                <MoreHorizontal size={12} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">More options</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {showMenu && (
          <div className="absolute right-0 mt-1 w-48 bg-popover border rounded-md shadow-lg z-10 animate-in fade-in-50 zoom-in-95">
            <div className="py-0.5">
              <button
                className="flex items-center w-full px-3 py-1 text-xs text-left hover:bg-accent"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  setShowMenu(false);
                }}
              >
                <Edit size={12} className="mr-2" /> Edit
              </button>
              {!isActive && (
                <button
                  className="flex items-center w-full px-3 py-1 text-xs text-left hover:bg-accent"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetActive();
                    setShowMenu(false);
                  }}
                >
                  <CheckCircle2 size={12} className="mr-2" /> Set as Active
                </button>
              )}
              <button
                className="flex items-center w-full px-3 py-1 text-xs text-left hover:bg-accent"
                onClick={(e) => {
                  e.stopPropagation();
                  // Duplicate functionality
                  setShowMenu(false);
                }}
              >
                <Copy size={12} className="mr-2" /> Duplicate
              </button>
              <Separator className="my-0.5" />
              <button
                className="flex items-center w-full px-3 py-1 text-xs text-left hover:bg-accent text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                  setShowMenu(false);
                }}
              >
                <Trash size={12} className="mr-2" /> Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
