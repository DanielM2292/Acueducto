from flask import jsonify, current_app, request
from app.models import Auditoria, Matriculas, Clientes
import MySQLdb

class MatriculasServices:
    @staticmethod
    def asociar_matricula(data):
        mysql = current_app.mysql
        custom_id = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        try:    
            numero_documento = data.get("numero_documento")
            id_matricula = data.get("id_matricula")

            # Verificar si el cliente existe
            cliente = Clientes.verificar_cliente(mysql, numero_documento)
            if not cliente:
                return jsonify({"message": "Cliente no encontrado"}), 404

            id_cliente = cliente['id_cliente']

            # Verificar si la matrícula existe
            matricula = Matriculas.verificar_matricula(mysql, id_matricula)
            if not matricula:
                return jsonify({"message": "Matrícula no encontrada"}), 404

            # Asociar matrícula al cliente
            Clientes.asociar_matricula_cliente(mysql,id_matricula, id_cliente)
            Auditoria.log_audit(mysql, custom_id, "clientes", id_cliente, "UPDATE", "Pendiente",f'Se asocia la matricula {id_matricula} al cliente {id_cliente}')
            return jsonify({"message": "Matrícula asociada exitosamente"}), 200
        except Exception as e:
            return jsonify({"message": f"Error al asociar matrícula: {str(e)}"}), 500
    
    @staticmethod
    def crear_matricula(data):
        mysql = current_app.mysql
        try:
            cursor = mysql.connection.cursor()
            # Revisar, aqui generando un id para la nueva matricula?
            cursor.execute('SELECT MAX(CAST(SUBSTRING(id_matricula, 4) AS UNSIGNED)) FROM matriculas')
            max_id = cursor.fetchone()[0]
            if max_id:
                new_id = max_id + 1
            else:
                new_id = 1

            id_matricula = f'MAT{new_id:03d}'
            numero_matricula = new_id
            numero_documento = data.get("numero_documento")
            valor_matricula = data.get("valor_matricula", 0)
            id_estado_matricula = data.get("id_estado_matricula", "ESTMAT001")

            # Verificar si el número de documento existe en la tabla de clientes
            cliente = Clientes.verificar_cliente(mysql, numero_documento)
            
            if not cliente:
                return jsonify({"message": "Cliente no encontrado"}), 404

            id_cliente = cliente[0]  # Cambia 'cliente['id_cliente']' a 'cliente[0]'

            Matriculas.agregar_matricula(mysql, id_matricula, numero_matricula, numero_documento, valor_matricula, id_estado_matricula)
            Auditoria.log_audit(mysql, id_matricula, "clientes", id_cliente, "UPDATE", "Pendiente",f'Se asocia la matricula {id_matricula} al cliente {id_cliente}')
            
            # Actualizar el registro del cliente para vincular la matrícula
            Clientes.asociar_matricula_cliente(mysql,id_matricula, id_cliente)
            Auditoria.log_audit(mysql, id_matricula, "clientes", id_cliente, "UPDATE", "Pendiente",f'Se asocia la matricula {id_matricula} al cliente {id_cliente}')
            mysql.connection.commit()
            cursor.close()

            return jsonify({"message": "Matrícula creada y vinculada exitosamente", "id_matricula": id_matricula, "numero_matricula": numero_matricula}), 201
        except Exception as e:
            return jsonify({"message": f"Error al crear y vincular matrícula: {str(e)}"}), 500
    
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
            print('pasa aca')
            return jsonify({"message": f"Error al listar todas las matrículas aqui: {str(e)}"}), 500
    
    @staticmethod
    def actualizar_matricula(data):
        mysql = current_app.mysql
        custom_id = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        try:
            print(f"Datos recibidos: {data}")
            id_matricula = data.get("id_matricula")
            numero_documento = data.get("numero_documento")
            valor_matricula = data.get("valor_matricula")
            id_estado_matricula = data.get("id_estado_matricula")

            
            matricula = Matriculas.verificar_matricula(mysql, id_matricula)
            if not matricula:
                return jsonify({"message": "Matrícula no encontrada"}), 404

            Matriculas.actualizar_matricula(mysql, numero_documento, valor_matricula, id_estado_matricula, id_matricula)
            Auditoria.log_audit(mysql,custom_id,"matriculas", id_matricula, "UPDATE","pendiente", "Se actualiza el estado de la matricula")
            
            return jsonify({"message": "Matrícula actualizada exitosamente"}), 200
        except MySQLdb.Error as e:
            print(f"Error en la base de datos: {str(e)}")
            return jsonify({"message": f"Error en la base de datos: {str(e)}"}), 500
        except Exception as e:
            print(f"Error al actualizar matrícula: {str(e)}")
            return jsonify({"message": f"Error al actualizar matrícula: {str(e)}"}), 500
    
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