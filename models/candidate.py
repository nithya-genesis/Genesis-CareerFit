import re
from typing import Dict, Any, Optional

class Candidate:
    """
    Standardized Candidate Entity supporting normalized keys and robust matching.
    """
    def __init__(
        self,
        candidate_name: str,
        usn: Optional[str] = None,
        email: Optional[str] = None,
        college: Optional[str] = None,
        department: Optional[str] = None,
        cgpa: Optional[str] = None
    ):
        self.candidate_name = (candidate_name or "").strip()
        self.usn = (usn or "Data Not Available").strip()
        self.email = (email or "Data Not Available").strip()
        self.college = (college or "Data Not Available").strip()
        self.department = (department or "Data Not Available").strip()
        self.cgpa = (cgpa or "Data Not Available").strip()

    @property
    def normalized_name(self) -> str:
        clean = re.sub(r'[^a-zA-Z0-9]', '', self.candidate_name).lower()
        return clean

    @property
    def normalized_usn(self) -> str:
        if self.usn in ["Data Not Available", "BLANK / NOT AVAILABLE", "-", "", "None"]:
            return ""
        return re.sub(r'[^a-zA-Z0-9]', '', self.usn).upper()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "candidate_name": self.candidate_name,
            "usn": self.usn,
            "email": self.email,
            "college": self.college,
            "department": self.department,
            "cgpa": self.cgpa
        }
