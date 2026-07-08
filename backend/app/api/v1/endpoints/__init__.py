"""
BetterBee — API v1 Endpoints.
"""

from app.api.v1.endpoints import auth, health, workspaces, storage, documents

__all__ = ["auth", "health", "workspaces", "storage", "documents"]
