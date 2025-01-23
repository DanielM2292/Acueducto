from flask import request, current_app, render_template, redirect, url_for, session
from app.models import User, Auditoria
from app.services import AuthServices
from app.routes import auth_bp
import os, hashlib

ruta_archivo = os.path.join(os.getcwd(), 'data', 'contraseñas.txt')
@auth_bp.route('/')
def main():
    return render_template('login.html')

# Enpoint para agregar usuario, se pasa los parametros con formato JSON
@auth_bp.route('/register', methods=['POST'])
def create_user():
    data = request.get_json()
    return AuthServices.create_user(data)

#Endpoint para actualizar el nombre de usuario
@auth_bp.route('/updateUser', methods=['POST'])
def updateUser():
    data = request.get_json()
    return AuthServices.updateUser(data)

# Endpoint para validar usuario y contraseña en Thunder Client
@auth_bp.route('/loginValidate', methods=['POST'])
def loginValidate():
    data = request.get_json()
    return AuthServices.loginValidate(data)

# Endpoint para manejo basico de login con usuarios, redireccion y cookies para la validacion
# Cuenta con paginas html hechas para prueba de rutas 
@auth_bp.route('/login', methods=["POST"])
def login():
    if request.method == "POST":
        user = request.form["email"]
        password = request.form["password"]
        rol = request.form["rol"]
        #session crea una cokie en el navegador, diccionario session
        session['user'] = user
        session['password'] = password
        session['rol'] = rol
        # Esta redireccion la hace al metodo def index()
        return redirect(url_for('auth.index'))
    else:
        return "error redireccion"

@auth_bp.route('/index')
def index():
    
    mysql = current_app.mysql
    
    if not session["user"] or not session["password"] or not session["rol"]:
        return redirect(url_for('auth.main'))

    user = User.get_user_by_username(mysql, session["user"])
    if user['id_estado_empleado'] == 'EMP0001':
        # user['password'] es la contraseña de la base de datos
        if user and User.check_password(user['password'], session["password"]):
            if user['id_rol'] == 'ROL0001' and session["rol"] == "administrador":
                return render_template('admin.html', user=user)
            elif user['id_rol'] == 'ROL0002' and session["rol"] == "auxiliar" :
                return render_template('auxiliar.html', user=user)
            elif user['id_rol'] == 'ROL0003' and session["rol"] == "contador":
                return render_template('contador.html', user=user)
        return redirect(url_for('auth.main'))
    else:
        return redirect(url_for('auth.main'))

@auth_bp.route('/changuePassword', methods=['POST'])
def changuePassword():
    
    mysql = current_app.mysql
    
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
        Auditoria.registrar_auditoria(mysql, custom_id_auditoria, 'administradores', user["id_administrador"], 'UPDATE', user["id_administrador"], 'Se actualiza la contraseña del usuario' )
        with open(ruta_archivo, 'a') as f:
            f.write(f'Nombre de usuario: {session["user"]} - Contraseña: {new_password}\n')
        return redirect(url_for('auth.main'))
    else:
        print('Error al cambiar contraseña')
        return redirect(url_for('auth.main'))

@auth_bp.route('/logout')  
def logout():
    # Se limpia la variable session del usuario que esta manejando y redirecciona al login
    session.clear()
    return redirect(url_for('auth.main'))