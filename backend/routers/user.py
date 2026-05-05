# files imports
from schemas.user import UsualOrderBody, ProfileUpdate
from data_store import set_usual_order, get_user_profile, update_user_profile
from fastapi import APIRouter

router = APIRouter(prefix="/user", tags=["user"])

@router.get("/profile")
def get_profile(user_id: str = "guest"):
    return get_user_profile(user_id)


@router.put("/profile")
def put_profile(user_id: str, body: ProfileUpdate):
    payload = body.model_dump(exclude_none=True)
    return update_user_profile(user_id, payload)

@router.post("/usual-order")
def post_usual_order(body: UsualOrderBody):
    profile = set_usual_order(body.userId, body.usualOrderPreset)
    return {"userId": body.userId, "usualOrderPreset": profile.get("usualOrderPreset", [])}
