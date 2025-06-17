import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import type {
  ApiRequest,
  ApiResponse,
  Environment,
  KeyValuePair,
} from "../types";
import { resolveVariables, getContentTypeHeader } from "./utils";

// Function to prepare headers with enhanced variable support
function prepareHeaders(
  headers: KeyValuePair[],
  environment?: Environment | null,
): Record<string, string> {
  const result: Record<string, string> = {};

  headers.forEach((header) => {
    if (header.enabled && header.key.trim()) {
      result[header.key] = environment
        ? resolveVariables(header.value, environment)
        : header.value;
    }
  });

  return result;
}

// Function to prepare URL with query parameters and variable resolution
function prepareUrl(
  url: string,
  params: KeyValuePair[],
  environment?: Environment | null,
): string {
  if (!url) return "";

  // Resolve variables in the base URL first
  const resolvedUrl = environment ? resolveVariables(url, environment) : url;

  // If no params or URL already has query parameters, return as is
  if (!params.length) return resolvedUrl;

  try {
    const urlObj = new URL(resolvedUrl);

    // Add enabled params with variable resolution
    params.forEach((param) => {
      if (param.enabled && param.key.trim()) {
        const resolvedValue = environment
          ? resolveVariables(param.value, environment)
          : param.value;

        urlObj.searchParams.append(param.key, resolvedValue);
      }
    });

    return urlObj.toString();
  } catch (error) {
    // If URL parsing fails, try a simpler approach
    console.warn("URL parsing failed, using fallback method", error);

    const hasQuery = resolvedUrl.includes("?");
    let result = resolvedUrl;

    params.forEach((param, index) => {
      if (param.enabled && param.key.trim()) {
        const resolvedValue = environment
          ? resolveVariables(param.value, environment)
          : param.value;

        const separator = index === 0 && !hasQuery ? "?" : "&";
        result += `${separator}${encodeURIComponent(param.key)}=${encodeURIComponent(resolvedValue)}`;
      }
    });

    return result;
  }
}

// Function to prepare request body with enhanced handling
function prepareBody(
  request: ApiRequest,
  environment?: Environment | null,
): any {
  if (request.body.contentType === "none") return undefined;

  if (request.body.contentType === "json") {
    try {
      // First resolve any variables in the JSON string
      const jsonString = environment
        ? resolveVariables(request.body.content as string, environment)
        : (request.body.content as string);

      // Then parse it to ensure it's valid JSON
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Invalid JSON body:", error);
      // Return as string if parsing fails
      return request.body.content;
    }
  }

  if (request.body.contentType === "form-data") {
    const formData = new FormData();
    (request.body.content as KeyValuePair[]).forEach((item) => {
      if (item.enabled && item.key.trim()) {
        const resolvedValue = environment
          ? resolveVariables(item.value, environment)
          : item.value;

        formData.append(item.key, resolvedValue);
      }
    });
    return formData;
  }

  if (request.body.contentType === "x-www-form-urlencoded") {
    const params = new URLSearchParams();
    (request.body.content as KeyValuePair[]).forEach((item) => {
      if (item.enabled && item.key.trim()) {
        const resolvedValue = environment
          ? resolveVariables(item.value, environment)
          : item.value;

        params.append(item.key, resolvedValue);
      }
    });
    return params;
  }

  // For raw content, just resolve variables
  return environment
    ? resolveVariables(request.body.content as string, environment)
    : request.body.content;
}

