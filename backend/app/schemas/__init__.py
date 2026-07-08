"""
BetterBee — Pydantic Schemas package.
"""

from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserSyncRequest,
    UserUpdate,
)
from app.schemas.workspace import (
    WorkspaceCreate,
    WorkspaceUpdate,
    WorkspaceResponse,
)
from app.schemas.document import (
    DocumentUploadInitiateRequest,
    DocumentUploadInitiateResponse,
    DocumentConfirmRequest,
    DocumentResponse,
    DocumentStatusResponse,
)
from app.schemas.chat import (
    MessageCreate,
    MessageResponse,
    ChatSessionCreate,
    ChatSessionUpdate,
    ChatSessionResponse,
    ChatSessionDetailResponse,
    ChatRequest,
)

__all__ = [
    "UserCreate",
    "UserResponse",
    "UserSyncRequest",
    "UserUpdate",
    "WorkspaceCreate",
    "WorkspaceUpdate",
    "WorkspaceResponse",
    "DocumentUploadInitiateRequest",
    "DocumentUploadInitiateResponse",
    "DocumentConfirmRequest",
    "DocumentResponse",
    "DocumentStatusResponse",
    "MessageCreate",
    "MessageResponse",
    "ChatSessionCreate",
    "ChatSessionUpdate",
    "ChatSessionResponse",
    "ChatSessionDetailResponse",
    "ChatRequest",
]
