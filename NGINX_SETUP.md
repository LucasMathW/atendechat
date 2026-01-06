# Configuração Automática do Nginx e Certbot

## Visão Geral

O script `manage-stacks.sh` agora configura automaticamente o Nginx e Certbot quando você executa o comando `up`. Isso permite que você tenha um proxy reverso funcionando imediatamente após subir sua stack.

## O que acontece automaticamente

### 1. Durante o comando `up`

Quando você executa `./manage-stacks.sh up`, além de subir os containers Docker, o sistema:

- ✅ **Inicia o Nginx** (se não estiver rodando)
- ✅ **Habilita o Nginx** para iniciar automaticamente com o sistema
- ✅ **Instala o Certbot** (se não estiver instalado)
- ✅ **Configura renovação automática** de certificados SSL
- ✅ **Cria configuração básica** do Nginx para proxy reverso
- ✅ **Ativa a configuração** e recarrega o Nginx
- ✅ **Configura SSL automaticamente** (se URLs são HTTPS)

### 2. Configuração Básica Criada

O Nginx é configurado automaticamente baseado nas URLs definidas na instância:

#### Para URLs com domínios específicos:
Se você criou a instância com URLs como `https://api.seudominio.com` e `https://app.seudominio.com`, o Nginx criará:

```nginx
# Servidor para backend
server {
    listen 80;
    server_name api.seudominio.com;
    
    # Proxy para o backend
    location / {
        proxy_pass http://localhost:3000/;
        # ... configurações de proxy
    }
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000/socket.io/;
        # ... configurações de WebSocket
    }
}

# Servidor para frontend
server {
    listen 80;
    server_name app.seudominio.com;
    
    # Proxy para o frontend
    location / {
        proxy_pass http://localhost:3001/;
        # ... configurações de proxy
    }
    
    # Arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3001;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Para URLs localhost:
Se você criou a instância com URLs como `http://localhost:3000` e `http://localhost:3001`, o Nginx criará:

```nginx
server {
    listen 80;
    server_name _;
    
    # Proxy para o backend
    location /api/ {
        proxy_pass http://localhost:3000/;
        # ... configurações de proxy
    }
    
    # Proxy para o frontend
    location / {
        proxy_pass http://localhost:3001/;
        # ... configurações de proxy
    }
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000/socket.io/;
        # ... configurações de WebSocket
    }
}
```

### 3. Acesso Imediato

Após o `up`, você pode acessar:

#### Para domínios específicos:
- **Backend**: `http://api.seudominio.com`
- **Frontend**: `http://app.seudominio.com`

#### Para localhost:
- **Frontend**: `http://localhost`
- **Backend**: `http://localhost/api/`

## Configurando SSL/HTTPS

### SSL Automático

O sistema configura automaticamente SSL quando você cria uma instância com URLs HTTPS:

```bash
# Criar instância com SSL automático
./manage-stacks.sh up -n codatende1 -b 3000 -f 3001 -u https://api.seudominio.com -w https://app.seudominio.com
```

**O que acontece automaticamente:**
1. ✅ **Nginx é configurado** para os domínios específicos
2. ✅ **Certificados SSL são solicitados** via Certbot
3. ✅ **Configurações HTTPS são criadas** e ativadas
4. ✅ **Redirecionamento HTTP→HTTPS** é configurado
5. ✅ **Stack fica disponível via HTTPS** imediatamente

### SSL Manual

Para configurar SSL manualmente ou para instâncias existentes:

```bash
# Configure SSL para sua stack
./manage-stacks.sh ssl -n codatende1 -u https://api.seudominio.com -w https://app.seudominio.com
```

## Comando Setup-Nginx

### Quando usar:

O comando `setup-nginx` é útil quando:

- ✅ **Stack já existe** mas Nginx não foi configurado
- ✅ **Nginx foi removido** manualmente e precisa ser reconfigurado
- ✅ **Certbot não está funcionando** e precisa ser reinstalado
- ✅ **Configuração básica foi perdida** e precisa ser recriada

### Como usar:

```bash
# Configurar Nginx e Certbot para uma stack existente
./manage-stacks.sh setup-nginx -n codatende1
```

### O que faz:

1. **Valida se a stack existe** no banco de dados
2. **Verifica se os containers estão rodando**
3. **Inicia o Nginx** (se não estiver rodando)
4. **Habilita Nginx** para iniciar automaticamente
5. **Instala/verifica Certbot**
6. **Configura renovação automática**
7. **Cria configuração básica** do Nginx
8. **Ativa a configuração** e recarrega o Nginx

### Exemplo de uso:

```bash
# 1. Criar stack sem Nginx (se necessário)
./manage-stacks.sh up -n codatende1 -b 3000 -f 3001

# 2. Configurar Nginx posteriormente
./manage-stacks.sh setup-nginx -n codatende1

# 3. Agora pode acessar via localhost
# Frontend: http://localhost
# Backend: http://localhost/api/

# 4. Configurar SSL quando tiver domínio
./manage-stacks.sh ssl -n codatende1 -u https://api.seudominio.com -w https://app.seudominio.com
```

## Comandos Úteis

### Verificar configurações SSL ativas:
```bash
./manage-stacks.sh list-ssl
```

### Renovar certificados:
```bash
# Renovar todos os certificados
./manage-stacks.sh renew-ssl

# Renovar certificado específico
./manage-stacks.sh renew-ssl -n codatende1
```

