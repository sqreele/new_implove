# Use specific Node.js LTS version with Alpine for smaller image size
FROM node:20.17.0-alpine AS base

# Install latest npm for security and performance improvements
RUN npm install -g npm@11.4.1

# Install necessary system dependencies
RUN apk add --no-cache \
    libc6-compat \
    curl \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Create non-root user early for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

# ================================
# Dependencies stage - Install and cache dependencies
# ================================
FROM base AS deps

# Copy package files
COPY package.json ./
COPY package-lock.json* ./

# Validate and fix package-lock.json if needed
RUN if [ -f package-lock.json ]; then \
        echo "Validating package-lock.json..."; \
        npm ci --dry-run --legacy-peer-deps || { \
            echo "Lock file is out of sync, regenerating..."; \
            rm package-lock.json; \
            npm install --package-lock-only --legacy-peer-deps; \
        }; \
    else \
        echo "No lock file found, generating..."; \
        npm install --package-lock-only --legacy-peer-deps; \
    fi

# Install all dependencies (including dev dependencies needed for build)
RUN npm ci \
    --legacy-peer-deps \
    --no-audit \
    --no-fund \
    --prefer-offline \
    --cache /tmp/.npm

# ================================
# Builder stage - Build the application
# ================================
FROM base AS builder

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package-lock.json ./package-lock.json

# Copy source code
COPY . .

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    SKIP_ENV_VALIDATION=true

# Build arguments for flexible configuration
ARG NEXT_PUBLIC_API_URL=https://pmcs.site
ARG NEXT_PRIVATE_API_URL=http://django-backend:8000
ARG API_URL=http://django-backend:8000
ARG NEXTAUTH_URL=https://pmcs.site
ARG NEXTAUTH_SECRET
ARG JWT_SECRET
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG DATABASE_URL=postgresql://mylubd_user:Sqreele1234@db:5432/mylubd_db?schema=public

# Set environment variables from build args
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PRIVATE_API_URL=${NEXT_PRIVATE_API_URL} \
    API_URL=${API_URL} \
    NEXTAUTH_URL=${NEXTAUTH_URL} \
    NEXTAUTH_SECRET=${NEXTAUTH_SECRET} \
    JWT_SECRET=${JWT_SECRET} \
    GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID} \
    GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET} \
    DATABASE_URL=${DATABASE_URL}

# Initialize shadcn/ui components with error handling
RUN npx --yes shadcn@2.5.0 init --yes 2>/dev/null || { \
        echo "shadcn init failed, continuing without it..."; \
        exit 0; \
    }

RUN npx --yes shadcn@2.5.0 add \
    accordion alert alert-dialog avatar badge breadcrumb button \
    calendar card carousel checkbox collapsible command context-menu \
    data-table date-picker dialog drawer dropdown-menu form hover-card \
    input input-otp label menubar navigation-menu pagination popover \
    progress radio-group resizable scroll-area select separator sheet \
    skeleton slider sonner switch table tabs textarea toast toggle \
    toggle-group tooltip --yes 2>/dev/null || { \
        echo "Some shadcn components failed to install, continuing..."; \
        exit 0; \
    }

# Generate Prisma client (safe without database connection)
RUN if [ -f prisma/schema.prisma ]; then \
        npx prisma generate; \
    else \
        echo "No Prisma schema found, skipping generation..."; \
    fi

# Build the Next.js application
RUN npm run build

# Clean up dev dependencies and build artifacts to reduce image size
RUN npm ci --omit=dev --legacy-peer-deps && \
    npm cache clean --force && \
    rm -rf /tmp/.npm /root/.npm

# ================================
# Runner stage - Production runtime
# ================================
FROM base AS runner

# Set production environment
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Copy all files from builder, then clean up what we don't need
COPY --from=builder --chown=nextjs:nodejs /app ./temp_copy
RUN cp -r ./temp_copy/.next ./ && \
    cp -r ./temp_copy/public ./ && \
    cp -r ./temp_copy/node_modules ./ && \
    cp ./temp_copy/package.json ./ && \
    cp ./temp_copy/package-lock.json ./ && \
    if [ -f ./temp_copy/next.config.js ]; then cp ./temp_copy/next.config.js ./; fi && \
    if [ -f ./temp_copy/next.config.mjs ]; then cp ./temp_copy/next.config.mjs ./; fi && \
    if [ -f ./temp_copy/next.config.ts ]; then cp ./temp_copy/next.config.ts ./; fi && \
    if [ -f ./temp_copy/components.json ]; then cp ./temp_copy/components.json ./; fi && \
    rm -rf ./temp_copy

# Copy Prisma files if they exist
RUN mkdir -p ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma/ || echo "No Prisma files found, skipping..."

# Create necessary directories with proper permissions
RUN mkdir -p /app/.next/cache && \
    chown -R nextjs:nodejs /app

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Switch to non-root user for security
USER nextjs

# Expose port
EXPOSE 3000

# Start the application with proper signal handling
CMD ["npm", "start"]