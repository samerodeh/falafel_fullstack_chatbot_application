from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List


class ReorderBody(BaseModel):
    userId: str = "guest"
    orderId: str

class UpdateOrderStatusBody(BaseModel):
    status: str

class CreateOrderBody(BaseModel):
    userId: str = "guest"
    items: List[Dict[str, Any]] = Field(default_factory=list)
    source: str = "cart"
    reservationId: Optional[str] = None
