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

# Arquivo de instâncias na root do projeto
PROJECT_ROOT=$(get_project_root)
INSTANCES_FILE="$PROJECT_ROOT/instances.json"

# Função para inicializar o arquivo de instâncias
init_instances_file() {
    if [[ ! -f "$INSTANCES_FILE" ]]; then
        echo '{"instances": {}}' > "$INSTANCES_FILE"
        echo -e "${GREEN}📄 Arquivo de instâncias criado: $INSTANCES_FILE${NC}"
    fi
}

# Função para salvar uma instância
save_instance() {
    local stack_name=$1
    local backend_port=$2
    local frontend_port=$3
    local backend_url=$4
    local frontend_url=$5
    local total_cpu=$6
    local total_memory=$7
    local enable_financial=$8
    local gerencianet_client_id=$9
    local gerencianet_client_secret=${10}
    local gerencianet_pix_key=${11}
    local color=${12}
    local tab_name=${13}
    
    init_instances_file
    
    # Atualiza o arquivo JSON usando jq
    if command -v jq &> /dev/null; then
        jq --arg name "$stack_name" \
           --arg created_at "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
           --arg updated_at "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
           --arg backend_port "$backend_port" \
           --arg frontend_port "$frontend_port" \
           --arg backend_url "$backend_url" \
           --arg frontend_url "$frontend_url" \
           --arg total_cpu "$total_cpu" \
           --arg total_memory "$total_memory" \
           --arg enable_financial "$enable_financial" \
           --arg gerencianet_client_id "$gerencianet_client_id" \
           --arg gerencianet_client_secret "$gerencianet_client_secret" \
           --arg gerencianet_pix_key "$gerencianet_pix_key" \
           --arg color "$color" \
           --arg tab_name "$tab_name" \
           '.instances[$name] = {
               "name": $name,
               "created_at": $created_at,
               "updated_at": $updated_at,
               "config": {
                   "backend_port": $backend_port,
                   "frontend_port": $frontend_port,
                   "backend_url": $backend_url,
                   "frontend_url": $frontend_url,
                   "total_cpu": $total_cpu,
                   "total_memory": $total_memory,
                   "enable_financial": $enable_financial,
                   "gerencianet_client_id": $gerencianet_client_id,
                   "gerencianet_client_secret": $gerencianet_client_secret,
                   "gerencianet_pix_key": $gerencianet_pix_key,
                   "color": $color,
                   "tab_name": $tab_name
               },
               "status": "running"
           }' "$INSTANCES_FILE" > "${INSTANCES_FILE}.tmp" && mv "${INSTANCES_FILE}.tmp" "$INSTANCES_FILE"
    else
        echo -e "${YELLOW}⚠️  Aviso: jq não encontrado. Instância não foi salva no arquivo JSON.${NC}"
    fi
}

# Função para carregar uma instância
load_instance() {
    local stack_name=$1
    
    if [[ ! -f "$INSTANCES_FILE" ]]; then
        return 1
    fi
    
    if command -v jq &> /dev/null; then
        local config=$(jq -r ".instances[\"$stack_name\"].config" "$INSTANCES_FILE" 2>/dev/null)
        if [[ "$config" != "null" ]]; then
            export STACK_NAME=$stack_name
            export BACKEND_PORT=$(echo "$config" | jq -r '.backend_port')
            export FRONTEND_PORT=$(echo "$config" | jq -r '.frontend_port')
            export BACKEND_URL=$(echo "$config" | jq -r '.backend_url')
            export FRONTEND_URL=$(echo "$config" | jq -r '.frontend_url')
            export TOTAL_CPU=$(echo "$config" | jq -r '.total_cpu')
            export TOTAL_MEMORY=$(echo "$config" | jq -r '.total_memory')
            export ENABLE_FINANCIAL=$(echo "$config" | jq -r '.enable_financial // "false"')
            export GERENCIANET_CLIENT_ID=$(echo "$config" | jq -r '.gerencianet_client_id // ""')
            export GERENCIANET_CLIENT_SECRET=$(echo "$config" | jq -r '.gerencianet_client_secret // ""')
            export GERENCIANET_PIX_KEY=$(echo "$config" | jq -r '.gerencianet_pix_key // ""')
            export COLOR=$(echo "$config" | jq -r '.color // "azul"')
            export TAB_NAME=$(echo "$config" | jq -r '.tab_name // "Codatende"')
            return 0
        fi
    fi
    
    return 1
}

