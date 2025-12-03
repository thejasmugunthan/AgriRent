"""
Centralized logging configuration used across the project.
Use: from logging_config import configure_logging; configure_logging()
"""

import logging
import sys
from pathlib import Path

LOG_DIR = Path(__file__).resolve().parent / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)
LOG_FILE = LOG_DIR / "ml_service.log"


def configure_logging(level=logging.INFO):
    """
    Configure root logger:
      - Console handler (stream)
      - File handler (simple append)
    """
    root = logging.getLogger()
    if root.handlers:
        # already configured
        return

    root.setLevel(level)

    fmt = logging.Formatter(
        "%(asctime)s — %(levelname)s — %(name)s — %(message)s",
        "%Y-%m-%d %H:%M:%S"
    )

    # Console handler
    ch = logging.StreamHandler(sys.stdout)
    ch.setFormatter(fmt)
    ch.setLevel(level)
    root.addHandler(ch)

    # File handler
    fh = logging.FileHandler(LOG_FILE, mode="a", encoding="utf-8")
    fh.setFormatter(fmt)
    fh.setLevel(logging.DEBUG)
    root.addHandler(fh)

    # Quiet noisy libs
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("urllib3").propagate = False


# Auto-configure when module imported
configure_logging()
