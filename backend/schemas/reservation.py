from pydantic import BaseModel, Field
from typing import Dict, Any, List


class ReservationBody(BaseModel):
    userId: str = "guest"
    dateTime: str
    partySize: int = 2
    contact: Dict[str, Any] = Field(default_factory=dict)
    preorderItems: List[Dict[str, Any]] = Field(default_factory=list)
