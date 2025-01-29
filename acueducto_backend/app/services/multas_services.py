from flask import jsonify, current_app, session, request
from app.models import Auditoria, Clientes, Multas, Cliente_multa
import MySQLdb

class MultasServices:
    @staticmethod
    def crear_multa(data):
        mysql = current_app.mysql
        custom_id_multa = Auditoria.generate_custom_id(mysql, 'MUL', 'id_multa', 'multas')
        custom_id_multa_cliente = Auditoria.generate_custom_id(mysql, 'MUC', 'id_multas_clientes', 'multas_clientes')
        custom_id_multa_audi = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        try:
            motivo_multa = data.get("motivo_multa")
            valor_multa = data.get("valor_multa")
            numero_documento = data.get("numero_documento")
            # Verificar si el número de documento existe en la tabla de clientes
            cliente = Clientes.verificar_cliente(mysql, numero_documento)
            
            if not cliente:
                return jsonify({"message": "Cliente no encontrado"}), 404

            id_cliente = cliente[0]
            
            Multas.agregar_multa(mysql, custom_id_multa, motivo_multa, valor_multa, id_cliente)
            Auditoria.log_audit(mysql, custom_id_multa_audi, "multas", custom_id_multa, "INSERT", "ADM0001", f'Se agrega multa a cliente {id_cliente}')
            
            custom_id_multa_cliente_audi = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')

            # Asociar la multa al cliente
            Cliente_multa.asociar_cliente_multa(mysql, custom_id_multa_cliente, id_cliente, custom_id_multa)
            Auditoria.log_audit(mysql, custom_id_multa_cliente_audi, "multas_clientes", custom_id_multa_cliente, "INSERT", "ADM0001", "Se relaciona la multa agregada con el cliente")
            
            return jsonify({"message": "Multa creada y asociada exitosamente", "id_multa": custom_id_multa}), 201
        except MySQLdb.Error as e:
            return jsonify({"message": f"Error en la base de datos: {str(e)}"}), 500
        except Exception as e:
            return jsonify({"message": f"Error al crear y asociar multa: {str(e)}"}), 500
    
    @staticmethod
    def listar_todas_multas():
        mysql = current_app.mysql
        try:
            multas = Multas.mostrar_multas(mysql)
            return jsonify(multas), 200
        except Exception as e:
            return jsonify({"message": f"Error al listar multas: {str(e)}"}), 500    