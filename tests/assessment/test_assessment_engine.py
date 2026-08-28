import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from engines.assessment_questions import CareerFitAssessmentEngine

def test_twenty_questions_integrity():
    questions = CareerFitAssessmentEngine.get_all_questions()
    assert len(questions) == 20, f"Expected exactly 20 questions, got {len(questions)}"
    for q in questions:
        assert "id" in q
        assert ("scenario" in q or "question" in q)
        assert "dimension" in q
        assert len(q["options"]) == 4
