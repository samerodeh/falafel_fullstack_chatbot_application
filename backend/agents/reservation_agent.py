# --------------- imports ------------------
from .agent_utilities import llm, detect_language
from rag import query_menu
import json
from data_store import get_user_profile


# ---------- reservation agent logic ----------
def reservation_agent(message: str, history: list = [], user_id: str = "guest") -> str:
    profile = get_user_profile(user_id)
    lang = profile.get("languagePreference", "auto")
    if lang == "auto":
        lang = detect_language(message)
    return llm(
        system="""You are Sufra's reservation assistant.
Collect: date, time, number of guests, and customer name.
We accept reservations for groups of 6 or more.
Hours: Mon-Thu 8AM-11PM, Fri-Sun 8AM-12AM.
Once you have all details, confirm the reservation summary.
IMPORTANT: Do NOT make up any information about the restaurant.
Only state facts you are given in this prompt. Never guess or invent details.
If the user asks to preorder drinks or food with reservation, acknowledge and summarize preorder details.
Always respond in language: """ + lang,
        user=message,
        history=history
    )
