import React, { useState } from "react";
import { useAppStore } from "../store";
import { Button } from "./ui/button";
import {
  Plus,
  Settings,
  ChevronDown,
  Server,
  Globe,
  Check,
  Upload,
  Download,
  Edit,
} from "lucide-react";
import { EnvironmentModal } from "./EnvironmentModal";
import { ImportExportModal } from "./ImportExportModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface EnvironmentSelectorProps {
  compact?: boolean;
}

export const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({
  compact = false,
}) => {
  const {
    getEnvironments,
    getActiveWorkspace,
    setActiveEnvironment,
    createEnvironment,
  } = useAppStore();

  const environments = getEnvironments();
  const workspace = getActiveWorkspace();
  const activeEnvironment = environments.find(
    (e) => e.id === workspace.activeEnvironmentId,
  );

  const [isEnvironmentModalOpen, setIsEnvironmentModalOpen] = useState(false);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<
    string | undefined
  >(undefined);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);

  const handleEnvironmentChange = (id: string) => {
    setActiveEnvironment(id || null);
  };

  const handleCreateEnvironment = () => {
    setSelectedEnvironmentId(undefined);
    setIsEnvironmentModalOpen(true);
  };

  const handleEditEnvironment = () => {
    if (activeEnvironment) {
      setSelectedEnvironmentId(activeEnvironment.id);
      setIsEnvironmentModalOpen(true);
    }
  };

  const handleImportExport = () => {
    setIsImportExportModalOpen(true);
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium flex items-center">
            <Server size={14} className="mr-1.5 text-muted-foreground" />
            Environment
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={handleCreateEnvironment}
                >
                  <Plus size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create new environment</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="relative">
          <select
            value={activeEnvironment?.id || ""}
            onChange={(e) => handleEnvironmentChange(e.target.value)}
            className="w-full h-8 px-3 py-1 pr-8 text-sm border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
          >
            <option value="">No Environment</option>
            {environments.map((env) => (
              <option key={env.id} value={env.id}>
                {env.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-muted-foreground"
          />
        </div>

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
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center justify-between min-w-[180px] px-3 py-1 h-9 text-sm border-muted-foreground/20 hover:bg-accent transition-colors"
          >
            <div className="flex items-center">
              {activeEnvironment ? (
                <Server size={14} className="mr-2 text-primary" />
              ) : (
                <Globe size={14} className="mr-2 text-muted-foreground" />
              )}
              <span className="truncate max-w-[120px] font-medium">
                {activeEnvironment ? activeEnvironment.name : "No Environment"}
              </span>
              {activeEnvironment && (
                <Badge
                  variant="outline"
                  className="ml-2 px-1 py-0 h-5 text-[10px] bg-primary/10 text-primary border-primary/20"
                >
                  Active
                </Badge>
              )}
            </div>
            <ChevronDown size={14} className="ml-2 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[240px]">
          <DropdownMenuLabel className="flex items-center">
            <Server size={14} className="mr-2" />
            Environments
          </DropdownMenuLabel>

          <DropdownMenuItem
            className={`flex items-center justify-between ${!activeEnvironment ? "bg-primary/10 text-primary font-medium" : ""}`}
            onClick={() => handleEnvironmentChange("")}
          >
            <div className="flex items-center">
              <Globe size={14} className="mr-2" />
              No Environment
            </div>
            {!activeEnvironment && <Check size={14} />}
          </DropdownMenuItem>

          {environments.map((env) => (
            <DropdownMenuItem
              key={env.id}
              className={`flex items-center justify-between ${activeEnvironment?.id === env.id ? "bg-primary/10 text-primary font-medium" : ""}`}
              onClick={() => handleEnvironmentChange(env.id)}
            >
              <div className="flex items-center">
                <Server size={14} className="mr-2" />
                <span className="truncate max-w-[160px]">{env.name}</span>
              </div>
              {activeEnvironment?.id === env.id && <Check size={14} />}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleCreateEnvironment}
            className="text-primary"
          >
            <Plus size={14} className="mr-2" /> New Environment
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleEditEnvironment}
            disabled={!activeEnvironment}
            className={
              !activeEnvironment ? "opacity-50 cursor-not-allowed" : ""
            }
          >
            <Edit size={14} className="mr-2" /> Edit Current Environment
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleImportExport}
            className="flex items-center"
          >
            <div className="flex items-center">
              <Download size={14} className="mr-2" /> Import/Export
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
    </>
  );
};
