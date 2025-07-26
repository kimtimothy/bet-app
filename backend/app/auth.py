"""
Authentication and authorization utilities for the friendly betting app.

This module contains helpers to decode and validate JSON Web Tokens
issued by Supabase Auth.  Instead of implementing a custom token
generation scheme, we rely on Supabase for user registration and
authentication.  Tokens are validated against the project's JSON Web
Key Set (JWKS) to ensure integrity and authenticity.

Configuration
-------------
The following environment variables control the authentication
behaviour.  See `.env.example` for examples.

```
SUPABASE_JWT_JWKS_URL   URL pointing to the Supabase project's JWKS endpoint.
SUPABASE_JWT_AUDIENCE    (optional) Expected audience value for tokens.
SUPABASE_JWT_ISSUER      (optional) Expected issuer value for tokens.
```

If `SUPABASE_JWT_JWKS_URL` is not provided, tokens will be decoded
without signature verification.  This should only be used in local
development.
"""

from functools import lru_cache
from typing import Optional
import os

import requests
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from . import models
from .database import get_db


# Fetch configuration from environment variables.  These variables can
# be defined in a `.env` file or exported in the environment.
JWKS_URL: Optional[str] = os.getenv("SUPABASE_JWT_JWKS_URL")
JWT_AUDIENCE: Optional[str] = os.getenv("SUPABASE_JWT_AUDIENCE")
JWT_ISSUER: Optional[str] = os.getenv("SUPABASE_JWT_ISSUER")

# Configure the OAuth2 scheme to extract bearer tokens from incoming
# requests.  Since we do not provide our own token endpoint, the
# `tokenUrl` parameter is set to a dummy value.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")


class JWKSClient:
    """Client for retrieving and caching JSON Web Keys (JWKs).

    Supabase exposes a JWKS endpoint that lists the public keys used
    to sign authentication tokens.  This client fetches the keys
    once and caches them for subsequent verifications.  If the keys
    rotate, you should restart the application or invalidate the
    cache to fetch the new set.
    """

    def __init__(self, jwks_url: str):
        self.jwks_url = jwks_url

    @lru_cache(maxsize=1)
    def get_keys(self):
        """Retrieve the JWKS from the configured URL."""
        try:
            response = requests.get(self.jwks_url, timeout=5)
            response.raise_for_status()
        except Exception as exc:
            raise RuntimeError(f"Failed to fetch JWKS: {exc}") from exc
        jwks = response.json()
        keys = jwks.get("keys")
        if not keys:
            raise RuntimeError("Invalid JWKS format: missing 'keys'")
        return keys

    def get_key(self, kid: str) -> Optional[dict]:
        """Find the JWK matching the given key ID (kid)."""
        for key in self.get_keys():
            if key.get("kid") == kid:
                return key
        return None


def decode_supabase_token(token: str) -> dict:
    """Decode and optionally verify a Supabase JWT.

    If a JWKS URL is configured, the token's signature is verified
    against the corresponding public key.  Otherwise, the token is
    decoded without signature verification (development only).

    Returns the decoded payload on success or raises an HTTPException
    with status 401 on failure.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError:
        raise credentials_exception

    if JWKS_URL:
        client = JWKSClient(JWKS_URL)
        key = client.get_key(unverified_header.get("kid"))
        if not key:
            raise credentials_exception
        # Use the key dict directly; python‑jose will handle JWKs
        try:
            payload = jwt.decode(
                token,
                key,
                algorithms=[unverified_header.get("alg", "HS256")],
                audience=JWT_AUDIENCE,
                issuer=JWT_ISSUER,
                options={"verify_aud": JWT_AUDIENCE is not None, "verify_iss": JWT_ISSUER is not None},
            )
        except JWTError:
            raise credentials_exception
    else:
        # Without verification: decode the token payload
        try:
            payload = jwt.decode(token, key="", options={"verify_signature": False})
        except JWTError:
            raise credentials_exception
    return payload


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> models.User:
    """Retrieve the current user based on the provided bearer token.

    The Supabase token is decoded to extract the subject (user ID) and
    optionally the email address.  A corresponding local user record
    is returned.  If the user does not already exist in the local
    database, a new record is created with the given ID and email.
    """
    payload = decode_supabase_token(token)
    user_id: Optional[str] = payload.get("sub")
    email: Optional[str] = payload.get("email")
    if not user_id:
        # Without a subject the token is invalid
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Look up the user locally; create a placeholder if not found
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        user = models.User(id=user_id, email=email, username=None)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user