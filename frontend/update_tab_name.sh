#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🎨 Atualizando nome da página...${NC}"

# Verifica se a variável de ambiente está definida
if [[ -z "$REACT_APP_TAB_NAME" ]]; then
    echo -e "${YELLOW}⚠️  REACT_APP_TAB_NAME não definida, usando valor padrão: Atendechat${NC}"
    TAB_NAME="Atendechat"
else
    TAB_NAME="$REACT_APP_TAB_NAME"
fi

echo -e "${GREEN}📝 Alterando nome da página para: $TAB_NAME${NC}"

# Verifica se o arquivo index.html existe
if [[ ! -f "public/index.html" ]]; then
    echo -e "${YELLOW}⚠️  Arquivo public/index.html não encontrado${NC}"
    exit 1
fi

# Faz o replace no arquivo index.html
# Substitui todas as ocorrências de "Atendechat" pelo novo nome
sed -i "s/Atendechat/$TAB_NAME/g" public/index.html

# Verifica se o replace foi bem-sucedido no index.html
if grep -q "$TAB_NAME" public/index.html; then
    echo -e "${GREEN}✅ Nome da página atualizado com sucesso no index.html!${NC}"
    echo -e "${GREEN}📄 Título da página: $TAB_NAME${NC}"
else
    echo -e "${YELLOW}⚠️  Aviso: Não foi possível verificar se a alteração foi aplicada no index.html${NC}"
fi

# Faz o replace no arquivo manifest.json
if [[ -f "public/manifest.json" ]]; then
    sed -i "s/Atendechat/$TAB_NAME/g" public/manifest.json
    
    # Verifica se o replace foi bem-sucedido no manifest.json
    if grep -q "$TAB_NAME" public/manifest.json; then
        echo -e "${GREEN}✅ Nome da página atualizado com sucesso no manifest.json!${NC}"
    else
        echo -e "${YELLOW}⚠️  Aviso: Não foi possível verificar se a alteração foi aplicada no manifest.json${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Arquivo public/manifest.json não encontrado${NC}"
fi

echo -e "${GREEN}🎉 Script de atualização do nome da página concluído!${NC}" 