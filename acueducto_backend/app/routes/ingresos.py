from flask import Flask, request, jsonify
from app.services import IngresosServices
from app.routes import ingresos_bp

@ingresos_bp.route('/listar_todos_ingresos', methods=['GET', 'OPTIONS'])
def listar_ingresos():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return IngresosServices.listar_ingresos()

@ingresos_bp.route('/crear_ingreso', methods=['POST', 'OPTIONS'])
def crear_ingreso():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    data = request.get_json()
    return IngresosServices.crear_ingreso(data)

@ingresos_bp.route('/buscar_ingreso', methods=['POST', 'OPTIONS'])
def buscar_ingreso():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return IngresosServices.buscar_ingreso()

@ingresos_bp.route('/actualizar_ingreso', methods=['PUT', 'OPTIONS'])
def actualizar_ingreso():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    data = request.get_json()
    return IngresosServices.actualizar_ingreso(data)