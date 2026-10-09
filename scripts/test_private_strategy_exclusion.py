"""Prevent the internal SEO handoff returning to the public Pages source."""
import contextlib
import io
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from scripts import check_site_consistency as gate


class PrivateStrategyExclusionTests(unittest.TestCase):
    def test_gate_rejects_internal_document_even_though_docs_are_outside_public_inventory(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            strategy = root / "docs/seo/competitor-seo-aeo-paid-search-strategy-2026-07-15.html"
            strategy.parent.mkdir(parents=True)
            strategy.write_text("Internal handoff")
            with patch.object(gate, "ROOT", root), contextlib.redirect_stdout(io.StringIO()) as output:
                with self.assertRaises(SystemExit):
                    gate.main()
                self.assertIn("internal SEO strategy", output.getvalue())
                strategy.unlink()
                gate.main()


if __name__ == "__main__":
    unittest.main()
