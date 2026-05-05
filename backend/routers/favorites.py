# fastapi imports
from fastapi import FastAPI, APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
# other imports
from schemas.favorite import FavoriteBody
from data_store import get_user_profile, add_favorite, remove_favorite

router = APIRouter(prefix="/favorites", tags=["favorites"])

@router.get("/")
def get_favorites(user_id: str = "guest"):
    profile = get_user_profile(user_id)
    return {"userId": user_id, "favorites": profile.get("favorites", [])}


@router.post("/")
def post_favorite(body: FavoriteBody):
    favorites = add_favorite(body.userId, body.itemId)
    return {"userId": body.userId, "favorites": favorites}


@router.delete("/")
def delete_favorite(user_id: str, item_id: str):
    favorites = remove_favorite(user_id, item_id)
    return {"userId": user_id, "favorites": favorites}
