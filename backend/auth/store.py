"""
Auth-specific data store functions.
Handles user registration and lookup by email.
Stores auth records separately from user profiles under store["auth"].
"""

from data_store import _load_store, _save_store, _with_lock
from typing import Optional, Dict, Any


@_with_lock
def get_auth_by_email(email: str) -> Optional[Dict[str, Any]]:
    store = _load_store()
    auth = store.get("auth", {})
    return auth.get(email.lower())


@_with_lock
def create_auth_record(user_id: str, name: str, email: str, hashed_password: str) -> Dict[str, Any]:
    store = _load_store()
    if "auth" not in store:
        store["auth"] = {}

    record = {
        "userId": user_id,
        "name": name,
        "email": email.lower(),
        "hashedPassword": hashed_password,
    }
    store["auth"][email.lower()] = record
    _save_store(store)
    return record


@_with_lock
def email_exists(email: str) -> bool:
    store = _load_store()
    return email.lower() in store.get("auth", {})
