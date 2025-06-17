import React from "react";
import { Terminal, BookmarkCheck, Bookmark, Copy } from "lucide-react";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";
import { generateCurlCommand } from "../../lib/request-service";
import { useAppStore } from "../../store";
import type { ApiRequest } from "../../types";

interface RequestHeaderProps {
  activeRequest: ApiRequest;
  isSaved: boolean;
  showCurlCommand: boolean;
  setShowCurlCommand: (show: boolean) => void;
  onNameChange: (name: string) => void;
  onSaveRequest: () => void;
}

export const RequestHeader: React.FC<RequestHeaderProps> = ({
  activeRequest,
  isSaved,
  showCurlCommand,
  setShowCurlCommand,
  onNameChange,
  onSaveRequest,
}) => {
  const { toast } = useToast();
  const { getActiveWorkspace, getEnvironments } = useAppStore();

  const workspace = getActiveWorkspace();
  const environments = getEnvironments();
  const activeEnvironment = environments.find(
    (e) => e.id === workspace.activeEnvironmentId,
  );

  const curlCommand = generateCurlCommand(activeRequest, activeEnvironment);

  const copyCurlCommand = () => {
    navigator.clipboard.writeText(curlCommand);
    toast({
      title: "cURL Command Copied",
      description: "Command has been copied to clipboard",
    });
  };

  return (
    <>
      {/* Request name input with styling */}
      <div className="mb-4 group relative">
        <div className="flex items-center">
          <input
            type="text"
            value={activeRequest.name}
            onChange={(e) => onNameChange(e.target.value)}
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
              onClick={onSaveRequest}
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
    </>
  );
};
