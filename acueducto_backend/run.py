from app import create_app
import os

# Crear la aplicación Flask
app = create_app()

# Solo ejecutar si este archivo es el principal
if __name__ == '__main__':
    # Verifica si el directorio 'data' existe, y si no, lo crea
    if not os.path.exists('data'):
        os.makedirs('data')

    # Iniciar la aplicación en el puerto 9090 y con depuración activada
    app.run(host='0.0.0.0', port=9090, debug=True)  # Asegúrate de que el host sea 0.0.0.0