from flask import jsonify, current_app, request
from datetime import datetime
from app.models import Clientes, Facturas, Auditoria, Matriculas, Valores_medidor, Tarifa_medidores, Tarifas_estandar, Estandar_factura

class FacturasServices:
    @staticmethod
    def generarFacturasAutomaticas():
        mysql = current_app.mysql
        
        datos_estandar = Tarifas_estandar.obtener_datos_estandar(mysql)
        valor_pendiente = datos_estandar['tarifa_definida']
        id_tarifa_estandar = datos_estandar['id_tarifa_estandar']
        
        fecha_actual = datetime.now()
        mes_siguiente = fecha_actual.month + 1
        anio = fecha_actual.year
        
        if mes_siguiente > 12:
            mes_siguiente = 1
            anio += 1
            
        fecha_vencimiento = fecha_actual.replace(year=anio, month=mes_siguiente)
        
        id_matricula_cliente = Clientes.get_clientes_facturas_estandar(mysql)
        if id_matricula_cliente:
            facturas_generadas = [] 
            for matricula_cliente in id_matricula_cliente:  # Iterar sobre cada cliente
                id_matricula_cliente = matricula_cliente['id_matricula_cliente']
                
                id_cliente = matricula_cliente['id_cliente']
                custom_id = Auditoria.generate_custom_id(mysql, 'FAC', 'id_factura', 'facturas')
                custom_id_estandar_factura = Auditoria.generate_custom_id(mysql, 'EFA', 'id_estandar_factura', 'estandar_factura')
                custom_id_auditoria = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
                
                Estandar_factura.crear_factura_estandar(mysql, custom_id_estandar_factura, id_tarifa_estandar, id_matricula_cliente, 1)
                
                Facturas.generar_facturas(mysql, custom_id, fecha_vencimiento, id_cliente, 'ESF0001', valor_pendiente, id_matricula_cliente, custom_id_estandar_factura)
                Auditoria.log_audit(mysql, custom_id_auditoria, 'facturas', custom_id, 'INSERT', 'ADM0001', f'Factura generada para el cliente {id_matricula_cliente}')
                
                factura_info = {
                    "id_factura": custom_id,
                    "fecha_vencimiento": fecha_vencimiento.strftime("%Y-%m-%d"),
                    "id_cliente": id_cliente,
                    "valor_pendiente": valor_pendiente,
                    "id_matricula_cliente": id_matricula_cliente,
                    "id_estandar_factura": custom_id_estandar_factura
                }
                facturas_generadas.append(factura_info)

            # Mover el return fuera del bucle for
            print(facturas_generadas)  # Para depuración
            return jsonify({'message': 'Facturas generadas', 'facturas': facturas_generadas}), 200
        else:
            return jsonify({'message': 'No existen clientes'}), 404
        
    @staticmethod
    def listar_facturas():
        mysql = current_app.mysql
        try:
            facturas = Facturas.listar_facturas(mysql)
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
    
    @staticmethod
    def buscar_factura():
        print('entra al end')
        mysql = current_app.mysql
        try:
            id_factura = request.args.get("id_factura")
            print(id_factura)
            factura = Facturas.buscar_factura(mysql, id_factura)
            print(factura)
            if not factura:
                return jsonify({'error': 'Factura no encontrada'}), 404
            return jsonify(factura), 200
            
        except Exception as e:
            return jsonify({"message": f"Error al obtener el id de la factura: {str(e)}"})
    
    @staticmethod
    def crear_factura():
        mysql = current_app.mysql
        custom_id_tarifa = Auditoria.generate_custom_id(mysql, 'TAM', 'id_tarifa_medidor', 'tarifa_medidores')
        custom_id_factura = Auditoria.generate_custom_id(mysql, 'FAC', 'id_factura', 'facturas')
        custom_id_audi_tarifa = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        data = request.get_json()
        try:
            custom_id_audi_factura = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
            
            numero_matricula = data.get("numeroMatricula")
            fecha_factura = data.get("fechaInicioCobro")
            fecha_vencimiento = data.get("fechaVencimiento")
            lectura_actual = int(data.get("lecturaActual"))
            
            tipo_tarifa = Matriculas.obtener_tipo(mysql, numero_matricula)
            tipo_tarifa = tipo_tarifa['tipo_tarifa']
            
            if tipo_tarifa == 'Medidor':
                cliente = Clientes.get_id_cliente(mysql, numero_matricula)
                id_cliente = cliente['id_cliente']
                id_matricula_cliente = cliente['id_matricula_cliente']
                
                valores_medidor = Valores_medidor.obtener_datos(mysql)
                id_valores_medidor = valores_medidor['id_valores_medidor']
                limite_medidor = int(valores_medidor['limite_medidor'])
                valor_limite = int(valores_medidor['valor_limite'])
                valor_metro3 = int(valores_medidor['valor_metro3'])
                
                if lectura_actual <= limite_medidor:
                    valor_total_lectura = valor_limite
                    Tarifa_medidores.crear_tarifa(mysql, custom_id_tarifa, lectura_actual, id_valores_medidor, valor_total_lectura, id_matricula_cliente)
                    Auditoria.log_audit(mysql, custom_id_audi_tarifa, 'tarifa_medidores', custom_id_tarifa, 'INSERT', 'ADM0001', f'Se crea una nueva tarifa medidores para la matricula {id_matricula_cliente}')
                else:                    
                    diferencia_medidor = lectura_actual-limite_medidor
                    valor_total_lectura = (valor_limite) + (diferencia_medidor*valor_metro3)
                    Tarifa_medidores.crear_tarifa(mysql, custom_id_tarifa, lectura_actual, id_valores_medidor, valor_total_lectura, id_matricula_cliente)
                    Auditoria.log_audit(mysql, custom_id_audi_tarifa, 'tarifa_medidores', custom_id_tarifa, 'INSERT', 'ADM0001', f'Se crea una nueva tarifa medidores para la matricula {id_matricula_cliente}')
                
                Facturas.crear_factura(mysql, custom_id_factura, fecha_factura, fecha_vencimiento, id_cliente, 'ESF0001', valor_total_lectura, id_matricula_cliente, custom_id_tarifa)
                Auditoria.log_audit(mysql, custom_id_audi_factura, 'facturas', custom_id_factura, 'INSERT', 'ADM0001', f'Se crea una factura para la matricula {id_matricula_cliente}')
                
                factura_nueva = {
                "numeroFactura": custom_id_factura,
                "precioUnitario": valor_total_lectura,
                "saldoPendiente": valor_total_lectura
                }
                
                
                return jsonify({"message": "Factura creada exitosamente", "factura": factura_nueva}), 200
            else:
                return jsonify({'error': 'El tipo de matricula no permite crear una factura'}), 409
            
        except Exception as e:
            return jsonify({"message": f"Error al obtener el id de la factura: {str(e)}"})
    