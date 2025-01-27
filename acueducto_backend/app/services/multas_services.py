from flask import jsonify, current_app, session, request
from app.models import Auditoria, Clientes, Multas, Cliente_multa
import MySQLdb

class MultasServices:
    @staticmethod
    def crear_multa(data):
        mysql = current_app.mysql
        custom_id_multa = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        custom_id_multa_cliente = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        try:
            cursor = mysql.connection.cursor()
            cursor.execute('SELECT MAX(CAST(SUBSTRING(id_multa, 5) AS UNSIGNED)) FROM multas')
            max_id = cursor.fetchone()[0]
            if max_id:
                new_id = max_id + 1
            else:
                new_id = 1

            id_multa = f'MULT{new_id:03d}'
            motivo_multa = data.get("motivo_multa")
            valor_multa = data.get("valor_multa")
            numero_documento = data.get("numero_documento")

            # Verificar si el número de documento existe en la tabla de clientes
            cliente = Clientes.verificar_cliente(mysql, numero_documento)
            if not cliente:
                return jsonify({"message": "Cliente no encontrado"}), 404

            id_cliente = cliente[0]
            Multas.agregar_multa(mysql, id_multa, motivo_multa, valor_multa)
            Auditoria.log_audit(mysql, custom_id_multa, "multas", id_multa, "INSERT", "Pendiente", "Se agrega multa a cliente")
            # Generar el ID para la relación cliente-multa
            cursor.execute('SELECT MAX(CAST(SUBSTRING(id_cliente_multa, 10) AS UNSIGNED)) FROM cliente_multas')
            max_rel_id = cursor.fetchone()[0]
            if max_rel_id:
                new_rel_id = max_rel_id + 1
            else:
                new_rel_id = 1

            id_cliente_multa = f'MULTCLI{new_rel_id:03d}'

            # Asociar la multa al cliente
            Cliente_multa.asociar_cliente_multa(mysql, id_cliente, id_multa, id_cliente_multa)
            Auditoria.log_audit(mysql, custom_id_multa_cliente, "multas_clientes", id_cliente_multa, "INSERT", "pendiener", "Se relaciona la multa agregada con el cliente")
            
            return jsonify({"message": "Multa creada y asociada exitosamente", "id_multa": id_multa}), 201
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