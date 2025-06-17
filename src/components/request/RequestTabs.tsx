import React from "react";
import { List, Server, FileJson, Code, CheckCircle2, Eye } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { ParamsTab } from "./tabs/ParamsTab";
import { HeadersTab } from "./tabs/HeadersTab";
import { BodyTab } from "./tabs/BodyTab";
import { PreRequestTab } from "./tabs/PreRequestTab";
import { TestsTab } from "./tabs/TestsTab";
import type { ApiRequest } from "../../types";

interface RequestTabsProps {
  activeRequest: ApiRequest;
  showUrlParams: boolean;
  setShowUrlParams: (show: boolean) => void;
  requestActions: any; // We'll use the actions from the hook
}

export const RequestTabs: React.FC<RequestTabsProps> = ({
  activeRequest,
  showUrlParams,
  setShowUrlParams,
  requestActions,
}) => {
  return (
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
        <ParamsTab
          activeRequest={activeRequest}
          showUrlParams={showUrlParams}
          setShowUrlParams={setShowUrlParams}
          onParamsChange={requestActions.handleParamsChange}
        />
      </TabsContent>

      <TabsContent value="headers" className="p-4 border rounded-md mt-2">
        <HeadersTab
          activeRequest={activeRequest}
          onHeadersChange={requestActions.handleHeadersChange}
        />
      </TabsContent>

      <TabsContent value="body" className="p-4 border rounded-md mt-2">
        <BodyTab
          activeRequest={activeRequest}
          onBodyChange={requestActions.handleBodyChange}
          onBodyTypeChange={requestActions.handleBodyTypeChange}
          onHeadersChange={requestActions.handleHeadersChange}
        />
      </TabsContent>

      <TabsContent value="pre-request" className="p-4 border rounded-md mt-2">
        <PreRequestTab
          activeRequest={activeRequest}
          onPreRequestScriptChange={requestActions.handlePreRequestScriptChange}
        />
      </TabsContent>

      <TabsContent value="tests" className="p-4 border rounded-md mt-2">
        <TestsTab
          activeRequest={activeRequest}
          onTestScriptChange={requestActions.handleTestScriptChange}
        />
      </TabsContent>
    </Tabs>
  );
};
