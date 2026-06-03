# --- Build Stage ---
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Install build dependencies (if native node modules require compilation)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies including devDependencies
RUN npm ci

COPY . .

# Generate Prisma client matching the current platform target
RUN npx prisma generate

# Build NestJS application
RUN npm run build

# Prune devDependencies to keep the production container slim
RUN npm prune --production

# --- Production Runner Stage ---
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copy necessary production artifacts from builder
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

# Create folders for uploads and assign ownership to node user
RUN mkdir -p uploads/receipts uploads/products && chown -R node:node uploads

# Run as non-privileged node user for security
USER node

EXPOSE 8080

ENV PORT=8080
ENV HOST=0.0.0.0

CMD ["node", "dist/main.js"]
