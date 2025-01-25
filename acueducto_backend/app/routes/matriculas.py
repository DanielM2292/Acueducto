from flask import request, current_app, session, jsonify
from app.models import Auditoria
from app.services import MatriculasServices
from app.routes import matriculas_bp
import MySQLdb

@matriculas_bp.route('/asociar_matricula', methods=["PUT"])
def asociar_matricula():
    
    mysql = current_app.mysql
    
    try:
        data = request.get_json()
        numero_documento = data.get("numero_documento")
        id_matricula = data.get("id_matricula")

        cursor = mysql.connection.cursor()

        # Verificar si el cliente existe
        cursor.execute('SELECT id_cliente FROM clientes WHERE numero_documento = %s', (numero_documento,))
        cliente = cursor.fetchone()
        if not cliente:
            return jsonify({"message": "Cliente no encontrado"}), 404

        id_cliente = cliente['id_cliente']

        # Verificar si la matrícula existe
        cursor.execute('SELECT * FROM matriculas WHERE id_matricula = %s', (id_matricula,))
        matricula = cursor.fetchone()
        if not matricula:
            return jsonify({"message": "Matrícula no encontrada"}), 404

        # Asociar matrícula al cliente
        cursor.execute('UPDATE clientes SET id_matricula = %s WHERE id_cliente = %s', (id_matricula, id_cliente))
        mysql.connection.commit()
        cursor.close()

        return jsonify({"message": "Matrícula asociada exitosamente"}), 200
    except Exception as e:
        return jsonify({"message": f"Error al asociar matrícula: {str(e)}"}), 500

@matriculas_bp.route('/crear_matricula', methods=["POST"])
def crear_matricula():
    
    mysql = current_app.mysql
    
    try:
        data = request.get_json()

        cursor = mysql.connection.cursor()
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
        cursor.execute('SELECT id_cliente FROM clientes WHERE numero_documento = %s', (numero_documento,))
        cliente = cursor.fetchone()
        if not cliente:
            return jsonify({"message": "Cliente no encontrado"}), 404

        id_cliente = cliente[0]  # Cambia 'cliente['id_cliente']' a 'cliente[0]'

        cursor.execute('INSERT INTO matriculas (id_matricula, numero_matricula, numero_documento, valor_matricula, id_estado_matricula, fecha_creacion) VALUES (%s, %s, %s, %s, %s, NOW())', 
                       (id_matricula, numero_matricula, numero_documento, valor_matricula, id_estado_matricula))

        # Actualizar el registro del cliente para vincular la matrícula
        cursor.execute('UPDATE clientes SET id_matricula = %s WHERE id_cliente = %s', (id_matricula, id_cliente))

        mysql.connection.commit()
        cursor.close()

        return jsonify({"message": "Matrícula creada y vinculada exitosamente", "id_matricula": id_matricula, "numero_matricula": numero_matricula}), 201
    except Exception as e:
        return jsonify({"message": f"Error al crear y vincular matrícula: {str(e)}"}), 500

@matriculas_bp.route('/buscar_matricula', methods=["GET"])
def buscar_matricula():
    
    mysql = current_app.mysql
    
    try:
        id_matricula = request.args.get("id_matricula")
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

        cursor.execute('SELECT * FROM matriculas WHERE id_matricula = %s', (id_matricula,))
        matricula = cursor.fetchone()
        cursor.close()

        if matricula:
            return jsonify(matricula)
        return jsonify({"message": "Matrícula no encontrada"}), 404
    except Exception as e:
        return jsonify({"message": f"Error al buscar matrícula: {str(e)}"}), 500

@matriculas_bp.route('/listar_todas_matriculas', methods=["GET"])
def listar_todas_matriculas():
    
    mysql = current_app.mysql
    
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM matriculas')
        matriculas = cursor.fetchall()
        cursor.close()
        return jsonify(matriculas), 200
    except Exception as e:
        print('pasa aca')
        return jsonify({"message": f"Error al listar todas las matrículas aqui: {str(e)}"}), 500

@matriculas_bp.route('/actualizar_matricula', methods=["PUT"])
def actualizar_matricula():
    
    mysql = current_app.mysql
    
    try:
        data = request.get_json()
        print(f"Datos recibidos: {data}")
        id_matricula = data.get("id_matricula")
        numero_documento = data.get("numero_documento")
        valor_matricula = data.get("valor_matricula")
        id_estado_matricula = data.get("id_estado_matricula")

        cursor = mysql.connection.cursor()
        cursor.execute('SELECT * FROM matriculas WHERE id_matricula = %s', (id_matricula,))
        matricula = cursor.fetchone()
        if not matricula:
            return jsonify({"message": "Matrícula no encontrada"}), 404

        cursor.execute('UPDATE matriculas SET numero_documento = %s, valor_matricula = %s, id_estado_matricula = %s WHERE id_matricula = %s', 
                       (numero_documento, valor_matricula, id_estado_matricula, id_matricula))

        # Registro en la tabla de auditoría
        cursor.execute('INSERT INTO auditoria (id_matricula, accion, id_estado_matricula, fecha, id_administrador) VALUES (%s, %s, %s, NOW(), %s)', 
                       (id_matricula, 'actualizar', id_estado_matricula, 'ID_ADMINISTRADOR'))

        mysql.connection.commit()
        cursor.close()
        return jsonify({"message": "Matrícula actualizada exitosamente"}), 200
    except MySQLdb.Error as e:
        print(f"Error en la base de datos: {str(e)}")
        return jsonify({"message": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        print(f"Error al actualizar matrícula: {str(e)}")
        return jsonify({"message": f"Error al actualizar matrícula: {str(e)}"}), 500


@matriculas_bp.route('/buscar_matricula_por_documento', methods=["GET"])
def buscar_matricula_por_documento():
    
    mysql = current_app.mysql
    
    try:
        numero_documento = request.args.get("numero_documento")

        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM matriculas WHERE numero_documento = %s', (numero_documento,))
        matricula = cursor.fetchall()
        cursor.close()

        if matricula:
            return jsonify(matricula), 200
        return jsonify({"message": "Matrícula no encontrada"}), 404
    except Exception as e:
        return jsonify({"message": f"Error al buscar matrícula: {str(e)}"}), 500