// Enhanced pre-request script execution with better sandbox
function executePreRequestScript(
  script: string,
  request: ApiRequest,
  environment?: Environment | null,
): ApiRequest {
  if (!script.trim()) return request;

  try {
    // Create a safe environment for script execution with more capabilities
    const sandbox = {
      request: JSON.parse(JSON.stringify(request)),
      environment: environment
        ? {
            get: (key: string) => {
              const variable = environment.variables.find(
                (v) => v.key === key && v.enabled,
              );
              return variable ? variable.value : null;
            },
            set: (key: string, value: string) => {
              // This would need to be implemented in the store
              console.log(`Setting environment variable ${key} to ${value}`);
            },
          }
        : {},
      console: {
        log: (...args: any[]) => console.log("[Pre-request]", ...args),
        warn: (...args: any[]) => console.warn("[Pre-request]", ...args),
        error: (...args: any[]) => console.error("[Pre-request]", ...args),
      },
      // Add date/time utilities
      Date: Date,
      // Add crypto utilities for generating random values
      crypto: {
        getRandomValues: (arr: Uint8Array) =>
          window.crypto.getRandomValues(arr),
        randomUUID: () => window.crypto.randomUUID(),
      },
      // Add utility functions
      utils: {
        base64Encode: (str: string) => btoa(str),
        base64Decode: (str: string) => atob(str),
        urlEncode: (str: string) => encodeURIComponent(str),
        urlDecode: (str: string) => decodeURIComponent(str),
      },
    };

    // Execute the script with enhanced sandbox
    const scriptFn = new Function(
      "pm",
      `
      with (pm) {
        ${script}
      }
      return pm.request;
    `,
    );

    const modifiedRequest = scriptFn(sandbox);
    return { ...request, ...modifiedRequest };
  } catch (error) {
    console.error("Error executing pre-request script:", error);
    // Return original request if script fails
    return request;
  }
}

// Enhanced test script execution with better assertion support
function executeTestScript(
  script: string,
  response: ApiResponse,
  environment?: Environment | null,
): any[] {
  if (!script.trim()) return [];

  try {
    const testResults: any[] = [];

    // Create a safe environment for script execution with enhanced capabilities
    const sandbox = {
      response: {
        ...JSON.parse(JSON.stringify(response)),
        json: () =>
          typeof response.data === "object"
            ? response.data
            : JSON.parse(response.data as string),
        text: () =>
          typeof response.data === "string"
            ? response.data
            : JSON.stringify(response.data),
        code: response.status,
        status: response.status,
        headers: response.headers,
      },
      environment: environment
        ? {
            get: (key: string) => {
              const variable = environment.variables.find(
                (v) => v.key === key && v.enabled,
              );
              return variable ? variable.value : null;
            },
            set: (key: string, value: string) => {
              // This would need to be implemented in the store
              console.log(`Setting environment variable ${key} to ${value}`);
            },
          }
        : {},
      tests: {},
      test: (name: string, fn: () => void) => {
        try {
          fn();
          testResults.push({ name, passed: true });
        } catch (error) {
          testResults.push({
            name,
            passed: false,
            message: (error as Error).message,
          });
        }
      },
      expect: (actual: any) => ({
        to: {
          equal: (expected: any) => {
            if (actual !== expected) {
              throw new Error(`Expected ${expected} but got ${actual}`);
            }
          },
          contain: (expected: any) => {
            if (!actual.includes(expected)) {
              throw new Error(`Expected ${actual} to contain ${expected}`);
            }
          },
          match: (regex: RegExp) => {
            if (!regex.test(actual)) {
              throw new Error(`Expected ${actual} to match ${regex}`);
            }
          },
          be: {
            true: () => {
              if (actual !== true) {
                throw new Error(`Expected true but got ${actual}`);
              }
            },
            false: () => {
              if (actual !== false) {
                throw new Error(`Expected false but got ${actual}`);
              }
            },
            null: () => {
              if (actual !== null) {
                throw new Error(`Expected null but got ${actual}`);
              }
            },
            undefined: () => {
              if (actual !== undefined) {
                throw new Error(`Expected undefined but got ${actual}`);
              }
            },
            a: (type: string) => {
              const actualType = Array.isArray(actual)
                ? "array"
                : typeof actual;
              if (actualType !== type) {
                throw new Error(`Expected ${type} but got ${actualType}`);
              }
            },
            greaterThan: (expected: number) => {
              if (!(actual > expected)) {
                throw new Error(
                  `Expected ${actual} to be greater than ${expected}`,
                );
              }
            },
            lessThan: (expected: number) => {
              if (!(actual < expected)) {
                throw new Error(
                  `Expected ${actual} to be less than ${expected}`,
                );
              }
            },
          },
          have: {
            property: (prop: string) => {
              if (
                !actual ||
                !Object.prototype.hasOwnProperty.call(actual, prop)
              ) {
                throw new Error(`Expected object to have property "${prop}"`);
              }
            },
            length: (length: number) => {
              if (!actual || actual.length !== length) {
                throw new Error(
                  `Expected length ${length} but got ${actual?.length}`,
                );
              }
            },
            lengthGreaterThan: (length: number) => {
              if (!actual || actual.length <= length) {
                throw new Error(
                  `Expected length > ${length} but got ${actual?.length}`,
                );
              }
            },
            lengthLessThan: (length: number) => {
              if (!actual || actual.length >= length) {
                throw new Error(
                  `Expected length < ${length} but got ${actual?.length}`,
                );
              }
            },
          },
        },
      }),
      console: {
        log: (...args: any[]) => console.log("[Test]", ...args),
        warn: (...args: any[]) => console.warn("[Test]", ...args),
        error: (...args: any[]) => console.error("[Test]", ...args),
      },
      // Add utility functions
      utils: {
        base64Encode: (str: string) => btoa(str),
        base64Decode: (str: string) => atob(str),
        urlEncode: (str: string) => encodeURIComponent(str),
        urlDecode: (str: string) => decodeURIComponent(str),
        parseJson: (str: string) => JSON.parse(str),
        stringifyJson: (obj: any) => JSON.stringify(obj),
      },
    };

    // Execute the script
    const scriptFn = new Function(
      "pm",
      `
      with (pm) {
        ${script}
      }
      return pm.tests;
    `,
    );

    scriptFn(sandbox);
    return testResults;
  } catch (error) {
    console.error("Error executing test script:", error);
    return [
      {
        name: "Script execution error",
        passed: false,
        message: (error as Error).message,
      },
    ];
  }
}

