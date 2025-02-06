from flask import Flask, request, jsonify
from app.services import IngresosServices
from app.routes import ingresos_bp

@ingresos_bp.route('/listar_todos_ingresos', methods=['GET', 'OPTIONS'])
def listar_ingresos():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return IngresosServices.listar_ingresos()

