namespace RedisStudio.Api.Models
{
    /// <summary>
    /// Represents a Redis key with its metadata
    /// </summary>
    public class RedisKeyInfo
    {
        /// <summary>
        /// The raw Redis key name.
        /// </summary>
        public string Key { get; set; } = string.Empty;
        /// <summary>
        /// The Redis data type (string, hash, list, set, zset, etc.).
        /// </summary>
        public string Type { get; set; } = string.Empty;
        /// <summary>
        /// Remaining time to live in seconds; null when the key has no expiration.
        /// </summary>
        public long? Ttl { get; set; }
    /// <summary>
    /// Remaining time to live expressed in whole days (rounded up) for convenience; null when no expiration.
    /// </summary>
    public int? DaysToExpire { get; set; }
        /// <summary>
        /// Human readable size or cardinality representation (e.g. "24 B", "3 fields").
        /// </summary>
        public string Size { get; set; } = string.Empty;
        /// <summary>
        /// Last modified timestamp (UTC) if tracked; may be null when unknown.
        /// </summary>
        public DateTime? LastModified { get; set; }
    }

    /// <summary>
    /// Represents a Redis key with its value
    /// </summary>
    public class RedisKeyValue : RedisKeyInfo
    {
        /// <summary>
        /// The materialized value of the key. Complex types (hash, list, set) are mapped to CLR structures.
        /// </summary>
        public object? Value { get; set; }
    /// <summary>
    /// Convenience duplicate of Value for raw string access when needed (null for non-string types).
    /// </summary>
    public string? RawString { get; set; }
    }

    /// <summary>
    /// Request model for creating/updating Redis keys
    /// </summary>
    public class CreateKeyRequest
    {
        /// <summary>
        /// Key name to create or update.
        /// </summary>
        public string Key { get; set; } = string.Empty;
        /// <summary>
        /// Raw value payload. For hash types this should be JSON representing a dictionary.
        /// </summary>
        public string Value { get; set; } = string.Empty;
        /// <summary>
        /// Desired Redis data type (currently supports string, hash, list, set).
        /// </summary>
        public string Type { get; set; } = "string";
        /// <summary>
        /// Optional TTL in seconds. Null indicates no expiration.
        /// </summary>
        public long? TtlSeconds { get; set; }
    }

    /// <summary>
    /// Response model for API operations
    /// </summary>
    public class ApiResponse<T>
    {
        /// <summary>
        /// Indicates if the request succeeded.
        /// </summary>
        public bool Success { get; set; }
        /// <summary>
        /// Human readable message describing the outcome.
        /// </summary>
        public string Message { get; set; } = string.Empty;
        /// <summary>
        /// Optional payload returned by the API when successful (or containing error context).
        /// </summary>
        public T? Data { get; set; }
    }
}