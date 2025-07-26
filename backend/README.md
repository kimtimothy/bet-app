# Friendly Betting App – Backend

This folder contains a **FastAPI** implementation of the API for a social
betting application.  The backend uses **SQLite** (configurable via
`DATABASE_URL`) for data storage and **SQLAlchemy** for object–relational
mapping.  Rather than implement its own user authentication, the
backend delegates to **Supabase**: clients authenticate via Supabase
and send the resulting JWT in the `Authorization` header.  Tokens are
validated against the project's JSON Web Key Set (JWKS) to ensure
integrity.  All bets are placed with virtual units rather than real
money.

## Features

* **Supabase JWT validation** – the API decodes and verifies JSON Web
  Tokens issued by Supabase using the project's JWKS.  A local user
  record is automatically created if it does not already exist.
* **Bet creation** – clients can create bets between themselves and an
  opponent (identified by a Supabase user ID).
* **Bet retrieval** – fetch a paginated list of bets involving the
  authenticated user.
* **Bet resolution** – update a bet with the winner and result once the
  outcome is known.

## Running the API locally

1. Install Python 3.10 or newer.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the development server using Uvicorn:
   ```bash
   uvicorn app.main:app --reload
   ```
5. Create a `.env` file in this directory and populate it based on
   `.env.example`.  At minimum you should provide `SUPABASE_JWT_JWKS_URL`
   pointing to your Supabase project's JWKS endpoint so that
   tokens can be verified.
6. Start the development server using Uvicorn:
   ```bash
   uvicorn app.main:app --reload
   ```
7. The API will be available at `http://127.0.0.1:8000`.  You can
   explore it interactively via the automatically generated docs at
   `http://127.0.0.1:8000/docs`.

## Notes

* Place environment variables in a `.env` file to configure the
  application.  `DATABASE_URL` can point to any database supported by
  SQLAlchemy; by default it uses a local SQLite file.  `SUPABASE_JWT_JWKS_URL`
  should be set to something like `https://your-project.supabase.co/auth/v1/keys`.
* For production use, switch from SQLite to a more robust database
  such as PostgreSQL and configure CORS to only allow requests from
  trusted origins (e.g. your mobile app’s domain).
