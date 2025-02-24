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