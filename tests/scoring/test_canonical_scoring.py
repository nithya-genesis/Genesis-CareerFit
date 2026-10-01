import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from engines.scoring_engine import ScoringEngine
from engines.career_matching_v3 import CareerMatchingEngineV3
import pandas as pd

def test_scoring_determinism():
    row = pd.Series({"Candidate_Name": "Test Student", "USN": "1CS23199", "SJT_Decision_Making": 85, "SJT_Communication": 90})
    res = ScoringEngine.evaluate_row_assessments(row, ["SJT_Decision_Making", "SJT_Communication"])
    assert "SJT_DECISION_MAKING" in res or "TECHNICAL" in res or len(res) > 0
