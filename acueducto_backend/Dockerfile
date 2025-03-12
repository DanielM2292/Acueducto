# Usar una imagen oficial de Python 3.12.6
FROM python:3.12.6-slim

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos del backend al contenedor
COPY . /app

# Copiar el archivo requirements.txt y luego instalar las dependencias
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Exponer el puerto 9090 en el contenedor
EXPOSE 9090

# Comando para ejecutar el servidor a través de run.py
CMD ["python", "run.py"]