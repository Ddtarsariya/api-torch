// File: src\lib\import-export.ts

import type {
  Collection,
  Environment,
  KeyValuePair,
  ApiRequest,
  RequestBody,
} from "../types";
import { v4 as uuidv4 } from "uuid";

function reconstructUrl(protocol: string, host: string[], path: string[]): string {
  return `${protocol}://${host.join('.')}/${path.join('/')}`;
}

// Postman Collection Format (simplified)
interface PostmanCollection {
  info: {
    name: string;
    description?: string;
    _postman_id?: string;
    schema: string;
  };
  item: PostmanItem[];
  variable?: PostmanVariable[];
}

interface PostmanItem {
  name: string;
  request?: PostmanRequest;
  item?: PostmanItem[];
}

interface PostmanRequest {
  method: string;
  url: {
    raw: string;
    protocol?: string;
    host?: string[];
    path?: string[];
    query?: { key: string; value: string; disabled?: boolean }[];
  };
  header?: { key: string; value: string; disabled?: boolean }[];
  body?: {
    mode: string;
    raw?: string;
    formdata?: { key: string; value: string; disabled?: boolean }[];
    urlencoded?: { key: string; value: string; disabled?: boolean }[];
  };
}

interface PostmanVariable {
  key: string;
  value: string;
  enabled?: boolean;
}

// Helper function to parse URL into components
function parseUrl(url: string) {
  try {
    const urlObj = new URL(url);
    return {
      protocol: urlObj.protocol.replace(':', ''),
      host: urlObj.hostname.split('.'),
      path: urlObj.pathname.split('/').filter(Boolean),
    };
  } catch {
    return {
      protocol: '',
      host: [],
      path: [],
    };
  }
}

