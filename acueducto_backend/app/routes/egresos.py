from flask import Flask, request, jsonify
from app.services import EgresosServices
from app.routes import egresos_bp

@egresos_bp.route('/listar_todos_egresos', methods=['GET', 'OPTIONS'])
def listar_engresos():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return EgresosServices.listar_egresos()

@egresos_bp.route('/crear_egreso', methods=['POST', 'OPTIONS'])
def crear_egreso():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    data = request.get_json()
    return EgresosServices.crear_egreso(data)

@egresos_bp.route('/buscar_egreso', methods=['GET', 'OPTIONS'])
def buscar_egreso():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return EgresosServices.buscar_egreso()

@egresos_bp.route('/actualizar_egreso', methods=['PUT', 'OPTIONS'])
def actualizar_egreso():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    data = request.get_json()
    return EgresosServices.actualizar_egreso(data)
