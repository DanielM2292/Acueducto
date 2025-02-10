from flask import request, jsonify
from app.services import HistorialServices
from app.routes import historial_bp

@historial_bp.route('/mostar_registros', methods=["GET", "OPTIONS"])
def mostar_registros():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return HistorialServices.mostar_registros()
