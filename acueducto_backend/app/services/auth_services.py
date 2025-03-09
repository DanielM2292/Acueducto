from flask import jsonify, current_app, session, request
from app.models import User, Auditoria
import os, hashlib

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
        try:
            mysql = current_app.mysql
        
            custom_id = Auditoria.generate_custom_id(mysql, 'ADM', 'id_administrador', 'administradores')
            custom_id_auditoria = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        
            user_name = data.get('nombre')
            user_username = data.get('nombre_usuario')
            user_password = data.get('password')
            estado_empleado = data.get('id_estado_empleado')
            id_rol = data.get('id_rol')
            current_user = session.get("usuario")
            # Validación de entrada
            if not user_name or not user_password:
                return jsonify({'message': 'Se require ingresar usuario y contraseña'}), 400

            User.add_user(mysql,custom_id, user_name, user_username, user_password, estado_empleado, id_rol)
            # Buscar como hacer que en el parametro del usuario pasarle el id del usuario que lo crea, aunque siempre va a crear los usuarios el administrador que es unico 
            Auditoria.log_audit(mysql, custom_id_auditoria, 'administradores', custom_id, 'INSERT', 'ADM0001', 'Se crea usuario por primera vez' )
            with open(ruta_archivo, 'a') as f:
                f.write(f'Nombre de usuario: {user_username} - Contraseña: {user_password}\n')
            
            return jsonify({'message': 'Usuario creado!'}), 201
        except Exception as e:
            return jsonify({"message": f"Error al registrar usuario: {str(e)}"}), 500
    
    @staticmethod
    def listar_usuarios():
        mysql = current_app.mysql
        
        try:
            users = User.get_users(mysql)
            for user in users:
                user['id_estado_empleado'] = (
                    'Activo' if user['id_estado_empleado'] == 'EMP0001' else
                    'Inactivo' if user['id_estado_empleado'] == 'EMP0002' else
                    user['id_estado_empleado']
                )
                user['id_rol'] = (
                    'Administrador' if user['id_rol'] == 'ROL0001' else
                    'Contador' if user['id_rol'] == 'ROL0002' else
                    'Secretario' if user['id_rol'] == 'ROL0003' else
                    user['id_rol']
                )
            return jsonify(users)
        except Exception as e:
            return jsonify({"message": f"Error al listar usuarios: {str(e)}"}), 500
    
    @staticmethod
    def actualizar_estado_usuario(data):
        mysql = current_app.mysql
        if "user" not in session:
            return jsonify({'message': 'Unauthorized'}), 401
        custom_id_auditoria = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        try:
            user_name = data.get('nombre_usuario')
            id_administrador = request.args.get("id_administrador")
            id_estado_empleado = data.get("id_estado_empleado")
            
            user = User.get_user_by_username(mysql, user_name)
            id_administrador_usuario = user['id_administrador']

            User.update_estado_empleado(mysql,id_estado_empleado, id_administrador)
            Auditoria.log_audit(mysql, custom_id_auditoria, 'administradores', id_administrador, 'UPDATE', id_administrador_usuario, f'Estado de usuario {id_administrador} actualizado')
            return jsonify({"message": "Estado del usuario actualizado exitosamente"}), 200
        except Exception as e:
            return jsonify({"message": f"Error al actualizar estado: {str(e)}"}), 500

    @staticmethod
    def login():
        if request.method == "POST":
            user = request.form["email"]
            password = request.form["password"]
            rol = request.form["rol"]
            #session crea una cokie en el navegador, diccionario session
            session['user'] = user
            session['password'] = password
            session['rol'] = rol
        
            if not session["user"] or not session["password"] or not session["rol"]:
                return jsonify({'message': 'Unauthorized'}), 401
            
            mysql = current_app.mysql

            user = User.get_user_by_username(mysql, session["user"])
            if user['id_estado_empleado'] == 'EMP0001':
                # user['password'] es la contraseña de la base de datos
                if user["nombre_usuario"] == session["user"] and User.check_password(user['password'], session["password"]):
                    print(session)
                    return jsonify({"rol": session["rol"], "usuario": session["user"], "message": "Authenticated"}), 200
                else:
                    return jsonify({'message': 'Unauthorized'}), 401
            else:
                return jsonify({'message': 'Unauthorized'}), 401
        else:
            return jsonify({"message": "Usuario o contraseña incorrectos bac 1"}), 400
    
    def changuePassword():
        mysql = current_app.mysql
        if "user" not in session:
            return jsonify({'message': 'Unauthorized'}), 401  # Asegurar que hay una sesión activa
        try:
            data = request.get_json()  # Obtener datos en formato JSON
            user_name = data.get('nombre_usuario')
            password = data.get('password')
            new_password = data.get('new_password')
            
            custom_id_auditoria = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')

            user = User.get_user_by_username(mysql, user_name)
            id_administrador = user['id_administrador']

            if user and User.check_password(user['password'], password):
                # Hashear la nueva contraseña
                hashed_password = hashlib.sha256(new_password.encode()).hexdigest()
                
                # Actualizar la contraseña en la base de datos
                User.changue_password(mysql, hashed_password, session['user'])
                Auditoria.log_audit(mysql, custom_id_auditoria, 'administradores', id_administrador, 'UPDATE', id_administrador, 'Se actualiza contraseña' )
                with open(ruta_archivo, 'a') as f:
                    f.write(f'Nombre de usuario: {user_name} - Contraseña: {new_password}\n')

                print('✅ Contraseña Actualizada')
                return jsonify({"message": "Contraseña actualizada exitosamente"}), 200
            else:
                print('❌ Error al cambiar contraseña: Contraseña antigua incorrecta')
                return jsonify({"message": "Error al cambiar contraseña: Contraseña antigua incorrecta"}), 400
        except Exception as e:
            mysql.connection.rollback()
            print(f"❌ Error inesperado: {str(e)}")
            return jsonify({"message": f"Error al cambiar contraseña: {str(e)}"}), 500
    
    def verify_role():
            mysql = current_app.mysql
        
            user = request.form.get("email")
            password = request.form.get("password")
            user_data = User.get_user_by_username(mysql, user)

            if user_data and User.check_password(user_data['password'], password):
                return jsonify({"rol": user_data['id_rol']}), 200 
            else:
                return jsonify({"message": "Usuario o contraseña incorrectos back 2"}), 400    