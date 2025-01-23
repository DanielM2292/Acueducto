from flask import Flask, jsonify, request, render_template, redirect, url_for, session
from config import Config
from flask_cors import CORS
import MySQLdb
from models import (
    init_db, get_user_by_username, add_user, check_password, get_users, 
    update_user, delete_user, get_all_products, get_product_by_id, 
    add_product, update_product_by_id, delete_product_by_id, 
    get_product_by_description, search_products_by_keyword, generate_custom_id,
    add_cliente, update_cliente, delete_cliente, get_all_clientes, 
    get_cliente_by_id, search_clientes_by_keyword
)

app = Flask(__name__)
app.secret_key = "cualquier_clave"
app.config.from_object(Config)
mysql = init_db(app)

CORS(app, 
    origins=["http://localhost:5173"],
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"])

def log_audit(mysql, action, table, id_registro, detalles, id_administrador):
    cursor = mysql.connection.cursor()
    id_auditoria = generate_custom_id('AUD', cursor, 'auditoria', 'id_auditoria')
    cursor.execute(
        'INSERT INTO auditoria (id_auditoria, tabla, id_registro_afectado, accion, id_administrador, detalles) VALUES (%s, %s, %s, %s, %s, %s)', 
        (id_auditoria, table, id_registro, action, id_administrador, detalles)
    )
    mysql.connection.commit()
    cursor.close()

@app.route('/')
def main():
    return render_template('login.html')

#Rutas Admin
@app.route('/verify_role', methods=["POST"])
def verify_role():
    user = request.form.get("email")
    password = request.form.get("password")
    user_data = get_user_by_username(mysql, user)

    if user_data and check_password(user_data['password'], password):
        return jsonify({"rol": user_data['id_rol']}), 200 
    else:
        return jsonify({"message": "Usuario o contraseña incorrectos"}), 400

@app.route('/login', methods=["POST"])
def login():
    user = request.form.get("email")
    password = request.form.get("password")
    rol = request.form.get("rol")
    user_data = get_user_by_username(mysql, user)

    if user_data and check_password(user_data['password'], password):
        session['user'] = user
        session['password'] = password
        session['rol'] = user_data['id_rol']
        session['id_administrador'] = user_data['id_administrador']
        return redirect(url_for('index'))
    else:
        return jsonify({"message": "Usuario o contraseña incorrectos"}), 400

@app.route('/index')
def index():
    if not session.get("user"):
        return redirect(url_for('main'))
    user_data = get_user_by_username(mysql, session["user"])
    if user_data and check_password(user_data['password'], session["password"]):
        if session["rol"] == "ROL001":
            return render_template('admin.html')
        elif session["rol"] == "ROL002":
            return render_template('contador.html')
        elif session["rol"] == "ROL003":
            return render_template('auxiliar.html')
    return redirect(url_for('main'))

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('main'))

# Rutas de Usuario
@app.route('/register', methods=["POST"])
def register():
    try:
        data = request.get_json()
        nombre = data.get("nombre")
        nombre_usuario = data.get("nombre_usuario")
        password = data.get("password")
        id_estado_empleado = data.get("id_estado_empleado")
        id_rol = data.get("id_rol")
        current_user = session.get("id_administrador")

        user = get_user_by_username(mysql, nombre_usuario)
        if user:
            return jsonify({"message": "Usuario ya existe"}), 400

        add_user(mysql, nombre, nombre_usuario, password, id_estado_empleado, id_rol, current_user)
        return jsonify({"message": "Usuario registrado exitosamente"}), 201
    except Exception as e:
        return jsonify({"message": f"Error al registrar usuario: {str(e)}"}), 500

@app.route('/listar_usuarios', methods=["GET"])
def listar_usuarios():
    try:
        users = get_users(mysql)
        for user in users:
            user['id_estado_empleado'] = (
                'Activo' if user['id_estado_empleado'] == 'ESTA001' else
                'Inactivo' if user['id_estado_empleado'] == 'ESTA002' else
                'Suspendido' if user['id_estado_empleado'] == 'ESTA003' else
                user['id_estado_empleado']
            )
            user['id_rol'] = (
                'Administrador' if user['id_rol'] == 'ROL001' else
                'Contador' if user['id_rol'] == 'ROL002' else
                'Secretario' if user['id_rol'] == 'ROL003' else
                user['id_rol']
            )
        return jsonify(users)
    except Exception as e:
        return jsonify({"message": f"Error al listar usuarios: {str(e)}"}), 500

