from flask import jsonify, current_app, request
from datetime import datetime
from app.models import Auditoria, Tarifas_estandar, Valores_medidor
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
    
    @staticmethod
    def datos_estandar():
        try:
            mysql = current_app.mysql
            datos_estandar = Tarifas_estandar.obtener_todo_estandar(mysql)
            
            return jsonify(datos_estandar), 201
        except Exception as e:
            return jsonify({"message": f"Error al obtener datos de tarifa estandar: {str(e)}"}), 500
    
    @staticmethod
    def datos_medidor():
        try:
            mysql = current_app.mysql
            datos_medidores = Valores_medidor.obtener_datos(mysql)
            
            return jsonify(datos_medidores), 201
        except Exception as e:
            return jsonify({"message": f"Error al obtener datos de tarifa estandar: {str(e)}"}), 500
    
    @staticmethod
    def actualizar_datos_estandar(data):
        try:
            mysql = current_app.mysql
            descripcion = 'Nueva'
            tarifa_definida = data.get('tarifaDefinida')
            fecha_inicio_tarifa = data.get('fechaInicio')
            fecha_final_tarifa = data.get('fechaFin')
            
            custom_id = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
            custom_id_tarifa_estandar = Auditoria.generate_custom_id(mysql, 'TAE', 'id_tarifa_estandar', 'tarifas_estandar')
            
            Tarifas_estandar.crear_tarifa(mysql, custom_id_tarifa_estandar, descripcion, tarifa_definida, fecha_inicio_tarifa, fecha_final_tarifa)
            Auditoria.log_audit(mysql, custom_id, 'tarifas_estandar', custom_id_tarifa_estandar, 'INSERT', 'ADM0001', 'Se crea una nueva tarifa estandar')
            
            return jsonify({"message": "Tarifa actualizada correctamente"}), 201
        except Exception as e:
            return jsonify({"message": f"Error al obtener datos de tarifa estandar: {str(e)}"}), 500
    
    @staticmethod
    def actualizar_datos_medidor(data):
        try:
            print('entra al endpoint medido')
            mysql = current_app.mysql
            limite_medidor = data.get('limiteMedidor')
            valor_limite = data.get('valorHastaLimite')
            valor_metro3 = data.get('valorMetroCubico')
            
            custom_id = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
            custom_id_valores_medidor = Auditoria.generate_custom_id(mysql, 'VAM', 'id_valores_medidor', 'valores_medidor')
            
            Valores_medidor.crear_valores(mysql, custom_id_valores_medidor, limite_medidor, valor_limite, valor_metro3)
            Auditoria.log_audit(mysql, custom_id, 'valores_medidor', custom_id_valores_medidor, 'INSERT', 'ADM0001', 'Se crean nuevos parametros para medidores')
            
            return jsonify({"message": "Tarifa actualizada correctamente"}), 201
        except Exception as e:
            return jsonify({"message": f"Error al obtener datos de tarifa estandar: {str(e)}"}), 500
   
    