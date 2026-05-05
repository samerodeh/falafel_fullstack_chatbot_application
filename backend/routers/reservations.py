# fastapi imports
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
# other imports
from schemas.reservation import ReservationBody
from data_store import create_reservation, create_order

router = APIRouter(prefix="/reservations", tags=["reservations"])

@router.post("/")
def post_reservation(body: ReservationBody):
    reservation = create_reservation(body.model_dump())
    if reservation.get("preorderItems"):
        preorder_order = create_order(
            {
                "userId": reservation["userId"],
                "items": reservation["preorderItems"],
                "source": "reservation_preorder",
                "reservationId": reservation["reservationId"],
            }
        )
        return {"reservation": reservation, "preorderOrder": preorder_order}
    return {"reservation": reservation}
