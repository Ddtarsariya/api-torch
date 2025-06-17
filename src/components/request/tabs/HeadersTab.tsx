import React from "react";
import { v4 as uuidv4 } from "uuid";
import { KeyValueEditor } from "../../request/KeyValueEditor";
import { Button } from "../../ui/button";
import type { ApiRequest, KeyValuePair } from "../../../types";

interface HeadersTabProps {
  activeRequest: ApiRequest;
  onHeadersChange: (headers: KeyValuePair[]) => void;
}

export const HeadersTab: React.FC<HeadersTabProps> = ({
  activeRequest,
  onHeadersChange,
}) => {
  // Common header suggestions
  const headerSuggestions = {
    keys: [
      "Accept",
      "Authorization",
      "Content-Type",
      "User-Agent",
      "Cache-Control",
      "X-API-Key",
      "X-Requested-With",
      "Origin",
      "Referer",
      "Accept-Language",
    ],
    values: [
      "application/json",
      "application/xml",
      "text/plain",
      "text/html",
      "Bearer ",
      "Basic ",
      "no-cache",
      "XMLHttpRequest",
    ],
  };

  const addHeader = (key: string, value: string) => {
    const headerExists = activeRequest.headers.find(
      (h) => h.key.toLowerCase() === key.toLowerCase(),
    );

    if (!headerExists) {
      onHeadersChange([
        ...activeRequest.headers,
        {
          id: uuidv4(),
          key: key,
          value: value,
          enabled: true,
        },
      ]);
    }
  };

  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium">Request Headers</h3>
        <div className="text-xs text-muted-foreground">
          Sent with the request
        </div>
      </div>
      <KeyValueEditor
        items={activeRequest.headers}
        onChange={onHeadersChange}
        placeholders={{ key: "Header name", value: "Value" }}
        suggestions={headerSuggestions}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-7"
          onClick={() => addHeader("Content-Type", "application/json")}
        >
          + Content-Type: application/json
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-7"
          onClick={() => addHeader("Authorization", "Bearer {{token}}")}
        >
          + Authorization: Bearer
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-7"
          onClick={() => addHeader("Accept", "application/json")}
        >
          + Accept: application/json
        </Button>
      </div>
    </>
  );
};
