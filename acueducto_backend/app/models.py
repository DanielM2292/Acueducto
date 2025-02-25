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

    @staticmethod
    def log_audit(mysql, id_auditoria, table, id_registro_afectado, action, id_administrador, detalles):
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO auditoria (id_auditoria, tabla, id_registro_afectado, accion, id_administrador, detalles) VALUES (%s, %s, %s, %s, %s, %s)', 
                    (id_auditoria, table, id_registro_afectado, action, id_administrador, detalles))
        mysql.connection.commit()
        cursor.close()
        
    @staticmethod
    def mostrar_registros(mysql):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM auditoria')
        clientes = cursor.fetchall()
        cursor.close()
        return clientes


class Clientes:
    # Obtener los clientes de la base de datos
    @staticmethod
    def get_clientes_facturas_estandar(mysql):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''
                SELECT id_cliente, id_matricula_cliente FROM matricula_cliente AS mc
	            INNER JOIN
		            matriculas AS m ON mc.id_matricula = m.id_matricula
	            WHERE id_estado_cliente = 'ESC0001' AND m.tipo_tarifa = 'Estandar' ''')
        clientes = cursor.fetchall()
        cursor.close()
        return clientes
    
    # Agregar cliente
    @staticmethod
    def add_cliente(mysql, id_cliente, tipo_documento, numero_documento, nombre, telefono):
        try:
            cursor = mysql.connection.cursor()
            cursor.execute('INSERT INTO clientes (id_cliente, tipo_documento, numero_documento, nombre, telefono) VALUES (%s, %s, %s, %s, %s)', 
                        (id_cliente, tipo_documento, numero_documento, nombre, telefono))
            cursor.close()
        except Exception as e:
            print(f"Error al agregar cliente: {e}")
            raise
    
    # Actualizar cliente
    @staticmethod
    def update_cliente(mysql, tipo_documento, numero_documento, nombre, telefono, id_cliente):
        try:    
            cursor = mysql.connection.cursor()
            cursor.execute('UPDATE clientes SET tipo_documento = %s, numero_documento = %s, nombre = %s, telefono = %s WHERE id_cliente = %s',
                        (tipo_documento, numero_documento, nombre, telefono, id_cliente))
            mysql.connection.commit()
            cursor.close()
        except Exception as e:
            print(f"Error al agregar cliente: {e}")
            raise
    
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
    
    # Verificar si existe un cliente por número de documento
    @staticmethod
    def verificar_cliente(mysql, numero_documento):
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT id_cliente FROM clientes WHERE numero_documento = %s', (numero_documento,))
        cliente = cursor.fetchone()
        cursor.close()
        return cliente

    @staticmethod
    def asociar_matricula_cliente_con_cliente(mysql, id_matricula_cliente, id_cliente):
        cursor = mysql.connection.cursor()
        cursor.execute('UPDATE clientes SET id_matricula_cliente = %s WHERE id_cliente = %s',
                    (id_matricula_cliente, id_cliente))
        mysql.connection.commit()
        cursor.close()
    
    @staticmethod
    def obtener_datos(mysql, numero_documento):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT numero_documento, nombre FROM clientes WHERE numero_documento = %s;',
                    (numero_documento,))
        documento = cursor.fetchone()
        cursor.close()
        return documento
    
    @staticmethod
    def get_id_cliente(mysql, numero_matricula):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''
            SELECT mc.id_cliente, mc.id_matricula_cliente FROM matricula_cliente AS mc
            INNER JOIN matriculas AS m ON mc.id_matricula = m.id_matricula
            WHERE numero_matricula = %s;''', (numero_matricula,))
        cliente = cursor.fetchone()
        cursor.close()
        return cliente
    
