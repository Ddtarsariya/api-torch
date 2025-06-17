import React, { useState } from "react";
import { useAppStore } from "../store";
import { EnvironmentModal } from "../components/EnvironmentModal";
import { ImportExportModal } from "../components/ImportExportModal";
import { EnvironmentsHeader } from "../components/environments/EnvironmentsHeader";
import { EnvironmentsList } from "../components/environments/EnvironmentsList";
import { EnvironmentWelcomeBanner } from "../components/environments/EnvironmentWelcomeBanner";
import { useEnvironmentPersistence } from "../hooks/useEnvironmentPersistence";

export const Environments: React.FC = () => {
  const { getEnvironments, getActiveWorkspace } = useAppStore();
  const environments = getEnvironments();
  const workspace = getActiveWorkspace();
  const activeEnvironmentId = workspace.activeEnvironmentId;

  const [isEnvironmentModalOpen, setIsEnvironmentModalOpen] = useState(false);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<
    string | undefined
  >(undefined);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "variables" | "recent">("name");
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);

  const { favoriteEnvs, viewMode, setViewMode, toggleFavorite } =
    useEnvironmentPersistence();

  const handleCreateEnvironment = () => {
    setSelectedEnvironmentId(undefined);
    setIsEnvironmentModalOpen(true);
  };

  const handleEditEnvironment = (id: string) => {
    setSelectedEnvironmentId(id);
    setIsEnvironmentModalOpen(true);
  };

  const handleImportExport = () => {
    setIsImportExportModalOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background/95 to-background/90">
      <EnvironmentsHeader
        activeEnvironmentId={activeEnvironmentId}
        environments={environments}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showOnlyActive={showOnlyActive}
        setShowOnlyActive={setShowOnlyActive}
        onCreateEnvironment={handleCreateEnvironment}
        onImportExport={handleImportExport}
      />

      <div className="max-w-[2000px] mx-auto px-6 py-8">
        {showWelcomeBanner && environments.length > 0 && (
          <EnvironmentWelcomeBanner
            onDismiss={() => setShowWelcomeBanner(false)}
          />
        )}

        <EnvironmentsList
          environments={environments}
          activeEnvironmentId={activeEnvironmentId}
          searchQuery={searchQuery}
          viewMode={viewMode}
          showOnlyActive={showOnlyActive}
          favoriteEnvs={favoriteEnvs}
          toggleFavorite={toggleFavorite}
          sortBy={sortBy}
          onEditEnvironment={handleEditEnvironment}
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
};
