import re
from typing import Dict, Any, List, Optional
import pandas as pd
from config.assessments.registry import AssessmentRegistry
from services.scoring_normalization import (
    normalize_competency_percentage,
    get_competency_rating,
    RATING_SCALE
)

class PsychometricEngine:
    """
    Deterministic 19-Competency Psychometric & Situational Judgment Test (SJT) Engine.
    Guarantees:
    - Zero scores > 100.0%
    - 60-Question scoring matrix (A=3, B=2, C=1; Range: 60 - 180)
    - 19 standard competency sub-scores
    - Deterministic percentage and proficiency tier calculations
    - Clean handling of missing or incomplete response matrices
    """

    OPTION_MAP = {
        'A': 3, 'a': 3, '1': 1, 1: 1, 1.0: 1,
        'B': 2, 'b': 2, '2': 2, 2: 2, 2.0: 2,
        'C': 1, 'c': 1, '3': 3, 3: 3, 3.0: 3
    }

    RATING_SCALE = RATING_SCALE

    @classmethod
    def evaluate_psychometric_responses(
        cls,
        candidate_row: pd.Series,
        question_columns: List[str],
        registry_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        if not registry_config:
            reg = AssessmentRegistry()
            registry_config = reg.get_assessment('PSYCHOMETRIC_SJT_V1')

        competencies_cfg = registry_config.get('competencies', {})
        total_max_score = registry_config.get('max_score', 180)

        # Extract answered questions safely
        responses = {}
        for q_col in question_columns:
            val = candidate_row.get(q_col)
            if pd.isna(val) or str(val).strip() in ['', 'NaN', 'nan', 'None', '-', 'null']:
                continue
            
            clean_val = str(val).strip()
            score_val = cls.OPTION_MAP.get(clean_val)
            if score_val is None:
                try:
                    num_val = float(clean_val)
                    # For SJT 3-point scale, clamp integer options to [1, 3]
                    if 1.0 <= num_val <= 3.0:
                        score_val = int(num_val)
                    elif num_val > 3.0 and num_val <= 5.0:
                        # Likert scale 1-5 mapped to 1-3
                        score_val = int(round(1.0 + (num_val - 1.0) * (2.0 / 4.0)))
                    elif num_val > 5.0:
                        # If raw percentage given for a question, clamp to 1-3 points
                        score_val = int(round(1.0 + (min(100.0, num_val) / 100.0) * 2.0))
                    else:
                        score_val = 1
                except (ValueError, TypeError):
                    score_val = None

            if score_val is not None:
                # Ensure clamped to valid 1-3 scale
                score_val = max(1, min(3, score_val))
                match = re.search(r'\d+', q_col)
                q_num = match.group(0) if match else q_col
                q_key = f'Q{q_num}'
                responses[q_key] = score_val

        if not responses:
            return {
                'status': 'Not Evaluated',
                'overall_score': None,
                'max_score': total_max_score,
                'percentage': None,
                'rating': 'Not Evaluated',
                'competencies': {}
            }

        total_obtained = sum(responses.values())
        actual_max = len(responses) * 3
        overall_pct = normalize_competency_percentage(total_obtained, actual_max)

        # Evaluate individual 19 competencies
        competency_results = {}
        for comp_name, comp_info in competencies_cfg.items():
            comp_questions = comp_info.get('questions', [])
            total_items = len(comp_questions)
            full_schema_max = comp_info.get('max_score', total_items * 3)

            comp_scores = [responses[q] for q in comp_questions if q in responses]
            answered_items = len(comp_scores)
            
            if comp_scores:
                comp_total = sum(comp_scores)
                # Denominator strictly uses questions actually answered for this competency
                comp_max = answered_items * 3
                comp_pct = normalize_competency_percentage(comp_total, comp_max)
                rating, desc, status = get_competency_rating(comp_pct)
                competency_results[comp_name] = {
                    'score': comp_total,
                    'max_score': comp_max,
                    'percentage': comp_pct,
                    'rating': rating,
                    'implication': desc,
                    'measures': comp_info.get('measures', 'Behavioral Tendency'),
                    'answered_items': answered_items,
                    'total_items': total_items,
                    'audit_note': f"Evaluated on {answered_items} available items out of {total_items}" if answered_items < total_items else "Fully evaluated",
                    'status': 'MEASURED'
                }
            else:
                competency_results[comp_name] = {
                    'score': None,
                    'max_score': full_schema_max,
                    'percentage': None,
                    'rating': 'Not Evaluated',
                    'implication': 'No response data available for this dimension.',
                    'measures': comp_info.get('measures', 'Behavioral Tendency'),
                    'answered_items': 0,
                    'total_items': total_items,
                    'status': 'NOT_EVALUATED'
                }

        overall_rating, overall_desc, _ = get_competency_rating(overall_pct)

        return {
            'status': 'Evaluated',
            'overall_score': total_obtained,
            'max_score': actual_max,
            'percentage': overall_pct,
            'rating': overall_rating,
            'answered_count': len(responses),
            'competencies': competency_results
        }

    @classmethod
    def _get_rating_tier(cls, percentage: float) -> tuple:
        rating, desc, _ = get_competency_rating(percentage)
        return rating, desc
