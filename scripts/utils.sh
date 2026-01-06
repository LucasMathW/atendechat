#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Função para verificar se uma porta está em uso
check_port_usage() {
    local port=$1
    local service_name=$2
    
    echo -e "${YELLOW}🔍 Verificando se a porta $port está disponível para $service_name...${NC}"
    
    # Verifica se a porta está em uso no sistema
    if command -v lsof &> /dev/null; then
        # Usa lsof para verificar se a porta está em uso
        local port_in_use=$(lsof -i :$port 2>/dev/null | grep LISTEN)
        if [[ -n "$port_in_use" ]]; then
            echo -e "${RED}❌ Erro: Porta $port já está em uso!${NC}"
            echo -e "${YELLOW}📋 Processos usando a porta $port:${NC}"
            lsof -i :$port 2>/dev/null | grep LISTEN | while read line; do
                echo -e "  ${RED}  $line${NC}"
            done
            echo -e "\n${YELLOW}💡 Soluções:${NC}"
            echo -e "  1. Pare o processo que está usando a porta $port"
            echo -e "  2. Use uma porta diferente: -b $((port+1)) para backend ou -f $((port+1)) para frontend"
            echo -e "  3. Verifique se há outra instância rodando: ./manage-stacks.sh list"
            return 1
        fi
    elif command -v netstat &> /dev/null; then
        # Fallback para netstat
        local port_in_use=$(netstat -tuln 2>/dev/null | grep ":$port ")
        if [[ -n "$port_in_use" ]]; then
            echo -e "${RED}❌ Erro: Porta $port já está em uso!${NC}"
            echo -e "${YELLOW}📋 Porta $port está ocupada no sistema${NC}"
            echo -e "\n${YELLOW}💡 Soluções:${NC}"
            echo -e "  1. Pare o processo que está usando a porta $port"
            echo -e "  2. Use uma porta diferente: -b $((port+1)) para backend ou -f $((port+1)) para frontend"
            echo -e "  3. Verifique se há outra instância rodando: ./manage-stacks.sh list"
            return 1
        fi
    elif command -v ss &> /dev/null; then
        # Fallback para ss (socket statistics)
        local port_in_use=$(ss -tuln 2>/dev/null | grep ":$port ")
        if [[ -n "$port_in_use" ]]; then
            echo -e "${RED}❌ Erro: Porta $port já está em uso!${NC}"
            echo -e "${YELLOW}📋 Porta $port está ocupada no sistema${NC}"
            echo -e "\n${YELLOW}💡 Soluções:${NC}"
            echo -e "  1. Pare o processo que está usando a porta $port"
            echo -e "  2. Use uma porta diferente: -b $((port+1)) para backend ou -f $((port+1)) para frontend"
            echo -e "  3. Verifique se há outra instância rodando: ./manage-stacks.sh list"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  Aviso: Não foi possível verificar se a porta $port está em uso (lsof/netstat/ss não encontrados)${NC}"
        echo -e "${YELLOW}💡 Verifique manualmente se a porta $port está disponível${NC}"
    fi
    
    echo -e "${GREEN}✅ Porta $port está disponível para $service_name${NC}"
    return 0
}

