from flask import jsonify, current_app, session, request
from app.models import Auditoria
import os

class MatriculasServices:
    @staticmethod
    def agregar_cliente_route():
        
        mysql = current_app.mysql