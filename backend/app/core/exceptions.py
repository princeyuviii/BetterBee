"""
BetterBee — Custom Exception Hierarchy.

All application exceptions inherit from BetterBeeError.
Each exception maps to an HTTP status code and structured error response.
Global exception handlers are registered in main.py.
"""

from typing import Any


class BetterBeeError(Exception):
    """Base exception for all BetterBee application errors."""

    def __init__(
        self,
        message: str = "An unexpected error occurred",
        *,
        status_code: int = 500,
        detail: Any = None,
    ) -> None:
        self.message = message
        self.status_code = status_code
        self.detail = detail
        super().__init__(message)


class NotFoundError(BetterBeeError):
    """Resource not found (404)."""

    def __init__(self, resource: str = "Resource", identifier: str = "") -> None:
        detail_msg = f"{resource} not found"
        if identifier:
            detail_msg = f"{resource} '{identifier}' not found"
        super().__init__(message=detail_msg, status_code=404)


class ForbiddenError(BetterBeeError):
    """Access denied (403)."""

    def __init__(self, message: str = "You do not have permission to access this resource") -> None:
        super().__init__(message=message, status_code=403)


class ValidationError(BetterBeeError):
    """Input validation failed (422)."""

    def __init__(self, message: str = "Validation error", *, detail: Any = None) -> None:
        super().__init__(message=message, status_code=422, detail=detail)


class StorageError(BetterBeeError):
    """File storage operation failed (502)."""

    def __init__(self, message: str = "Storage operation failed") -> None:
        super().__init__(message=message, status_code=502)


class ProviderError(BetterBeeError):
    """AI provider failure — LLM, embedding, or reranker (503)."""

    def __init__(self, provider: str = "AI Provider", message: str = "Provider unavailable") -> None:
        super().__init__(message=f"{provider}: {message}", status_code=503)


class RateLimitError(BetterBeeError):
    """Rate limit exceeded (429)."""

    def __init__(self, message: str = "Rate limit exceeded. Please try again later.") -> None:
        super().__init__(message=message, status_code=429)


class AuthenticationError(BetterBeeError):
    """Authentication failed (401)."""

    def __init__(self, message: str = "Authentication required") -> None:
        super().__init__(message=message, status_code=401)
