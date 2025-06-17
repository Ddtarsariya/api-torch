import React, { useState } from "react";
import { useAppStore } from "../../store";
import type { Environment } from "../../types";
import { EnvironmentEmptyState } from "./EnvironmentEmptyState";
import { EnvironmentGridView } from "./views/EnvironmentGridView";
import { EnvironmentListView } from "./views/EnvironmentListView";
import { EnvironmentCompactView } from "./views/EnvironmentCompactView";

interface EnvironmentsListProps {
  environments: Environment[];
  activeEnvironmentId: string | null;
  searchQuery: string;
  viewMode: "grid" | "list" | "compact";
  showOnlyActive: boolean;
  favoriteEnvs: string[];
  toggleFavorite: (id: string) => void;
  sortBy: "name" | "variables" | "recent";
  onEditEnvironment: (id: string) => void;
}

export const EnvironmentsList: React.FC<EnvironmentsListProps> = ({
  environments,
  activeEnvironmentId,
  searchQuery,
  viewMode,
  showOnlyActive,
  favoriteEnvs,
  toggleFavorite,
  sortBy,
  onEditEnvironment,
}) => {
  const { setActiveEnvironment, createEnvironment, deleteEnvironment } =
    useAppStore();
  const [expandedEnvs, setExpandedEnvs] = useState<Record<string, boolean>>({});
  const [hoveredEnv, setHoveredEnv] = useState<string | null>(null);

  // Filter environments based on search and active filter
  let filteredEnvironments = environments.filter(
    (env) =>
      env.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      env.variables.some(
        (v) =>
          v.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.value.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  // Apply active filter if enabled
  if (showOnlyActive) {
    filteredEnvironments = filteredEnvironments.filter(
      (env) => env.id === activeEnvironmentId,
    );
  }

  // Sort environments
  filteredEnvironments = [...filteredEnvironments].sort((a, b) => {
    // Always show favorites first
    if (favoriteEnvs.includes(a.id) && !favoriteEnvs.includes(b.id)) return -1;
    if (!favoriteEnvs.includes(a.id) && favoriteEnvs.includes(b.id)) return 1;

    // Then sort by selected criteria
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "variables") return b.variables.length - a.variables.length;
    return 0;
  });

  // Group environments by first letter for list view
  const groupedEnvironments = filteredEnvironments.reduce(
    (acc, env) => {
      const firstLetter = env.name.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(env);
      return acc;
    },
    {} as Record<string, Environment[]>,
  );

  const sortedGroups = Object.keys(groupedEnvironments).sort();

  const handleSetActive = (id: string) => {
    setActiveEnvironment(id);
  };

  const toggleExpand = (id: string) => {
    setExpandedEnvs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const duplicateEnvironment = (env: Environment) => {
    const newEnv = {
      ...env,
      name: `${env.name} (Copy)`,
      id: undefined,
    };
    createEnvironment(newEnv.name, newEnv.variables);
  };

  // Generate a color based on environment name (for visual variety)
  const getEnvColor = (name: string) => {
    const colors = [
      "from-blue-500/20 to-cyan-400/20 border-blue-500/30",
      "from-purple-500/20 to-pink-500/20 border-purple-500/30",
      "from-amber-500/20 to-orange-400/20 border-amber-500/30",
      "from-emerald-500/20 to-green-400/20 border-emerald-500/30",
      "from-rose-500/20 to-red-400/20 border-rose-500/30",
      "from-indigo-500/20 to-violet-400/20 border-indigo-500/30",
    ];

    // Simple hash function to pick a color based on name
    const hash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (environments.length === 0) {
    return <EnvironmentEmptyState />;
  }

  return (
    <>
      {viewMode === "grid" && (
        <EnvironmentGridView
          environments={filteredEnvironments}
          activeEnvironmentId={activeEnvironmentId}
          favoriteEnvs={favoriteEnvs}
          expandedEnvs={expandedEnvs}
          hoveredEnv={hoveredEnv}
          setHoveredEnv={setHoveredEnv}
          toggleFavorite={toggleFavorite}
          toggleExpand={toggleExpand}
          handleSetActive={handleSetActive}
          onEditEnvironment={onEditEnvironment}
          duplicateEnvironment={duplicateEnvironment}
          deleteEnvironment={deleteEnvironment}
          getEnvColor={getEnvColor}
        />
      )}

      {viewMode === "list" && (
        <EnvironmentListView
          groupedEnvironments={groupedEnvironments}
          sortedGroups={sortedGroups}
          activeEnvironmentId={activeEnvironmentId}
          favoriteEnvs={favoriteEnvs}
          toggleFavorite={toggleFavorite}
          handleSetActive={handleSetActive}
          onEditEnvironment={onEditEnvironment}
          duplicateEnvironment={duplicateEnvironment}
          deleteEnvironment={deleteEnvironment}
        />
      )}

      {viewMode === "compact" && (
        <EnvironmentCompactView
          environments={filteredEnvironments}
          activeEnvironmentId={activeEnvironmentId}
          favoriteEnvs={favoriteEnvs}
          toggleFavorite={toggleFavorite}
          handleSetActive={handleSetActive}
          onEditEnvironment={onEditEnvironment}
          duplicateEnvironment={duplicateEnvironment}
          deleteEnvironment={deleteEnvironment}
        />
      )}
    </>
  );
};
