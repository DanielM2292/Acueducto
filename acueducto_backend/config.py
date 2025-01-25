class Config:
    MYSQL_HOST = '127.0.0.1'
    MYSQL_USER = 'root'
    MYSQL_PASSWORD = '1004624494'
    MYSQL_DB = 'acueducto_santander'

class DevelopmentConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig
} 