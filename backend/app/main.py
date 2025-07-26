"""
FastAPI application for the friendly betting app.

This module defines the HTTP API for user registration and
authentication, bet creation and retrieval, and bet resolution.  The
endpoints leverage dependency injection to provide database sessions
and authenticated users.

To run the app locally:

```
uvicorn app.main:app --reload
```

The API will be available at http://127.0.0.1:8000.
"""

from typing import List

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models, schemas, crud, auth
from .database import Base, engine, get_db


# Create the database tables on startup.  In production you may wish to
# manage migrations separately using a tool such as Alembic.
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Friendly Betting API",
    description="API for a social betting app using virtual currency."
)

# Configure CORS so the mobile client can call the API.  Adjust
# `origins` to restrict which domains are permitted in production.
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/users/me", response_model=schemas.UserOut)
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    """Return information about the currently authenticated user."""
    return current_user


# Bet endpoints
@app.get("/bets", response_model=List[schemas.BetOut])
def list_bets(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """Return a paginated list of bets involving the current user."""
    bets = crud.get_bets_for_user(db, current_user.id, skip=skip, limit=limit)
    return bets


@app.post("/bets", response_model=schemas.BetOut, status_code=status.HTTP_201_CREATED)
def create_new_bet(
    bet_in: schemas.BetCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new bet and ensure both participants are recorded locally."""
    # Ensure opponent exists locally; create placeholder user record if necessary
    opponent = db.query(models.User).filter(models.User.id == bet_in.opponent_id).first()
    if opponent is None:
        opponent = models.User(id=bet_in.opponent_id, email=None, username=None)
        db.add(opponent)
        db.commit()
    bet = crud.create_bet(db, creator=current_user, bet_in=bet_in)
    return bet


@app.put("/bets/{bet_id}/resolve", response_model=schemas.BetOut)
def resolve_bet(
    bet_id: int,
    winner_id: str,
    result: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a bet as resolved by specifying the winner and result."""
    bet = crud.get_bet(db, bet_id)
    if not bet:
        raise HTTPException(status_code=404, detail="Bet not found")
    # Only allow participants to resolve
    if current_user.id not in (bet.creator_id, bet.opponent_id):
        raise HTTPException(status_code=403, detail="Not authorized to resolve this bet")
    # Validate winner
    if winner_id not in (bet.creator_id, bet.opponent_id):
        raise HTTPException(status_code=400, detail="Winner must be one of the participants")
    bet = crud.update_bet_result(db, bet, winner_id=winner_id, result=result)
    return bet


# User profile and friendship endpoints

@app.put("/users/me", response_model=schemas.UserOut)
def update_profile(
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """Update the current user's profile (username and/or email)."""
    user = crud.update_user(db, current_user, user_update)
    return user


@app.get("/users/search", response_model=List[schemas.UserOut])
def search_users(
    query: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """Search for users by username or email.

    The current user is excluded from the results.  At most 20 users are returned.
    """
    return crud.search_users(db, query, current_user.id)


@app.post("/friends/{friend_id}", status_code=status.HTTP_201_CREATED)
def add_friend(
    friend_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """Create a friendship with another user.

    If the friendship already exists, the request is ignored.  Users cannot add themselves.
    """
    if friend_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot add yourself as a friend")
    # Ensure the friend exists locally; create placeholder if necessary
    friend = db.query(models.User).filter(models.User.id == friend_id).first()
    if friend is None:
        friend = models.User(id=friend_id, email=None, username=None)
        db.add(friend)
        db.commit()
    crud.add_friend(db, current_user.id, friend_id)
    return {"detail": "Friend added"}


@app.get("/friends", response_model=List[schemas.UserOut])
def list_friends(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """Return the current user's friends."""
    return crud.get_friends(db, current_user.id)
