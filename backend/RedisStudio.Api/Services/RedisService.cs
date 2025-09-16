using StackExchange.Redis;
using RedisStudio.Api.Models;
using System.Text.Json;
using RedisStudio.Api.Interfaces;

namespace RedisStudio.Api.Services;

public class RedisService : IRedisService
{
    private readonly IRedisConnectionManager _connectionManager;
    private readonly ILogger<RedisService> _logger;

    public RedisService(IRedisConnectionManager connectionManager, ILogger<RedisService> logger)
    {
        _connectionManager = connectionManager;
        _logger = logger;
    }

    private IDatabase GetDatabase(string connectionId)
    {
        var conn = _connectionManager.GetConnection(connectionId);
        if (conn == null)
            throw new InvalidOperationException("Invalid or expired connectionId. Establish a connection first.");
        return conn.GetDatabase();
    }

    private IServer GetServer(string connectionId)
    {
        var conn = _connectionManager.GetConnection(connectionId);
        if (conn == null)
            throw new InvalidOperationException("Invalid or expired connectionId. Establish a connection first.");
        return conn.GetServer(conn.GetEndPoints().First());
    }

    /// <summary>
    /// Get keys with pagination
    /// </summary>
    public async Task<IEnumerable<RedisKeyInfo>> GetKeysAsync(string connectionId, string pattern = "*", int page = 0, int pageSize = 10)
    {
        var (items, _) = await GetKeysPageAsync(connectionId, pattern, page, pageSize);
        return items;
    }

    public async Task<(IEnumerable<RedisKeyInfo> Items, long Total)> GetKeysPageAsync(string connectionId, string pattern = "*", int page = 0, int pageSize = 10)
    {
        try
        {
            var db = GetDatabase(connectionId);
            var server = GetServer(connectionId);

            // Efficient streaming: skip keys until start index, then collect pageSize keys only
            long start = page * pageSize;
            long end = start + pageSize;
            long index = 0;
            var collected = new List<RedisKeyInfo>(pageSize);

            foreach (var key in server.Keys(pattern: pattern, pageSize: 1000))
            {
                if (index >= end && collected.Count >= pageSize)
                {
                    // We can still count remaining keys quickly by continuing iteration without metadata fetch
                    index++; // count this key
                    continue;
                }

                if (index >= start && index < end && collected.Count < pageSize)
                {
                    try
                    {
                        var type = await db.KeyTypeAsync(key);
                        var ttl = await db.KeyTimeToLiveAsync(key);
                        var size = await GetKeySizeAsync(db, key.ToString(), type);
                        var ttlSeconds = ttl?.TotalSeconds > 0 ? (long)ttl.Value.TotalSeconds : (long?)null;
                        collected.Add(new RedisKeyInfo
                        {
                            Key = key.ToString(),
                            Type = type.ToString().ToLower(),
                            Ttl = ttlSeconds,
                            DaysToExpire = ttlSeconds.HasValue ? (int)Math.Ceiling(ttlSeconds.Value / 86400d) : null,
                            Size = size,
                            LastModified = DateTime.UtcNow
                        });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning($"Error getting metadata for key {key}: {ex.Message}");
                    }
                }
                else
                {
                    // skipping metadata for keys outside requested window for performance
                }
                index++;
            }

            long total = index; // total keys matched pattern
            return (collected.OrderBy(k => k.Key), total);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting paged keys: {ex.Message}");
            throw;
        }
    }

