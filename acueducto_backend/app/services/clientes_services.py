from flask import jsonify, current_app, session, request
from app.models import Clientes, Auditoria
import os

class ClientesServices:
    @staticmethod
    def agregar_cliente_route():
        
        mysql = current_app.mysql
        
        try:
            data = request.get_json()
            current_user = session.get("id_administrador")

            
            custom_id_cliente = Auditoria.generate_custom_id(mysql, 'CLI', 'id_cliente', 'clientes')
            custom_id_auditoria = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
            
            # Determinar las tarifas a insertar
            id_tarifa_estandar = None
            id_tarifa_medidor = None

            if data.get("id_tarifa") in ["TAE0001", "TAE0002", "TAE0003", "TAE0004", "TAE0005"]:
                id_tarifa_estandar = data.get("id_tarifa")
            elif data.get("id_tarifa") == "TAM0001":
                id_tarifa_medidor = data.get("id_tarifa")
            
            cursor = mysql.connection.cursor()
            cursor.execute('INSERT INTO clientes (id_cliente, tipo_documento, numero_documento, nombre, telefono, direccion, id_estado_cliente, id_tarifa_estandar, id_tarifa_medidor) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)', 
                        (custom_id_cliente, data.get("tipo_documento"), data.get("numero_documento"), data.get("nombre"), data.get("telefono"), data.get("direccion"), data.get("id_estado_cliente"), id_tarifa_estandar, id_tarifa_medidor))
            mysql.connection.commit()
            Auditoria.log_audit(mysql, custom_id_auditoria, 'clientes', custom_id_cliente, 'INSERT', current_user, f'Se agrega cliente {custom_id_cliente}')
            cursor.close()
            return jsonify({"message": "Cliente agregado exitosamente", "id_cliente": custom_id_cliente}), 201
        except Exception as e:
            return jsonify({"message": f"Error al agregar cliente: {str(e)}"}), 500