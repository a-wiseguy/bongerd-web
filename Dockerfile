FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat su-exec \
  && addgroup -S app \
  && adduser -S -G app -u 1001 app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
ENV NODE_ENV=production
COPY --from=build /app/.output ./.output
COPY drizzle ./drizzle
COPY src ./src
COPY tsconfig.json ./
COPY docker-entrypoint.sh ./
RUN mkdir -p data/uploads \
  && chmod +x docker-entrypoint.sh \
  && chown -R app:app /app
# root only to chown the uploads volume, then drop to app via su-exec
EXPOSE 3000
# start period covers db wait + migrations + seed
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/healthz >/dev/null || exit 1
ENTRYPOINT ["./docker-entrypoint.sh"]
