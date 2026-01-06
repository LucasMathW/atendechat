#!/bin/bash

# Obtém o diretório raiz do projeto (onde está o manage-stacks.sh)
get_project_root() {
    # Se estamos executando do manage-stacks.sh, o diretório atual é a root
    if [[ -f "manage-stacks.sh" ]]; then
        echo "$(pwd)"
    else
        # Se estamos executando de dentro de scripts/, sobe um nível
        echo "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
    fi
}

# Define o diretório raiz do projeto
PROJECT_ROOT=$(get_project_root)

# Carrega os módulos
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils.sh"
source "$SCRIPT_DIR/instances.sh"
source "$SCRIPT_DIR/stacks.sh"
source "$SCRIPT_DIR/nginx.sh"

# Função para mostrar ajuda
show_help() {
    echo -e "${YELLOW}🐳 Gerenciador de Stacks Docker${NC}"
    echo -e "\n${GREEN}📖 Uso:${NC}"
    echo -e "  $0 up [OPÇÕES]"
    echo -e "  $0 down [OPÇÕES]"
    echo -e "  $0 update [OPÇÕES]"
    echo -e "  $0 list"
    echo -e "  $0 instances"
    echo -e "  $0 logs [OPÇÕES]"
    echo -e "  $0 status [OPÇÕES]"
    echo -e "  $0 restart [OPÇÕES]"
    echo -e "\n${GREEN}🔧 Comandos:${NC}"
    echo -e "  🚀 up        - Inicia uma nova stack (salva configuração)"
    echo -e "  🛑 down      - Para uma stack"
    echo -e "  🔄 update    - Atualiza e rebuilda imagens Docker (preserva configuração)"
    echo -e "  📊 list      - Lista todas as stacks Docker"
    echo -e "  📋 instances - Lista todas as instâncias salvas"
    echo -e "  📝 logs      - Mostra logs de uma stack"
    echo -e "  📈 status    - Mostra status de uma stack"
    echo -e "  🔄 restart   - Reinicia uma stack"
    echo -e "  🌐 nginx     - Gerencia configurações do Nginx"
    echo -e "  🔐 ssl       - Gerencia certificados SSL"
    echo -e "\n${GREEN}⚙️  Opções para 'up':${NC}"
    echo -e "  -n, --name STACK_NAME     Nome da stack (padrão: codatende)"
    echo -e "  -b, --backend-port PORT   Porta do backend (padrão: 3000)"
    echo -e "  -f, --frontend-port PORT  Porta do frontend (padrão: 3001)"
    echo -e "  -u, --backend-url URL     URL do backend (padrão: http://localhost:PORT)"
    echo -e "  -w, --frontend-url URL    URL do frontend (padrão: http://localhost:PORT)"
    echo -e "  -c, --cpu CORES           Total de cores CPU (padrão: 2)"
    echo -e "  -m, --memory MB           Total de memória em MB (padrão: 2048)"
    echo -e "  --color COLOR             Cor do tema (padrão: azul)"
    echo -e "  --tab-name NAME           Nome da aba (padrão: Codatende)"
    echo -e "\n${GREEN}💰 Opções do módulo financeiro:${NC}"
    echo -e "  -e, --enable-financial    Habilita o módulo financeiro (padrão: desabilitado)"
    echo -e "  -g, --gerencianet-client-id ID      Client ID do Gerencianet"
    echo -e "  -s, --gerencianet-client-secret SECRET  Client Secret do Gerencianet"
    echo -e "  -p, --gerencianet-pix-key KEY       Chave PIX do Gerencianet"
    echo -e "\n${GREEN}⚙️  Opções para outros comandos:${NC}"
    echo -e "  -n, --name STACK_NAME     Nome da stack (padrão: codatende)"
    echo -e "\n${GREEN}💡 Exemplos:${NC}"
    echo -e "  # 🚀 Criar nova instância (salva configuração automaticamente)"
    echo -e "  $0 up -n codatende1 -b 3000 -f 3001"
    echo -e "  $0 up --name codatende2 --backend-port 4000 --frontend-port 4001"
    echo -e "  $0 up -n codatende3 -b 5000 -f 5001 -c 2 -m 2048"
    echo -e "  $0 up -n codatende4 -u https://api.exemplo.com -w https://app.exemplo.com"
    echo -e "  $0 up -n codatende5 --color verde --tab-name 'Meu Chat'"
    echo -e "\n  # 💰 Criar instância com módulo financeiro habilitado"
    echo -e "  $0 up -n codatende-finance -e -g CLIENT_ID -s CLIENT_SECRET -p PIX_KEY"
    echo -e "  $0 up --name codatende-finance --enable-financial --gerencianet-client-id CLIENT_ID --gerencianet-client-secret CLIENT_SECRET --gerencianet-pix-key PIX_KEY"
    echo -e "\n  # 🔄 Atualizar instância (usa configuração salva)"
    echo -e "  $0 update -n codatende1"
    echo -e "  $0 update codatende1"
    echo -e "\n  # 🔄 Atualizar com novos parâmetros (atualiza configuração)"
    echo -e "  $0 update -n codatende1 -c 4 -m 4096"
    echo -e "\n  # 💰 Atualizar módulo financeiro"
    echo -e "  $0 update -n codatende1 -e -g NEW_CLIENT_ID -s NEW_CLIENT_SECRET -p NEW_PIX_KEY"
    echo -e "\n  # 🛠️  Gerenciar instâncias"
    echo -e "  $0 instances                    # 📋 Lista instâncias salvas"
    echo -e "  $0 down -n codatende1          # 🛑 Para e remove do arquivo"
    echo -e "  $0 logs -n codatende1"
    echo -e "  $0 status -n codatende1"
    echo -e "  $0 restart -n codatende1"
    echo -e "\n${YELLOW}🔄 Formato alternativo (compatibilidade):${NC}"
    echo -e "  $0 up codatende1 3000 3001"
    echo -e "  $0 down codatende1"
    echo -e "  $0 logs codatende1"
    echo -e "  $0 status codatende1"
    echo -e "  $0 restart codatende1"
    echo -e "\n${BLUE}📝 Nota:${NC} As configurações são salvas automaticamente em instances.json"
    echo -e "      O comando update preserva as configurações originais"
    echo -e "      Use parâmetros no update para alterar configurações"
    echo -e "\n${BLUE}🔍 Verificação de Portas:${NC}"
    echo -e "      Os comandos 'up' e 'update' verificam automaticamente se as portas estão disponíveis"
    echo -e "      Se uma porta estiver em uso, o script mostrará quais processos estão usando"
    echo -e "      Use 'lsof -i :PORTA' ou 'netstat -tuln | grep :PORTA' para verificar manualmente"
    echo -e "      Portas válidas: 1-65535 (evite portas privilegiadas < 1024)"
}

