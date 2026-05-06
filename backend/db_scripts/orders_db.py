import sqlite3
import os

db_file = os.path.join(os.path.dirname(__file__), "db", "orders.db")

conn = sqlite3.connect(db_file)
cursor = conn.cursor()

cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        order_id        TEXT PRIMARY KEY,
        user_id         TEXT NOT NULL DEFAULT 'guest',
        items           TEXT NOT NULL DEFAULT '[]',
        status          TEXT NOT NULL DEFAULT 'received',
        source          TEXT NOT NULL DEFAULT 'cart',
        reservation_id  TEXT,
        created_at      TEXT NOT NULL,
        updated_at      TEXT NOT NULL
    )
""")

conn.commit()
conn.close()

print("orders.db initialized successfully.")
