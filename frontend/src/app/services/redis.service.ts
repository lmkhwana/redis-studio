import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, BehaviorSubject, of, throwError } from "rxjs";
import { map, catchError, tap } from "rxjs/operators";
import { environment } from "../../environments/environment";
import {
  RedisKey,
  RedisKeyValue,
  CreateKeyRequest,
  ApiResponse,
  ServerInfo,
  ConnectionStatus,
  KeysPage,
} from "../abstractions/models/redis.models";

/**
 * Service for Redis API operations
 * Handles all communication with the backend Redis API
 */
@Injectable({
  providedIn: "root",
})
export class RedisService {
  private readonly baseUrl = environment.apiUrl;
  private readonly connectionIdStorageKey = "redis-studio-connection-id";
  private connectionId: string | null = null;

  // Connection status management
  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>({
    isConnected: false,
    connectionString: "",
    statusText: "Not connected",
  });

  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all Redis keys with metadata
   */
  getKeys(pattern: string = "*"): Observable<RedisKey[]> {
    return this.http
      .get<ApiResponse<any>>(`${this.baseUrl}/redis/keys`, {
        params: { pattern },
        headers: this.buildHeaders(),
      })
      .pipe(
        map((response) => (response.data as any)?.items || []),
        catchError(this.handleError<RedisKey[]>([]))
      );
  }

  /**
   * Get paginated keys (server-side)
   */
  getKeysPage(
    pattern: string = "*",
    page: number = 0,
    pageSize: number = 50
  ): Observable<KeysPage> {
    return this.http
      .get<ApiResponse<any>>(`${this.baseUrl}/redis/keys`, {
        params: { pattern, page, pageSize },
        headers: this.buildHeaders(),
      })
      .pipe(
        map((response) => response.data as any as KeysPage),
        catchError(
          this.handleError<KeysPage>({
            items: [],
            total: 0,
            page: 0,
            pageSize,
            totalPages: 0,
          })
        )
      );
  }

  /**
   * Get specific key with its value
   */
  getKey(key: string): Observable<RedisKeyValue | null> {
    return this.http
      .get<ApiResponse<RedisKeyValue>>(
        `${this.baseUrl}/redis/keys/${encodeURIComponent(key)}`,
        { headers: this.buildHeaders() }
      )
      .pipe(
        map((response) => response.data || null),
        catchError(this.handleError<RedisKeyValue | null>(null))
      );
  }

  /**
   * Create or update a Redis key
   */
  setKey(request: CreateKeyRequest): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${this.baseUrl}/redis/keys`, request, {
        headers: this.buildHeaders(),
      })
      .pipe(
        map((response) => response.success),
        catchError(this.handleError<boolean>(false))
      );
  }

  /**
   * Update existing Redis key
   */
  updateKey(key: string, request: CreateKeyRequest): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(
        `${this.baseUrl}/redis/keys/${encodeURIComponent(key)}`,
        request,
        { headers: this.buildHeaders() }
      )
      .pipe(
        map((response) => response.success),
        catchError(this.handleError<boolean>(false))
      );
  }

  /**
   * Delete a Redis key
   */
  deleteKey(key: string): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(
        `${this.baseUrl}/redis/keys/${encodeURIComponent(key)}`,
        { headers: this.buildHeaders() }
      )
      .pipe(
        map((response) => response.success),
        catchError(this.handleError<boolean>(false))
      );
  }

  /**
   * Test Redis connection
   */
  connect(connectionString: string): Observable<string | null> {
    return this.http
      .post<ApiResponse<any>>(`${this.baseUrl}/redis/connection/connect`, {
        connectionString,
      })
      .pipe(
        map((resp) => {
          if (resp.success && resp.data && (resp.data as any).connectionId) {
            const id = (resp.data as any).connectionId as string;
            this.setConnectionId(id);
            this.updateConnectionStatus(true, "Connected", connectionString);
            return id;
          }
          this.updateConnectionStatus(
            false,
            "Connection failed",
            connectionString
          );
          return null;
        }),
        catchError((err) => {
          this.updateConnectionStatus(false, "Connection error");
          return of(null);
        })
      );
  }

  testExistingConnection(): Observable<boolean> {
    if (!this.connectionId) return of(false);
    return this.http
      .get<boolean>(`${this.baseUrl}/redis/connection/testconnection`, {
        headers: this.buildHeaders(),
      })
      .pipe(
        tap((ok) => {
          if (!ok) this.clearConnection();
        }),
        catchError((_) => {
          this.clearConnection();
          return of(false);
        })
      );
  }

  /**
   * Get Redis server information
   */
  getServerInfo(): Observable<ServerInfo> {
    return this.http
      .get<ApiResponse<ServerInfo>>(`${this.baseUrl}/redis/server/info`, {
        headers: this.buildHeaders(),
      })
      .pipe(
        map((response) => response.data || ({} as ServerInfo)),
        catchError(this.handleError<ServerInfo>({} as ServerInfo))
      );
  }

  /**
   * Update connection status
   */
  updateConnectionStatus(
    isConnected: boolean,
    statusText: string,
    connectionString: string = ""
  ): void {
    this.connectionStatusSubject.next({
      isConnected,
      statusText,
      connectionString,
    });
  }

  initializeFromStorage(): void {
    const stored = localStorage.getItem(this.connectionIdStorageKey);
    if (stored) {
      this.connectionId = stored;
      // attempt silent test
      this.testExistingConnection().subscribe((ok) => {
        if (!ok) {
          this.updateConnectionStatus(false, "Session expired");
        } else {
          this.updateConnectionStatus(true, "Reconnected");
        }
      });
    }
  }

  private setConnectionId(id: string) {
    this.connectionId = id;
    localStorage.setItem(this.connectionIdStorageKey, id);
  }

  private clearConnection() {
    this.connectionId = null;
    localStorage.removeItem(this.connectionIdStorageKey);
  }

  disconnect(): Observable<boolean> {
    if (!this.connectionId) return of(true);
    return this.http
      .delete<ApiResponse<boolean>>(`${this.baseUrl}/redis/connection`, {
        headers: this.buildHeaders(),
      })
      .pipe(
        map((r) => !!r.success),
        tap(() => {
          this.clearConnection();
          this.updateConnectionStatus(false, "Disconnected");
        }),
        catchError((_) => {
          this.clearConnection();
          this.updateConnectionStatus(false, "Disconnected");
          return of(false);
        })
      );
  }

  private buildHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    if (this.connectionId) {
      headers = headers.set("X-Connection-Id", this.connectionId);
    }
    return headers;
  }

  /**
   * Get current connection status
   */
  getCurrentConnectionStatus(): ConnectionStatus {
    return this.connectionStatusSubject.value;
  }

  /**
   * Generic error handler
   */
  private handleError<T>(result?: T) {
    return (error: any): Observable<T> => {
      console.error("Redis service error:", error);
      return of(result as T);
    };
  }
}
