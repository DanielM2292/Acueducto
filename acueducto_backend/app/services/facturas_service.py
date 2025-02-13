from flask import jsonify, current_app, request
from datetime import datetime
from app.models import Clientes, Facturas, Auditoria

class FacturasServices:
    @staticmethod
    def generarFacturasAutomaticas():
        mysql = current_app.mysql
        
        fecha_actual = datetime.now()
        mes_siguiente = fecha_actual.month + 1
        anio = fecha_actual.year
        
        if mes_siguiente > 12:
            mes_siguiente = 1
            anio += 1
            
        fecha_vencimiento = fecha_actual.replace(year=anio, month=mes_siguiente)
        
        id_matricula_cliente = Clientes.get_clientes_facturas_estandar(mysql)
        if id_matricula_cliente:
            for matricula_cliente in id_matricula_cliente:  # Iterar sobre cada cliente
                id_matricula_cliente = matricula_cliente['id_matricula_cliente']
                id_cliente = matricula_cliente['id_cliente']
                custom_id = Auditoria.generate_custom_id(mysql, 'FAC', 'id_factura', 'facturas')
                custom_id_auditoria = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
                Facturas.generar_facturas(mysql, custom_id, fecha_vencimiento, id_cliente, 'ESF0001', id_matricula_cliente, 'TAE0001')
                Auditoria.log_audit(mysql, custom_id_auditoria, 'facturas', custom_id, 'INSERT', 'ADM0001', f'Factura generada para el cliente {id_matricula_cliente}' )
                
            return jsonify({'message': 'Facturas generadas'}), 200
        else:
            return jsonify({'message': 'No existen clientes'}), 404
    
    @staticmethod
    def listar_facturas():
        mysql = current_app.mysql
        try:
            facturas = Facturas.listar_facturas(mysql)
            print(facturas)
            return jsonify(facturas), 200
        except Exception as e:
            return jsonify({"message": f"Error al listar todas las facturas: {str(e)}"}), 500
    
    # Para el modulo pagos
    @staticmethod
    def obtener_factura():
        print('entra al end')
        mysql = current_app.mysql
        try:
            id_factura = request.args.get("idFactura")
            factura = Facturas.buscar_factura(mysql, id_factura)
            
            if not factura:
                return jsonify({'error': 'Factura no encontrada'}), 404
            return jsonify(factura), 200
            
        except Exception as e:
            return jsonify({"message": f"Error al obtener el id de la factura: {str(e)}"})
    