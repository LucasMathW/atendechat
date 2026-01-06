#!/bin/bash

# Módulo de gerenciamento do Nginx e Certbot
# Este módulo gerencia configurações de proxy reverso e certificados SSL

# Obtém o diretório raiz do projeto
get_project_root() {
    if [[ -f "manage-stacks.sh" ]]; then
        echo "$(pwd)"
    else
        echo "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
    fi
}

PROJECT_ROOT=$(get_project_root)

# Diretórios de configuração
NGINX_CONF_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
NGINX_SSL_DIR="/etc/nginx/ssl"
CERTBOT_CONF_DIR="/etc/letsencrypt"

# Função para verificar se o Nginx está instalado
check_nginx_installed() {
    if ! command -v nginx &> /dev/null; then
        echo -e "${RED}❌ Nginx não está instalado!${NC}"
        echo -e "${YELLOW}💡 Instale o Nginx:${NC}"
        echo -e "  Ubuntu/Debian: sudo apt-get install nginx"
        echo -e "  CentOS/RHEL: sudo yum install nginx"
        echo -e "  macOS: brew install nginx"
        return 1
    fi
    
    if ! command -v certbot &> /dev/null; then
        echo -e "${RED}❌ Certbot não está instalado!${NC}"
        echo -e "${YELLOW}💡 Instale o Certbot:${NC}"
        echo -e "  Ubuntu/Debian: sudo apt-get install certbot python3-certbot-nginx"
        echo -e "  CentOS/RHEL: sudo yum install certbot python3-certbot-nginx"
        echo -e "  macOS: brew install certbot"
        return 1
    fi
    
    echo -e "${GREEN}✅ Nginx e Certbot estão instalados${NC}"
    return 0
}

# Função para extrair domínio de uma URL
extract_domain() {
    local url=$1
    # Remove protocolo (http:// ou https://)
    local domain=$(echo "$url" | sed -E 's|^https?://||')
    # Remove porta se existir
    domain=$(echo "$domain" | sed -E 's|:[0-9]+$||')
    # Remove path se existir
    domain=$(echo "$domain" | sed -E 's|/.*$||')
    echo "$domain"
}

# Função para verificar se um domínio é válido
validate_domain() {
    local domain=$1
    
    # Verifica se é um domínio válido
    if [[ ! "$domain" =~ ^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$ ]]; then
        echo -e "${RED}❌ Domínio inválido: $domain${NC}"
        return 1
    fi
    
    # Verifica se não é localhost ou IP local
    if [[ "$domain" == "localhost" ]] || [[ "$domain" =~ ^127\. ]] || [[ "$domain" =~ ^192\.168\. ]] || [[ "$domain" =~ ^10\. ]]; then
        echo -e "${YELLOW}⚠️  Aviso: Domínio local detectado ($domain). Certificados SSL não serão gerados.${NC}"
        return 2
    fi
    
    echo -e "${GREEN}✅ Domínio válido: $domain${NC}"
    return 0
}

# Função para criar configuração do Nginx
create_nginx_config() {
    local stack_name=$1
    local backend_url=$2
    local frontend_url=$3
    local backend_port=$4
    local frontend_port=$5
    
    local backend_domain=$(extract_domain "$backend_url")
    local frontend_domain=$(extract_domain "$frontend_url")
    
    echo -e "${YELLOW}🔧 Criando configuração do Nginx para $stack_name...${NC}"
    
    # Verifica se os diretórios existem
    if [[ ! -d "$NGINX_CONF_DIR" ]]; then
        echo -e "${RED}❌ Diretório do Nginx não encontrado: $NGINX_CONF_DIR${NC}"
        echo -e "${YELLOW}💡 Verifique se o Nginx está instalado corretamente${NC}"
        return 1
    fi
    
    # Cria diretório SSL se não existir
    sudo mkdir -p "$NGINX_SSL_DIR"
    
    # Configuração para o backend
    if [[ "$backend_domain" != "localhost" ]]; then
        create_backend_nginx_config "$stack_name" "$backend_domain" "$backend_port"
    fi
    
    # Configuração para o frontend
    if [[ "$frontend_domain" != "localhost" ]]; then
        create_frontend_nginx_config "$stack_name" "$frontend_domain" "$frontend_port"
    fi
    
    # Testa configuração do Nginx
    if sudo nginx -t; then
        echo -e "${GREEN}✅ Configuração do Nginx válida${NC}"
        # Recarrega Nginx
        sudo systemctl reload nginx 2>/dev/null || sudo service nginx reload 2>/dev/null
        echo -e "${GREEN}✅ Nginx recarregado${NC}"
    else
        echo -e "${RED}❌ Configuração do Nginx inválida${NC}"
        return 1
    fi
    
    return 0
}

