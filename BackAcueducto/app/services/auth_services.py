from flask import jsonify, current_app
from app.models import User, Auditoria
import os

# Ruta en la cual se almacenaran los nombres de usuarios y contraseñas que se van agregarndo
ruta_archivo = os.path.join(os.getcwd(), 'data', 'contraseñas.txt')
class AuthServices:
    @staticmethod
    def updateUser(data):
        
        mysql = current_app.mysql
    
        nombre_usuario_nuevo = data.get('nombre_usuario_nuevo')
        nombre_usuario = data.get('nombre_usuario')
    
        User.update_user(mysql,nombre_usuario_nuevo, nombre_usuario)
        return jsonify({'message': 'Nombre de usuario actualizado'}), 200

    @staticmethod
    def create_user(data):
        
        mysql = current_app.mysql
        
        custom_id = Auditoria.generate_custom_id(mysql, 'ADM', 'id_administrador', 'administradores')
        custom_id_auditoria = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        
        user_name = data.get('user_name')
        user_username = data.get('user_username')
        user_password = data.get('user_password')
        estado_empleado = data.get('estado_empleado')
        id_rol = data.get('id_rol')

        # Si no digita los campos requeridos
        if not user_name or not user_password:
            return jsonify({'message': 'Se require ingresar usuario y contraseña'}), 400

        # Verificar si el nombre de usuario ya existe
        existing_user = User.get_user_by_username(mysql, user_username)
        
        if existing_user:
            return jsonify({'message': 'El usuario ya existe'}), 400

        User.add_user(mysql,custom_id, user_name, user_username, user_password, estado_empleado, id_rol)
        # Buscar como hacer que en el parametro del usuario pasarle el id del usuario que lo crea, aunque siempre va a crear los usuarios el administrador que es unico 
        Auditoria.registrar_auditoria(mysql, custom_id_auditoria, 'administradores', custom_id, 'INSERT', 'ADMI0003', 'Se crea usuario por primera vez' )
        with open(ruta_archivo, 'a') as f:
            f.write(f'Nombre de usuario: {user_username} - Contraseña: {user_password}\n')
        
        return jsonify({'message': 'Usuario creado!'}), 201
    
    @staticmethod
    def loginValidate(data):
        
        mysql = current_app.mysql
    
        username = data.get('user_username')
        password = data.get('user_password')

        if not username or not password:
            return jsonify({'message': 'Se requiere usuario y contraseña'}), 400

        user = User.get_user_by_username(mysql, username)
        if user and User.check_password(user['password'], password):
            
            return jsonify({'message': 'Login successful!'}), 200
        else:
            return jsonify({'message': 'Incorrect username or password!'}), 401