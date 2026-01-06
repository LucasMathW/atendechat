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

# Função para executar docker-compose sempre na root do projeto
docker_compose_exec() {
    local stack_name=$1
    shift
    cd "$PROJECT_ROOT" && docker-compose -p "$stack_name" "$@"
}

# Função para executar rollback em caso de erro
rollback_stack() {
    local stack_name=$1
    
    echo -e "${YELLOW}🔄 Executando rollback para stack $stack_name...${NC}"
    
    # Para todos os containers da stack
    echo -e "  📦 Parando containers..."
    docker_compose_exec $stack_name down --remove-orphans 2>/dev/null
    
    # Remove containers órfãos que possam ter sido criados
    echo -e "  🧹 Removendo containers órfãos..."
    docker ps -a --filter "name=${stack_name}_" --format "{{.ID}}" | xargs -r docker rm -f 2>/dev/null
    
    # Remove networks órfãs
    echo -e "  🌐 Removendo networks órfãs..."
    docker network ls --filter "name=${stack_name}_" --format "{{.ID}}" | xargs -r docker network rm 2>/dev/null
    
    # Remove volumes órfãos (cuidado: isso remove dados)
    echo -e "  💾 Removendo volumes órfãos..."
    docker volume ls --filter "name=${stack_name}_" --format "{{.Name}}" | xargs -r docker volume rm 2>/dev/null
    
    # Remove imagens órfãs (não utilizadas)
    echo -e "  🖼️  Removendo imagens órfãs..."
    docker image prune -f 2>/dev/null
    
    # Remove configurações do Nginx e certificados SSL se existirem
    echo -e "  🌐 Removendo configurações do Nginx e certificados SSL..."
    remove_nginx_config "$stack_name" 2>/dev/null || true
    
    # Remove a instância do arquivo JSON se existir
    if command -v jq &> /dev/null; then
        local exists=$(jq -r ".instances[\"$stack_name\"]" "$INSTANCES_FILE" 2>/dev/null)
        if [[ "$exists" != "null" ]]; then
            echo -e "  📝 Removendo instância do arquivo..."
            remove_instance "$stack_name"
        fi
    fi
    
    echo -e "${GREEN}✅ Rollback concluído. Todos os recursos da stack $stack_name foram removidos.${NC}"
    echo -e "${YELLOW}💡 Dica: Verifique os logs para identificar o problema antes de tentar novamente.${NC}"
}

