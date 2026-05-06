import sqlite3
import os

db_file = os.path.join(os.path.dirname(__file__), "db", "promotions.db")

conn = sqlite3.connect(db_file)
cursor = conn.cursor()

cursor.execute("""
    CREATE TABLE IF NOT EXISTS promotions (
        promo_id                TEXT PRIMARY KEY,
        title                   TEXT NOT NULL,
        description             TEXT NOT NULL DEFAULT '',
        start_at                TEXT NOT NULL,
        end_at                  TEXT NOT NULL,
        applicable_categories   TEXT NOT NULL DEFAULT '[]',
        applicable_items        TEXT NOT NULL DEFAULT '[]',
        priority                INTEGER NOT NULL DEFAULT 100,
        is_active               INTEGER NOT NULL DEFAULT 1
    )
""")

conn.commit()
conn.close()

print("promotions.db initialized successfully.")
