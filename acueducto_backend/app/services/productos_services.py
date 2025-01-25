from flask import jsonify, current_app, session, request
from app.models import Inventario, Auditoria
import os

class ProductosServices:
    @staticmethod
    def agregar_cliente_route():
        
        mysql = current_app.mysql