from flask_mysqldb import MySQL
from flask import Flask
import MySQLdb.cursors, hashlib

# Inicializa la base de datos
def init_db(app):
    mysql = MySQL(app)
    return mysql

class User:
    
    # Para encriptar la contraseña
    def hash_password(password):
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        return hashed_password
        
    # Obtener la informacion de los usuarios segun nombre
    @staticmethod
    def get_user_by_username(mysql, username):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM administradores WHERE nombre_usuario = %s', (username,))
        user = cursor.fetchone()
        cursor.close()
        return user

    # Obtener la informacion de todos los usuarios existentes
    @staticmethod
    def get_users(mysql):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM administradores')
        user = cursor.fetchall()
        cursor.close()
        return user

    # Agregar usuarios a la base de datos
    @staticmethod
    def add_user(mysql, id_user, user_name, user_username, user_password, estado_empleado, id_rol):
        try:
            cursor = mysql.connection.cursor()
            hashed_password = hashlib.sha256(user_password.encode()).hexdigest()  # Hash de la contraseña
            cursor.execute('INSERT INTO administradores(id_administrador, nombre, nombre_usuario, password, id_estado_empleado, id_rol) VALUES(%s, %s, %s, %s, %s, %s)', 
                        (id_user, user_name, user_username, hashed_password, estado_empleado, id_rol))
            mysql.connection.commit()
            cursor.close()
        except MySQLdb.Error as e:
            print(f"Error al agregar usuario: {e}")
            mysql.connection.rollback()  # Deshacer cualquier cambio si hay un error
            raise  # Vuelve a lanzar la excepción para que Flask la maneje

    # Validacion de la contraseña que se escribe literal es igual a la contrasela hasheada
    @staticmethod
    def check_password(user_password, provided_password):
        return hashlib.sha256(provided_password.encode()).hexdigest() == user_password

    # Actualizar nombre de usuario
    @staticmethod
    def update_user(mysql, nombre_usuario_nuevo, nombre_usuario):
        cursor = mysql.connection.cursor()
        cursor.execute('UPDATE administradores SET nombre_usuario= %s WHERE nombre_usuario= %s', (nombre_usuario_nuevo, nombre_usuario))
        mysql.connection.commit()
        cursor.close()
    
    @staticmethod
    def update_estado_empleado(mysql, id_estado_empleado, id_administrador):
        cursor = mysql.connection.cursor()
        cursor.execute('UPDATE administradores SET id_estado_empleado = %s WHERE id_administrador = %s', 
                        (id_estado_empleado, id_administrador))
        mysql.connection.commit()
        cursor.close()
        
    @staticmethod
    def changue_password(mysql, hashed_password, nombre_usuario):
        cursor = mysql.connection.cursor()
        cursor.execute("UPDATE administradores SET password=%s WHERE nombre_usuario=%s",(hashed_password, nombre_usuario)
        )
        mysql.connection.commit()
        cursor.close()

class Auditoria:
    # Generar prefijos para las tablas de la base de datos
    @staticmethod
    def generate_custom_id(mysql, prefix, column_name, table_name):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute(f"SELECT MAX({column_name}) AS last_id FROM {table_name}")
        result = cursor.fetchone()
        cursor.close()
        
        if result['last_id']:
            last_id = int(result['last_id'][len(prefix):])
            new_id = f"{prefix}{last_id + 1:04}"
        else:
            new_id = f"{prefix}0001"
        return new_id

    # Realizar el seguimiento de las operaciones y cambios para la base de datos -  Tabla auditoria en la DB
    @staticmethod
    def log_audit(mysql, id_auditoria, table, id_registro_afectado, action, id_administrador, detalles):
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO auditoria (id_auditoria, tabla, id_registro_afectado, accion, id_administrador, detalles) VALUES (%s, %s, %s, %s, %s, %s)', 
                    (id_auditoria, table, id_registro_afectado, action, id_administrador, detalles))
        mysql.connection.commit()
        cursor.close()

