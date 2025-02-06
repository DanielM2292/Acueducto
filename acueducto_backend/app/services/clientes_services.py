from flask import jsonify, current_app, session, request
from app.models import Clientes, Auditoria

class ClientesServices:
    @staticmethod
    def agregar_cliente_route(data):
        mysql = current_app.mysql
        custom_id_cliente = Auditoria.generate_custom_id(mysql, 'CLI', 'id_cliente', 'clientes')
        custom_id_auditoria = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        try:            
            tipo_documento = data.get("tipo_documento"),
            numero_documento = data.get("numero_documento"),
            nombre = data.get("nombre"),
            telefono = data.get("telefono"),
            direccion = data.get("direccion"),
            estado_cliente = data.get("id_estado_cliente")
            current_user = session.get("id_administrador")
            
            cliente = Clientes.verificar_cliente(mysql, numero_documento)
            if cliente:
               return jsonify({"error": "El cliente ya existe"}), 409
            
            Clientes.add_cliente(mysql, custom_id_cliente, tipo_documento,numero_documento, nombre, telefono, direccion, estado_cliente)
            Auditoria.log_audit(mysql, custom_id_auditoria, 'clientes', custom_id_cliente, 'INSERT', current_user, f'Se agrega cliente {custom_id_cliente}, nombre: {nombre}')
            return jsonify({"message": "Cliente agregado exitosamente", "id_cliente": custom_id_cliente}), 201
        except Exception as e:
            return jsonify({"message": f"Error al agregar cliente: {str(e)}"}), 500

    @staticmethod
    def actualizar_cliente_route(data):
        mysql = current_app.mysql
        custom_id_auditoria = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        try:
            id_cliente = data.get("id_cliente")
            tipo_documento = data.get("tipo_documento"),
            numero_documento = data.get("numero_documento"),
            nombre = data.get("nombre"),
            telefono = data.get("telefono"),
            direccion = data.get("direccion"),
            estado_cliente = data.get("id_estado_cliente")
            current_user = session.get("id_administrador")
            
            Clientes.update_cliente(mysql, tipo_documento, numero_documento, nombre, telefono, direccion, estado_cliente, id_cliente)
            Auditoria.log_audit(mysql, custom_id_auditoria, "clientes", id_cliente, "UPDATE", current_user, f"Se actualiza datos del cliente {id_cliente}")
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
            palabra_clave = request.args.get('palabra_clave')
            clientes = Clientes.search_clientes_by_keyword(mysql, palabra_clave)
            return jsonify(clientes)
        except Exception as e:
            return jsonify({"message": f"Error al buscar clientes: {str(e)}"}), 500    