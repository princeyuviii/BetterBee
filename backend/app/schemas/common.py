"""
BetterBee — Common Schemas.

Shared Pydantic models used across multiple endpoints:
pagination, API envelope, error responses.
"""

from pydantic import BaseModel, Field


class PaginationParams(BaseModel):
    """Query parameters for paginated endpoints."""

    offset: int = Field(default=0, ge=0, description="Number of records to skip")
    limit: int = Field(default=50, ge=1, le=100, description="Max records to return")
    order_by: str | None = Field(default=None, description="Sort column (prefix with '-' for desc)")


class PaginatedResponse(BaseModel):
    """Wrapper for paginated list responses."""

    total: int = Field(description="Total number of matching records")
    offset: int = Field(description="Current offset")
    limit: int = Field(description="Page size")
    has_more: bool = Field(description="Whether more records exist")


class ErrorDetail(BaseModel):
    """Structured error response body."""

    type: str
    message: str
    detail: dict | list | str | None = None


class ErrorResponse(BaseModel):
    """Standard error envelope."""

    error: ErrorDetail


class MessageResponse(BaseModel):
    """Simple success message response."""

    message: str
