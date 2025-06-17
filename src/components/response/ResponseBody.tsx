import React from "react";
import { useAppStore } from "../../store";
import { Editor } from "@monaco-editor/react";
import { EnhancedCodeEditor } from "../request/EnhancedCodeEditor";
import type { ApiResponse } from "../../types";

interface ResponseBodyProps {
  response: ApiResponse;
}

export const ResponseBody: React.FC<ResponseBodyProps> = ({ response }) => {
  const { theme } = useAppStore();
  const editorTheme = theme === "dark" ? "api-torch-dark" : "api-torch-light";

  const formatResponseBody = () => {
    try {
      // Handle JSON objects
      if (typeof response.data === "object") {
        const jsonString = JSON.stringify(response.data, null, 2);
        return (
          <div className="h-full">
            <EnhancedCodeEditor
              value={jsonString}
              onChange={() => {}}
              language="json"
              height="100%"
              placeholder=""
              readOnly={true}
            />
          </div>
        );
      }

      // Try to parse JSON strings
      if (
        typeof response.data === "string" &&
        (response.data.startsWith("{") || response.data.startsWith("["))
      ) {
        try {
          const jsonData = JSON.parse(response.data);
          const jsonString = JSON.stringify(jsonData, null, 2);
          return (
            <div className="h-full">
              <EnhancedCodeEditor
                value={jsonString}
                onChange={() => {}}
                language="json"
                height="100%"
                placeholder=""
                readOnly={true}
              />
            </div>
          );
        } catch {
          // If parsing fails, continue to text handling
        }
      }

      // Detect language based on content type
      let language = "text";
      const contentType = response.headers["content-type"] || "";

      if (contentType.includes("html")) {
        language = "html";
      } else if (
        contentType.includes("javascript") ||
        contentType.includes("js")
      ) {
        language = "javascript";
      } else if (contentType.includes("css")) {
        language = "css";
      } else if (contentType.includes("xml")) {
        language = "xml";
      }

      // For plain text or other formats
      return (
        <div className="h-full">
          <Editor
            height="100%"
            language={language}
            value={response.data}
            theme={editorTheme}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 13,
              wordWrap: "on",
              automaticLayout: true,
              fontFamily: 'Menlo, Monaco, "Courier New", monospace',
              fontLigatures: true,
            }}
          />
        </div>
      );
    } catch (error) {
      return (
        <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-md">
          <p className="text-destructive font-medium mb-1">
            Error displaying response
          </p>
          <p className="text-sm">{String(error)}</p>
        </div>
      );
    }
  };

  return formatResponseBody();
};
