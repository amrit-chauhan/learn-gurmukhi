"""
Shared slowapi rate-limiter singleton.

Lives in its own module so both `server.py` (middleware + exception handler)
and the route modules (per-route `@limiter.limit(...)` decorators on write
endpoints) import the same `Limiter` instance.

Limits are keyed by client IP. This is app-level defence-in-depth — the primary
bot/DDoS defence is Cloudflare in front of the deployment (see
docs/DEPLOYMENT.md). Configuration lives in `config.settings`.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

from config import settings

# headers_enabled is left off: enabling it makes slowapi inject X-RateLimit-*
# headers on success, which requires every decorated route to also declare a
# `response: Response` param. We keep routes thin instead — the 429 response
# (with Retry-After) is still emitted by the exception handler in server.py.
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[settings.rate_limit_default] if settings.rate_limit_enabled else [],
    enabled=settings.rate_limit_enabled,
)

# Convenience: the write-endpoint limit string, applied via decorator on
# mutation routes. Kept here so all limit config is sourced from one place.
WRITE_LIMIT = settings.rate_limit_write
