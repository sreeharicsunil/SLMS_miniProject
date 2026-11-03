import hashlib
import os
import unittest
from unittest.mock import patch

os.environ.setdefault("DATABASE_URL", "sqlite:///./security_test.db")

from backend.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


class SecurityTests(unittest.TestCase):
    def test_password_hash_round_trip_and_wrong_password(self):
        password_hash = hash_password("test-password")
        self.assertTrue(verify_password("test-password", password_hash))
        self.assertFalse(verify_password("wrong-password", password_hash))

    def test_legacy_demo_password_hash_can_be_migrated(self):
        legacy_hash = hashlib.sha256(
            "smartlib_salt_2026_Password123!".encode("utf-8")
        ).hexdigest()
        self.assertTrue(verify_password("Password123!", legacy_hash))
        self.assertFalse(verify_password("incorrect", legacy_hash))

    def test_token_signature_and_expiration_are_verified(self):
        with patch.dict(os.environ, {"JWT_SECRET": "x" * 40}):
            with patch("backend.security.time.time", return_value=1_000):
                token = create_access_token(12)
                self.assertEqual(decode_access_token(token)["sub"], "12")
                self.assertIsNone(decode_access_token(token + "tampered"))
            with patch("backend.security.time.time", return_value=5_000):
                self.assertIsNone(decode_access_token(token))

    def test_missing_jwt_secret_fails_closed(self):
        with patch.dict(os.environ, {"JWT_SECRET": ""}):
            with self.assertRaises(RuntimeError):
                create_access_token(12)


if __name__ == "__main__":
    unittest.main()
