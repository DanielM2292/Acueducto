from flask import jsonify, current_app, request
from app.models import Ingresos, Auditoria

class IngresosServices:
    @staticmethod
    def listar_ingresos():
        mysql = current_app.mysql
        try:
            ingresos = Ingresos.listar_ingresos(mysql)
            return jsonify(ingresos), 200
        except Exception as e:
            return jsonify({"message": f"Error al listar ingresos: {str(e)}"}), 500
    
    @staticmethod
    def crear_ingreso(data):
        mysql = current_app.mysql
        try:
            descripcion_ingreso = data.get('descripcionIngreso')
            valor_ingreso = data.get('valorIngreso')
            custom_id = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
            custom_id_ingreso = Auditoria.generate_custom_id(mysql, 'ING', 'id_ingreso', 'ingresos')
            
            Ingresos.crear_ingreso(mysql, custom_id_ingreso, descripcion_ingreso, valor_ingreso)
            Auditoria.log_audit(mysql, custom_id, 'ingresos', custom_id_ingreso, 'INSERT', 'ADM0001', 'Ingreso general')
            
            return jsonify({"message": "Se crea ingreso correctamente"}), 200
        except Exception as e:
            return jsonify({"message": f"Error al crear ingreso: {str(e)}"}), 500
    
    @staticmethod
    def buscar_ingreso():
        mysql = current_app.mysql
        try:
            data = request.get_json()
            palabra = data.get("buscar_ingreso")
            if not palabra:
                return jsonify({"message": "Término de búsqueda requerido"}), 400
                
            ingreso = Ingresos.buscar_ingreso(mysql, palabra)
            if ingreso:
                return jsonify(ingreso)
            return jsonify({"message": "No se encontró ingreso"}), 404
                
        except Exception as e:
            return jsonify({"message": f"Error al buscar ingreso: {str(e)}"}), 500
        
    @staticmethod
    def actualizar_ingreso(data):
        mysql = current_app.mysql
        try:
            id_ingreso = data.get('id_ingreso')
            descripcion_ingreso = data.get('descripcionIngreso')
            valor_ingreso = data.get('valorIngreso')
            custom_id = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
            print(id_ingreso, descripcion_ingreso, valor_ingreso)
            Ingresos.actualizar_ingreso(mysql, id_ingreso, descripcion_ingreso, valor_ingreso)
            Auditoria.log_audit(mysql, custom_id, 'ingresos', id_ingreso, 'UPDATE', 'ADM0001', f'Se actualiza el ingreso {id_ingreso}')
            
            return jsonify({"message": "Ingreso actualizado correctamente"}), 200
        except Exception as e:
            return jsonify({"message": f"Error al actualizar ingreso: {str(e)}"}), 500