class Clientes:
    # Obtener los clientes de la base de datos
    @staticmethod
    def get_clientes(mysql):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM clientes')
        clientes = cursor.fetchall()
        cursor.close()
        return clientes
    
    # Agregar cliente
    @staticmethod
    def add_cliente(mysql, id_cliente, tipo_documento, numero_documento, nombre, telefono, direccion, id_estado_cliente, id_matricula, id_tarifa_estandar, id_tarifa_medidor, user):
        try:
            cursor = mysql.connection.cursor()
            cursor.execute('INSERT INTO clientes (id_cliente, tipo_documento, numero_documento, nombre, telefono, direccion, id_estado_cliente, id_matricula, id_tarifa_estandar, id_tarifa_medidor) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)', 
                        (id_cliente, tipo_documento, numero_documento, nombre, telefono, direccion, id_estado_cliente, id_matricula, id_tarifa_estandar, id_tarifa_medidor))
            cursor.execute('INSERT INTO matriculas (id_matricula, numero_matricula, valor_matricula, id_estado_matricula) VALUES (%s, %s, %s, %s)', 
                        (id_matricula, id_cliente, 0, 'ESM0001'))
            cursor.close()
        except Exception as e:
            print(f"Error al agregar cliente: {e}")
            raise
    
    # Actualizar cliente
    @staticmethod
    def update_cliente(mysql, id_cliente, tipo_documento, numero_documento, nombre, telefono, direccion, id_estado_cliente, id_tarifa_estandar, id_tarifa_medidor):
        cursor = mysql.connection.cursor()
        cursor.execute('UPDATE clientes SET tipo_documento = %s, numero_documento = %s, nombre = %s, telefono = %s, direccion = %s, id_estado_cliente = %s, id_tarifa_estandar = %s, id_tarifa_medidor = %s WHERE id_cliente = %s', 
                    (id_cliente, tipo_documento, numero_documento, nombre, telefono, direccion, id_estado_cliente, id_tarifa_estandar, id_tarifa_medidor))
        mysql.connection.commit()
        cursor.close()
    
    # Obtener todos los clientes de la base de datos
    @staticmethod
    def get_all_clientes(mysql):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM clientes')
        clientes = cursor.fetchall()
        cursor.close()
        return clientes
    
    # Obtener Cliente por su id
    @staticmethod
    def get_cliente_by_id(mysql, id_cliente):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM clientes WHERE id_cliente = %s', (id_cliente,))
        cliente = cursor.fetchone()
        cursor.close()
        return cliente
    
    # Obtener cliente con una palabra clave
    @staticmethod
    def search_clientes_by_keyword(mysql, palabra_clave):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM clientes WHERE nombre LIKE %s', ('%' + palabra_clave + '%',))
        clientes = cursor.fetchall()
        cursor.close()
        return clientes
    
    @staticmethod
    def verificar_cliente(mysql, numero_documento):
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT id_cliente FROM clientes WHERE numero_documento = %s', (numero_documento))
        cliente = cursor.fetchone()
        cursor.close()
        return cliente
    
    @staticmethod
    def asociar_matricula_cliente(mysql,id_matricula, id_cliente):
        cursor = mysql.connection.cursor()
        cursor.execute('UPDATE clientes SET id_matricula = %s WHERE id_cliente = %s', (id_matricula, id_cliente))
        mysql.connection.commit()
        cursor.close()

class Facturas:
    # Generar las facturas automaticamente
    @staticmethod
    def generar_facturas(mysql,id_factura, fecha_vencimiento, id_cliente, id_estado_factura):
        cursor = mysql.connection.cursor()
        cursor.execute("INSERT INTO facturas(id_factura, fecha_vencimiento, id_cliente, id_estado_factura) VALUES(%s, %s, %s, %s)",
                    (id_factura, fecha_vencimiento, id_cliente, id_estado_factura))
        cursor.close()
    
