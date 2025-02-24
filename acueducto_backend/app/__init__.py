from flask import Flask
from flask_cors import CORS
from .models import init_db
from .routes import auth_bp, facturas_bp, clientes_bp, productos_bp, matriculas_bp, multas_bp, ingresos_bp, egresos_bp, historial_bp, pagos_bp, gestion_bp

def create_app():
    app = Flask(__name__)
    app.secret_key = 'cualquiera'
    app.config.from_object('app.config.Config')
    mysql = init_db(app)
    CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(facturas_bp)
    app.register_blueprint(clientes_bp)
    app.register_blueprint(productos_bp)
    app.register_blueprint(matriculas_bp)
    app.register_blueprint(multas_bp)
    app.register_blueprint(ingresos_bp)
    app.register_blueprint(egresos_bp)
    app.register_blueprint(historial_bp)
    app.register_blueprint(pagos_bp)
    app.register_blueprint(gestion_bp)
    
    app.mysql = mysql

    return app
