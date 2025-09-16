# Redis Studio

A Redis client with a beautiful web interface built with Angular and ASP.NET Core. Real-time key management, and full accessibility support.

![Redis Studio Connection Screenshot](docs/screenshot-connection.png)
![Redis Studio Main Screenshot](docs/screenshot-main.png)

## ✨ Features

- **Modern UI**: Clean, responsive interface matching the original design exactly
- **Key Management**: List, create, update, and delete Redis keys with full type support
- **Real-time Operations**: Live key monitoring with TTL display
- **Accessibility**: Full WCAG compliance with keyboard navigation and ARIA labels
- **Docker Ready**: Complete containerization with Podman/Docker Compose

## 🚀 Quick Start

### Prerequisites

- Docker or Podman
- Podman Compose (or Docker Compose)
- Node.js 18+ (for local development)
- .NET 8 SDK (for local development)

### Running with Podman Compose

1. **Clone and start services:**
   ```bash
   cd redis-studio
   podman-compose up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:5000
   - Redis: localhost:6379

3. **Connect to Redis:**
   - Use the connection modal to connect to `redis://redis:6379`
   - Or connect to your own Redis instance

### Running with Docker Compose

```bash
# Replace podman-compose with docker-compose
docker-compose up --build
```

## 🏗️ Architecture

```
redis-studio/
├── frontend/           # Angular 17+ application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # UI components
│   │   │   ├── services/      # API and theme services
│   │   │   └── models/        # TypeScript interfaces
│   │   └── environments/      # Environment configs
│   ├── Dockerfile
│   └── nginx.conf
├── backend/            # ASP.NET Core 8 Web API
│   ├── RedisStudio.Api/
│   │   ├── Controllers/       # API endpoints
│   │   ├── Services/          # Business logic
│   │   └── Models/           # Data models
│   └── Dockerfile
└── podman-compose.yml  # Container orchestration
```

## 🛠️ Development Setup

### Backend Development

```bash
cd backend/RedisStudio.Api
dotnet restore
dotnet run
```

The API will be available at https://localhost:7074

### Frontend Development

```bash
cd frontend
npm install
npm start
```

The frontend will be available at http://localhost:4200

### Running Redis Locally

```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine

# Using Podman
podman run -d -p 6379:6379 redis:7-alpine
```

## 📚 API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/redis/keys` | List all keys with metadata |
| GET | `/api/redis/keys/{key}` | Get specific key value |
| POST | `/api/redis/keys` | Create new key |
| PUT | `/api/redis/keys/{key}` | Update existing key |
| DELETE | `/api/redis/keys/{key}` | Delete key |
| GET | `/api/redis/connection/test` | Test Redis connection |
| GET | `/api/redis/server/info` | Get server information |

### Example Requests

**Create a key:**
```bash
curl -X POST http://localhost:5000/api/redis/keys \
  -H "Content-Type: application/json" \
  -d '{
    "key": "user:1001",
    "value": "John Doe",
    "type": "string",
    "ttlSeconds": 3600
  }'
```

**Get all keys:**
```bash
curl http://localhost:5000/api/redis/keys?pattern=user:*
```

## 🔧 Configuration

### Environment Variables

**Frontend (`environment.ts`):**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

## 🐳 Container Configuration

### Health Checks

All services include health checks:
- **Redis**: `redis-cli ping`
- **Backend**: API connection test endpoint
- **Frontend**: HTTP response check

### Resource Limits

Default resource limits are production-ready. Adjust in `podman-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

## 🔒 Security

### Features

- **Input Validation**: All API inputs validated
- **Error Handling**: Secure error messages
- **Security Headers**: Nginx security headers configured

### Best Practices

1. **Use TLS in production**
2. **Configure Redis AUTH**
3. **Set up reverse proxy**
4. **Regular security updates**

## 📊 Monitoring

### Application Metrics

Monitor via:
- Health check endpoints
- Container logs: `podman-compose logs -f`
- Redis INFO command

### Performance

Optimizations included:
- Nginx gzip compression
- Static asset caching
- Angular production build
- Redis connection pooling

## 🚀 Deployment

### Production Deployment

**Build for production:**
   ```bash
   podman-compose -f podman-compose.yml -f podman-compose.prod.yml up --build
   ```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
