from flask import request, current_app, session, jsonify
from app.models import Inventario, Auditoria
from app.services import ProductosServices
from app.routes import productos_bp

@productos_bp.route('/agregar_producto', methods=["POST", "OPTIONS"])
def agregar_producto():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    data = request.get_json()
    return ProductosServices.agregar_producto(data)

@productos_bp.route('/buscar_producto', methods=["GET"])
def buscar_producto():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return ProductosServices.buscar_producto()

@productos_bp.route('/actualizar_producto', methods=["PUT", "OPTIONS"])
def actualizar_producto():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    data = request.get_json()
    return ProductosServices.actualizar_producto(data)
    
@productos_bp.route('/eliminar_producto', methods=["DELETE", "OPTIONS"])
def eliminar_producto():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return ProductosServices.eliminar_producto()

@productos_bp.route('/buscar_todos_productos', methods=["GET", "OPTIONS"])
def buscar_todos_productos():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return ProductosServices.buscar_todos_productos()

@productos_bp.route('/buscar_productos_por_palabra', methods=["GET", "OPTIONS"])
def buscar_productos_por_palabra():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return ProductosServices.buscar_producto_por_palabra()