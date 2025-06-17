import React from "react";
import { KeyValueEditor } from "../../request/KeyValueEditor";
import type { ApiRequest, KeyValuePair } from "../../../types";

interface ParamsTabProps {
  activeRequest: ApiRequest;
  showUrlParams: boolean;
  setShowUrlParams: (show: boolean) => void;
  onParamsChange: (params: KeyValuePair[]) => void;
}

export const ParamsTab: React.FC<ParamsTabProps> = ({
  activeRequest,
  showUrlParams,
  setShowUrlParams,
  onParamsChange,
}) => {
  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium">Query Parameters</h3>
        <div className="text-xs text-muted-foreground">
          Added to URL after ?
        </div>
      </div>
      <KeyValueEditor
        items={activeRequest.params}
        onChange={onParamsChange}
        placeholders={{ key: "Parameter name", value: "Value" }}
        suggestions={{ keys: [], values: [] }}
      />

      <div className="mt-4 text-xs text-muted-foreground flex items-center">
        <div className="flex items-center mr-4">
          <input
            type="checkbox"
            id="show-params-in-url"
            checked={showUrlParams}
            onChange={(e) => setShowUrlParams(e.target.checked)}
            className="mr-2 h-3 w-3"
          />
          <label htmlFor="show-params-in-url">Show parameters in URL</label>
        </div>
        <div>
          Parameters will be encoded and appended to the URL when the request is
          sent.
        </div>
      </div>
    </>
  );
};