# Função para atualizar uma instância
update_instance() {
    local stack_name=$1
    
    if command -v jq &> /dev/null; then
        jq --arg name "$stack_name" --arg updated_at "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" '.instances[$name].updated_at = $updated_at' "$INSTANCES_FILE" > "${INSTANCES_FILE}.tmp" && mv "${INSTANCES_FILE}.tmp" "$INSTANCES_FILE"
    fi
}

# Função para listar todas as instâncias
list_instances() {
    if [[ ! -f "$INSTANCES_FILE" ]]; then
        echo -e "${YELLOW}📭 Nenhuma instância encontrada.${NC}"
        return
    fi
    
    if command -v jq &> /dev/null; then
        echo -e "${YELLOW}📋 Instâncias salvas:${NC}\n"
        jq -r '.instances | to_entries[] | "Nome: \(.key)\n  Criada: \(.value.created_at)\n  Atualizada: \(.value.updated_at)\n  Backend: \(.value.config.backend_url)\n  Frontend: \(.value.config.frontend_url)\n  CPU: \(.value.config.total_cpu) cores\n  Memória: \(.value.config.total_memory)MB\n  Módulo financeiro: \(.value.config.enable_financial // "false")\n  Status: \(.value.status)\n"' "$INSTANCES_FILE"
    else
        echo -e "${YELLOW}⚠️  jq não encontrado. Não é possível listar instâncias.${NC}"
    fi
}

# Função para remover uma instância
remove_instance() {
    local stack_name=$1
    
    if command -v jq &> /dev/null; then
        jq --arg name "$stack_name" 'del(.instances[$name])' "$INSTANCES_FILE" > "${INSTANCES_FILE}.tmp" && mv "${INSTANCES_FILE}.tmp" "$INSTANCES_FILE"
        echo -e "${GREEN}🗑️  Instância $stack_name removida do arquivo.${NC}"
    else
        echo -e "${YELLOW}⚠️  jq não encontrado. Instância não foi removida do arquivo.${NC}"
    fi
}

# Função para validar se a instância existe no banco
validate_instance() {
    local stack_name=$1
    local command_name=$2
    
    if [[ ! -f "$INSTANCES_FILE" ]]; then
        echo -e "${RED}❌ Erro: Arquivo de instâncias não encontrado.${NC}"
        echo -e "${YELLOW}💡 Use 'up' para criar uma nova instância primeiro.${NC}"
        exit 1
    fi
    
    if command -v jq &> /dev/null; then
        local exists=$(jq -r ".instances[\"$stack_name\"]" "$INSTANCES_FILE" 2>/dev/null)
        if [[ "$exists" == "null" ]]; then
            echo -e "${RED}❌ Erro: Instância '$stack_name' não encontrada no banco de dados.${NC}"
            echo -e "\n${YELLOW}📋 Instâncias disponíveis:${NC}"
            list_instances
            echo -e "\n${YELLOW}🔧 Comandos disponíveis:${NC}"
            echo -e "  🚀 ./manage-stacks.sh up -n $stack_name${NC}     # 🚀 Criar nova instância"
            echo -e "  📋 ./manage-stacks.sh instances${NC}              # 📋 Ver todas as instâncias"
            echo -e "  📊 ./manage-stacks.sh list${NC}                   # 📊 Ver stacks Docker"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  Aviso: jq não encontrado. Validação de instância desabilitada.${NC}"
    fi
} 