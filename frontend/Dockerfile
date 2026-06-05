# ====================
# Stage 1: Build
# ====================
FROM node:24-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (cache optimization)
COPY package*.json ./

# Install all dependencies (including dev) for building
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ====================
# Stage 2: Production (Serve with nginx)
# ====================
FROM nginx:alpine AS production

# Copy built application from builder stage to nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
