from fastapi import APIRouter, HTTPException, status
from data_store import get_user_profile
from auth.schemas import SignupBody, LoginBody, AuthResponse
from auth.store import get_auth_by_email, create_auth_record, email_exists
from auth.utils import hash_password, verify_password, generate_user_id

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(body: SignupBody):
    if email_exists(body.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists."
        )

    user_id = generate_user_id()
    hashed = hash_password(body.password)
    create_auth_record(user_id, body.name, body.email, hashed)

    # create the user profile in data_store
    get_user_profile(user_id)

    return AuthResponse(
        userId=user_id,
        name=body.name,
        email=body.email,
        message="Account created successfully."
    )


@router.post("/login", response_model=AuthResponse)
def login(body: LoginBody):
    record = get_auth_by_email(body.email)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not verify_password(body.password, record["hashedPassword"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    return AuthResponse(
        userId=record["userId"],
        name=record["name"],
        email=record["email"],
        message="Login successful."
    )
