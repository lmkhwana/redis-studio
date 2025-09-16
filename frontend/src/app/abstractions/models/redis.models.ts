/**
 * Redis data models for type safety
 */

export interface RedisKey {
  key: string;
  type: string;
  ttl: number | null;
  daysToExpire?: number | null;
  size: string;
  lastModified?: Date;
}

export interface RedisKeyValue extends RedisKey {
  value: any;
  rawString?: string | null;
}

export interface CreateKeyRequest {
  key: string;
  value: string;
  type: string;
  ttlSeconds?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ConnectionStatus {
  isConnected: boolean;
  connectionString: string;
  statusText: string;
}

export interface ServerInfo {
  version: string;
  used_memory: string;
  connected_clients: string;
}

export interface KeysPage {
  items: RedisKey[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}