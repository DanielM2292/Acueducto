from flask import request, current_app, session, jsonify
import MySQLdb
from app.models import Clientes, Auditoria
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