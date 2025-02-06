from flask import jsonify, current_app
from app.models import Ingresos, Auditoria

class IngresosServices:
    @staticmethod
    def listar_ingresos():
        mysql = current_app.mysql
        try:
            ingresos = Ingresos.listar_ingresos(mysql)
            return jsonify(ingresos), 200
        except Exception as e:
            return jsonify({"message": f"Error al actualizar matrícula: {str(e)}"}), 500