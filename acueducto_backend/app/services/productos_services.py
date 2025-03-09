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
            print(data)
            user_name = data.get('nombre_usuario')
            print(user_name)
            user = User.get_user_by_username(mysql, user_name)
            id_administrador = user['id_administrador']
            descripcion_producto = data.get("descripcion_producto")
            print(type(descripcion_producto), descripcion_producto)
            cantidad = int(data.get("cantidad"))
            print(type(cantidad), cantidad)
            valor_producto = int(data.get("valor_producto"))
            print(type(valor_producto), valor_producto)
            total_productos = cantidad * valor_producto
            
            existe_producto = Inventario.existe_producto(mysql, descripcion_producto)
            
            if existe_producto > 0:
                return jsonify({"message": "Error: Ya existe un producto con la misma descripción"}), 400

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
        custom_id_ingreso = Auditoria.generate_custom_id(mysql, 'ING', 'id_ingreso', 'ingresos')
        custom_id_egreso = Auditoria.generate_custom_id(mysql, 'EGR', 'id_egreso', 'egresos')
        
        try:
            data = request.get_json()
            print(data)
            
            user_name = data.get('nombre_usuario')
            user = User.get_user_by_username(mysql, user_name)
            id_administrador = user['id_administrador']
            
            id_producto = request.args.get("id_producto")
            descripcion_producto = data.get("descripcion_producto")
            cantidad = int(data.get("cantidad"))
            valor_producto = int(data.get("valor_producto"))
            total_producto = cantidad * valor_producto
            
            producto_actual = Inventario.get_product_by_id(mysql, id_producto)
            cantidad_base_datos = int(producto_actual['cantidad'])
            
            # Actualizamos el producto en cualquier caso
            Inventario.update_product_by_id(mysql, id_producto, descripcion_producto, cantidad, valor_producto, total_producto)
            
            # Si la cantidad original era 0 y la nueva es mayor a 0
            if cantidad_base_datos == 0 and cantidad > 0:
                # Intentamos crear un nuevo ingreso con el id_producto existente
                try:
                    # Crear un nuevo ingreso - asegúrate de que la función acepte el id_producto
                    print(f"Creando nuevo ingreso para producto {id_producto}")
                    Ingresos.crear_ingreso_producto(
                        mysql, 
                        custom_id_ingreso, 
                        f'Se reabastece producto {descripcion_producto} al inventario',
                        0,
                        id_producto  # Verificar que esta función acepte este parámetro
                    )
                    
                    # Crear un nuevo egreso
                    print(f"Creando nuevo egreso para producto {id_producto}")
                    Egresos.crear_egreso_general(
                        mysql, 
                        custom_id_egreso, 
                        f'Egreso de efectivo para reabastecimiento de producto {descripcion_producto}', 
                        cantidad, 
                        total_producto
                    )
                    
                    print("Ingresos y egresos creados correctamente")
                except Exception as inner_e:
                    print(f"Error al crear ingreso/egreso: {str(inner_e)}")
                    # Hacemos rollback de la actualización del producto si hay error
                    return jsonify({"message": f"Error al registrar movimientos: {str(inner_e)}"}), 500
            else:
                # Para productos que solo se actualizan sin pasar por 0
                try:
                    ingreso_existente = Ingresos.buscar_ingreso_producto(mysql, id_producto)
                    if ingreso_existente:
                        id_ingreso = ingreso_existente['id_ingreso']
                        Ingresos.actualizar_ingreso(
                            mysql, 
                            id_ingreso, 
                            f'Se actualiza producto {descripcion_producto} en el inventario', 
                            total_producto
                        )
                        print(f"Ingreso actualizado para producto {id_producto}")
                    else:
                        print(f"No se encontró ingreso para el producto {id_producto}")
                        # Si no existe ningún ingreso para este producto, creamos uno
                        Ingresos.crear_ingreso_producto(
                            mysql, 
                            custom_id_ingreso, 
                            f'Se actualiza producto {descripcion_producto} en el inventario', 
                            cantidad, 
                            total_producto,
                            id_producto
                        )
                        print(f"Nuevo ingreso creado para producto {id_producto}")
                except Exception as e:
                    print(f"Error al gestionar ingresos: {str(e)}")
                    # No devolvemos error, seguimos con la auditoría
            
            # Registrar en auditoría
            Auditoria.log_audit(
                mysql, 
                custom_id_auditoria, 
                "inventario", 
                id_producto, 
                "UPDATE", 
                id_administrador, 
                "Se actualiza producto del inventario"
            )   
            return jsonify({"message": "Producto actualizado exitosamente"}), 200
        
        except Exception as e:
            print(f"Error general en actualizar_producto: {str(e)}")
            return jsonify({"message": f"Error al actualizar producto: {str(e)}"}), 500
    
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