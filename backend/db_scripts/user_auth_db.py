import sqlite3
import os

db_file = os.path.join(os.path.dirname(__file__), "db", "user_auth.db")

conn = sqlite3.connect(db_file)
cursor = conn.cursor()

cursor.execute("""
    CREATE TABLE IF NOT EXISTS auth (
        user_id          TEXT PRIMARY KEY,
        name             TEXT NOT NULL,
        email            TEXT UNIQUE NOT NULL,
        hashed_password  TEXT NOT NULL,
        created_at       TEXT NOT NULL
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id              TEXT PRIMARY KEY,
        language_preference  TEXT NOT NULL DEFAULT 'auto',
        dietary_profile      TEXT NOT NULL DEFAULT '{"halal":false,"vegan":false,"allergies":[]}',
        theme                TEXT NOT NULL DEFAULT 'system',
        voice_enabled        INTEGER NOT NULL DEFAULT 0,
        favorites            TEXT NOT NULL DEFAULT '[]',
        usual_order_preset   TEXT NOT NULL DEFAULT '[]',
        order_history        TEXT NOT NULL DEFAULT '[]',
        updated_at           TEXT NOT NULL
    )
""")

conn.commit()
conn.close()

print("user_auth.db initialized successfully.")
