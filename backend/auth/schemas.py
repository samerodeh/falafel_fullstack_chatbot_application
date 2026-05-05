from pydantic import BaseModel, EmailStr


class SignupBody(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    userId: str
    name: str
    email: str
    message: str
