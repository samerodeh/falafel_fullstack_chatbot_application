import sqlite3
import os

db_file = os.path.join(os.path.dirname(__file__), "db", "reservations.db")

conn = sqlite3.connect(db_file)
cursor = conn.cursor()

cursor.execute("""
    CREATE TABLE IF NOT EXISTS reservations (
        reservation_id   TEXT PRIMARY KEY,
        user_id          TEXT NOT NULL DEFAULT 'guest',
        date_time        TEXT NOT NULL,
        party_size       INTEGER NOT NULL DEFAULT 2,
        contact          TEXT NOT NULL DEFAULT '{}',
        preorder_items   TEXT NOT NULL DEFAULT '[]',
        status           TEXT NOT NULL DEFAULT 'confirmed',
        created_at       TEXT NOT NULL,
        updated_at       TEXT NOT NULL
    )
""")

conn.commit()
conn.close()

print("reservations.db initialized successfully.")
