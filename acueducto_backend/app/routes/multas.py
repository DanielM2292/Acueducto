from flask import request, jsonify
from app.services import MultasServices
from app.routes import multas_bp

@multas_bp.route('/crear_multa', methods=["POST", "OPTIONS"])
def crear_multa():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    data = request.get_json()
    return MultasServices.crear_multa(data)

@multas_bp.route('/listar_todas_multas', methods=["GET", "OPTIONS"])
def listar_todas_multas():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return MultasServices.listar_todas_multas()

@multas_bp.route('/buscar_matriculas_por_documento', methods=["GET", "OPTIONS"])
def buscar_matricula_por_documento():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return MultasServices.buscar_matriculas_por_documento()

@multas_bp.route('/actualizar_multa', methods=["PUT", "OPTIONS"])
def actualizar_multa():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    data = request.get_json()
    return MultasServices.actualizar_multa(data)