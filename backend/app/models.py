"""
SQLAlchemy models for the friendly betting app.

These classes define the database schema for users and bets.  The
relationships allow us to link bets back to their participants.
"""

import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Enum,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy import UniqueConstraint

from .database import Base


class User(Base):
    """Represents a user linked to a Supabase account.

    The `id` field stores the Supabase user UUID.  Additional fields like
    username or email can be stored for convenience, but authentication
    is handled by Supabase, not this service.  The local user table is
    optional; if you prefer to keep your user data solely in Supabase,
    you can remove this model and adjust the bet relationships to use
    string IDs.
    """

    __tablename__ = "users"

    # Use the Supabase UUID as the primary key
    id: str = Column(String(36), primary_key=True, index=True)
    username: str = Column(String(50), unique=True, index=True, nullable=True)
    email: str = Column(String(100), unique=True, index=True, nullable=True)

    created_bets = relationship(
        "Bet",
        back_populates="creator",
        foreign_keys="Bet.creator_id",
        cascade="all, delete-orphan",
    )
    opponent_bets = relationship(
        "Bet",
        back_populates="opponent",
        foreign_keys="Bet.opponent_id",
        cascade="all, delete-orphan",
    )

    # Relationships for friendships (users this user has added)
    friends = relationship(
        "Friendship", back_populates="user", foreign_keys="Friendship.user_id", cascade="all, delete-orphan"
    )
    # Relationships for friendships (users who have added this user)
    friend_of = relationship(
        "Friendship", back_populates="friend", foreign_keys="Friendship.friend_id", cascade="all, delete-orphan"
    )


class BetStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    RESOLVED = "resolved"



class Bet(Base):
    """Represents a wager between two users."""

    __tablename__ = "bets"

    id: int = Column(Integer, primary_key=True, index=True)
    description: str = Column(Text, nullable=False)
    wager: int = Column(Integer, nullable=False)
    status: str = Column(Enum(BetStatus), default=BetStatus.PENDING)

    # Use string IDs to align with Supabase UUIDs
    creator_id: str = Column(String(36), ForeignKey("users.id"), nullable=False)
    opponent_id: str = Column(String(36), ForeignKey("users.id"), nullable=False)
    winner_id: Optional[str] = Column(String(36), ForeignKey("users.id"), nullable=True)

    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    resolved_at: Optional[datetime] = Column(DateTime, nullable=True)
    result: Optional[str] = Column(String(50), nullable=True)

    # relationships
    creator = relationship(
        "User", back_populates="created_bets", foreign_keys=[creator_id]
    )
    opponent = relationship(
        "User", back_populates="opponent_bets", foreign_keys=[opponent_id]
    )
    winner = relationship("User", foreign_keys=[winner_id])


class Friendship(Base):
    """Represents a mutual friendship between two users.

    Each friendship is stored as a pair of rows to simplify lookups (user_id -> friend_id and friend_id -> user_id).
    The unique constraint prevents duplicate entries.
    """

    __tablename__ = "friendships"

    id: int = Column(Integer, primary_key=True, index=True)
    user_id: str = Column(String(36), ForeignKey("users.id"), nullable=False)
    friend_id: str = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="friends", foreign_keys=[user_id])
    friend = relationship("User", back_populates="friend_of", foreign_keys=[friend_id])

    __table_args__ = (UniqueConstraint("user_id", "friend_id", name="uq_friendship_pair"),)
