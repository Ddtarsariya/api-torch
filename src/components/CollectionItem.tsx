// File: src\components\CollectionItem.tsx

import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "../store";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { ChevronDown, ChevronRight, MoreHorizontal, Edit, Trash, Download, Copy, Folder, FolderPlus, Star, StarOff, Plus } from "lucide-react";
import { Badge } from "./ui/badge";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { ImportExportModal } from "./ImportExportModal";
import { RequestItem } from "./RequestItem";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import type { ApiRequest, Collection } from "../types";
import { v4 as uuidv4 } from 'uuid';

interface CollectionItemProps {
  collection: Collection;
  level?: number;
  onItemClick?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const CollectionItem: React.FC<CollectionItemProps> = ({
  collection,
  level = 0,
  onItemClick,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    createRequest,
    setActiveRequest,
    updateCollection,
    deleteCollection,
    createCollection,
  } = useAppStore();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(collection.name);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    if (isRenaming) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    const id = createRequest(collection.id, {
      name: "New Request",
      method: "GET",
      url: "",
      headers: [],
      params: [],
      body: { contentType: "none", content: "" },
      preRequestScript: "",
      testScript: "",
    });
    setActiveRequest(id);
    if (onItemClick) onItemClick();
  };

  const handleAddFolder = (e: React.MouseEvent) => {
    e.stopPropagation();

    const newFolder: Collection = {
      id: uuidv4(),
      name: "New Folder",
      description: "",
      items: [],
    };

    updateCollection(collection.id, {
      items: [...collection.items, newFolder],
    });

    setIsOpen(true);
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
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteCollection(collection.id);
    setShowDeleteDialog(false);
  };

  const handleDuplicate = () => {
    const duplicatedCollection = deepCloneItem(collection) as Collection;
    createCollection(duplicatedCollection.name, duplicatedCollection.description);
  };

  return (
    <div className="mb-0.5 group">
      <div
        className={`
          flex items-center justify-between py-1 px-2 rounded-md hover:bg-accent/50 cursor-pointer
          ${level > 0 ? "text-xs" : "text-xs"}
        `}
        style={{ paddingLeft: `${level * 10 + 8}px` }}
      >
        {isRenaming ? (
          <div
            className="flex-1 flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="mr-1 text-muted-foreground">
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <Folder size={14} className="mr-1.5 text-muted-foreground" />
            <input
              ref={renameInputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={submitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitRename();
                if (e.key === "Escape") setIsRenaming(false);
              }}
              className="flex-1 bg-background border border-input px-2 py-0.5 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        ) : (
          <div
            className="flex items-center flex-1 overflow-hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <button className="mr-1 text-muted-foreground">
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <Folder size={14} className="mr-1.5 text-muted-foreground" />
            <span className="truncate font-medium">{collection.name}</span>
            {collection.items.length > 0 && (
              <Badge
                variant="outline"
                className="ml-1.5 text-[10px] px-1 py-0 h-3.5 min-w-3.5 flex items-center justify-center"
              >
                {collection.items.length}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center space-x-1" ref={menuRef}>
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
                <p className="text-xs">
                  {isFavorite ? "Remove from favorites" : "Add to favorites"}
                </p>
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
                      setIsExportModalOpen(true);
                      setShowMenu(false);
                    }}
                  >
                    <Download size={12} className="mr-2" /> Export
                  </button>
                  <button
                    className="flex items-center w-full px-3 py-1 text-xs text-left hover:bg-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicate();
                      setShowMenu(false);
                    }}
                  >
                    <Copy size={12} className="mr-2" /> Duplicate
                  </button>
                  <button
                    className="flex items-center w-full px-3 py-1 text-xs text-left hover:bg-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddFolder(e);
                      setShowMenu(false);
                    }}
                  >
                    <FolderPlus size={12} className="mr-2" /> Add Folder
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
      </div>
      {isOpen && (
        <div className="ml-3">
          {collection.items.map((item) => {
            if ("method" in item) {
              return (
                <RequestItem
                  key={item.id}
                  request={item as ApiRequest}
                  level={level + 1}
                  onItemClick={onItemClick}
                />
              );
            } else {
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
      {isExportModalOpen && (
        <ImportExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          type="collection"
        />
      )}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the collection "{collection.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

function deepCloneItem(collection: Collection): Collection {
  // Implement deep clone logic here
  return {
    ...collection,
    id: uuidv4(),
    items: collection.items.map((item) =>
      "method" in item
        ? { ...item, id: uuidv4() }
        : deepCloneItem(item as Collection)
    ),
  };
}