from flask import request, jsonify
from app.services import PagosServices
from app.routes import pagos_bp

@pagos_bp.route('/listar_historial', methods=["GET", "OPTIONS"])
def listar_historial():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return PagosServices.listar_historial()

@pagos_bp.route('/registrar_pago_multa', methods=["POST", "OPTIONS"])
def registrar_pago_multa():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    data = request.get_json()
    return PagosServices.registrar_pago_multa(data)

@pagos_bp.route('/registrar_pago_matricula', methods=["POST", "OPTIONS"])
def registrar_pago_matricula():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    data = request.get_json()
    return PagosServices.registrar_pago_matricula(data)

@pagos_bp.route('/registrar_pago_factura', methods=["POST", "OPTIONS"])
def registrar_pago_factura():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    data = request.get_json()
    return PagosServices.registrar_pago_factura(data)