# Função para processar argumentos
parse_args() {
    local args=("$@")
    local i=0
    
    # Valores padrão
    STACK_NAME="codatende"
    BACKEND_PORT="3000"
    FRONTEND_PORT="3001"
    BACKEND_URL=""
    FRONTEND_URL=""
    TOTAL_CPU="2"
    TOTAL_MEMORY="2048"
    COLOR="#682EE3"
    TAB_NAME="Atendechat"
    
    # Variáveis do módulo financeiro
    ENABLE_FINANCIAL="false"
    GERENCIANET_SANDBOX="false"
    GERENCIANET_PIX_CERT="production-cert"
    GERENCIANET_CLIENT_ID=""
    GERENCIANET_CLIENT_SECRET=""
    GERENCIANET_PIX_KEY=""
    
    # Verifica se o primeiro argumento não é uma flag (compatibilidade com formato antigo)
    if [[ ${#args[@]} -gt 0 && ! "${args[0]}" =~ ^- ]]; then
        STACK_NAME="${args[0]}"
        if [[ ${#args[@]} -gt 1 ]]; then
            BACKEND_PORT="${args[1]}"
        fi
        if [[ ${#args[@]} -gt 2 ]]; then
            FRONTEND_PORT="${args[2]}"
        fi
        if [[ ${#args[@]} -gt 3 ]]; then
            BACKEND_URL="${args[3]}"
        fi
        if [[ ${#args[@]} -gt 4 ]]; then
            FRONTEND_URL="${args[4]}"
        fi
        if [[ ${#args[@]} -gt 5 ]]; then
            TOTAL_CPU="${args[5]}"
        fi
        if [[ ${#args[@]} -gt 6 ]]; then
            TOTAL_MEMORY="${args[6]}"
        fi
        return
    fi
    
    # Processa parâmetros nomeados
    while [[ $i -lt ${#args[@]} ]]; do
        case "${args[$i]}" in
            -n|--name)
                STACK_NAME="${args[$((i+1))]}"
                i=$((i+2))
                ;;
            -b|--backend-port)
                BACKEND_PORT="${args[$((i+1))]}"
                i=$((i+2))
                ;;
            -f|--frontend-port)
                FRONTEND_PORT="${args[$((i+1))]}"
                i=$((i+2))
                ;;
            -u|--backend-url)
                BACKEND_URL="${args[$((i+1))]}"
                i=$((i+2))
                ;;
            -w|--frontend-url)
                FRONTEND_URL="${args[$((i+1))]}"
                i=$((i+2))
                ;;
            -c|--cpu)
                TOTAL_CPU="${args[$((i+1))]}"
                i=$((i+2))
                ;;
            -m|--memory)
                TOTAL_MEMORY="${args[$((i+1))]}"
                i=$((i+2))
                ;;
            --color)
                COLOR="${args[$((i+1))]}"
                i=$((i+2))
                ;;
            --tab-name)
                TAB_NAME="${args[$((i+1))]}"
                i=$((i+2))
                ;;
            -e|--enable-financial)
                ENABLE_FINANCIAL="true"
                i=$((i+1))
                ;;
            -g|--gerencianet-client-id)
                GERENCIANET_CLIENT_ID="${args[$((i+1))]}"
                i=$((i+2))
                ;;
            -s|--gerencianet-client-secret)
                GERENCIANET_CLIENT_SECRET="${args[$((i+1))]}"
                i=$((i+2))
                ;;
            -p|--gerencianet-pix-key)
                GERENCIANET_PIX_KEY="${args[$((i+1))]}"
                i=$((i+2))
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                i=$((i+1))
                ;;
        esac
    done
    
    # Define URLs padrão se não fornecidas
    if [[ -z "$BACKEND_URL" ]]; then
        BACKEND_URL="http://localhost:$BACKEND_PORT"
    fi
    if [[ -z "$FRONTEND_URL" ]]; then
        FRONTEND_URL="http://localhost:$FRONTEND_PORT"
    fi
}

# Verifica se foi fornecido um comando
if [[ $# -eq 0 ]]; then
    show_help
    exit 1
fi

# Menu principal
case "$1" in
    "up")
        shift  # Remove o comando "up" dos argumentos
        parse_args "$@"
        up_stack
        ;;
    "down")
        shift  # Remove o comando "down" dos argumentos
        parse_args "$@"
        down_stack
        ;;
    "update")
        shift  # Remove o comando "update" dos argumentos
        parse_args "$@"
        update_stack "$@"
        ;;
    "list")
        list_stacks
        ;;
    "instances")
        list_instances
        ;;
    "logs")
        shift  # Remove o comando "logs" dos argumentos
        parse_args "$@"
        logs_stack
        ;;
    "status")
        shift  # Remove o comando "status" dos argumentos
        parse_args "$@"
        status_stack
        ;;
    "restart")
        shift  # Remove o comando "restart" dos argumentos
        parse_args "$@"
        restart_stack
        ;;
    "nginx")
        shift  # Remove o comando "nginx" dos argumentos
        case "$1" in
            "status")
                check_nginx_status
                ;;
            "list")
                list_nginx_configs
                ;;
            "reload")
                if sudo nginx -t; then
                    sudo systemctl reload nginx 2>/dev/null || sudo service nginx reload 2>/dev/null
                    echo -e "${GREEN}✅ Nginx recarregado${NC}"
                else
                    echo -e "${RED}❌ Configuração do Nginx inválida${NC}"
                fi
                ;;
            *)
                echo -e "${YELLOW}🌐 Comandos do Nginx:${NC}"
                echo -e "  status  - Verifica status do Nginx"
                echo -e "  list    - Lista configurações"
                echo -e "  reload  - Recarrega configuração"
                ;;
        esac
        ;;
    "ssl")
        shift  # Remove o comando "ssl" dos argumentos
        case "$1" in
            "renew")
                renew_ssl_certificates
                ;;
            "list")
                echo -e "${YELLOW}📋 Certificados SSL:${NC}"
                if command -v certbot &> /dev/null; then
                    sudo certbot certificates
                else
                    echo -e "  ${RED}❌ Certbot não está instalado${NC}"
                fi
                ;;
            *)
                echo -e "${YELLOW}🔐 Comandos SSL:${NC}"
                echo -e "  renew   - Renova certificados SSL"
                echo -e "  list    - Lista certificados SSL"
                ;;
        esac
        ;;
    -h|--help)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Comando inválido: $1${NC}"
        echo -e "Use ${GREEN}$0 --help${NC} para ver as opções disponíveis"
        exit 1
        ;;
esac 