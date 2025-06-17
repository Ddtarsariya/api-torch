import { useState, useEffect } from "react";
import { useAppStore } from "../store";

export const useEnvironmentPersistence = () => {
  const [favoriteEnvs, setFavoriteEnvs] = useState<string[]>([]);
  const [expandedEnvs, setExpandedEnvs] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("grid");
  const { getActiveWorkspace } = useAppStore();
  const workspace = getActiveWorkspace();
  const activeEnvironmentId = workspace.activeEnvironmentId;

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("environment-favorites");
    if (savedFavorites) {
      setFavoriteEnvs(JSON.parse(savedFavorites));
    }

    const savedViewMode = localStorage.getItem("environment-view-mode");
    if (savedViewMode) {
      setViewMode(JSON.parse(savedViewMode));
    }

    const savedExpanded = localStorage.getItem("environment-expanded");
    if (savedExpanded) {
      setExpandedEnvs(JSON.parse(savedExpanded));
    }
  }, []);

  // Initialize expanded state for active environment
  useEffect(() => {
    if (activeEnvironmentId && !expandedEnvs[activeEnvironmentId]) {
      setExpandedEnvs((prev) => ({
        ...prev,
        [activeEnvironmentId]: true,
      }));
    }
  }, [activeEnvironmentId, expandedEnvs]);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem("environment-favorites", JSON.stringify(favoriteEnvs));
  }, [favoriteEnvs]);

  // Save view mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("environment-view-mode", JSON.stringify(viewMode));
  }, [viewMode]);

  // Save expanded state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("environment-expanded", JSON.stringify(expandedEnvs));
  }, [expandedEnvs]);

  const toggleFavorite = (id: string) => {
    setFavoriteEnvs((prev) =>
      prev.includes(id) ? prev.filter((envId) => envId !== id) : [...prev, id],
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedEnvs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return {
    favoriteEnvs,
    expandedEnvs,
    viewMode,
    setViewMode,
    toggleFavorite,
    toggleExpand,
  };
};
