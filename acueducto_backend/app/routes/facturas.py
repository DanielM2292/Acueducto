from flask import Blueprint, Flask
from app.services import FacturasServices
from app.routes import facturas_bp

@facturas_bp.route('/generarFacturas', methods=['POST'])
def generar_facturas():
    return FacturasServices.generar_facturas()