# Função para verificar se as portas estão em uso (backend e frontend)
validate_ports() {
    local backend_port=$1
    local frontend_port=$2
    
    echo -e "${YELLOW}🔍 Verificando disponibilidade das portas...${NC}"
    
    # Verifica se as portas são iguais
    if [[ "$backend_port" == "$frontend_port" ]]; then
        echo -e "${RED}❌ Erro: Backend e frontend não podem usar a mesma porta ($backend_port)!${NC}"
        echo -e "${YELLOW}💡 Use portas diferentes para backend e frontend${NC}"
        return 1
    fi
    
    # Verifica se as portas são válidas (entre 1 e 65535)
    if ! [[ "$backend_port" =~ ^[0-9]+$ ]] || [[ "$backend_port" -lt 1 ]] || [[ "$backend_port" -gt 65535 ]]; then
        echo -e "${RED}❌ Erro: Porta do backend ($backend_port) não é válida!${NC}"
        echo -e "${YELLOW}💡 Use uma porta entre 1 e 65535${NC}"
        return 1
    fi
    
    if ! [[ "$frontend_port" =~ ^[0-9]+$ ]] || [[ "$frontend_port" -lt 1 ]] || [[ "$frontend_port" -gt 65535 ]]; then
        echo -e "${RED}❌ Erro: Porta do frontend ($frontend_port) não é válida!${NC}"
        echo -e "${YELLOW}💡 Use uma porta entre 1 e 65535${NC}"
        return 1
    fi
    
    # Verifica se as portas estão em uso
    local backend_ok=false
    local frontend_ok=false
    
    if check_port_usage "$backend_port" "backend"; then
        backend_ok=true
    fi
    
    if check_port_usage "$frontend_port" "frontend"; then
        frontend_ok=true
    fi
    
    # Retorna sucesso apenas se ambas as portas estiverem disponíveis
    if [[ "$backend_ok" == "true" && "$frontend_ok" == "true" ]]; then
        echo -e "${GREEN}✅ Todas as portas estão disponíveis!${NC}"
        return 0
    else
        return 1
    fi
}

# Função para verificar dependências do sistema
check_dependencies() {
    echo -e "${YELLOW}🔍 Verificando dependências do sistema...${NC}"
    
    local missing_deps=()
    
    # Verifica Docker
    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
    fi
    
    # Verifica Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        missing_deps+=("docker-compose")
    fi
    
    # Verifica jq (opcional, mas recomendado)
    if ! command -v jq &> /dev/null; then
        echo -e "${YELLOW}⚠️  Aviso: jq não encontrado. Algumas funcionalidades serão limitadas.${NC}"
        echo -e "${YELLOW}💡 Instale jq: brew install jq (macOS) ou apt-get install jq (Ubuntu)${NC}"
    fi
    
    # Verifica bc para cálculos
    if ! command -v bc &> /dev/null; then
        echo -e "${YELLOW}⚠️  Aviso: bc não encontrado. Cálculos de recursos podem falhar.${NC}"
        echo -e "${YELLOW}💡 Instale bc: brew install bc (macOS) ou apt-get install bc (Ubuntu)${NC}"
    fi
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        echo -e "${RED}❌ Dependências faltando: ${missing_deps[*]}${NC}"
        echo -e "${YELLOW}💡 Instale as dependências antes de continuar:${NC}"
        for dep in "${missing_deps[@]}"; do
            case $dep in
                "docker")
                    echo -e "  Docker: https://docs.docker.com/get-docker/"
                    ;;
                "docker-compose")
                    echo -e "  Docker Compose: https://docs.docker.com/compose/install/"
                    ;;
            esac
        done
        exit 1
    fi
    
    echo -e "${GREEN}✅ Todas as dependências principais estão instaladas${NC}"
}

# Função para verificar health dos serviços
check_service_health() {
    local stack_name=$1
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}🏥 Verificando health dos serviços...${NC}"
    
    # Verifica backend
    echo -e "  🔍 Verificando backend..."
    while [[ $attempt -le $max_attempts ]]; do
        if curl -s --max-time 5 "http://localhost:$BACKEND_PORT/health" > /dev/null 2>&1; then
            echo -e "    ${GREEN}✅ Backend está respondendo${NC}"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            echo -e "    ${RED}❌ Backend não está respondendo após $max_attempts tentativas${NC}"
            return 1
        fi
        
        echo -e "    ${YELLOW}⏳ Tentativa $attempt/$max_attempts...${NC}"
        sleep 2
        ((attempt++))
    done
    
    # Verifica frontend
    echo -e "  🔍 Verificando frontend..."
    attempt=1
    while [[ $attempt -le $max_attempts ]]; do
        if curl -s --max-time 5 "http://localhost:$FRONTEND_PORT" > /dev/null 2>&1; then
            echo -e "    ${GREEN}✅ Frontend está respondendo${NC}"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            echo -e "    ${RED}❌ Frontend não está respondendo após $max_attempts tentativas${NC}"
            return 1
        fi
        
        echo -e "    ${YELLOW}⏳ Tentativa $attempt/$max_attempts...${NC}"
        sleep 2
        ((attempt++))
    done
    
    echo -e "${GREEN}✅ Todos os serviços estão funcionando corretamente!${NC}"
    return 0
}

