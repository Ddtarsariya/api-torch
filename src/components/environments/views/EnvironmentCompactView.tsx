import React from "react";
import type { Environment } from "../../../types";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../ui/dropdown-menu";
import {
  Server,
  Bookmark,
  BookmarkPlus,
  Edit,
  MoreHorizontal,
  Copy,
  Trash,
} from "lucide-react";

interface EnvironmentCompactViewProps {
  environments: Environment[];
  activeEnvironmentId: string | null;
  favoriteEnvs: string[];
  toggleFavorite: (id: string) => void;
  handleSetActive: (id: string) => void;
  onEditEnvironment: (id: string) => void;
  duplicateEnvironment: (env: Environment) => void;
  deleteEnvironment: (id: string) => void;
}

export const EnvironmentCompactView: React.FC<EnvironmentCompactViewProps> = ({
  environments,
  activeEnvironmentId,
  favoriteEnvs,
  toggleFavorite,
  handleSetActive,
  onEditEnvironment,
  duplicateEnvironment,
  deleteEnvironment,
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-3 font-medium">Name</th>
            <th className="text-left p-3 font-medium">Variables</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-right p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {environments.map((env, index) => (
            <tr
              key={env.id}
              className={`border-t border-border ${
                env.id === activeEnvironmentId
                  ? "bg-primary/5"
                  : index % 2 === 0
                    ? "bg-card"
                    : "bg-muted/20"
              } hover:bg-accent/50 transition-colors`}
            >
              <td className="p-3">
                <div className="flex items-center">
                  {favoriteEnvs.includes(env.id) && (
                    <Bookmark size={14} className="mr-2 text-amber-500" />
                  )}
                  <Server size={14} className="mr-2 text-primary" />
                  <span className="font-medium">{env.name}</span>
                </div>
              </td>
              <td className="p-3">
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    {env.variables.length}
                  </Badge>
                  <div className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                    {env.variables
                      .slice(0, 3)
                      .map((v) => v.key)
                      .join(", ")}
                    {env.variables.length > 3 ? "..." : ""}
                  </div>
                </div>
              </td>
              <td className="p-3">
                {env.id === activeEnvironmentId ? (
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Inactive
                  </Badge>
                )}
              </td>
              <td className="p-3 text-right">
                <div className="flex items-center justify-end space-x-1">
                  {env.id !== activeEnvironmentId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetActive(env.id)}
                      className="h-8"
                    >
                      Set Active
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditEnvironment(env.id)}
                    className="h-8 w-8"
                  >
                    <Edit size={14} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(env.id)}
                    className="h-8 w-8"
                  >
                    {favoriteEnvs.includes(env.id) ? (
                      <Bookmark size={14} className="text-amber-500" />
                    ) : (
                      <BookmarkPlus size={14} />
                    )}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => duplicateEnvironment(env)}
                      >
                        <Copy size={14} className="mr-2" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to delete "${env.name}"?`,
                            )
                          ) {
                            deleteEnvironment(env.id);
                          }
                        }}
                      >
                        <Trash size={14} className="mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
