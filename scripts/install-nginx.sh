#!/bin/bash

# Script de instalação do Nginx e Certbot
# Este script instala e configura o Nginx e Certbot para o sistema

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌐 Instalador do Nginx e Certbot${NC}"
echo -e "${YELLOW}Este script irá instalar e configurar o Nginx e Certbot no seu sistema${NC}"
echo ""

# Detecta o sistema operacional
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    elif type lsb_release >/dev/null 2>&1; then
        OS=$(lsb_release -si)
        VER=$(lsb_release -sr)
    elif [[ -f /etc/lsb-release ]]; then
        . /etc/lsb-release
        OS=$DISTRIB_ID
        VER=$DISTRIB_RELEASE
    elif [[ -f /etc/debian_version ]]; then
        OS=Debian
        VER=$(cat /etc/debian_version)
    elif [[ -f /etc/SuSe-release ]]; then
        OS=SuSE
    elif [[ -f /etc/redhat-release ]]; then
        OS=RedHat
    else
        OS=$(uname -s)
        VER=$(uname -r)
    fi
    echo "$OS"
}

# Função para instalar no Ubuntu/Debian
install_ubuntu_debian() {
    echo -e "${YELLOW}📦 Instalando Nginx e Certbot no Ubuntu/Debian...${NC}"
    
    # Atualiza o sistema
    echo -e "  🔄 Atualizando repositórios..."
    sudo apt-get update
    
    # Instala Nginx
    echo -e "  📦 Instalando Nginx..."
    sudo apt-get install -y nginx
    
    # Instala Certbot
    echo -e "  📦 Instalando Certbot..."
    sudo apt-get install -y certbot python3-certbot-nginx
    
    # Inicia e habilita Nginx
    echo -e "  🚀 Iniciando Nginx..."
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    # Configura firewall (se UFW estiver ativo)
    if command -v ufw &> /dev/null && sudo ufw status | grep -q "Status: active"; then
        echo -e "  🔥 Configurando firewall..."
        sudo ufw allow 'Nginx Full'
        sudo ufw allow 80/tcp
        sudo ufw allow 443/tcp
    fi
    
    echo -e "${GREEN}✅ Nginx e Certbot instalados com sucesso!${NC}"
}

# Função para instalar no CentOS/RHEL
install_centos_rhel() {
    echo -e "${YELLOW}📦 Instalando Nginx e Certbot no CentOS/RHEL...${NC}"
    
    # Instala EPEL (se necessário)
    if ! rpm -q epel-release > /dev/null 2>&1; then
        echo -e "  📦 Instalando EPEL..."
        sudo yum install -y epel-release
    fi
    
    # Instala Nginx
    echo -e "  📦 Instalando Nginx..."
    sudo yum install -y nginx
    
    # Instala Certbot
    echo -e "  📦 Instalando Certbot..."
    sudo yum install -y certbot python3-certbot-nginx
    
    # Inicia e habilita Nginx
    echo -e "  🚀 Iniciando Nginx..."
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    # Configura firewall (se firewalld estiver ativo)
    if command -v firewall-cmd &> /dev/null && sudo firewall-cmd --state | grep -q "running"; then
        echo -e "  🔥 Configurando firewall..."
        sudo firewall-cmd --permanent --add-service=http
        sudo firewall-cmd --permanent --add-service=https
        sudo firewall-cmd --reload
    fi
    
    echo -e "${GREEN}✅ Nginx e Certbot instalados com sucesso!${NC}"
}

# Função para instalar no macOS
install_macos() {
    echo -e "${YELLOW}📦 Instalando Nginx e Certbot no macOS...${NC}"
    
    # Verifica se o Homebrew está instalado
    if ! command -v brew &> /dev/null; then
        echo -e "${RED}❌ Homebrew não está instalado!${NC}"
        echo -e "${YELLOW}💡 Instale o Homebrew primeiro:${NC}"
        echo -e "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
    
    # Instala Nginx
    echo -e "  📦 Instalando Nginx..."
    brew install nginx
    
    # Instala Certbot
    echo -e "  📦 Instalando Certbot..."
    brew install certbot
    
    # Inicia Nginx
    echo -e "  🚀 Iniciando Nginx..."
    brew services start nginx
    
    echo -e "${GREEN}✅ Nginx e Certbot instalados com sucesso!${NC}"
    echo -e "${YELLOW}💡 No macOS, o Nginx roda na porta 8080 por padrão${NC}"
    echo -e "${YELLOW}💡 Configure o arquivo /usr/local/etc/nginx/nginx.conf se necessário${NC}"
}

