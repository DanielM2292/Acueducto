from flask import Flask
from flask_cors import CORS
from .models import init_db
from .routes import auth_bp, facturas_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')
    mysql = init_db(app)
    CORS(app)
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(facturas_bp)
    
    app.mysql = mysql

    return app
