# ==============================================================================
# DOCKERFILE - CENTRO MÉDICO PUERTA DE HIERRO (TEPIC)
# Despliegue en la Nube de Alta Disponibilidad y Seguridad
# ==============================================================================

# Etapa 1: Construcción (Build)
FROM node:24-alpine AS builder

WORKDIR /app

# Copiar manifiestos de dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar aplicación en modo producción
RUN npm run build

# Etapa 2: Servidor de Producción Nginx Ultraligero y Seguro
FROM nginx:alpine-slim

# Metadatos de la imagen
LABEL maintainer="Hospital Puerta de Hierro <sistemas@puertadehierro.com.mx>"
LABEL description="Plataforma Médica y Administrativa Hospital Puerta de Hierro Tepic"

# Copiar artefactos compilados
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración personalizada de Nginx con compresión gzip y headers de seguridad
RUN cat <<EOF > /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;

    # Compresión gzip para alta velocidad en iPads y móviles
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cabeceras de seguridad estrictas (LFPDPPP y Normativa Hospitalaria)
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    root /usr/share/nginx/html;
    index index.html;

    # Soporte SPA y PWA para rutas de React
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Caché para activos estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
