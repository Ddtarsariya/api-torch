// File: src/types.ts
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD";

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestBody {
  contentType:
    | "json"
    | "form-data"
    | "x-www-form-urlencoded"
    | "raw"
    | "binary"
    | "none";
  content: string | KeyValuePair[];
}

export interface ApiRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: KeyValuePair[];
  params: KeyValuePair[];
  body: RequestBody;
  preRequestScript: string;
  testScript: string;
  collectionId?: string;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
  size: number;
}

export interface Environment {
  id: string;
  name: string;
  variables: KeyValuePair[];
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  items: (Collection | ApiRequest)[];
}

export interface Workspace {
  id: string;
  name: string;
  collections: Collection[];
  environments: Environment[];
  activeEnvironmentId: string | null;
}

export interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

export interface RunResult {
  requestId: string;
  requestName: string;
  response: ApiResponse | null;
  error?: string;
  testResults: TestResult[];
  duration: number;
}
