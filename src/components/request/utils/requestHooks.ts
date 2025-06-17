import { useState } from "react";
import { useAppStore } from "../../../store";
import { useToast } from "../../../hooks/use-toast";
import { sendRequest } from "../../../lib/request-service";
import type { ApiRequest, HttpMethod, KeyValuePair } from "../../../types";

export const useRequestActions = ({
  activeRequest,
  setIsSaved,
  requestHistory,
  setRequestHistory,
  showUrlParams,
}: {
  activeRequest: ApiRequest | undefined;
  setIsSaved: (saved: boolean) => void;
  requestHistory: string[];
  setRequestHistory: (history: string[]) => void;
  showUrlParams: boolean;
}) => {
  const { toast } = useToast();
  const {
    updateRequest,
    setActiveResponse,
    getActiveWorkspace,
    getEnvironments,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);

  const workspace = getActiveWorkspace();
  const environments = getEnvironments();
  const activeEnvironment = environments.find(
    (e) => e.id === workspace.activeEnvironmentId,
  );

  if (!activeRequest) {
    return {
      isLoading,
      handleSendRequest: () => {},
      handleMethodChange: () => {},
      handleUrlChange: () => {},
      handleNameChange: () => {},
      handleHeadersChange: () => {},
      handleParamsChange: () => {},
      handleBodyChange: () => {},
      handleBodyTypeChange: () => {},
      handlePreRequestScriptChange: () => {},
      handleTestScriptChange: () => {},
      handleSaveRequest: () => {},
    };
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
        setRequestHistory([activeRequest.url, ...requestHistory.slice(0, 9)]);
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
      try {
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
      } catch (error) {
        // If URL is invalid, just update params without modifying URL
        console.warn("Invalid URL, couldn't update params in URL");
      }
    }
  };

  const handleBodyChange = (content: string) => {
    updateRequest(activeRequest.id, {
      body: { ...activeRequest.body, content },
    });
    setIsSaved(false);
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

  const handlePreRequestScriptChange = (value: string) => {
    updateRequest(activeRequest.id, { preRequestScript: value });
    setIsSaved(false);
  };

  const handleTestScriptChange = (value: string) => {
    updateRequest(activeRequest.id, { testScript: value });
    setIsSaved(false);
  };

  const handleSaveRequest = () => {
    // Already saved in state, just show confirmation
    toast({
      title: "Request Saved",
      description: `"${activeRequest.name}" has been saved`,
    });
    setIsSaved(true);
  };

  return {
    isLoading,
    handleSendRequest,
    handleMethodChange,
    handleUrlChange,
    handleNameChange,
    handleHeadersChange,
    handleParamsChange,
    handleBodyChange,
    handleBodyTypeChange,
    handlePreRequestScriptChange,
    handleTestScriptChange,
    handleSaveRequest,
  };
};
