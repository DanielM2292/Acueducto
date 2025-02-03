from flask import jsonify, current_app, request
from app.models import Auditoria, Matriculas, Clientes, Matricula_cliente
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
            numero_matricula = "123"
            id_tarifa_estandar = data.get("tarifa_estandar")
            id_tarifa_medidor = data.get("tarifa_medidor")            
            # Traer todos los clientes con el mismo numero de documento
            clientes = Clientes.verificar_cliente(mysql, numero_documento)
            if clientes:
                cliente_sin_matricula = False
                for cliente in clientes:
                    id_matricula_cliente = cliente[1]
                    id_cliente = cliente[0]
                    if id_matricula_cliente is None:
                        print('entra al if para validar si tiene matriculas')
                        Matriculas.agregar_matricula(mysql, custom_id_matricula, numero_matricula, valor_matricula, id_tarifa_medidor, id_tarifa_estandar)
                        Auditoria.log_audit(mysql, custom_id_matricula_audi, "matriculas", custom_id_matricula, "INSERT", "ADM0001",f'Se agrega matricula {custom_id_matricula} con tarifa')
                        
                        custom_id_matricula_cliente_audi = Auditoria.generate_custom_id(mysql, "AUD", "id_auditoria", "auditoria")
                        # Asociar el cliente con la matricula nueva
                        Matricula_cliente.asociar_matricula_cliente(mysql,custom_id_matricula_cliente, custom_id_matricula, id_cliente)
                        Auditoria.log_audit(mysql, custom_id_matricula_cliente_audi, "matricula_cliente", custom_id_matricula_cliente, "INSERT", "ADM0001",f'Se asocia la matricula {custom_id_matricula} al cliente {id_cliente}')
                        # Asignar esa relacion matricula-cliente al cliente
                        Clientes.asociar_matricula_cliente_con_cliente(mysql, custom_id_matricula_cliente, id_cliente)
                        cliente_sin_matricula = True
                        break
                if cliente_sin_matricula:
                    return jsonify({"message": "Matrícula creada y vinculada exitosamente", "id_matricula": custom_id_matricula, "numero_matricula": numero_matricula}), 201    
                else:
                    return jsonify({"message": "El usuario ya tiene una matricula registrada"}), 401
            else:
                return jsonify({"message": "No se encontró ningún cliente sin matrícula"})            
        except Exception as e:
            print(f"Error al crear y vincular matrícula: {str(e)}") 
            return jsonify({"message": f"Error al crear y vincular matrícula: {str(e)}"}), 500

    @staticmethod
    def actualizar_matricula(data):
        mysql = current_app.mysql
        custom_id = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        try:
            id_matricula = data.get("id_matricula")
            valor_matricula = data.get("valor_matricula")
            id_tarifa_estandar = data.get("tarifa_estandar")
            id_tarifa_medidor = data.get("tarifa_medidor")
            
            Matriculas.actualizar_matricula(mysql, valor_matricula, id_tarifa_medidor, id_tarifa_estandar, id_matricula)
            Auditoria.log_audit(mysql,custom_id,"matriculas", id_matricula, "UPDATE","ADM0001", "Se actualiza el estado de la matricula")
            
            return jsonify({"message": "Matrícula actualizada exitosamente"}), 200
        except MySQLdb.Error as e:
            print(f"Error en la base de datos: {str(e)}")
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