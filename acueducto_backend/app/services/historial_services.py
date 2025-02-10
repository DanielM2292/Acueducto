from flask import jsonify, current_app, session, request
from app.models import Auditoria

class HistorialServices:
    @staticmethod
    def mostar_registros():
        mysql = current_app.mysql
        
        try:            
            auditoria = Auditoria.mostrar_registros(mysql)
            if auditoria:
                return jsonify(auditoria)
            return jsonify({"message": "No existen registros"}), 404
        except Exception as e:
            return jsonify({"message": f"Error al mostrar registros: {str(e)}"}), 500