// Export collection to JSON
export function exportCollection(collection: Collection): string {
  const postmanCollection: PostmanCollection = {
    info: {
      name: collection.name,
      description: collection.description,
      _postman_id: collection.id,
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    item: convertItemsToPostmanFormat(collection.items),
  };

  return JSON.stringify(postmanCollection, null, 2);
}
// Import collection from JSON
export function importCollection(json: string): Collection {
  try {
    const postmanCollection = JSON.parse(json) as PostmanCollection;

    return {
      id: postmanCollection.info._postman_id || uuidv4(),
      name: postmanCollection.info.name,
      description: postmanCollection.info.description,
      items: convertPostmanItemsToOurFormat(postmanCollection.item),
    };
  } catch (error) {
    console.error("Error importing collection:", error);
    throw new Error("Invalid collection format");
  }
}


function convertItemsToPostmanFormat(items: (Collection | ApiRequest)[]): PostmanItem[] {
  return items.map((item) => {
    if ("method" in item) {
      const request = item as ApiRequest;
      const queryParams = request.params.map((p) => ({
        key: p.key,
        value: p.value,
        disabled: !p.enabled,
      }));

      const urlComponents = parseUrl(request.url);

      let body;
      if (request.method !== "GET" && request.body.contentType !== "none") {
        if (request.body.contentType === "json" || request.body.contentType === "raw") {
          body = {
            mode: "raw",
            raw: request.body.content as string,
          };
        } else if (request.body.contentType === "form-data" || request.body.contentType === "x-www-form-urlencoded") {
          const formItems = (request.body.content as KeyValuePair[]).map((item) => ({
            key: item.key,
            value: item.value,
            disabled: !item.enabled,
          }));

          body = {
            mode: request.body.contentType === "form-data" ? "formdata" : "urlencoded",
            [request.body.contentType === "form-data" ? "formdata" : "urlencoded"]: formItems,
          };
        }
      }

      return {
        name: request.name,
        request: {
          method: request.method,
          url: {
            raw: request.url,
            protocol: urlComponents.protocol,
            host: urlComponents.host,
            path: urlComponents.path,
            query: queryParams.length > 0 ? queryParams : undefined,
          },
          header: request.headers.map((h) => ({
            key: h.key,
            value: h.value,
            disabled: !h.enabled,
          })),
          body,
        },
      };
    } else {
      const folder = item as Collection;
      return {
        name: folder.name,
        item: convertItemsToPostmanFormat(folder.items),
      };
    }
  });
}

function convertPostmanItemsToOurFormat(items: PostmanItem[]): (Collection | ApiRequest)[] {
  return items.flatMap((item) => {
    if (item.item) {
      return {
        id: uuidv4(),
        name: item.name,
        items: convertPostmanItemsToOurFormat(item.item),
      } as Collection;
    } else if (item.request) {
      const request = item.request;
      const params: KeyValuePair[] = (request.url.query || []).map((q) => ({
        id: uuidv4(),
        key: q.key,
        value: q.value,
        enabled: !q.disabled,
      }));

      const url = reconstructUrl(request.url.protocol || '', request.url.host || [], request.url.path || []);

      let body: RequestBody = { contentType: "none", content: "" };
      if (request.body) {
        if (request.body.mode === "raw") {
          body = {
            contentType: "raw",
            content: request.body.raw || "",
          };
        } else if (request.body.mode === "formdata") {
          body = {
            contentType: "form-data",
            content: (request.body.formdata || []).map((item) => ({
              id: uuidv4(),
              key: item.key,
              value: item.value,
              enabled: !item.disabled,
            })),
          };
        } else if (request.body.mode === "urlencoded") {
          body = {
            contentType: "x-www-form-urlencoded",
            content: (request.body.urlencoded || []).map((item) => ({
              id: uuidv4(),
              key: item.key,
              value: item.value,
              enabled: !item.disabled,
            })),
          };
        }
      }

      return {
        id: uuidv4(),
        name: item.name,
        method: request.method as any,
        url,
        headers: (request.header || []).map((h) => ({
          id: uuidv4(),
          key: h.key,
          value: h.value,
          enabled: h.disabled !== undefined ? !h.disabled : true,
        })),
        params,
        body,
        preRequestScript: "",
        testScript: "",
      } as ApiRequest;
    }

    return [];
  });
}

// Import OpenAPI JSON
// File: src\lib\import-export.ts

// Import OpenAPI JSON
export function importOpenAPI(json: string): { 
  id: string;
  name: string;
  description?: string;
  items: (Collection | ApiRequest)[];
  environment?: Environment;
} {
  try {
    const openApiData = JSON.parse(json);
    const openApiVersion = openApiData.openapi || openApiData.swagger || "3.0.0";

    const collection: Collection = {
      id: uuidv4(),
      name: openApiData.info.title || "OpenAPI Collection",
      description: openApiData.info.description || "",
      items: [],
    };

    // Determine base URL based on OpenAPI version
    let baseUrl = "";
    if (openApiData.servers && openApiData.servers.length > 0) {
      // OpenAPI 3.x has servers array
      baseUrl = openApiData.servers[0].url;
    } else if (openApiData.host) {
      // OpenAPI 2.0 (Swagger) has host and basePath
      const scheme = openApiData.schemes && openApiData.schemes.length > 0 
        ? openApiData.schemes[0] 
        : "https";
      baseUrl = `${scheme}://${openApiData.host}${openApiData.basePath || ""}`;
    }

    // Convert OpenAPI paths to ApiRequest items
    for (const path in openApiData.paths) {
      const pathItem = openApiData.paths[path];
      
      // Skip if pathItem is a reference
      if (pathItem.$ref) continue;

      // Process HTTP methods (operations)
      const methods = ["get", "post", "put", "delete", "patch", "options", "head"];
      for (const method of methods) {
        if (pathItem[method]) {
          const operation = pathItem[method];
          
          // Create ApiRequest for this operation
          const apiRequest: ApiRequest = {
            id: uuidv4(),
            name: operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`,
            method: method.toUpperCase() as any,
            // Use {{baseUrl}} variable instead of hardcoded base URL
            url: `{{baseUrl}}${path}`,
            headers: [],
            params: [],
            body: { contentType: "none", content: "" },
            preRequestScript: "",
            testScript: "",
          };

          // Add parameters as query params or headers
          if (operation.parameters) {
            operation.parameters.forEach((param: any) => {
              if (param.in === "query") {
                apiRequest.params.push({
                  id: uuidv4(),
                  key: param.name,
                  value: param.example || "",
                  enabled: !param.deprecated,
                });
              } else if (param.in === "header") {
                apiRequest.headers.push({
                  id: uuidv4(),
                  key: param.name,
                  value: param.example || "",
                  enabled: !param.deprecated,
                });
              }
            });
          }

          // Add path parameters from the path item
          if (pathItem.parameters) {
            pathItem.parameters.forEach((param: any) => {
              if (param.in === "query") {
                apiRequest.params.push({
                  id: uuidv4(),
                  key: param.name,
                  value: param.example || "",
                  enabled: !param.deprecated,
                });
              } else if (param.in === "header") {
                apiRequest.headers.push({
                  id: uuidv4(),
                  key: param.name,
                  value: param.example || "",
                  enabled: !param.deprecated,
                });
              }
            });
          }

          // Handle request body
          if (operation.requestBody) {
            const contentType = Object.keys(operation.requestBody.content || {})[0];
            if (contentType) {
              if (contentType === "application/json") {
                apiRequest.body = {
                  contentType: "json",
                  content: JSON.stringify(
                    operation.requestBody.content[contentType].example || 
                    generateExampleFromSchema(operation.requestBody.content[contentType].schema) || 
                    {},
                    null,
                    2
                  ),
                };
              } else if (contentType === "multipart/form-data") {
                apiRequest.body = {
                  contentType: "form-data",
                  content: [],
                };
              } else if (contentType === "application/x-www-form-urlencoded") {
                apiRequest.body = {
                  contentType: "x-www-form-urlencoded",
                  content: [],
                };
              } else {
                apiRequest.body = {
                  contentType: "raw",
                  content: "",
                };
              }
            }
          }

          // Add security headers if defined
          if (openApiData.components && openApiData.components.securitySchemes) {
            // Handle operation-specific security requirements
            if (operation.security && operation.security.length > 0) {
              addSecurityHeaders(apiRequest, operation.security, openApiData.components.securitySchemes);
            } 
            // Handle global security requirements
            else if (openApiData.security && openApiData.security.length > 0) {
              addSecurityHeaders(apiRequest, openApiData.security, openApiData.components.securitySchemes);
            }
          }

          // Add request to collection items
          collection.items.push(apiRequest);
        }
      }
    }

    // Create an environment with the baseUrl variable
    const environment: Environment = {
      id: uuidv4(),
      name: `${openApiData.info.title || "OpenAPI"} Environment`,
      variables: [
        {
          id: uuidv4(),
          key: "baseUrl",
          value: baseUrl,
          enabled: true,
        }
      ],
    };

    // Return both the collection and the environment
    return {
      ...collection,
      environment, // Add the environment to the return value
    };
  } catch (error) {
    console.error("Error importing OpenAPI:", error);
    throw new Error("Invalid OpenAPI format");
  }
}

// Helper function to add security headers
function addSecurityHeaders(
  apiRequest: ApiRequest,
  securityRequirements: any[],
  securitySchemes: any
) {
  for (const requirement of securityRequirements) {
    for (const schemeName in requirement) {
      const scheme = securitySchemes[schemeName];

      if (scheme.type === "http" && scheme.scheme === "bearer") {
        apiRequest.headers.push({
          id: uuidv4(),
          key: "Authorization",
          value: "Bearer <token>",
          enabled: true,
        });
      } else if (scheme.type === "apiKey" && scheme.in === "header") {
        apiRequest.headers.push({
          id: uuidv4(),
          key: scheme.name,
          value: "<api-key>",
          enabled: true,
        });
      } else if (scheme.type === "oauth2") {
        apiRequest.headers.push({
          id: uuidv4(),
          key: "Authorization",
          value: "Bearer <oauth-token>",
          enabled: true,
        });
      }
    }
  }
}

// Helper function to generate example data from schema
function generateExampleFromSchema(schema: any): any {
  if (!schema) return {};

  // Handle $ref
  if (schema.$ref) {
    // In a real implementation, you would resolve the reference
    return {};
  }

  // Handle different types
  switch (schema.type) {
    case "object":
      const result: any = {};
      if (schema.properties) {
        for (const propName in schema.properties) {
          result[propName] = generateExampleFromSchema(schema.properties[propName]);
        }
      }
      return result;

    case "array":
      return [generateExampleFromSchema(schema.items)];

    case "string":
      return schema.example || schema.default || "string";

    case "number":
    case "integer":
      return schema.example || schema.default || 0;

    case "boolean":
      return schema.example || schema.default || false;

    default:
      return {};
  }
}

// Export environment to JSON
export function exportEnvironment(environment: Environment): string {
  // Create Postman environment format
  const postmanEnvironment = {
    id: environment.id,
    name: environment.name,
    values: environment.variables.map((v) => ({
      key: v.key,
      value: v.value,
      type: "default",
      enabled: v.enabled,
    })),
    _postman_variable_scope: "environment",
    _postman_exported_at: new Date().toISOString(),
    _postman_exported_using: "API-Torch",
  };

  return JSON.stringify(postmanEnvironment, null, 2);
}
// Import environment from JSON
export function importEnvironment(json: string): Environment {
  try {
    const data = JSON.parse(json);

    // Create environment object
    const environment: Environment = {
      id: data.id || uuidv4(),
      name: data.name || "Imported Environment",
      variables: [],
    };

    // Process variables
    if (data.values && Array.isArray(data.values)) {
      environment.variables = data.values.map((v: any) => ({
        id: uuidv4(),
        key: v.key || "",
        value: v.value || "",
        enabled: v.enabled !== undefined ? v.enabled : true,
      }));
    }

    return environment;
  } catch (error) {
    console.error("Error importing environment:", error);
    throw new Error("Invalid environment format");
  }
}