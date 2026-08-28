import re
import pandas as pd
from typing import Dict, Any, List
from engines.psychometric_engine import PsychometricEngine

class ScoringEngine:
    """
    Deterministic Assessment Scoring Engine.
    Executes 100% zero-AI deterministic scoring:
    - Psychometric: 60 questions, 19 competencies, Employability Index & Behavioral Dimensions
    - Multi-Domain Technical: AIML, Python, SQL, Coding, ECE, EEE, IoT, Aptitude, etc.
    - Tracks correct, wrong, skipped, total questions, score, and accuracy percentage.
    """

    @staticmethod
    def calculate_psychometric_score(student_row: pd.Series, psychometric_schema: Dict[str, Any]) -> Dict[str, Any]:
        return PsychometricEngine.evaluate_psychometric_profile(student_row, psychometric_schema)

    @staticmethod
    def evaluate_row_assessments(
        row: pd.Series,
        potential_assessment_cols: List[str],
        psych_schema: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        results = {}

        # 1. Check for SJT psychometric question columns (Q1..Q60)
        has_questions = any(re.match(r"^Q\d+$", str(c).strip(), re.I) for c in row.index if pd.notna(row.get(c)))
        if has_questions and psych_schema:
            results["Psychometric"] = ScoringEngine.calculate_psychometric_score(row, psych_schema)

        # 2. Universal Multi-Domain Technical & Aptitude Grouping
        domain_groups: Dict[str, Dict[str, float]] = {}

        for col in potential_assessment_cols:
            col_str = str(col).strip()
            match = re.match(r"^([A-Za-z0-9_]+(?:\s+[A-Za-z0-9_]+)?)\s*[-_]?\s*(score|correct|wrong|skipped|total|marks|percent|accuracy)?", col_str, re.I)
            raw_domain = match.group(1).upper() if match else col_str.upper()
            metric_type = match.group(2).lower() if (match and match.group(2)) else "score"

            domain_name = re.sub(r"[_\-\s]+(SCORE|CORRECT|WRONG|SKIPPED|TOTAL|MARKS|PERCENT|ACCURACY)$", "", raw_domain).strip()
            if not domain_name:
                domain_name = "TECHNICAL"

            if domain_name not in domain_groups:
                domain_groups[domain_name] = {"score": None, "correct": None, "wrong": None, "skipped": 0.0, "total": None}

            val = row.get(col)
            try:
                numeric_val = float(val) if pd.notna(val) and str(val).strip() not in ["-", "", "None", "nan"] else 0.0
            except (ValueError, TypeError):
                numeric_val = 0.0

            if "correct" in metric_type:
                domain_groups[domain_name]["correct"] = numeric_val
            elif "wrong" in metric_type:
                domain_groups[domain_name]["wrong"] = numeric_val
            elif "skipped" in metric_type:
                domain_groups[domain_name]["skipped"] = numeric_val
            elif "total" in metric_type:
                domain_groups[domain_name]["total"] = numeric_val
            else:
                domain_groups[domain_name]["score"] = numeric_val

        for domain, d_data in domain_groups.items():
            score = d_data["score"] if d_data["score"] is not None else (d_data["correct"] if d_data["correct"] is not None else 0.0)
            correct = d_data["correct"] if d_data["correct"] is not None else score
            wrong = d_data["wrong"] if d_data["wrong"] is not None else 0.0
            skipped = d_data.get("skipped", 0.0)
            
            if d_data["total"] is not None and d_data["total"] > 0:
                total_questions = d_data["total"]
            elif (correct + wrong + skipped) > 0:
                total_questions = correct + wrong + skipped
            else:
                total_questions = max(score, 10.0)

            percentage = round((score / total_questions) * 100, 2) if total_questions > 0 else 0.0

            results[domain] = {
                "status": "Evaluated",
                "score": score,
                "max_score": total_questions,
                "correct": correct,
                "wrong": wrong,
                "skipped": skipped,
                "total_questions": total_questions,
                "percentage": percentage
            }

        return results