@app.route('/actualizar_estado_usuario', methods=["PUT"])
def actualizar_estado_usuario():
    try:
        id_administrador = request.args.get("id_administrador")
        data = request.get_json()
        id_estado_empleado = data.get("id_estado_empleado")
        current_user = session.get("id_administrador")

        cursor = mysql.connection.cursor()
        cursor.execute('UPDATE administradores SET id_estado_empleado = %s WHERE id_administrador = %s', 
                    (id_estado_empleado, id_administrador))
        mysql.connection.commit()
        log_audit(mysql, 'UPDATE', 'administradores', id_administrador, f'Estado de usuario {id_administrador} actualizado', current_user)
        cursor.close()
        return jsonify({"message": "Estado del usuario actualizado exitosamente"}), 200
    except Exception as e:
        return jsonify({"message": f"Error al actualizar estado: {str(e)}"}), 500

# Rutas de Clientes
@app.route('/agregar_cliente', methods=["POST"])
def agregar_cliente_route():
    try:
        data = request.get_json()
        current_user = session.get("id_administrador")

        cursor = mysql.connection.cursor()
        id_cliente = generate_custom_id('CLI', cursor, 'clientes', 'id_cliente')

        # Determinar las tarifas a insertar
        id_tarifa_estandar = None
        id_tarifa_medidor = None

        if data.get("id_tarifa") in ["TAREST001", "TAREST002", "TAREST003", "TAREST004"]:
            id_tarifa_estandar = data.get("id_tarifa")
        elif data.get("id_tarifa") == "TARMED001":
            id_tarifa_medidor = data.get("id_tarifa")

        cursor.execute('INSERT INTO clientes (id_cliente, tipo_documento, numero_documento, nombre, telefono, direccion, id_estado_cliente, id_tarifa_estandar, id_tarifa_medidor) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)', 
                       (id_cliente, data.get("tipo_documento"), data.get("numero_documento"), data.get("nombre"), data.get("telefono"), data.get("direccion"), data.get("id_estado_cliente"), id_tarifa_estandar, id_tarifa_medidor))

        mysql.connection.commit()
        cursor.close()
        return jsonify({"message": "Cliente agregado exitosamente", "id_cliente": id_cliente}), 201
    except Exception as e:
        return jsonify({"message": f"Error al agregar cliente: {str(e)}"}), 500

@app.route('/buscar_cliente', methods=["GET"])
def buscar_cliente():
    try:
        id_cliente = request.args.get("id_cliente")
        cliente = get_cliente_by_id(mysql, id_cliente)
        if cliente:
            return jsonify(cliente)
        return jsonify({"message": "Cliente no encontrado"}), 404
    except Exception as e:
        return jsonify({"message": f"Error al buscar cliente: {str(e)}"}), 500

@app.route('/actualizar_cliente', methods=["PUT"])
def actualizar_cliente_route():
    try:
        id_cliente = request.args.get("id_cliente")
        data = request.get_json()
        current_user = session.get("id_administrador")

        # Determinar las tarifas a actualizar
        id_tarifa_estandar = None
        id_tarifa_medidor = None

        if data.get("id_tarifa") in ["TAREST001", "TAREST002", "TAREST003", "TAREST004"]:
            id_tarifa_estandar = data.get("id_tarifa")
        elif data.get("id_tarifa") == "TARMED001":
            id_tarifa_medidor = data.get("id_tarifa")

        update_cliente(
            mysql,
            id_cliente,
            data.get("tipo_documento"),
            data.get("numero_documento"),
            data.get("nombre"),
            data.get("telefono"),
            data.get("direccion"),
            data.get("id_estado_cliente"),
            id_tarifa_estandar,
            id_tarifa_medidor,
            current_user
        )
        return jsonify({"message": "Cliente actualizado exitosamente"}), 200
    except Exception as e:
        return jsonify({"message": f"Error al actualizar cliente: {str(e)}"}), 500

@app.route('/eliminar_cliente', methods=["DELETE"])
def eliminar_cliente_route():
    try:
        id_cliente = request.args.get("id_cliente")
        current_user = session.get("id_administrador")
        delete_cliente(mysql, id_cliente, current_user)
        return jsonify({"message": "Cliente eliminado exitosamente"}), 200
    except Exception as e:
        return jsonify({"message": f"Error al eliminar cliente: {str(e)}"}), 500

