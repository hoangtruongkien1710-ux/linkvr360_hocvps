FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
# Prisma is imported while Next.js collects route configuration during build.
# This placeholder is build-only; runtime receives the real DATABASE_URL from Compose.
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY src ./src
COPY public ./public
COPY next.config.ts tsconfig.json ./

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
