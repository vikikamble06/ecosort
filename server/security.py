import os
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import sqlite3
from database import get_db_connection, hash_password, verify_password

SECRET_KEY = os.environ.get("ECOSORT_JWT_SECRET", "ecosort-ultra-secure-jwt-key-2026-production-ready")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

security = HTTPBearer(auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None

def get_db():
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()

def get_current_user_optional(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security),
    conn: sqlite3.Connection = Depends(get_db)
) -> Optional[Dict[str, Any]]:
    if not auth or not auth.credentials:
        return None
    payload = decode_access_token(auth.credentials)
    if not payload or "sub" not in payload:
        return None
    try:
        user_id = int(payload["sub"])
    except (ValueError, TypeError):
        return None
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, full_name, role, address, phone FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    if not row:
        return None
    return dict(row)

def get_current_user_required(
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
) -> Dict[str, Any]:
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in to proceed.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user

def require_admin(
    current_user: Dict[str, Any] = Depends(get_current_user_required)
) -> Dict[str, Any]:
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required for this operation."
        )
    return current_user

# File upload security: validate magic bytes
def validate_image_file(file_bytes: bytes, filename: str) -> str:
    max_size = 5 * 1024 * 1024  # 5 MB
    if len(file_bytes) > max_size:
        raise HTTPException(status_code=400, detail="File too large. Maximum allowed image size is 5MB.")

    ext = os.path.splitext(filename)[1].lower()
    allowed_exts = {".jpg", ".jpeg", ".png", ".webp"}
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Unsupported file extension '{ext}'. Only JPG, PNG, and WebP are allowed.")

    # Magic byte checks
    if ext in {".jpg", ".jpeg"}:
        if not (file_bytes.startswith(b"\xff\xd8\xff")):
            raise HTTPException(status_code=400, detail="File content does not match valid JPEG image signature.")
    elif ext == ".png":
        if not (file_bytes.startswith(b"\x89PNG\r\n\x1a\n")):
            raise HTTPException(status_code=400, detail="File content does not match valid PNG image signature.")
    elif ext == ".webp":
        if not (file_bytes[:4] == b"RIFF" and file_bytes[8:12] == b"WEBP"):
            raise HTTPException(status_code=400, detail="File content does not match valid WebP image signature.")

    return ext
