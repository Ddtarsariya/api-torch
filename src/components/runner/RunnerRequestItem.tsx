import React, { useState } from "react";
import { useAppStore } from "../../store";
import type { ApiRequest } from "../../types";
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface RunnerRequestItemProps {
  request: ApiRequest;
}

export const RunnerRequestItem: React.FC<RunnerRequestItemProps> = ({
  request,
}) => {
  const { runResults } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const result = runResults.find((r) => r.requestId === request.id);

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30";
      case "POST":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950/30";
      case "PUT":
        return "text-amber-600 bg-amber-50 dark:bg-amber-950/30";
      case "DELETE":
        return "text-rose-600 bg-rose-50 dark:bg-rose-950/30";
      case "PATCH":
        return "text-purple-600 bg-purple-50 dark:bg-purple-950/30";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-800/30";
    }
  };

  const getStatusColor = () => {
    if (!result?.response) return "text-muted-foreground";

    const status = result.response.status;
    if (status >= 200 && status < 300) return "text-emerald-500";
    if (status >= 400) return "text-rose-500";
    return "text-amber-500";
  };

  const getStatusIcon = () => {
    if (!result?.response) return null;

    const status = result.response.status;
    if (status >= 200 && status < 300)
      return <CheckCircle size={14} className="mr-1.5" />;
    if (status >= 400) return <XCircle size={14} className="mr-1.5" />;
    return <AlertCircle size={14} className="mr-1.5" />;
  };

  const getTestsStatus = () => {
    if (!result?.testResults.length) return "No tests";

    const passed = result.testResults.filter((t) => t.passed).length;
    const total = result.testResults.length;

    return `${passed}/${total}`;
  };

  const getTestsColor = () => {
    if (!result?.testResults.length) return "text-muted-foreground";

    const passed = result.testResults.filter((t) => t.passed).length;
    const total = result.testResults.length;

    if (passed === total) return "text-emerald-500";
    if (passed === 0) return "text-rose-500";
    return "text-amber-500";
  };

  const getTestsIcon = () => {
    if (!result?.testResults.length) return null;

    const passed = result.testResults.filter((t) => t.passed).length;
    const total = result.testResults.length;

    if (passed === total) return <CheckCircle size={14} className="mr-1.5" />;
    if (passed === 0) return <XCircle size={14} className="mr-1.5" />;
    return <AlertCircle size={14} className="mr-1.5" />;
  };

  const getRowBackground = () => {
    if (!result) return "";

    if (result.error || (result.response && result.response.status >= 400)) {
      return "bg-rose-50/50 dark:bg-rose-950/10";
    }

    if (result.testResults.some((test) => !test.passed)) {
      return "bg-amber-50/50 dark:bg-amber-950/10";
    }

    if (
      result.response &&
      result.response.status >= 200 &&
      result.response.status < 300
    ) {
      return "bg-emerald-50/50 dark:bg-emerald-950/10";
    }

    return "";
  };

  return (
    <>
      <div
        className={`grid grid-cols-12 gap-4 p-3 text-sm hover:bg-accent/30 transition-colors cursor-pointer ${getRowBackground()}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="col-span-5 md:col-span-6 flex items-center">
          <span
            className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded mr-2 ${getMethodColor(request.method)}`}
          >
            {request.method}
          </span>
          <span className="truncate">{request.name}</span>
        </div>

        <div className={`col-span-2 flex items-center ${getStatusColor()}`}>
          {getStatusIcon()}
          {result?.response
            ? `${result.response.status}`
            : result?.error
              ? "Error"
              : "Pending"}
        </div>

        <div className="col-span-2 md:col-span-1 flex items-center text-muted-foreground">
          {result?.duration ? (
            <>
              <Clock size={14} className="mr-1.5" />
              {result.duration}ms
            </>
          ) : (
            "-"
          )}
        </div>

        <div className={`col-span-3 flex items-center ${getTestsColor()}`}>
          {getTestsIcon()}
          {getTestsStatus()}
        </div>
      </div>

      {isExpanded && result && (
        <div className="bg-muted/30 p-4 border-t border-border">
          <Tabs defaultValue="response">
            <TabsList>
              <TabsTrigger value="response">Response</TabsTrigger>
              <TabsTrigger value="tests">Tests</TabsTrigger>
              <TabsTrigger value="request">Request</TabsTrigger>
            </TabsList>

            <TabsContent value="response" className="mt-4">
              <ResponseTab result={result} />
            </TabsContent>

            <TabsContent value="tests" className="mt-4">
              <TestsTab result={result} />
            </TabsContent>

            <TabsContent value="request" className="mt-4">
              <RequestTab request={request} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );
};

// Response Tab Component
const ResponseTab = ({ result }: { result: any }) => {
  if (result.error) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-md p-3 text-rose-600 dark:text-rose-400">
        <h4 className="font-medium mb-1">Error</h4>
        <p className="text-sm">{result.error}</p>
      </div>
    );
  }

  if (result.response) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Badge
              className={`mr-2 ${
                result.response.status >= 200 && result.response.status < 300
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : result.response.status >= 400
                    ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
              }`}
            >
              {result.response.status} {result.response.statusText}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {result.response.size} bytes • {result.duration}ms
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(
                JSON.stringify(result.response.data, null, 2),
              );
            }}
          >
            Copy
          </Button>
        </div>

        <div className="bg-card border rounded-md p-3 overflow-auto max-h-64">
          <pre className="text-xs font-mono whitespace-pre-wrap">
            {JSON.stringify(result.response.data, null, 2)}
          </pre>
        </div>

        {Object.keys(result.response.headers).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Headers</h4>
            <div className="bg-card border rounded-md overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-2 font-medium">Name</th>
                    <th className="text-left p-2 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.response.headers).map(
                    ([key, value]) => (
                      <tr key={key} className="border-t border-border">
                        <td className="p-2 font-medium">{key}</td>
                        <td className="p-2 font-mono">{String(value || "")}</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-center p-4 text-muted-foreground">
      No response data available
    </div>
  );
};

