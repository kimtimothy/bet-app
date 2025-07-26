"""
Pydantic schemas for request and response models.

These classes define how data is validated when sent to or returned from
the API.  They are separate from the SQLAlchemy models to allow clean
validation and control over exposed fields.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, constr


# User schemas
#
# Authentication and registration are handled by Supabase; the API
# exposes only a read‑only representation of the user for the
# `/users/me` endpoint.  The `id` field corresponds to the Supabase
# user UUID and additional fields may be null.
class UserOut(BaseModel):
    id: str
    username: Optional[str] = None
    email: Optional[EmailStr] = None

    class Config:
        orm_mode = True


class UserUpdate(BaseModel):
    """Schema for updating the current user's profile.

    All fields are optional; only provided values will be updated.  The
    username must be between 3 and 50 characters if supplied.
    """

    username: Optional[constr(min_length=3, max_length=50)] = None
    email: Optional[EmailStr] = None


# Bet schemas
class BetBase(BaseModel):
    description: str
    wager: int
    opponent_id: str


class BetCreate(BetBase):
    pass


class BetOut(BaseModel):
    id: int
    description: str
    wager: int
    status: str
    creator_id: str
    opponent_id: str
    winner_id: Optional[str]
    created_at: datetime
    resolved_at: Optional[datetime]
    result: Optional[str]

    class Config:
        orm_mode = True