# Função para calcular recursos compartilhados
calculate_resources() {
    local total_cpu=$1
    local total_memory=$2
    
    # Função auxiliar para cálculos com fallback
    calculate_with_fallback() {
        local expression=$1
        local fallback=$2
        
        if command -v bc &> /dev/null; then
            echo "scale=2; $expression" | bc
        else
            # Fallback simples para cálculos básicos
            echo "$fallback"
        fi
    }
    
    # CPU é distribuída de acordo com a necessidade real de cada serviço
    # Backend: 40% (mais processamento)
    # PostgreSQL: 30% (banco de dados)
    # Frontend: 20% (interface)
    # Redis: 10% (cache)
    export BACKEND_CPU_LIMIT=$(calculate_with_fallback "$total_cpu * 0.4" "$(echo "$total_cpu * 0.4" | awk '{printf "%.2f", $1}')")
    export POSTGRES_CPU_LIMIT=$(calculate_with_fallback "$total_cpu * 0.3" "$(echo "$total_cpu * 0.3" | awk '{printf "%.2f", $1}')")
    export FRONTEND_CPU_LIMIT=$(calculate_with_fallback "$total_cpu * 0.2" "$(echo "$total_cpu * 0.2" | awk '{printf "%.2f", $1}')")
    export REDIS_CPU_LIMIT=$(calculate_with_fallback "$total_cpu * 0.1" "$(echo "$total_cpu * 0.1" | awk '{printf "%.2f", $1}')")
    
    # Reservas de CPU são 50% dos limites
    export BACKEND_CPU_RESERVE=$(calculate_with_fallback "$BACKEND_CPU_LIMIT * 0.5" "$(echo "$BACKEND_CPU_LIMIT * 0.5" | awk '{printf "%.2f", $1}')")
    export POSTGRES_CPU_RESERVE=$(calculate_with_fallback "$POSTGRES_CPU_LIMIT * 0.5" "$(echo "$POSTGRES_CPU_LIMIT * 0.5" | awk '{printf "%.2f", $1}')")
    export FRONTEND_CPU_RESERVE=$(calculate_with_fallback "$FRONTEND_CPU_LIMIT * 0.5" "$(echo "$FRONTEND_CPU_LIMIT * 0.5" | awk '{printf "%.2f", $1}')")
    export REDIS_CPU_RESERVE=$(calculate_with_fallback "$REDIS_CPU_LIMIT * 0.5" "$(echo "$REDIS_CPU_LIMIT * 0.5" | awk '{printf "%.2f", $1}')")
    
    # Memória é distribuída proporcionalmente
    export BACKEND_MEM_LIMIT=$(calculate_with_fallback "$total_memory * 0.4" "$(echo "$total_memory * 0.4" | awk '{printf "%.1f", $1}')")
    export FRONTEND_MEM_LIMIT=$(calculate_with_fallback "$total_memory * 0.2" "$(echo "$total_memory * 0.2" | awk '{printf "%.1f", $1}')")
    export POSTGRES_MEM_LIMIT=$(calculate_with_fallback "$total_memory * 0.3" "$(echo "$total_memory * 0.3" | awk '{printf "%.1f", $1}')")
    export REDIS_MEM_LIMIT=$(calculate_with_fallback "$total_memory * 0.1" "$(echo "$total_memory * 0.1" | awk '{printf "%.1f", $1}')")
    
    # Reservas de memória são 50% dos limites
    export BACKEND_MEM_RESERVE=$(calculate_with_fallback "$BACKEND_MEM_LIMIT * 0.5" "$(echo "$BACKEND_MEM_LIMIT * 0.5" | awk '{printf "%.1f", $1}')")
    export FRONTEND_MEM_RESERVE=$(calculate_with_fallback "$FRONTEND_MEM_LIMIT * 0.5" "$(echo "$FRONTEND_MEM_LIMIT * 0.5" | awk '{printf "%.1f", $1}')")
    export POSTGRES_MEM_RESERVE=$(calculate_with_fallback "$POSTGRES_MEM_LIMIT * 0.5" "$(echo "$POSTGRES_MEM_LIMIT * 0.5" | awk '{printf "%.1f", $1}')")
    export REDIS_MEM_RESERVE=$(calculate_with_fallback "$REDIS_MEM_LIMIT * 0.5" "$(echo "$REDIS_MEM_LIMIT * 0.5" | awk '{printf "%.1f", $1}')")
}

