from flask import jsonify, current_app, request
from app.models import Auditoria, Matriculas, Clientes
import MySQLdb

class MatriculasServices:
    @staticmethod
    def asociar_matricula(data):
        mysql = current_app.mysql
        cursor = None
        custom_id = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        try:
            numero_documento = data.get("numero_documento")
            id_matricula = data.get("id_matricula")
            id_administrador = data.get("id_administrador", "ADM0001")

            # Verificar si el cliente existe
            cliente = Clientes.verificar_cliente(mysql, numero_documento)
            if not cliente:
                return jsonify({"message": "Cliente no encontrado"}), 404

            id_cliente = cliente['id_cliente']

            # Verificar si la matrícula existe
            matricula = Matriculas.verificar_matricula(mysql, id_matricula)
            if not matricula:
                return jsonify({"message": "Matrícula no encontrada"}), 404

            cursor = mysql.connection.cursor()
            
            # Verificar si la matrícula ya está asociada al cliente
            cursor.execute('''
                SELECT id_matricula_cliente FROM matricula_cliente 
                WHERE id_matricula = %s AND id_cliente = %s
            ''', (id_matricula, id_cliente))
            
            if cursor.fetchone():
                return jsonify({"message": "La matrícula ya está asociada a este cliente"}), 400

            # Generar ID para la nueva asociación
            cursor.execute('SELECT MAX(CAST(SUBSTRING(id_matricula_cliente, 4) AS UNSIGNED)) FROM matricula_cliente')
            max_id = cursor.fetchone()[0]
            new_id = (max_id or 0) + 1
            id_matricula_cliente = f'MCL{new_id:03d}'

            # Crear la asociación en la tabla matricula_cliente
            cursor.execute('''
                INSERT INTO matricula_cliente (id_matricula_cliente, id_matricula, id_cliente)
                VALUES (%s, %s, %s)
            ''', (id_matricula_cliente, id_matricula, id_cliente))
            
            mysql.connection.commit()
            
            Auditoria.log_audit(
                mysql, 
                custom_id, 
                "matricula_cliente", 
                id_matricula_cliente, 
                "CREATE",  
                f'Se asocia la matrícula {id_matricula} al cliente {id_cliente}',
                id_administrador
            )
            return jsonify({
                "message": "Matrícula asociada exitosamente",
                "id_matricula_cliente": id_matricula_cliente
            }), 200
            
        except Exception as e:
            if cursor:
                mysql.connection.rollback()
            return jsonify({"message": f"Error al asociar matrícula: {str(e)}"}), 500
        finally:
            if cursor:
                cursor.close()

    @staticmethod
    def crear_matricula(data):
        mysql = current_app.mysql
        cursor = None
        try:
            cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
            # Validar datos requeridos
            numero_documento = data.get("numero_documento")
            valor_matricula = data.get("valor_matricula")
            id_estado_matricula = data.get("id_estado_matricula", "ESM0001")
            tipo_tarifa = data.get("tipo_tarifa", "estandar")
            id_administrador = data.get("id_administrador", "ADM0001")
        
            if not numero_documento:
                return jsonify({"message": "Número de documento es requerido"}), 400
        
            if valor_matricula is None:
                return jsonify({"message": "Valor de matrícula es requerido"}), 400

            # Verificar si el cliente existe y obtener su información
            cursor.execute('SELECT id_cliente FROM clientes WHERE numero_documento = %s', (numero_documento,))
            cliente = cursor.fetchone()
        
            if not cliente:
                return jsonify({"message": f"Cliente con documento {numero_documento} no encontrado"}), 404

            id_cliente = cliente['id_cliente']

            # Generar ID para la nueva matrícula
            cursor.execute('SELECT MAX(CAST(SUBSTRING(id_matricula, 4) AS UNSIGNED)) FROM matriculas')
            max_id = cursor.fetchone()['MAX(CAST(SUBSTRING(id_matricula, 4) AS UNSIGNED))']
            new_id = (max_id or 0) + 1
            id_matricula = f'MAT{new_id:03d}'
        
            # Determinar el tipo de tarifa y generar el ID correspondiente
            if tipo_tarifa.lower() == "estandar":
                cursor.execute('SELECT MAX(CAST(SUBSTRING(id_tarifa_estandar, 4) AS UNSIGNED)) FROM tarifas_estandar')
                max_tarifa_id = cursor.fetchone()['MAX(CAST(SUBSTRING(id_tarifa_estandar, 4) AS UNSIGNED))']
                new_tarifa_id = (max_tarifa_id or 0) + 1
                id_tarifa = f'TAE{new_tarifa_id:04d}'
                cursor.execute('''
                    INSERT INTO tarifas_estandar (id_tarifa_estandar, descripcion, tarifa_definida, fecha_inicio_tarifa)
                    VALUES (%s, %s, %s, NOW())
                ''', (id_tarifa, 'Tarifa Estándar', float(valor_matricula)))
            else:  # tipo_tarifa == "medidor"
                cursor.execute('SELECT MAX(CAST(SUBSTRING(id_tarifa_medidor, 4) AS UNSIGNED)) FROM tarifa_medidores')
                max_tarifa_id = cursor.fetchone()['MAX(CAST(SUBSTRING(id_tarifa_medidor, 4) AS UNSIGNED))']
                new_tarifa_id = (max_tarifa_id or 0) + 1
                id_tarifa = f'TAM{new_tarifa_id:04d}'
                cursor.execute('''
                    INSERT INTO tarifa_medidores (id_tarifa_medidor, descripcion_servicio, costo_metro3)
                    VALUES (%s, %s, %s)
                ''', (id_tarifa, 'Tarifa Medidor', float(valor_matricula)))
        
            # Agregar la matrícula con la referencia correcta a la tarifa
            if tipo_tarifa.lower() == "estandar":
                cursor.execute('''
                    INSERT INTO matriculas (id_matricula, numero_matricula, valor_matricula, 
                                     id_estado_matricula, id_tarifa_estandar, fecha_creacion) 
                    VALUES (%s, %s, %s, %s, %s, NOW())
                ''', (id_matricula, new_id, float(valor_matricula), id_estado_matricula, id_tarifa))
            else:
                cursor.execute('''
                    INSERT INTO matriculas (id_matricula, numero_matricula, valor_matricula, 
                                     id_estado_matricula, id_tarifa_medidor, fecha_creacion) 
                    VALUES (%s, %s, %s, %s, %s, NOW())
                ''', (id_matricula, new_id, float(valor_matricula), id_estado_matricula, id_tarifa))
        
            # Generar ID para la asociación matricula_cliente
            cursor.execute('SELECT MAX(CAST(SUBSTRING(id_matricula_cliente, 4) AS UNSIGNED)) FROM matricula_cliente')
            max_mcl_id = cursor.fetchone()['MAX(CAST(SUBSTRING(id_matricula_cliente, 4) AS UNSIGNED))']
            new_mcl_id = (max_mcl_id or 0) + 1
            id_matricula_cliente = f'MCL{new_mcl_id:03d}'
        
            # Crear la asociación en matricula_cliente
            cursor.execute('''
                INSERT INTO matricula_cliente (id_matricula_cliente, id_matricula, id_cliente)
                VALUES (%s, %s, %s)
            ''', (id_matricula_cliente, id_matricula, id_cliente))
        
            # Registrar en auditoría
            custom_id = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
            Auditoria.log_audit(
                mysql, 
                custom_id, 
                "matriculas", 
                id_matricula, 
                "CREATE",  
                f'Se crea la matrícula {id_matricula} para el cliente {id_cliente}',
                id_administrador
            )
        
            mysql.connection.commit()
        
            return jsonify({
                "message": "Matrícula creada y vinculada exitosamente",
                "id_matricula": id_matricula,
                "id_matricula_cliente": id_matricula_cliente,
                "numero_matricula": new_id,
                "id_tarifa": id_tarifa
            }), 201

        except MySQLdb.Error as e:
            if cursor:
                mysql.connection.rollback()
            print(f"MySQL Error: {str(e)}")
            return jsonify({"message": f"Error en la base de datos: {str(e)}"}), 500
        
        except Exception as e:
            if cursor:
                mysql.connection.rollback()
            print(f"Error detallado: {str(e)}")
            return jsonify({"message": f"Error al crear y vincular matrícula: {str(e)}"}), 500
        
        finally:
            if cursor:
                cursor.close()

    @staticmethod
    def actualizar_matricula(data):
        mysql = current_app.mysql
        cursor = None
        custom_id = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        try:
            cursor = mysql.connection.cursor()
            print(f"Datos recibidos: {data}")
            
            id_matricula = data.get("id_matricula")
            numero_documento = data.get("numero_documento")
            valor_matricula = data.get("valor_matricula")
            id_estado_matricula = data.get("id_estado_matricula")
            tipo_tarifa = data.get("tipo_tarifa")
            id_administrador = data.get("id_administrador", "ADM0001")  # Valor por defecto

            matricula = Matriculas.verificar_matricula(mysql, id_matricula)
            if not matricula:
                return jsonify({"message": "Matrícula no encontrada"}), 404
                
            cliente = Clientes.verificar_cliente(mysql, numero_documento)
            if not cliente:
                return jsonify({"message": "Cliente no encontrado"}), 404

            # Actualizar la matrícula
            cursor.execute('''
                UPDATE matriculas 
                SET valor_matricula = %s, 
                    id_estado_matricula = %s,
                    tipo_tarifa = %s
                WHERE id_matricula = %s
            ''', (float(valor_matricula), id_estado_matricula, tipo_tarifa, id_matricula))

            mysql.connection.commit()

            Auditoria.log_audit(
                mysql, 
                custom_id, 
                "matriculas", 
                id_matricula, 
                "UPDATE", 
                f"Se actualiza la matricula {id_matricula}",
                id_administrador
            )
            
            return jsonify({"message": "Matrícula actualizada exitosamente"}), 200
        except MySQLdb.Error as e:
            if cursor:
                mysql.connection.rollback()
            print(f"Error en la base de datos: {str(e)}")
            return jsonify({"message": f"Error en la base de datos: {str(e)}"}), 500
        except Exception as e:
            if cursor:
                mysql.connection.rollback()
            print(f"Error al actualizar matrícula: {str(e)}")
            return jsonify({"message": f"Error al actualizar matrícula: {str(e)}"}), 500
        finally:
            if cursor:
                cursor.close()
    
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
            print('Error al listar matrículas:', e)
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