import React, { useState, useEffect, useRef } from "react";
import { useAppStore } from "../../store";
import type { Collection, ApiRequest } from "../../types";
import { ChevronDown, ChevronRight } from "lucide-react";
import { RunnerOptions } from "./RunnerOptions";
import { RunnerProgress } from "./RunnerProgress";
import { RunnerStats } from "./RunnerStats";
import { RunnerActions } from "./RunnerActions";
import { RunnerRequestList } from "./RunnerRequestList";
import { getAllRequests } from "../../utils/collectionUtils";
import { sendRequest } from "../../lib/request-service"; // Add this import

interface CollectionRunnerProps {
  collection: Collection;
  isActive: boolean;
  onSelect: () => void;
}

export const CollectionRunner: React.FC<CollectionRunnerProps> = ({
  collection,
  isActive,
  onSelect,
}) => {
  const {
    getActiveWorkspace,
    getEnvironments,
    setRunResults,
    addRunResult,
    clearRunResults,
    setIsRunning,
    isRunning,
    runResults,
  } = useAppStore();

  const workspace = getActiveWorkspace();
  const environments = getEnvironments();
  const activeEnvironment = environments.find(
    (e) => e.id === workspace.activeEnvironmentId,
  );

  const [progress, setProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(isActive);
  const [runningRequestId, setRunningRequestId] = useState<string | null>(null);
  const [runOptions, setRunOptions] = useState({
    stopOnError: false,
    stopOnTestFailure: false,
    delay: 0,
    saveResponses: true,
  });
  const [showOptions, setShowOptions] = useState(false);
  const [runStats, setRunStats] = useState({
    startTime: 0,
    endTime: 0,
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFailedOnly, setShowFailedOnly] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const requests = getAllRequests(collection.items);

  const collectionResults = runResults.filter((result) =>
    requests.some((req) => req.id === result.requestId),
  );

  const passedTests = collectionResults.reduce((count, result) => {
    const passedTestsInResult = result.testResults.filter(
      (test) => test.passed,
    ).length;
    return count + passedTestsInResult;
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

  useEffect(() => {
    setIsExpanded(isActive);
  }, [isActive]);

  useEffect(() => {
    if (isFullscreen && containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  }, [isFullscreen]);

  // Filter requests if showing only failed
  const displayedRequests = showFailedOnly
    ? requests.filter((req) => {
        const result = collectionResults.find((r) => r.requestId === req.id);
        return (
          result &&
          (result.error ||
            (result.response && result.response.status >= 400) ||
            result.testResults.some((test) => !test.passed))
        );
      })
    : requests;

  return (
    <div
      ref={containerRef}
      className={`bg-card rounded-lg border ${
        isActive ? "border-primary/50 shadow-md" : "border-border"
      } overflow-hidden transition-all duration-200 ${
        isFullscreen ? "fixed inset-0 z-50 m-0 rounded-none" : ""
      }`}
    >
      <div
        className={`p-4 flex items-center justify-between cursor-pointer hover:bg-accent/50 ${
          isActive ? "bg-primary/5" : ""
        }`}
        onClick={() => {
          setIsExpanded(!isExpanded);
          onSelect();
        }}
      >
        <div className="flex items-center">
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <h2 className="text-lg font-semibold ml-2">{collection.name}</h2>

          {collectionResults.length > 0 && (
            <RunnerStats
              passedTests={passedTests}
              totalTests={totalTests}
              successfulRequests={successfulRequests}
              totalRequests={requests.length}
              failedRequests={failedRequests}
              runStats={runStats}
            />
          )}
        </div>

        <RunnerActions
          collection={collection}
          collectionResults={collectionResults}
          isRunning={isRunning}
          showOptions={showOptions}
          setShowOptions={setShowOptions}
          showFailedOnly={showFailedOnly}
          setShowFailedOnly={setShowFailedOnly}
          requests={requests}
          runStats={runStats}
          setCopiedToClipboard={setCopiedToClipboard}
          onRunCollection={() =>
            runCollection({
              requests,
              activeEnvironment,
              runOptions,
              setRunningRequestId,
              setProgress,
              setRunStats,
              addRunResult,
              clearRunResults,
              setIsRunning,
            })
          }
          onStopRun={() => setIsRunning(false)}
        />
      </div>

      {isExpanded && (
        <div className="border-t border-border">
          <RunnerOptions
            showOptions={showOptions}
            runOptions={runOptions}
            setRunOptions={setRunOptions}
            activeEnvironment={activeEnvironment}
            requests={requests}
          />

          <RunnerProgress
            isRunning={isRunning}
            progress={progress}
            runningRequestId={runningRequestId}
            requests={requests}
          />

          {collectionResults.length > 0 && !isRunning && (
            <RunnerStats
              passedTests={passedTests}
              totalTests={totalTests}
              successfulRequests={successfulRequests}
              totalRequests={requests.length}
              failedRequests={failedRequests}
              runStats={runStats}
              detailed={true}
              copiedToClipboard={copiedToClipboard}
            />
          )}

          <RunnerRequestList
            displayedRequests={displayedRequests}
            showFailedOnly={showFailedOnly}
          />
        </div>
      )}
    </div>
  );
};

// Helper function to run the collection
export const runCollection = async ({
  requests,
  activeEnvironment,
  runOptions,
  setRunningRequestId,
  setProgress,
  setRunStats,
  addRunResult,
  clearRunResults,
  setIsRunning,
}: {
  requests: ApiRequest[];
  activeEnvironment: any;
  runOptions: any;
  setRunningRequestId: (id: string | null) => void;
  setProgress: (progress: number) => void;
  setRunStats: (stats: any) => void;
  addRunResult: (result: any) => void;
  clearRunResults: () => void;
  setIsRunning: (isRunning: boolean) => void;
}) => {
  setIsRunning(true);
  clearRunResults();
  setProgress(0);
  setRunningRequestId(null);

  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;
  let testPassCount = 0;
  let testFailCount = 0;

  for (let i = 0; i < requests.length; i++) {
    const request = requests[i];
    setRunningRequestId(request.id);
    const requestStartTime = Date.now();

    try {
      // Add delay if specified
      if (i > 0 && runOptions.delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, runOptions.delay));
      }

      const { response, testResults } = await sendRequest(
        request,
        activeEnvironment,
      );

      const runResult = {
        requestId: request.id,
        requestName: request.name,
        response,
        testResults,
        duration: Date.now() - requestStartTime,
      };

      addRunResult(runResult);

      // Update stats
      if (response.status >= 200 && response.status < 300) {
        successCount++;
      } else if (response.status >= 400) {
        failCount++;
      }

      const passedTestsCount = testResults.filter((t: any) => t.passed).length;
      testPassCount += passedTestsCount;
      testFailCount += testResults.length - passedTestsCount;

      // Check if we should stop on test failure
      if (
        runOptions.stopOnTestFailure &&
        passedTestsCount < testResults.length
      ) {
        break;
      }
    } catch (error) {
      const runResult = {
        requestId: request.id,
        requestName: request.name,
        response: null,
        error: (error as Error).message,
        testResults: [],
        duration: Date.now() - requestStartTime,
      };

      addRunResult(runResult);
      failCount++;

      // Check if we should stop on error
      if (runOptions.stopOnError) {
        break;
      }
    }

    setProgress(((i + 1) / requests.length) * 100);
  }

  const endTime = Date.now();

  setRunStats({
    startTime,
    endTime,
    totalRequests: requests.length,
    successfulRequests: successCount,
    failedRequests: failCount,
    totalTests: testPassCount + testFailCount,
    passedTests: testPassCount,
    failedTests: testFailCount,
  });

  setRunningRequestId(null);
  setIsRunning(false);
};
