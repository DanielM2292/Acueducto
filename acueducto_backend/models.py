from flask_mysqldb import MySQL
import MySQLdb.cursors
import hashlib
import datetime

def init_db(app):
    mysql = MySQL(app)
    return mysql

def get_user_by_username(mysql, username):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM administradores WHERE nombre_usuario = %s', (username,))
    user = cursor.fetchone()
    cursor.close()
    return user

def generate_custom_id(prefix, cursor, table, column):
    cursor.execute(f'SELECT MAX(CAST(SUBSTRING({column}, LENGTH(%s) + 1) AS UNSIGNED)) as max_id FROM {table}', (prefix,))
    result = cursor.fetchone()
    max_id = result[0] if result and result[0] is not None else 0
    new_id = f"{prefix}{str(max_id + 1).zfill(3)}"
    return new_id

def hash_password(password):
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    return hashed_password

def log_audit(mysql, table, action, id_registro_afectado, detalles, id_administrador):
    cursor = mysql.connection.cursor()
    id_auditoria = generate_custom_id('AUD', cursor, 'auditoria', 'id_auditoria')
    cursor.execute('INSERT INTO auditoria (id_auditoria, tabla, id_registro_afectado, accion, id_administrador, detalles) VALUES (%s, %s, %s, %s, %s, %s)', 
                   (id_auditoria, table, id_registro_afectado, action, id_administrador, detalles))
    mysql.connection.commit()
    cursor.close()

def add_user(mysql, nombre, nombre_usuario, password, id_estado_empleado, id_rol, user):
    try:
        conn = mysql.connection
        cursor = conn.cursor()

        id_administrador = generate_custom_id('ADMIN', cursor, 'administradores', 'id_administrador')
        hashed_password = hash_password(password)

        cursor.execute('INSERT INTO administradores (id_administrador, nombre, nombre_usuario, password, id_estado_empleado, id_rol) VALUES (%s, %s, %s, %s, %s, %s)', 
                       (id_administrador, nombre, nombre_usuario, hashed_password, id_estado_empleado, id_rol))
        conn.commit()
        log_audit(mysql, 'administradores', 'INSERT', id_administrador, f'User {nombre_usuario} created', user)
        cursor.close()
    except Exception as e:
        print(f"Error al agregar usuario: {e}")
        raise

def check_password(stored_password, provided_password):
    return hashlib.sha256(provided_password.encode()).hexdigest() == stored_password

def get_users(mysql):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM administradores')
    users = cursor.fetchall()
    cursor.close()
    return users

def update_user(mysql, user_usernameN, user_username, user):
    cursor = mysql.connection.cursor()
    cursor.execute('UPDATE administradores SET user_username = %s WHERE user_username = %s', (user_usernameN, user_username))
    mysql.connection.commit()
    cursor.execute('SELECT id_administrador FROM administradores WHERE nombre_usuario = %s', (user_username,))
    id_administrador = cursor.fetchone()['id_administrador']
    log_audit(mysql, 'administradores', 'UPDATE', id_administrador, f'User {user_username} updated to {user_usernameN}', user)
    cursor.close()

def delete_user(mysql, user_username, user):
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT id_administrador FROM administradores WHERE nombre_usuario = %s', (user_username,))
    id_administrador = cursor.fetchone()['id_administrador']
    cursor.execute('DELETE FROM administradores WHERE nombre_usuario = %s', (user_username,))
    mysql.connection.commit()
    log_audit(mysql, 'administradores', 'DELETE', id_administrador, f'User {user_username} deleted', user)
    cursor.close()

def get_all_products(mysql):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM inventario')
    products = cursor.fetchall()
    cursor.close()
    return products

def get_product_by_id(mysql, product_id):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM inventario WHERE id_producto = %s', (product_id,))
    product = cursor.fetchone()
    cursor.close()
    return product

def add_product(mysql, descripcion_producto, cantidad, valor_producto, user):
    cursor = mysql.connection.cursor()
    id_producto = generate_custom_id('PROD', cursor, 'inventario', 'id_producto')
    
    cursor.execute('INSERT INTO inventario (id_producto, descripcion_producto, cantidad, valor_producto) VALUES (%s, %s, %s, %s)', 
                   (id_producto, descripcion_producto, cantidad, valor_producto))
    mysql.connection.commit()
    log_audit(mysql, 'inventario', 'INSERT', id_producto, f'Product {descripcion_producto} created', user)
    cursor.close()

