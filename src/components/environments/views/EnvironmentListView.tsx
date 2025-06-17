import React from "react";
import { motion } from "framer-motion";
import type { Environment } from "../../../types";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Bookmark,
  BookmarkPlus,
  Server,
  Check,
  Edit,
  Copy,
  Trash,
} from "lucide-react";

interface EnvironmentListViewProps {
  groupedEnvironments: Record<string, Environment[]>;
  sortedGroups: string[];
  activeEnvironmentId: string | null;
  favoriteEnvs: string[];
  toggleFavorite: (id: string) => void;
  handleSetActive: (id: string) => void;
  onEditEnvironment: (id: string) => void;
  duplicateEnvironment: (env: Environment) => void;
  deleteEnvironment: (id: string) => void;
}

export const EnvironmentListView: React.FC<EnvironmentListViewProps> = ({
  groupedEnvironments,
  sortedGroups,
  activeEnvironmentId,
  favoriteEnvs,
  toggleFavorite,
  handleSetActive,
  onEditEnvironment,
  duplicateEnvironment,
  deleteEnvironment,
}) => {
  return (
    <div className="space-y-6">
      {sortedGroups.map((letter) => (
        <div key={letter} className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground ml-2">
            {letter}
          </h3>
          <div className="space-y-1">
            {groupedEnvironments[letter].map((env) => (
              <motion.div
                key={env.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                whileHover={{ x: 5 }}
              >
                <div
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    env.id === activeEnvironmentId
                      ? "border-primary bg-primary/5"
                      : favoriteEnvs.includes(env.id)
                        ? "border-amber-500/30 bg-amber-500/5"
                        : "border-border hover:border-primary/30 hover:bg-accent/50"
                  } transition-all duration-200`}
                >
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleFavorite(env.id)}
                      className="text-muted-foreground hover:text-amber-500 transition-colors"
                    >
                      {favoriteEnvs.includes(env.id) ? (
                        <Bookmark size={16} className="text-amber-500" />
                      ) : (
                        <BookmarkPlus size={16} />
                      )}
                    </button>

                    <div
                      className={`p-2 rounded-full ${
                        env.id === activeEnvironmentId
                          ? "bg-primary/20"
                          : "bg-muted"
                      }`}
                    >
                      <Server
                        size={16}
                        className={
                          env.id === activeEnvironmentId
                            ? "text-primary"
                            : "text-muted-foreground"
                        }
                      />
                    </div>

                    <div>
                      <h4 className="font-medium">{env.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {env.variables.length} variable
                        {env.variables.length !== 1 ? "s" : ""}
                        {env.variables.length > 0 && (
                          <span className="ml-2 font-mono">
                            {env.variables
                              .slice(0, 3)
                              .map((v) => v.key)
                              .join(", ")}
                            {env.variables.length > 3 ? "..." : ""}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {env.id === activeEnvironmentId ? (
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary border-primary/20"
                      >
                        <Check size={12} className="mr-1" /> Active
                      </Badge>
                    ) : (
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
                      onClick={() => duplicateEnvironment(env)}
                      className="h-8 w-8"
                    >
                      <Copy size={14} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
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
                      <Trash size={14} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
