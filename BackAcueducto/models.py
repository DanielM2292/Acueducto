from flask_mysqldb import MySQL
from flask import Flask
import MySQLdb.cursors
import re
import hashlib

# Inicializa la base de datos
def init_db(app):
    mysql = MySQL(app)
    return mysql

# Obtener la informacion de los usuarios segun nombre
def get_user_by_username(mysql, username):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM administradores WHERE nombre_usuario = %s', (username,))
    user = cursor.fetchone()
    cursor.close()
    return user

# Obtener la informacion de todos los usuarios existentes
def get_users(mysql):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM administradores')
    user = cursor.fetchall()
    cursor.close()
    return user

# Agregar usuarios a la base de datos
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

# Validacion de la contraseña sea correcta
def check_password(user_password, provided_password):
    return hashlib.sha256(provided_password.encode()).hexdigest() == user_password

def update_user(mysql, user_usernameN, user_username):
    cursor = mysql.connection.cursor()
    cursor.execute('UPDATE administradores SET user_username= %s WHERE user_username= %s', (user_usernameN, user_username))
    mysql.connection.commit()
    cursor.close()