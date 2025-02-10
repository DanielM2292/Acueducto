from flask import Blueprint

# Inicializamos los Blueprints para cada módulo de rutas
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')
facturas_bp = Blueprint('facturas', __name__, url_prefix='/facturas')
clientes_bp = Blueprint('clientes', __name__, url_prefix='/clientes')
productos_bp = Blueprint('productos', __name__, url_prefix='/productos')
matriculas_bp = Blueprint('matriculas', __name__, url_prefix='/matriculas')
multas_bp = Blueprint('multas', __name__, url_prefix='/multas')
ingresos_bp = Blueprint('ingresos', __name__, url_prefix='/ingresos')
egresos_bp = Blueprint('egresos', __name__, url_prefix='/egresos')
historial_bp = Blueprint('auditoria', __name__, url_prefix='/auditoria')
pagos_bp = Blueprint('pagos', __name__, url_prefix='/pagos')

# Aquí puedes importar los módulos para registrar sus rutas con los Blueprints
from .auth import *
from .facturas import *
from .clientes import *
from .productos import *
from .matriculas import *
from .multas import *
from .ingresos import *
from .egresos import *
from .historial import *
from .pagos import *