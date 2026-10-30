import unittest
from types import SimpleNamespace
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.models import PostReleaseImpact
from app.post_release import build_impacts, conclusion_for, percentage_change, trend_for


def original(ticket_id="WB-1", reports=10):
    return {"id": ticket_id, "titlu": "Problemă inițială", "nr_raportari": reports, "versiune_fix": "3.14.0", "versiune_raportata": "3.13.0", "data_livrare_fix": "2026-10-20"}


class PostReleaseCalculationTests(unittest.TestCase):
    def test_no_post_release_import_means_no_impact(self):
        self.assertEqual(build_impacts([original()], [], []), [])

    def test_percentage_change_and_zero_before(self):
        self.assertEqual(percentage_change(10, 4), -60)
        self.assertEqual(percentage_change(0, 0), 0)
        self.assertEqual(percentage_change(0, 3), 100)

    def test_trend_thresholds_are_inclusive_for_stable(self):
        self.assertEqual(trend_for(-11), "scadere")
        self.assertEqual(trend_for(-10), "stabil")
        self.assertEqual(trend_for(10), "stabil")
        self.assertEqual(trend_for(11), "crestere")

    def test_each_conclusion_rule(self):
        self.assertEqual(conclusion_for("picat", "scadere"), "fix_invalidat")
        self.assertEqual(conclusion_for("trecut", "scadere"), "fix_confirmat")
        self.assertEqual(conclusion_for("trecut", "stabil"), "necesita_monitorizare")
        self.assertEqual(conclusion_for("trecut", "crestere"), "necesita_monitorizare")
        self.assertEqual(conclusion_for(None, "scadere"), "necesita_monitorizare")

    def test_aggregates_linked_tickets_and_ignores_new_problems(self):
        reports = [SimpleNamespace(ticketId="WB-1", data="2026-10-25T10:00:00", verdict="trecut", versiuneTestata="3.15.0")]
        post = [{"id": "POST-1", "initial_ticket_id": "WB-1", "nr_raportari": 2}, {"id": "POST-2", "initial_ticket_id": "WB-1", "nr_raportari": 3}, {"id": "POST-NEW", "initial_ticket_id": None, "nr_raportari": 99}]
        impact = build_impacts([original()], reports, post)[0]
        self.assertEqual(impact.reclamatiiInainte, 10)
        self.assertEqual(impact.reclamatiiDupa, 5)
        self.assertEqual(impact.versiune, "3.15.0")

    def test_latest_report_controls_combined_conclusion(self):
        reports = [SimpleNamespace(ticketId="WB-1", data="2026-10-20T10:00:00", verdict="trecut", versiuneTestata="3.13.0"), SimpleNamespace(ticketId="WB-1", data="2026-10-25T10:00:00", verdict="picat", versiuneTestata="3.14.0")]
        impact = build_impacts([original()], reports, [{"id": "POST-1", "initial_ticket_id": "WB-1", "nr_raportari": 1}])[0]
        self.assertEqual(impact.concluzie, "fix_invalidat")


class PostReleaseEndpointTests(unittest.TestCase):
    def test_endpoint_response_contract(self):
        expected = PostReleaseImpact(ticketId="WB-1", versiune="3.14.0", dataRelease="2026-10-20", zileAnalizate=0, reclamatiiInainte=4, reclamatiiDupa=1, schimbareProcent=-75, trend="scadere", concluzie="fix_confirmat")
        with patch("app.main.post_release.list_impacts", return_value=[expected]):
            with TestClient(app) as client:
                response = client.get("/api/post-release-impact")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()[0]["ticketId"], "WB-1")


if __name__ == "__main__":
    unittest.main()
