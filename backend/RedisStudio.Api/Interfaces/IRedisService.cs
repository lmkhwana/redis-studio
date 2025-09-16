using RedisStudio.Api.Models;

namespace RedisStudio.Api.Interfaces
{
    public interface IRedisService
    {
        /// <summary>
        /// Retrieves a single page of keys (metadata only) matching a pattern.
        /// </summary>
        /// <param name="pattern">Search glob pattern (e.g. user:*, defaults to *).</param>
        /// <param name="page">Zero‑based page index.</param>
        /// <param name="pageSize">Number of keys to return in the page.</param>
        /// <returns>Enumerable of <see cref="RedisKeyInfo"/> for the requested page.</returns>
        Task<IEnumerable<RedisKeyInfo>> GetKeysAsync(string pattern = "*", int page = 0, int pageSize = 10);

        /// <summary>
        /// Retrieves a page of keys plus the total number of matching keys for UI pagination.
        /// </summary>
        /// <param name="pattern">Search glob pattern (e.g. session:*).</param>
        /// <param name="page">Zero‑based page index.</param>
        /// <param name="pageSize">Number of keys to return in the page.</param>
        /// <returns>Tuple containing Items and Total count.</returns>
        Task<(IEnumerable<RedisKeyInfo> Items, long Total)> GetKeysPageAsync(string pattern = "*", int page = 0, int pageSize = 10);

        /// <summary>
        /// Gets full metadata and value for a specific key.
        /// </summary>
        /// <param name="key">Exact Redis key name.</param>
        /// <returns><see cref="RedisKeyValue"/> or null if key does not exist.</returns>
        Task<RedisKeyValue?> GetKeyAsync(string key);

        /// <summary>
        /// Creates or updates a key based on the provided request.
        /// </summary>
        /// <param name="request">Definition of key name, value, type and optional TTL.</param>
        /// <returns>True if operation succeeded.</returns>
        Task<bool> SetKeyAsync(CreateKeyRequest request);

        /// <summary>
        /// Deletes a key.
        /// </summary>
        /// <param name="key">Exact Redis key name.</param>
        /// <returns>True if key was removed.</returns>
        Task<bool> DeleteKeyAsync(string key);

        /// <summary>
        /// Performs a lightweight health check (PING) against the active connection.
        /// </summary>
        /// <returns>True when the connection responds successfully.</returns>
        Task<bool> TestConnectionAsync();

        /// <summary>
        /// Retrieves selected server statistics (version, memory usage, connected clients).
        /// </summary>
        /// <returns>Dictionary of key/value server info pairs.</returns>
        Task<Dictionary<string, string>> GetServerInfoAsync();
    }

}
