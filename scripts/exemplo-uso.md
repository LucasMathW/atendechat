# Exemplo Prático de Uso - Nginx e SSL

Este guia demonstra como usar o sistema de gerenciamento de stacks com Nginx e certificados SSL automáticos.

## 🚀 Cenário: Criando uma Instância com Domínios

### 1. Preparação Inicial

```bash
# Instalar Nginx e Certbot (primeira vez)
./scripts/install-nginx.sh

# Verificar se está funcionando
./manage-stacks.sh nginx status
```

### 2. Configurar DNS

Antes de criar a instância, configure seus domínios para apontar para o servidor:

```bash
# Exemplo de configuração DNS
api.exemplo.com     A     SEU_IP_DO_SERVIDOR
app.exemplo.com     A     SEU_IP_DO_SERVIDOR
```

### 3. Criar Instância com Domínios

```bash
# Criar instância com domínios (SSL automático)
./manage-stacks.sh up -n codatende1 \
  -u https://api.exemplo.com \
  -w https://app.exemplo.com \
  -c 2 -m 2048
```

**O que acontece automaticamente:**

1. ✅ **Verificação de portas** - Verifica se as portas estão disponíveis
2. ✅ **Criação da stack** - Inicia containers Docker
3. ✅ **Configuração do Nginx** - Cria virtual hosts
4. ✅ **Geração de SSL** - Solicita certificados via Certbot
5. ✅ **Aplicação de configurações** - Recarrega Nginx com SSL

### 4. Verificar Resultado

```bash
# Verificar status da stack
./manage-stacks.sh status -n codatende1

# Verificar configurações do Nginx
./manage-stacks.sh nginx list

# Verificar certificados SSL
sudo certbot certificates
```

### 5. Acessar a Aplicação

- **Backend**: https://api.exemplo.com
- **Frontend**: https://app.exemplo.com

## 🔧 Comandos de Gerenciamento

### Verificar Status

```bash
# Status da stack
./manage-stacks.sh status -n codatende1

# Status do Nginx
./manage-stacks.sh nginx status

# Logs da stack
./manage-stacks.sh logs -n codatende1
```

### Manutenção

```bash
# Renovar certificados SSL
./manage-stacks.sh ssl renew

# Recarregar configuração do Nginx
./manage-stacks.sh nginx reload

# Reiniciar stack
./manage-stacks.sh restart -n codatende1
```

### Remoção

```bash
# Parar e remover stack (inclui limpeza completa)
./manage-stacks.sh down -n codatende1

# O sistema irá:
# 1. Parar todos os containers Docker
# 2. Remover configurações do Nginx
# 3. Remover certificados SSL
# 4. Remover instância do arquivo JSON
# 5. Recarregar Nginx
```

## 🌐 Configurações do Nginx Criadas

### Para o Backend (api.exemplo.com)

```nginx
# Configuração HTTP (porta 80)
server {
    listen 80;
    server_name api.exemplo.com;
    
    # Proxy para localhost:3000
    location / {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        # ... outras configurações de proxy
    }
}

# Configuração HTTPS (porta 443)
server {
    listen 443 ssl http2;
    server_name api.exemplo.com;
    
    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/api.exemplo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.exemplo.com/privkey.pem;
    
    # Configurações SSL modernas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    # ... outras configurações de segurança
    
    # Proxy para localhost:3000
    location / {
        proxy_pass http://localhost:3000/;
        # ... configurações de proxy
    }
}
```

### Para o Frontend (app.exemplo.com)

```nginx
# Configuração similar, mas com:
# - Proxy para localhost:3001
# - Suporte a SPA (try_files)
# - Cache de arquivos estáticos
# - Compressão Gzip
```

## 🔐 Certificados SSL

### Geração Automática

Os certificados são gerados automaticamente via Certbot:

```bash
# Verificar certificados
sudo certbot certificates

# Renovar manualmente
./manage-stacks.sh ssl renew

# Renovação automática (configurada no crontab)
# 0 2,14 * * * /usr/local/bin/renew-ssl.sh
```

### Características dos Certificados

- ✅ **Let's Encrypt** - Gratuitos e confiáveis
- ✅ **Renovação automática** - Duas vezes por dia
- ✅ **Wildcard** - Suporte a subdomínios (se configurado)
- ✅ **HSTS** - Headers de segurança modernos

## 🛡️ Configurações de Segurança

### Headers de Segurança

```nginx
# Headers aplicados automaticamente
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### Configurações SSL

```nginx
# Protocolos modernos
ssl_protocols TLSv1.2 TLSv1.3;

# Cipher suites seguras
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
```

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Certificado não gerado

```bash
# Verificar se o domínio está resolvendo
nslookup api.exemplo.com

# Verificar logs do Certbot
sudo certbot logs

# Tentar gerar manualmente
sudo certbot certonly --webroot -w /var/www/html -d api.exemplo.com
```

#### 2. Nginx não carrega

```bash
# Verificar configuração
sudo nginx -t

# Verificar logs
sudo tail -f /var/log/nginx/error.log

# Recarregar manualmente
sudo systemctl reload nginx
```

#### 3. Porta em uso

```bash
# Verificar portas em uso
sudo lsof -i :3000
sudo lsof -i :3001

# Parar processo conflitante
sudo kill -9 PID_DO_PROCESSO
```

### Logs Úteis

```bash
# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs do Certbot
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Logs da stack
./manage-stacks.sh logs -n codatende1
```

## 📊 Monitoramento

### Verificar Status Completo

```bash
# Status de todos os componentes
echo "=== Status da Stack ==="
./manage-stacks.sh status -n codatende1

echo "=== Status do Nginx ==="
./manage-stacks.sh nginx status

echo "=== Configurações do Nginx ==="
./manage-stacks.sh nginx list

echo "=== Certificados SSL ==="
sudo certbot certificates

echo "=== Portas em Uso ==="
sudo netstat -tuln | grep -E ":(80|443|3000|3001)"
```

### Health Checks

```bash
# Verificar se os serviços estão respondendo
curl -I https://api.exemplo.com/health
curl -I https://app.exemplo.com

# Verificar certificados
openssl s_client -connect api.exemplo.com:443 -servername api.exemplo.com
```

## 🎯 Próximos Passos

1. **Configurar backup** dos certificados SSL
2. **Monitoramento** com ferramentas como Nagios/Zabbix
3. **Rate limiting** no Nginx para proteção
4. **CDN** para melhor performance
5. **Load balancer** para alta disponibilidade 