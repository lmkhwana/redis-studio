using RedisStudio.Api.Models;

namespace RedisStudio.Api.Services;

/// <summary>
/// Redis operations service abstraction supporting multi-tenant (multi-connection) usage.
/// Every method requires a <paramref name="connectionId"/> referencing a previously established connection.
/// </summary>
public interface IRedisService
{
	Task<IEnumerable<RedisKeyInfo>> GetKeysAsync(string connectionId, string pattern = "*", int page = 0, int pageSize = 10);
	Task<(IEnumerable<RedisKeyInfo> Items, long Total)> GetKeysPageAsync(string connectionId, string pattern = "*", int page = 0, int pageSize = 10);
	Task<RedisKeyValue?> GetKeyAsync(string connectionId, string key);
	Task<bool> SetKeyAsync(string connectionId, CreateKeyRequest request);
	Task<bool> DeleteKeyAsync(string connectionId, string key);
	Task<bool> TestConnectionAsync(string connectionId);
	Task<Dictionary<string, string>> GetServerInfoAsync(string connectionId);
}