# Função para subir uma stack
up_stack() {
    # Verifica dependências primeiro
    check_dependencies
    
    # Calcula recursos compartilhados
    calculate_resources $TOTAL_CPU $TOTAL_MEMORY

    # Define as variáveis de ambiente
    export STACK_NAME=$STACK_NAME
    export BACKEND_PORT=$BACKEND_PORT
    export FRONTEND_PORT=$FRONTEND_PORT
    export BACKEND_URL=$BACKEND_URL
    export FRONTEND_URL=$FRONTEND_URL
    export COLOR=$COLOR
    export TAB_NAME=$TAB_NAME
    
    # Variáveis do módulo financeiro
    export ENABLE_FINANCIAL=$ENABLE_FINANCIAL
    export GERENCIANET_SANDBOX="false"
    export GERENCIANET_PIX_CERT="production-cert"
    export GERENCIANET_CLIENT_ID=$GERENCIANET_CLIENT_ID
    export GERENCIANET_CLIENT_SECRET=$GERENCIANET_CLIENT_SECRET
    export GERENCIANET_PIX_KEY=$GERENCIANET_PIX_KEY

    # Verifica se as portas estão disponíveis antes de prosseguir
    if ! validate_ports "$BACKEND_PORT" "$FRONTEND_PORT"; then
        echo -e "${RED}❌ Erro: Verificação de portas falhou. Abortando criação da stack.${NC}"
        exit 1
    fi

    echo -e "${BLUE}🚀 Iniciando stack $STACK_NAME...${NC}"
    echo -e "\n${YELLOW}⚙️  Configuração:${NC}"
    echo -e "Nome da stack:     ${GREEN}$STACK_NAME${NC}"
    echo -e "Backend:           ${GREEN}$BACKEND_URL${NC} (porta: $BACKEND_PORT)"
    echo -e "Frontend:          ${GREEN}$FRONTEND_URL${NC} (porta: $FRONTEND_PORT)"
    echo -e "Módulo financeiro: ${GREEN}$ENABLE_FINANCIAL${NC}"
    if [[ "$ENABLE_FINANCIAL" == "true" ]]; then
        echo -e "  Client ID:       ${GREEN}$GERENCIANET_CLIENT_ID${NC}"
        echo -e "  PIX Key:         ${GREEN}$GERENCIANET_PIX_KEY${NC}"
        echo -e "  Client Secret:   ${GREEN}[OCULTO]${NC}"
    fi
    echo -e "\n${YELLOW}💻 Recursos totais:${NC}"
    echo -e "CPU: ${GREEN}$TOTAL_CPU${NC} cores (compartilhados entre todos os serviços)"
    echo -e "Memória: ${GREEN}$TOTAL_MEMORY${NC}MB"
    echo -e "\n${YELLOW}📊 Distribuição de recursos:${NC}"
    echo -e "Backend:    CPU ${GREEN}$BACKEND_CPU_LIMIT${NC} cores (reserva: $BACKEND_CPU_RESERVE), Memória ${GREEN}$BACKEND_MEM_LIMIT${NC}MB (reserva: $BACKEND_MEM_RESERVE)"
    echo -e "Frontend:   CPU ${GREEN}$FRONTEND_CPU_LIMIT${NC} cores (reserva: $FRONTEND_CPU_RESERVE), Memória ${GREEN}$FRONTEND_MEM_LIMIT${NC}MB (reserva: $FRONTEND_MEM_RESERVE)"
    echo -e "PostgreSQL: CPU ${GREEN}$POSTGRES_CPU_LIMIT${NC} cores (reserva: $POSTGRES_CPU_RESERVE), Memória ${GREEN}$POSTGRES_MEM_LIMIT${NC}MB (reserva: $POSTGRES_MEM_RESERVE)"
    echo -e "Redis:      CPU ${GREEN}$REDIS_CPU_LIMIT${NC} cores (reserva: $REDIS_CPU_RESERVE), Memória ${GREEN}$REDIS_MEM_LIMIT${NC}MB (reserva: $REDIS_MEM_RESERVE)"
    
    # Sube a stack
    echo -e "\n${YELLOW}📦 Criando containers...${NC}"
    docker_compose_exec $STACK_NAME up -d --build

    if [ $? -eq 0 ]; then
        # Verifica se todos os serviços estão rodando
        echo -e "\n${YELLOW}🔍 Verificando status dos serviços...${NC}"
        sleep 5  # Aguarda um pouco para os serviços inicializarem
        
        local all_running=true
        local failed_services=""
        
        # Verifica cada serviço
        for service in backend frontend postgres redis; do
            local status=$(docker_compose_exec $STACK_NAME ps $service 2>/dev/null | grep -E "(Up|Exit)")
            if [[ -z "$status" ]] || [[ "$status" == *"Exit"* ]]; then
                all_running=false
                failed_services="$failed_services $service"
                echo -e "${RED}❌ Serviço $service falhou${NC}"
                
                # Mostra logs do serviço que falhou
                echo -e "${YELLOW}📋 Últimos logs do serviço $service:${NC}"
                docker_compose_exec $STACK_NAME logs --tail=10 $service 2>/dev/null | head -20
                echo ""
            else
                echo -e "${GREEN}✅ Serviço $service está rodando${NC}"
            fi
        done
        
        if [[ "$all_running" == "true" ]]; then
            # Verificação adicional: testa se os serviços estão respondendo
            if check_service_health "$STACK_NAME"; then
                echo -e "\n${GREEN}🎉 Stack $STACK_NAME iniciada com sucesso!${NC}"
                
                # Configura Nginx e gera certificados SSL
                echo -e "\n${YELLOW}🌐 Configurando Nginx e certificados SSL...${NC}"
                if create_nginx_config "$STACK_NAME" "$BACKEND_URL" "$FRONTEND_URL" "$BACKEND_PORT" "$FRONTEND_PORT"; then
                    echo -e "${GREEN}✅ Configuração do Nginx criada${NC}"
                    
                    # Gera certificados SSL (apenas para domínios válidos)
                    # if generate_ssl_certificates "$STACK_NAME" "$BACKEND_URL" "$FRONTEND_URL"; then
                    #     echo -e "${GREEN}✅ Certificados SSL configurados${NC}"
                    # else
                    #     echo -e "${YELLOW}⚠️  Certificados SSL não puderam ser gerados (domínios locais ou DNS não configurado)${NC}"
                    # fi
                else
                    echo -e "${YELLOW}⚠️  Configuração do Nginx falhou (Nginx pode não estar instalado)${NC}"
                fi
                
                # Salva a instância no arquivo JSON
                save_instance "$STACK_NAME" "$BACKEND_PORT" "$FRONTEND_PORT" "$BACKEND_URL" "$FRONTEND_URL" "$TOTAL_CPU" "$TOTAL_MEMORY" "$ENABLE_FINANCIAL" "$GERENCIANET_CLIENT_ID" "$GERENCIANET_CLIENT_SECRET" "$GERENCIANET_PIX_KEY" "$COLOR" "$TAB_NAME"
                
                echo -e "\n${YELLOW}🔗 URLs de acesso:${NC}"
                echo -e "Backend:  ${GREEN}$BACKEND_URL${NC}"
                echo -e "Frontend: ${GREEN}$FRONTEND_URL${NC}"
                echo -e "\n${YELLOW}🛠️  Comandos úteis:${NC}"
                echo -e "Logs:     ${GREEN}./manage-stacks.sh logs -n $STACK_NAME${NC}"
                echo -e "Status:   ${GREEN}./manage-stacks.sh status -n $STACK_NAME${NC}"
                echo -e "Update:   ${GREEN}./manage-stacks.sh update -n $STACK_NAME${NC}"
                echo -e "Parar:    ${GREEN}./manage-stacks.sh down -n $STACK_NAME${NC}"
                echo -e "Reiniciar: ${GREEN}./manage-stacks.sh restart -n $STACK_NAME${NC}"
            else
                echo -e "\n${RED}❌ Erro: Serviços não estão respondendo corretamente${NC}"
                echo -e "${YELLOW}🔄 Executando rollback...${NC}"
                rollback_stack "$STACK_NAME"
                exit 1
            fi
        else
            echo -e "\n${RED}❌ Erro: Alguns serviços falharam:$failed_services${NC}"
            echo -e "${YELLOW}🔄 Executando rollback...${NC}"
            
            # Executa rollback - derruba todos os containers
            rollback_stack "$STACK_NAME"
            
            exit 1
        fi
    else
        echo -e "\n${RED}❌ Erro ao criar containers da stack $STACK_NAME${NC}"
        echo -e "${YELLOW}🔄 Executando rollback...${NC}"
        
        # Executa rollback - derruba todos os containers
        rollback_stack "$STACK_NAME"
        
        exit 1
    fi
}

