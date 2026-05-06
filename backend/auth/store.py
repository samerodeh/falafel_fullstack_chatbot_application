"""
Auth-specific data store functions — backed by SQLite via auth.database.
"""
from typing import Optional, Dict, Any
from db.user_db import db_email_exists, db_get_auth_by_email, db_create_auth_record


def get_auth_by_email(email: str) -> Optional[Dict[str, Any]]:
    return db_get_auth_by_email(email)


def create_auth_record(user_id: str, name: str, email: str, hashed_password: str) -> Dict[str, Any]:
    return db_create_auth_record(user_id, name, email, hashed_password)


def email_exists(email: str) -> bool:
    return db_email_exists(email)
