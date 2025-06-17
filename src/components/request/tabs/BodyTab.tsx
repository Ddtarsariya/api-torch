import React from "react";
import { v4 as uuidv4 } from "uuid";
import {
  AlertCircle,
  Braces,
  Sparkles,
  Plus,
  RotateCw,
  FileJson,
} from "lucide-react";
import { Button } from "../../ui/button";
import { EnhancedCodeEditor } from "../EnhancedCodeEditor";
import { KeyValueEditor } from "../KeyValueEditor";
import { useToast } from "../../../hooks/use-toast";
import type { ApiRequest, KeyValuePair } from "../../../types";

interface BodyTabProps {
  activeRequest: ApiRequest;
  onBodyChange: (content: string) => void;
  onBodyTypeChange: (contentType: string) => void;
  onHeadersChange: (headers: KeyValuePair[]) => void;
}

export const BodyTab: React.FC<BodyTabProps> = ({
  activeRequest,
  onBodyChange,
  onBodyTypeChange,
  onHeadersChange,
}) => {
  const { toast } = useToast();

  const formatJson = () => {
    try {
      const formatted = JSON.stringify(
        JSON.parse((activeRequest.body.content as string) || "{}"),
        null,
        2,
      );
      onBodyChange(formatted);
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
  };

  const handleFormDataChange = (content: KeyValuePair[]) => {
    // This is the correct way to update form data content
    // We're not changing the content type, just the content itself
    const updatedBody = {
      ...activeRequest.body,
      content,
    };
    // We need to call onBodyChange with the stringified content for the API
    onBodyChange(JSON.stringify(updatedBody.content));
  };

  const addContentTypeHeader = () => {
    let contentType = "application/json";
    if (activeRequest.body.contentType === "form-data") {
      contentType = "multipart/form-data";
    } else if (activeRequest.body.contentType === "x-www-form-urlencoded") {
      contentType = "application/x-www-form-urlencoded";
    } else if (activeRequest.body.contentType === "raw") {
      contentType = "text/plain";
    }

    onHeadersChange([
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
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium">Request Body</h3>

        <div className="flex items-center">
          <select
            value={activeRequest.body.contentType}
            onChange={(e) => onBodyTypeChange(e.target.value)}
            className="px-3 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary mr-2"
          >
            <option value="none">None</option>
            <option value="json">JSON</option>
            <option value="form-data">Form Data</option>
            <option value="x-www-form-urlencoded">x-www-form-urlencoded</option>
            <option value="raw">Raw</option>
          </select>

          {activeRequest.body.contentType === "json" && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={formatJson}
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
              onClick={() => onBodyTypeChange("json")}
            >
              <FileJson size={14} className="mr-1.5" /> Add JSON Body
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBodyTypeChange("form-data")}
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
                onBodyTypeChange(
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
            onChange={handleFormDataChange}
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
                    onBodyChange(JSON.stringify({ key: "value" }, null, 2));
                  }}
                >
                  <Sparkles size={14} className="mr-1.5" /> Sample JSON
                </Button>
              </div>
            </div>
          )}

          <EnhancedCodeEditor
            value={(activeRequest.body.content as string) || ""}
            onChange={onBodyChange}
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
                onClick={addContentTypeHeader}
              >
                <Plus size={14} className="mr-1.5" /> Add Content-Type Header
              </Button>
            </div>
          </div>
        )}
    </>
  );
};
