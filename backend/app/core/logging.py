"""
BetterBee — Structured Logging.

Uses structlog for structured, contextual logging.
- JSON output in production for log aggregation.
- Colorized, human-readable output in development.
- Automatic context binding (request_id, user_id, workspace_id).
"""

import logging
import sys

import structlog


def setup_logging(*, debug: bool = False) -> None:
    """Configure structlog and standard library logging.

    Args:
        debug: If True, use colorized console output. If False, JSON output.
    """
    shared_processors: list[structlog.types.Processor] = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.UnicodeDecoder(),
    ]

    if debug:
        # Development: colorized, human-readable output
        renderer = structlog.dev.ConsoleRenderer(colors=True)
    else:
        # Production: JSON lines for log aggregation
        shared_processors.append(structlog.processors.format_exc_info)
        renderer = structlog.processors.JSONRenderer()

    structlog.configure(
        processors=[
            *shared_processors,
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    formatter = structlog.stdlib.ProcessorFormatter(
        processors=[
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            renderer,
        ],
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
    root_logger.setLevel(logging.DEBUG if debug else logging.INFO)

    # Quiet noisy third-party and application framework loggers
    quiet_loggers = (
        "app",
        "uvicorn.access",
        "uvicorn.error",
        "uvicorn",
        "httpx",
        "httpcore",
        "chromadb",
        "aiosqlite",
        "sqlalchemy.engine",
        "sqlalchemy.pool",
        "botocore",
        "boto3",
        "urllib3",
        "s3transfer",
    )
    for logger_name in quiet_loggers:
        logging.getLogger(logger_name).setLevel(logging.WARNING)


def get_logger(name: str | None = None) -> structlog.stdlib.BoundLogger:
    """Get a structured logger instance.

    Args:
        name: Logger name. Defaults to caller's module name.

    Returns:
        A bound structlog logger with context support.
    """
    return structlog.get_logger(name)
