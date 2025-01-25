from flask import request, current_app, session, jsonify
from app.models import Clientes, Auditoria
from app.services import ClientesServices
from app.routes import clientes_bp

@clientes_bp.route('/agregar_cliente', methods=["POST"])
def agregar_cliente_route():
    return ClientesServices.agregar_cliente_route()

@clientes_bp.route('/buscar_cliente', methods=["GET"])
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

@clientes_bp.route('/actualizar_cliente', methods=["PUT"])
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

@clientes_bp.route('/eliminar_cliente', methods=["DELETE"])
def eliminar_cliente_route():
    
    mysql = current_app.mysql
    
    try:
        id_cliente = request.args.get("id_cliente")
        current_user = session.get("id_administrador")
        Clientes.delete_cliente(mysql, id_cliente, current_user)
        return jsonify({"message": "Cliente eliminado exitosamente"}), 200
    except Exception as e:
        return jsonify({"message": f"Error al eliminar cliente: {str(e)}"}), 500

@clientes_bp.route('/buscar_todos_clientes', methods=["GET"])
def buscar_todos_clientes():
    
    mysql = current_app.mysql
    
    try:
        clientes = Clientes.get_all_clientes(mysql)
        return jsonify(clientes)
    except Exception as e:
        return jsonify({"message": f"Error al obtener clientes: {str(e)}"}), 500

@clientes_bp.route('/buscar_clientes_por_palabra', methods=["GET"])
def buscar_clientes_por_palabra():
    
    mysql = current_app.mysql
    
    try:
        palabra_clave = request.args.get("palabra_clave")
        clientes = Clientes.search_clientes_by_keyword(mysql, palabra_clave)
        return jsonify(clientes)
    except Exception as e:
        return jsonify({"message": f"Error al buscar clientes: {str(e)}"}), 500
