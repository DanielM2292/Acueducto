from flask import jsonify, current_app, request
from datetime import datetime
from app.models import Clientes, Facturas, Auditoria
import os, subprocess

class GestionServices:
    @staticmethod
    def crearBackup(host, user, password, database, output_folder="Copias de seguridad Acueducto-Santander"):
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
            
            return jsonify({"message": "Backup realizado con exito"}), 201
        except Exception as e:
            return jsonify({"message": f"Error al realizar backup: {str(e)}"}), 500