import io
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

import openpyxl
from fastapi.testclient import TestClient

from app import db, feedback_repository, post_release, post_release_importer, verification
from app.main import app


def xlsx_bytes(rows):
    workbook = openpyxl.Workbook()
    sheet = workbook.active
    sheet.title = "Tichete"
    sheet.append(["ID tichet", "Titlu", "Status", "Nr. raportări clienți", "Tichet legat"])
    for row in rows:
        sheet.append(row)
    output = io.BytesIO()
    workbook.save(output)
    return output.getvalue()


class PostReleaseImportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.db_patch = patch("app.db.DB_PATH", Path(self.temp.name) / "test.db")
        self.db_patch.start()
        db.init_db()
        with db.tx() as connection:
            connection.execute("INSERT INTO tickets(id, titlu, nr_raportari, versiune_fix, data_livrare_fix, status, cluster_id, ordine) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", ("WB-1", "Aceeași problemă", 10, "3.14.0", "2026-10-20", "Rezolvat – fix livrat", "C-WB-1", 1))

    def tearDown(self):
        self.db_patch.stop()
        self.temp.cleanup()

    def test_links_by_reference_or_title_and_keeps_new_problem(self):
        result = post_release_importer.import_post_release_excel(xlsx_bytes([["POST-1", "Titlu diferit", "Nou", 3, "WB-1"], ["POST-2", "Aceeași problemă", "Nou", 2, None], ["POST-3", "Problemă complet nouă", "Nou", 4, None]]))
        self.assertEqual(result.importate, 3)
        self.assertEqual(result.ticheteAsociate, 2)
        self.assertEqual(result.problemeNoi, 1)
        self.assertEqual(feedback_repository.count_tickets(), 3)

    def test_initial_import_clears_post_release_and_total_counts_both_sets(self):
        post_release_importer.import_post_release_excel(xlsx_bytes([
            ["POST-1", "Aceeași problemă", "Nou", 3, "WB-1"],
        ]))
        with TestClient(app) as client:
            self.assertEqual(client.get("/api/stats").json()["totalTichete"], 1)
            initial = xlsx_bytes([["WB-2", "Altă problemă", "Rezolvat – fix livrat", 8, None]])
            response = client.post("/api/import", files={"file": ("initial.xlsx", initial, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(client.get("/api/stats").json()["totalTichete"], 1)
            self.assertEqual(client.get("/api/post-release-impact").json(), [])

    def test_dashboard_uses_only_post_release_totals_and_verdicts(self):
        post_release_importer.import_post_release_excel(xlsx_bytes([
            ["POST-1", "Aceeași problemă", "Nou", 3, "WB-1"],
            ["POST-2", "Problemă nouă A", "Nou", 2, None],
            ["POST-3", "Problemă nouă B", "Nou", 1, None],
            ["POST-4", "Problemă nouă C", "Nou", 1, None],
            ["POST-5", "Problemă nouă D", "Nou", 1, None],
            ["POST-6", "Problemă nouă E", "Nou", 1, None],
            ["POST-7", "Problemă nouă F", "Nou", 1, None],
        ]))
        post_release.set_ready(True)
        conclusions = [
            SimpleNamespace(concluzie="fix_confirmat"),
            SimpleNamespace(concluzie="fix_confirmat"),
            SimpleNamespace(concluzie="fix_invalidat"),
            SimpleNamespace(concluzie="fix_invalidat"),
            SimpleNamespace(concluzie="fix_invalidat"),
            SimpleNamespace(concluzie="necesita_monitorizare"),
            SimpleNamespace(concluzie="necesita_monitorizare"),
        ]
        with patch("app.repository.post_release.build_impacts", return_value=conclusions):
            with TestClient(app) as client:
                stats = client.get("/api/stats").json()
        self.assertEqual(stats["totalTichete"], 7)
        self.assertEqual(stats["fixuriConfirmate"], 2)
        self.assertEqual(stats["fixuriInvalidate"], 3)
        self.assertEqual(stats["necesitaMonitorizare"], 2)
        self.assertEqual(
            stats["fixuriConfirmate"] + stats["fixuriInvalidate"] + stats["necesitaMonitorizare"],
            stats["totalTichete"],
        )
        self.assertEqual(stats["rataRedeschidere"], 0.4286)

    def test_endpoint_accepts_xlsx_and_reset_clears_post_release(self):
        content = xlsx_bytes([["POST-1", "Aceeași problemă", "Nou", 3, "WB-1"]])
        with TestClient(app) as client:
            response = client.post("/api/post-release-feedback/import", files={"file": ("post-release.xlsx", content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["ticheteAsociate"], 1)
            self.assertEqual(client.get("/api/post-release-impact").json(), [])
            post_release.set_ready(True)
            impacts = client.get("/api/post-release-impact").json()
            self.assertEqual(impacts[0]["reclamatiiInainte"], 10)
            self.assertEqual(impacts[0]["reclamatiiDupa"], 3)
            wrong = client.post("/api/post-release-feedback/import", files={"file": ("post-release.csv", b"x", "text/csv")})
            self.assertEqual(wrong.status_code, 400)
            reset = client.delete("/api/demo-data")
            self.assertEqual(reset.json()["feedbackSters"], 1)
            self.assertEqual(client.get("/api/post-release-impact").json(), [])

    def test_post_release_import_does_not_start_verification(self):
        content = xlsx_bytes([["POST-1", "Aceeași problemă", "Nou", 3, "WB-1"]])
        with patch("app.main.verification.run_in_background") as run:
            with TestClient(app) as client:
                response = client.post(
                    "/api/post-release-tickets/import",
                    files={"file": ("post-release.xlsx", content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
                )
                status = client.get("/api/verify/status").json()
        self.assertEqual(response.status_code, 200)
        run.assert_not_called()
        self.assertFalse(status["ruleazaAcum"])
        self.assertIsNone(status["urmatoareaRulare"])
        with TestClient(app) as client:
            self.assertEqual(client.get("/api/post-release-impact").json(), [])

    def test_completed_manual_verification_publishes_post_release_impact(self):
        post_release_importer.import_post_release_excel(
            xlsx_bytes([["POST-1", "Aceeași problemă", "Nou", 3, "WB-1"]])
        )
        self.assertFalse(post_release.is_ready())
        with patch("app.verification.eligible", return_value=[]):
            verification.run_verification()
        self.assertTrue(post_release.is_ready())
        with TestClient(app) as client:
            self.assertEqual(len(client.get("/api/post-release-impact").json()), 1)


if __name__ == "__main__":
    unittest.main()
