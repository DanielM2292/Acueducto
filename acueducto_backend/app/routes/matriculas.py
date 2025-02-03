from flask import request, jsonify
from app.services import MatriculasServices
from app.routes import matriculas_bp

@matriculas_bp.route('/crear_matricula', methods=["POST", "OPTIONS"])
def crear_matricula():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    data = request.get_json()
    return MatriculasServices.crear_matricula(data)

@matriculas_bp.route('/buscar_matricula', methods=["GET", "OPTIONS"])
def buscar_matricula():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return MatriculasServices.buscar_matricula()

@matriculas_bp.route('/listar_todas_matriculas', methods=["GET", "OPTIONS"])
def listar_todas_matriculas():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return MatriculasServices.listar_todas_matriculas()

@matriculas_bp.route('/actualizar_matricula', methods=["PUT", "OPTIONS"])
def actualizar_matricula():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    data = request.get_json()
    return MatriculasServices.actualizar_matricula(data)
    
@matriculas_bp.route('/buscar_matriculas_por_documento', methods=["GET", "OPTIONS"])
def buscar_matricula_por_documento():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return MatriculasServices.buscar_matricula_por_documento()
