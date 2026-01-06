#!/bin/bash

# Script wrapper para o gerenciador de stacks modular
# Este arquivo redireciona para o script principal na pasta scripts/

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAIN_SCRIPT="$SCRIPT_DIR/scripts/main.sh"

# Verifica se o script principal existe
if [[ ! -f "$MAIN_SCRIPT" ]]; then
    echo "❌ Erro: Script principal não encontrado em $MAIN_SCRIPT"
    echo "💡 Verifique se todos os arquivos foram criados corretamente"
    exit 1
fi

# Executa o script principal passando todos os argumentos
exec "$MAIN_SCRIPT" "$@" 