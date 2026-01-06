FROM node:20-alpine

WORKDIR /app

# Dependências do sistema
RUN apk add --no-cache \
  git \
  openssh-client \
  netcat-openbsd \
  tzdata

# Timezone
ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copia SOMENTE arquivos de dependência
COPY backend/package.json backend/yarn.lock ./

# Instala dependências E atualiza TypeScript para versão compatível
RUN yarn install --frozen-lockfile && \
    yarn add typescript@^5.0.0 @types/node@^20.0.0

# Opcional: Atualiza pacotes problemáticos específicos
# RUN yarn add @types/babel__traverse@latest @types/lodash@latest

# Copia o restante do código
COPY backend/. .

# Git via HTTPS
RUN git config --global url."https://".insteadOf ssh://

# Certificados
COPY certificates ./certs-temp
COPY backend/copy_cert_assets.sh ./
RUN chmod +x copy_cert_assets.sh \
  && ./copy_cert_assets.sh \
  && rm -rf ./certs-temp

# Variáveis de build
ARG STACK_NAME
ENV STACK_NAME=$STACK_NAME

# Build TypeScript
RUN yarn build

EXPOSE 3000
ENV HOST=0.0.0.0
ENV PORT=3000

# Entrypoint
COPY backend/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

CMD ["/app/docker-entrypoint.sh"]
