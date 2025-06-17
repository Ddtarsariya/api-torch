import React from "react";
import {
  ChevronUp,
  ChevronDown,
  Server,
  List,
  FileJson,
  Loader2,
  Play,
} from "lucide-react";
import { Button } from "../ui/button";
import { MethodSelector } from "./MethodSelector";
import { UrlInput } from "./UrlInput";
import type { ApiRequest, HttpMethod } from "../../types";
import { useAppStore } from "../../store";

interface RequestUrlProps {
  activeRequest: ApiRequest;
  isLoading: boolean;
  requestHistory: string[];
  showUrlParams: boolean;
  setShowUrlParams: (show: boolean) => void;
  onMethodChange: (method: HttpMethod) => void;
  onUrlChange: (url: string) => void;
  onSendRequest: () => void;
}

export const RequestUrl: React.FC<RequestUrlProps> = ({
  activeRequest,
  isLoading,
  requestHistory,
  showUrlParams,
  setShowUrlParams,
  onMethodChange,
  onUrlChange,
  onSendRequest,
}) => {
  const { getActiveWorkspace, getEnvironments } = useAppStore();

  const workspace = getActiveWorkspace();
  const environments = getEnvironments();
  const activeEnvironment = environments.find(
    (e) => e.id === workspace.activeEnvironmentId,
  );

  return (
    <div className="flex flex-col mb-6 space-y-2">
      <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2">
        <MethodSelector
          value={activeRequest.method}
          onChange={onMethodChange}
        />

        <UrlInput
          value={activeRequest.url}
          onChange={onUrlChange}
          onSend={onSendRequest}
          recentUrls={requestHistory}
        />

        <Button
          onClick={onSendRequest}
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
              <span className="font-medium ml-1">{activeEnvironment.name}</span>
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
  );
};