class Facturas:
    # Generar las facturas automaticamente
    @staticmethod
    def generar_facturas(mysql, id_factura, fecha_vencimiento, id_cliente, id_estado_factura, valor_pendiente, id_matricula_cliente, id_estandar_factura):
        cursor = mysql.connection.cursor()
        cursor.execute("INSERT INTO facturas(id_factura, fecha_vencimiento, id_cliente, id_estado_factura, valor_pendiente, id_matricula_cliente, id_estandar_factura) VALUES(%s, %s, %s, %s, %s, %s, %s)",
                    (id_factura, fecha_vencimiento, id_cliente, id_estado_factura, valor_pendiente, id_matricula_cliente, id_estandar_factura))
        cursor.close()
    
    @staticmethod
    def listar_facturas(mysql):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''
            SELECT f.id_factura, 
                    f.fecha_factura, 
                    c.nombre, 
                    c.numero_documento, 
                    mc.direccion, 
                    MIN(mc.id_matricula) AS id_matricula, -- Tomará una sola matrícula
                    te.tarifa_definida, 
                    ef.descripcion_estado_factura
            FROM facturas AS f
            INNER JOIN clientes AS c ON f.id_cliente = c.id_cliente
            INNER JOIN matricula_cliente AS mc ON c.id_cliente = mc.id_cliente
            INNER JOIN tarifas_estandar AS te ON f.id_tarifa_estandar = te.id_tarifa_estandar
            INNER JOIN estado_facturas AS ef ON f.id_estado_factura = ef.id_estado_factura
            GROUP BY f.id_factura, f.fecha_factura, c.nombre, c.numero_documento, mc.direccion, te.tarifa_definida, ef.descripcion_estado_factura;''')
        facturas = cursor.fetchall()
        cursor.close()
        return facturas
    
    @staticmethod
    def buscar_factura(mysql, id_factura):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM facturas WHERE id_factura = %s', (id_factura,))
        factura = cursor.fetchone()
        cursor.close()
        return factura
    
    @staticmethod
    def get_ultima_lectura(mysql, id_matricula_cliente):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''
            SELECT lectura_actual AS lectura_anterior FROM tarifa_medidores
            WHERE id_matricula_cliente = %s
            ORDER BY id_tarifa_medidor DESC
            LIMIT 1;''', (id_matricula_cliente,))
        datos_cliente = cursor.fetchone()
        cursor.close()
        return datos_cliente
    
    @staticmethod
    def crear_factura(mysql, id_factura, fecha_factura, fecha_vencimiento, id_cliente, id_estado_factura, valor_pendiente, id_matricula_cliente, id_tarifa_medidor):
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO facturas (id_factura, fecha_factura, fecha_vencimiento, id_cliente, id_estado_factura, valor_pendiente, id_matricula_cliente, id_tarifa_medidor) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)',
                    (id_factura, fecha_factura, fecha_vencimiento, id_cliente, id_estado_factura, valor_pendiente, id_matricula_cliente, id_tarifa_medidor))
        mysql.connection.commit()
        cursor.close()

class Valores_medidor:
    @staticmethod
    def obtener_datos(mysql):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM valores_medidor ORDER BY id_valores_medidor DESC LIMIT 1;')
        datos_cliente = cursor.fetchone()
        cursor.close()
        return datos_cliente
    
    @staticmethod
    def crear_valores(mysql, id_valores_medidor, limite_medidor, valor_limite, valor_metro3):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('INSERT INTO valores_medidor (id_valores_medidor, limite_medidor, valor_limite, valor_metro3) VALUES (%s, %s, %s, %s)', 
                    (id_valores_medidor, limite_medidor, valor_limite, valor_metro3))
        mysql.connection.commit()
        cursor.close()

class Tarifas_estandar:
    @staticmethod
    def obtener_datos_estandar(mysql):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT tarifa_definida, id_tarifa_estandar FROM tarifas_estandar ORDER BY id_tarifa_estandar DESC LIMIT 1;')
        datos_cliente = cursor.fetchone()
        cursor.close()
        return datos_cliente
    
    @staticmethod
    def obtener_todo_estandar(mysql):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM tarifas_estandar ORDER BY id_tarifa_estandar DESC LIMIT 1;')
        datos_cliente = cursor.fetchone()
        cursor.close()
        return datos_cliente
    
    @staticmethod
    def crear_tarifa(mysql, id_tarifa_estandar, descripcion, tarifa_definida, fecha_inicio_tarifa, fecha_final_tarifa):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('INSERT INTO tarifas_estandar (id_tarifa_estandar, descripcion, tarifa_definida, fecha_inicio_tarifa, fecha_final_tarifa) VALUES (%s, %s, %s, %s, %s)', 
                    (id_tarifa_estandar, descripcion, tarifa_definida, fecha_inicio_tarifa, fecha_final_tarifa))
        mysql.connection.commit()
        cursor.close()

class Tarifa_medidores:
    @staticmethod
    def crear_tarifa(mysql, id_tarifa_medidor, lectura_actual, id_valores_medidor, valor_total_lectura, id_matricula_cliente):
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO tarifa_medidores (id_tarifa_medidor, lectura_actual, id_valores_medidor, valor_total_lectura, id_matricula_cliente) VALUES (%s, %s, %s, %s, %s)', 
                    (id_tarifa_medidor, lectura_actual, id_valores_medidor, valor_total_lectura, id_matricula_cliente))
        mysql.connection.commit()
        cursor.close()
        
