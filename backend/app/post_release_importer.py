"""Import Excel și asociere contextuală pentru tichetele post-release."""
from . import feedback_repository, importer, llm, repository
from .clustering import _cos
from .config import SIMILARITY_THRESHOLD
from .models import PostReleaseFeedbackImportResult


def _normalize(value: str | None) -> str:
    return " ".join((value or "").lower().split())


def associated_ticket_id(ticket: dict, initial: list[dict]) -> str | None:
    by_id = {item["id"]: item["id"] for item in initial}
    by_title = {_normalize(item.get("titlu")): item["id"] for item in initial}
    linked = ticket.get("tichet_legat")
    if linked in by_id:
        return linked
    if ticket["id"] in by_id:
        return ticket["id"]
    return by_title.get(_normalize(ticket.get("titlu")))


def _context(ticket: dict) -> str:
    return f"{ticket.get('titlu') or ''}. {ticket.get('descriere') or ''}. {ticket.get('categorie') or ''}"


def associate_contextually(post_release: list[dict], initial: list[dict]) -> None:
    """Completează legăturile lipsă prin similaritate semantică Gemini.

    Legăturile explicite și titlurile identice rămân semnale mai puternice. Dacă
    embeddings nu sunt disponibile, tichetele neasociate rămân corect probleme noi.
    """
    unresolved = [ticket for ticket in post_release if not ticket["initial_ticket_id"]]
    if not unresolved or not initial:
        return
    vectors = llm.embed([_context(ticket) for ticket in initial + unresolved])
    if not vectors or len(vectors) != len(initial) + len(unresolved):
        return
    initial_vectors = vectors[:len(initial)]
    for ticket, vector in zip(unresolved, vectors[len(initial):]):
        scores = [(_cos(vector, candidate), item["id"]) for item, candidate in zip(initial, initial_vectors)]
        score, ticket_id = max(scores, default=(0.0, ""))
        if score >= SIMILARITY_THRESHOLD:
            ticket["initial_ticket_id"] = ticket_id
            ticket["asociere_sursa"] = "ai"


def import_post_release_excel(content: bytes) -> PostReleaseFeedbackImportResult:
    parsed = importer.parse_workbook(content)
    if not parsed:
        raise ValueError("Foaia „Tichete” nu conține niciun tichet post-release.")
    initial = repository.raw_tickets()
    for ticket in parsed:
        ticket["initial_ticket_id"] = associated_ticket_id(ticket, initial)
        ticket["asociere_sursa"] = "explicit" if ticket["initial_ticket_id"] else None
    associate_contextually(parsed, initial)
    feedback_repository.replace_tickets(parsed)
    # Importul pregătește comparația, dar nu publică rezultate construite din
    # rapoarte mai vechi. Utilizatorul trebuie să pornească „Verifică acum”.
    from . import post_release
    post_release.set_ready(False)
    associated = sum(bool(ticket["initial_ticket_id"]) for ticket in parsed)
    return PostReleaseFeedbackImportResult(
        importate=len(parsed),
        ticheteAsociate=associated,
        ignorate=0,
        problemeNoi=len(parsed) - associated,
    )
