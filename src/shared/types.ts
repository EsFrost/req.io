export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type AuthType = 'none' | 'basic' | 'bearer' | 'api-key' | 'oauth2';

export interface KeyValue {
  key: string;
  value: string;
  enabled: boolean;
}

export interface Auth {
  type: AuthType;
  basic?: {
    username: string;
    password: string;
  };
  bearer?: {
    token: string;
  };
  apiKey?: {
    key: string;
    value: string;
    addTo: 'header' | 'query';
  };
}

export type BodyType = 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary';

export interface RequestBody {
  type: BodyType;
  raw?: string;
  json?: any;
  formData?: KeyValue[];
  binary?: string;
}

export interface Request {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: KeyValue[];
  body?: RequestBody;
  auth?: Auth;
  queryParams: KeyValue[];
  folderId?: string;
  projectId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface FetchResponse {
  success: boolean;
  data?: string;
  error?: string;
  statusCode?: number;
}

export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  size: number;
  timestamp: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  projectId: string;
  requests: Request[];
  subfolders: Folder[];
  createdAt: number;
  updatedAt: number;
}

export interface Collection {
  id: string;
  name: string;
  folders: Folder[];
  requests: Request[];
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  baseUrl?: string;
  variables: KeyValue[];
  folders: Folder[];
  requests: Request[];
  createdAt: number;
  updatedAt: number;
}

export interface Environment {
  id: string;
  name: string;
  variables: KeyValue[];
  isActive: boolean;
}

export interface HistoryEntry {
  id: string;
  request: Request;
  response: HttpResponse;
  timestamp: number;
}

export interface IpcChannels {
  'request:send': {
    args: [Request];
    return: HttpResponse;
  };
  'collection:save': {
    args: [Collection];
    return: void;
  };
  'collection:load': {
    args: [];
    return: Collection[];
  };
  'collection:delete': {
    args: [string];
    return: void;
  };
  'project:save': {
    args: [Project];
    return: void;
  };
  'project:load': {
    args: [];
    return: Project[];
  };
  'project:delete': {
    args: [string];
    return: void;
  };
  'project:export': {
    args: [Project];
    return: void;
  };
  'project:import': {
    args: [];
    return: Project | null;
  };
  'environment:save': {
    args: [Environment];
    return: void;
  };
  'environment:load': {
    args: [];
    return: Environment[];
  };
  'environment:delete': {
    args: [string];
    return: void;
  };
  'environment:setActive': {
    args: [string];
    return: void;
  };
  'history:get': {
    args: [number?];
    return: HistoryEntry[];
  };
  'history:clear': {
    args: [];
    return: void;
  };
  'request:export': {
    args: [Request];
    return: void;
  };
  'request:import': {
    args: [];
    return: Request | null;
  };
  'fetch-url': {
    args: [string];
    return: FetchResponse;
  };
}