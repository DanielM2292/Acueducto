from flask import jsonify, current_app, session, request
from app.models import Clientes, Auditoria, Matricula_cliente, User

class ClientesServices:
    @staticmethod
    def agregar_cliente_route(data):
        mysql = current_app.mysql
        if "user" not in session:
            return jsonify({'message': 'Unauthorized'}), 401
        custom_id_cliente = Auditoria.generate_custom_id(mysql, 'CLI', 'id_cliente', 'clientes')
        custom_id_auditoria = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        try:
            user_name = data.get('nombre_usuario')
            user = User.get_user_by_username(mysql, user_name)
            id_administrador = user['id_administrador']
            tipo_documento = data.get("tipo_documento"),
            numero_documento = data.get("numero_documento"),
            nombre = data.get("nombre"),
            telefono = data.get("telefono"),
            
            cliente = Clientes.verificar_cliente(mysql, numero_documento)
            if cliente:
               return jsonify({"error": "El cliente ya existe"}), 409
            
            Clientes.add_cliente(mysql, custom_id_cliente, tipo_documento,numero_documento, nombre, telefono)
            Auditoria.log_audit(mysql, custom_id_auditoria, 'clientes', custom_id_cliente, 'INSERT', id_administrador, f'Se agrega cliente {custom_id_cliente}, nombre: {nombre}')
            return jsonify({"message": "Cliente agregado exitosamente", "id_cliente": custom_id_cliente}), 201
        except Exception as e:
            return jsonify({"message": f"Error al agregar cliente: {str(e)}"}), 500

    @staticmethod
    def actualizar_cliente_route(data):
        mysql = current_app.mysql
        if "user" not in session:
            return jsonify({'message': 'Unauthorized'}), 401
        custom_id_auditoria = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        try:
            user_name = data.get('nombre_usuario')
            user = User.get_user_by_username(mysql, user_name)
            id_administrador = user['id_administrador']
            id_cliente = data.get("id_cliente")
            tipo_documento = data.get("tipo_documento"),
            numero_documento = data.get("numero_documento"),
            nombre = data.get("nombre"),
            telefono = data.get("telefono"),
            
            Clientes.update_cliente(mysql, tipo_documento, numero_documento, nombre, telefono, id_cliente)
            Auditoria.log_audit(mysql, custom_id_auditoria, "clientes", id_cliente, "UPDATE", id_administrador, f"Se actualiza datos del cliente {id_cliente}")
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
    
    # Para el endpoint que viene desde Facturas
    @staticmethod
    def obtener_cliente():
        mysql = current_app.mysql
        try:
            print('entra al end verif')
            numero_documento = request.args.get('numero_documento')
            print(numero_documento)
            cliente = Clientes.obtener_datos(mysql, numero_documento)
            print(cliente)
            return jsonify(cliente)
        except Exception as e:
            return jsonify({"message": f"Error al buscar clientes: {str(e)}"}), 500
    