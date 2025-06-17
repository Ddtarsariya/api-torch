import React from "react";
import { motion } from "framer-motion";
import type { Environment } from "../../../types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../ui/card";
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
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Copy,
  Bookmark,
  BookmarkPlus,
  Trash,
  Check,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "../../../lib/utils";

interface EnvironmentGridViewProps {
  environments: Environment[];
  activeEnvironmentId: string | null;
  favoriteEnvs: string[];
  expandedEnvs: Record<string, boolean>;
  hoveredEnv: string | null;
  setHoveredEnv: (id: string | null) => void;
  toggleFavorite: (id: string) => void;
  toggleExpand: (id: string) => void;
  handleSetActive: (id: string) => void;
  onEditEnvironment: (id: string) => void;
  duplicateEnvironment: (env: Environment) => void;
  deleteEnvironment: (id: string) => void;
  getEnvColor: (name: string) => string;
}

export const EnvironmentGridView: React.FC<EnvironmentGridViewProps> = ({
  environments,
  activeEnvironmentId,
  favoriteEnvs,
  expandedEnvs,
  hoveredEnv,
  setHoveredEnv,
  toggleFavorite,
  toggleExpand,
  handleSetActive,
  onEditEnvironment,
  duplicateEnvironment,
  deleteEnvironment,
  getEnvColor,
}) => {
  // Function to mask sensitive values
  const maskValue = (value: string) => {
    if (!value) return "";
    if (value.length < 8) return "•".repeat(value.length);
    return (
      value.substring(0, 3) +
      "•".repeat(value.length - 6) +
      value.substring(value.length - 3)
    );
  };

  // Check if a variable key might be sensitive
  const isSensitiveKey = (key: string) => {
    const sensitivePatterns = [
      "token",
      "key",
      "secret",
      "password",
      "auth",
      "api_key",
      "apikey",
      "access",
    ];
    return sensitivePatterns.some((pattern) =>
      key.toLowerCase().includes(pattern),
    );
  };

  // State for showing/hiding sensitive values
  const [showSensitiveValues, setShowSensitiveValues] = React.useState<
    Record<string, boolean>
  >({});

  const toggleShowSensitive = (envId: string) => {
    setShowSensitiveValues((prev) => ({
      ...prev,
      [envId]: !prev[envId],
    }));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
      {environments.map((env) => (
        <motion.div
          key={env.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ y: -5 }}
          onMouseEnter={() => setHoveredEnv(env.id)}
          onMouseLeave={() => setHoveredEnv(null)}
          className="h-full"
        >
          <Card
            className={cn(
              "overflow-hidden transition-all duration-200 hover:shadow-md relative h-full flex flex-col",
              env.id === activeEnvironmentId
                ? "border-primary shadow-md ring-1 ring-primary/20"
                : "hover:border-primary/30",
              favoriteEnvs.includes(env.id)
                ? "bg-gradient-to-br from-amber-500/5 to-transparent"
                : "",
            )}
          >
            {/* Favorite button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(env.id);
              }}
              className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-muted transition-colors"
              aria-label={
                favoriteEnvs.includes(env.id)
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
            >
              {favoriteEnvs.includes(env.id) ? (
                <Bookmark className="h-3.5 w-3.5 text-amber-500" />
              ) : (
                <BookmarkPlus className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>

            <CardHeader
              className={cn("pb-3 bg-gradient-to-r", getEnvColor(env.name))}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-base">
                  <Server size={16} className="mr-2 text-primary" />
                  <span className="truncate max-w-[180px]">{env.name}</span>
                </CardTitle>

                {env.id === activeEnvironmentId && (
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20 animate-pulse mr-0 whitespace-nowrap"
                  >
                    Active
                  </Badge>
                )}
              </div>
              <CardDescription className="flex items-center justify-between mt-1">
                <span>
                  {env.variables.length} variable
                  {env.variables.length !== 1 ? "s" : ""}
                </span>
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-2 pt-3 flex-grow">
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  expandedEnvs[env.id] ? "max-h-[400px]" : "max-h-[180px]",
                )}
              >
                <div className="border rounded-md overflow-hidden">
                  {env.variables.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No variables defined
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Toggle sensitive values button */}
                      {env.variables.some((v) => isSensitiveKey(v.key)) && (
                        <button
                          onClick={() => toggleShowSensitive(env.id)}
                          className="absolute top-2 right-2 p-1 rounded-full bg-muted/80 hover:bg-muted z-10"
                          aria-label={
                            showSensitiveValues[env.id]
                              ? "Hide sensitive values"
                              : "Show sensitive values"
                          }
                        >
                          {showSensitiveValues[env.id] ? (
                            <EyeOff
                              size={12}
                              className="text-muted-foreground"
                            />
                          ) : (
                            <Eye size={12} className="text-muted-foreground" />
                          )}
                        </button>
                      )}

                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-2 font-medium">
                              Variable
                            </th>
                            <th className="text-left p-2 font-medium">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {env.variables
                            .filter((v) => v.enabled)
                            .slice(0, expandedEnvs[env.id] ? undefined : 5)
                            .map((variable) => (
                              <tr
                                key={variable.id}
                                className="border-t border-border"
                              >
                                <td className="p-2 font-medium flex items-center">
                                  {isSensitiveKey(variable.key) && (
                                    <Lock
                                      size={12}
                                      className="mr-1 text-amber-500 flex-shrink-0"
                                    />
                                  )}
                                  <span className="truncate max-w-[120px]">
                                    {variable.key}
                                  </span>
                                </td>
                                <td className="p-2 truncate max-w-[150px] font-mono text-xs">
                                  {isSensitiveKey(variable.key) &&
                                  !showSensitiveValues[env.id]
                                    ? maskValue(variable.value)
                                    : variable.value}
                                </td>
                              </tr>
                            ))}
                          {!expandedEnvs[env.id] &&
                            env.variables.length > 5 && (
                              <tr className="border-t border-border">
                                <td
                                  colSpan={2}
                                  className="p-2 text-center text-muted-foreground"
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleExpand(env.id)}
                                    className="h-7 text-xs"
                                  >
                                    Show {env.variables.length - 5} more
                                    variables
                                  </Button>
                                </td>
                              </tr>
                            )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between pt-2 mt-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <MoreHorizontal size={14} />
                    <span className="ml-1">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => onEditEnvironment(env.id)}>
                    <Edit size={14} className="mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => duplicateEnvironment(env)}>
                    <Copy size={14} className="mr-2" /> Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleFavorite(env.id)}>
                    {favoriteEnvs.includes(env.id) ? (
                      <>
                        <Bookmark size={14} className="mr-2 text-amber-500" />{" "}
                        Remove Favorite
                      </>
                    ) : (
                      <>
                        <BookmarkPlus size={14} className="mr-2" /> Add to
                        Favorites
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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

              {env.id !== activeEnvironmentId ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSetActive(env.id)}
                  className="h-8"
                >
                  Set Active
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 bg-primary/10 text-primary border-primary/20"
                  disabled
                >
                  <Check size={14} className="mr-1" /> Active
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