### Remover SSL:
```bash
./manage-stacks.sh remove-ssl -n codatende1
```

## Limpeza Automática

Quando você executa `./manage-stacks.sh down`:

- ✅ **Para os containers** Docker
- ✅ **Remove configuração básica** do Nginx
- ✅ **Remove instância** do arquivo JSON
- ✅ **Recarrega Nginx** (se outras configurações existirem)

## Arquivos Criados

### Configurações do Nginx:
- `/etc/nginx/sites-available/{stack_name}-basic` - Configuração básica HTTP
- `/etc/nginx/sites-available/{stack_name}-backend` - Configuração SSL para backend
- `/etc/nginx/sites-available/{stack_name}-frontend` - Configuração SSL para frontend

### Links simbólicos:
- `/etc/nginx/sites-enabled/{stack_name}-basic`
- `/etc/nginx/sites-enabled/{stack_name}-backend`
- `/etc/nginx/sites-enabled/{stack_name}-frontend`

### Certificados SSL:
- `/etc/letsencrypt/live/{domain}/` - Certificados Let's Encrypt

### Scripts de renovação:
- `/usr/local/bin/certbot-renew.sh` - Script de renovação automática
- `/etc/letsencrypt/cli.ini` - Configuração do Certbot

## Renovação Automática

O sistema configura automaticamente:

1. **Cron job** que executa diariamente às 12:00
2. **Script de renovação** que verifica e renova certificados
3. **Recarregamento automático** do Nginx após renovação

## Troubleshooting

### Nginx não inicia:
```bash
# Verificar status
sudo systemctl status nginx

# Verificar configuração
sudo nginx -t

# Ver logs
sudo journalctl -u nginx
```

### Certbot não funciona:
```bash
# Verificar instalação
certbot --version

# Testar renovação
sudo certbot renew --dry-run

# Ver certificados
sudo certbot certificates
```

### Configuração não carrega:
```bash
# Verificar links simbólicos
ls -la /etc/nginx/sites-enabled/

# Verificar configurações
ls -la /etc/nginx/sites-available/

# Recarregar Nginx
sudo systemctl reload nginx
```

## Segurança

### Headers de Segurança Configurados:
- `Strict-Transport-Security` - Força HTTPS
- `X-Frame-Options` - Previne clickjacking
- `X-Content-Type-Options` - Previne MIME sniffing
- `X-XSS-Protection` - Proteção XSS

### Configurações SSL:
- Protocolos: TLSv1.2, TLSv1.3
- Ciphers seguros configurados
- Session cache otimizado
- Preferência por ciphers do servidor

## Exemplo Completo

```bash
# 1. Subir stack com URLs específicas (configura Nginx automaticamente)
./manage-stacks.sh up -n codatende1 -b 3000 -f 3001 -u https://api.seudominio.com -w https://app.seudominio.com

# 2. Acessar via HTTP (domínios devem apontar para o servidor)
# Backend: http://api.seudominio.com
# Frontend: http://app.seudominio.com

# 3. Configurar SSL (usa as mesmas URLs)
./manage-stacks.sh ssl -n codatende1 -u https://api.seudominio.com -w https://app.seudominio.com

# 4. Acessar via HTTPS
# Backend: https://api.seudominio.com
# Frontend: https://app.seudominio.com

# 5. Verificar configurações
./manage-stacks.sh list-ssl

# 6. Parar stack (remove configurações automaticamente)
./manage-stacks.sh down -n codatende1
```

### Exemplo com localhost:

```bash
# 1. Subir stack com localhost
./manage-stacks.sh up -n codatende2 -b 4000 -f 4001

# 2. Acessar via HTTP
# Frontend: http://localhost
# Backend: http://localhost/api/

# 3. Configurar SSL com domínios
./manage-stacks.sh ssl -n codatende2 -u https://api2.seudominio.com -w https://app2.seudominio.com

# 4. Parar stack
./manage-stacks.sh down -n codatende2
```

### Exemplo com Setup-Nginx:

```bash
# 1. Subir stack (sem Nginx automático, se necessário)
./manage-stacks.sh up -n codatende2 -b 4000 -f 4001

# 2. Configurar Nginx posteriormente
./manage-stacks.sh setup-nginx -n codatende2

# 3. Acessar via HTTP
# Frontend: http://localhost
# Backend: http://localhost/api/

# 4. Configurar SSL
./manage-stacks.sh ssl -n codatende2 -u https://api2.seudominio.com -w https://app2.seudominio.com

# 5. Parar stack
./manage-stacks.sh down -n codatende2
```

## Notas Importantes

1. **Permissões**: O script precisa de `sudo` para configurar Nginx e Certbot
2. **Domínios**: Para SSL, os domínios devem apontar para o IP do servidor
3. **Porta 80**: Deve estar livre para o Certbot obter certificados
4. **Firewall**: Configure para permitir portas 80 e 443
5. **Backup**: As configurações são sobrescritas, faça backup se necessário
6. **URLs da Instância**: O Nginx usa as URLs definidas na criação da instância
7. **DNS**: Para domínios específicos, configure o DNS para apontar para o servidor
8. **Certificados**: Certificados SSL são criados automaticamente para os domínios configurados

## Suporte

Para problemas ou dúvidas:
1. Verifique os logs do Nginx: `sudo journalctl -u nginx`
2. Verifique os logs do Certbot: `sudo journalctl -u certbot`
3. Teste a configuração: `sudo nginx -t`
4. Verifique certificados: `sudo certbot certificates` 