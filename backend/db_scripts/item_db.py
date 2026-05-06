import sqlite3
import os

db_file = os.path.join(os.path.dirname(__file__), "db", "items.db")

conn = sqlite3.connect(db_file)
cursor = conn.cursor()

cursor.execute("""
    CREATE TABLE IF NOT EXISTS item_stats (
        item_id          TEXT PRIMARY KEY,
        category         TEXT NOT NULL DEFAULT '',
        order_count      INTEGER NOT NULL DEFAULT 0,
        total_quantity   INTEGER NOT NULL DEFAULT 0,
        unique_buyers    TEXT NOT NULL DEFAULT '[]',
        last_ordered_at  TEXT
    )
""")

conn.commit()
conn.close()

print("items.db initialized successfully.")