@app.route('/buscar_todos_clientes', methods=["GET"])
def buscar_todos_clientes():
    try:
        clientes = get_all_clientes(mysql)
        return jsonify(clientes)
    except Exception as e:
        return jsonify({"message": f"Error al obtener clientes: {str(e)}"}), 500

@app.route('/buscar_clientes_por_palabra', methods=["GET"])
def buscar_clientes_por_palabra():
    try:
        palabra_clave = request.args.get("palabra_clave")
        clientes = search_clientes_by_keyword(mysql, palabra_clave)
        return jsonify(clientes)
    except Exception as e:
        return jsonify({"message": f"Error al buscar clientes: {str(e)}"}), 500

# Rutas de Productos
@app.route('/agregar_producto', methods=["POST"])
def agregar_producto():
    try:
        data = request.get_json()
        descripcion_producto = data.get("descripcion_producto")
        cantidad = data.get("cantidad")
        valor_producto = data.get("valor_producto")
        current_user = session.get("id_administrador")
        
        add_product(mysql, descripcion_producto, cantidad, valor_producto, current_user)
        return jsonify({"message": "Producto agregado exitosamente"}), 201
    except Exception as e:
        return jsonify({"message": f"Error al agregar producto: {str(e)}"}), 500

@app.route('/buscar_producto', methods=["GET"])
def buscar_producto():
    try:
        id_producto = request.args.get("id_producto")
        product = get_product_by_id(mysql, id_producto)
        if product:
            return jsonify(product)
        return jsonify({"message": "Producto no encontrado"}), 404
    except Exception as e:
        return jsonify({"message": f"Error al buscar producto: {str(e)}"}), 500

@app.route('/actualizar_producto', methods=["PUT"])
def actualizar_producto():
    try:
        id_producto = request.args.get("id_producto")
        data = request.get_json()
        descripcion_producto = data.get("descripcion_producto")
        cantidad = data.get("cantidad")
        valor_producto = data.get("valor_producto")
        current_user = session.get("id_administrador")
        
        update_product_by_id(mysql, id_producto, descripcion_producto, cantidad, valor_producto, current_user)
        return jsonify({"message": "Producto actualizado exitosamente"}), 200
    except Exception as e:
        return jsonify({"message": f"Error al actualizar producto: {str(e)}"}), 500

@app.route('/eliminar_producto', methods=["DELETE"])
def eliminar_producto():
    try:
        id_producto = request.args.get("id_producto")
        current_user = session.get("id_administrador")
        delete_product_by_id(mysql, id_producto, current_user)
        return jsonify({"message": "Producto eliminado exitosamente"}), 200
    except Exception as e:
        return jsonify({"message": f"Error al eliminar producto: {str(e)}"}), 500

@app.route('/buscar_todos_productos', methods=["GET"])
def buscar_todos_productos():
    try:
        products = get_all_products(mysql)
        return jsonify(products)
    except Exception as e:
        return jsonify({"message": f"Error al obtener productos: {str(e)}"}), 500

@app.route('/buscar_productos_por_palabra', methods=["GET"])
def buscar_productos_por_palabra():
    try:
        palabra_clave = request.args.get("palabra_clave")
        products = search_products_by_keyword(mysql, palabra_clave)
        return jsonify(products)
    except Exception as e:
        return jsonify({"message": f"Error al buscar productos: {str(e)}"}), 500

#Rutas Matriculas 
@app.route('/asociar_matricula', methods=["PUT"])
def asociar_matricula():
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

@app.route('/crear_matricula', methods=["POST"])
def crear_matricula():
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

@app.route('/buscar_matricula', methods=["GET"])
def buscar_matricula():
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

@app.route('/listar_todas_matriculas', methods=["GET"])
def listar_todas_matriculas():
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT id_matricula, numero_matricula, numero_documento, valor_matricula, id_estado_matricula, fecha_creacion FROM matriculas')
        matriculas = cursor.fetchall()
        cursor.close()
        return jsonify(matriculas), 200
    except Exception as e:
        return jsonify({"message": f"Error al listar todas las matrículas: {str(e)}"}), 500

@app.route('/actualizar_matricula', methods=["PUT"])
def actualizar_matricula():
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


@app.route('/buscar_matricula_por_documento', methods=["GET"])
def buscar_matricula_por_documento():
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

#Rutas Multas
@app.route('/crear_multa', methods=["POST"])
def crear_multa():
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

@app.route('/listar_todas_multas', methods=["GET"])
def listar_todas_multas():
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

if __name__ == '__main__':
    app.run(port=9090, debug=True)