import React from "react";
import { Zap } from "lucide-react";

export const RunnerHeader: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Zap className="mr-3 text-primary h-8 w-8" />
          Collection Runner
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Run collections to test your APIs and view detailed results. You can
          run entire collections or individual requests.
        </p>
      </div>
    </div>
  );
};
