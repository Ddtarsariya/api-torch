// src/lib/import-export.ts
import type { Collection, Environment, KeyValuePair, ApiRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Postman Collection Format (simplified)
interface PostmanCollection {
  info: {
    name: string;
    description?: string;
    _postman_id?: string;
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

// Export collection to JSON
export function exportCollection(collection: Collection): string {
  const postmanCollection: PostmanCollection = {
    info: {
      name: collection.name,
      description: collection.description,
      _postman_id: collection.id,
    },
    item: convertItemsToPostmanFormat(collection.items),
  };
  
  return JSON.stringify(postmanCollection, null, 2);
}

// Convert our items to Postman format
function convertItemsToPostmanFormat(items: (Collection | ApiRequest)[]): PostmanItem[] {
  return items.map(item => {
    if ('method' in item) {
      // It's a request
      const request = item as ApiRequest;
      
      // Parse URL to extract query params
      let url = request.url;
      const queryParams = request.params.filter(p => p.enabled).map(p => ({
        key: p.key,
        value: p.value,
        disabled: !p.enabled,
      }));
      
      // Convert body based on content type
      let body;
      if (request.body.contentType !== 'none') {
        if (request.body.contentType === 'json' || request.body.contentType === 'raw') {
          body = {
            mode: request.body.contentType === 'json' ? 'raw' : request.body.contentType,
            raw: request.body.content as string,
          };
        } else if (request.body.contentType === 'form-data' || request.body.contentType === 'x-www-form-urlencoded') {
          const formItems = (request.body.content as KeyValuePair[]).map(item => ({
            key: item.key,
            value: item.value,
            disabled: !item.enabled,
          }));
          
          body = {
            mode: request.body.contentType === 'form-data' ? 'formdata' : 'urlencoded',
            [request.body.contentType === 'form-data' ? 'formdata' : 'urlencoded']: formItems,
          };
        }
      }
      
      return {
        name: request.name,
        request: {
          method: request.method,
          url: {
            raw: url,
            query: queryParams.length > 0 ? queryParams : undefined,
          },
          header: request.headers.map(h => ({
            key: h.key,
            value: h.value,
            disabled: !h.enabled,
          })),
          body,
        },
      };
    } else {
      // It's a folder/collection
      const folder = item as Collection;
      return {
        name: folder.name,
        item: convertItemsToPostmanFormat(folder.items),
      };
    }
  });
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
    console.error('Error importing collection:', error);
    throw new Error('Invalid collection format');
  }
}

// Convert Postman items to our format
function convertPostmanItemsToOurFormat(items: PostmanItem[]): (Collection | ApiRequest)[] {
  return items.map(item => {
    if (item.item) {
      // It's a folder
      return {
        id: uuidv4(),
        name: item.name,
        items: convertPostmanItemsToOurFormat(item.item),
      } as Collection;
    } else if (item.request) {
      // It's a request
      const request = item.request;
      
      // Extract query params from URL
      const params: KeyValuePair[] = (request.url.query || []).map(q => ({
        id: uuidv4(),
        key: q.key,
        value: q.value,
        enabled: !q.disabled,
      }));
      
      // Convert body based on mode
      let body = { contentType: 'none' as const, content: '' };
      if (request.body) {
        if (request.body.mode === 'raw') {
          body = {
            contentType: 'raw' as const,
            content: request.body.raw || '',
          };
        } else if (request.body.mode === 'formdata') {
          body = {
            contentType: 'form-data' as const,
            content: (request.body.formdata || []).map(item => ({
              id: uuidv4(),
              key: item.key,
              value: item.value,
              enabled: !item.disabled,
            })),
          };
        } else if (request.body.mode === 'urlencoded') {
          body = {
            contentType: 'x-www-form-urlencoded' as const,
            content: (request.body.urlencoded || []).map(item => ({
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
        url: request.url.raw,
        headers: (request.header || []).map(h => ({
          id: uuidv4(),
          key: h.key,
          value: h.value,
          enabled: !h.disabled,
        })),
        params,
        body,
        preRequestScript: '',
        testScript: '',
      } as ApiRequest;
    }
    
    // Fallback for invalid items
    return {
      id: uuidv4(),
      name: item.name,
      method: 'GET',
      url: '',
      headers: [],
      params: [],
      body: { contentType: 'none', content: '' },
      preRequestScript: '',
      testScript: '',
    } as ApiRequest;
  });
}

// Export environment to JSON
export function exportEnvironment(environment: Environment): string {
  return JSON.stringify({
    id: environment.id,
    name: environment.name,
    values: environment.variables.map(v => ({
      key: v.key,
      value: v.value,
      enabled: v.enabled,
    })),
  }, null, 2);
}

// Import environment from JSON
export function importEnvironment(json: string): Environment {
  try {
    const data = JSON.parse(json);
    
    return {
      id: data.id || uuidv4(),
      name: data.name,
      variables: (data.values || []).map((v: any) => ({
        id: uuidv4(),
        key: v.key,
        value: v.value,
        enabled: v.enabled !== undefined ? v.enabled : true,
      })),
    };
  } catch (error) {
    console.error('Error importing environment:', error);
    throw new Error('Invalid environment format');
  }
}
