#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🎨 Atualizando cor da aplicação...${NC}"

# Verifica se a variável de ambiente está definida
if [[ -z "$REACT_APP_COLOR" ]]; then
    echo -e "${YELLOW}⚠️  REACT_APP_COLOR não definida, usando valor padrão: #682EE3${NC}"
    APP_COLOR="#682EE3"
else
    APP_COLOR="$REACT_APP_COLOR"
fi

# Valida se a cor é um hex válido
if [[ ! "$APP_COLOR" =~ ^#[0-9A-Fa-f]{6}$ ]]; then
    echo -e "${RED}❌ Erro: Cor inválida '$APP_COLOR'. Use formato hexadecimal (ex: #682EE3)${NC}"
    exit 1
fi

echo -e "${GREEN}🎨 Alterando cor da aplicação para: $APP_COLOR${NC}"

# Verifica se a pasta src existe
if [[ ! -d "src" ]]; then
    echo -e "${RED}❌ Pasta src não encontrada${NC}"
    exit 1
fi

# Conta quantos arquivos .js e .jsx existem na pasta src
js_files=$(find src -name "*.js" -o -name "*.jsx" -type f)
if [[ -z "$js_files" ]]; then
    echo -e "${RED}❌ Nenhum arquivo .js/.jsx encontrado na pasta src${NC}"
    exit 1
fi

echo -e "${GREEN}🔍 Procurando arquivos .js/.jsx na pasta src...${NC}"

# Processa todos os arquivos .js/.jsx na pasta src
total_replacements=0
files_processed=0

for file in $js_files; do
    if [[ -f "$file" ]]; then
        # Verifica se o arquivo contém a cor antiga
        if grep -q "#682EE3" "$file"; then
            echo -e "${YELLOW}📝 Processando: $file${NC}"
            
            # Conta quantas ocorrências existem no arquivo
            old_count=$(grep -o "#682EE3" "$file" | wc -l)
            
            # Faz o replace no arquivo
            sed -i "s/#682EE3/$APP_COLOR/g" "$file"
            
            # Verifica se o replace foi bem-sucedido
            if grep -q "$APP_COLOR" "$file"; then
                new_count=$(grep -o "$APP_COLOR" "$file" | wc -l)
                echo -e "${GREEN}✅ $file: $old_count → $new_count ocorrências${NC}"
                total_replacements=$((total_replacements + new_count))
            else
                echo -e "${YELLOW}⚠️  $file: Não foi possível verificar a alteração${NC}"
            fi
            
            files_processed=$((files_processed + 1))
        fi
    fi
done

if [[ $files_processed -gt 0 ]]; then
    echo -e "${GREEN}✅ Cor da aplicação atualizada com sucesso!${NC}"
    echo -e "${GREEN}🎨 Nova cor principal: $APP_COLOR${NC}"
    echo -e "${GREEN}📊 Arquivos processados: $files_processed${NC}"
    echo -e "${GREEN}📊 Total de ocorrências substituídas: $total_replacements${NC}"
else
    echo -e "${YELLOW}⚠️  Nenhum arquivo com a cor #682EE3 foi encontrado${NC}"
fi

# Verifica se ainda existem ocorrências da cor antiga em qualquer arquivo
remaining_old=$(find src -name "*.js" -o -name "*.jsx" -type f -exec grep -l "#682EE3" {} \; 2>/dev/null)
if [[ -n "$remaining_old" ]]; then
    echo -e "${YELLOW}⚠️  Aviso: Ainda existem ocorrências da cor antiga #682EE3 nos seguintes arquivos:${NC}"
    echo "$remaining_old"
else
    echo -e "${GREEN}✅ Todas as ocorrências da cor antiga foram substituídas!${NC}"
fi

echo -e "${GREEN}🎉 Script de atualização da cor da aplicação concluído!${NC}" 