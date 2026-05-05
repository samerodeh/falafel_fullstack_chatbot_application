from .agent_utilities import llm
import json


def guard_agent(message: str) -> dict:
    result = llm(
        system="""You are a content filter for a restaurant chatbot.
Classify the message as one of: allowed, off_topic, rude.
- allowed: ANYTHING that could be part of an ongoing restaurant conversation including:
  food names, ingredients, dates, times, numbers, sizes, yes/no/ok/sure/please,
  menu items, orders, reservations, hours, location, dietary info, short one-word replies
- off_topic: ONLY classify as off_topic if clearly unrelated (politics, coding, sports, etc.)
- rude: offensive or inappropriate messages
When in doubt, classify as allowed.
Respond with JSON only: {"classification": "allowed"}""",
        user=message
    )
    try:
        return json.loads(result)
    except:
        return {"classification": "allowed"}