# Função para parar uma stack
down_stack() {
    set_default_env_vars
    
    # Valida se a instância existe no banco
    validate_instance "$STACK_NAME" "down"
    
    echo -e "${BLUE}🛑 Parando stack $STACK_NAME...${NC}"
    docker_compose_exec $STACK_NAME down
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Stack $STACK_NAME parada com sucesso!${NC}"
        
        # Remove configurações do Nginx
        echo -e "${YELLOW}🧹 Removendo configurações do Nginx...${NC}"
        if remove_nginx_config "$STACK_NAME"; then
            echo -e "${GREEN}✅ Configurações do Nginx removidas${NC}"
        else
            echo -e "${YELLOW}⚠️  Erro ao remover configurações do Nginx${NC}"
        fi
        
        # Remove a instância do arquivo JSON
        remove_instance "$STACK_NAME"
    else
        echo -e "${RED}❌ Erro ao parar stack $STACK_NAME${NC}"
    fi
}

# Função para listar todas as stacks
list_stacks() {
    echo -e "${YELLOW}📊 Listando todas as stacks:${NC}\n"
    
    # Usa docker ps para listar todos os containers, filtrando por projeto
    echo -e "${BLUE}🐳 Containers ativos:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | head -1
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(codatende|backend|frontend|postgres|redis)"
    
    echo -e "\n${BLUE}⏸️  Containers parados:${NC}"
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | head -1
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(codatende|backend|frontend|postgres|redis)" | grep -v "Up"
    
    echo -e "\n${BLUE}🏷️  Stacks identificadas:${NC}"
    docker ps -a --format "{{.Names}}" | grep -E "(codatende|backend|frontend|postgres|redis)" | cut -d'-' -f1 | sort | uniq
}

