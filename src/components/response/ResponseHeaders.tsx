import React, { useState } from "react";
import { Input } from "../ui/input";
import { AlertCircle } from "lucide-react";

interface ResponseHeadersProps {
  headers: Record<string, string>;
}

export const ResponseHeaders: React.FC<ResponseHeadersProps> = ({
  headers,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHeaders = Object.entries(headers).filter(([key]) =>
    key.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-1">
      <Input
        type="text"
        placeholder="Search headers..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-2"
      />

      {filteredHeaders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle size={24} className="text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            {Object.keys(headers).length === 0
              ? "No headers found in the response"
              : "No headers match your search"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          {filteredHeaders.map(([key, value]) => (
            <React.Fragment key={key}>
              <div className="font-medium text-sm">{key}:</div>
              <div className="text-sm break-all">{value}</div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
