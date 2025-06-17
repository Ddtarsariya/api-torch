import React from "react";
import { EnhancedCodeEditor } from "../EnhancedCodeEditor";
import type { ApiRequest } from "../../../types";

interface PreRequestTabProps {
  activeRequest: ApiRequest;
  onPreRequestScriptChange: (script: string) => void;
}

export const PreRequestTab: React.FC<PreRequestTabProps> = ({
  activeRequest,
  onPreRequestScriptChange,
}) => {
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

  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium">Pre-request Script</h3>
        <div className="text-xs text-muted-foreground">
          Runs before the request is sent
        </div>
      </div>

      <EnhancedCodeEditor
        value={activeRequest.preRequestScript}
        onChange={onPreRequestScriptChange}
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
    </>
  );
};