def update_product_by_id(mysql, id_producto, descripcion_producto, cantidad, valor_producto, user):
    cursor = mysql.connection.cursor()
    cursor.execute('UPDATE inventario SET descripcion_producto = %s, cantidad = %s, valor_producto = %s, fecha_producto = CURRENT_TIMESTAMP WHERE id_producto = %s', 
                   (descripcion_producto, cantidad, valor_producto, id_producto))
    mysql.connection.commit()
    log_audit(mysql, 'inventario', 'UPDATE', id_producto, f'Product {id_producto} updated', user)
    cursor.close()

def delete_product_by_id(mysql, id_producto, user):
    cursor = mysql.connection.cursor()
    cursor.execute('DELETE FROM inventario WHERE id_producto = %s', (id_producto,))
    mysql.connection.commit()
    log_audit(mysql, 'inventario', 'DELETE', id_producto, f'Product {id_producto} deleted', user)
    cursor.close()

def get_product_by_description(mysql, descripcion_producto):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM inventario WHERE descripcion_producto = %s', (descripcion_producto,))
    product = cursor.fetchone()
    cursor.close()
    return product

def search_products_by_keyword(mysql, palabra_clave):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM inventario WHERE descripcion_producto LIKE %s', ('%' + palabra_clave + '%',))
    products = cursor.fetchall()
    cursor.close()
    return products

def add_cliente(mysql, tipo_documento, numero_documento, nombre, telefono, direccion, id_estado_cliente, id_tarifa_estandar, id_tarifa_medidor, user):
    try:
        conn = mysql.connection
        cursor = conn.cursor()

        id_cliente = generate_custom_id('CLI', cursor, 'clientes', 'id_cliente')
        id_matricula = generate_custom_id('MATR', cursor, 'matriculas', 'id_matricula')

        cursor.execute('INSERT INTO clientes (id_cliente, tipo_documento, numero_documento, nombre, telefono, direccion, id_estado_cliente, id_matricula, id_tarifa_estandar, id_tarifa_medidor) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)', 
                       (id_cliente, tipo_documento, numero_documento, nombre, telefono, direccion, id_estado_cliente, id_matricula, id_tarifa_estandar, id_tarifa_medidor))

        cursor.execute('INSERT INTO matriculas (id_matricula, numero_matricula, valor_matricula, id_estado_matricula) VALUES (%s, %s, %s, %s)', 
                       (id_matricula, id_cliente, 0, 'ESTMAT001'))
        
        conn.commit()
        log_audit(mysql, 'CREATE', 'clientes', f'Cliente {nombre} created', user)
        cursor.close()
    except Exception as e:
        print(f"Error al agregar cliente: {e}")
        raise

def update_cliente(mysql, id_cliente, tipo_documento, numero_documento, nombre, telefono, direccion, id_estado_cliente, id_tarifa_estandar, id_tarifa_medidor, user):
    cursor = mysql.connection.cursor()
    cursor.execute('UPDATE clientes SET tipo_documento = %s, numero_documento = %s, nombre = %s, telefono = %s, direccion = %s, id_estado_cliente = %s, id_tarifa_estandar = %s, id_tarifa_medidor = %s WHERE id_cliente = %s', 
                   (tipo_documento, numero_documento, nombre, telefono, direccion, id_estado_cliente, id_tarifa_estandar, id_tarifa_medidor, id_cliente))
    mysql.connection.commit()
    log_audit(mysql, 'UPDATE', 'clientes', id_cliente, f'Cliente {id_cliente} updated', user)
    cursor.close()

def delete_cliente(mysql, id_cliente, user):
    cursor = mysql.connection.cursor()
    cursor.execute('DELETE FROM clientes WHERE id_cliente = %s', (id_cliente,))
    mysql.connection.commit()
    log_audit(mysql, 'DELETE', 'clientes', id_cliente, f'Cliente {id_cliente} deleted', user)
    cursor.close()

def get_all_clientes(mysql):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM clientes')
    clientes = cursor.fetchall()
    cursor.close()
    return clientes

def get_cliente_by_id(mysql, id_cliente):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM clientes WHERE id_cliente = %s', (id_cliente,))
    cliente = cursor.fetchone()
    cursor.close()
    return cliente

def search_clientes_by_keyword(mysql, palabra_clave):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM clientes WHERE nombre LIKE %s', ('%' + palabra_clave + '%',))
    clientes = cursor.fetchall()
    cursor.close()
    return clientes


