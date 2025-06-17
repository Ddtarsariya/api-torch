// src/components/EnvironmentItem.tsx
import React, { useState } from "react";
import { useAppStore } from "../store";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { MoreHorizontal, Edit, Trash, Copy, Server, Globe, CheckCircle2 } from "lucide-react";
import { Separator } from "@radix-ui/react-dropdown-menu";
import type { Environment } from "../types";
import { Badge } from "./ui/badge";

interface EnvironmentItemProps {
  environment: Environment;
  isActive: boolean;
  onEdit: () => void;
}

export const EnvironmentItem: React.FC<EnvironmentItemProps> = ({
  environment,
  isActive,
  onEdit,
}) => {
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
        ${isActive ? "bg-primary/10 text-primary" : "hover:bg-accent/50"}
      `}
    >
      <div
        className="flex items-center flex-1 overflow-hidden"
        onClick={handleSetActive}
      >
        {isActive ? (
          <Server size={14} className="mr-1.5 text-primary" />
        ) : (
          <Globe size={14} className="mr-1 .5 text-muted-foreground" />
        )}
        <span className="truncate text-xs font-medium">{environment.name}</span>
        {isActive && (
          <Badge
            variant="outline"
            className="ml-1.5 text-[10px] px-1 py-0 h-4 bg-primary/10 text-primary border-primary/20"
          >
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
