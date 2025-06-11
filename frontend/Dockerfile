FROM node:20 AS builder

WORKDIR /app/frontend
# Copia el package.json del frontend y ejecuta la instalación de dependencias
COPY frontend/package.json ./
RUN npm install

# Copia el resto del código del frontend y ejecuta el build
COPY frontend ./
RUN npm run build

FROM node:20
WORKDIR /app/frontend
# Copia el resultado de la etapa de build
COPY --from=builder /app/frontend .

EXPOSE 3000
CMD ["npm", "run", "start"]