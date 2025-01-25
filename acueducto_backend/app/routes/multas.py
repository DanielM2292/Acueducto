from flask import request, current_app, session, jsonify
import MySQLdb
from app.models import Clientes, Auditoria
from app.services import ClientesServices
from app.routes import multas_bp

@multas_bp.route('/crear_multa', methods=["POST"])
def crear_multa():
    
    mysql = current_app.mysql
    
    try:
        data = request.get_json()

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
        cursor.execute('SELECT id_cliente FROM clientes WHERE numero_documento = %s', (numero_documento,))
        cliente = cursor.fetchone()
        if not cliente:
            return jsonify({"message": "Cliente no encontrado"}), 404

        id_cliente = cliente[0]

        cursor.execute('INSERT INTO multas (id_multa, motivo_multa, valor_multa) VALUES (%s, %s, %s)', 
                       (id_multa, motivo_multa, valor_multa))

        # Generar el ID para la relación cliente-multa
        cursor.execute('SELECT MAX(CAST(SUBSTRING(id_cliente_multa, 10) AS UNSIGNED)) FROM cliente_multas')
        max_rel_id = cursor.fetchone()[0]
        if max_rel_id:
            new_rel_id = max_rel_id + 1
        else:
            new_rel_id = 1

        id_cliente_multa = f'MULTCLI{new_rel_id:03d}'

        # Asociar la multa al cliente
        cursor.execute('INSERT INTO cliente_multas (id_cliente, id_multa, id_cliente_multa) VALUES (%s, %s, %s)', 
                       (id_cliente, id_multa, id_cliente_multa))

        mysql.connection.commit()
        cursor.close()

        return jsonify({"message": "Multa creada y asociada exitosamente", "id_multa": id_multa}), 201
    except MySQLdb.Error as e:
        return jsonify({"message": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"message": f"Error al crear y asociar multa: {str(e)}"}), 500

@multas_bp.route('/listar_todas_multas', methods=["GET"])
def listar_todas_multas():
    
    mysql = current_app.mysql
    
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''
            SELECT 
                m.id_multa, 
                m.motivo_multa, 
                m.valor_multa, 
                c.numero_documento 
            FROM multas m
            JOIN cliente_multas cm ON m.id_multa = cm.id_multa
            JOIN clientes c ON cm.id_cliente = c.id_cliente
        ''')
        multas = cursor.fetchall()
        cursor.close()
        return jsonify(multas), 200
    except Exception as e:
        return jsonify({"message": f"Error al listar multas: {str(e)}"}), 500