from flask import jsonify, current_app
from app.models import Egresos, Auditoria

class EgresosServices:
    @staticmethod
    def listar_egresos():
        mysql = current_app.mysql
        try:
            egresos = Egresos.listar_egresos(mysql)
            return jsonify(egresos), 200
        except Exception as e:
            return jsonify({"message": f"Error al actualizar matrícula: {str(e)}"}), 500