# Função para mostrar logs de uma stack
logs_stack() {
    set_default_env_vars
    
    # Valida se a instância existe no banco
    validate_instance "$STACK_NAME" "logs"
    
    echo -e "${YELLOW}📝 Mostrando logs da stack $STACK_NAME:${NC}\n"
    docker_compose_exec $STACK_NAME logs -f
}

# Função para mostrar status de uma stack
status_stack() {
    set_default_env_vars
    
    # Valida se a instância existe no banco
    validate_instance "$STACK_NAME" "status"
    
    echo -e "${YELLOW}📈 Status da stack $STACK_NAME:${NC}\n"
    docker_compose_exec $STACK_NAME ps
}

# Função para reiniciar uma stack
restart_stack() {
    set_default_env_vars
    
    # Valida se a instância existe no banco
    validate_instance "$STACK_NAME" "restart"
    
    echo -e "${BLUE}🔄 Reiniciando stack $STACK_NAME...${NC}"
    docker_compose_exec $STACK_NAME restart
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Stack $STACK_NAME reiniciada com sucesso!${NC}"
    else
        echo -e "${RED}❌ Erro ao reiniciar stack $STACK_NAME${NC}"
    fi
}

# Função para atualizar uma stack (imagens Docker)
update_stack() {
    set_default_env_vars
    
    # Valida se a instância existe no banco
    validate_instance "$STACK_NAME" "update"
    
    # Detecta quais parâmetros foram realmente fornecidos pelo usuário
    local args=("$@")
    local provided_params=()
    
    # Analisa os argumentos para detectar parâmetros fornecidos
    local i=0
    while [[ $i -lt ${#args[@]} ]]; do
        case "${args[$i]}" in
            -c|--cpu)
                provided_params+=("cpu")
                i=$((i+2))
                ;;
            -m|--memory)
                provided_params+=("memory")
                i=$((i+2))
                ;;
            -b|--backend-port)
                provided_params+=("backend_port")
                i=$((i+2))
                ;;
            -f|--frontend-port)
                provided_params+=("frontend_port")
                i=$((i+2))
                ;;
            -u|--backend-url)
                provided_params+=("backend_url")
                i=$((i+2))
                ;;
            -w|--frontend-url)
                provided_params+=("frontend_url")
                i=$((i+2))
                ;;
            -p|--gerencianet-pix-key)
                provided_params+=("gerencianet_pix_key")
                i=$((i+2))
                ;;
            -e|--enable-financial)
                provided_params+=("enable_financial")
                i=$((i+1))
                ;;
            -g|--gerencianet-client-id)
                provided_params+=("gerencianet_client_id")
                i=$((i+2))
                ;;
            -s|--gerencianet-client-secret)
                provided_params+=("gerencianet_client_secret")
                i=$((i+2))
                ;;
            --color)
                provided_params+=("color")
                i=$((i+2))
                ;;
            --tab-name)
                provided_params+=("tab_name")
                i=$((i+2))
                ;;
            *)
                i=$((i+1))
                ;;
        esac
    done
    
    # Salva os parâmetros fornecidos antes de carregar a configuração
    local provided_cpu="$TOTAL_CPU"
    local provided_memory="$TOTAL_MEMORY"
    local provided_backend_port="$BACKEND_PORT"
    local provided_frontend_port="$FRONTEND_PORT"
    local provided_backend_url="$BACKEND_URL"
    local provided_frontend_url="$FRONTEND_URL"
    local provided_enable_financial="$ENABLE_FINANCIAL"
    local provided_gerencianet_client_id="$GERENCIANET_CLIENT_ID"
    local provided_gerencianet_client_secret="$GERENCIANET_CLIENT_SECRET"
    local provided_gerencianet_pix_key="$GERENCIANET_PIX_KEY"
    local provided_color="$COLOR"
    local provided_tab_name="$TAB_NAME"
    
    # Carrega a instância do arquivo JSON primeiro
    if load_instance "$STACK_NAME"; then
        echo -e "${YELLOW}📋 Carregando configuração salva para $STACK_NAME...${NC}"
        echo -e "Backend:  ${GREEN}$BACKEND_URL${NC}"
        echo -e "Frontend: ${GREEN}$FRONTEND_URL${NC}"
        echo -e "CPU:      ${GREEN}$TOTAL_CPU${NC} cores"
        echo -e "Memória:  ${GREEN}$TOTAL_MEMORY${NC}MB"
        
        # Recalcula os recursos com os valores carregados
        calculate_resources $TOTAL_CPU $TOTAL_MEMORY
    else
        echo -e "${RED}❌ Erro: Não foi possível carregar a configuração da instância $STACK_NAME${NC}"
        exit 1
    fi
    
    # Agora aplica as alterações dos parâmetros fornecidos
    local config_changed=false
    
    # Verifica se foram fornecidos novos valores e aplica as mudanças
    if [[ " ${provided_params[@]} " =~ " cpu " && -n "$provided_cpu" && "$provided_cpu" != "$TOTAL_CPU" ]]; then
        echo -e "${YELLOW}🔄 Alterando CPU de $TOTAL_CPU para $provided_cpu cores${NC}"
        TOTAL_CPU="$provided_cpu"
        config_changed=true
    fi
    
    if [[ " ${provided_params[@]} " =~ " memory " && -n "$provided_memory" && "$provided_memory" != "$TOTAL_MEMORY" ]]; then
        echo -e "${YELLOW}🔄 Alterando memória de $TOTAL_MEMORY para $provided_memory MB${NC}"
        TOTAL_MEMORY="$provided_memory"
        config_changed=true
    fi
    
    # Só altera portas se foram explicitamente fornecidas
    if [[ " ${provided_params[@]} " =~ " backend_port " && -n "$provided_backend_port" && "$provided_backend_port" != "$BACKEND_PORT" ]]; then
        echo -e "${YELLOW}🔄 Alterando porta do backend de $BACKEND_PORT para $provided_backend_port${NC}"
        BACKEND_PORT="$provided_backend_port"
        BACKEND_URL="http://localhost:$BACKEND_PORT"
        config_changed=true
    fi
    
    if [[ " ${provided_params[@]} " =~ " frontend_port " && -n "$provided_frontend_port" && "$provided_frontend_port" != "$FRONTEND_PORT" ]]; then
        echo -e "${YELLOW}🔄 Alterando porta do frontend de $FRONTEND_PORT para $provided_frontend_port${NC}"
        FRONTEND_PORT="$provided_frontend_port"
        FRONTEND_URL="http://localhost:$FRONTEND_PORT"
        config_changed=true
    fi
    
    # Só altera URLs se foram explicitamente fornecidas
    if [[ " ${provided_params[@]} " =~ " backend_url " && -n "$provided_backend_url" && "$provided_backend_url" != "$BACKEND_URL" ]]; then
        echo -e "${YELLOW}🔄 Alterando URL do backend para $provided_backend_url${NC}"
        BACKEND_URL="$provided_backend_url"
        config_changed=true
    fi
    
    if [[ " ${provided_params[@]} " =~ " frontend_url " && -n "$provided_frontend_url" && "$provided_frontend_url" != "$FRONTEND_URL" ]]; then
        echo -e "${YELLOW}🔄 Alterando URL do frontend para $provided_frontend_url${NC}"
        FRONTEND_URL="$provided_frontend_url"
        config_changed=true
    fi
    
    # Alterações do módulo financeiro
    if [[ " ${provided_params[@]} " =~ " enable_financial " ]]; then
        if [[ "$provided_enable_financial" != "$ENABLE_FINANCIAL" ]]; then
            echo -e "${YELLOW}💰 Alterando módulo financeiro para: $provided_enable_financial${NC}"
            ENABLE_FINANCIAL="$provided_enable_financial"
            config_changed=true
        fi
    fi
    
    if [[ " ${provided_params[@]} " =~ " gerencianet_client_id " && -n "$provided_gerencianet_client_id" && "$provided_gerencianet_client_id" != "$GERENCIANET_CLIENT_ID" ]]; then
        echo -e "${YELLOW}💰 Alterando Gerencianet Client ID${NC}"
        GERENCIANET_CLIENT_ID="$provided_gerencianet_client_id"
        config_changed=true
    fi
    
    if [[ " ${provided_params[@]} " =~ " gerencianet_client_secret " && -n "$provided_gerencianet_client_secret" && "$provided_gerencianet_client_secret" != "$GERENCIANET_CLIENT_SECRET" ]]; then
        echo -e "${YELLOW}💰 Alterando Gerencianet Client Secret${NC}"
        GERENCIANET_CLIENT_SECRET="$provided_gerencianet_client_secret"
        config_changed=true
    fi
    
    if [[ " ${provided_params[@]} " =~ " gerencianet_pix_key " && -n "$provided_gerencianet_pix_key" && "$provided_gerencianet_pix_key" != "$GERENCIANET_PIX_KEY" ]]; then
        echo -e "${YELLOW}💰 Alterando Gerencianet PIX Key${NC}"
        GERENCIANET_PIX_KEY="$provided_gerencianet_pix_key"
        config_changed=true
    fi
    
    # Alterações de tema
    if [[ " ${provided_params[@]} " =~ " color " && -n "$provided_color" && "$provided_color" != "$COLOR" ]]; then
        echo -e "${YELLOW}🎨 Alterando cor do tema para: $provided_color${NC}"
        COLOR="$provided_color"
        config_changed=true
    fi
    
    if [[ " ${provided_params[@]} " =~ " tab_name " && -n "$provided_tab_name" && "$provided_tab_name" != "$TAB_NAME" ]]; then
        echo -e "${YELLOW}📝 Alterando nome da aba para: $provided_tab_name${NC}"
        TAB_NAME="$provided_tab_name"
        config_changed=true
    fi
    
    if [[ "$config_changed" == "true" ]]; then
        echo -e "${YELLOW}🔄 Recalculando recursos com novas configurações...${NC}"
        calculate_resources $TOTAL_CPU $TOTAL_MEMORY
    fi
    
    # Verifica se as portas estão disponíveis antes de prosseguir (apenas se houve mudança de portas)
    if [[ " ${provided_params[@]} " =~ " backend_port " || " ${provided_params[@]} " =~ " frontend_port " ]]; then
        echo -e "${YELLOW}🔍 Verificando disponibilidade das novas portas...${NC}"
        if ! validate_ports "$BACKEND_PORT" "$FRONTEND_PORT"; then
            echo -e "${RED}❌ Erro: Verificação de portas falhou. Abortando atualização da stack.${NC}"
            exit 1
        fi
    fi
    
    echo -e "${BLUE}🔄 Atualizando stack $STACK_NAME...${NC}"
    echo -e "${YELLOW}⬇️  Baixando imagens mais recentes...${NC}"
    
    # Faz pull das imagens mais recentes
    docker_compose_exec $STACK_NAME pull
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Imagens baixadas com sucesso!${NC}"
        echo -e "${YELLOW}🔨 Rebuildando imagens locais...${NC}"
        
        # Rebuilda as imagens locais
        docker_compose_exec $STACK_NAME build --no-cache
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Imagens rebuildadas com sucesso!${NC}"
            echo -e "${YELLOW}🚀 Reiniciando serviços com as novas imagens...${NC}"
            
            # Reinicia os serviços para usar as novas imagens
            # Usa --no-deps para não reiniciar dependências desnecessariamente
            docker_compose_exec $STACK_NAME up -d --no-deps
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}🎉 Stack $STACK_NAME atualizada com sucesso!${NC}"
                
                # Atualiza a instância no arquivo JSON com as novas configurações
                save_instance "$STACK_NAME" "$BACKEND_PORT" "$FRONTEND_PORT" "$BACKEND_URL" "$FRONTEND_URL" "$TOTAL_CPU" "$TOTAL_MEMORY" "$ENABLE_FINANCIAL" "$GERENCIANET_CLIENT_ID" "$GERENCIANET_CLIENT_SECRET" "$GERENCIANET_PIX_KEY" "$COLOR" "$TAB_NAME"
                
                echo -e "${YELLOW}⚙️  Configuração final:${NC}"
                echo -e "Backend:  ${GREEN}$BACKEND_URL${NC}"
                echo -e "Frontend: ${GREEN}$FRONTEND_URL${NC}"
                echo -e "Recursos: ${GREEN}$TOTAL_CPU${NC} cores, ${GREEN}$TOTAL_MEMORY${NC}MB"
                echo -e "${YELLOW}💾 Nota:${NC} Os bancos de dados não foram afetados pela atualização."
                echo -e "${YELLOW}🛠️  Comandos úteis:${NC}"
                echo -e "Status:   ${GREEN}./manage-stacks.sh status -n $STACK_NAME${NC}"
                echo -e "Logs:     ${GREEN}./manage-stacks.sh logs -n $STACK_NAME${NC}"
            else
                echo -e "${RED}❌ Erro ao reiniciar serviços da stack $STACK_NAME${NC}"
                exit 1
            fi
        else
            echo -e "${RED}❌ Erro ao rebuildar imagens${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Erro ao baixar imagens atualizadas${NC}"
        exit 1
    fi
} 