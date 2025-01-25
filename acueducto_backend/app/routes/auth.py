from flask import request, current_app, render_template, redirect, url_for, session, jsonify
from app.models import User, Auditoria
from app.services import AuthServices
from app.routes import auth_bp
import os, hashlib

ruta_archivo = os.path.join(os.getcwd(), 'data', 'contraseñas.txt')
@auth_bp.route('/')
def main():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return jsonify({"message": "Login successful"}), 200

# Enpoint para agregar usuario, se pasa los parametros con formato JSON
@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def create_user():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    data = request.get_json()
    return AuthServices.create_user(data)

@auth_bp.route('/listar_usuarios', methods=["GET", 'OPTIONS'])
def listar_usuarios():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return AuthServices.listar_usuarios()

@auth_bp.route('/actualizar_estado_usuario', methods=["PUT"])
def actualizar_estado_usuario():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return AuthServices.actualizar_estado_usuario()

#Endpoint para actualizar el nombre de usuario
@auth_bp.route('/updateUser', methods=['POST'])
def updateUser():
    data = request.get_json()
    return AuthServices.updateUser(data)

# Endpoint para manejo basico de login con usuarios, redireccion y cookies para la validacion
# Cuenta con paginas html hechas para prueba de rutas 
@auth_bp.route('/login', methods=["POST", "OPTIONS"])
def login():
    if request.method == 'OPTIONS':
        # Aquí puedes manejar la respuesta para la solicitud OPTIONS
        return jsonify({'message': 'CORS preflight response'}), 200
    
    if not session["user"] or not session["password"] or not session["rol"]:
            return redirect(url_for('auth.main'))
    
    if request.method == "POST":
        user = request.form["email"]
        password = request.form["password"]
        rol = request.form["rol"]
        #session crea una cokie en el navegador, diccionario session
        session['user'] = user
        session['password'] = password
        session['rol'] = rol
        # Esta redireccion la hace al metodo def index()
        
        if not session["user"] or not session["password"] or not session["rol"]:
            return redirect(url_for('auth.main'))
        return redirect('index')
    else:
        return jsonify({"message": "Usuario o contraseña incorrectos 1"}), 400

@auth_bp.route('/index')
def index():
    if request.method == 'OPTIONS':
        # Aquí puedes manejar la respuesta para la solicitud OPTIONS
        return jsonify({'message': 'CORS preflight response'}), 200
    
    mysql = current_app.mysql
    
    if not session["user"] or not session["password"] or not session["rol"]:
        return redirect(url_for('auth.main'))

    user = User.get_user_by_username(mysql, session["user"])
    if user['id_estado_empleado'] == 'EMP0001':
        # user['password'] es la contraseña de la base de datos
        if user and User.check_password(user['password'], session["password"]):
            if user['id_rol'] == 'ROL0001' and session["rol"] == "ROL0001":
                session["rol"] = user['id_rol']
                session["user"] = user['nombre_usuario']
                return jsonify({"rol": session["rol"], "usuario": session["user"], "message": "Authenticated"}), 200
            elif user['id_rol'] == 'ROL0002' and session["rol"] == "ROL0002" :
                return jsonify({"rol": user['id_rol']}), 200 
            elif user['id_rol'] == 'ROL0003' and session["rol"] == "ROL0003":
                return jsonify({"rol": user['id_rol']}), 200         
        return jsonify({'message': 'Unauthorized'}), 401
    else:
        return redirect(url_for('auth.main'))

@auth_bp.route('/changuePassword', methods=['POST'])
def changuePassword():
    
    mysql = current_app.mysql
    
    if not session["user"] or not session["password"] or not session["rol"]:
        return redirect(url_for('auth.main'))
    
    custom_id_auditoria = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
    
    if "user" not in session:
        return redirect(url_for('auth.main'))
    
    password = request.form['password']
    new_password = request.form['new_password']
    
    user = User.get_user_by_username(mysql, session["user"])
    
    if user and User.check_password(user['password'], password):
        # Hashear la nueva contraseña
        hashed_password = hashlib.sha256(new_password.encode()).hexdigest()
        
        # Actualizar la contraseña en la base de datos
        User.changue_password(mysql, hashed_password, session['user'])

        print('Contraseña Actualizada')
        Auditoria.log_audit(mysql, custom_id_auditoria, 'administradores', user["id_administrador"], 'UPDATE', user["id_administrador"], 'Se actualiza la contraseña del usuario' )
        with open(ruta_archivo, 'a') as f:
            f.write(f'Nombre de usuario: {session["user"]} - Contraseña: {new_password}\n')
        return redirect(url_for('auth.main'))
    else:
        print('Error al cambiar contraseña')
        return redirect(url_for('auth.main'))
    
@auth_bp.route('/verify_role', methods=["POST", "OPTIONS"])
def verify_role():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    
    mysql = current_app.mysql
    
    user = request.form.get("email")
    password = request.form.get("password")
    user_data = User.get_user_by_username(mysql, user)

    if user_data and User.check_password(user_data['password'], password):
        print('envio datos')
        return jsonify({"rol": user_data['id_rol']}), 200 
    else:
        return jsonify({"message": "Usuario o contraseña incorrectos back 2"}), 400

@auth_bp.route('/logout')  
def logout():
    # Se limpia la variable session del usuario que esta manejando y redirecciona al login
    session.clear()
    return redirect(url_for('auth.main'))