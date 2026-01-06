# 🔐 Configuração SSL/HTTPS - Atendechat

Este documento explica como configurar SSL/HTTPS para suas instâncias do Atendechat usando Nginx e Certbot.

## 🚀 Inicialização Automática

Na primeira execução, o sistema automaticamente:

1. **Instala dependências** (Docker, Docker Compose, Nginx, Certbot)
2. **Configura Nginx** com templates otimizados
3. **Configura Certbot** para renovação automática
4. **Cria scripts** de renovação e cron jobs

## 📋 Pré-requisitos

- **Domínio configurado** apontando para o servidor
- **Porta 80 e 443** liberadas no firewall
- **Acesso root/sudo** para instalação

## 🔧 Comandos SSL

### Configurar SSL para uma instância

```bash
# Configurar SSL para uma instância existente
./manage-stacks.sh ssl -n codatende1 -d app.exemplo.com

# Exemplo com domínio específico
./manage-stacks.sh ssl --name codatende2 --domain api.exemplo.com
```

### Renovar certificados

```bash
# Renovar certificado de uma instância específica
./manage-stacks.sh renew-ssl -n codatende1

# Renovar todos os certificados
./manage-stacks.sh renew-ssl
```

### Listar configurações SSL

```bash
# Listar todas as configurações SSL ativas
./manage-stacks.sh list-ssl
```

### Remover SSL

```bash
# Remover SSL de uma instância
./manage-stacks.sh remove-ssl -n codatende1
```

## 🌐 Configuração do Nginx

O sistema cria automaticamente:

### Template de Configuração
- **Localização**: `/etc/nginx/sites-available/codatende-template`
- **Configurações SSL** otimizadas
- **Headers de segurança** (HSTS, X-Frame-Options, etc.)
- **Proxy reverso** para backend e frontend
- **Suporte a WebSocket** para Socket.IO

### Configuração por Instância
- **Localização**: `/etc/nginx/sites-available/{stack_name}`
- **Link simbólico**: `/etc/nginx/sites-enabled/{stack_name}`
- **Substituição automática** de variáveis

## 🔐 Certificados SSL

### Certbot Configuration
- **Arquivo**: `/etc/letsencrypt/cli.ini`
- **Renovação automática** configurada
- **Hooks** para recarregar Nginx

### Renovação Automática
- **Script**: `/usr/local/bin/certbot-renew.sh`
- **Cron job**: Diariamente às 12:00
- **Log**: `/var/log/certbot-renew.log`

## 📁 Estrutura de Arquivos

```
/etc/nginx/
├── sites-available/
│   ├── codatende-template    # Template base
│   ├── codatende1           # Configuração da instância 1
│   └── codatende2           # Configuração da instância 2
└── sites-enabled/
    ├── codatende1 -> ../sites-available/codatende1
    └── codatende2 -> ../sites-available/codatende2

/etc/letsencrypt/
├── cli.ini                  # Configuração do Certbot
└── live/
    ├── app.exemplo.com/     # Certificados do domínio 1
    └── api.exemplo.com/     # Certificados do domínio 2

/usr/local/bin/
└── certbot-renew.sh         # Script de renovação
```

## 🔄 Fluxo de Configuração SSL

1. **Validação da instância** - Verifica se existe
2. **Carregamento da configuração** - Portas backend/frontend
3. **Criação da configuração Nginx** - Baseada no template
4. **Obtenção do certificado SSL** - Via Certbot
5. **Ativação do site** - Link simbólico e reload

## 🛡️ Segurança

### Headers Configurados
- **Strict-Transport-Security**: Força HTTPS
- **X-Frame-Options**: Previne clickjacking
- **X-Content-Type-Options**: Previne MIME sniffing
- **X-XSS-Protection**: Proteção XSS

### Configurações SSL
- **Protocolos**: TLSv1.2, TLSv1.3
- **Ciphers**: ECDHE-RSA-AES256-GCM-SHA512, etc.
- **Session cache**: 10 minutos
- **Prefer server ciphers**: Desabilitado

## 🔍 Troubleshooting

### Certificado não obtido
```bash
# Verificar se o domínio está apontando para o servidor
nslookup app.exemplo.com

# Verificar se a porta 80 está livre
sudo netstat -tuln | grep :80

# Testar Certbot manualmente
sudo certbot certonly --standalone -d app.exemplo.com --dry-run
```

### Nginx não carrega
```bash
# Testar configuração
sudo nginx -t

# Verificar logs
sudo tail -f /var/log/nginx/error.log

# Verificar status
sudo systemctl status nginx
```

### Renovação falha
```bash
# Verificar cron job
sudo crontab -l

# Executar renovação manual
sudo /usr/local/bin/certbot-renew.sh

# Verificar logs
sudo tail -f /var/log/certbot-renew.log
```

## 📝 Logs Importantes

- **Nginx**: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- **Certbot**: `/var/log/letsencrypt/`
- **Renovação**: `/var/log/certbot-renew.log`

## 🔧 Comandos Úteis

```bash
# Verificar certificados
sudo certbot certificates

# Testar renovação
sudo certbot renew --dry-run

# Verificar configuração Nginx
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx

# Verificar status dos serviços
sudo systemctl status nginx
sudo systemctl status certbot.timer
```

## 📞 Suporte

Para problemas com SSL/HTTPS:

1. **Verifique os logs** mencionados acima
2. **Teste manualmente** os comandos do troubleshooting
3. **Verifique a conectividade** do domínio
4. **Confirme as permissões** dos arquivos

---

**Nota**: O sistema é projetado para ser resiliente e automático. Certificados são renovados automaticamente e o Nginx é recarregado quando necessário. 