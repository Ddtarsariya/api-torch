import React from "react";
import { Progress } from "../ui/progress";
import type { ApiRequest } from "../../types";

interface RunnerProgressProps {
  isRunning: boolean;
  progress: number;
  runningRequestId: string | null;
  requests: ApiRequest[];
}

export const RunnerProgress: React.FC<RunnerProgressProps> = ({
  isRunning,
  progress,
  runningRequestId,
  requests,
}) => {
  if (!isRunning) return null;

  return (
    <div className="p-4 border-b border-border bg-primary/5">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">
          Running {Math.ceil((progress / 100) * requests.length)} of{" "}
          {requests.length} requests
        </div>
        <div className="text-sm">{Math.round(progress)}%</div>
      </div>
      <Progress value={progress} className="h-2" />

      {runningRequestId && (
        <div className="mt-2 text-xs text-muted-foreground">
          Currently running:{" "}
          {requests.find((r) => r.id === runningRequestId)?.name ||
            "Unknown request"}
        </div>
      )}
    </div>
  );
};
