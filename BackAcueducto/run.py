from app import create_app
import os

app = create_app()
    
if __name__ == '__main__':
    if not os.path.exists('data'):
        os.makedirs('data')
    app.run(port=9090, debug=True)
    
    
