from .auth_services import AuthServices
from .facturas_service import FacturasServices
from .clientes_services import ClientesServices
from .productos_services import ProductosServices
from .matriculas_services import MatriculasServices
from .multas_services import MultasServices
from .ingresos_services import IngresosServices
from .egresos_services import EgresosServices

# Exponemos los servicios para facilitar su importación en otros módulos
__all__ = [
    'AuthServices',
    'FacturasServices',
    'ClientesServices',
    'ProductosServices',
    'MatriculasServices',
    'MultasServices',
    'IngresosServices',
    'EgresosServices'
]