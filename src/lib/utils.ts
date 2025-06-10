// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { KeyValuePair, Environment } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveVariables(text: string, environment?: Environment | null): string {
  if (!environment || !text) return text;
  
  return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
    const variable = environment.variables.find(
      v => v.key === variableName.trim() && v.enabled
    );
    return variable ? variable.value : match;
  });
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getContentTypeHeader(headers: KeyValuePair[]): string | undefined {
  const contentTypeHeader = headers.find(
    h => h.key.toLowerCase() === 'content-type' && h.enabled
  );
  return contentTypeHeader?.value;
}
