import re
import math
from typing import Dict, Any, List, Optional
import pandas as pd

class TechnicalEngine:
    """
    Deterministic Multi-Domain Assessment Evaluator.
    Handles dynamic extraction and scoring across any technical, branch, or soft skill assessment:
    - AIML, Python, SQL, Java, C++, DSA, Web Dev, Cloud, Cybersecurity
    - ECE, IoT, Mechanical, Civil
    - Aptitude (Quant, Logical, Verbal), Communication
    
    Extracts question counts, correct/wrong tallies, raw scores, and percentage proficiencies deterministically.
    """

    @classmethod
    def evaluate_technical_scores(cls, candidate_row: pd.Series) -> Dict[str, Any]:
        """
        Legacy/dynamic scanner across standard technical columns.
        """
        tech_domains = {
            "Python": ["Python", "Python Score", "Python Total"],
            "SQL": ["SQL", "SQL Score", "SQL Total", "Relational Databases & SQL"],
            "Data Structures & Algorithms": ["DSA", "DSA Score", "Data Structures & Algorithms"],
            "Java": ["Java", "Java Score", "OOP"],
            "Web Dev": ["Web Dev", "Full Stack", "React"],
            "Cloud": ["Cloud", "AWS", "DevOps"],
            "Cybersecurity": ["Cybersecurity", "Security"],
            "ECE": ["ECE", "Embedded", "IoT"],
            "Mechanical": ["Mechanical", "CAD", "FEA"],
            "Civil": ["Civil", "Structures", "AutoCAD"]
        }
        
        # Find which columns exist in row
        active_mapping = {}
        row_cols = set(candidate_row.index)
        for dom, cols in tech_domains.items():
            matched = [c for c in cols if c in row_cols]
            if matched:
                active_mapping[dom] = matched

        return cls.evaluate_candidate_assessments(candidate_row, active_mapping)

    @classmethod
    def evaluate_candidate_assessments(
        cls,
        candidate_row: pd.Series,
        domain_mapping: Dict[str, List[str]]
    ) -> Dict[str, Any]:
        results = {}

        for domain, cols in domain_mapping.items():
            domain_eval = cls._evaluate_single_domain(candidate_row, domain, cols)
            if domain_eval:
                results[domain] = domain_eval

        return results

    @classmethod
    def _evaluate_single_domain(
        cls,
        row: pd.Series,
        domain_name: str,
        associated_cols: List[str]
    ) -> Optional[Dict[str, Any]]:
        score = None
        correct = None
        wrong = None
        total_questions = None
        percentage = None

        for col in associated_cols:
            val = row.get(col)
            if pd.isna(val) or val == '' or str(val).strip().lower() in ['nan', 'none', '-', 'data not available']:
                continue

            try:
                num_val = float(str(val).replace('%', '').strip())
            except (ValueError, TypeError):
                continue

            col_lower = col.lower()

            if any(k in col_lower for k in ['correct', 'right']):
                correct = int(num_val)
            elif any(k in col_lower for k in ['wrong', 'incorrect']):
                wrong = int(num_val)
            elif any(k in col_lower for k in ['total', 'max', 'questions']):
                total_questions = int(num_val)
            elif any(k in col_lower for k in ['pct', 'percentage', 'accuracy']):
                percentage = round(num_val, 2)
            elif any(k in col_lower for k in ['score', 'marks', 'result']):
                score = round(num_val, 2)
            else:
                # Direct domain name column with numeric value (e.g. 'Python': 85.0)
                if num_val > 10.0 or '%' in str(val):
                    percentage = round(num_val, 2)
                    score = round(num_val, 2)
                else:
                    score = round(num_val, 2)

        # Count Reconciliation Matrix
        if correct is not None and wrong is not None:
            calc_total = correct + wrong
            if total_questions is None:
                total_questions = calc_total
            if total_questions > 0 and percentage is None:
                percentage = round((correct / total_questions) * 100, 2)
            if score is None:
                score = float(correct)

        if score is not None:
            if total_questions is None:
                total_questions = 10 if score <= 10 else (100 if score <= 100 else int(score))
            if percentage is None and total_questions > 0:
                percentage = round((score / total_questions) * 100, 2)
            if correct is None and total_questions > 0:
                correct = int(round((percentage / 100.0) * total_questions))
            if wrong is None and total_questions is not None and correct is not None:
                wrong = max(total_questions - correct, 0)

        if percentage is not None and (correct is None or total_questions is None):
            total_questions = 10
            correct = int(round((percentage / 100.0) * 10))
            wrong = total_questions - correct
            if score is None:
                score = float(correct)

        if percentage is None and score is None and correct is None:
            return None

        pct_val = percentage if percentage is not None else 0.0

        if pct_val >= 85:
            tier = 'Advanced / Product Ready'
            status = 'Strong Area'
        elif pct_val >= 70:
            tier = 'Proficient / Placement Ready'
            status = 'Competent'
        elif pct_val >= 50:
            tier = 'Developing'
            status = 'Moderate Gap'
        else:
            tier = 'Needs Significant Development'
            status = 'Critical Gap'

        return {
            'domain': domain_name,
            'status': 'Evaluated',
            'score': score if score is not None else correct,
            'correct': correct if correct is not None else 0,
            'wrong': wrong if wrong is not None else 0,
            'total_questions': total_questions if total_questions is not None else 10,
            'percentage': pct_val,
            'proficiency_tier': tier,
            'competency_status': status
        }
