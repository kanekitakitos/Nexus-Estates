FROM node:20-bookworm-slim AS build

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl unzip \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ARG NEXT_PUBLIC_IDP
ENV NEXT_PUBLIC_IDP=$NEXT_PUBLIC_IDP

RUN bun run build

FROM node:20-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build --chown=node:node /app/package.json /app/package.json
COPY --from=build --chown=node:node /app/next.config.ts /app/next.config.ts
COPY --from=build --chown=node:node /app/public /app/public
COPY --from=build --chown=node:node /app/.next /app/.next
COPY --from=build --chown=node:node /app/node_modules /app/node_modules
USER node

EXPOSE 3000

CMD ["node","node_modules/next/dist/bin/next","start","-p","3000"]
