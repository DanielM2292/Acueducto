# Usar una imagen base de Node.js
FROM node:16

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos del frontend al contenedor
COPY . /app

# Instalar las dependencias
RUN npm install

# Exponer el puerto donde Vite correrá (puerto 5173)
EXPOSE 5173

# Iniciar la aplicación de Vite en modo desarrollo
CMD ["npm", "run", "dev"]
