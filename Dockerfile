FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./ 

RUN pnpm fetch --prod
RUN pnpm install --prod --frozen-lockfile

COPY . .

RUN pnpm build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/_core/env.ts ./server/_core/env.ts
COPY --from=builder /app/server/_core/index.ts ./server/_core/index.ts

EXPOSE 3000

CMD ["node", "dist/index.js"]