# Função para definir variáveis de ambiente padrão
set_default_env_vars() {
    export STACK_NAME=${STACK_NAME:-codatende}
    export BACKEND_PORT=${BACKEND_PORT:-3000}
    export FRONTEND_PORT=${FRONTEND_PORT:-3001}
    export BACKEND_URL=${BACKEND_URL:-http://localhost:$BACKEND_PORT}
    export FRONTEND_URL=${FRONTEND_URL:-http://localhost:$FRONTEND_PORT}
    export TOTAL_CPU=${TOTAL_CPU:-2}
    export TOTAL_MEMORY=${TOTAL_MEMORY:-2048}
    
    # Variáveis do módulo financeiro
    export ENABLE_FINANCIAL=${ENABLE_FINANCIAL:-false}
    export GERENCIANET_SANDBOX=${GERENCIANET_SANDBOX:-false}
    export GERENCIANET_PIX_CERT=${GERENCIANET_PIX_CERT:-production-cert}
    export GERENCIANET_CLIENT_ID=${GERENCIANET_CLIENT_ID:-}
    export GERENCIANET_CLIENT_SECRET=${GERENCIANET_CLIENT_SECRET:-}
    export GERENCIANET_PIX_KEY=${GERENCIANET_PIX_KEY:-}
    
    # Define recursos padrão se não calculados
    export BACKEND_CPU_LIMIT=${BACKEND_CPU_LIMIT:-0.4}
    export POSTGRES_CPU_LIMIT=${POSTGRES_CPU_LIMIT:-0.3}
    export FRONTEND_CPU_LIMIT=${FRONTEND_CPU_LIMIT:-0.2}
    export REDIS_CPU_LIMIT=${REDIS_CPU_LIMIT:-0.1}
    export BACKEND_CPU_RESERVE=${BACKEND_CPU_RESERVE:-0.2}
    export POSTGRES_CPU_RESERVE=${POSTGRES_CPU_RESERVE:-0.15}
    export FRONTEND_CPU_RESERVE=${FRONTEND_CPU_RESERVE:-0.1}
    export REDIS_CPU_RESERVE=${REDIS_CPU_RESERVE:-0.05}
    export BACKEND_MEM_LIMIT=${BACKEND_MEM_LIMIT:-409.6}
    export FRONTEND_MEM_LIMIT=${FRONTEND_MEM_LIMIT:-204.8}
    export POSTGRES_MEM_LIMIT=${POSTGRES_MEM_LIMIT:-307.2}
    export REDIS_MEM_LIMIT=${REDIS_MEM_LIMIT:-102.4}
    export BACKEND_MEM_RESERVE=${BACKEND_MEM_RESERVE:-204.8}
    export FRONTEND_MEM_RESERVE=${FRONTEND_MEM_RESERVE:-102.4}
    export POSTGRES_MEM_RESERVE=${POSTGRES_MEM_RESERVE:-153.6}
    export REDIS_MEM_RESERVE=${REDIS_MEM_RESERVE:-51.2}
} 