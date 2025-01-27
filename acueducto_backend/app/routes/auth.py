from flask import request, current_app, render_template, redirect, url_for, session, jsonify
from app.services import AuthServices
from app.routes import auth_bp

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

@auth_bp.route('/actualizar_estado_usuario', methods=["PUT", 'OPTIONS'])
def actualizar_estado_usuario():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    data = request.get_json()
    return AuthServices.actualizar_estado_usuario(data)

#Endpoint para actualizar el nombre de usuario
@auth_bp.route('/updateUser', methods=['POST', 'OPTIONS'])
def updateUser():
    data = request.get_json()
    return AuthServices.updateUser(data)

@auth_bp.route('/login', methods=["POST", "OPTIONS"])
def login():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return AuthServices.login()

@auth_bp.route('/changuePassword', methods=['POST', "OPTIONS"])
def changuePassword():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return AuthServices.changuePassword()    
    
@auth_bp.route('/verify_role', methods=["POST", "OPTIONS"])
def verify_role():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return AuthServices.verify_role()

@auth_bp.route('/logout')  
def logout():
    # Se limpia la variable session del usuario que esta manejando y redirecciona al login
    session.clear()
    return jsonify({"mensaje": 'Logout ok'}), 200