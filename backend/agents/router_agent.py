# ---------- imports ----------
from .agent_utilities import llm, localize, detect_language
import json
from data_store import get_user_profile

# ------- import agents ------------
from .dietary_agent import dietary_agent
from .guard_agent import guard_agent
from .order_agent import order_agent
from .order_history_agent import order_history_agent
from .reservation_agent import reservation_agent
from .menu_agent import menu_agent
from .recommendation_agent import recommendation_agent



# ---------- Router ----------
def router(message: str, history: list = [], user_id: str = "guest") -> str:
    # Step 1 — guard check
    guard = guard_agent(message)
    profile = get_user_profile(user_id)
    preferred_lang = profile.get("languagePreference", "auto")
    lang = detect_language(message) if preferred_lang == "auto" else preferred_lang

    if guard.get("classification") == "rude":
        return localize(
            "I'm sorry, I can't help with that. Please keep the conversation respectful.",
            "عذراً، لا يمكنني المساعدة بهذا الطلب. يرجى الحفاظ على أسلوب محترم.",
            lang,
        )
    if guard.get("classification") == "off_topic":
        return localize(
            "I can only help with questions about Sufra's menu, orders, reservations, and restaurant info. What can I help you with?",
            "يمكنني المساعدة فقط في أسئلة قائمة سفرة والطلبات والحجوزات ومعلومات المطعم. كيف أساعدك؟",
            lang,
        )

    # Step 2 — route to correct agent
    route = llm(
        system="""You are a router for a restaurant chatbot.
Classify the message into one of: menu, order, reservation, dietary, order_status, reorder, favorites, usual, recommendation
- menu: questions about dishes, prices, ingredients, hours, location, FAQs
- order: customer wants to place or modify an order
- reservation: customer wants to book a table
- dietary: questions about allergens, vegan, halal, gluten-free
- order_status: user asks about order progress/status
- reorder: user asks for previous order or reorder
- favorites: user asks for favorites or saved items
- usual: user asks for usual order
- recommendation: customer asks for recommendations, what goes well with something, what's popular, suggest something, what should I order
- continuation: short replies like yes, no, thanks, correct, sure, please
For continuation messages, look at the conversation history to decide which agent to route to.
Respond with JSON only: {"agent": "menu"}""",
        user=message,
        history=history
    )

    try:
        agent = json.loads(route).get("agent", "menu")
    except:
        agent = "menu"

    if agent == "order" or (agent == "continuation" and any(m["content"] for m in history if "order" in m.get("content", "").lower())):
        return order_agent(message, history, user_id)
    elif agent == "order_status":
        return localize("Your order is currently in: preparing.", "طلبك حالياً في مرحلة: التحضير.", lang)
    elif agent == "reorder":
        return order_history_agent(message, user_id)
    elif agent == "favorites":
        favs = profile.get("favorites", [])
        if not favs:
            return localize("You don't have favorites yet.", "لا توجد عناصر مفضلة لديك بعد.", lang)
        return localize(
            f"Your favorites are: {', '.join(favs)}.",
            f"مفضلاتك هي: {', '.join(favs)}.",
            lang,
        )
    elif agent == "usual":
        usual = profile.get("usualOrderPreset", [])
        if not usual:
            return localize("You have no usual order set yet.", "لا يوجد لديك طلب معتاد محفوظ بعد.", lang)
        labels = [f"{x.get('itemId','item')} x{x.get('quantity',1)}" for x in usual]
        return localize(
            f"Your usual order is: {', '.join(labels)}.",
            f"طلبك المعتاد هو: {', '.join(labels)}.",
            lang,
        )
    elif agent == "recommendation":
        return recommendation_agent(message, history, user_id)
    elif agent == "reservation":
        return reservation_agent(message, history, user_id)
    elif agent == "dietary":
        return dietary_agent(message, history, user_id)
    else:
        return menu_agent(message, history, user_id)