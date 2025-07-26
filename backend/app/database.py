"""
Database configuration for the friendly betting app.

This module uses SQLAlchemy to set up a SQLite database and provide a
session generator for interacting with the database within FastAPI
endpoints.  SQLite is used for its simplicity; for production use a more
robust database (e.g. PostgreSQL) is recommended.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load environment variables from a .env file.  This allows
# configuration such as database URL to be managed outside of the
# codebase.  See `.env.example` for the list of variables expected.
try:
    from dotenv import load_dotenv

    load_dotenv()
except Exception:
    # If python‑dotenv is not installed or fails to load, skip silently.
    pass


# The database URL is configurable via the DATABASE_URL environment
# variable.  Use a SQLite file by default for local development.  To
# connect to Postgres or another server, set DATABASE_URL in your
# environment.  For example:
# DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/mydb
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./bet_app.db")

# When using SQLite, the `check_same_thread=False` option is required
# to allow connections across threads.  This flag is ignored by other
# database engines.
connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy models
Base = declarative_base()


def get_db():
    """Yield a database session for dependency injection in FastAPI.

    This helper is used in FastAPI endpoints to provide a SQLAlchemy session
    that is automatically closed after the request is processed.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
