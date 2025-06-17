import React from "react";
import type { ApiRequest } from "../../types";
import { RunnerRequestItem } from "./RunnerRequestItem";

interface RunnerRequestListProps {
  displayedRequests: ApiRequest[];
  showFailedOnly: boolean;
}

export const RunnerRequestList: React.FC<RunnerRequestListProps> = ({
  displayedRequests,
  showFailedOnly,
}) => {
  return (
    <div className="divide-y divide-border">
      <div className="grid grid-cols-12 gap-4 p-3 font-medium text-sm text-muted-foreground bg-muted/50">
        <div className="col-span-5 md:col-span-6">Request</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2 md:col-span-1">Time</div>
        <div className="col-span-3">Tests</div>
      </div>

      <div className="divide-y divide-border">
        {displayedRequests.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">
              {showFailedOnly
                ? "No failed requests in this collection"
                : "No requests in this collection"}
            </p>
          </div>
        ) : (
          displayedRequests.map((request) => (
            <RunnerRequestItem key={request.id} request={request} />
          ))
        )}
      </div>
    </div>
  );
};
