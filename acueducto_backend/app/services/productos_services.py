from flask import jsonify, current_app, session, request
from app.models import Inventario, Auditoria, Ingresos, User, Egresos

class ProductosServices:
    @staticmethod
    def agregar_producto(data):
        mysql = current_app.mysql
        if "user" not in session:
            return jsonify({'message': 'Unauthorized'}), 401
        custom_id_producto = Auditoria.generate_custom_id(mysql, 'PRO', 'id_producto', 'inventario')
        custom_id_auditoria = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        custom_id_ingreso = Auditoria.generate_custom_id(mysql, 'ING', 'id_ingreso', 'ingresos')
        custom_id_egreso = Auditoria.generate_custom_id(mysql, 'EGR', 'id_egreso', 'egresos')
        
        try:
            user_name = data.get('nombre_usuario')
            user = User.get_user_by_username(mysql, user_name)
            id_administrador = user['id_administrador']
            descripcion_producto = data.get("descripcion_producto")
            cantidad = int(data.get("cantidad"))
            valor_producto = int(data.get("valor_producto"))
            total_productos = cantidad * valor_producto
            
            Inventario.add_product(mysql,custom_id_producto, descripcion_producto, cantidad, valor_producto, total_productos)
            Ingresos.crear_ingreso_producto(mysql, custom_id_ingreso, f'Se agrega producto {descripcion_producto} al inventario', 0, custom_id_producto)
            Egresos.crear_egreso_general(mysql, custom_id_egreso, f'Egreso de efectivo para compra de producto {descripcion_producto}', cantidad, total_productos)
            Auditoria.log_audit(mysql, custom_id_auditoria, "inventario", custom_id_producto, "INSERT", id_administrador, "Se agrega producto al inventario")
            return jsonify({"message": "Producto agregado exitosamente"}), 201
        except Exception as e:
            return jsonify({"message": f"Error al agregar producto: {str(e)}"}), 500
    
    #QUITAR?
    @staticmethod
    def buscar_producto():
        mysql = current_app.mysql
        try:
            id_producto = request.args.get("id_producto")
            product = Inventario.get_product_by_id(mysql, id_producto)
            if product:
                return jsonify(product)
            return jsonify({"message": "Producto no encontrado"}), 404
        except Exception as e:
            return jsonify({"message": f"Error al buscar producto: {str(e)}"}), 500
    
    @staticmethod
    def actualizar_producto(data):
        mysql = current_app.mysql
        if "user" not in session:
            return jsonify({'message': 'Unauthorized'}), 401
        custom_id_auditoria = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        try:
            user_name = data.get('nombre_usuario')
            user = User.get_user_by_username(mysql, user_name)
            id_administrador = user['id_administrador']
            id_producto = request.args.get("id_producto")
            descripcion_producto = data.get("descripcion_producto")
            cantidad = int(data.get("cantidad"))
            valor_producto = int(data.get("valor_producto"))
            total_producto = cantidad * valor_producto
            
            Inventario.update_product_by_id(mysql, id_producto, descripcion_producto, cantidad, valor_producto, total_producto)
            id_ingreso = Ingresos.buscar_ingreso_producto(mysql, id_producto)
            id_ingreso = id_ingreso['id_ingreso']
            Ingresos.actualizar_ingreso(mysql, id_ingreso, f'Se agrega producto {descripcion_producto} al inventario', total_producto)
            Auditoria.log_audit(mysql, custom_id_auditoria, "inventario", id_producto, "UPDATE", id_administrador, "Se actualiza producto del inventario")
            return jsonify({"message": "Producto actualizado exitosamente"}), 200
        except Exception as e:
            return jsonify({"message": f"Error al actualizar producto: {str(e)}"}), 500    
    
    @staticmethod
    def eliminar_producto():
        mysql = current_app.mysql
        if "user" not in session:
            return jsonify({'message': 'Unauthorized'}), 401
        custom_id_auditoria = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        try:
            user_name = request.args.get('nombre_usuario')
            user = User.get_user_by_username(mysql, user_name)
            id_administrador = user['id_administrador']
            id_producto = request.args.get("id_producto")
            Inventario.delete_product_by_id(mysql, id_producto)
            Auditoria.log_audit(mysql, custom_id_auditoria, "inventario", id_producto, "DELETE", id_administrador, "Se borra el producto")
            return jsonify({"message": "Producto eliminado exitosamente"}), 200
        except Exception as e:
            return jsonify({"message": f"Error al eliminar producto: {str(e)}"}), 500
    
    @staticmethod
    def buscar_todos_productos():
        mysql = current_app.mysql
        try:
            products = Inventario.get_all_products(mysql)
            return jsonify(products)
        except Exception as e:
            return jsonify({"message": f"Error al obtener productos: {str(e)}"}), 500
    
    @staticmethod
    def buscar_producto_por_palabra():
        mysql = current_app.mysql
        try:
            palabra_clave = request.args.get("palabra_clave")
            products = Inventario.search_products_by_keyword(mysql, palabra_clave)
            return jsonify(products)
        except Exception as e:
            return jsonify({"message": f"Error al buscar productos: {str(e)}"}), 500    