"""Persistența tichetelor apărute după release."""
import json

from .db import tx


def list_tickets() -> list[dict]:
    with tx() as connection:
        rows = connection.execute(
            "SELECT payload FROM post_release_tickets ORDER BY id"
        ).fetchall()
    return [json.loads(row["payload"]) for row in rows]


def replace_tickets(tickets: list[dict]) -> None:
    """Înlocuiește atomic întregul set importat."""
    with tx() as connection:
        connection.execute("DELETE FROM post_release_tickets")
        connection.executemany(
            "INSERT INTO post_release_tickets(id, payload) VALUES (?, ?)",
            [(ticket["id"], json.dumps(ticket, ensure_ascii=False)) for ticket in tickets],
        )


def count_tickets() -> int:
    with tx() as connection:
        return connection.execute(
            "SELECT COUNT(*) AS n FROM post_release_tickets"
        ).fetchone()["n"]
