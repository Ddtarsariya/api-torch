import React from "react";
import { Server, Plus, Upload } from "lucide-react";
import { Button } from "../ui/button";
import { useAppStore } from "../../store";

export const EnvironmentEmptyState: React.FC = () => {
  const { createEnvironment } = useAppStore();

  const handleCreateEnvironment = () => {
    createEnvironment("New Environment");
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-lg border border-dashed border -muted-foreground/20">
      <div className="bg-primary/10 p-3 rounded-full mb-4">
        <Server size={36} className="text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Environments</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Environments allow you to store and reuse variables across requests.
        Create an environment to get started.
      </p>
      <div className="flex gap-3">
        <Button onClick={handleCreateEnvironment}>
          <Plus size={16} className="mr-1.5" /> Create Environment
        </Button>
        <Button variant="outline" onClick={() => {}}>
          <Upload size={16} className="mr-1.5" /> Import Environment
        </Button>
      </div>
    </div>
  );
};
