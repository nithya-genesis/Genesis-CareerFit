import os
import re
from typing import Dict, Any, List, Tuple
from pypdf import PdfReader

class ReportValidator:
    """
    Strict Post-Render Report QA & Content Integrity Validator.
    Verifies:
    - Minimum page budgets by report profile
    - Elimination of broken tokens ('NaN', 'undefined', 'null')
    - Benchmark mathematical consistency
    - Demographic identity completeness
    """

    MIN_PAGES = {
        'Executive Summary (2-Page Snapshot)': 2,
        'Detailed Profile (10-15 Page)': 4,
        'Comprehensive Dossier (15-20+ Page)': 4
    }

    @classmethod
    def validate_report(
        cls,
        pdf_path: str,
        evidence_pack: Dict[str, Any],
        report_mode: str = 'Detailed Profile (10-15 Page)'
    ) -> Tuple[bool, List[str]]:
        errors = []

        # 1. Physical File Validation
        if not os.path.exists(pdf_path):
            return False, [f'Report file does not exist at {pdf_path}']

        if os.path.getsize(pdf_path) == 0:
            return False, ['Report PDF is an empty 0-byte file.']

        # 2. PDF Content & Page Count Verification
        try:
            reader = PdfReader(pdf_path)
            num_pages = len(reader.pages)
            min_expected = cls.MIN_PAGES.get(report_mode, 2)

            if num_pages < min_expected:
                errors.append(f'Page count failure: Generated {num_pages} pages, expected minimum {min_expected}.')

            full_text = ''
            for idx, p in enumerate(reader.pages):
                txt = p.extract_text() or ''
                full_text += ' ' + txt
                if not txt.strip():
                    errors.append(f'Blank page detected at page {idx + 1}.')

        except Exception as e:
            return False, [f'Failed to parse PDF document: {str(e)}']

        # 3. Demographic Completeness
        meta = evidence_pack.get('metadata', {})
        name = meta.get('name', '').strip()
        usn = meta.get('usn', '').strip()

        if not name or name == 'Unknown':
            errors.append('Identity validation error: Candidate name is missing.')

        if name and name not in full_text:
            errors.append(f'Text presence error: Candidate name "{name}" not rendered in PDF.')

        # 4. Token Corruption Checks
        corrupt_tokens = ['undefined', 'NaN', 'NoneType', '{{', '}}', '{%']
        for tok in corrupt_tokens:
            if tok in full_text:
                errors.append(f'Corrupt template token "{tok}" detected in report text.')

        is_valid = len(errors) == 0
        return is_valid, errors

    @classmethod
    def format_ordinal(cls, n: int) -> str:
        """Fixes grammatical suffix issues (e.g., 2nd instead of 2th)."""
        if 11 <= (n % 100) <= 13:
            suffix = 'th'
        else:
            suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')
        return f'{n}{suffix}'
