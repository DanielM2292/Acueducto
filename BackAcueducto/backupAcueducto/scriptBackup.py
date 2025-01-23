import subprocess
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def backup_database(host, user, password, database, output_folder="Copias de seguridad"):
    try:
        # Crear carpeta de backups si no existe
        if not os.path.exists(output_folder):
            os.makedirs(output_folder)

        # Generar el nombre del archivo con la fecha y hora
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = os.path.join(output_folder, f"{database}_backup_{timestamp}.sql")

        # Ruta completa a mysqldump
        mysqldump_path = r"C:/Program Files/MySQL/MySQL Server 8.0/bin/mysqldump.exe"

        # Comando para ejecutar mysqldump
        command = [
            mysqldump_path,
            f"--host={host}",
            f"--user={user}",
            f"--password={password}",
            database,
        ]

        # Ejecutar el comando
        with open(backup_file, "w") as output:
            subprocess.run(command, stdout=output, stderr=subprocess.PIPE, check=True)
        
        print(f"Backup realizado con éxito: {backup_file}")
        return backup_file
    except Exception as e:
        print(f"Error al realizar el backup: {e}")

if __name__ == "__main__":
    # Cargar las variables de entorno
    host = os.getenv("DB_HOST")
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    database = os.getenv("DB_NAME")

    # Llamar a la función de backup
    backup_database(host, user, password, database)
