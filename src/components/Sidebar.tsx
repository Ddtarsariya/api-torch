// src/components/Sidebar.tsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppStore } from "../store";
import { Button } from "./ui/button";
import { ImportExportModal } from "./ImportExportModal";
import { EnvironmentModal } from "./EnvironmentModal";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { CollectionItem } from "./CollectionItem";
import { EnvironmentItem } from "./EnvironmentItem";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { ChevronDown, ChevronRight, MoreHorizontal, Edit, Trash, Download, Upload, Search, Plus, Folder, FileText, FolderPlus, Server, Globe, CheckCircle2, Copy, Settings, Star, StarOff, ArrowUpDown, ExternalLink, Save, BookmarkPlus, Layers, Command, Bookmark } from "lucide-react";

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const {
    getCollections,
    createCollection,
    getEnvironments,
    createEnvironment,
    getActiveWorkspace,
  } = useAppStore();
  const collections = getCollections();
  const environments = getEnvironments();
  const workspace = getActiveWorkspace();
  const activeEnvironmentId = workspace.activeEnvironmentId;

  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isEnvironmentModalOpen, setIsEnvironmentModalOpen] = useState(false);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [importExportType, setImportExportType] = useState<"collection" | "environment">("collection");
  const [favorites, setFavorites] = useState<string[]>([]);

  const location = useLocation();
  const navigate = useNavigate();
  const isEnvironmentsPage = location.pathname === "/environments";
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchQuery("");
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAddCollection = () => {
    createCollection("New Collection");
  };

  const handleAddEnvironment = () => {
    setSelectedEnvironmentId(undefined);
    setIsEnvironmentModalOpen(true);
  };

  const handleImportCollection = () => {
    setImportExportType("collection");
    setIsImportExportModalOpen(true);
  };

  const handleImportEnvironment = () => {
    setImportExportType("environment");
    setIsImportExportModalOpen(true);
  };

  const handleEditEnvironment = (id: string) => {
    setSelectedEnvironmentId(id);
    setIsEnvironmentModalOpen(true);
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  const filteredCollections = searchQuery
    ? collections.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    : collections;

  const filteredEnvironments = searchQuery
    ? environments.filter((e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    : environments;

  const favoriteCollections = collections.filter((c) =>
    favorites.includes(c.id),
  );

  return (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-sm border-r border-border">
      <div className="p-3 border-b border-border">
        <div className="relative mb-2">
          <Search size={14} className="absolute left-2.5 top-2 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={isEnvironmentsPage ? "Search environments..." : "Search collections..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      {!isEnvironmentsPage && (
        <ScrollArea className="flex-1">
          <div className="p-1.5">
            {favoriteCollections.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center px-2 py-1 text-[10px] font-medium text-muted-foreground">
                  <Star size={10} className="mr-1 text-amber-400" /> FAVORITES
                </div>
                <div className="space-y-0.5 mt-0.5">
                  {favoriteCollections.map((collection) => (
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
                    <Button variant="outline" size="sm" onClick={handleAddCollection} className="text-[10px] h-6 px-2">
                      <Plus size={10} className="mr-1" /> New Collection
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-0.5 mt-0.5">
                {filteredCollections.map((collection) => (
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
                    <Button variant="outline" size="sm" onClick={handleAddEnvironment} className="text-[10px] h-6 px-2">
                      <Plus size={10} className="mr-1" /> New Environment
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-0.5 mt-0.5">
                {filteredEnvironments.map((env) => (
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

      <div className="p-2 border-t border-border bg-card/80">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-[10px] h-6 px-2 flex items-center"
            onClick={() => navigate(isEnvironmentsPage ? "/" : "/environments")}
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
                  onClick={() => {
                    /* Settings functionality */
                  }}
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
