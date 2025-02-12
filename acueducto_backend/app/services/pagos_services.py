from flask import jsonify, current_app, request
import MySQLdb
from app.models import Ingresos, Multas, Auditoria, Multa_clientes, Matriculas

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

            matricula = Matriculas.buscar_matricula(mysql, id_matricula)
            valor_matricula = int(matricula['valor_matricula'])
                        
            if valor_pagar != valor_matricula:
                return jsonify({'error': 'El valor no es correcto'}), 400
            Ingresos.crear_ingreso_matricula(mysql, custom_id_ingreso, f'Se ingresa pago de matricula {id_matricula}', valor_pagar, id_matricula)
            Auditoria.log_audit(mysql, custom_id, 'ingresos', custom_id_ingreso, 'INSERT', 'ADM0001', f'Se realiza pago de matricula {id_matricula}')

            return jsonify({"message": "Pago realizado correctamente"}), 200
        except Exception as e:
            mysql.connection.rollback()
            return jsonify({"message": f"Error al procesar el pago de la matricula: {str(e)}"}), 500
        
