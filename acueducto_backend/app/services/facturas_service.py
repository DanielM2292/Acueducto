from flask import jsonify, current_app, request, session
from datetime import datetime
from app.models import Clientes, Facturas, Auditoria, Matriculas, Valores_medidor, Tarifa_medidores, Tarifas_estandar, Estandar_factura, Matricula_cliente, Multa_clientes, Ingresos, User

class FacturasServices:
    @staticmethod
    def generarFacturasAutomaticas():
        mysql = current_app.mysql
        #if "user" not in session:
            #return jsonify({'message': 'Unauthorized'}), 401
        try:
            # data = request.get_json()
            # user_name = data.get('nombre_usuario')
            # user = User.get_user_by_username(mysql, user_name)
            # id_administrador = user['id_administrador']
            datos_estandar = Tarifas_estandar.obtener_datos_estandar(mysql)
            valor_pendiente = datos_estandar['tarifa_definida']
            id_tarifa_estandar = datos_estandar['id_tarifa_estandar']
            
            fecha_actual = datetime.now()
            dia_siguiente = fecha_actual.day + 25
            anio = fecha_actual.year
            
            if fecha_actual.month > 12:
                fecha_actual.month = 1
                anio += 1
                
            fecha_vencimiento = fecha_actual.replace(year=anio, day=dia_siguiente)
            id_matricula_cliente = Clientes.get_clientes_facturas_estandar(mysql)
            if id_matricula_cliente:
                facturas_generadas = [] 
                for matricula_cliente in id_matricula_cliente:  # Iterar sobre cada cliente
                    id_matricula_cliente = matricula_cliente['id_matricula_cliente']
                    id_cliente = matricula_cliente['id_cliente']
                    
                    cantidad_pagos = Estandar_factura.get_cantidad_pagos(mysql, id_matricula_cliente)

                    if cantidad_pagos:
                        id_factura = cantidad_pagos['id_factura']
                        cantidad_pagos = int(cantidad_pagos['cantidad_meses'])
                    
                        if cantidad_pagos == 0 or cantidad_pagos == 1:
                            datos_cliente = Matricula_cliente.obtener_datos_factura_estandar(mysql, id_matricula_cliente)
                            multas = Multa_clientes.obtener_multas(mysql, id_matricula_cliente)
                            datos_cliente.update(multas or {})
                            facturas_pendientes = Facturas.obtener_suma_facturas_pendientes(mysql, id_matricula_cliente)
                            datos_cliente.update(facturas_pendientes or {})
                            
                            custom_id = Auditoria.generate_custom_id(mysql, 'FAC', 'id_factura', 'facturas')
                            custom_id_estandar_factura = Auditoria.generate_custom_id(mysql, 'EFA', 'id_estandar_factura', 'estandar_factura')
                            custom_id_auditoria = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
                            
                            Estandar_factura.crear_factura_estandar(mysql, custom_id_estandar_factura, id_tarifa_estandar, id_matricula_cliente, 1)
                            
                            Facturas.generar_facturas(mysql, custom_id, fecha_vencimiento, id_cliente, 'ESF0001', valor_pendiente, id_matricula_cliente, custom_id_estandar_factura)
                            Auditoria.log_audit(mysql, custom_id_auditoria, 'facturas', custom_id, 'INSERT', 'ADM0001', f'Factura generada para el cliente {id_matricula_cliente}')
                        
                            factura_info = {
                                "id_factura": custom_id,
                                "fecha_vencimiento": fecha_vencimiento.strftime("%Y-%m-%d"),
                                "fecha_inicio": fecha_actual.strftime("%Y-%m-%d"),
                                "numero_documento": datos_cliente['numero_documento'],
                                "valor_pendiente": datos_cliente['valor_pendiente'],
                                "valor_estandar": valor_pendiente,
                                "nombre_cliente": datos_cliente['nombre'],
                                "direccion": datos_cliente['direccion'],
                                "numero_matricula": datos_cliente['numero_matricula'],
                                "multas": datos_cliente['total_multas'],
                                "observacion": "Factura generada automaticamente"
                            }
                            facturas_generadas.append(factura_info)
                        else:
                            id_estandar_factura = Facturas.obtener_id_estandar(mysql, id_factura)
                            id_estandar_factura = id_estandar_factura['id_estandar_factura']
                            cantidad_nueva = cantidad_pagos - 1
                            if cantidad_nueva == 1:
                                Estandar_factura.actualizar_cantidad_mes(mysql, 0, id_estandar_factura)
                                Facturas.update_pago_factura(mysql, 0, id_factura)
                            else:
                                Estandar_factura.actualizar_cantidad_mes(mysql, cantidad_nueva, id_estandar_factura)
                    else:
                        datos_cliente = Matricula_cliente.obtener_datos_factura_estandar(mysql, id_matricula_cliente)
                        multas = Multa_clientes.obtener_multas(mysql, id_matricula_cliente)
                        datos_cliente.update(multas or {})
                        facturas_pendientes = Facturas.obtener_suma_facturas_pendientes(mysql, id_matricula_cliente)
                        datos_cliente.update(facturas_pendientes or {})

                        custom_id = Auditoria.generate_custom_id(mysql, 'FAC', 'id_factura', 'facturas')
                        custom_id_estandar_factura = Auditoria.generate_custom_id(mysql, 'EFA', 'id_estandar_factura', 'estandar_factura')
                        custom_id_auditoria = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
                        
                        Estandar_factura.crear_factura_estandar(mysql, custom_id_estandar_factura, id_tarifa_estandar, id_matricula_cliente, 1)
                        
                        Facturas.generar_facturas(mysql, custom_id, fecha_vencimiento, id_cliente, 'ESF0001', valor_pendiente, id_matricula_cliente, custom_id_estandar_factura)
                        Auditoria.log_audit(mysql, custom_id_auditoria, 'facturas', custom_id, 'INSERT', 'ADM0001', f'Factura generada para el cliente {id_matricula_cliente}')
                        
                        factura_info = {
                            "id_factura": custom_id,
                            "fecha_vencimiento": fecha_vencimiento.strftime("%Y-%m-%d"),
                            "fecha_inicio": fecha_actual.strftime("%Y-%m-%d"),
                            "numero_documento": datos_cliente['numero_documento'],
                            "valor_pendiente": datos_cliente['valor_pendiente'],
                            "valor_estandar": valor_pendiente,
                            "nombre_cliente": datos_cliente['nombre'],
                            "direccion": datos_cliente['direccion'],
                            "numero_matricula": datos_cliente['numero_matricula'],
                            "multas": datos_cliente['total_multas'],
                            "observacion": "Factura generada automaticamente"
                        }
                        facturas_generadas.append(factura_info)
                        print('finaliza cliente', id_matricula_cliente)
                        continue  # Salta a la siguiente iteración

                return jsonify({'message': 'Facturas generadas', 'facturas': facturas_generadas}), 200
            else:
                return jsonify({'message': 'No existen clientes'}), 404
        except Exception as e:
            # Deshacer cualquier cambio realizado en la base de datos cuando ocurre un error, en el instante que se falla
            # si hubo cambios previos los deshace para mantener la integridad de los datos
            print(e)
            mysql.connection.rollback()
            return jsonify({"message": f"Error al generar facturas automaticas: {str(e)}"}), 500
        
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
        mysql = current_app.mysql
        try:
            id_factura = request.args.get("id_factura")
            factura = Facturas.buscar_factura(mysql, id_factura)
            
            total_estandar = Tarifas_estandar.obtener_tarifa(mysql, id_factura)
            total_medidor = Tarifa_medidores.obtener_tarifa(mysql, id_factura)
            
            if not total_medidor:
                total_factura = total_estandar
            else:
                total_factura = total_medidor
                
            factura.update(total_factura)
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
            print('entra al try')
            id_factura = request.args.get("id_factura")
            print(id_factura)
            factura_medidor = Facturas.buscar_factura_medidor(mysql, id_factura)
            factura_estandar = Facturas.buscar_factura_estandar(mysql, id_factura)
            if not factura_estandar:
                factura = factura_medidor
            else:
                factura = factura_estandar
            print(factura)
            id_matricula_cliente = factura['id_matricula_cliente']
            multas = Multa_clientes.obtener_multas(mysql, id_matricula_cliente)
            factura.update(multas or {})
            lectura_anterior = Facturas.get_ultima_lectura(mysql, id_matricula_cliente)
            factura.update(lectura_anterior or {})
            print(factura)
            if not factura:
                return jsonify({'error': 'Factura no encontrada'}), 404
            return jsonify(factura), 200
            
        except Exception as e:
            return jsonify({"message": f"Error al obtener el id de la factura: {str(e)}"})
    
    @staticmethod
    def crear_factura(data):
        mysql = current_app.mysql    
        if "user" not in session:
            return jsonify({'message': 'Unauthorized'}), 401
        try:
            print('entra al tru')
            user_name = data.get('nombre_usuario')
            user = User.get_user_by_username(mysql, user_name)
            id_administrador = user['id_administrador']
            custom_id_tarifa = Auditoria.generate_custom_id(mysql, 'TAM', 'id_tarifa_medidor', 'tarifa_medidores')
            custom_id_factura = Auditoria.generate_custom_id(mysql, 'FAC', 'id_factura', 'facturas')  
            custom_id_audi_factura = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
            numero_matricula = data.get("numeroMatricula")
            fecha_factura = data.get("fechaInicioCobro")            
            fecha_vencimiento = data.get("fechaVencimiento")
            lectura_actual = int(data.get("lecturaActual"))
            lectura_anterior = data.get("lecturaAnterior")
            
            if not fecha_vencimiento or not fecha_factura:
                return jsonify({'error': 'No digito las fechas para la factura'}), 409
            
            if lectura_anterior is None or lectura_anterior == '':
                lectura_anterior = 0
            else:
                lectura_anterior = int(lectura_anterior)
            tipo_tarifa = Matriculas.obtener_tipo(mysql, numero_matricula)
            tipo_tarifa = tipo_tarifa['tipo_tarifa']
            
            factura_generada = []
            if tipo_tarifa == 'Medidor' and lectura_actual > lectura_anterior:
                print('entra al if ')
                cliente = Clientes.get_id_cliente(mysql, numero_matricula)
                id_cliente = cliente['id_cliente']
                id_matricula_cliente = cliente['id_matricula_cliente']
                print('cliente', id_matricula_cliente)
                valores_medidor = Valores_medidor.obtener_datos(mysql)
                id_valores_medidor = valores_medidor['id_valores_medidor']
                valor_metro3 = int(valores_medidor['valor_metro3'])
                
                valor_total_lectura = (lectura_actual - lectura_anterior)*valor_metro3
                
                Tarifa_medidores.crear_tarifa(mysql, custom_id_tarifa, lectura_actual, id_valores_medidor, valor_total_lectura, id_matricula_cliente)
                print('pasa aqui')
                Facturas.crear_factura(mysql, custom_id_factura, fecha_factura, fecha_vencimiento, id_cliente, 'ESF0001', valor_total_lectura, id_matricula_cliente, custom_id_tarifa)
                print('pasa factur')
                Auditoria.log_audit(mysql, custom_id_audi_factura, 'facturas', custom_id_factura, 'INSERT', 'ADM0001' f'Se crea una factura para la matricula {id_matricula_cliente}')
                print('pasa datos',custom_id_factura, valor_total_lectura)
                factura_nueva = {
                "numeroFactura": custom_id_factura,
                "precioUnitario": valor_total_lectura,
                "saldoPendiente": valor_total_lectura
                }
                print(factura_nueva)
                factura_generada.append(factura_nueva)
                print('factura gnera',factura_generada)
                return jsonify({"message": "Factura creada exitosamente", "factura": factura_generada}), 200
            else:
                return jsonify({'error': 'El tipo de matricula no permite crear una factura'}), 409
        except Exception as e:
            mysql.connection.rollback()
            return jsonify({"message": f"Error al obtener el id de la factura: {str(e)}"})
    
    @staticmethod
    def obtener_siguiente_numero():
        mysql = current_app.mysql
        try:
            custom_id_factura = Auditoria.generate_custom_id(mysql, 'FAC', 'id_factura', 'facturas')
            print(custom_id_factura)
            return jsonify({'siguiente_numero': custom_id_factura}), 200
        except Exception as e:
            return jsonify({"message": f"Error al obtener siguiente número de factura: {str(e)}"}), 500