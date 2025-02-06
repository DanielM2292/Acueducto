from flask import Flask, request, jsonify
from app.services import EgresosServices
from app.routes import egresos_bp

@egresos_bp.route('/listar_todos_egresos', methods=['GET', 'OPTIONS'])
def listar_engresos():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return EgresosServices.listar_egresos()
