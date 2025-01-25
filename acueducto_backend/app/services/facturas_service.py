from flask import jsonify, current_app
from datetime import datetime
from app.models import Clientes, Facturas, Auditoria

class FacturasServices:
    @staticmethod
    def generar_facturas():
        
        mysql = current_app.mysql
        
        fecha_actual = datetime.now()
        mes_siguiente = fecha_actual.month + 1
        anio = fecha_actual.year
        
        if mes_siguiente > 12:
            mes_siguiente = 1
            anio += 1
            
        fecha_vencimiento = fecha_actual.replace(year=anio, month=mes_siguiente)
        
        clientes = Clientes.get_clientes(mysql)
        if clientes:
            for cliente in clientes:  # Iterar sobre cada cliente
                id_cliente = cliente['id_cliente']
                custom_id = Auditoria.generate_custom_id(mysql, 'FAC', 'id_factura', 'facturas')
                custom_id_auditoria = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
                Facturas.generar_facturas(mysql, custom_id, fecha_vencimiento, id_cliente, 'ESF0001')
                Auditoria.registrar_auditoria(mysql, custom_id_auditoria, 'facturas', custom_id, 'INSERT', 'ADM0003', f'Factura generada para el cliente {cliente['nombre']}' )
                
            return jsonify({'message': 'Facturas generadas'}), 200
        else:
            return jsonify({'message': 'No existen clientes'}), 404    
        
        