// Performance tracking and metrics
interface RequestMetrics {
  dnsLookup?: number;
  tcpConnection?: number;
  tlsHandshake?: number;
  firstByte?: number;
  contentDownload?: number;
  total: number;
}

// Main function to send HTTP request with enhanced features
export async function sendRequest(
  request: ApiRequest,
  environment?: Environment | null,
): Promise<{
  response: ApiResponse;
  testResults: any[];
  metrics?: RequestMetrics;
}> {
  const startTime = Date.now();
  const metrics: RequestMetrics = { total: 0 };

  try {
    // Execute pre-request script with environment
    const modifiedRequest = request.preRequestScript
      ? executePreRequestScript(request.preRequestScript, request, environment)
      : request;

    // Prepare request configuration with better error handling
    const config: AxiosRequestConfig = {
      method: modifiedRequest.method,
      url: prepareUrl(modifiedRequest.url, modifiedRequest.params, environment),
      headers: prepareHeaders(modifiedRequest.headers, environment),
      data: prepareBody(modifiedRequest, environment),
      validateStatus: () => true, // Don't throw on any status code
      timeout: 30000, // 30 second timeout
      timeoutErrorMessage: "Request timed out after 30 seconds",
      // Track performance metrics
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.loaded && !metrics.firstByte) {
          metrics.firstByte = Date.now() - startTime;
        }
      },
    };

    // Send the request with performance tracking
    console.log("Sending request:", config);
    const beforeRequest = Date.now();
    const axiosResponse: AxiosResponse = await axios(config);
    const afterRequest = Date.now();

    // Calculate total duration
    const endTime = Date.now();
    const duration = endTime - startTime;
    metrics.total = duration;
    metrics.contentDownload = afterRequest - beforeRequest;

    // Calculate response size more accurately
    let responseSize = 0;

    // Headers size estimation
    responseSize += JSON.stringify(axiosResponse.headers).length;

    // Body size calculation
    if (typeof axiosResponse.data === "string") {
      responseSize += axiosResponse.data.length;
    } else if (axiosResponse.data) {
      responseSize += JSON.stringify(axiosResponse.data).length;
    }

    // Prepare enhanced response object
    const response: ApiResponse = {
      status: axiosResponse.status,
      statusText: axiosResponse.statusText,
      headers: axiosResponse.headers as Record<string, string>,
      data: axiosResponse.data,
      time: duration,
      size: responseSize,
    };

    // Execute test script with environment
    const testResults = modifiedRequest.testScript
      ? executeTestScript(modifiedRequest.testScript, response, environment)
      : [];

    return { response, testResults, metrics };
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    metrics.total = duration;

    // Prepare detailed error response
    const errorResponse: ApiResponse = {
      status: 0,
      statusText: "Error",
      headers: {},
      data: {
        error: (error as Error).message,
        name: (error as Error).name,
        stack: (error as Error).stack,
      },
      time: duration,
      size: 0,
    };

    // If it's an Axios error, try to extract more information
    if (axios.isAxiosError(error) && error.response) {
      return {
        response: {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers as Record<string, string>,
          data: error.response.data,
          time: duration,
          size: JSON.stringify(error.response.data).length,
        },
        testResults: [
          {
            name: "Request failed",
            passed: false,
            message: `${error.message} (${error.response.status} ${error.response.statusText})`,
          },
        ],
        metrics,
      };
    }

    return {
      response: errorResponse,
      testResults: [
        {
          name: "Request failed",
          passed: false,
          message: (error as Error).message,
        },
      ],
      metrics,
    };
  }
}

