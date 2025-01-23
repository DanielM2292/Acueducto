from flask_mysqldb import MySQL
from flask import Flask
import MySQLdb.cursors, hashlib

# Inicializa la base de datos
def init_db(app):
    mysql = MySQL(app)
    return mysql

class User:    
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
    def registrar_auditoria(mysql, id_auditoria, tabla, id_registro_afectado, accion, id_administrador, detalles):
        cursor = mysql.connection.cursor()
        cursor.execute("INSERT INTO auditoria(id_auditoria, tabla, id_registro_afectado, accion, id_administrador, detalles) VALUES(%s, %s, %s, %s, %s, %s)",
                    (id_auditoria, tabla, id_registro_afectado, accion, id_administrador, detalles))
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

class Facturas:
    # Generar las facturas automaticamente
    @staticmethod
    def generar_facturas(mysql,id_factura, fecha_vencimiento, id_cliente, id_estado_factura):
        cursor = mysql.connection.cursor()
        cursor.execute("INSERT INTO facturas(id_factura, fecha_vencimiento, id_cliente, id_estado_factura) VALUES(%s, %s, %s, %s)",
                    (id_factura, fecha_vencimiento, id_cliente, id_estado_factura))
        cursor.close()