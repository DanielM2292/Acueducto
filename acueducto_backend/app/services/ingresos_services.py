from flask import jsonify, current_app, request, session
from app.models import Ingresos, Auditoria, User

class IngresosServices:
    @staticmethod
    def listar_ingresos():
        mysql = current_app.mysql
        try:
            ingresos = Ingresos.listar_ingresos(mysql)
            for ingreso in ingresos:
                ingreso['fecha_ingreso'] = ingreso['fecha_ingreso'].isoformat()
            return jsonify(ingresos), 200
        except Exception as e:
            return jsonify({"message": f"Error al listar ingresos: {str(e)}"}), 500
    
    @staticmethod
    def crear_ingreso(data):
        mysql = current_app.mysql
        if "user" not in session:
            return jsonify({'message': 'Unauthorized'}), 401
        try:
            user_name = data.get('nombre_usuario')
            user = User.get_user_by_username(mysql, user_name)
            id_administrador = user['id_administrador']
            descripcion_ingreso = data.get('descripcionIngreso')
            valor_ingreso = data.get('valorIngreso')
            custom_id = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
            custom_id_ingreso = Auditoria.generate_custom_id(mysql, 'ING', 'id_ingreso', 'ingresos')
            
            Ingresos.crear_ingreso(mysql, custom_id_ingreso, descripcion_ingreso, valor_ingreso)
            Auditoria.log_audit(mysql, custom_id, 'ingresos', custom_id_ingreso, 'INSERT', id_administrador, 'Ingreso general')
            
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
        if "user" not in session:
            return jsonify({'message': 'Unauthorized'}), 401
        try:
            user_name = data.get('nombre_usuario')
            user = User.get_user_by_username(mysql, user_name)
            id_administrador = user['id_administrador']
            id_ingreso = data.get('idIngreso')
            descripcion_ingreso = data.get('descripcionIngreso')
            valor_ingreso = data.get('valorIngreso')
            custom_id = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
            
            otro_ingreso = Ingresos.verificar_ingreso(mysql, id_ingreso)
            
            if otro_ingreso == {'id_matricula': None, 'id_factura': None, 'id_producto': None, 'id_multa': None}:
                Ingresos.actualizar_ingreso(mysql, id_ingreso, descripcion_ingreso, valor_ingreso)
                Auditoria.log_audit(mysql, custom_id, 'ingresos', id_ingreso, 'UPDATE', id_administrador, f'Se actualiza el ingreso {id_ingreso}')
            
                return jsonify({"message": "Ingreso actualizado correctamente"}), 200
            else:
                return jsonify({"message": "No se puede actualizar el registro debido a restricciones de tipo"}), 409
            
        except Exception as e:
            return jsonify({"message": f"Error al actualizar ingreso: {str(e)}"}), 500