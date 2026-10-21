import unittest
import json
import urllib.request
import urllib.parse
from datetime import datetime, date, timedelta

BASE_URL = "http://127.0.0.1:8000"

class TestEcoSortAPI(unittest.TestCase):

    def make_request(self, path, method="GET", data=None, token=None):
        url = f"{BASE_URL}{path}"
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"

        encoded_data = json.dumps(data).encode("utf-8") if data else None
        req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req) as response:
                status_code = response.getcode()
                body = json.loads(response.read().decode("utf-8"))
                return status_code, body
        except urllib.error.HTTPError as e:
            body = json.loads(e.read().decode("utf-8")) if e.fp else {}
            return e.code, body

    def get_citizen_token(self):
        payload = {"email": "demo@ecosort.org", "password": "DemoEco@2026"}
        status, body = self.make_request("/api/auth/login", method="POST", data=payload)
        self.assertEqual(status, 200)
        return body["access_token"]

    def get_admin_token(self):
        payload = {"email": "admin@ecosort.org", "password": "AdminSort@2026"}
        status, body = self.make_request("/api/auth/login", method="POST", data=payload)
        self.assertEqual(status, 200)
        return body["access_token"]

    def test_01_health_and_provider_status(self):
        status, body = self.make_request("/api/health")
        self.assertEqual(status, 200)
        self.assertEqual(body["status"], "healthy")
        self.assertIn("ai_status", body)
        self.assertIn("mode", body["ai_status"])

    def test_02_categories_endpoint(self):
        status, body = self.make_request("/api/categories")
        self.assertEqual(status, 200)
        self.assertGreaterEqual(len(body), 10)
        codes = [c["code"] for c in body]
        self.assertIn("wet_organic", codes)
        self.assertIn("plastic", codes)
        self.assertIn("batteries", codes)

    def test_03_knowledge_base_search(self):
        # Search banana
        status, body = self.make_request("/api/waste-items/search?q=banana")
        self.assertEqual(status, 200)
        self.assertGreaterEqual(len(body), 1)
        self.assertIn("Banana", body[0]["name"])

        # Search battery (hazardous)
        status, body = self.make_request("/api/waste-items/search?q=battery")
        self.assertEqual(status, 200)
        self.assertGreaterEqual(len(body), 1)
        self.assertIsNotNone(body[0].get("warnings"))

    def test_04_classification_analyze(self):
        payload = {"filename": "plastic_water_bottle.jpg", "hint": "mineral bottle"}
        status, body = self.make_request("/api/classifications/analyze", method="POST", data=payload)
        self.assertEqual(status, 200)
        self.assertEqual(body["category_code"], "plastic")
        self.assertEqual(body["bin_name"], "Blue Plastic Bin")
        self.assertFalse(body["uncertain"])

    def test_05_auth_login_citizen(self):
        token = self.get_citizen_token()
        self.assertIsNotNone(token)
        # Verify /api/auth/me works
        status, me = self.make_request("/api/auth/me", token=token)
        self.assertEqual(status, 200)
        self.assertEqual(me["role"], "citizen")

    def test_06_auth_login_admin(self):
        token = self.get_admin_token()
        self.assertIsNotNone(token)
        status, me = self.make_request("/api/auth/me", token=token)
        self.assertEqual(status, 200)
        self.assertEqual(me["role"], "admin")

    def test_07_confirm_classification_and_points(self):
        token = self.get_citizen_token()
        confirm_payload = {
            "predicted_item_name": "Aluminium Soda Can",
            "category_id": 6,
            "confirmed_category_id": 6,
            "confidence": 0.97,
            "model_provider": "EcoSort Deterministic Knowledge Classifier"
        }
        status, body = self.make_request("/api/classifications/confirm", method="POST", data=confirm_payload, token=token)
        self.assertEqual(status, 200)
        self.assertTrue(body["success"])
        self.assertGreater(body["points_awarded"], 0)

    def test_08_pickup_booking_past_date_rejection(self):
        token = self.get_citizen_token()
        past_payload = {
            "waste_category_id": 3,
            "estimated_weight_kg": 5.0,
            "pickup_address": "Test Street 101",
            "preferred_date": "2020-01-01",
            "time_slot": "10:00 AM - 12:00 PM"
        }
        status, body = self.make_request("/api/bookings", method="POST", data=past_payload, token=token)
        self.assertEqual(status, 400)
        self.assertIn("past", body.get("detail", "").lower())

    def test_09_pickup_booking_valid_flow(self):
        token = self.get_citizen_token()
        future_date = (date.today() + timedelta(days=3)).isoformat()
        booking_payload = {
            "waste_category_id": 3,
            "estimated_weight_kg": 8.5,
            "pickup_address": "Flat 402, Green Meadows, Bengaluru",
            "preferred_date": future_date,
            "time_slot": "10:00 AM - 12:00 PM",
            "notes": "Automated test booking"
        }
        status, body = self.make_request("/api/bookings", method="POST", data=booking_payload, token=token)
        self.assertEqual(status, 200)
        self.assertTrue(body["success"])
        self.assertTrue(body["booking_reference"].startswith("ECO-2026-"))

    def test_10_admin_security_rbac_guard(self):
        citizen_token = self.get_citizen_token()
        admin_token = self.get_admin_token()

        # Citizen attempts to call admin overview -> 403 Forbidden
        status, _ = self.make_request("/api/admin/overview", token=citizen_token)
        self.assertEqual(status, 403)

        # Admin calls admin overview -> 200 OK
        status, body = self.make_request("/api/admin/overview", token=admin_token)
        self.assertEqual(status, 200)
        self.assertIn("metrics", body)
        self.assertIn("citizens_count", body["metrics"])

if __name__ == "__main__":
    unittest.main()
