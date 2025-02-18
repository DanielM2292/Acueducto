from flask import jsonify, current_app, request
from app.models import Egresos, Auditoria, Inventario

class EgresosServices:
    @staticmethod
    def listar_egresos():
        mysql = current_app.mysql
        try:
            egresos = Egresos.listar_egresos(mysql)
            for egreso in egresos:
                egreso['fecha_egreso'] = egreso['fecha_egreso'].isoformat()
            return jsonify(egresos), 200
        except Exception as e:
            return jsonify({"message": f"Error al actualizar matrícula: {str(e)}"}), 500
    
    @staticmethod
    def crear_egreso(data):
        mysql = current_app.mysql
        try:
            descripcion_egreso = data.get("descripcionEgreso")
            cantidad = data.get("cantidadEgreso")
            total_egreso = data.get("valorEgreso")
            id_producto = data.get("idProducto")
            cantidad = int(cantidad)
            custom_id = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
            custom_id_egreso = Auditoria.generate_custom_id(mysql, 'EGR', 'id_egreso', 'egresos')
            
            if not id_producto:
                Egresos.crear_egreso_general(mysql, custom_id_egreso, descripcion_egreso, cantidad, total_egreso)
                Auditoria.log_audit(mysql, custom_id, 'egresos', custom_id_egreso, 'INSERT', 'ADM0001', f'Se crea egreso {custom_id_egreso}')
                return jsonify({"message": "Egreso registrado correctamente"}), 200
            else:
                producto = Inventario.get_product_by_id(mysql, id_producto)
                descripcion_egreso = producto["descripcion_producto"]
                cantidad_producto = int(producto["cantidad"])
                valor_producto = int(producto["valor_producto"])
                custom_id_aud = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
                
                if cantidad > cantidad_producto:
                    return jsonify({'error': 'La cantidad no puede ser mayor al total de inventario'}), 400
                total_egreso = valor_producto * cantidad
                
                Egresos.crear_egreso_producto(mysql, custom_id_egreso, descripcion_egreso, cantidad, total_egreso, id_producto)
                Auditoria.log_audit(mysql, custom_id, 'egresos', custom_id_egreso, 'INSERT', 'ADM0001', f'Se crea egreso de inventario{custom_id_egreso}')
                
                nueva_cantidad = cantidad_producto-cantidad
                nuevo_total = valor_producto * nueva_cantidad
                Inventario.update_product_by_id(mysql, id_producto, descripcion_egreso, nueva_cantidad, valor_producto, nuevo_total )
                Auditoria.log_audit(mysql, custom_id_aud, 'intentario', id_producto, 'UPDATE', 'ADM0001', f'Se cambia registro del producto {id_producto} desde modulo egresos')
                return jsonify({"message": "Egreso de producto registrado correctamente"}), 200
            
        except Exception as e:
            return jsonify({"message": f"Error al crear egreso: {str(e)}"})
    
    @staticmethod
    def buscar_egreso():
        mysql = current_app.mysql
        try:
            palabra = request.args.get("buscar_egreso")
            egreso = Egresos.buscar_egreso(mysql, palabra)
            if egreso:
                return jsonify(egreso)
            return jsonify({"message": "No se encontro egreso"}), 404
            
        except Exception as e:
            return jsonify({"message": f"Error al buscar egreso: {str(e)}"}), 500
    
    @staticmethod
    def actualizar_egreso(data):
        mysql = current_app.mysql
        try:
            print('entra aqui')
            descripcion_egreso = data.get('descripcionEgreso')
            cantidad = data.get('cantidadEgreso')
            total_egreso = data.get('valorEgreso')
            id_producto = data.get('idProducto')
            cantidad = int(cantidad)
            # Ojo aqui porque seria mejor que se pudiera seleccionar el egreso y ahi actualizar y que aparezca en pantalla el id_egreso
            id_egreso = Egresos.obtener_id_egreso(mysql, id_producto)
            id_egreso = id_egreso['id_egreso']
            print(id_egreso)
            custom_id = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
            
            if not id_producto:
                Egresos.actualizar_egreso_general(mysql, id_egreso, descripcion_egreso, cantidad, total_egreso)
                Auditoria.log_audit(mysql, custom_id, 'egresos', id_egreso, 'UPDATE', 'ADM0001', f'Se actualiza el egreso general {id_egreso}')
                return jsonify({"message": "Egreso actualizado correctamente"}), 200
            else:
                print('entra cuando hay id para actualizar')
                custom_id_aud = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
                producto_egreso = Egresos.obtener_egreso(mysql, id_egreso)
                print(producto_egreso)
                cantidad_producto_egreso = producto_egreso["cantidad"]
                cantidad_producto_egreso = int(cantidad_producto_egreso)
                
                producto = Inventario.get_product_by_id(mysql, id_producto)
                descripcion_egreso = producto["descripcion_producto"]
                cantidad_producto = int(producto["cantidad"])
                valor_producto = int(producto["valor_producto"])
                
                cantidad_total_producto = cantidad_producto + cantidad_producto_egreso
                
                if cantidad > cantidad_total_producto:
                    return jsonify({'error': 'La cantidad no puede ser mayor al total de inventario'}), 400
                total_egreso = valor_producto * cantidad
                
                Egresos.actualizar_egreso_general(mysql, id_egreso, descripcion_egreso, cantidad, total_egreso)
                Auditoria.log_audit(mysql, custom_id, 'egresos', id_egreso, 'UPDATE', 'ADM0001', f'Se actualiza el egreso general {id_egreso}')
                
                nueva_cantidad = cantidad_total_producto-cantidad
                nuevo_total = valor_producto * nueva_cantidad
                print('pasa qui')
                Inventario.update_product_by_id(mysql, id_producto, descripcion_egreso, nueva_cantidad, valor_producto, nuevo_total )
                #Auditoria.log_audit(mysql, custom_id_aud, 'intentario', id_producto, 'UPDATE', 'ADM0001', f'Se cambia registro del producto {id_producto} desde modulo egresos')
                return jsonify({"message": "Egreso de producto actualizado correctamente"}), 200
        
        except Exception as e:
            return jsonify({"message": f"Error al actualizar egreso: {str(e)}"}), 500