class Estandar_factura:
    @staticmethod
    def crear_factura_estandar(mysql, id_estandar_factura, id_tarifa_estandar, id_matricula_cliente, cantidad_meses):
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO estandar_factura (id_estandar_factura, id_tarifa_estandar, id_matricula_cliente, cantidad_meses) VALUES (%s, %s, %s, %s)', 
                    (id_estandar_factura, id_tarifa_estandar, id_matricula_cliente, cantidad_meses))
        mysql.connection.commit()
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
    def add_product(mysql, id_producto, descripcion_producto, cantidad, valor_producto, total_productos):
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO inventario (id_producto, descripcion_producto, cantidad, valor_producto, total_productos) VALUES (%s, %s, %s, %s, %s)', 
                    (id_producto, descripcion_producto, cantidad, valor_producto, total_productos))
        mysql.connection.commit()
        cursor.close()
    
    # Actualizar informacion producto
    @staticmethod
    def update_product_by_id(mysql, id_producto, descripcion_producto, cantidad, valor_producto, total_productos):
        cursor = mysql.connection.cursor()
        cursor.execute('UPDATE inventario SET descripcion_producto = %s, cantidad = %s, valor_producto = %s, total_productos = %s WHERE id_producto = %s', 
                    (descripcion_producto, cantidad, valor_producto, total_productos, id_producto))
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
    # Ojo dos metodos hacen lo mismo
    @staticmethod
    def verificar_matricula(mysql, id_matricula):
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT * FROM matriculas WHERE id_matricula = %s', (id_matricula,))
        matricula = cursor.fetchone()
        cursor.close()
        return matricula
    
    @staticmethod
    def buscar_matricula(mysql, id_matricula):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM matriculas WHERE id_matricula = %s;', (id_matricula,))
        matricula = cursor.fetchone()
        cursor.close()
        return matricula
    
    @staticmethod
    def agregar_matricula(mysql, id_matricula, numero_matricula, valor_matricula, tipo_tarifa):
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO matriculas (id_matricula, numero_matricula, valor_matricula, tipo_tarifa) VALUES (%s, %s, %s, %s)', 
                        (id_matricula, numero_matricula, valor_matricula, tipo_tarifa))
        mysql.connection.commit()
        cursor.close()

    
    @staticmethod
    def obtener_todas_matriculas(mysql):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''
            SELECT 
                m.id_matricula, 
                m.numero_matricula, 
                c.numero_documento,
                c.nombre,
                m.valor_matricula,
                m.tipo_tarifa,
                m.fecha_creacion,
                ec.descripcion_cliente,
                mc.direccion
            FROM 
                matriculas AS m
            INNER JOIN 
                matricula_cliente AS mc ON m.id_matricula = mc.id_matricula
            INNER JOIN
				estado_clientes AS ec ON mc.id_estado_cliente = ec.id_estado_cliente
            INNER JOIN 
                clientes AS c ON mc.id_cliente = c.id_cliente;''')
        matriculas = cursor.fetchall()
        cursor.close()
        return matriculas
    
    @staticmethod
    def actualizar_matricula(mysql, valor_matricula, tipo_tarifa, id_matricula):
        cursor = mysql.connection.cursor()
        cursor.execute('UPDATE matriculas SET valor_matricula = %s, tipo_tarifa = %s WHERE id_matricula = %s', 
                        (valor_matricula, tipo_tarifa, id_matricula))
        mysql.connection.commit()
        cursor.close()
    
    @staticmethod
    def buscar_matricula_documento(mysql, numero_documento):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''
            SELECT 
                m.id_matricula, 
                m.numero_matricula, 
                c.numero_documento,
                c.nombre,
                m.valor_matricula,
                m.tipo_tarifa,
                ec.descripcion_cliente,
                m.fecha_creacion,
                mc.direccion
            FROM 
                matriculas AS m
            INNER JOIN 
                matricula_cliente AS mc ON m.id_matricula = mc.id_matricula
            INNER JOIN
				estado_clientes AS ec ON mc.id_estado_cliente = ec.id_estado_cliente
            INNER JOIN 
                clientes AS c ON mc.id_cliente = c.id_cliente WHERE numero_documento = %s;''', (numero_documento,))
        matricula = cursor.fetchall()
        cursor.close()
        return matricula
    
    @staticmethod
    def buscar_matriculas_cliente(mysql, numero_documento):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''
            SELECT 
                m.id_matricula, 
                m.numero_matricula, 
                m.fecha_creacion,
                mc.direccion,
                ec.descripcion_cliente
            FROM 
                matriculas AS m
            INNER JOIN 
                matricula_cliente AS mc ON m.id_matricula = mc.id_matricula
            INNER JOIN
				estado_clientes AS ec ON mc.id_estado_cliente = ec.id_estado_cliente
            INNER JOIN 
                clientes AS c ON mc.id_cliente = c.id_cliente WHERE numero_documento = %s;''', (numero_documento,))
        matricula = cursor.fetchall()
        cursor.close()
        return matricula
    
    @staticmethod
    def nuevo_numero_matricula(mysql):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute(f"SELECT MAX(numero_matricula) AS last_id FROM matriculas")
        result = cursor.fetchone()
        cursor.close()
        
        if result['last_id']:
            last_id = int(result['last_id'])
            new_id = f"{last_id + 1:04}"
        else:
            new_id = f"0001"
        return new_id    
    
    @staticmethod
    def obtener_tipo(mysql, numero_matricula):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT tipo_tarifa FROM matriculas WHERE numero_matricula = %s;', (numero_matricula,))
        matricula = cursor.fetchone()
        cursor.close()
        return matricula

class Matricula_cliente:
    @staticmethod
    def asociar_matricula_cliente(mysql, id_matricula_cliente, id_matricula, id_cliente, direccion, id_estado_cliente):
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO matricula_cliente (id_matricula_cliente, id_matricula, id_cliente, direccion, id_estado_cliente) VALUES (%s, %s, %s, %s, %s)',
                    (id_matricula_cliente, id_matricula, id_cliente, direccion, id_estado_cliente))
        mysql.connection.commit()
        cursor.close()
    
    @staticmethod
    def verificar_id_matricula_cliente(mysql, id_matricula):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT id_matricula_cliente, id_cliente FROM matricula_cliente WHERE id_matricula = %s', (id_matricula,))
        id_matricula_cliente = cursor.fetchone()
        cursor.close()
        return id_matricula_cliente
    
    @staticmethod
    def obtener_id_multa(mysql, id_matricula):
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT id_multa FROM matricula_cliente WHERE id_matricula = %s', (id_matricula,))
        id_matricula_cliente = cursor.fetchone()
        cursor.close()
        return id_matricula_cliente
    
    @staticmethod
    def actualizar_estado(mysql, id_estado_cliente, id_matricula):
        cursor = mysql.connection.cursor()
        cursor.execute('UPDATE matricula_cliente SET id_estado_cliente = %s WHERE id_matricula = %s', (id_estado_cliente, id_matricula))
        mysql.connection.commit()
        cursor.close()
    
    @staticmethod
    def actualizar_direccion(mysql, direccion, id_matricula):
        cursor = mysql.connection.cursor()
        cursor.execute('UPDATE matricula_cliente SET direccion = %s WHERE id_matricula = %s', (direccion, id_matricula))
        mysql.connection.commit()
        cursor.close()
        
    @staticmethod
    def obtener_matriculas(mysql, id_cliente):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''
                SELECT GROUP_CONCAT(id_matricula_cliente SEPARATOR ', ') AS id_matricula_cliente_combinados
                FROM matricula_cliente WHERE id_cliente = %s;''', (id_cliente,))
        id_matricula_cliente = cursor.fetchone()
        cursor.close()
        return id_matricula_cliente
    
    @staticmethod
    def obtener_datos_factura(mysql, numero_matricula):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''
                SELECT c.numero_documento, c.nombre, mc.direccion, mc.id_matricula_cliente
                FROM clientes AS c
                INNER JOIN matricula_cliente AS mc ON c.id_cliente = mc.id_cliente
                INNER JOIN matriculas AS m ON mc.id_matricula = m.id_matricula
                WHERE numero_matricula = %s;''', (numero_matricula,))
        datos_cliente = cursor.fetchone()
        cursor.close()
        return datos_cliente

class Multas:
    @staticmethod
    def agregar_multa(mysql, id_multa, motivo_multa, valor_multa, valor_pendiente):
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO multas (id_multa, motivo_multa, valor_multa, valor_pendiente) VALUES (%s, %s, %s, %s)', 
                        (id_multa, motivo_multa, valor_multa, valor_pendiente))
        mysql.connection.commit()
        cursor.close()
    
    @staticmethod
    def mostrar_multas(mysql):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''
            SELECT m.id_multa, m.motivo_multa, m.valor_multa, ma.numero_matricula, c.nombre
            FROM multas AS m
            INNER JOIN multa_clientes AS mcl ON m.id_multa = mcl.id_multa
            INNER JOIN matricula_cliente AS mc ON mcl.id_matricula_cliente = mc.id_matricula_cliente
            INNER JOIN matriculas AS ma ON mc.id_matricula = ma.id_matricula
            INNER JOIN clientes as c ON mcl.id_cliente = c.id_cliente
            GROUP BY m.id_multa, m.motivo_multa, m.valor_multa, ma.numero_matricula, c.nombre;''')
        multas = cursor.fetchall()
        cursor.close()
        return multas
    
    @staticmethod
    def update_multa(mysql, motivo_multa, valor_multa, valor_pendiente, id_multa):
        cursor = mysql.connection.cursor()
        cursor.execute('UPDATE multas SET motivo_multa = %s, valor_multa = %s, valor_pendiente = %s WHERE id_multa = %s', (motivo_multa, valor_multa, valor_pendiente, id_multa))
        mysql.connection.commit()
        cursor.close()
    
    @staticmethod
    def update_multa_pago(mysql, valor_multa, valor_pendiente, id_multa):
        cursor = mysql.connection.cursor()
        cursor.execute('UPDATE multas SET valor_multa = %s, valor_pendiente = %s WHERE id_multa = %s', (valor_multa, valor_pendiente, id_multa))
        mysql.connection.commit()
        cursor.close()
    
    @staticmethod
    def buscar_multa(mysql, id_multa):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM multas WHERE id_multa = %s', (id_multa,))
        multa = cursor.fetchone()
        cursor.close()
        return multa
    
    @staticmethod
    def buscar_todo_multa(mysql, id_multa):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM multas WHERE id_multa = %s', (id_multa,))
        multa = cursor.fetchone()
        cursor.close()
        return multa
        
