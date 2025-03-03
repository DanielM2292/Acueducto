from flask import jsonify, current_app, request
import MySQLdb
from app.models import Ingresos, Multas, Auditoria, Multa_clientes, Matriculas, Facturas, Tarifa_medidores, Tarifas_estandar, Estandar_factura

class PagosServices:
    @staticmethod
    def listar_historial():
        mysql = current_app.mysql
        try:
            ingresos = Ingresos.listar_ingresos(mysql)
            return jsonify(ingresos), 200
        except Exception as e:
            mysql.connection.rollback()
            return jsonify({"message": f"Error al crear y asociar multa: {str(e)}"}), 500
    
    @staticmethod
    def registrar_pago_multa(data):
        mysql = current_app.mysql
        custom_id = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        custom_id_ingreso = Auditoria.generate_custom_id(mysql, 'ING', 'id_ingreso', 'ingresos')
        try:
            custom_id_ingreso_audi = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')

            id_multa = data.get("id")
            valor_pagar = data.get("valor")
            valor_pagar = int(valor_pagar)
            
            multa = Multas.buscar_multa(mysql, id_multa)
            valor_multa = int(multa['valor_multa'])
            valor_pendiente = int(multa['valor_pendiente'])
                        
            if valor_pagar > valor_multa or valor_pagar > valor_pendiente:
                return jsonify({'error': 'El valor no es correcto'}), 400
            
            if valor_pagar == valor_pendiente:
                Multa_clientes.actualizar_multa_cliente(mysql, 'ESM0002', id_multa)
                Multas.update_multa_pago(mysql, valor_multa, 0, id_multa)
                Ingresos.crear_ingreso_multa(mysql, custom_id_ingreso, f'Se ingresa pago de multa {id_multa}', valor_pagar, id_multa)
                return jsonify({'message': 'Pago completado, saldo pendiente en 0'}), 200
            
            nuevo_valor = valor_pendiente - valor_pagar
            
            Multas.update_multa_pago(mysql, valor_multa, nuevo_valor, id_multa)
            Auditoria.log_audit(mysql, custom_id, 'multas', id_multa, 'UPDATE', 'ADM0001', 'Se actualiza valor de multa desde el pago realizado')

            Ingresos.crear_ingreso_multa(mysql, custom_id_ingreso, f'Se ingresa pago de multa {id_multa}', valor_pagar, id_multa)
            Auditoria.log_audit(mysql, custom_id_ingreso_audi, 'ingresos', custom_id_ingreso, 'INSERT', 'ADM0001', f'Se realiza pago de multa {id_multa}')
            
            return jsonify({"message": "Pago realizado correctamente"}), 200
        except Exception as e:
            mysql.connection.rollback()
            return jsonify({"message": f"Error al procesar el pago de la multa: {str(e)}"}), 500
    
    @staticmethod
    def registrar_pago_matricula(data):
        mysql = current_app.mysql
        custom_id = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        custom_id_ingreso = Auditoria.generate_custom_id(mysql, 'ING', 'id_ingreso', 'ingresos')
        try:
            id_matricula = data.get("id")
            valor_pagar = data.get("valor")
            valor_pagar = int(valor_pagar)
            
            ingreso_matricula = Ingresos.buscar_ingreso_matricula(mysql, id_matricula)
            
            if not ingreso_matricula:
                matricula = Matriculas.buscar_matricula(mysql, id_matricula)
                valor_matricula = int(matricula['valor_matricula'])
                            
                if valor_pagar != valor_matricula:
                    return jsonify({'error': 'El valor no es correcto'}), 400
                Ingresos.crear_ingreso_matricula(mysql, custom_id_ingreso, f'Se ingresa pago de matricula {id_matricula}', valor_pagar, id_matricula)
                Auditoria.log_audit(mysql, custom_id, 'ingresos', custom_id_ingreso, 'INSERT', 'ADM0001', f'Se realiza pago de matricula {id_matricula}')

                return jsonify({"message": "Pago realizado correctamente"}), 200
            else:
                return jsonify({'error': 'Ya se registro un pago para esta matricula'}), 400
        except Exception as e:
            mysql.connection.rollback()
            return jsonify({"message": f"Error al procesar el pago de la matricula: {str(e)}"}), 500

    @staticmethod    
    def registrar_pago_factura(data):
        mysql = current_app.mysql
        custom_id = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
        custom_id_ingreso = Auditoria.generate_custom_id(mysql, 'ING', 'id_ingreso', 'ingresos')
        try:
            custom_id_ingreso_audi = Auditoria.generate_custom_id(mysql, 'AUD', 'id_auditoria', 'auditoria')
            id_factura = data.get("id")
            valor_pagar = data.get("valor")
            tipo_pago = data.get("tipoPago")
            print(id_factura, valor_pagar, tipo_pago)
            valor_pagar = int(valor_pagar)
            
            valor_pendiente = Facturas.obtener_pendiente(mysql, id_factura)
            valor_pendiente = int(valor_pendiente['valor_pendiente'])
            print('pasa y saca el valor pendiente', valor_pendiente)
            total_estandar = Tarifas_estandar.obtener_tarifa(mysql, id_factura)
            total_medidor = Tarifa_medidores.obtener_tarifa(mysql, id_factura)
            print(total_estandar, total_medidor)
            
            if total_estandar is None:
                print('entra a pagar medidor')
                total_medidor = int(total_medidor['total_factura'])
                if valor_pagar > total_medidor or valor_pagar > valor_pendiente:
                    return jsonify({'error': 'El valor no es correcto'}), 400
                
                if valor_pagar == valor_pendiente:
                    Facturas.pagar_factura_medidor(mysql, 'ESF0002', 0, id_factura)
                    Ingresos.crear_ingreso_factura(mysql, custom_id_ingreso, f'Se ingresa pago total de factura {id_factura}', valor_pagar, id_factura)
                    return jsonify({'message': 'Pago completado, saldo pendiente en 0'}), 200
                
                nuevo_valor = valor_pendiente - valor_pagar
                
                Facturas.update_pago_factura(mysql, nuevo_valor, id_factura)
                Auditoria.log_audit(mysql, custom_id, 'facturas', id_factura, 'UPDATE', 'ADM0001', 'Se actualiza valor de factura desde el pago realizado')

                Ingresos.crear_ingreso_factura(mysql, custom_id_ingreso, f'Se ingresa pago de factura {id_factura}', valor_pagar, id_factura)
                Auditoria.log_audit(mysql, custom_id_ingreso_audi, 'ingresos', custom_id_ingreso, 'INSERT', 'ADM0001', f'Se realiza pago de factura {id_factura}')
                
                return jsonify({"message": "Pago realizado correctamente"}), 200
            else:
                total_estandar = int(total_estandar['total_factura'])
                if tipo_pago == 'Mensual':
                    if valor_pagar != total_estandar:
                        return jsonify({'error': 'El valor no es correcto'}), 400
                    Facturas.pagar_factura_estandar_mes(mysql, 'ESF0002', 0, id_factura)
                    id_estandar_factura = Facturas.obtener_id_estandar(mysql, id_factura)
                    id_estandar_factura = id_estandar_factura['id_estandar_factura']
                    Estandar_factura.actualizar_cantidad_mes(mysql, 0, id_estandar_factura)
                    Ingresos.crear_ingreso_factura(mysql, custom_id_ingreso, f'Se ingresa pago total de factura {id_factura}', valor_pagar, id_factura)
                    return jsonify({"message": "Pago realizado correctamente"}), 200
                elif tipo_pago == 'Semestral':
                    total_semestre = total_estandar * 6
                    if valor_pagar != total_semestre:
                        return jsonify({'error': 'El valor no es correcto'}), 400
                    Facturas.pagar_factura_estandar_mes(mysql, 'ESF0002', valor_pagar, id_factura)
                    id_estandar_factura = Facturas.obtener_id_estandar(mysql, id_factura)
                    id_estandar_factura = id_estandar_factura['id_estandar_factura']
                    Estandar_factura.actualizar_cantidad_mes(mysql, 6, id_estandar_factura)
                    Ingresos.crear_ingreso_factura(mysql, custom_id_ingreso, f'Se ingresa pago semestral de la factura {id_factura}', total_semestre, id_factura)
                    return jsonify({"message": "Pago realizado correctamente"}), 200
                elif tipo_pago == 'Anual':
                    total_semestre = total_estandar * 12
                    if valor_pagar != total_semestre:
                        return jsonify({'error': 'El valor no es correcto'}), 400
                    Facturas.pagar_factura_estandar_mes(mysql, 'ESF0002', valor_pagar, id_factura)
                    id_estandar_factura = Facturas.obtener_id_estandar(mysql, id_factura)
                    id_estandar_factura = id_estandar_factura['id_estandar_factura']
                    Estandar_factura.actualizar_cantidad_mes(mysql, 12, id_estandar_factura)
                    Ingresos.crear_ingreso_factura(mysql, custom_id_ingreso, f'Se ingresa pago semestral de la factura {id_factura}', total_semestre, id_factura)
                    return jsonify({"message": "Pago realizado correctamente"}), 200
                    
        except Exception as e:
            # Deshacer cualquier cambio realizado en la base de datos cuando ocurre un error, en el instante que se falla
            # si hubo cambios previos los deshace para mantener la integridad de los datos 
            mysql.connection.rollback()
            return jsonify({"message": f"Error al procesar el pago de la factura: {str(e)}"}), 500
