import os
from dotenv import load_dotenv

# Cargar el archivo .env
load_dotenv()

class Config:
    MYSQL_HOST = os.getenv('DB_HOST', 'database')  # 'database' es el nombre del servicio en Docker
    MYSQL_USER = os.getenv('DB_USER', 'root')
    MYSQL_PASSWORD = os.getenv('DB_PASSWORD', '1004624494')
    MYSQL_DB = os.getenv('DB_NAME', 'acueducto_santander')
    SECRET_KEY = os.getenv('SECRET_KEY')  # Asegúrate de que esté definida en tu archivo .env

    # Imprimir las variables para depuración
    print(f"MYSQL_HOST: {MYSQL_HOST}")
    print(f"MYSQL_USER: {MYSQL_USER}")
    print(f"MYSQL_PASSWORD: {MYSQL_PASSWORD}")
    print(f"MYSQL_DB: {MYSQL_DB}")
    print(f"SECRET_KEY: {SECRET_KEY}")