class Multa_clientes:
    @staticmethod
    def crear_multa_cliente(mysql, id_multa_cliente, id_multa, id_cliente, id_estado_multa, id_matricula_cliente):
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO multa_clientes (id_multa_cliente, id_multa, id_cliente, id_estado_multa, id_matricula_cliente) VALUES (%s, %s, %s, %s, %s)', 
                       (id_multa_cliente, id_multa, id_cliente, id_estado_multa, id_matricula_cliente))
        mysql.connection.commit()
        cursor.close()
    
    @staticmethod
    def actualizar_multa_cliente(mysql, id_estado_multa, id_multa):
        cursor = mysql.connection.cursor()
        cursor.execute('UPDATE multa_clientes SET id_estado_multa = %s WHERE id_multa = %s',
                       (id_estado_multa, id_multa))
        mysql.connection.commit()
        cursor.close()
    
    @staticmethod
    def obtener_multas(mysql, id_matricula_cliente):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''
            SELECT SUM(m.valor_pendiente) AS total_multas
            FROM multas AS m
            INNER JOIN multa_clientes AS mc ON m.id_multa= mc.id_multa
            WHERE mc.id_estado_multa = 'ESM0001' AND mc.id_matricula_cliente = %s''',
                       (id_matricula_cliente,))
        multas = cursor.fetchone()
        cursor.close()
        return multas
        
class Ingresos:
    @staticmethod
    def listar_ingresos(mysql):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM ingresos')
        ingresos = cursor.fetchall()
        cursor.close()
        return ingresos
    
    @staticmethod
    def crear_ingreso(mysql, id_ingreso, descripcion_ingreso, valor_ingreso):
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO ingresos (id_ingreso, descripcion_ingreso, valor_ingreso) VALUES (%s, %s, %s)',
                       (id_ingreso, descripcion_ingreso, valor_ingreso))
        mysql.connection.commit()
        cursor.close()
    
    @staticmethod
    def crear_ingreso_producto(mysql, id_ingreso, descripcion_ingreso, valor_ingreso, id_producto):
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO ingresos (id_ingreso, descripcion_ingreso, valor_ingreso, id_producto) VALUES (%s, %s, %s, %s)',
                       (id_ingreso, descripcion_ingreso, valor_ingreso, id_producto))
        mysql.connection.commit()
        cursor.close()
    
    @staticmethod
    def crear_ingreso_multa(mysql, id_ingreso, descripcion_ingreso, valor_ingreso, id_multa):
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO ingresos (id_ingreso, descripcion_ingreso, valor_ingreso, id_multa) VALUES (%s, %s, %s, %s)',
                       (id_ingreso, descripcion_ingreso, valor_ingreso, id_multa))
        mysql.connection.commit()
        cursor.close()
    
    @staticmethod
    def crear_ingreso_matricula(mysql, id_ingreso, descripcion_ingreso, valor_ingreso, id_matricula):
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO ingresos (id_ingreso, descripcion_ingreso, valor_ingreso, id_matricula) VALUES (%s, %s, %s, %s)',
                       (id_ingreso, descripcion_ingreso, valor_ingreso, id_matricula))
        mysql.connection.commit()
        cursor.close()
    
    @staticmethod
    def buscar_ingreso(mysql, palabra):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM ingresos WHERE descripcion_ingreso LIKE %s', ('%'+ palabra + '%',))
        ingreso = cursor.fetchall()
        cursor.close()
        return ingreso
    
    @staticmethod
    def actualizar_ingreso(mysql, id_ingreso, descripcion_ingreso, valor_ingreso):
        cursor = mysql.connection.cursor()
        cursor.execute('UPDATE ingresos SET descripcion_ingreso = %s, valor_ingreso = %s WHERE id_ingreso = %s AND id_matricula IS NULL AND id_factura IS NULL AND id_producto IS NULL AND id_multa IS NULL;', (descripcion_ingreso, valor_ingreso, id_ingreso))
        mysql.connection.commit()
        cursor.close()
    
    @staticmethod
    def buscar_ingreso_producto(mysql, id_producto):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT id_ingreso FROM ingresos WHERE id_producto LIKE %s', ('%'+ id_producto + '%',))
        ingreso = cursor.fetchone()
        cursor.close()
        return ingreso
    
    @staticmethod
    def verificar_ingreso(mysql, id_ingreso):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT id_matricula, id_factura, id_producto, id_multa FROM ingresos WHERE id_ingreso LIKE %s', ('%'+ id_ingreso + '%',))
        ingreso = cursor.fetchone()
        cursor.close()
        return ingreso

class Egresos:
    @staticmethod
    def listar_egresos(mysql):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM egresos')
        egresos = cursor.fetchall()
        cursor.close()
        return egresos
    
    @staticmethod
    def crear_egreso_general(mysql, id_egreso, descripcion_egreso, cantidad, total_egreso):
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO egresos (id_egreso, descripcion_egreso, cantidad, total_egreso) VALUES (%s, %s, %s, %s)',
                       (id_egreso, descripcion_egreso, cantidad, total_egreso))
        cursor.connection.commit()
        cursor.close()
    
    @staticmethod
    def crear_egreso_producto(mysql, id_egreso, descripcion_egreso, cantidad, total_egreso, id_producto):
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO egresos (id_egreso, descripcion_egreso, cantidad, total_egreso, id_producto) VALUES (%s, %s, %s, %s, %s)',
                       (id_egreso, descripcion_egreso, cantidad, total_egreso, id_producto))
        cursor.connection.commit()
        cursor.close()
        
    @staticmethod
    def buscar_egreso(mysql, palabra):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM egresos WHERE descripcion_egreso LIKE %s', ('%'+ palabra + '%',))
        egreso = cursor.fetchall()
        cursor.close()
        return egreso
    
    @staticmethod
    def actualizar_egreso_general(mysql, id_egreso, descripcion_egreso, cantidad, total_egreso):
        cursor = mysql.connection.cursor()
        cursor.execute('UPDATE egresos SET descripcion_egreso = %s, cantidad = %s, total_egreso = %s WHERE id_egreso = %s',
                       (descripcion_egreso, cantidad, total_egreso, id_egreso))
        mysql.connection.commit()
        cursor.close()
    
    @staticmethod
    def obtener_egreso(mysql, id_egreso):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM egresos WHERE id_egreso LIKE %s', ('%'+ id_egreso + '%',))
        egreso = cursor.fetchone()
        cursor.close()
        return egreso
    
    @staticmethod
    def obtener_id_egreso(mysql, id_producto):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT id_egreso FROM egresos WHERE id_producto LIKE %s ORDER BY id_producto DESC LIMIT 1;', ('%'+ id_producto + '%',))
        egreso = cursor.fetchone()
        cursor.close()
        return egreso
    
    
    