# Função para criar configuração do backend no Nginx
create_backend_nginx_config() {
    local stack_name=$1
    local domain=$2
    local port=$3
    
    local config_file="$NGINX_CONF_DIR/${stack_name}-backend"
    
    echo -e "  🔧 Criando configuração para backend: $domain -> localhost:$port"
    
    # Cria configuração do Nginx
    sudo tee "$config_file" > /dev/null <<EOF
# Configuração para $stack_name - Backend
# Domínio: $domain
# Porta: $port

server {
    listen 80;
    server_name $domain;
    
    # Logs
    access_log /var/log/nginx/${stack_name}-backend-access.log;
    error_log /var/log/nginx/${stack_name}-backend-error.log;
    
    # Configurações de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Configurações de proxy
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # Buffer settings
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    
    # Health check
    location /health {
        proxy_pass http://localhost:$port/health;
        access_log off;
    }
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:$port/;
    }
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:$port/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Default location
    location / {
        proxy_pass http://localhost:$port/;
    }
}

# Configuração HTTPS (será ativada após certificado SSL)
# server {
#     listen 443 ssl http2;
#     server_name $domain;
#     
#     # SSL será configurado pelo Certbot
#     # ssl_certificate /etc/letsencrypt/live/$domain/fullchain.pem;
#     # ssl_certificate_key /etc/letsencrypt/live/$domain/privkey.pem;
#     
#     # Logs
#     access_log /var/log/nginx/${stack_name}-backend-access.log;
#     error_log /var/log/nginx/${stack_name}-backend-error.log;
#     
#     # Configurações de segurança
#     add_header X-Frame-Options "SAMEORIGIN" always;
#     add_header X-XSS-Protection "1; mode=block" always;
#     add_header X-Content-Type-Options "nosniff" always;
#     add_header Referrer-Policy "no-referrer-when-downgrade" always;
#     add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
#     
#     # Configurações de proxy
#     proxy_http_version 1.1;
#     proxy_set_header Upgrade \$http_upgrade;
#     proxy_set_header Connection 'upgrade';
#     proxy_set_header Host \$host;
#     proxy_set_header X-Real-IP \$remote_addr;
#     proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
#     proxy_set_header X-Forwarded-Proto \$scheme;
#     proxy_cache_bypass \$http_upgrade;
#     
#     # Timeouts
#     proxy_connect_timeout 60s;
#     proxy_send_timeout 60s;
#     proxy_read_timeout 60s;
#     
#     # Buffer settings
#     proxy_buffering on;
#     proxy_buffer_size 4k;
#     proxy_buffers 8 4k;
#     
#     # Health check
#     location /health {
#         proxy_pass http://localhost:$port/health;
#         access_log off;
#     }
#     
#     # API routes
#     location /api/ {
#         proxy_pass http://localhost:$port/;
#     }
#     
#     # WebSocket support
#     location /socket.io/ {
#         proxy_pass http://localhost:$port/socket.io/;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade \$http_upgrade;
#         proxy_set_header Connection "upgrade";
#     }
#     
#     # Default location
#     location / {
#         proxy_pass http://localhost:$port/;
#     }
# }
EOF
    
    # Habilita o site
    if [[ -d "$NGINX_ENABLED_DIR" ]]; then
        sudo ln -sf "$config_file" "$NGINX_ENABLED_DIR/"
    fi
    
    echo -e "    ${GREEN}✅ Configuração do backend criada: $config_file${NC}"
}

