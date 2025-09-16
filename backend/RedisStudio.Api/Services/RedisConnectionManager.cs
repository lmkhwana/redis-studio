using RedisStudio.Api.Interfaces;
using StackExchange.Redis;
using System.Collections.Concurrent;

namespace RedisStudio.Api.Services;

public class RedisConnectionManager : IRedisConnectionManager
{
    private readonly ConcurrentDictionary<string, IConnectionMultiplexer> _connections = new();

    public async Task<(bool Success, string ConnectionId)> ConnectAsync(string connectionString)
    {
        try
        {
            var connection = await ConnectionMultiplexer.ConnectAsync(connectionString);
            var id = Guid.NewGuid().ToString("n");
            _connections[id] = connection;
            return (true, id);
        }
        catch
        {
            return (false, string.Empty);
        }
    }

    public IConnectionMultiplexer? GetConnection(string connectionId)
        => _connections.TryGetValue(connectionId, out var mux) ? mux : null;

    public bool CloseConnection(string connectionId)
    {
        if (_connections.Remove(connectionId, out var mux))
        {
            mux.Dispose();
            return true;
        }
        return false;
    }
}
