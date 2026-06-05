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
# Stage 2: Production
# ====================
FROM node:24-alpine AS production

# Set working directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user and set ownership
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main.js"]
