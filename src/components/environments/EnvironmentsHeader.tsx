import React from "react";
import {
  Server,
  Search,
  SlidersHorizontal,
  FileJson,
  Plus,
  Check,
  Database,
  Layers,
  Globe,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { Environment } from "../../types";
import { EnvironmentStats } from "./EnvironmentStats"; // Import the stats component

interface EnvironmentsHeaderProps {
  activeEnvironmentId: string | null;
  environments: Environment[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: "grid" | "list" | "compact";
  setViewMode: (mode: "grid" | "list" | "compact") => void;
  sortBy: "name" | "variables" | "recent";
  setSortBy: (sort: "name" | "variables" | "recent") => void;
  showOnlyActive: boolean;
  setShowOnlyActive: (show: boolean) => void;
  onCreateEnvironment: () => void;
  onImportExport: () => void;
}

export const EnvironmentsHeader: React.FC<EnvironmentsHeaderProps> = ({
  activeEnvironmentId,
  environments,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  showOnlyActive,
  setShowOnlyActive,
  onCreateEnvironment,
  onImportExport,
}) => {
  const activeEnvironment = environments.find(
    (e) => e.id === activeEnvironmentId,
  );

  return (
    <div className="w-full bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b">
      <div className="max-w-[2000px] mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Server className="mr-3 text-primary h-8 w-8" />
              Environments
              {activeEnvironmentId && (
                <Badge
                  className="ml-3 bg-primary/20 text-primary border-0"
                  variant={"outline"}
                >
                  {activeEnvironment?.name} Active
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Manage your environment variables to use across requests.
              Variables can be referenced using{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-sm">
                {"{{variableName}}"}
              </code>{" "}
              syntax.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search environments..."
                className="pl-9 w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewMode("grid")}>
                  <Database className="h-4 w-4 mr-2" /> Grid View
                  {viewMode === "grid" && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode("list")}>
                  <Layers className="h-4 w-4 mr-2" /> List View
                  {viewMode === "list" && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode("compact")}>
                  <Globe className="h-4 w-4 mr-2" /> Compact View
                  {viewMode === "compact" && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortBy("name")}>
                  <span className="mr-2">Sort by Name</span>
                  {sortBy === "name" && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("variables")}>
                  <span className="mr-2">Sort by Variables</span>
                  {sortBy === "variables" && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowOnlyActive(!showOnlyActive)}
                >
                  <span className="mr-2">Show Only Active</span>
                  {showOnlyActive && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={onImportExport}
              className="flex items-center"
            >
              <FileJson size={16} className="mr-1.5" /> Import/Export
            </Button>

            <Button onClick={onCreateEnvironment} className="flex items-center">
              <Plus size={16} className="mr-1.5" /> New Environment
            </Button>
          </div>
        </div>

        {/* Add the EnvironmentStats component here */}
        <EnvironmentStats
          environments={environments}
          activeEnvironmentId={activeEnvironmentId}
        />
      </div>
    </div>
  );
};