class Inventario:
    # Obtener todos los productos de la base de datos
    @staticmethod
    def get_all_products(mysql):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM inventario')
        products = cursor.fetchall()
        cursor.close()
        return products
    
    #Obtener producto desde su id
    @staticmethod
    def get_product_by_id(mysql, product_id):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM inventario WHERE id_producto = %s', (product_id,))
        product = cursor.fetchone()
        cursor.close()
        return product
    
    # Agregar producto
    @staticmethod
    def add_product(mysql, id_producto, descripcion_producto, cantidad, valor_producto):
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO inventario (id_producto, descripcion_producto, cantidad, valor_producto) VALUES (%s, %s, %s, %s)', 
                    (id_producto, descripcion_producto, cantidad, valor_producto))
        mysql.connection.commit()
        cursor.close()
    
    # Actualizar informacion producto
    @staticmethod
    def update_product_by_id(mysql, id_producto, descripcion_producto, cantidad, valor_producto, user):
        cursor = mysql.connection.cursor()
        cursor.execute('UPDATE inventario SET descripcion_producto = %s, cantidad = %s, valor_producto = %s, fecha_producto = CURRENT_TIMESTAMP WHERE id_producto = %s', 
                    (descripcion_producto, cantidad, valor_producto, id_producto))
        mysql.connection.commit()
        cursor.close()
    
    # Borrar producto
    @staticmethod
    def delete_product_by_id(mysql, id_producto):
        cursor = mysql.connection.cursor()
        cursor.execute('DELETE FROM inventario WHERE id_producto = %s', (id_producto,))
        mysql.connection.commit()
        cursor.close()
    
    # Obtener producto por descripcion
    @staticmethod
    def get_product_by_description(mysql, descripcion_producto):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM inventario WHERE descripcion_producto = %s', (descripcion_producto,))
        product = cursor.fetchone()
        cursor.close()
        return product
    
    # Buscar producto por palabra clave
    @staticmethod
    def search_products_by_keyword(mysql, palabra_clave):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM inventario WHERE descripcion_producto LIKE %s', ('%' + palabra_clave + '%',))
        products = cursor.fetchall()
        cursor.close()
        return products
    
class Matriculas:
    @staticmethod
    def verificar_matricula(mysql, id_matricula):
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT * FROM matriculas WHERE id_matricula = %s', (id_matricula,))
        matricula = cursor.fetchone()
        cursor.close()
        return matricula
    
    @staticmethod
    def agregar_matricula(mysql, id_matricula, numero_matricula, numero_documento, valor_matricula, id_estado_matricula):
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO matriculas (id_matricula, numero_matricula, numero_documento, valor_matricula, id_estado_matricula, fecha_creacion) VALUES (%s, %s, %s, %s, %s, NOW())', 
                        (id_matricula, numero_matricula, numero_documento, valor_matricula, id_estado_matricula))
        mysql.connection.commit()
        cursor.close()
    
    @staticmethod
    def obtener_todas_matriculas(mysql):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM matriculas')
        matriculas = cursor.fetchall()
        cursor.close()
        return matriculas
    
    @staticmethod
    def actualizar_matricula(mysql, numero_documento, valor_matricula, id_estado_matricula, id_matricula):
        cursor = mysql.connection.cursor
        cursor.execute('UPDATE matriculas SET numero_documento = %s, valor_matricula = %s, id_estado_matricula = %s WHERE id_matricula = %s', 
                        (numero_documento, valor_matricula, id_estado_matricula, id_matricula))
        mysql.connection.commit()
        cursor.close()
    
    @staticmethod
    def buscar_matricula_documento(mysql, numero_documento):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM matriculas WHERE numero_documento = %s', (numero_documento))
        matricula = cursor.fetchall()
        cursor.close()
        return matricula

class Multas:
    @staticmethod
    def agregar_multa(mysql, id_multa, motivo_multa, valor_multa):
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO multas (id_multa, motivo_multa, valor_multa) VALUES (%s, %s, %s)', 
                        (id_multa, motivo_multa, valor_multa))
        mysql.connection.commit()
        cursor.close()
    
    @staticmethod
    def mostrar_multas(mysql):
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
        return multas
    
class Cliente_multa:
    @staticmethod
    def asociar_cliente_multa(mysql, id_cliente, id_multa, id_cliente_multa):
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO cliente_multas (id_cliente, id_multa, id_cliente_multa) VALUES (%s, %s, %s)', 
                        (id_cliente, id_multa, id_cliente_multa))
        mysql.connection.commit()
        cursor.close()
    
    