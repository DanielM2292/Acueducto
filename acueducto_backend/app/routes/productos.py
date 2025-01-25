from flask import request, current_app, session, jsonify
from app.models import Inventario, Auditoria
from app.services import ProductosServices
from app.routes import productos_bp

@productos_bp.route('/agregar_producto', methods=["POST"])
def agregar_producto():
    
    mysql = current_app.mysql
    
    custom_id_producto = Auditoria.generate_custom_id(mysql, 'PRO', 'id_producto', 'inventario')
    custom_id_auditoria = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
    
    try:
        data = request.get_json()
        descripcion_producto = data.get("descripcion_producto")
        cantidad = data.get("cantidad")
        valor_producto = data.get("valor_producto")
        current_user = session.get("id_administrador")
        
        Inventario.add_product(mysql,custom_id_producto, descripcion_producto, cantidad, valor_producto)
        return jsonify({"message": "Producto agregado exitosamente"}), 201
    except Exception as e:
        return jsonify({"message": f"Error al agregar producto: {str(e)}"}), 500

@productos_bp.route('/buscar_producto', methods=["GET"])
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

@productos_bp.route('/actualizar_producto', methods=["PUT"])
def actualizar_producto():
    
    mysql = current_app.mysql
    
    try:
        id_producto = request.args.get("id_producto")
        data = request.get_json()
        descripcion_producto = data.get("descripcion_producto")
        cantidad = data.get("cantidad")
        valor_producto = data.get("valor_producto")
        current_user = session.get("id_administrador")
        
        Inventario.update_product_by_id(mysql, id_producto, descripcion_producto, cantidad, valor_producto, current_user)
        return jsonify({"message": "Producto actualizado exitosamente"}), 200
    except Exception as e:
        return jsonify({"message": f"Error al actualizar producto: {str(e)}"}), 500

@productos_bp.route('/eliminar_producto', methods=["DELETE"])
def eliminar_producto():
    
    mysql = current_app.mysql
    
    try:
        id_producto = request.args.get("id_producto")
        current_user = session.get("id_administrador")
        Inventario.delete_product_by_id(mysql, id_producto, current_user)
        return jsonify({"message": "Producto eliminado exitosamente"}), 200
    except Exception as e:
        return jsonify({"message": f"Error al eliminar producto: {str(e)}"}), 500

@productos_bp.route('/buscar_todos_productos', methods=["GET"])
def buscar_todos_productos():
    
    mysql = current_app.mysql
    
    try:
        products = Inventario.get_all_products(mysql)
        return jsonify(products)
    except Exception as e:
        return jsonify({"message": f"Error al obtener productos: {str(e)}"}), 500

@productos_bp.route('/buscar_productos_por_palabra', methods=["GET"])
def buscar_productos_por_palabra():
    
    mysql = current_app.mysql
    
    try:
        palabra_clave = request.args.get("palabra_clave")
        products = Inventario.search_products_by_keyword(mysql, palabra_clave)
        return jsonify(products)
    except Exception as e:
        return jsonify({"message": f"Error al buscar productos: {str(e)}"}), 500