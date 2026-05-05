# --------------- imports ------------------
from .agent_utilities import llm, detect_language
from rag import query_menu
import json
from data_store import get_user_profile


# --------------- order agent logic ------------------

def order_agent(message: str, history: list = [], user_id: str = "guest") -> str:
    menu_results = query_menu(message)
    profile = get_user_profile(user_id)
    lang = profile.get("languagePreference", "auto")
    if lang == "auto":
        lang = detect_language(message)
    dietary = profile.get("dietaryProfile", {})
    context = "\n".join(menu_results)
    return llm(
        system=f"""You are Sufra's order assistant. Help the customer place their order.
Language: {lang}
Dietary profile: {json.dumps(dietary, ensure_ascii=False)}
Available items:
{context}
Confirm the item name, size/variant if applicable, and any modifications.
If the item doesn't exist on the menu or is sold out, politely say so and suggest alternatives.
When asked to confirm order status, provide received/preparing/ready wording.
Always respond in language: {lang}.""",
        user=message,
        history=history
    )
