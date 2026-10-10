# Imagem do EDUCA HUB para hospedagens que rodam contêineres (Railway, Render, Fly...).
# O banco fica em /dados: monte ali um disco persistente, senão tudo se apaga a cada nova publicação.

# 1. Constrói a interface (precisa das ferramentas de desenvolvimento).
FROM node:24-slim AS construcao
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm ci
COPY client client
RUN npm run build

# 2. Imagem final: só o servidor, as dependências dele e a interface já construída.
FROM node:24-slim
# O fuso define quando o dia vira (sequência, missões do dia). O processo roda como root porque é assim que as
# hospedagens montam o disco persistente.
ENV NODE_ENV=production EDUCAHUB_DADOS=/dados TZ=America/Sao_Paulo
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm ci --omit=dev --workspace=server && npm cache clean --force
COPY server server
COPY --from=construcao /app/client/dist client/dist
EXPOSE 3001
CMD ["node", "server/src/index.js"]