// Helper function to validate URL before sending
export function validateUrl(url: string): { valid: boolean; message?: string } {
  if (!url.trim()) {
    return { valid: false, message: "URL cannot be empty" };
  }

  try {
    new URL(url);
    return { valid: true };
  } catch (error) {
    return { valid: false, message: "Invalid URL format" };
  }
}

// Helper function to generate curl command from request
export function generateCurlCommand(
  request: ApiRequest,
  environment?: Environment | null,
): string {
  const url = prepareUrl(request.url, request.params, environment);
  const headers = prepareHeaders(request.headers, environment);

  let curl = `curl -X ${request.method} "${url}"`;

  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    curl += ` \\\n  -H "${key}: ${value.replace(/"/g, '\\"')}"`;
  });

  // Add request body if needed
  if (request.body.contentType !== "none") {
    if (request.body.contentType === "json") {
      try {
        const jsonBody =
          typeof request.body.content === "string"
            ? JSON.parse(request.body.content)
            : request.body.content;
        curl += ` \\\n  -d '${JSON.stringify(jsonBody)}'`;
      } catch (error) {
        curl += ` \\\n  -d '${request.body.content}'`;
      }
    } else if (request.body.contentType === "form-data") {
      (request.body.content as KeyValuePair[]).forEach((item) => {
        if (item.enabled && item.key) {
          curl += ` \\\n  -F "${item.key}=${item.value.replace(/"/g, '\\"')}"`;
        }
      });
    } else if (request.body.contentType === "x-www-form-urlencoded") {
      const formData = (request.body.content as KeyValuePair[])
        .filter((item) => item.enabled && item.key)
        .map(
          (item) =>
            `${encodeURIComponent(item.key)}=${encodeURIComponent(item.value)}`,
        )
        .join("&");

      curl += ` \\\n  -d "${formData}"`;
    } else {
      curl += ` \\\n  -d '${request.body.content}'`;
    }
  }

  return curl;
}
