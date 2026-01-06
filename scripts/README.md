# Estrutura Modular dos Scripts

Este diretório contém a versão modular do gerenciador de stacks Docker, dividida em arquivos especializados para melhor organização e manutenção.

## 📁 Estrutura de Arquivos

```
scripts/
├── main.sh              # Script principal com menu e parsing de argumentos
├── utils.sh             # Funções utilitárias (cores, validações, dependências)
├── instances.sh         # Gerenciamento de instâncias (JSON)
├── stacks.sh            # Funções de gerenciamento de stacks Docker
├── nginx.sh             # Gerenciamento de Nginx e certificados SSL
├── install-nginx.sh     # Script de instalação do Nginx e Certbot
└── README.md            # Esta documentação
```

## 🔧 Arquivos

### `main.sh`
- **Função**: Script principal que orquestra todos os comandos
- **Conteúdo**:
  - Carregamento dos módulos
  - Menu principal de comandos
  - Função `show_help()` - Documentação completa
  - Função `parse_args()` - Processamento de argumentos
  - Lógica de roteamento de comandos

### `utils.sh`
- **Função**: Funções utilitárias e de validação
- **Conteúdo**:
  - Definição de cores para output
  - `check_port_usage()` - Verifica se porta está em uso
  - `validate_ports()` - Valida portas backend/frontend
  - `check_dependencies()` - Verifica dependências do sistema
  - `calculate_resources()` - Calcula distribuição de recursos
  - `set_default_env_vars()` - Define variáveis padrão

### `instances.sh`
- **Função**: Gerenciamento de instâncias salvas em JSON
- **Conteúdo**:
  - `init_instances_file()` - Inicializa arquivo JSON
  - `save_instance()` - Salva configuração de instância
  - `load_instance()` - Carrega configuração salva
  - `update_instance()` - Atualiza timestamp
  - `list_instances()` - Lista todas as instâncias
  - `remove_instance()` - Remove instância do arquivo
  - `validate_instance()` - Valida existência da instância

### `stacks.sh`
- **Função**: Operações com stacks Docker
- **Conteúdo**:
  - `rollback_stack()` - Rollback em caso de erro
  - `up_stack()` - Inicia nova stack (inclui configuração Nginx)
  - `down_stack()` - Para stack (remove configurações Nginx)
  - `list_stacks()` - Lista stacks Docker
  - `logs_stack()` - Mostra logs
  - `status_stack()` - Mostra status
  - `restart_stack()` - Reinicia stack
  - `update_stack()` - Atualiza imagens Docker

### `nginx.sh`
- **Função**: Gerenciamento de Nginx e certificados SSL
- **Conteúdo**:
  - `check_nginx_installed()` - Verifica instalação do Nginx/Certbot
  - `extract_domain()` - Extrai domínio de URLs
  - `validate_domain()` - Valida domínios para SSL
  - `create_nginx_config()` - Cria configurações de proxy reverso
  - `generate_ssl_certificates()` - Gera certificados SSL via Certbot
  - `remove_nginx_config()` - Remove configurações do Nginx
  - `renew_ssl_certificates()` - Renova certificados SSL
  - `list_nginx_configs()` - Lista configurações do Nginx
  - `check_nginx_status()` - Verifica status do Nginx

### `install-nginx.sh`
- **Função**: Script de instalação automática do Nginx e Certbot
- **Conteúdo**:
  - Detecção automática do sistema operacional
  - Instalação para Ubuntu/Debian, CentOS/RHEL e macOS
  - Configuração automática do Nginx
  - Configuração do Certbot com renovação automática
  - Configuração de firewall

## 🚀 Como Usar

### Instalação do Nginx e Certbot (Primeira vez)
```bash
# Instala Nginx e Certbot automaticamente
./scripts/install-nginx.sh
```

### Script Wrapper (Recomendado)
```bash
# Criar instância com domínios (SSL automático)
./manage-stacks.sh up -n codatende1 -u https://api.exemplo.com -w https://app.exemplo.com

# Criar instância local (sem SSL)
./manage-stacks.sh up -n codatende1 -b 3000 -f 3001

# Gerenciar Nginx
./manage-stacks.sh nginx status
./manage-stacks.sh nginx list
./manage-stacks.sh nginx reload

# Gerenciar SSL
./manage-stacks.sh ssl renew

# Outros comandos
./manage-stacks.sh instances
./manage-stacks.sh --help
```

### Script Principal Direto
```bash
./scripts/main.sh up -n codatende1 -b 3000 -f 3001
./scripts/main.sh instances
./scripts/main.sh --help
```

## 🔄 Migração do Script Original

O script original `manage-stacks.sh` foi dividido em módulos mantendo:
- ✅ Toda a funcionalidade original
- ✅ Compatibilidade com argumentos
- ✅ Mensagens e cores
- ✅ Validações e verificações
- ✅ Gerenciamento de instâncias

## 📝 Vantagens da Estrutura Modular

1. **Manutenibilidade**: Cada arquivo tem responsabilidade específica
2. **Legibilidade**: Código mais organizado e fácil de entender
3. **Reutilização**: Funções podem ser importadas independentemente
4. **Testabilidade**: Cada módulo pode ser testado separadamente
5. **Extensibilidade**: Fácil adicionar novos módulos ou funcionalidades

## 🛠️ Desenvolvimento

Para adicionar novas funcionalidades:

1. **Novas funções utilitárias**: Adicione em `utils.sh`
2. **Novas operações de stack**: Adicione em `stacks.sh`
3. **Novos comandos**: Adicione em `main.sh`
4. **Novas funcionalidades de instância**: Adicione em `instances.sh`

## 🔍 Debugging

Para debugar um módulo específico:
```bash
# Testar apenas utils
source scripts/utils.sh
check_dependencies

# Testar apenas instances
source scripts/instances.sh
list_instances
```

## 📋 Dependências

### Dependências Básicas
- Docker
- Docker Compose
- jq (opcional, mas recomendado)
- bc (para cálculos)
- curl (para health checks)

### Dependências para Nginx e SSL (Opcional)
- Nginx (instalado via `install-nginx.sh`)
- Certbot (instalado via `install-nginx.sh`)

## 🌐 Funcionalidades de Nginx e SSL

### Configuração Automática
- ✅ Criação automática de virtual hosts
- ✅ Proxy reverso para backend e frontend
- ✅ Geração automática de certificados SSL
- ✅ Remoção automática de configurações e certificados
- ✅ Configurações de segurança modernas
- ✅ Suporte a WebSocket
- ✅ Compressão Gzip
- ✅ Cache de arquivos estáticos

### Comandos de Gerenciamento
```bash
# Verificar status do Nginx
./manage-stacks.sh nginx status

# Listar configurações
./manage-stacks.sh nginx list

# Recarregar configuração
./manage-stacks.sh nginx reload

# Renovar certificados SSL
./manage-stacks.sh ssl renew

# Listar certificados SSL
./manage-stacks.sh ssl list
```

### Exemplo de Uso com Domínios
```bash
# Criar instância com domínios (SSL automático)
./manage-stacks.sh up -n codatende1 \
  -u https://api.exemplo.com \
  -w https://app.exemplo.com

# O sistema irá:
# 1. Criar configurações do Nginx
# 2. Gerar certificados SSL via Certbot
# 3. Configurar proxy reverso
# 4. Aplicar configurações de segurança
``` 