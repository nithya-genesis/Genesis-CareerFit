from typing import Dict, Any, Optional

class AssessmentDefinition:
    """
    Standardized schema for assessment domains, questions, and scoring rules.
    """
    def __init__(
        self,
        assessment_id: str,
        display_name: str,
        domain: str,
        total_questions: int,
        max_score: float,
        scoring_method: str = "DETERMINISTIC"
    ):
        self.assessment_id = assessment_id
        self.display_name = display_name
        self.domain = domain
        self.total_questions = total_questions
        self.max_score = max_score
        self.scoring_method = scoring_method

    def to_dict(self) -> Dict[str, Any]:
        return {
            "assessment_id": self.assessment_id,
            "display_name": self.display_name,
            "domain": self.domain,
            "total_questions": self.total_questions,
            "max_score": self.max_score,
            "scoring_method": self.scoring_method
        }
