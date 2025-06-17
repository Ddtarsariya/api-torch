import React from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export const getStatusColor = (status: number): string => {
  if (status >= 200 && status < 300)
    return "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30";
  if (status >= 300 && status < 400)
    return "text-amber-500 bg-amber-50 dark:bg-amber-950/30";
  if (status >= 400 && status < 500)
    return "text-rose-500 bg-rose-50 dark:bg-rose-950/30";
  if (status >= 500) return "text-red-500 bg-red-50 dark:bg-red-950/30";
  return "text-gray-500 bg-gray-50 dark:bg-gray-800/30";
};

export const getStatusIcon = (status: number): React.ReactNode => {
  if (status >= 200 && status < 300)
    return <CheckCircle2 size={16} className="text-emerald-500" />;
  if (status >= 300 && status < 400)
    return <AlertCircle size={16} className="text-amber-500" />;
  if (status >= 400) return <XCircle size={16} className="text-rose-500" />;
  return null;
};

export const detectContentType = (
  data: any,
  headers: Record<string, string>,
): { language: string; isJson: boolean; isHtml: boolean } => {
  const contentType = headers["content-type"] || "";
  let language = "text";
  let isJson = false;
  let isHtml = false;

  // Check if it's JSON
  if (
    typeof data === "object" ||
    contentType.includes("json") ||
    (typeof data === "string" &&
      (data.trim().startsWith("{") || data.trim().startsWith("[")))
  ) {
    language = "json";
    isJson = true;
  }
  // Check if it's HTML
  else if (
    contentType.includes("html") ||
    (typeof data === "string" &&
      (data.trim().startsWith("<!DOCTYPE html") ||
        data.trim().startsWith("<html")))
  ) {
    language = "html";
    isHtml = true;
  }
  // Check other content types
  else if (contentType.includes("javascript") || contentType.includes("js")) {
    language = "javascript";
  } else if (contentType.includes("css")) {
    language = "css";
  } else if (contentType.includes("xml")) {
    language = "xml";
  }

  return { language, isJson, isHtml };
};
