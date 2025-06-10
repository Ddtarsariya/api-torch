// src/store/index.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  ApiRequest,
  ApiResponse,
  Collection,
  Environment,
  Workspace,
  RunResult
} from '../types';

interface AppState {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  activeRequestId: string | null;
  activeResponse: ApiResponse | null;
  theme: 'light' | 'dark';
  runResults: RunResult[];
  isRunning: boolean;
  
  // Workspace actions
  getActiveWorkspace: () => Workspace;
  createWorkspace: (name: string) => void;
  updateWorkspace: (id: string, data: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  setActiveWorkspace: (id: string) => void;
  
  // Collection actions
  getCollections: () => Collection[];
  createCollection: (name: string, description?: string) => void;
  updateCollection: (id: string, data: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
  
  // Request actions
  getRequests: () => ApiRequest[];
  createRequest: (collectionId: string, request: Partial<ApiRequest>) => string;
  updateRequest: (id: string, data: Partial<ApiRequest>) => void;
  deleteRequest: (id: string) => void;
  setActiveRequest: (id: string) => void;
  
  // Environment actions
  getEnvironments: () => Environment[];
  createEnvironment: (name: string) => void;
  updateEnvironment: (id: string, data: Partial<Environment>) => void;
  deleteEnvironment: (id: string) => void;
  setActiveEnvironment: (id: string | null) => void;
  
  // Response actions
  setActiveResponse: (response: ApiResponse | null) => void;
  
  // Theme actions
  toggleTheme: () => void;
  
  // Runner actions
  setRunResults: (results: RunResult[]) => void;
  addRunResult: (result: RunResult) => void;
  clearRunResults: () => void;
  setIsRunning: (isRunning: boolean) => void;
}

// Create default workspace
const createDefaultWorkspace = (): Workspace => ({
  id: uuidv4(),
  name: 'My Workspace',
  collections: [],
  environments: [],
  activeEnvironmentId: null,
});

// Create sample data for first-time users
const createSampleData = (): Workspace => {
  const workspaceId = uuidv4();
  const collectionId = uuidv4();
  const requestId = uuidv4();
  const environmentId = uuidv4();
  
  return {
    id: workspaceId,
    name: 'My Workspace',
    collections: [
      {
        id: collectionId,
        name: 'Sample Collection',
        description: 'A collection of sample API requests',
        items: [
          {
            id: requestId,
            name: 'Get Users',
            method: 'GET',
            url: 'https://jsonplaceholder.typicode.com/users',
            headers: [
              { id: uuidv4(), key: 'Accept', value: 'application/json', enabled: true }
            ],
            params: [],
            body: {
              contentType: 'none',
              content: ''
            },
            preRequestScript: '// Add pre-request script here\nconsole.log("Running pre-request script");',
            testScript: '// Add test script here\npm.test("Status code is 200", function() {\n  pm.expect(pm.response.code).to.equal(200);\n});'
          }
        ]
      }
    ],
    environments: [
      {
        id: environmentId,
        name: 'Development',
        variables: [
          { id: uuidv4(), key: 'base_url', value: 'https://api.example.com', enabled: true },
          { id: uuidv4(), key: 'api_key', value: 'your-api-key', enabled: true }
        ]
      }
    ],
    activeEnvironmentId: environmentId
  };
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      workspaces: [createSampleData()],
      activeWorkspaceId: createSampleData().id,
      activeRequestId: null,
      activeResponse: null,
      theme: 'light',
      runResults: [],
      isRunning: false,
      
      // Workspace actions
      getActiveWorkspace: () => {
        const { workspaces, activeWorkspaceId } = get();
        return workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];
      },
      
      createWorkspace: (name: string) => {
        const newWorkspace: Workspace = {
          id: uuidv4(),
          name,
          collections: [],
          environments: [],
          activeEnvironmentId: null,
        };
        
        set(state => ({
          workspaces: [...state.workspaces, newWorkspace],
          activeWorkspaceId: newWorkspace.id,
        }));
      },
      
      updateWorkspace: (id: string, data: Partial<Workspace>) => {
        set(state => ({
          workspaces: state.workspaces.map(workspace => 
            workspace.id === id ? { ...workspace, ...data } : workspace
          ),
        }));
      },
      
      deleteWorkspace: (id: string) => {
        set(state => {
          const newWorkspaces = state.workspaces.filter(w => w.id !== id);
          return {
            workspaces: newWorkspaces,
            activeWorkspaceId: newWorkspaces.length > 0 ? newWorkspaces[0].id : uuidv4(),
          };
        });
      },
      
      setActiveWorkspace: (id: string) => {
        set({ activeWorkspaceId: id });
      },
      
      // Collection actions
      getCollections: () => {
        return get().getActiveWorkspace().collections;
      },
      
      createCollection: (name: string, description?: string) => {
        const newCollection: Collection = {
          id: uuidv4(),
          name,
          description,
          items: [],
        };
        
        set(state => {
          const workspace = state.getActiveWorkspace();
          return {
            workspaces: state.workspaces.map(w => 
              w.id === workspace.id 
                ? { ...w, collections: [...w.collections, newCollection] } 
                : w
            ),
          };
        });
      },
      
      updateCollection: (id: string, data: Partial<Collection>) => {
        set(state => {
          const workspace = state.getActiveWorkspace();
          return {
            workspaces: state.workspaces.map(w => 
              w.id === workspace.id 
                ? { 
                    ...w, 
                    collections: w.collections.map(collection => 
                      collection.id === id ? { ...collection, ...data } : collection
                    ) 
                  } 
                : w
            ),
          };
        });
      },
      
      deleteCollection: (id: string) => {
        set(state => {
          const workspace = state.getActiveWorkspace();
          return {
            workspaces: state.workspaces.map(w => 
              w.id === workspace.id 
                ? { ...w, collections: w.collections.filter(c => c.id !== id) } 
                : w
            ),
          };
        });
      },
      
      // Request actions
      getRequests: () => {
        const collections = get().getCollections();
        const requests: ApiRequest[] = [];
        
        const extractRequests = (items: (Collection | ApiRequest)[]) => {
          items.forEach(item => {
            if ('method' in item) {
              requests.push(item as ApiRequest);
            } else {
              extractRequests((item as Collection).items);
            }
          });
        };
        
        collections.forEach(collection => {
          extractRequests(collection.items);
        });
        
        return requests;
      },
      
      createRequest: (collectionId: string, requestData: Partial<ApiRequest>) => {
        const newRequest: ApiRequest = {
          id: uuidv4(),
          name: requestData.name || 'New Request',
          method: requestData.method || 'GET',
          url: requestData.url || '',
          headers: requestData.headers || [],
          params: requestData.params || [],
          body: requestData.body || {
            contentType: 'none',
            content: ''
          },
          preRequestScript: requestData.preRequestScript || '',
          testScript: requestData.testScript || '',
        };
        
        set(state => {
          const workspace = state.getActiveWorkspace();
          
          const updateCollectionItems = (collections: Collection[]): Collection[] => {
            return collections.map(collection => {
              if (collection.id === collectionId) {
                return {
                  ...collection,
                  items: [...collection.items, newRequest]
                };
              }
              
              if ('items' in collection) {
                return {
                  ...collection,
                  items: updateCollectionItems(collection.items.filter(item => 'items' in item) as Collection[])
                };
              }
              
              return collection;
            });
          };
          
          return {
            workspaces: state.workspaces.map(w => 
              w.id === workspace.id 
                ? { ...w, collections: updateCollectionItems(w.collections) } 
                : w
            ),
            activeRequestId: newRequest.id,
          };
        });
        
        return newRequest.id;
      },
      
      updateRequest: (id: string, data: Partial<ApiRequest>) => {
        set(state => {
          const workspace = state.getActiveWorkspace();
          
          const updateRequestInItems = (items: (Collection | ApiRequest)[]): (Collection | ApiRequest)[] => {
            return items.map(item => {
              if ('method' in item && item.id === id) {
                return { ...item, ...data };
              }
              
              if ('items' in item) {
                return {
                  ...item,
                  items: updateRequestInItems(item.items)
                };
              }
              
              return item;
            });
          };
          
          return {
            workspaces: state.workspaces.map(w => 
              w.id === workspace.id 
                ? { 
                    ...w, 
                    collections: w.collections.map(collection => ({
                      ...collection,
                      items: updateRequestInItems(collection.items)
                    }))
                  } 
                : w
            ),
          };
        });
      },
      
      deleteRequest: (id: string) => {
        set(state => {
          const workspace = state.getActiveWorkspace();
          
          const removeRequestFromItems = (items: (Collection | ApiRequest)[]): (Collection | ApiRequest)[] => {
            return items
              .filter(item => !('method' in item) || item.id !== id)
              .map(item => {
                if ('items' in item) {
                  return {
                    ...item,
                    items: removeRequestFromItems(item.items)
                  };
                }
                return item;
              });
          };
          
          return {
            workspaces: state.workspaces.map(w => 
              w.id === workspace.id 
                ? { 
                    ...w, 
                    collections: w.collections.map(collection => ({
                      ...collection,
                      items: removeRequestFromItems(collection.items)
                    }))
                  } 
                : w
            ),
            activeRequestId: state.activeRequestId === id ? null : state.activeRequestId,
          };
        });
      },
      
      setActiveRequest: (id: string) => {
        set({ activeRequestId: id });
      }, // Environment actions
      getEnvironments: () => {
        return get().getActiveWorkspace().environments;
      },
      
      createEnvironment: (name: string) => {
        const newEnvironment: Environment = {
          id: uuidv4(),
          name,
          variables: [],
        };
        
        set(state => {
          const workspace = state.getActiveWorkspace();
          return {
            workspaces: state.workspaces.map(w => 
              w.id === workspace.id 
                ? { ...w, environments: [...w.environments, newEnvironment] } 
                : w
            ),
          };
        });
      },
      
      updateEnvironment: (id: string, data: Partial<Environment>) => {
        set(state => {
          const workspace = state.getActiveWorkspace();
          return {
            workspaces: state.workspaces.map(w => 
              w.id === workspace.id 
                ? { 
                    ...w, 
                    environments: w.environments.map(env => 
                      env.id === id ? { ...env, ...data } : env
                    ) 
                  } 
                : w
            ),
          };
        });
      },
      
      deleteEnvironment: (id: string) => {
        set(state => {
          const workspace = state.getActiveWorkspace();
          return {
            workspaces: state.workspaces.map(w => 
              w.id === workspace.id 
                ? { 
                    ...w, 
                    environments: w.environments.filter(e => e.id !== id),
                    activeEnvironmentId: w.activeEnvironmentId === id ? null : w.activeEnvironmentId
                  } 
                : w
            ),
          };
        });
      },
      
      setActiveEnvironment: (id: string | null) => {
        set(state => {
          const workspace = state.getActiveWorkspace();
          return {
            workspaces: state.workspaces.map(w => 
              w.id === workspace.id 
                ? { ...w, activeEnvironmentId: id } 
                : w
            ),
          };
        });
      },
      
      // Response actions
      setActiveResponse: (response: ApiResponse | null) => {
        set({ activeResponse: response });
      },
      
      // Theme actions
      toggleTheme: () => {
        set(state => ({ theme: state.theme === 'light' ? 'dark' : 'light' }));
      },
      
      // Runner actions
      setRunResults: (results: RunResult[]) => {
        set({ runResults: results });
      },
      
      addRunResult: (result: RunResult) => {
        set(state => ({ runResults: [...state.runResults, result] }));
      },
      
      clearRunResults: () => {
        set({ runResults: [] });
      },
      
      setIsRunning: (isRunning: boolean) => {
        set({ isRunning });
      },
    }),
    {
      name: 'api-torch-storage',
    }
  )
);
