from flask import Blueprint

# Inicializamos los Blueprints para cada módulo de rutas
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')
facturas_bp = Blueprint('facturas', __name__, url_prefix='/facturas')

# Aquí puedes importar los módulos para registrar sus rutas con los Blueprints
from .auth import *
from .facturas import *