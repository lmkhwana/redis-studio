ARG NODE_VERSION=18-alpine
FROM node:${NODE_VERSION} AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build:docker

FROM nginx:alpine AS runtime
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist/redis-studio-frontend/ ./
COPY nginx.conf /etc/nginx/nginx.conf

# Optional runtime env injection script (simple placeholder replacement)
COPY <<'EOF' /docker-entrypoint.d/10-env.sh
#!/bin/sh
set -e
API_BASE="$REDIS_STUDIO_API_BASE"
if [ -n "$API_BASE" ]; then
	# Replace placeholder in any main.*.js if present
	for f in /usr/share/nginx/html/*.js; do
		[ -f "$f" ] && sed -i "s|__REDIS_STUDIO_API_BASE__|$API_BASE|g" "$f" || true
	done
fi
EOF
RUN chmod +x /docker-entrypoint.d/10-env.sh

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]