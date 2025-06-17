import React, { useState, useEffect } from "react";
import { formatBytes } from "../../lib/utils";
import { Button } from "../ui/button";
import { LayoutToggle } from "../ui/layout-toggle";
import { getStatusColor, getStatusIcon } from "./utils/responseFormatters";
import {
  Clock,
  Copy,
  Download,
  Maximize2,
  Minimize2,
  CheckCircle2,
} from "lucide-react";
import type { ApiResponse } from "../../types";

interface ResponseHeaderProps {
  response: ApiResponse;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  activeTab: string;
}

export const ResponseHeader: React.FC<ResponseHeaderProps> = ({
  response,
  isFullscreen,
  toggleFullscreen,
  activeTab,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  // Reset copy success message
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  const copyResponseToClipboard = () => {
    let content = "";

    if (activeTab === "body") {
      content =
        typeof response.data === "object"
          ? JSON.stringify(response.data, null, 2)
          : String(response.data);
    } else if (activeTab === "headers") {
      content = Object.entries(response.headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
    }

    navigator.clipboard.writeText(content);
    setCopySuccess(true);
  };

  const downloadResponse = () => {
    let content = "";
    let filename = "";
    let type = "";

    if (activeTab === "body") {
      if (typeof response.data === "object") {
        content = JSON.stringify(response.data, null, 2);
        filename = "response.json";
        type = "application/json";
      } else {
        content = String(response.data);
        filename = "response.txt";
        type = "text/plain";
      }
    } else if (activeTab === "headers") {
      content = Object.entries(response.headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
      filename = "headers.txt";
      type = "text/plain";
    } else if (activeTab === "preview" && typeof response.data === "string") {
      content = response.data;
      filename = "response.html";
      type = "text/html";
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur-sm transition-all h-auto">
      <div className="flex items-center">
        <div
          className={`flex items-center px-3 py-1 rounded-full ${getStatusColor(response.status)}`}
        >
          {getStatusIcon(response.status)}
          <span className="ml-1.5 font-semibold">{response.status}</span>
        </div>
        <span className="ml-3 text-muted-foreground">
          {response.statusText}
        </span>
      </div>

      <div className="flex items-center space-x-1">
        <div className="text-sm text-muted-foreground mr-2 flex items-center">
          <Clock size={14} className="mr-1" /> {response.time}ms
          <span className="mx-1.5">•</span>
          {formatBytes(response.size)}
        </div>

        {/* Layout toggle button */}
        <LayoutToggle className="h-8 w-8" />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={copyResponseToClipboard}
          title={copySuccess ? "Copied!" : "Copy to clipboard"}
        >
          {copySuccess ? <CheckCircle2 size={16} /> : <Copy size={16} />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={downloadResponse}
          title="Download response"
        >
          <Download size={16} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </Button>
      </div>
    </div>
  );
};