// Tests Tab Component
const TestsTab = ({ result }: { result: any }) => {
  if (result.testResults.length > 0) {
    return (
      <div className="space-y-3">
        {result.testResults.map((test: any, index: number) => (
          <div
            key={index}
            className={`p-3 rounded-md border ${
              test.passed
                ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800"
                : "bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-800"
            }`}
          >
            <div className="flex items-center">
              {test.passed ? (
                <CheckCircle size={16} className="text-emerald-500 mr-2" />
              ) : (
                <XCircle size={16} className="text-rose-500 mr-2" />
              )}
              <span
                className={`font-medium ${test.passed ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}
              >
                {test.name}
              </span>
            </div>
            {test.message && (
              <p className="mt-1 text-xs ml-6 text-muted-foreground">
                {test.message}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="text-center p-4 text-muted-foreground">
      No tests were run for this request
    </div>
  );
};

// Request Tab Component
const RequestTab = ({ request }: { request: ApiRequest }) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2">URL</h4>
        <div className="bg-card border rounded-md p-3 font-mono text-xs break-all">
          {request.url}
        </div>
      </div>

      {request.headers.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Headers</h4>
          <div className="bg-card border rounded-md overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2 font-medium">Name</th>
                  <th className="text-left p-2 font-medium">Value</th>
                  <th className="text-left p-2 font-medium">Enabled</th>
                </tr>
              </thead>
              <tbody>
                {request.headers.map((header) => (
                  <tr key={header.id} className="border-t border-border">
                    <td className="p-2 font-medium">{header.key}</td>
                    <td className="p-2 font-mono">{header.value}</td>
                    <td className="p-2">
                      {header.enabled ? (
                        <CheckCircle size={14} className="text-emerald-500" />
                      ) : (
                        <XCircle size={14} className="text-muted-foreground" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {request.params.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Query Parameters</h4>
          <div className="bg-card border rounded-md overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2 font-medium">Name</th>
                  <th className="text-left p-2 font-medium">Value</th>
                  <th className="text-left p-2 font-medium">Enabled</th>
                </tr>
              </thead>
              <tbody>
                {request.params.map((param) => (
                  <tr key={param.id} className="border-t border-border">
                    <td className="p-2 font-medium">{param.key}</td>
                    <td className="p-2 font-mono">{param.value}</td>
                    <td className="p-2">
                      {param.enabled ? (
                        <CheckCircle size={14} className="text-emerald-500" />
                      ) : (
                        <XCircle size={14} className="text-muted-foreground" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {request.body.contentType !== "none" && (
        <div>
          <h4 className="text-sm font-medium mb-2">
            Body ({request.body.contentType})
          </h4>
          <div className="bg-card border rounded-md p-3 overflow-auto max-h-64">
            {typeof request.body.content === "string" ? (
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {request.body.content}
              </pre>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-2 font-medium">Name</th>
                    <th className="text-left p-2 font-medium">Value</th>
                    <th className="text-left p-2 font-medium">Enabled</th>
                  </tr>
                </thead>
                <tbody>
                  {request.body.content.map((item: any) => (
                    <tr key={item.id} className="border-t border-border">
                      <td className="p-2 font-medium">{item.key}</td>
                      <td className="p-2 font-mono">{item.value}</td>
                      <td className="p-2">
                        {item.enabled ? (
                          <CheckCircle size={14} className="text-emerald-500" />
                        ) : (
                          <XCircle
                            size={14}
                            className="text-muted-foreground"
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
