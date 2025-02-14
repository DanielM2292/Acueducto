from flask import request, jsonify
from app.services import ClientesServices
from app.routes import clientes_bp

@clientes_bp.route('/agregar_cliente', methods=["POST", 'OPTIONS'])
def agregar_cliente_route():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    data = request.get_json()
    return ClientesServices.agregar_cliente_route(data)

@clientes_bp.route('/actualizar_cliente', methods=["PUT", 'OPTIONS'])
def actualizar_cliente_route():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    data = request.get_json()
    return ClientesServices.actualizar_cliente_route(data)

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

@clientes_bp.route('/obtener_cliente', methods=["GET", "OPTIONS"])
def obtener_cliente():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return ClientesServices.obtener_cliente()
