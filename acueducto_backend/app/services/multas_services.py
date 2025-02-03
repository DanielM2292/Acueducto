from flask import jsonify, current_app, request
import MySQLdb
from app.models import Auditoria, Multas, Clientes, Matriculas, Matricula_cliente

class MultasServices:
    @staticmethod
    def crear_multa(data):
        mysql = current_app.mysql
        custom_id_multa = Auditoria.generate_custom_id(mysql, 'MUL', 'id_multa', 'multas')
        custom_id_multa_audi = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        try:
            motivo_multa = data.get("motivo_multa")
            valor_multa = data.get("valor_multa")
            id_matricula = data.get("id_matricula")
            numero_documento = data.get("numero_documento")

            matricula_cliente = Matricula_cliente.verificar_id_matricula_cliente(mysql, id_matricula)
            id_matricula_cliente, id_multa = matricula_cliente[0]
            if not id_multa:
                # Crear la multa
                Multas.agregar_multa(mysql, custom_id_multa, motivo_multa, valor_multa)
                Auditoria.log_audit(mysql, custom_id_multa_audi, "multas", custom_id_multa, "INSERT", "ADM0001", f'Se agrega multa a cliente {numero_documento}')
                custom_id_matricula_cliente_audi = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
                
                # Asociar la multa al cliente
                Matricula_cliente.asociar_multa_matricula_cliente(mysql, custom_id_multa, id_matricula_cliente)
                Auditoria.log_audit(mysql, custom_id_matricula_cliente_audi, "matricula_cliente", id_matricula_cliente, "UPDATE", "ADM0001", f"Se relaciona la multa agregada con la matricula_cliente {id_matricula_cliente}")
                
                return jsonify({"message": "Multa creada y asociada exitosamente", "id_multa": custom_id_multa}), 201
            else:
                return jsonify({"message": "El cliente ya tiene una multa."}), 409
            
        except MySQLdb.Error as e:
            mysql.connection.rollback()
            return jsonify({"message": f"Error en la base de datos: {str(e)}"}), 500
        except Exception as e:
            mysql.connection.rollback()
            return jsonify({"message": f"Error al crear y asociar multa: {str(e)}"}), 500
        
    @staticmethod
    def listar_todas_multas():
        mysql = current_app.mysql
        try:
            multas = Multas.mostrar_multas(mysql)
            return jsonify(multas), 200
        except Exception as e:
            return jsonify({"message": f"Error al listar multas: {str(e)}"}), 500
    
    @staticmethod
    def buscar_matriculas_por_documento():
        mysql = current_app.mysql
        try:
            numero_documento = request.args.get("numero_documento")
            matriculas = Matriculas.buscar_matriculas_cliente(mysql, numero_documento)
            return jsonify(matriculas), 200
        except Exception as e:
            return jsonify({"message": f"Error al obtener matriculas de clientes: {str(e)}"})
    
    @staticmethod
    def actualizar_multa(data):
        mysql = current_app.mysql
        custom_id = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        try:
            id_matricula = data.get("id_matricula")
            motivo_multa = data.get("motivo_multa")
            valor_multa = data.get("valor_multa")
            
            id_multa = Matricula_cliente.obtener_id_multa(mysql, id_matricula)
            Multas.update_multa(mysql, motivo_multa, valor_multa, id_multa)
            Auditoria.log_audit(mysql, custom_id, "multas", id_multa, "UPDATE", "ADM0001", f"Se actualiza el valor y motivo de la multa {id_multa}")
            return jsonify({"message": "Se actualizo el valor y motivo de la multa correctamente"}), 200
        except Exception as e:
            return jsonify({"message": f"Error al actualizar el registro en multas: {str(e)}"})