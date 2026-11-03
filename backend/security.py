import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import time
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User

_PASSWORD_ITERATIONS = 310_000
_JWT_ISSUER = "smart-library-api"
_TOKEN_LIFETIME_SECONDS = 3600
_bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, _PASSWORD_ITERATIONS
    )
    return f"pbkdf2_sha256${_PASSWORD_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    parts = stored_hash.split("$")
    if len(parts) == 4 and parts[0] == "pbkdf2_sha256":
        try:
            iterations = int(parts[1])
            salt = bytes.fromhex(parts[2])
            expected = bytes.fromhex(parts[3])
        except ValueError:
            return False
        if iterations < 1 or iterations > 2_000_000 or len(salt) != 16:
            return False
        actual = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), salt, iterations
        )
        return hmac.compare_digest(actual, expected)

    if re.fullmatch(r"[0-9a-fA-F]{64}", stored_hash):
        legacy_digest = hashlib.sha256(
            f"smartlib_salt_2026_{password}".encode("utf-8")
        ).hexdigest()
        return hmac.compare_digest(legacy_digest, stored_hash.lower())
    return False


def _jwt_secret() -> bytes:
    secret = os.getenv("JWT_SECRET", "")
    if len(secret.encode("utf-8")) < 32:
        raise RuntimeError("JWT_SECRET must be configured with at least 32 bytes.")
    return secret.encode("utf-8")


def _encode_segment(value: dict) -> str:
    encoded = base64.urlsafe_b64encode(
        json.dumps(value, separators=(",", ":"), sort_keys=True).encode("utf-8")
    )
    return encoded.rstrip(b"=").decode("ascii")


def _decode_segment(value: str) -> dict:
    padded = value + "=" * (-len(value) % 4)
    decoded = base64.b64decode(padded, altchars=b"-_", validate=True)
    result = json.loads(decoded)
    if not isinstance(result, dict):
        raise ValueError("Invalid token segment")
    return result


def create_access_token(user_id: int) -> str:
    now = int(time.time())
    header = _encode_segment({"alg": "HS256", "typ": "JWT"})
    payload = _encode_segment(
        {
            "exp": now + _TOKEN_LIFETIME_SECONDS,
            "iat": now,
            "iss": _JWT_ISSUER,
            "sub": str(user_id),
        }
    )
    message = f"{header}.{payload}".encode("ascii")
    signature = hmac.new(_jwt_secret(), message, hashlib.sha256).digest()
    encoded_signature = base64.urlsafe_b64encode(signature).rstrip(b"=").decode("ascii")
    return f"{header}.{payload}.{encoded_signature}"


def decode_access_token(token: str) -> Optional[dict]:
    try:
        header_part, payload_part, signature_part = token.split(".")
        header = _decode_segment(header_part)
        payload = _decode_segment(payload_part)
        if header != {"alg": "HS256", "typ": "JWT"}:
            return None

        message = f"{header_part}.{payload_part}".encode("ascii")
        expected = hmac.new(_jwt_secret(), message, hashlib.sha256).digest()
        supplied = base64.b64decode(
            signature_part + "=" * (-len(signature_part) % 4),
            altchars=b"-_",
            validate=True,
        )
        if not hmac.compare_digest(expected, supplied):
            return None

        now = int(time.time())
        subject = payload.get("sub")
        if (
            payload.get("iss") != _JWT_ISSUER
            or not isinstance(subject, str)
            or not subject.isdigit()
            or not isinstance(payload.get("exp"), int)
            or payload["exp"] <= now
            or not isinstance(payload.get("iat"), int)
            or payload["iat"] > now
        ):
            return None
        return payload
    except (ValueError, TypeError, UnicodeDecodeError, json.JSONDecodeError):
        return None


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise unauthorized

    claims = decode_access_token(credentials.credentials)
    if claims is None:
        raise unauthorized

    user = db.query(User).filter(User.user_id == int(claims["sub"])).first()
    if not user or user.status.lower() != "active":
        raise unauthorized
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role.lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required",
        )
    return user
