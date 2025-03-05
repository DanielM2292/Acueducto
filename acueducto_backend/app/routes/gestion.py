from flask import Flask, request, jsonify
from app.services import GestionServices
from app.routes import gestion_bp
from ..config import Config

@gestion_bp.route('/backup', methods=['POST','OPTIONS'])
def backup():
    host = Config.MYSQL_HOST
    user = Config.MYSQL_USER
    password = Config.MYSQL_PASSWORD
    database = Config.MYSQL_DB
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return GestionServices.crearBackup(host, user, password, database)

@gestion_bp.route('/estandar', methods=['GET','OPTIONS'])
def datos_estandar():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return GestionServices.datos_estandar()

@gestion_bp.route('/medidor', methods=['GET','OPTIONS'])
def datos_medidor():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    return GestionServices.datos_medidor()

@gestion_bp.route('/actualizar_estandar', methods=['PUT','OPTIONS'])
def actualizar_datos_estandar():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    data = request.get_json()
    return GestionServices.actualizar_datos_estandar(data)

@gestion_bp.route('/actualizar_medidor', methods=['PUT','OPTIONS'])
def actualizar_datos_medidor():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight response'}), 200
    data = request.get_json()
    return GestionServices.actualizar_datos_medidor(data)