// src/components/RequestPanel.tsx

import React, { useState, useEffect } from "react";
import { useAppStore } from "../store";
import type { ApiRequest, HttpMethod, KeyValuePair } from "../types";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { v4 as uuidv4 } from "uuid";
import { sendRequest, generateCurlCommand } from "../lib/request-service";
import {
  Play,
  Plus,
  Save,
  Copy,
  Clock,
  Code,
  FileJson,
  List,
  Server,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  RotateCw,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Terminal,
  Upload,
  Braces,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { KeyValueEditor } from "./request/KeyValueEditor";
import { MethodSelector } from "./request/MethodSelector";
import { UrlInput } from "./request/UrlInput";
import { EnhancedCodeEditor } from "./request/EnhancedCodeEditor";

export const RequestPanel: React.FC = () => {
  const { toast } = useToast();
  const {
    activeRequestId,
    getRequests,
    updateRequest,
    setActiveResponse,
    getActiveWorkspace,
    getEnvironments,
  } = useAppStore();

  const requests = getRequests();
  const activeRequest = requests.find((r) => r.id === activeRequestId);
  const workspace = getActiveWorkspace();
  const environments = getEnvironments();
  const activeEnvironment = environments.find(
    (e) => e.id === workspace.activeEnvironmentId,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [requestHistory, setRequestHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { theme } = useAppStore();
  const editorTheme = theme === "dark" ? "vs-dark" : "vs";
  const [isSaved, setIsSaved] = useState(true);
  const [showUrlParams, setShowUrlParams] = useState(false);
  const [showCurlCommand, setShowCurlCommand] = useState(false);
  const [curlCommand, setCurlCommand] = useState("");

  // Common header suggestions
  const headerSuggestions = {
    keys: [
      "Accept",
      "Authorization",
      "Content-Type",
      "User-Agent",
      "Cache-Control",
      "X-API-Key",
      "X-Requested-With",
      "Origin",
      "Referer",
      "Accept-Language",
    ],
    values: [
      "application/json",
      "application/xml",
      "text/plain",
      "text/html",
      "Bearer ",
      "Basic ",
      "no-cache",
      "XMLHttpRequest",
    ],
  };

  // Code snippets for scripts
  const preRequestSnippets = [
    {
      name: "Set Authorization Header",
      code: `// Set Bearer token from environment variable
pm.request.headers.add({
  key: "Authorization",
  value: "Bearer " + pm.environment.get("token")
});`,
    },
    {
      name: "Set Request Body",
      code: `// Set dynamic JSON body
const body = {
  id: pm.environment.get("user_id"),
  timestamp: new Date().toISOString()
};
pm.request.body = {
  mode: "raw",
  raw: JSON.stringify(body)
};`,
    },
    {
      name: "Generate Random Data",
      code: `// Generate a random UUID
const uuid = crypto.randomUUID();
console.log("Generated UUID:", uuid);

// Set it in the environment
pm.environment.set("request_id", uuid);`,
    },
  ];

  const testSnippets = [
    {
      name: "Check Status Code",
      code: `// Verify successful response
pm.test("Status code is 200", function() {
  pm.expect(pm.response.code).to.equal(200);
});`,
    },
    {
      name: "Validate Response Schema",
      code: `// Check response has required fields
pm.test("Response has required fields", function() {
  const responseData = pm.response.json();
  pm.expect(responseData).to.have.property('id');
  pm.expect(responseData).to.have.property('name');
});`,
    },
    {
      name: "Extract & Save Value",
      code: `// Extract token from response and save to environment
pm.test("Extract auth token", function() {
  const responseData = pm.response.json();
  if (responseData.token) {
    pm.environment.set("token", responseData.token);
    console.log("Token saved to environment");
  }
});`,
    },
  ];

  // Set editor theme based on app theme
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    // setEditorTheme(isDarkMode ? 'vs-dark' : 'vs');
  }, []);

  // Generate curl command when request changes
  useEffect(() => {
    if (activeRequest) {
      try {
        const curl = generateCurlCommand(activeRequest, activeEnvironment);
        setCurlCommand(curl);
      } catch (error) {
        console.error("Error generating curl command:", error);
      }
    }
  }, [activeRequest, activeEnvironment]);

  // Empty state when no request is selected
  if (!activeRequest) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center w-full min-w-[400px]">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Server size={24} className="text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Request Selected</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Select a request from the sidebar or create a new one to get started
          with testing your APIs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
          <div className="bg-card border rounded-lg p-4 text-left hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center text-primary mb-2">
              <Plus size={18} className="mr-2" />
              <h4 className="font-medium">New Request</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Create a new API request from scratch
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4 text-left hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center text-primary mb-2">
              <Upload size={18} className="mr-2" />
              <h4 className="font-medium">Import Collection</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Import requests from Postman or other tools
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSendRequest = async () => {
    if (!activeRequest.url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL before sending the request",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { response, testResults } = await sendRequest(
        activeRequest,
        activeEnvironment,
      );
      setActiveResponse(response);

      // Add URL to history
      if (!requestHistory.includes(activeRequest.url)) {
        setRequestHistory((prev) => [activeRequest.url, ...prev.slice(0, 9)]);
      }

      // Show toast with test results if any
      if (testResults.length > 0) {
        const passedTests = testResults.filter((t) => t.passed).length;
        const totalTests = testResults.length;

        if (passedTests === totalTests) {
          toast({
            title: "All Tests Passed",
            description: `${passedTests}/${totalTests} tests passed successfully`,
            variant: "default",
          });
        } else {
          toast({
            title: "Some Tests Failed",
            description: `${passedTests}/${totalTests} tests passed`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error sending request:", error);
      toast({
        title: "Request Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMethodChange = (method: HttpMethod) => {
    updateRequest(activeRequest.id, { method });
    setIsSaved(false);
  };

  const handleUrlChange = (url: string) => {
    updateRequest(activeRequest.id, { url });
    setIsSaved(false);
  };

  const handleNameChange = (name: string) => {
    updateRequest(activeRequest.id, { name });
    setIsSaved(false);
  };

  const handleHeadersChange = (headers: KeyValuePair[]) => {
    updateRequest(activeRequest.id, { headers });
    setIsSaved(false);
  };

  const handleParamsChange = (params: KeyValuePair[]) => {
    updateRequest(activeRequest.id, { params });
    setIsSaved(false);

    // Update URL with params if they're shown in the URL bar
    if (showUrlParams) {
      const url = new URL(activeRequest.url);

      // Clear existing params
      url.search = "";

      // Add enabled params
      params.forEach((param) => {
        if (param.enabled && param.key) {
          url.searchParams.append(param.key, param.value);
        }
      });

      handleUrlChange(url.toString());
    }
  };

  const handleBodyChange = (content: string | undefined) => {
    if (content !== undefined) {
      updateRequest(activeRequest.id, {
        body: { ...activeRequest.body, content },
      });
      setIsSaved(false);
    }
  };

  const handleBodyTypeChange = (contentType: string) => {
    updateRequest(activeRequest.id, {
      body: {
        contentType: contentType as any,
        content:
          contentType === "form-data" || contentType === "x-www-form-urlencoded"
            ? []
            : "",
      },
    });
    setIsSaved(false);
  };

  const handlePreRequestScriptChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateRequest(activeRequest.id, { preRequestScript: value });
      setIsSaved(false);
    }
  };

  const handleTestScriptChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateRequest(activeRequest.id, { testScript: value });
      setIsSaved(false);
    }
  };

  const handleSaveRequest = () => {
    // Already saved in state, just show confirmation
    toast({
      title: "Request Saved",
      description: `"${activeRequest.name}" has been saved`,
    });
    setIsSaved(true);
  };

  const copyCurlCommand = () => {
    navigator.clipboard.writeText(curlCommand);
    toast({
      title: "cURL Command Copied",
      description: "Command has been copied to clipboard",
    });
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col">
      <ScrollArea className="flex-1 w-full">
        <div className="p-4">
          {/* Request name input with styling */}
          <div className="mb-4 group relative">
            <div className="flex items-center">
              <input
                type="text"
                value={activeRequest.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full text-xl font-bold bg-transparent border-none outline-none focus:border-b focus:border-primary/30 pb-1"
                placeholder="Request Name"
              />
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCurlCommand(!showCurlCommand)}
                  className="text-muted-foreground hover:text-foreground"
                  title="Show cURL command"
                >
                  <Terminal size={18} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveRequest}
                  className={`${isSaved ? "text-muted-foreground" : "text-primary animate-pulse"}`}
                  title={isSaved ? "Saved" : "Save changes"}
                >
                  {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </Button>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* cURL Command Display */}
          {showCurlCommand && (
            <div className="mb-4 p-3 bg-muted/30 border rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">cURL Command</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyCurlCommand}
                  className="h-7 text-xs"
                >
                  <Copy size={14} className="mr-1.5" /> Copy
                </Button>
              </div>
              <pre className="text-xs overflow-x-auto p-2 bg-muted rounded-md max-h-32">
                {curlCommand}
              </pre>
            </div>
          )}

          {/* URL bar with method selector and send button */}
          <div className="flex flex-col mb-6 space-y-2">
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2">
              <MethodSelector
                value={activeRequest.method}
                onChange={handleMethodChange}
              />

              <UrlInput
                value={activeRequest.url}
                onChange={handleUrlChange}
                onSend={handleSendRequest}
                recentUrls={requestHistory}
              />

              <Button
                onClick={handleSendRequest}
                disabled={isLoading || !activeRequest.url.trim()}
                className="h-10 px-4 min-w-[100px] bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" /> Sending
                  </>
                ) : (
                  <>
                    <Play size={16} className="mr-2" /> Send
                  </>
                )}
              </Button>
            </div>

            <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
              <div className="flex items-center">
                <button
                  className="flex items-center hover:text-foreground"
                  onClick={() => setShowUrlParams(!showUrlParams)}
                >
                  {showUrlParams ? (
                    <ChevronUp size={14} className="mr-1" />
                  ) : (
                    <ChevronDown size={14} className="mr-1" />
                  )}
                  Query Parameters
                </button>

                {activeEnvironment && (
                  <div className="ml-4 flex items-center">
                    <Server size={14} className="mr-1" />
                    Environment:{" "}
                    <span className="font-medium ml-1">
                      {activeEnvironment.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {activeRequest.params.length > 0 && (
                  <div className="flex items-center">
                    <List size={14} className="mr-1" />
                    {activeRequest.params.length} param
                    {activeRequest.params.length !== 1 ? "s" : ""}
                  </div>
                )}

                {activeRequest.headers.length > 0 && (
                  <div className="flex items-center">
                    <Server size={14} className="mr-1" />
                    {activeRequest.headers.length} header
                    {activeRequest.headers.length !== 1 ? "s" : ""}
                  </div>
                )}

                {activeRequest.body.contentType !== "none" && (
                  <div className="flex items-center">
                    <FileJson size={14} className="mr-1" />
                    {activeRequest.body.contentType}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Request tabs */}
          <Tabs defaultValue="params" className="mb-4">
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger value="params" className="flex items-center">
                <List size={14} className="mr-1.5" /> Params
                {activeRequest.params.length > 0 && (
                  <span className="ml-1.5 bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">
                    {activeRequest.params.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="headers" className="flex items-center">
                <Server size={14} className="mr-1.5" /> Headers
                {activeRequest.headers.length > 0 && (
                  <span className="ml-1.5 bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">
                    {activeRequest.headers.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="body" className="flex items-center">
                <FileJson size={14} className="mr-1.5" /> Body
                {activeRequest.body.contentType !== "none" && (
                  <span className="ml-1.5 bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">
                    {activeRequest.body.contentType === "json"
                      ? "JSON"
                      : activeRequest.body.contentType === "form-data"
                        ? "FORM"
                        : activeRequest.body.contentType === "x-www-form-urlencoded"
                          ? "URL"
                          : "RAW"}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="pre-request" className="flex items-center">
                <Code size={14} className="mr-1.5" /> Pre-request
                {activeRequest.preRequestScript && (
                  <span className="ml-1.5 bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">
                    <Eye size={10} />
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="tests" className="flex items-center">
                <CheckCircle2 size={14} className="mr-1.5" /> Tests
                {activeRequest.testScript && (
                  <span className="ml-1.5 bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">
                    <Eye size={10} />
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="params" className="p-4 border rounded-md mt-2">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium">Query Parameters</h3>
                <div className="text-xs text-muted-foreground">
                  Added to URL after ?
                </div>
              </div>
              <KeyValueEditor
                items={activeRequest.params}
                onChange={handleParamsChange}
                placeholders={{ key: "Parameter name", value: "Value" }}
                suggestions={{ keys: [], values: [] }}
              />

              <div className="mt-4 text-xs text-muted-foreground flex items-center">
                <div className="flex items-center mr-4">
                  <input
                    type="checkbox"
                    id="show-params-in-url"
                    checked={showUrlParams}
                    onChange={(e) => setShowUrlParams(e.target.checked)}
                    className="mr-2 h-3 w-3"
                  />
                  <label htmlFor="show-params-in-url">Show parameters in URL</label>
                </div>
                <div>
                  Parameters will be encoded and appended to the URL when the
                  request is sent.
                </div>
              </div>
            </TabsContent>

            <TabsContent value="headers" className="p-4 border rounded-md mt-2">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium">Request Headers</h3>
                <div className="text-xs text-muted-foreground">
                  Sent with the request
                </div>
              </div>
              <KeyValueEditor
                items={activeRequest.headers}
                onChange={handleHeadersChange}
                placeholders={{ key: "Header name", value: "Value" }}
                suggestions={headerSuggestions}
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    const contentTypeHeader = activeRequest.headers.find(
                      (h) => h.key.toLowerCase() === "content-type",
                    );
                    if (!contentTypeHeader) {
                      handleHeadersChange([
                        ...activeRequest.headers,
                        {
                          id: uuidv4(),
                          key: "Content-Type",
                          value: "application/json",
                          enabled: true, },
                      ]);
                    }
                  }}
                >
                  + Content-Type: application/json
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    const authHeader = activeRequest.headers.find(
                      (h) => h.key.toLowerCase() === "authorization",
                    );
                    if (!authHeader) {
                      handleHeadersChange([
                        ...activeRequest.headers,
                        {
                          id: uuidv4(),
                          key: "Authorization",
                          value: "Bearer {{token}}",
                          enabled: true,
                        },
                      ]);
                    }
                  }}
                >
                  + Authorization: Bearer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    const acceptHeader = activeRequest.headers.find(
                      (h) => h.key.toLowerCase() === "accept",
                    );
                    if (!acceptHeader) {
                      handleHeadersChange([
                        ...activeRequest.headers,
                        {
                          id: uuidv4(),
                          key: "Accept",
                          value: "application/json",
                          enabled: true,
                        },
                      ]);
                    }
                  }}
                >
                  + Accept: application/json
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="body" className="p-4 border rounded-md mt-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-medium">Request Body</h3>

                <div className="flex items-center">
                  <select
                    value={activeRequest.body.contentType}
                    onChange={(e) => handleBodyTypeChange(e.target.value)}
                    className="px-3 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary mr-2"
                  >
                    <option value="none">None</option>
                    <option value="json">JSON</option>
                    <option value="form-data">Form Data</option>
                    <option value="x-www-form-urlencoded">
                      x-www-form-urlencoded
                    </option>
                    <option value="raw">Raw</option>
                  </select>

                  {activeRequest.body.contentType === "json" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => {
                        try {
                          const formatted = JSON.stringify(
                            JSON.parse(
                              (activeRequest.body.content as string) || "{}",
                            ),
                            null,
                            2,
                          );
                          handleBodyChange(formatted);
                          toast({
                            title: "JSON Formatted",
                            description: "JSON body has been formatted",
                          });
                        } catch (error) {
                          toast({
                            title: "Format Failed",
                            description: "Invalid JSON. Please check your syntax.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <Braces size={14} className="mr-1.5" /> Format
                    </Button>
                  )}
                </div>
              </div>

              {activeRequest.body.contentType === "none" ? (
                <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed rounded-md bg-muted/5">
                  <AlertCircle size={24} className="text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-sm mb-1">
                    This request does not have a body
                  </p>
                  <p className="text-muted-foreground text-xs mb-4">
                    Select a body type from the dropdown above to add one
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBodyTypeChange("json")}
                    >
                      <FileJson size={14} className="mr-1.5" /> Add JSON Body
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBodyTypeChange("form-data")}
                    >
                      <Plus size={14} className="mr-1.5" /> Add Form Data
                    </Button>
                  </div>
                </div>
              ) : activeRequest.body.contentType === "form-data" ||
                activeRequest.body.contentType === "x-www-form-urlencoded" ? (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {activeRequest.body.contentType === "form-data"
                        ? "Form data is sent as multipart/form-data. Use this for file uploads."
                        : "URL encoded form data is sent in the request body as key-value pairs."}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => {
                        // Toggle between form types
                        handleBodyTypeChange(
                          activeRequest.body.contentType === "form-data"
                            ? "x-www-form-urlencoded"
                            : "form-data",
                        );
                      }}
                    >
                      <RotateCw size={14} className="mr-1.5" />
                      Switch to{" "}
                      {activeRequest.body.contentType === "form-data"
                        ? "URL Encoded"
                        : "Multipart"}
                    </Button>
                  </div>

                  <KeyValueEditor
                    items={(activeRequest.body.content as KeyValuePair[]) || []}
                    onChange={(content) =>
                      updateRequest(activeRequest.id, {
                        body: { ...activeRequest.body, content },
                      })
                    }
                    placeholders={{
                      key:
                        activeRequest.body.contentType === "form-data"
                          ? "Field name"
                          : "Parameter name",
                      value: "Value",
                    }}
                  />
                </div>
              ) : (
                <div>
                  {activeRequest.body.contentType === "json" && (
                    <div className="mb-2 flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        JSON body will be sent with Content-Type: application/json
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => {
                            handleBodyChange(
                              JSON.stringify({ key: "value" }, null, 2),
                            );
                          }}
                        >
                          <Sparkles size={14} className="mr-1.5" /> Sample JSON
                        </Button>
                      </div>
                    </div>
                  )}

                  <EnhancedCodeEditor
                    value={(activeRequest.body.content as string) || ""}
                    onChange={handleBodyChange}
                    language={
                      activeRequest.body.contentType === "json" ? "json" : "text"
                    }
                    height="300px"
                    placeholder={
                      activeRequest.body.contentType === "json"
                        ? '{\n  "key": "value"\n}'
                        : ""
                    }
                  />
                </div>
              )}

              {/* Content-Type header reminder */}
              {activeRequest.body.contentType !== "none" &&
                !activeRequest.headers.some(
                  (h) => h.key.toLowerCase() === "content-type" && h.enabled,
                ) && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-md flex items-start">
                    <AlertCircle
                      size={16}
                      className="text-amber-500 mr-2 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm text-amber-800 dark:text-amber-300">
                        No Content-Type header is set
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                        The server might not correctly interpret your request body
                        without a Content-Type header.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 h-7 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                        onClick={() => {
                          let contentType = "application/json";
                          if (activeRequest.body.contentType === "form-data") {
                            contentType = "multipart/form-data";
                          } else if (
                            activeRequest.body.contentType ===
                            "x-www-form-urlencoded"
                          ) {
                            contentType = "application/x-www-form-urlencoded";
                          } else if (activeRequest.body.contentType === "raw") {
                            contentType = "text/plain";
                          }

                          handleHeadersChange([
                            ...activeRequest.headers,
                            {
                              id: uuidv4(),
                              key: "Content-Type",
                              value: contentType,
                              enabled: true,
                            },
                          ]);

                          toast({
                            title: "Header Added",
                            description: `Content-Type: ${contentType} header has been added`,
                          });
                        }}
                      >
                        <Plus size={14} className="mr-1.5" /> Add Content-Type
                        Header
                      </Button>
                    </div>
                  </div>
                )}
            </TabsContent>

            <TabsContent value="pre-request" className="p-4 border rounded-md mt-2">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium">Pre-request Script</h3>
                <div className="text-xs text-muted-foreground">
                  Runs before the request is sent
                </div>
              </div>

              <EnhancedCodeEditor
                value={activeRequest.preRequestScript}
                onChange={handlePreRequestScriptChange}
                language="javascript"
                height="300px"
                snippets={preRequestSnippets}
              />

              <div className="mt-4 p-3 bg-muted/30 border rounded-md">
                <h4 className="text-sm font-medium mb-2">
                  Pre-request Script Examples
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="text-xs">
                    <p className="font-medium mb-1">Set Authorization Header</p>
                    <pre className="bg-muted p-2 rounded overflow-x-auto">
                      {`pm.request.headers.add({
  key: "Authorization",
  value: "Bearer " + pm.environment.get("token")
});`}
                    </pre>
                  </div>
                  <div className="text-xs">
                    <p className="font-medium mb-1">Set Dynamic Request Body</p>
                    <pre className="bg-muted p-2 rounded overflow-x-auto">
                      {`const body = {
  id: pm.environment.get("user_id"),
  timestamp: new Date().toISOString()
}; pm.request.body = JSON.stringify(body);`}
                    </pre>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tests" className="p-4 border rounded-md mt-2">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium">Test Script</h3>
                <div className="text-xs text-muted-foreground">
                  Runs after the response is received
                </div>
              </div>

              <EnhancedCodeEditor
                value={activeRequest.testScript}
                onChange={handleTestScriptChange}
                language="javascript"
                height="300px"
                snippets={testSnippets}
              />

              <div className="mt-4 p-3 bg-muted/30 border rounded-md">
                <h4 className="text-sm font-medium mb-2">Test Script Examples</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="text-xs">
                    <p className="font-medium mb-1">Check Status Code</p>
                    <pre className="bg-muted p-2 rounded overflow-x-auto">
                      {`pm.test("Status code is 200", function() {
  pm.expect(pm.response.code).to.equal(200);
});`}
                    </pre>
                  </div>
                  <div className="text-xs">
                    <p className="font-medium mb-1">Validate JSON Response</p>
                    <pre className="bg-muted p-2 rounded overflow-x-auto">
                      {`pm.test("Response has required fields", function() {
  const responseData = pm.response.json();
  pm.expect(responseData).to.have.property('id');
  pm.expect(responseData).to.have.property('name');
});`}
                    </pre>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Keyboard shortcuts hint */}
          <div className="text-xs text-muted-foreground mt-2 flex items-center justify-end">
            <div className="flex items-center mr-4">
              <kbd className="px-1.5 py-0.5 bg-muted border rounded text-xs mr-1">
                Ctrl
              </kbd>
              <span className="mx-0.5">+</span>
              <kbd className="px-1.5 py-0.5 bg-muted border rounded text-xs">
                Enter
              </kbd>
              <span className="ml-1.5">Send request</span>
            </div>

            <div className="flex items-center">
              <kbd className="px-1.5 py-0.5 bg-muted border rounded text-xs mr-1">
                Ctrl
              </kbd>
              <span className="mx-0.5">+</span>
              <kbd className="px-1.5 py-0.5 bg-muted border rounded text-xs">S</kbd>
              <span className="ml-1.5">Save request</span>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
