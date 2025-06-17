import React, { useState } from "react";
import { useAppStore } from "../../store";
import { Eye, File, FileJson } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { ResponseHeader } from "./ResponseHeader";
import { ResponseBody } from "./ResponseBody";
import { ResponseHeaders } from "./ResponseHeaders";
import { ResponsePreview } from "./ResponsePreview";

export const ResponsePanel: React.FC = () => {
  const { activeResponse } = useAppStore();
  const [activeTab, setActiveTab] = useState("body");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if response is HTML to show preview tab
  const isHtmlResponse =
    activeResponse?.headers["content-type"]?.includes("html") ||
    (typeof activeResponse?.data === "string" &&
      (activeResponse.data.trim().startsWith("<!DOCTYPE html") ||
        activeResponse.data.trim().startsWith("<html")));

  if (!activeResponse) {
    return (
      <div
        className={`w-full h-full overflow-hidden flex flex-col items-center justify-center ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}
      >
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <File size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">Response will appear here</h3>
        <p className="text-muted-foreground max-w-md">
          Send a request to see the response data, status code, and headers
        </p>
      </div>
    );
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`overflow-hidden flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-background" : "w-full h-full"}`}
    >
      <ResponseHeader
        response={activeResponse}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        activeTab={activeTab}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs
          defaultValue="body"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col h-full"
        >
          <TabsList className="px-4 pt-2 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="body" className="flex items-center">
              <FileJson size={14} className="mr-1.5" /> Body
            </TabsTrigger>
            <TabsTrigger value="headers" className="flex items-center">
              <File size={14} className="mr-1.5" /> Headers
            </TabsTrigger>

            {isHtmlResponse && (
              <TabsTrigger value="preview" className="flex items-center">
                <Eye size={14} className="mr-1.5" /> Preview
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="body" className="flex-1 p-0 m-0 h-full">
            <ResponseBody response={activeResponse} />
          </TabsContent>

          <TabsContent value="headers" className="flex-1 overflow-auto p-4">
            <ResponseHeaders headers={activeResponse.headers} />
          </TabsContent>

          {isHtmlResponse && (
            <TabsContent value="preview" className="flex-1 p-0 m-0 h-full">
              <ResponsePreview
                htmlContent={
                  typeof activeResponse.data === "string"
                    ? activeResponse.data
                    : JSON.stringify(activeResponse.data, null, 2)
                }
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};
