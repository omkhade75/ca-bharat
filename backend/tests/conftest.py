"""
Pytest Session Configuration for Isolated Test Databases & Storage
Prevents test suites from mutating local development databases (ca_bharat.db)
or local uploaded file directories.
"""

import os
import shutil
import tempfile

_TEST_TMP_DIR = tempfile.mkdtemp(prefix="cabharat_pytest_")
os.environ["DATABASE_URL"] = f"sqlite:///{os.path.join(_TEST_TMP_DIR, 'pytest_isolated.db').replace(os.sep, '/')}"
os.environ["CA_BHARAT_STORAGE_DIR"] = os.path.join(_TEST_TMP_DIR, "uploads")
os.makedirs(os.environ["CA_BHARAT_STORAGE_DIR"], exist_ok=True)

# Initialize and seed the isolated temp DB immediately so module-level TestClient(app) instances see all tables & seeds
from app.db.session import init_db
init_db()


def pytest_sessionfinish(session, exitstatus):
    """Dispose SQLAlchemy engine and remove temporary pytest directory cleanly."""
    try:
        from app.db.session import engine
        engine.dispose()
    except Exception:
        pass
    try:
        shutil.rmtree(_TEST_TMP_DIR, ignore_errors=True)
    except Exception:
        pass
