import React, { useState } from "react";
import { useAppStore } from "../../store";
import { Server, Plus, Upload } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { RequestHeader } from "./RequestHeader";
import { RequestUrl } from "./RequestUrl";
import { RequestTabs } from "./RequestTabs";
import { useRequestActions } from "./utils/requestHooks";

export const RequestPanel: React.FC = () => {
  const { activeRequestId, getRequests } = useAppStore();
  const requests = getRequests();
  const activeRequest = requests.find((r) => r.id === activeRequestId);

  const [requestHistory, setRequestHistory] = useState<string[]>([]);
  const [showUrlParams, setShowUrlParams] = useState(false);
  const [showCurlCommand, setShowCurlCommand] = useState(false);
  const [isSaved, setIsSaved] = useState(true);

  const requestActions = useRequestActions({
    activeRequest,
    setIsSaved,
    requestHistory,
    setRequestHistory,
    showUrlParams,
  });

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

  return (
    <div className="flex-1 w-full h-full flex flex-col">
      <ScrollArea className="flex-1 w-full">
        <div className="p-4">
          <RequestHeader
            activeRequest={activeRequest}
            isSaved={isSaved}
            showCurlCommand={showCurlCommand}
            setShowCurlCommand={setShowCurlCommand}
            onNameChange={requestActions.handleNameChange}
            onSaveRequest={requestActions.handleSaveRequest}
          />

          <RequestUrl
            activeRequest={activeRequest}
            isLoading={requestActions.isLoading}
            requestHistory={requestHistory}
            showUrlParams={showUrlParams}
            setShowUrlParams={setShowUrlParams}
            onMethodChange={requestActions.handleMethodChange}
            onUrlChange={requestActions.handleUrlChange}
            onSendRequest={requestActions.handleSendRequest}
          />

          <RequestTabs
            activeRequest={activeRequest}
            showUrlParams={showUrlParams}
            setShowUrlParams={setShowUrlParams}
            requestActions={requestActions}
          />

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
              <kbd className="px-1.5 py-0.5 bg-muted border rounded text-xs">
                S
              </kbd>
              <span className="ml-1.5">Save request</span>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
