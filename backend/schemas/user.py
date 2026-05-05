from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List


class ProfileUpdate(BaseModel):
    languagePreference: Optional[str] = None
    dietaryProfile: Optional[Dict[str, Any]] = None
    theme: Optional[str] = None
    voiceEnabled: Optional[bool] = None

class UsualOrderBody(BaseModel):
    userId: str = "guest"
    usualOrderPreset: List[Dict[str, Any]] = Field(default_factory=list)