# Função para criar configuração do frontend no Nginx
create_frontend_nginx_config() {
    local stack_name=$1
    local domain=$2
    local port=$3
    
    local config_file="$NGINX_CONF_DIR/${stack_name}-frontend"
    
    echo -e "  🔧 Criando configuração para frontend: $domain -> localhost:$port"
    
    # Cria configuração do Nginx
    sudo tee "$config_file" > /dev/null <<EOF
# Configuração para $stack_name - Frontend
# Domínio: $domain
# Porta: $port

server {
    listen 80;
    server_name $domain;
    
    # Logs
    access_log /var/log/nginx/${stack_name}-frontend-access.log;
    error_log /var/log/nginx/${stack_name}-frontend-error.log;
    
    # Configurações de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Configurações de proxy
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # Buffer settings
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Default location (SPA support) - deve vir primeiro
    location / {
        proxy_pass http://localhost:$port/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Static files cache - deve vir depois da location principal
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:$port;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Configuração HTTPS (será ativada após certificado SSL)
# server {
#     listen 443 ssl http2;
#     server_name $domain;
#     
#     # SSL será configurado pelo Certbot
#     # ssl_certificate /etc/letsencrypt/live/$domain/fullchain.pem;
#     # ssl_certificate_key /etc/letsencrypt/live/$domain/privkey.pem;
#     
#     # Logs
#     access_log /var/log/nginx/${stack_name}-frontend-access.log;
#     error_log /var/log/nginx/${stack_name}-frontend-error.log;
#     
#     # Configurações de segurança
#     add_header X-Frame-Options "SAMEORIGIN" always;
#     add_header X-XSS-Protection "1; mode=block" always;
#     add_header X-Content-Type-Options "nosniff" always;
#     add_header Referrer-Policy "no-referrer-when-downgrade" always;
#     add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
#     
#     # Configurações de proxy
#     proxy_http_version 1.1;
#     proxy_set_header Upgrade \$http_upgrade;
#     proxy_set_header Connection 'upgrade';
#     proxy_set_header Host \$host;
#     proxy_set_header X-Real-IP \$remote_addr;
#     proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
#     proxy_set_header X-Forwarded-Proto \$scheme;
#     proxy_cache_bypass \$http_upgrade;
#     
#     # Timeouts
#     proxy_connect_timeout 60s;
#     proxy_send_timeout 60s;
#     proxy_read_timeout 60s;
#     
#     # Buffer settings
#     proxy_buffering on;
#     proxy_buffer_size 4k;
#     proxy_buffers 8 4k;
#     
#     # Gzip compression
#     gzip on;
#     gzip_vary on;
#     gzip_min_length 1024;
#     gzip_proxied any;
#     gzip_comp_level 6;
#     gzip_types
#         text/plain
#         text/css
#         text/xml
#         text/javascript
#         application/json
#         application/javascript
#         application/xml+rss
#         application/atom+xml
#         image/svg+xml;
#     
#     # Default location (SPA support) - deve vir primeiro
#     location / {
#         proxy_pass http://localhost:$port/;
#         try_files \$uri \$uri/ /index.html;
#     }
#     
#     # Static files cache - deve vir depois da location principal
#     location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
#         proxy_pass http://localhost:$port;
#         expires 1y;
#         add_header Cache-Control "public, immutable";
#     }
# }
EOF
    
    # Habilita o site
    if [[ -d "$NGINX_ENABLED_DIR" ]]; then
        sudo ln -sf "$config_file" "$NGINX_ENABLED_DIR/"
    fi
    
    echo -e "    ${GREEN}✅ Configuração do frontend criada: $config_file${NC}"
}

# Função para gerar certificados SSL
generate_ssl_certificates() {
    local stack_name=$1
    local backend_url=$2
    local frontend_url=$3
    
    local backend_domain=$(extract_domain "$backend_url")
    local frontend_domain=$(extract_domain "$frontend_url")
    
    echo -e "${YELLOW}🔐 Gerando certificados SSL para $stack_name...${NC}"
    
    # Verifica se o Certbot está disponível
    if ! command -v certbot &> /dev/null; then
        echo -e "${RED}❌ Certbot não está instalado!${NC}"
        echo -e "${YELLOW}💡 Instale o Certbot para gerar certificados SSL${NC}"
        return 1
    fi
    
    # O plugin nginx do Certbot não precisa de webroot
    
    # Gera certificado para o backend
    if [[ "$backend_domain" != "localhost" ]] && [[ ! "$backend_domain" =~ ^127\. ]] && [[ ! "$backend_domain" =~ ^192\.168\. ]] && [[ ! "$backend_domain" =~ ^10\. ]]; then
        echo -e "  🔐 Gerando certificado para backend: $backend_domain"
        generate_certificate_for_domain "$backend_domain" "$stack_name-backend"
    fi
    
    # Gera certificado para o frontend
    if [[ "$frontend_domain" != "localhost" ]] && [[ ! "$frontend_domain" =~ ^127\. ]] && [[ ! "$frontend_domain" =~ ^192\.168\. ]] && [[ ! "$frontend_domain" =~ ^10\. ]]; then
        echo -e "  🔐 Gerando certificado para frontend: $frontend_domain"
        generate_certificate_for_domain "$frontend_domain" "$stack_name-frontend"
    fi
    
    # O plugin nginx do Certbot recarrega automaticamente o Nginx
    echo -e "${GREEN}✅ Certificados SSL gerados e Nginx configurado automaticamente${NC}"
}

# Função para gerar certificado para um domínio específico
generate_certificate_for_domain() {
    local domain=$1
    local config_name=$2

    # Verifica se o certificado já existe
    if [[ -d "$CERTBOT_CONF_DIR/live/$domain" ]]; then
        echo -e "    ${YELLOW}⚠️  Certificado já existe para $domain${NC}"
        return 0
    fi

    # Verifica se o domínio está resolvendo
    if ! nslookup "$domain" > /dev/null 2>&1; then
        echo -e "    ${RED}❌ Domínio $domain não está resolvendo!${NC}"
        echo -e "    ${YELLOW}💡 Configure o DNS para apontar para este servidor${NC}"
        return 1
    fi

        # Gera certificado usando plugin nginx
    echo -e "    🔐 Solicitando certificado para $domain..."
    
    if sudo certbot --nginx \
        -d "$domain" \
        --email "admin@$domain" \
        --agree-tos \
        --non-interactive; then

        echo -e "    ${GREEN}✅ Certificado gerado para $domain${NC}"
        # Não precisa chamar update_nginx_ssl_config pois o plugin nginx já configura automaticamente
    else
        echo -e "    ${RED}❌ Erro ao gerar certificado para $domain${NC}"
        echo -e "    ${YELLOW}💡 Verifique se o domínio está apontando para este servidor e se a porta 80 está aberta${NC}"
        return 1
    fi
}

# Função para atualizar configuração do Nginx com certificados SSL
# NOTA: Esta função não é mais necessária quando usando o plugin --nginx do Certbot
# O plugin nginx configura automaticamente o SSL
# update_nginx_ssl_config() {
#     local domain=$1
#     local config_name=$2
#     
#     local config_file="$NGINX_CONF_DIR/$config_name"
#     
#     if [[ ! -f "$config_file" ]]; then
#         echo -e "    ${RED}❌ Arquivo de configuração não encontrado: $config_file${NC}"
#         return 1
#     fi
#     
#     # Descomenta a seção HTTPS inteira
#     sudo sed -i 's/^# server {/server {/g' "$config_file"
#     sudo sed -i 's/^#     listen 443 ssl http2;/    listen 443 ssl http2;/g' "$config_file"
#     sudo sed -i 's/^#     server_name/    server_name/g' "$config_file"
#     sudo sed -i 's/^#     # SSL será configurado pelo Certbot/    # SSL será configurado pelo Certbot/g' "$config_file"
#     sudo sed -i 's/^#     # ssl_certificate/    ssl_certificate/g' "$config_file"
#     sudo sed -i 's/^#     # ssl_certificate_key/    ssl_certificate_key/g' "$config_file"
#     sudo sed -i 's/^#     # Logs/    # Logs/g' "$config_file"
#     sudo sed -i 's/^#     access_log/    access_log/g' "$config_file"
#     sudo sed -i 's/^#     error_log/    error_log/g' "$config_file"
#     sudo sed -i 's/^#     # Configurações de segurança/    # Configurações de segurança/g' "$config_file"
#     sudo sed -i 's/^#     add_header/    add_header/g' "$config_file"
#     sudo sed -i 's/^#     # Configurações de proxy/    # Configurações de proxy/g' "$config_file"
#     sudo sed -i 's/^#     proxy_/    proxy_/g' "$config_file"
#     sudo sed -i 's/^#     # Timeouts/    # Timeouts/g' "$config_file"
#     sudo sed -i 's/^#     proxy_connect_timeout/    proxy_connect_timeout/g' "$config_file"
#     sudo sed -i 's/^#     proxy_send_timeout/    proxy_send_timeout/g' "$config_file"
#     sudo sed -i 's/^#     proxy_read_timeout/    proxy_read_timeout/g' "$config_file"
#     sudo sed -i 's/^#     # Buffer settings/    # Buffer settings/g' "$config_file"
#     sudo sed -i 's/^#     proxy_buffering/    proxy_buffering/g' "$config_file"
#     sudo sed -i 's/^#     proxy_buffer_size/    proxy_buffer_size/g' "$config_file"
#     sudo sed -i 's/^#     proxy_buffers/    proxy_buffers/g' "$config_file"
#     
#     # Descomenta seções específicas baseadas no tipo de configuração
#     if [[ "$config_name" == *"backend"* ]]; then
#         sudo sed -i 's/^#     # Default /    # Default location/g' "$config_file"
#         sudo sed -i 's/^#     location \/ {/    location \/ {/g' "$config_file"
#         sudo sed -i 's/^#         proxy_pass/        proxy_pass/g' "$config_file"
#         sudo sed -i 's/^#     }/    }/g' "$config_file"
#     else
#         # Frontend - descomenta seções específicas do frontend
#         sudo sed -i 's/^#     # Gzip compression/    # Gzip compression/g' "$config_file"
#         sudo sed -i 's/^#     gzip/    gzip/g' "$config_file"
#         sudo sed -i 's/^#     # Default location (SPA support) - deve vir primeiro/    # Default location (SPA support) - deve vir primeiro/g' "$config_file"
#         sudo sed -i 's/^#     location \/ {/    location \/ {/g' "$config_file"
#         sudo sed -i 's/^#         proxy_pass/        proxy_pass/g' "$config_file"
#         sudo sed -i 's/^#         try_files/        try_files/g' "$config_file"
#         sudo sed -i 's/s/^#     }/    }/g' "$config_file"
#         sudo sed -i 's/^#     # Static files cache - deve vir depois da location principal/    # Static files cache - deve vir depois da location principal/g' "$config_file"
#         sudo sed -i 's/^#     location ~\* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {/    location ~\* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {/g' "$config_file"
#         sudo sed -i 's/^#         proxy_pass/        proxy_pass/g' "$config_file"
#         sudo sed -i 's/^#         expires/        expires/g' "$config_file"
#         sudo sed -i 's/^#         add_header Cache-Control/        add_header Cache-Control/g' "$config_file"
#         sudo sed -i 's/^#     }/    }/g' "$config_file"
#     fi
#     
#     # Descomenta o fechamento do server block
#     sudo sed -i 's/^# }/}/g' "$config_file"
#     
#     # Atualiza configuração com certificados SSL
#     sudo sed -i "s|# ssl_certificate /etc/letsencrypt/live/$domain/fullchain.pem;|ssl_certificate /etc/letsencrypt/live/$domain/fullchain.pem;|g" "$config_file"
#     sudo sed -i "s|# ssl_certificate_key /etc/letsencrypt/live/$domain/privkey.pem;|ssl_certificate_key /etc/letsencrypt/live/$domain/privkey.pem;|g" "$config_file"
#     
#     # Adiciona configurações SSL modernas após a linha ssl_certificate_key
#     sudo sed -i "/ssl_certificate_key/a\\
#     \\
#     # SSL Configuration\\
#     ssl_protocols TLSv1.2 TLSv1.3;\\
#     ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;\\
#     ssl_prefer_server_ciphers off;\\
#     ssl_session_cache shared:SSL:10m;\\
#     ssl_session_timeout 10m;\\
#     ssl_stapling on;\\
#     ssl_stapling_verify on;\\
#     add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;\\
#     " "$config_file"
#     
#     echo -e "    ${GREEN}✅ Configuração SSL atualizada para $domain${NC}"
# }

# Função para remover configurações do Nginx
remove_nginx_config() {
    local stack_name=$1
    
    echo -e "${YELLOW}🧹 Removendo configurações do Nginx para $stack_name...${NC}"
    
    # Remove configurações do backend
    local backend_config="$NGINX_CONF_DIR/${stack_name}-backend"
    if [[ -f "$backend_config" ]]; then
        # Extrai domínio da configuração antes de remover
        local backend_domain=$(grep "server_name" "$backend_config" | head -1 | awk '{print $2}' | sed 's/;$//')
        sudo rm -f "$backend_config"
        echo -e "  🗑️  Removida configuração do backend: $backend_config"
        
        # Remove certificado SSL se existir
        if [[ -n "$backend_domain" && "$backend_domain" != "localhost" ]]; then
            remove_ssl_certificate "$backend_domain"
        fi
    fi
    
    # Remove configurações do frontend
    local frontend_config="$NGINX_CONF_DIR/${stack_name}-frontend"
    if [[ -f "$frontend_config" ]]; then
        # Extrai domínio da configuração antes de remover
        local frontend_domain=$(grep "server_name" "$frontend_config" | head -1 | awk '{print $2}' | sed 's/;$//')
        sudo rm -f "$frontend_config"
        echo -e "  🗑️  Removida configuração do frontend: $frontend_config"
        
        # Remove certificado SSL se existir
        if [[ -n "$frontend_domain" && "$frontend_domain" != "localhost" ]]; then
            remove_ssl_certificate "$frontend_domain"
        fi
    fi
    
    # Remove links simbólicos
    if [[ -d "$NGINX_ENABLED_DIR" ]]; then
        sudo rm -f "$NGINX_ENABLED_DIR/${stack_name}-backend"
        sudo rm -f "$NGINX_ENABLED_DIR/${stack_name}-frontend"
    fi
    
    # Testa e recarrega Nginx
    if sudo nginx -t; then
        sudo systemctl reload nginx 2>/dev/null || sudo service nginx reload 2>/dev/null
        echo -e "${GREEN}✅ Nginx recarregado${NC}"
    else
        echo -e "${RED}❌ Erro na configuração do Nginx${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Configurações do Nginx removidas para $stack_name${NC}"
}

# Função para remover certificado SSL
remove_ssl_certificate() {
    local domain=$1
    
    if [[ -z "$domain" ]]; then
        return 0
    fi
    
    echo -e "  🔐 Removendo certificado SSL para $domain..."
    
    # Verifica se o certificado existe
    if [[ -d "$CERTBOT_CONF_DIR/live/$domain" ]]; then
        # Remove certificado via Certbot
        if sudo certbot delete --cert-name "$domain" --non-interactive; then
            echo -e "    ${GREEN}✅ Certificado SSL removido para $domain${NC}"
        else
            echo -e "    ${YELLOW}⚠️  Erro ao remover certificado via Certbot, removendo manualmente${NC}"
            # Remove manualmente se o Certbot falhar
            sudo rm -rf "$CERTBOT_CONF_DIR/live/$domain"
            sudo rm -rf "$CERTBOT_CONF_DIR/archive/$domain"
            sudo rm -rf "$CERTBOT_CONF_DIR/renewal/$domain.conf"
            echo -e "    ${GREEN}✅ Certificado SSL removido manualmente para $domain${NC}"
        fi
    else
        echo -e "    ${YELLOW}⚠️  Certificado SSL não encontrado para $domain${NC}"
    fi
}

# Função para renovar certificados SSL
renew_ssl_certificates() {
    echo -e "${YELLOW}🔄 Renovando certificados SSL...${NC}"
    
    if sudo certbot renew --quiet; then
        echo -e "${GREEN}✅ Certificados SSL renovados${NC}"
        
        # Recarrega Nginx
        if sudo nginx -t; then
            sudo systemctl reload nginx 2>/dev/null || sudo service nginx reload 2>/dev/null
            echo -e "${GREEN}✅ Nginx recarregado${NC}"
        fi
    else
        echo -e "${RED}❌ Erro ao renovar certificados SSL${NC}"
        return 1
    fi
}

# Função para listar configurações do Nginx
list_nginx_configs() {
    echo -e "${YELLOW}📋 Configurações do Nginx:${NC}"
    
    if [[ -d "$NGINX_CONF_DIR" ]]; then
        for config in "$NGINX_CONF_DIR"/*; do
            if [[ -f "$config" ]]; then
                local filename=$(basename "$config")
                local enabled=""
                
                if [[ -L "$NGINX_ENABLED_DIR/$filename" ]]; then
                    enabled="${GREEN}✅ Habilitado${NC}"
                else
                    enabled="${RED}❌ Desabilitado${NC}"
                fi
                
                echo -e "  📄 $filename - $enabled"
            fi
        done
    else
        echo -e "  ${RED}❌ Diretório do Nginx não encontrado${NC}"
    fi
}

# Função para verificar status do Nginx
check_nginx_status() {
    echo -e "${YELLOW}🔍 Verificando status do Nginx...${NC}"
    
    if command -v systemctl &> /dev/null; then
        if sudo systemctl is-active --quiet nginx; then
            echo -e "  ${GREEN}✅ Nginx está rodando${NC}"
        else
            echo -e "  ${RED}❌ Nginx não está rodando${NC}"
            return 1
        fi
    elif command -v service &> /dev/null; then
        if sudo service nginx status > /dev/null 2>&1; then
            echo -e "  ${GREEN}✅ Nginx está rodando${NC}"
        else
            echo -e "  ${RED}❌ Nginx não está rodando${NC}"
            return 1
        fi
    else
        echo -e "  ${YELLOW}⚠️  Não foi possível verificar o status do Nginx${NC}"
    fi
    
    # Testa configuração
    if sudo nginx -t > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ Configuração do Nginx válida${NC}"
    else
        echo -e "  ${RED}❌ Configuração do Nginx inválida${NC}"
        return 1
    fi
} 