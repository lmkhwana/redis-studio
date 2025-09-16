using Microsoft.AspNetCore.Mvc;
using RedisStudio.Api.Models;
using RedisStudio.Api.Interfaces;
using RedisStudio.Api.Services; // Added for IRedisService interface now in Services namespace

namespace RedisStudio.Api.Controllers;

/// <summary>
/// Redis operations controller
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class RedisController : ControllerBase
{
    private readonly RedisStudio.Api.Services.IRedisService _redisService;
    private readonly IRedisConnectionManager _connectionManager;
    private readonly ILogger<RedisController> _logger;

    public RedisController(
    RedisStudio.Api.Services.IRedisService redisService,
        IRedisConnectionManager connectionManager,
        ILogger<RedisController> logger)
    {
        _redisService = redisService;
        _connectionManager = connectionManager;
        _logger = logger;
    }

    /// <summary>
    /// Connect to Redis with a given connection string
    /// </summary>
    [HttpPost("connection/connect")]
    public async Task<ActionResult<ApiResponse<object>>> Connect([FromBody] ConnectRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.ConnectionString))
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Connection string is required"
                });
            }

            var (success, connectionId) = await _connectionManager.ConnectAsync(request.ConnectionString);

            if (!success)
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new ApiResponse<object>
                {
                    Success = false,
                    Data = null,
                    Message = "Unable to connect to Redis"
                });
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = new { connectionId },
                Message = "Connection successful"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error connecting to Redis");
            return StatusCode(StatusCodes.Status500InternalServerError, new ApiResponse<object>
            {
                Success = false,
                Message = "Error connecting to Redis"
            });
        }
    }

    /// <summary>
    /// Get all Redis keys with metadata (supports pagination)
    /// </summary>
    [HttpGet("keys")]
    public async Task<ActionResult<ApiResponse<object>>> GetKeys(
        [FromHeader(Name = "X-Connection-Id")] string connectionId,
        [FromQuery] string pattern = "*",
        [FromQuery] int page = 0,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(connectionId))
            {
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Missing X-Connection-Id header" });
            }
            if (page < 0) page = 0;
            if (pageSize <= 0) pageSize = 10;

            var result = await _redisService.GetKeysPageAsync(connectionId, pattern, page, pageSize);
            var items = result.Items;
            var total = result.Total;
            var payload = new
            {
                items,
                total,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            };
            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = payload,
                Message = $"Retrieved {items.Count()} keys (Page {page + 1})"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting keys: {ex.Message}");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Error retrieving keys"
            });
        }
    }

    /// <summary>
    /// Get specific key with value
    /// </summary>
    [HttpGet("keys/{key}")]
    public async Task<ActionResult<ApiResponse<RedisKeyValue>>> GetKey([FromHeader(Name = "X-Connection-Id")] string connectionId, string key)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(connectionId))
                return BadRequest(new ApiResponse<RedisKeyValue> { Success = false, Message = "Missing X-Connection-Id header" });

            var keyValue = await _redisService.GetKeyAsync(connectionId, key);
            if (keyValue == null)
            {
                return NotFound(new ApiResponse<RedisKeyValue>
                {
                    Success = false,
                    Message = "Key not found"
                });
            }

            return Ok(new ApiResponse<RedisKeyValue>
            {
                Success = true,
                Data = keyValue,
                Message = "Key retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting key {key}: {ex.Message}");
            return StatusCode(500, new ApiResponse<RedisKeyValue>
            {
                Success = false,
                Message = "Error retrieving key"
            });
        }
    }

    /// <summary>
    /// Create a new key
    /// </summary>
    [HttpPost("keys")]
    public async Task<ActionResult<ApiResponse<bool>>> CreateKey([FromHeader(Name = "X-Connection-Id")] string connectionId, [FromBody] CreateKeyRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(connectionId))
                return BadRequest(new ApiResponse<bool> { Success = false, Message = "Missing X-Connection-Id header" });
            if (string.IsNullOrWhiteSpace(request.Key))
            {
                return BadRequest(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Key name is required"
                });
            }

            var result = await _redisService.SetKeyAsync(connectionId, request);
            return Ok(new ApiResponse<bool>
            {
                Success = result,
                Data = result,
                Message = result ? "Key created successfully" : "Failed to create key"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error creating key {request.Key}: {ex.Message}");
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Error creating key"
            });
        }
    }

    /// <summary>
    /// Update existing key
    /// </summary>
    [HttpPut("keys/{key}")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateKey([FromHeader(Name = "X-Connection-Id")] string connectionId, string key, [FromBody] CreateKeyRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(connectionId))
                return BadRequest(new ApiResponse<bool> { Success = false, Message = "Missing X-Connection-Id header" });
            request.Key = key;
            var result = await _redisService.SetKeyAsync(connectionId, request);
            return Ok(new ApiResponse<bool>
            {
                Success = result,
                Data = result,
                Message = result ? "Key updated successfully" : "Failed to update key"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error updating key {key}: {ex.Message}");
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Error updating key"
            });
        }
    }

    /// <summary>
    /// Delete a key
    /// </summary>
    [HttpDelete("keys/{key}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteKey([FromHeader(Name = "X-Connection-Id")] string connectionId, string key)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(connectionId))
                return BadRequest(new ApiResponse<bool> { Success = false, Message = "Missing X-Connection-Id header" });
            var result = await _redisService.DeleteKeyAsync(connectionId, key);
            return Ok(new ApiResponse<bool>
            {
                Success = result,
                Data = result,
                Message = result ? "Key deleted successfully" : "Key not found or failed to delete"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error deleting key {key}: {ex.Message}");
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Error deleting key"
            });
        }
    }

    /// <summary>
    /// Get server information
    /// </summary>
    [HttpGet("server/info")]
    public async Task<ActionResult<ApiResponse<Dictionary<string, string>>>> GetServerInfo([FromHeader(Name = "X-Connection-Id")] string connectionId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(connectionId))
                return BadRequest(new ApiResponse<Dictionary<string, string>> { Success = false, Message = "Missing X-Connection-Id header" });
            var info = await _redisService.GetServerInfoAsync(connectionId);
            return Ok(new ApiResponse<Dictionary<string, string>>
            {
                Success = true,
                Data = info,
                Message = "Server info retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting server info: {ex.Message}");
            return StatusCode(500, new ApiResponse<Dictionary<string, string>>
            {
                Success = false,
                Message = "Error retrieving server info"
            });
        }
    }

    /// <summary>
    /// Test redis connection
    /// </summary>
    [HttpGet("connection/testconnection")]
    public async Task<bool> TestConnection([FromHeader(Name = "X-Connection-Id")] string connectionId)
    {
        if (string.IsNullOrWhiteSpace(connectionId)) return false;
        return await _redisService.TestConnectionAsync(connectionId);
    }

    /// <summary>
    /// Disconnect and dispose a connection
    /// </summary>
    [HttpDelete("connection")]
    public ActionResult<ApiResponse<bool>> Disconnect([FromHeader(Name = "X-Connection-Id")] string connectionId)
    {
        if (string.IsNullOrWhiteSpace(connectionId))
        {
            return BadRequest(new ApiResponse<bool> { Success = false, Message = "Missing X-Connection-Id header" });
        }
        try
        {
            var closed = _connectionManager.CloseConnection(connectionId);
            return Ok(new ApiResponse<bool>
            {
                Success = closed,
                Data = closed,
                Message = closed ? "Disconnected" : "Connection not found"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error disconnecting {connectionId}", connectionId);
            return StatusCode(500, new ApiResponse<bool> { Success = false, Message = "Error disconnecting" });
        }
    }
}
