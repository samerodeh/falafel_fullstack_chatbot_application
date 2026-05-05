from pydantic import BaseModel, Field


class llm_response(BaseModel):
    message: str
    history: list = []
    user_id: str = "guest"
