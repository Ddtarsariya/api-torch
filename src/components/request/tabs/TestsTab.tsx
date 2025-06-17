import React from "react";
import { EnhancedCodeEditor } from "../EnhancedCodeEditor";
import type { ApiRequest } from "../../../types";

interface TestsTabProps {
  activeRequest: ApiRequest;
  onTestScriptChange: (script: string) => void;
}

export const TestsTab: React.FC<TestsTabProps> = ({
  activeRequest,
  onTestScriptChange,
}) => {
  const testSnippets = [
    {
      name: "Check Status Code",
      code: `// Verify successful response
pm.test("Status code is 200", function() {
  pm.expect(pm.response.code).to.equal(200);
});`,
    },
    {
      name: "Validate Response Schema",
      code: `// Check response has required fields
pm.test("Response has required fields", function() {
  const responseData = pm.response.json();
  pm.expect(responseData).to.have.property('id');
  pm.expect(responseData).to.have.property('name');
});`,
    },
    {
      name: "Extract & Save Value",
      code: `// Extract token from response and save to environment
pm.test("Extract auth token", function() {
  const responseData = pm.response.json();
  if (responseData.token) {
    pm.environment.set("token", responseData.token);
    console.log("Token saved to environment");
  }
});`,
    },
  ];

  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium">Test Script</h3>
        <div className="text-xs text-muted-foreground">
          Runs after the response is received
        </div>
      </div>

      <EnhancedCodeEditor
        value={activeRequest.testScript}
        onChange={onTestScriptChange}
        language="javascript"
        height="300px"
        snippets={testSnippets}
      />

      <div className="mt-4 p-3 bg-muted/30 border rounded-md">
        <h4 className="text-sm font-medium mb-2">Test Script Examples</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="text-xs">
            <p className="font-medium mb-1">Check Status Code</p>
            <pre className="bg-muted p-2 rounded overflow-x-auto">
              {`pm.test("Status code is 200", function() {
  pm.expect(pm.response.code).to.equal(200);
});`}
            </pre>
          </div>
          <div className="text-xs">
            <p className="font-medium mb-1">Validate JSON Response</p>
            <pre className="bg-muted p-2 rounded overflow-x-auto">
              {`pm.test("Response has required fields", function() {
  const responseData = pm.response.json();
  pm.expect(responseData).to.have.property('id');
  pm.expect(responseData).to.have.property('name');
});`}
            </pre>
          </div>
        </div>
      </div>
    </>
  );
};
