
import base64
import hashlib
import hmac
import json
import math
import secrets
import time
from typing import Optional


def generate_secret() -> str:
    return secrets.token_hex(32)


def generate_qr_token(session_id: int, qr_secret: str, rotation_interval: int = 30) -> dict:
    timestamp = int(time.time())
    time_slot = timestamp // rotation_interval

    payload = {
        "session_id": session_id,
        "time_slot": time_slot,
        "timestamp": timestamp,
    }

    payload_str = json.dumps(payload, separators=(",", ":"), sort_keys=True)
    signature = hmac.new(
        qr_secret.encode("utf-8"),
        payload_str.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    token_dict = {"p": payload, "s": signature}
    qr_data = base64.b64encode(
        json.dumps(token_dict, separators=(",", ":")).encode("utf-8")
    ).decode("utf-8")

    return {
        "qrData": qr_data,
        "expiresAt": timestamp + 60,
        "rotationInterval": rotation_interval,
    }


def _parse_qr_token(qr_data: str) -> tuple[Optional[dict], Optional[str]]:
    try:
        raw = base64.b64decode(qr_data.encode("utf-8")).decode("utf-8")
        return json.loads(raw), None
    except Exception:
        return None, "Invalid QR code"


def extract_session_id(qr_data: str) -> tuple[Optional[int], Optional[str]]:
    token, err = _parse_qr_token(qr_data)
    if err:
        return None, err
    try:
        return int(token["p"]["session_id"]), None
    except (KeyError, TypeError, ValueError):
        return None, "Invalid QR code"


def validate_qr_token(
    qr_data: str,
    qr_secret: str,
    expiry_seconds: int = 60,
) -> tuple[Optional[int], Optional[str]]:
    token, err = _parse_qr_token(qr_data)
    if err:
        return None, err

    try:
        payload = token["p"]
        signature = token["s"]
    except KeyError:
        return None, "Invalid QR code"

    payload_str = json.dumps(payload, separators=(",", ":"), sort_keys=True)
    expected_sig = hmac.new(
        qr_secret.encode("utf-8"),
        payload_str.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(signature, expected_sig):
        return None, "Invalid QR code"

    try:
        timestamp = payload["timestamp"]
        session_id = int(payload["session_id"])
    except (KeyError, TypeError, ValueError):
        return None, "Invalid QR code"

    if time.time() - timestamp > expiry_seconds:
        return None, "QR code has expired. Please scan the current QR."

    return session_id, None


def haversine_distance(
    lat1: float,
    lng1: float,
    lat2: float,
    lng2: float,
) -> float:
    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
