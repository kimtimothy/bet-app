"""
CRUD operations for the betting app.

These helper functions interact with the SQLAlchemy session to create
and retrieve users and bets.  By centralizing database logic here, we
keep the endpoint code in `main.py` clean and easy to maintain.
"""

from typing import List, Optional

from sqlalchemy.orm import Session
from . import models, schemas
from sqlalchemy import func



# Note: User creation and password hashing are handled by Supabase.  The
# local database stores only minimal user metadata (id, username, email)
# which is inserted on demand when a token is decoded.  Therefore, we
# do not provide a separate create_user function here.


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    return db.query(models.User).offset(skip).limit(limit).all()


def create_bet(
    db: Session, creator: models.User, bet_in: schemas.BetCreate
) -> models.Bet:
    """Create a new bet between the creator and an opponent."""
    bet = models.Bet(
        description=bet_in.description,
        wager=bet_in.wager,
        status=models.BetStatus.PENDING,
        creator_id=creator.id,
        opponent_id=bet_in.opponent_id,
    )
    db.add(bet)
    db.commit()
    db.refresh(bet)
    return bet


def get_bets_for_user(
    db: Session, user_id: str, skip: int = 0, limit: int = 100
) -> List[models.Bet]:
    """Return all bets where the user is either the creator or the opponent."""
    return (
        db.query(models.Bet)
        .filter((models.Bet.creator_id == user_id) | (models.Bet.opponent_id == user_id))
        .order_by(models.Bet.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_bet(db: Session, bet_id: int) -> Optional[models.Bet]:
    return db.query(models.Bet).filter(models.Bet.id == bet_id).first()


def update_bet_result(
    db: Session,
    bet: models.Bet,
    winner_id: str,
    result: str,
) -> models.Bet:
    """Resolve a bet by setting the winner and result."""
    bet.status = models.BetStatus.RESOLVED
    bet.winner_id = winner_id
    bet.result = result
    from datetime import datetime

    bet.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(bet)
    return bet


def update_user(db: Session, user: models.User, update_in: schemas.UserUpdate) -> models.User:
    """Update the current user's profile with supplied fields."""
    if update_in.username is not None:
        user.username = update_in.username
    if update_in.email is not None:
        user.email = update_in.email
    db.commit()
    db.refresh(user)
    return user


def search_users(db: Session, query: str, current_user_id: str, limit: int = 20):
    """Search for users by username or email, excluding the current user."""
    if not query:
        return []
    q = f"%{query.lower()}%"
    return (
        db.query(models.User)
        .filter(
            models.User.id != current_user_id,
            (func.lower(models.User.username).like(q)) | (func.lower(models.User.email).like(q)),
        )
        .limit(limit)
        .all()
    )


def add_friend(db: Session, user_id: str, friend_id: str):
    """Create a mutual friendship between two users if it does not already exist."""
    # Check if friendship already exists
    exists = (
        db.query(models.Friendship)
        .filter(models.Friendship.user_id == user_id, models.Friendship.friend_id == friend_id)
        .first()
    )
    if exists:
        return
    friendship = models.Friendship(user_id=user_id, friend_id=friend_id)
    inverse = models.Friendship(user_id=friend_id, friend_id=user_id)
    db.add_all([friendship, inverse])
    db.commit()


def get_friends(db: Session, user_id: str):
    """Return a list of users who are friends with the given user."""
    friend_ids = [f.friend_id for f in db.query(models.Friendship).filter_by(user_id=user_id).all()]
    if not friend_ids:
        return []
    return db.query(models.User).filter(models.User.id.in_(friend_ids)).all()
