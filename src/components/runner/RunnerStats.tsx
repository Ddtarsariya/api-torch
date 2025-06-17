import React from "react";
import { Clock, Check } from "lucide-react";
import { Badge } from "../ui/badge";

interface RunnerStatsProps {
  passedTests: number;
  totalTests: number;
  successfulRequests: number;
  totalRequests: number;
  failedRequests: number;
  runStats: {
    startTime: number;
    endTime: number;
  };
  detailed?: boolean;
  copiedToClipboard?: boolean;
}

export const RunnerStats: React.FC<RunnerStatsProps> = ({
  passedTests,
  totalTests,
  successfulRequests,
  totalRequests,
  failedRequests,
  runStats,
  detailed = false,
  copiedToClipboard = false,
}) => {
  if (!detailed) {
    return (
      <div className="ml-4 flex items-center text-sm space-x-2">
        <Badge
          variant="outline"
          className={
            totalTests > 0
              ? passedTests === totalTests
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : passedTests === 0
                  ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
              : ""
          }
        >
          {passedTests}/{totalTests} tests passed
        </Badge>

        <Badge
          variant="outline"
          className={
            successfulRequests === totalRequests
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : failedRequests === totalRequests
                ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
          }
        >
          {successfulRequests}/{totalRequests} requests successful
        </Badge>

        {runStats.endTime > 0 && (
          <Badge variant="outline">
            <Clock size={12} className="mr-1" />
            {(runStats.endTime - runStats.startTime).toLocaleString()}ms
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-border bg-muted/30">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-md border border-border p-3">
          <div className="text-xs text-muted-foreground mb-1">Requests</div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {successfulRequests}/{totalRequests}
            </div>
            <div
              className={`text-sm ${
                successfulRequests === totalRequests
                  ? "text-emerald-500"
                  : failedRequests === totalRequests
                    ? "text-rose-500"
                    : "text-amber-500"
              }`}
            >
              {Math.round((successfulRequests / totalRequests) * 100)}% success
            </div>
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500"
              style={{
                width: `${(successfulRequests / totalRequests) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-card rounded-md border border-border p-3">
          <div className="text-xs text-muted-foreground mb-1">Tests</div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {passedTests}/{totalTests}
            </div>
            <div
              className={`text-sm ${
                totalTests > 0
                  ? passedTests === totalTests
                    ? "text-emerald-500"
                    : passedTests === 0
                      ? "text-rose-500"
                      : "text-amber-500"
                  : "text-muted-foreground"
              }`}
            >
              {totalTests > 0
                ? Math.round((passedTests / totalTests) * 100)
                : 0}
              % passed
            </div>
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500"
              style={{
                width: `${totalTests > 0 ? (passedTests / totalTests) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-card rounded-md border border-border p-3">
          <div className="text-xs text-muted-foreground mb-1">Duration</div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {(runStats.endTime - runStats.startTime).toLocaleString()}ms
            </div>
            <div className="text-sm text-muted-foreground">
              <Clock size={14} className="inline mr-1" />
              {new Date(runStats.endTime).toLocaleTimeString()}
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Average:{" "}
            {Math.round(
              (runStats.endTime - runStats.startTime) / totalRequests,
            )}
            ms per request
          </div>
        </div>
      </div>

      {copiedToClipboard && (
        <div className="mt-3 text-xs text-emerald-500 flex items-center">
          <Check size={12} className="mr-1" /> Results copied to clipboard
        </div>
      )}
    </div>
  );
};