# Função para configurar Nginx
configure_nginx() {
    echo -e "${YELLOW}⚙️  Configurando Nginx...${NC}"
    
    # Cria diretórios necessários
    sudo mkdir -p /etc/nginx/sites-available
    sudo mkdir -p /etc/nginx/sites-enabled
    sudo mkdir -p /etc/nginx/ssl
    sudo mkdir -p /var/www/html
    
    # Configura permissões
    sudo chown -R www-data:www-data /var/www/html 2>/dev/null || sudo chown -R nginx:nginx /var/www/html 2>/dev/null || true
    
    # Cria arquivo de configuração principal se não existir
    local nginx_conf="/etc/nginx/nginx.conf"
    if [[ ! -f "$nginx_conf" ]]; then
        echo -e "  📝 Criando configuração principal do Nginx..."
        sudo tee "$nginx_conf" > /dev/null <<EOF
user www-data;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Gzip Settings
    gzip on;
    gzip_vary on;
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

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Include site configurations
    include /etc/nginx/sites-enabled/*;
}
EOF
    fi
    
    # Testa configuração
    if sudo nginx -t; then
        echo -e "${GREEN}✅ Configuração do Nginx válida${NC}"
        
        # Recarrega Nginx
        if command -v systemctl &> /dev/null; then
            sudo systemctl reload nginx
        elif command -v service &> /dev/null; then
            sudo service nginx reload
        fi
        
        echo -e "${GREEN}✅ Nginx configurado e recarregado${NC}"
    else
        echo -e "${RED}❌ Erro na configuração do Nginx${NC}"
        return 1
    fi
}

# Função para configurar Certbot
configure_certbot() {
    echo -e "${YELLOW}⚙️  Configurando Certbot...${NC}"
    
    # Cria diretório para certificados
    sudo mkdir -p /etc/letsencrypt
    
    # Configura renovação automática
    echo -e "  🔄 Configurando renovação automática..."
    
    # Cria script de renovação
    local renew_script="/usr/local/bin/renew-ssl.sh"
    sudo tee "$renew_script" > /dev/null <<EOF
#!/bin/bash
# Script para renovar certificados SSL

echo "Renovando certificados SSL..."
certbot renew --quiet

# Recarrega Nginx após renovação
if nginx -t; then
    systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null
    echo "Nginx recarregado após renovação de certificados"
fi
EOF
    
    sudo chmod +x "$renew_script"
    
    # Adiciona ao crontab (renova duas vezes por dia)
    if ! crontab -l 2>/dev/null | grep -q "renew-ssl.sh"; then
        echo -e "  ⏰ Adicionando renovação automática ao crontab..."
        (crontab -l 2>/dev/null; echo "0 2,14 * * * $renew_script") | crontab -
    fi
    
    echo -e "${GREEN}✅ Certbot configurado${NC}"
}

# Função principal
main() {
    local os=$(detect_os)
    echo -e "${BLUE}🖥️  Sistema detectado: $os${NC}"
    echo ""
    
    # Verifica se já está instalado
    if command -v nginx &> /dev/null && command -v certbot &> /dev/null; then
        echo -e "${YELLOW}⚠️  Nginx e Certbot já estão instalados!${NC}"
        read -p "Deseja reconfigurar? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}✅ Instalação cancelada${NC}"
            exit 0
        fi
    fi
    
    # Instala baseado no sistema operacional
    case "$os" in
        *"Ubuntu"*|*"Debian"*)
            install_ubuntu_debian
            ;;
        *"CentOS"*|*"Red Hat"*|*"RHEL"*)
            install_centos_rhel
            ;;
        *"macOS"*|*"Darwin"*)
            install_macos
            ;;
        *)
            echo -e "${RED}❌ Sistema operacional não suportado: $os${NC}"
            echo -e "${YELLOW}💡 Instale manualmente o Nginx e Certbot para seu sistema${NC}"
            exit 1
            ;;
    esac
    
    # Configura Nginx
    configure_nginx
    
    # Configura Certbot
    configure_certbot
    
    echo ""
    echo -e "${GREEN}🎉 Instalação concluída com sucesso!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Próximos passos:${NC}"
    echo -e "  1. Configure seus domínios para apontar para este servidor"
    echo -e "  2. Use o comando: ./manage-stacks.sh up -n NOME -u https://seu-dominio.com -w https://app.seu-dominio.com"
    echo -e "  3. Os certificados SSL serão gerados automaticamente"
    echo ""
    echo -e "${YELLOW}🛠️  Comandos úteis:${NC}"
    echo -e "  ./manage-stacks.sh nginx status  - Verificar status do Nginx"
    echo -e "  ./manage-stacks.sh nginx list    - Listar configurações"
    echo -e "  ./manage-stacks.sh ssl renew     - Renovar certificados"
    echo ""
}

# Executa função principal
main "$@" 