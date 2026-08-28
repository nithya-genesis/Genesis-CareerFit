import os
import json
from typing import Dict, Any, Optional

class GlossaryEngine:
    """
    Provides contextual 'In Simple Words' explanations for assessment terminology.
    """

    def __init__(self):
        self.glossary_path = os.path.join(os.path.dirname(__file__), "..", "config", "glossary_registry.json")
        self.glossary = {}
        self._load_glossary()

    def _load_glossary(self):
        if os.path.exists(self.glossary_path):
            with open(self.glossary_path, 'r', encoding='utf-8') as f:
                self.glossary = json.load(f)

    def get_explanation(self, term_key: str) -> Optional[Dict[str, str]]:
        return self.glossary.get(term_key.upper())

    def format_callout_box(self, term_key: str) -> Dict[str, str]:
        item = self.get_explanation(term_key)
        if not item:
            return {}

        return {
            "title": f"💡 IN SIMPLE WORDS: {item['term'].upper()}",
            "technical": item["technical_definition"],
            "simple": item["simple_explanation"]
        }
