# ====================
# Build Stage
# ====================
FROM oven/bun:latest AS builder

# Set working directory inside the builder container
WORKDIR /app

# Install OpenSSL for Prisma and clear apt cache to reduce image size
RUN apt-get update -y && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and bun.lock for dependency installation
# This layer will be cached unless these files change
COPY package*.json bun.lock ./

# Install project dependencies
RUN bun install

# Copy the rest of the application source code
# This should happen after dependencies are installed to leverage caching
COPY . .

# Generate Prisma Client code
# This needs the schema and node_modules, so it comes after copying code and installing dependencies
RUN bun run prisma:generate

# Build the NestJS application (transpile TypeScript to JavaScript)
RUN bun run build

# ====================
# Production Stage
# A slim base image to run the application
# ====================
FROM oven/bun:latest AS final

# Set working directory for the final container
WORKDIR /app

# ------------------
# Build-time args
# ------------------
ARG DB_USER
ARG DB_PASSWORD
ARG DB_NAME
ARG DB_PORT
ARG DB_HOST

ARG DATABASE_URL

ARG ADMIN_JWT_SECRET
ARG ADMIN_JWT_EXPIRATION
ARG LEARNER_JWT_SECRET
ARG LEARNER_JWT_EXPIRATION

ARG CLIENT_URL
ARG SERVER_PORT
ARG USE_STUB_ADAPTER

ARG WHATSAPP_ACCESS_TOKEN
ARG WHATSAPP_PHONE_NUMBER_ID
ARG WHATSAPP_API_VERSION

ARG OPENAI_API_KEY
ARG OPENAI_MODEL
ARG OPENAI_MAX_TOKENS

ARG S3_ACCESS_ENDPOINT
ARG S3_RESPONSE_ENDPOINT
ARG S3_REGION
ARG S3_ACCESS_KEY
ARG S3_SECRET_KEY
ARG S3_BUCKET
ARG S3_IMAGE_PREFIX
ARG S3_AUDIO_PREFIX
ARG S3_PATH_STYLE


# Install OpenSSL here as well, if needed for runtime DB connection (Prisma)
# This is crucial if your Prisma client depends on OpenSSL at runtime.
RUN apt-get update -y && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy only necessary runtime files from the builder stage
# This dramatically reduces the final image size.
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/bun.lock ./
COPY --from=builder /app/node_modules/ ./node_modules/ 
COPY --from=builder /app/dist/ ./dist/                
COPY --from=builder /app/prisma/ ./prisma/          

# ------------------
# Runtime environment variables
# Define these directly in the final stage for runtime usage.
# These will be passed to the container when you run it (e.g., using docker-compose or `docker run -e`).
# Using ARG for build-time secrets and ENV for runtime secrets is a common pattern.
# For truly sensitive production secrets, consider Docker Secrets or Kubernetes Secrets.
# ------------------
ENV DB_USER=${DB_USER} \
    DB_PASSWORD=${DB_PASSWORD} \
    DB_NAME=${DB_NAME} \
    DB_PORT=${DB_PORT} \
    DB_HOST=${DB_HOST} \
    DATABASE_URL=${DATABASE_URL} \
    ADMIN_JWT_SECRET=${ADMIN_JWT_SECRET} \
    ADMIN_JWT_EXPIRATION=${ADMIN_JWT_EXPIRATION} \
    LEARNER_JWT_SECRET=${LEARNER_JWT_SECRET} \
    LEARNER_JWT_EXPIRATION=${LEARNER_JWT_EXPIRATION} \
    CLIENT_URL=${CLIENT_URL} \
    SERVER_PORT=${SERVER_PORT} \
    USE_STUB_ADAPTER=${USE_STUB_ADAPTER} \
    WHATSAPP_ACCESS_TOKEN=${WHATSAPP_ACCESS_TOKEN} \
    WHATSAPP_PHONE_NUMBER_ID=${WHATSAPP_PHONE_NUMBER_ID} \
    WHATSAPP_API_VERSION=${WHATSAPP_API_VERSION} \
    OPENAI_API_KEY=${OPENAI_API_KEY} \
    OPENAI_MODEL=${OPENAI_MODEL} \
    OPENAI_MAX_TOKENS=${OPENAI_MAX_TOKENS} \
    S3_ACCESS_ENDPOINT=${S3_ACCESS_ENDPOINT} \
    S3_RESPONSE_ENDPOINT=${S3_RESPONSE_ENDPOINT} \
    S3_REGION=${S3_REGION} \
    S3_ACCESS_KEY=${S3_ACCESS_KEY} \
    S3_SECRET_KEY=${S3_SECRET_KEY} \
    S3_BUCKET=${S3_BUCKET} \
    S3_IMAGE_PREFIX=${S3_IMAGE_PREFIX} \
    S3_AUDIO_PREFIX=${S3_AUDIO_PREFIX} \
    S3_PATH_STYLE=${S3_PATH_STYLE}

# Expose the port your NestJS application listens on
EXPOSE 8080

# Command to run the application
# This assumes 'start:migrate:prod' first runs prisma migrations and then starts the app.
CMD [ "bun", "run", "start:migrate:prod" ]
