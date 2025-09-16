using StackExchange.Redis;

namespace RedisStudio.Api.Interfaces
{
    /// <summary>
    /// Abstraction responsible for establishing and exposing a reusable Redis connection.
    /// </summary>
    public interface IRedisConnectionManager
    {
        /// <summary>
        /// Establishes a new connection and returns a unique connection id.
        /// </summary>
        /// <param name="connectionString">Redis connection string.</param>
        /// <returns>Tuple indicating success and the allocated connectionId (empty if failed).</returns>
        Task<(bool Success, string ConnectionId)> ConnectAsync(string connectionString);

        /// <summary>
        /// Get an existing connection by id.
        /// </summary>
        IConnectionMultiplexer? GetConnection(string connectionId);

        /// <summary>
        /// Close and remove a connection.
        /// </summary>
        bool CloseConnection(string connectionId);
    }
}
