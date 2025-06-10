// src/types.ts
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface ApiRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: KeyValuePair[];
  params: KeyValuePair[];
  body: {
    contentType: 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw';
    content: string | KeyValuePair[];
  };
  preRequestScript: string;
  testScript: string;
  folderId?: string;
}

export interface ApiResponse {
  id: string;
  requestId: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  size: number;
  timestamp: number;
}

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export interface Environment {
  id: string;
  name: string;
  variables: KeyValuePair[];
}

export interface Workspace {
  id: string;
  name: string;
  activeEnvironmentId?: string;
}
