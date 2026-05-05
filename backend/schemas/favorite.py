from pydantic import BaseModel


class FavoriteBody(BaseModel):
    userId: str = "guest"
    itemId: str
