from flask import jsonify, current_app, session, request
from app.models import Clientes, Auditoria
import os

class ClientesServices:
    @staticmethod
    def agregar_cliente_route():
        mysql = current_app.mysql
        custom_id_cliente = Auditoria.generate_custom_id(mysql, 'CLI', 'id_cliente', 'clientes')
        custom_id_auditoria = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        try:
            data = request.get_json()
            current_user = session.get("id_administrador")
            
            # Determinar las tarifas a insertar
            id_tarifa_estandar = None
            id_tarifa_medidor = None

            if data.get("id_tarifa") in ["TAE0001"]:
                id_tarifa_estandar = data.get("id_tarifa")
            elif data.get("id_tarifa") == "TAM0001":
                id_tarifa_medidor = data.get("id_tarifa")
                
            print('recibe datos para procesar')
            
            cursor = mysql.connection.cursor()
            cursor.execute('INSERT INTO clientes (id_cliente, tipo_documento, numero_documento, nombre, telefono, direccion, id_estado_cliente, id_tarifa_estandar, id_tarifa_medidor) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)', 
                        (custom_id_cliente, data.get("tipo_documento"), data.get("numero_documento"), data.get("nombre"), data.get("telefono"), data.get("direccion"), data.get("id_estado_cliente"), id_tarifa_estandar, id_tarifa_medidor))
            mysql.connection.commit()
            Auditoria.log_audit(mysql, custom_id_auditoria, 'clientes', custom_id_cliente, 'INSERT', current_user, f'Se agrega cliente {custom_id_cliente}')
            cursor.close()
            return jsonify({"message": "Cliente agregado exitosamente", "id_cliente": custom_id_cliente}), 201
        except Exception as e:
            return jsonify({"message": f"Error al agregar cliente: {str(e)}"}), 500
    
    @staticmethod
    def buscar_cliente():
        mysql = current_app.mysql
        try:
            id_cliente = request.args.get("id_cliente")
            cliente = Clientes.get_cliente_by_id(mysql, id_cliente)
            if cliente:
                return jsonify(cliente)
            return jsonify({"message": "Cliente no encontrado"}), 404
        except Exception as e:
            return jsonify({"message": f"Error al buscar cliente: {str(e)}"}), 500    
    
    @staticmethod
    def actualizar_cliente_route():
        mysql = current_app.mysql
    
        try:
            id_cliente = request.args.get("id_cliente")
            data = request.get_json()
            current_user = session.get("id_administrador")

            # Determinar las tarifas a actualizar
            id_tarifa_estandar = None
            id_tarifa_medidor = None

            if data.get("id_tarifa") in ["TAREST001", "TAREST002", "TAREST003", "TAREST004"]:
                id_tarifa_estandar = data.get("id_tarifa")
            elif data.get("id_tarifa") == "TARMED001":
                id_tarifa_medidor = data.get("id_tarifa")

            Clientes.update_cliente(
                mysql,
                id_cliente,
                data.get("tipo_documento"),
                data.get("numero_documento"),
                data.get("nombre"),
                data.get("telefono"),
                data.get("direccion"),
                data.get("id_estado_cliente"),
                id_tarifa_estandar,
                id_tarifa_medidor,
            )
            return jsonify({"message": "Cliente actualizado exitosamente"}), 200
        except Exception as e:
            return jsonify({"message": f"Error al actualizar cliente: {str(e)}"}), 500
    
    @staticmethod
    def buscar_todos_clientes():
        mysql = current_app.mysql
        try:
            clientes = Clientes.get_all_clientes(mysql)
            return jsonify(clientes)
        except Exception as e:
            return jsonify({"message": f"Error al obtener clientes: {str(e)}"}), 500
    
    @staticmethod
    def buscar_clientes_por_palabra():
        mysql = current_app.mysql
        try:
            palabra_clave = request.args.get("palabra_clave")
            clientes = Clientes.search_clientes_by_keyword(mysql, palabra_clave)
            return jsonify(clientes)
        except Exception as e:
            return jsonify({"message": f"Error al buscar clientes: {str(e)}"}), 500    