FROM node:20-alpine AS build

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Install dependencies only once
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
ARG VITE_IPCONFIG
ARG VITE_SEATS
ARG VITE_THRESHOLD
ENV VITE_IPCONFIG=${VITE_IPCONFIG}
ENV VITE_SEATS=${VITE_SEATS}
ENV VITE_THRESHOLD=${VITE_THRESHOLD}

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN pnpm build

# Production image using Nginx
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
