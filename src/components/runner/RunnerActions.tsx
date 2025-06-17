import React from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import {
  Play,
  Loader2,
  StopCircle,
  BarChart3,
  Download,
  Clipboard,
  Eye,
  Filter,
  Settings,
} from "lucide-react";
import type { Collection, ApiRequest, RunResult } from "../../types";

interface RunnerActionsProps {
  collection: Collection;
  collectionResults: RunResult[];
  isRunning: boolean;
  showOptions: boolean;
  setShowOptions: (show: boolean) => void;
  showFailedOnly: boolean;
  setShowFailedOnly: (show: boolean) => void;
  requests: ApiRequest[];
  runStats: any;
  setCopiedToClipboard: (copied: boolean) => void;
  onRunCollection: () => void;
  onStopRun: () => void;
}

export const RunnerActions: React.FC<RunnerActionsProps> = ({
  collection,
  collectionResults,
  isRunning,
  showOptions,
  setShowOptions,
  showFailedOnly,
  setShowFailedOnly,
  requests,
  runStats,
  setCopiedToClipboard,
  onRunCollection,
  onStopRun,
}) => {
  const handleExportResults = () => {
    const results = {
      collection: {
        name: collection.name,
        id: collection.id,
      },
      timestamp: new Date().toISOString(),
      environment: "activeEnvironment ? activeEnvironment.name : 'None'", // This would need to be passed in
      summary: {
        totalRequests: requests.length,
        successfulRequests: collectionResults.filter(
          (result) =>
            result.response &&
            result.response.status >= 200 &&
            result.response.status < 300,
        ).length,
        failedRequests: collectionResults.filter(
          (result) =>
            !result.response || result.response.status >= 400 || result.error,
        ).length,
        totalTests: collectionResults.reduce(
          (count, result) => count + result.testResults.length,
          0,
        ),
        passedTests: collectionResults.reduce((count, result) => {
          return (
            count + result.testResults.filter((test) => test.passed).length
          );
        }, 0),
        duration: runStats.endTime - runStats.startTime,
      },
      results: collectionResults.map((result) => ({
        name: result.requestName,
        status: result.response ? result.response.status : "Error",
        duration: result.duration,
        error: result.error,
        tests: result.testResults.map((test) => ({
          name: test.name,
          passed: test.passed,
          message: test.message,
        })),
      })),
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${collection.name.replace(/\s+/g, "-").toLowerCase()}-results-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyResults = () => {
    const passedTests = collectionResults.reduce((count, result) => {
      return count + result.testResults.filter((test) => test.passed).length;
    }, 0);

    const totalTests = collectionResults.reduce((count, result) => {
      return count + result.testResults.length;
    }, 0);

    const successfulRequests = collectionResults.filter(
      (result) =>
        result.response &&
        result.response.status >= 200 &&
        result.response.status < 300,
    ).length;

    const failedRequests = collectionResults.filter(
      (result) =>
        !result.response || result.response.status >= 400 || result.error,
    ).length;

    const summary = `
Collection: ${collection.name}
Environment: activeEnvironment ? activeEnvironment.name : "None"
Date: ${new Date().toLocaleString()}

Summary:
- Total Requests: ${requests.length}
- Successful: ${successfulRequests}
- Failed: ${failedRequests}
- Tests Passed: ${passedTests}/${totalTests}
- Total Duration: ${runStats.endTime - runStats.startTime}ms

Request Results:
${collectionResults
  .map(
    (result) => `
- ${result.requestName}
  Status: ${result.response ? result.response.status : "Error"}
  Duration: ${result.duration}ms
  Tests: ${result.testResults.filter((t) => t.passed).length}/${result.testResults.length} passed
  ${result.error ? `Error: ${result.error}` : ""}
`,
  )
  .join("")}
`;

    navigator.clipboard.writeText(summary);
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 2000);
  };

  return (
    <div className="flex items-center space-x-2">
      {collectionResults.length > 0 && !isRunning && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <BarChart3 size={14} className="mr-1.5" /> Results
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportResults}>
              <Download size={14} className="mr-2" /> Export Results
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyResults}>
              <Clipboard size={14} className="mr-2" /> Copy Summary
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowFailedOnly(!showFailedOnly)}
            >
              {showFailedOnly ? (
                <>
                  <Eye size={14} className="mr-2" /> Show All Requests
                </>
              ) : (
                <>
                  <Filter size={14} className="mr-2" /> Show Failed Only
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setShowOptions(!showOptions);
        }}
      >
        <Settings size={14} className="mr-1.5" /> Options
      </Button>

      <Button
        onClick={(e) => {
          e.stopPropagation();
          onRunCollection();
        }}
        disabled={isRunning || requests.length === 0}
        size="sm"
        className="bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        {isRunning ? (
          <>
            <Loader2 size={14} className="mr-1.5 animate-spin" /> Running...
          </>
        ) : (
          <>
            <Play size={14} className="mr-1.5" /> Run Collection
          </>
        )}
      </Button>

      {isRunning && (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onStopRun();
          }}
        >
          <StopCircle size={14} className="mr-1.5" /> Stop
        </Button>
      )}
    </div>
  );
};
