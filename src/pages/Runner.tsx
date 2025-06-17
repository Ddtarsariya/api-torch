import React, { useState } from "react";
import { useAppStore } from "../store";
import { Zap, Layers } from "lucide-react";
import { Button } from "../components/ui/button";
import { CollectionRunner } from "../components/runner/CollectionRunner";
import { RunnerHeader } from "../components/runner/RunnerHeader";

export const Runner: React.FC = () => {
  const { getCollections } = useAppStore();
  const collections = getCollections();
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(
    null,
  );

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background/95 to-background/90">
      <div className="max-w-7xl mx-auto p-6">
        <RunnerHeader />

        {collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-lg border border-dashed border-muted-foreground/20">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <Layers size={36} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              No Collections Available
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Create a collection in the sidebar to start running tests against
              your APIs.
            </p>
            <Button variant="outline">Create Collection</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {collections.map((collection) => (
              <CollectionRunner
                key={collection.id}
                collection={collection}
                isActive={collection.id === activeCollectionId}
                onSelect={() => setActiveCollectionId(collection.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
