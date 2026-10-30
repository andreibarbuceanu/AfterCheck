"""Compară tichetele inițiale cu tichetele apărute după release."""
from __future__ import annotations

from collections import defaultdict
from .db import kv_get, kv_set
from .models import PostReleaseImpact, Raport


IMPACT_READY_KEY = "post_release.verified"


def is_ready() -> bool:
    """Impactul devine public numai după o verificare cerută de utilizator."""
    return bool(kv_get(IMPACT_READY_KEY, False))


def set_ready(value: bool) -> None:
    kv_set(IMPACT_READY_KEY, value)


def percentage_change(before: int, after: int) -> int:
    if before == 0:
        return 0 if after == 0 else 100
    return round((after - before) / before * 100)


def trend_for(change: int) -> Literal["scadere", "crestere", "stabil"]:
    if change < -10:
        return "scadere"
    if change > 10:
        return "crestere"
    return "stabil"


def conclusion_for(verdict: str | None, trend: str):
    if verdict == "picat":
        return "fix_invalidat"
    if verdict == "trecut" and trend == "scadere":
        return "fix_confirmat"
    return "necesita_monitorizare"


def build_impacts(
    tickets: list[dict], reports: list[Raport], post_release_tickets: list[dict]
) -> list[PostReleaseImpact]:
    # Fără al doilea import nu există observații post-release. Un zero inventat
    # aici ar fi interpretat greșit drept o reducere de 100%.
    if not post_release_tickets:
        return []
    existing = {ticket["id"]: ticket for ticket in tickets}
    grouped: dict[str, list[dict]] = defaultdict(list)
    for ticket in post_release_tickets:
        initial_id = ticket.get("initial_ticket_id")
        if initial_id in existing:
            grouped[initial_id].append(ticket)

    latest: dict[str, Raport] = {}
    for report in sorted(reports, key=lambda item: item.data, reverse=True):
        latest.setdefault(report.ticketId, report)

    impacts = []
    for ticket_id, original in existing.items():
        before = int(original.get("nr_raportari") or 0)
        after = sum(int(item.get("nr_raportari") or 0) for item in grouped.get(ticket_id, []))
        change = percentage_change(before, after)
        trend = trend_for(change)
        report = latest.get(ticket_id)
        # Impactul este afișat lângă un raport tehnic și trebuie asociat cu
        # versiunea testată efectiv, nu cu versiunea istorică declarată în tichet.
        version = (
            report.versiuneTestata if report
            else original.get("versiune_fix") or original.get("versiune_raportata")
        )
        impacts.append(PostReleaseImpact(
            ticketId=ticket_id,
            versiune=str(version or ""),
            dataRelease=str(original.get("data_livrare_fix") or ""),
            zileAnalizate=0,
            reclamatiiInainte=before,
            reclamatiiDupa=after,
            schimbareProcent=change,
            trend=trend,
            concluzie=conclusion_for(report.verdict if report else None, trend),
        ))
    return sorted(impacts, key=lambda impact: impact.ticketId)


def list_impacts(
    tickets: list[dict], reports: list[Raport], post_release_tickets: list[dict]
) -> list[PostReleaseImpact]:
    if not is_ready():
        return []
    return build_impacts(tickets, reports, post_release_tickets)
