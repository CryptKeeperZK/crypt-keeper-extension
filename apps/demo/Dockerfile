FROM node:18-alpine as builder
RUN apk add --no-cache git curl

WORKDIR /builder
COPY ../../ .
RUN npm i -g pnpm
RUN pnpm install
RUN pnpm run build

# Create image by copying build artifacts
FROM node:18-alpine as runner
RUN npm i -g pnpm

USER node
ARG PORT=1234

WORKDIR /home/node
COPY --chown=node:node  --from=builder /builder/ ./

EXPOSE ${PORT}
CMD ["pnpm", "run", "demo:start"]
