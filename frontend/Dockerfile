# Frontend production image with static build served by nginx.
FROM node:26-alpine AS builder
WORKDIR /app
ARG VITE_API_BASE_URL=http://localhost:3000/api/v1
ARG VITE_CSRF_COOKIE_NAME=crm_csrf_token
ARG VITE_ROUTER_MODE=browser
ARG VITE_BASE_PATH=/
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_CSRF_COOKIE_NAME=$VITE_CSRF_COOKIE_NAME
ENV VITE_ROUTER_MODE=$VITE_ROUTER_MODE
ENV VITE_BASE_PATH=$VITE_BASE_PATH
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.31-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
