import mysql.connector
from mysql.connector import pooling

dbconfig = {
    "user": "usrXdbsEncrypt",
    "password": "Xts@Encypt&#%$2025",
    "host": "172.16.80.21",
    "database": "XDBS_ENCRYPTED",
}
connection_pool = pooling.MySQLConnectionPool(pool_name="mypool",
                                              pool_size=5,
                                              **dbconfig)

def get_conn():
    return connection_pool.get_connection()

print("db.py loaded ✅")