"""Tiny SQLite data layer (stdlib sqlite3, zero extra deps at runtime).

Tables: users, waitlist. Passwords are bcrypt-hashed before storage.
"""
import sqlite3
from contextlib import contextmanager

from app.core.config import get_settings


def init_db() -> None:
    with get_conn() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                full_name TEXT NOT NULL,
                phone TEXT,
                password_hash TEXT NOT NULL,
                plan TEXT NOT NULL DEFAULT 'free',
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS waitlist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                source TEXT DEFAULT 'landing',
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
            """
        )


@contextmanager
def get_conn():
    conn = sqlite3.connect(get_settings().database_url.replace("sqlite:///", ""))
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()
