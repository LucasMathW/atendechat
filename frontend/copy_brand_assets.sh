#!/bin/sh

# Script para copiar assets de marca personalizados
# Autor: Atendechat
# Versão: 2.0

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Caminhos
BRANDS_DIR="/app/brands"
LOGO_TARGET="/app/src/assets/logo.png"
FAVICON_TARGET="/app/public/favicon.ico"

# Arquivos personalizados
LOGO_FILE="$BRANDS_DIR/${STACK_NAME}-logo.png"
FAVICON_FILE="$BRANDS_DIR/${STACK_NAME}-favicon.ico"

echo -e "${YELLOW}🎨 Configurando assets de marca para: $STACK_NAME${NC}"

# Verifica se o diretório de marcas existe
if [ ! -d "$BRANDS_DIR" ]; then
    echo -e "${YELLOW}⚠️  Diretório de marcas não encontrado: $BRANDS_DIR${NC}"
    echo -e "${YELLOW}💡 Usando assets padrão${NC}"
    exit 0
fi

# Substitui logo se existir
if [ -f "$LOGO_FILE" ]; then
    echo -e "${GREEN}✅ Copiando logo personalizada: $LOGO_FILE${NC}"
    cp "$LOGO_FILE" "$LOGO_TARGET"
    echo -e "${GREEN}   Logo copiada para: $LOGO_TARGET${NC}"
else
    echo -e "${YELLOW}ℹ️  Logo personalizada não encontrada: $LOGO_FILE${NC}"
    echo -e "${YELLOW}   Usando logo padrão${NC}"
fi

# Substitui favicon se existir
if [ -f "$FAVICON_FILE" ]; then
    echo -e "${GREEN}✅ Copiando favicon personalizado: $FAVICON_FILE${NC}"
    cp "$FAVICON_FILE" "$FAVICON_TARGET"
    echo -e "${GREEN}   Favicon copiado para: $FAVICON_TARGET${NC}"
else
    echo -e "${YELLOW}ℹ️  Favicon personalizado não encontrado: $FAVICON_FILE${NC}"
    echo -e "${YELLOW}   Usando favicon padrão${NC}"
fi

echo -e "${GREEN}🎨 Configuração de assets concluída!${NC}"

exit 0 