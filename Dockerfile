# Imagem base leve com Node.js 20
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências (apenas produção para imagem final, mas precisamos de todas para o prisma)
RUN npm install

# Copiar o restante do código
COPY . .

# Gerar o cliente Prisma
RUN npx prisma generate

# Expor a porta que a aplicação usa
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