    public async Task<RedisKeyValue?> GetKeyAsync(string connectionId, string key)
    {
        try
        {
            var db = GetDatabase(connectionId);
            if (!await db.KeyExistsAsync(key))
                return null;

            var type = await db.KeyTypeAsync(key);
            var ttl = await db.KeyTimeToLiveAsync(key);
            var size = await GetKeySizeAsync(db, key, type);
            object? value = null;

            string? rawString = null;
            switch (type)
            {
                case RedisType.String:
                    var rv = await db.StringGetAsync(key);
                    rawString = rv.HasValue ? rv.ToString() : null;
                    value = rawString; // serialize only the string contents
                    break;
                case RedisType.Hash:
                    var hash = await db.HashGetAllAsync(key);
                    value = hash.ToDictionary(h => h.Name.ToString(), h => h.Value.ToString());
                    break;
                case RedisType.List:
                    var list = await db.ListRangeAsync(key, 0, 99); // limit
                    value = list.Select(v => v.ToString()).ToArray();
                    break;
                case RedisType.Set:
                    var set = await db.SetMembersAsync(key);
                    value = set.Select(v => v.ToString()).ToArray();
                    break;
                default:
                    value = "Unsupported type";
                    break;
            }

            var ttlSeconds = ttl?.TotalSeconds > 0 ? (long)ttl.Value.TotalSeconds : (long?)null;
            return new RedisKeyValue
            {
                Key = key,
                Type = type.ToString().ToLower(),
                Ttl = ttlSeconds,
                DaysToExpire = ttlSeconds.HasValue ? (int)Math.Ceiling(ttlSeconds.Value / 86400d) : null,
                Size = size,
                Value = value,
                RawString = rawString,
                LastModified = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting key {key}: {ex.Message}");
            throw;
        }
    }

    public async Task<bool> SetKeyAsync(string connectionId, CreateKeyRequest request)
    {
        try
        {
            var db = GetDatabase(connectionId);
            var expiry = request.TtlSeconds.HasValue ? TimeSpan.FromSeconds(request.TtlSeconds.Value) : (TimeSpan?)null;

            switch (request.Type.ToLower())
            {
                case "string":
                    return await db.StringSetAsync(request.Key, request.Value, expiry);

                case "hash":
                    var hashData = JsonSerializer.Deserialize<Dictionary<string, string>>(request.Value);
                    if (hashData != null)
                    {
                        var hashFields = hashData.Select(kv => new HashEntry(kv.Key, kv.Value)).ToArray();
                        await db.HashSetAsync(request.Key, hashFields);
                        if (expiry.HasValue)
                            await db.KeyExpireAsync(request.Key, expiry);
                        return true;
                    }
                    return false;

                default:
                    return await db.StringSetAsync(request.Key, request.Value, expiry);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error setting key {request.Key}: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> DeleteKeyAsync(string connectionId, string key)
    {
        try
        {
            var db = GetDatabase(connectionId);
            return await db.KeyDeleteAsync(key);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error deleting key {key}: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> TestConnectionAsync(string connectionId)
    {
        try
        {
            var db = GetDatabase(connectionId);
            await db.PingAsync();
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<Dictionary<string, string>> GetServerInfoAsync(string connectionId)
    {
        try
        {
            var server = GetServer(connectionId);
            var info = await server.InfoAsync();

            var result = new Dictionary<string, string>();
            foreach (var section in info)
            {
                foreach (var item in section)
                {
                    result[item.Key] = item.Value;
                }
            }

            return new Dictionary<string, string>
            {
                ["version"] = result.GetValueOrDefault("redis_version", "Unknown"),
                ["used_memory"] = result.GetValueOrDefault("used_memory_human", "Unknown"),
                ["connected_clients"] = result.GetValueOrDefault("connected_clients", "0")
            };
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting server info: {ex.Message}");
            return new Dictionary<string, string>
            {
                ["version"] = "Unknown",
                ["used_memory"] = "Unknown",
                ["connected_clients"] = "0"
            };
        }
    }

    private async Task<string> GetKeySizeAsync(IDatabase db, string key, RedisType type)
    {
        try
        {
            return type switch
            {
                RedisType.String => $"{await db.StringLengthAsync(key)} B",
                RedisType.Hash => $"{await db.HashLengthAsync(key)} fields",
                RedisType.List => $"{await db.ListLengthAsync(key)} items",
                RedisType.Set => $"{await db.SetLengthAsync(key)} members",
                _ => "—"
            };
        }
        catch
        {
            return "—";
        }
    }
}
