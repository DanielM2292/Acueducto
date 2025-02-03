from flask import request, current_app, session, jsonify
from app.models import Clientes, Auditoria
from app.services import ClientesServices
from app.routes import clientes_bp

@clientes_bp.route('/agregar_cliente', methods=["POST", 'OPTIONS'])
def agregar_cliente_route():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    data = request.get_json()
    return ClientesServices.agregar_cliente_route(data)

@clientes_bp.route('/buscar_cliente', methods=["GET", 'OPTIONS'])
def buscar_cliente():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return ClientesServices.buscar_cliente()

@clientes_bp.route('/actualizar_cliente', methods=["PUT", 'OPTIONS'])
def actualizar_cliente_route():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    data = request.get_json()
    return ClientesServices.actualizar_cliente_route(data)


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

@clientes_bp.route('/buscar_todos_clientes', methods=["GET", "OPTIONS"])
def buscar_todos_clientes():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return ClientesServices.buscar_todos_clientes()

@clientes_bp.route('/buscar_clientes_por_palabra', methods=["GET", "OPTIONS"])
def buscar_clientes_por_palabra():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return ClientesServices.buscar_clientes_por_palabra()
