import unittest
import datetime
import re
from pathlib import Path
from scripts.normalize_access_language import GROWTH_ENTRY_PAGES, normalize
from scripts.update_picks_freshness import stamp

ROOT = Path(__file__).resolve().parents[1]


class GrowthEntryCopy(unittest.TestCase):
    def test_daily_prizepicks_title_retains_intent_and_length_after_date_stamping(self):
        source = (ROOT / 'picks/prizepicks/index.html').read_text()
        for month in range(1, 13):
            with self.subTest(month=month):
                day = datetime.date(2026, month, 28)
                generated = stamp(source, day)
                title = re.search(r'<title>(.*?)</title>', generated).group(1)
                self.assertLessEqual(len(title), 60)
                self.assertIn('picks today', title.lower())
                self.assertIn('cheat sheet', title.lower())
                self.assertEqual(stamp(generated, day), generated)

    def test_generated_entry_copy_remains_neutral_after_repeated_maintenance(self):
        legacy = '<a>Start Free Trial</a><h3>Get lifetime-free core access to the full research workspace.</h3><p>No card required.</p>'
        result = normalize(legacy, growth_entry=True)
        self.assertIn('Explore Propeller', result)
        self.assertNotIn('lifetime', result)
        self.assertNotIn('Trial', result)
        self.assertEqual(normalize(result, growth_entry=True), result)

    def test_public_entry_pages_do_not_announce_or_activate_the_future_offer(self):
        for rel in GROWTH_ENTRY_PAGES:
            with self.subTest(page=rel):
                source = (ROOT / rel).read_text()
                self.assertIn('Explore Propeller', source)
                self.assertRegex(source, r'(?i)public tools stay free|public calculator stays free|calculator remains free')
                self.assertNotIn('Get lifetime-free access', source)
                self.assertNotIn('Launch spots remain', source)
                self.assertNotIn('Subscribe for $15', source)
                self.assertEqual(normalize(source, growth_entry=True), source)


if __name__ == '__main__':
    unittest.main()
