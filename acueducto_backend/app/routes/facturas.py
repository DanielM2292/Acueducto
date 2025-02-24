from flask import Flask, request, jsonify
from app.services import FacturasServices
from app.routes import facturas_bp

@facturas_bp.route('/generarFacturasAutomaticas', methods=['POST', 'OPTIONS'])
def generarFacturasAutomaticas():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return FacturasServices.generarFacturasAutomaticas()

@facturas_bp.route('/listar_facturas', methods=['GET', 'OPTIONS'])
def listar_facturas():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return FacturasServices.listar_facturas()

@facturas_bp.route('/obtener_factura', methods=["GET", "OPTIONS"])
def obtener_factura():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return FacturasServices.obtener_factura()

@facturas_bp.route('/buscar_factura', methods=["GET", "OPTIONS"])
def buscar_factura():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return FacturasServices.buscar_factura()

@facturas_bp.route('/crear_factura', methods=['POST', 'OPTIONS'])
def crear_factura():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return FacturasServices.crear_factura()
