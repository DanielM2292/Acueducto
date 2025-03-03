from flask import jsonify, current_app, request
from app.models import Auditoria, Matriculas, Clientes, Matricula_cliente, Multa_clientes, Facturas
import MySQLdb

class MatriculasServices:
    @staticmethod
    def crear_matricula(data):
        mysql = current_app.mysql
        custom_id_matricula = Auditoria.generate_custom_id(mysql, "MAT", "id_matricula", "matriculas")
        custom_id_matricula_audi = Auditoria.generate_custom_id(mysql, "AUD", "id_auditoria", "auditoria")
        custom_id_matricula_cliente = Auditoria.generate_custom_id(mysql, "MAC", "id_matricula_cliente", "matricula_cliente")
        try:
            numero_documento = data.get("numero_documento")
            valor_matricula = data.get("valor_matricula")
            numero_matricula = Matriculas.nuevo_numero_matricula(mysql)
            tipo_tarifa = data.get("tipo_tarifa")
            direccion = data.get("direccion")
            
            # Traer cliente con el mismo numero de documento
            id_cliente = Clientes.verificar_cliente(mysql, numero_documento)
            if not id_cliente:
                return jsonify({'error': 'Cliente no encontrado'}), 404
            
            Matriculas.agregar_matricula(mysql, custom_id_matricula, numero_matricula, valor_matricula, tipo_tarifa)
            Auditoria.log_audit(mysql, custom_id_matricula_audi, "matriculas", custom_id_matricula, "INSERT", "ADM0001",f'Se agrega matricula {custom_id_matricula}')

            custom_id_matricula_cliente_audi = Auditoria.generate_custom_id(mysql, "AUD", "id_auditoria", "auditoria")
            # Asociar el cliente con la matricula nueva
            Matricula_cliente.asociar_matricula_cliente(mysql, custom_id_matricula_cliente, custom_id_matricula, id_cliente, direccion, 'ESC0001')
            Auditoria.log_audit(mysql, custom_id_matricula_cliente_audi, "matricula_cliente", custom_id_matricula_cliente, "INSERT", "ADM0001",f'Se asocia la matricula {custom_id_matricula} al cliente {id_cliente}')

            return jsonify({"message": "Matrícula creada y vinculada exitosamente", "id_matricula": custom_id_matricula, "numero_matricula": numero_matricula}), 201              
        except Exception as e:
            return jsonify({"message": f"Error al crear y vincular matrícula: {str(e)}"}), 500

    @staticmethod
    def actualizar_matricula(data):
        mysql = current_app.mysql
        custom_id = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        try:
            id_matricula = data.get("id_matricula")
            valor_matricula = data.get("valor_matricula")
            tipo_tarifa = data.get("tipo_tarifa")
            direccion = data.get("direccion")
            
            Matriculas.actualizar_matricula(mysql, valor_matricula, tipo_tarifa, id_matricula)
            Auditoria.log_audit(mysql,custom_id,"matriculas", id_matricula, "UPDATE","ADM0001", "Se actualiza matricula matricula")
            
            Matricula_cliente.actualizar_direccion(mysql, direccion, id_matricula)
            
            return jsonify({"message": "Matrícula actualizada exitosamente"}), 200
        except MySQLdb.Error as e:
            return jsonify({"message": f"Error en la base de datos: {str(e)}"}), 500
        except Exception as e:
            print(f"Error al actualizar matrícula: {str(e)}")
            return jsonify({"message": f"Error al actualizar matrícula: {str(e)}"}), 500
    
    @staticmethod
    def buscar_matricula():
        mysql = current_app.mysql
        try:
            id_matricula = request.args.get("id_matricula")
            
            matricula = Matriculas.verificar_matricula(mysql, id_matricula)

            if matricula:
                return jsonify(matricula)
            return jsonify({"message": "Matrícula no encontrada"}), 404
        except Exception as e:
            return jsonify({"message": f"Error al buscar matrícula: {str(e)}"}), 500
    
    @staticmethod
    def listar_todas_matriculas():
        mysql = current_app.mysql
        try:
            matriculas = Matriculas.obtener_todas_matriculas(mysql)
            return jsonify(matriculas), 200
        except Exception as e:
            return jsonify({"message": f"Error al listar todas las matrículas: {str(e)}"}), 500
    
    @staticmethod
    def buscar_matricula_por_documento():
        mysql = current_app.mysql
        try:
            numero_documento = request.args.get("numero_documento")
            
            matricula = Matriculas.buscar_matricula_documento(mysql, numero_documento)
            if matricula:
                return jsonify(matricula), 200
            return jsonify({"message": "Matrícula no encontrada"}), 404
        except Exception as e:
            return jsonify({"message": f"Error al buscar matrícula: {str(e)}"}), 500

    @staticmethod
    def obtener_matricula():
        mysql = current_app.mysql
        try:
            id_matricula = request.args.get("id_matricula")
            matricula = Matriculas.buscar_matricula(mysql, id_matricula)

            if not matricula:
                return jsonify({'error': 'Matricula no encontrada'}), 404
            return jsonify(matricula), 200
            
        except Exception as e:
            return jsonify({"message": f"Error al obtener el id_matricula: {str(e)}"})
    
    @staticmethod
    def actualizar_estado(data):
        mysql = current_app.mysql
        try:
            id_matricula = data.get("id_matricula")
            id_estado_cliente = data.get("estado")

            print(f"Solicitud de actualización - Matrícula: {id_matricula}, Nuevo Estado: {id_estado_cliente}")  # Debug

            if not id_matricula or not id_estado_cliente:
                return jsonify({'error': 'Datos incompletos para actualizar'}), 400

            # Comprobar si el estado existe en la tabla estado_clientes
            cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
            cursor.execute("SELECT COUNT(*) AS count FROM estado_clientes WHERE id_estado_cliente = %s", (id_estado_cliente,))
            estado_existente = cursor.fetchone()
            cursor.close()

            print(f"Estado encontrado en DB: {estado_existente}")  # Debug

            if estado_existente["count"] == 0:
                return jsonify({'error': f'Estado {id_estado_cliente} inválido'}), 400

            # ACTUALIZAR ESTADO EN LA BASE DE DATOS
            cursor = mysql.connection.cursor()
            query = "UPDATE matricula_cliente SET id_estado_cliente = %s WHERE id_matricula = %s"
            values = (id_estado_cliente, id_matricula)

            print(f"Ejecutando SQL: {query} con valores {values}")  # Debug

            cursor.execute(query, values)
            mysql.connection.commit()
            cursor.close()

            print(f"Estado actualizado correctamente a {id_estado_cliente}")  # Debug

            return jsonify({"message": "Estado de la matrícula actualizado correctamente"}), 200

        except Exception as e:
            print(f"Error al actualizar el estado de la matrícula: {str(e)}")  # Debug
            return jsonify({"message": f"Error al actualizar el estado: {str(e)}"}), 500
   
    @staticmethod
    def buscar_numero_matricula():
        mysql = current_app.mysql
        try:
            numero_matricula = request.args.get("numero_matricula")
            
            tipo_tarifa = Matriculas.obtener_tipo(mysql, numero_matricula)
            tipo_tarifa = tipo_tarifa['tipo_tarifa']
            
            if tipo_tarifa == 'Medidor':
                datos_cliente = Matricula_cliente.obtener_datos_factura(mysql, numero_matricula)
                cliente = Matricula_cliente.obtener_id_matricula_cliente(mysql, numero_matricula)
                id_matricula_cliente = cliente['id_matricula_cliente']
                lectura_anterior = Facturas.get_ultima_lectura(mysql, id_matricula_cliente)
                multas = Multa_clientes.obtener_multas(mysql, id_matricula_cliente)
                
                datos_cliente.update(multas or {})
                datos_cliente.update(lectura_anterior or {})
                datos_cliente.update({'numero_matricula': numero_matricula})
                return jsonify(datos_cliente), 200
            else:
                return jsonify({'error': 'Esta matricula no es valida para crear una factura de medidor'}), 409
            
        except Exception as e:
            return jsonify({"message": f"Error al obtener el id_matricula: {str(e)}"})
    