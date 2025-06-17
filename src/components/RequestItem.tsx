import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "../store";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { MoreHorizontal, Edit, Trash, Copy } from "lucide-react";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { v4 as uuidv4 } from "uuid"; // Ensure this import is correct
import type { ApiRequest } from "../types";

interface RequestItemProps {
  request: ApiRequest;
  level?: number;
  onItemClick?: () => void;
}

export const RequestItem: React.FC<RequestItemProps> = ({
  request,
  level = 0,
  onItemClick,
}) => {
  const {
    setActiveRequest,
    activeRequestId,
    deleteRequest,
    updateRequest,
    createRequest,
  } = useAppStore();
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
      updateRequest(request.id, { name: newName.trim() });
    }
    setIsRenaming(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${request.name}"?`)) {
      deleteRequest(request.id);
    }
  };

  const handleDuplicate = () => {
    const duplicatedRequest = {
      ...request,
      id: uuidv4(),
      name: `${request.name} (Copy)`,
    };

    // Check if collectionId is defined
    if (request.collectionId) {
      const newId = createRequest(request.collectionId, duplicatedRequest);
      setActiveRequest(newId);
    } else {
      console.error("Collection ID is undefined. Cannot duplicate request.");
    }

    if (onItemClick) onItemClick();
  };

  const getMethodColor = () => {
    switch (request.method) {
      case "GET":
        return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30";
      case "POST":
        return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30";
      case "PUT":
        return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30";
      case "DELETE":
        return "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30";
      case "PATCH":
        return "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/30";
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800/30";
    }
  };

  return (
    <div
      className={`
        flex items-center justify-between py-1 px-2 rounded-md cursor-pointer group
        ${activeRequestId === request.id ? "bg-primary/10 text-primary" : "hover:bg-accent/50"}
      `}
      style={{ paddingLeft: `${level * 10 + 8}px` }}
      onClick={isRenaming ? undefined : handleClick}
    >
      {isRenaming ? (
        <div
          className="flex-1 flex items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-sm mr-1.5 ${getMethodColor()}`}
          >
            {request.method}
          </span>
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
        <div className="flex items-center flex-1 overflow-hidden">
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-sm mr-1.5 ${getMethodColor()}`}
          >
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
                  handleDuplicate();
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
