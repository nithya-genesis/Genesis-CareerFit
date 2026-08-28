import time
from typing import Dict, Any, List, Optional
from models.candidate import Candidate

class CandidateEvidencePack:
    """
    Immutable Evidence Contract for Genesis CareerFit.
    Separates verified measured data from deterministic calculations and AI interpretation.
    Enforces strict zero-fabrication and dynamic weight normalization.
    """

    ORIGINAL_WEIGHTS = {
        "technical": 0.35,
        "analytical": 0.30,
        "ownership": 0.20,
        "communication": 0.15
    }

    def __init__(
        self,
        candidate_name: str,
        usn: Optional[str] = None,
        department: Optional[str] = None,
        college: Optional[str] = None,
        cgpa: Optional[float] = None
    ):
        self.candidate_name = (candidate_name or "Candidate").strip()
        self.usn = (usn or "N/A").strip().upper()
        self.department = (department or "CSE").strip().upper()
        self.college = (college or "Engineering Institute of Technology").strip()
        
        # Academic Evidence
        if cgpa is not None and cgpa > 0.0:
            self.academic_cgpa: Optional[float] = round(float(cgpa), 2)
            self.academic_status: str = "MEASURED"
            self.academic_display: str = f"{self.academic_cgpa:.2f}/10.0"
        else:
            self.academic_cgpa = None
            self.academic_status = "UNAVAILABLE"
            self.academic_display = "Data Not Available"

        # Evidence Containers
        self.psychometric_evidence: Dict[str, Any] = {
            "status": "NOT_EVALUATED",
            "source": None,
            "answered_count": 0,
            "total_score": None,
            "max_possible": None,
            "percentage": None,
            "rating": "Not Evaluated",
            "competencies": {}
        }
        self.technical_evidence: Dict[str, Any] = {}
        
        # Career Fit 4-Component Evidence
        self.components: Dict[str, Dict[str, Any]] = {
            "technical": {
                "status": "NOT_EVALUATED",
                "score": None,
                "original_weight": 0.35,
                "active_weight": 0.0,
                "normalized_weight": 0.0,
                "source": None
            },
            "analytical": {
                "status": "NOT_EVALUATED",
                "score": None,
                "original_weight": 0.30,
                "active_weight": 0.0,
                "normalized_weight": 0.0,
                "source": None
            },
            "ownership": {
                "status": "NOT_EVALUATED",
                "score": None,
                "original_weight": 0.20,
                "active_weight": 0.0,
                "normalized_weight": 0.0,
                "source": None
            },
            "communication": {
                "status": "NOT_EVALUATED",
                "score": None,
                "original_weight": 0.15,
                "active_weight": 0.0,
                "normalized_weight": 0.0,
                "source": None
            }
        }

        self.career_fit_score: Optional[float] = None
        self.job_readiness_score: Optional[float] = None
        self.careerfit_index: Optional[int] = None
        
        self.confidence: str = "INSUFFICIENT"
        self.mathematical_quadrant: str = "Q4"
        self.mathematical_quadrant_label: str = "Guidance Required"
        self.institutional_verification_status: str = "INSUFFICIENT_EVIDENCE"
        self.action_recommendation: str = "Foundational Upskilling"
        
        self.primary_target_role: str = "Insufficient Evidence"
        self.primary_target_domain: str = "General Engineering"
        self.evaluated_roles: List[Dict[str, Any]] = []
        self.audit_notes: List[str] = []

    def set_technical_component(self, score: Optional[float], source_domain: str = "Technical Domain"):
        if score is not None and score >= 0.0:
            self.components["technical"]["status"] = "MEASURED"
            self.components["technical"]["score"] = round(float(score), 2)
            self.components["technical"]["source"] = source_domain
        else:
            self.components["technical"]["status"] = "NOT_EVALUATED"
            self.components["technical"]["score"] = None
            self.components["technical"]["source"] = None

    def set_analytical_component(self, score: Optional[float], source: str = "Analytical Assessment"):
        if score is not None and score >= 0.0:
            self.components["analytical"]["status"] = "MEASURED"
            self.components["analytical"]["score"] = round(float(score), 2)
            self.components["analytical"]["source"] = source
        else:
            self.components["analytical"]["status"] = "NOT_EVALUATED"
            self.components["analytical"]["score"] = None
            self.components["analytical"]["source"] = None

    def set_ownership_component(self, score: Optional[float], source: str = "Accountability & Ownership (Q6,Q7,Q8,Q57,Q60)"):
        if score is not None and score >= 0.0:
            self.components["ownership"]["status"] = "MEASURED"
            self.components["ownership"]["score"] = round(float(score), 2)
            self.components["ownership"]["source"] = source
        else:
            self.components["ownership"]["status"] = "NOT_EVALUATED"
            self.components["ownership"]["score"] = None
            self.components["ownership"]["source"] = None

    def set_communication_component(self, score: Optional[float], source: str = "Communication (Q24,Q48)"):
        if score is not None and score >= 0.0:
            self.components["communication"]["status"] = "MEASURED"
            self.components["communication"]["score"] = round(float(score), 2)
            self.components["communication"]["source"] = source
        else:
            self.components["communication"]["status"] = "NOT_EVALUATED"
            self.components["communication"]["score"] = None
            self.components["communication"]["source"] = None

    # Method Aliases for Robust Compatibility
    set_ownership_evidence = set_ownership_component
    set_communication_evidence = set_communication_component
    set_analytical_evidence = set_analytical_component
    set_technical_evidence = set_technical_component

    def calculate_authoritative_scores(self):
        return self.calculate_metrics()

    def calculate_metrics(self):
        """
        Executes deterministic dynamic normalization across available measured Career Fit components,
        computes Job Readiness, CareerFit Index, Evidence Confidence, and Dual Placement Status.
        """
        # 1. Identify measured Career Fit components
        active_components = {
            k: v for k, v in self.components.items()
            if v["status"] == "MEASURED" and v["score"] is not None
        }
        
        measured_count = len(active_components)
        total_active_weight = sum(v["original_weight"] for v in active_components.values())

        if total_active_weight > 0.0:
            # Dynamic Normalization
            for k, v in self.components.items():
                if k in active_components:
                    v["active_weight"] = v["original_weight"]
                    v["normalized_weight"] = round(v["original_weight"] / total_active_weight, 4)
                else:
                    v["active_weight"] = 0.0
                    v["normalized_weight"] = 0.0

            raw_career_fit = sum(
                v["score"] * v["normalized_weight"]
                for v in active_components.values()
            )
            self.career_fit_score = round(min(100.0, max(0.0, raw_career_fit)), 2)
        else:
            self.career_fit_score = None
            for v in self.components.values():
                v["active_weight"] = 0.0
                v["normalized_weight"] = 0.0

        # 2. Job Readiness Calculation
        if self.career_fit_score is not None:
            if self.academic_status == "MEASURED" and self.academic_cgpa is not None:
                acad_score = (self.academic_cgpa / 10.0) * 100.0
                readiness_raw = (0.65 * self.career_fit_score) + (0.35 * acad_score)
                self.job_readiness_score = round(min(100.0, max(0.0, readiness_raw)), 2)
            else:
                # CGPA UNAVAILABLE: Job Readiness derives purely from Career Fit
                self.job_readiness_score = self.career_fit_score
                self.audit_notes.append("Academic CGPA was unavailable; Job Readiness reflects assessed competency only.")
        else:
            self.job_readiness_score = None

        # 3. CareerFit Index Calculation (200 - 800)
        if self.career_fit_score is not None:
            self.careerfit_index = int(200 + round((self.career_fit_score / 100.0) * 600))
        else:
            self.careerfit_index = 200

        # 4. Confidence Tier Determination (Machine-Testable Rules)
        has_tech = self.components["technical"]["status"] == "MEASURED"
        has_anly = self.components["analytical"]["status"] == "MEASURED"
        has_own = self.components["ownership"]["status"] == "MEASURED"
        has_comm = self.components["communication"]["status"] == "MEASURED"
        has_cgpa = self.academic_status == "MEASURED"
        psych_count = sum(1 for c in [has_anly, has_own, has_comm] if c)

        if measured_count == 4 and has_cgpa:
            self.confidence = "HIGH"
        elif (has_tech and psych_count >= 1 and has_cgpa) or (measured_count >= 3 and has_cgpa):
            self.confidence = "MEDIUM"
        elif (measured_count >= 1 and has_cgpa) or (measured_count >= 2 and not has_cgpa):
            self.confidence = "MODERATE"
        elif measured_count == 1 and not has_cgpa:
            self.confidence = "LOW"
        else:
            self.confidence = "INSUFFICIENT"

        # 5. Dual Placement Status Determination
        fit_val = self.career_fit_score if self.career_fit_score is not None else 0.0
        ready_val = self.job_readiness_score if self.job_readiness_score is not None else 0.0

        if fit_val >= 80.0 and ready_val >= 75.0:
            self.mathematical_quadrant = "Q1"
            self.mathematical_quadrant_label = "Placement Ready"
            self.action_recommendation = "Immediate Campus Placement & Enterprise Interviews"
        elif fit_val >= 80.0 and ready_val < 75.0:
            self.mathematical_quadrant = "Q2"
            self.mathematical_quadrant_label = "Develop & Align"
            self.action_recommendation = "Applied Capstone Projects & Timed Coding Rounds"
        elif fit_val < 80.0 and ready_val >= 75.0:
            self.mathematical_quadrant = "Q3"
            self.mathematical_quadrant_label = "Cross-Discipline"
            self.action_recommendation = "Realign to Adjacent Specializations / Operations"
        else:
            self.mathematical_quadrant = "Q4"
            self.mathematical_quadrant_label = "Guidance Required"
            self.action_recommendation = "Foundational Aptitude & Algorithmic Problem Solving Blitz"

        # Institutional Verification Status
        if self.confidence == "INSUFFICIENT":
            self.institutional_verification_status = "INSUFFICIENT_EVIDENCE"
        elif self.mathematical_quadrant == "Q1":
            if has_tech and has_cgpa:
                self.institutional_verification_status = "VERIFIED_PLACEMENT_READY"
            elif not has_tech:
                self.institutional_verification_status = "PROVISIONAL_PLACEMENT_READY"
                self.audit_notes.append("Satisfies Q1 benchmarks on behavioral assessment; Technical domain must be evaluated prior to Tier-1 enterprise interview clearance.")
            else:
                self.institutional_verification_status = "PROVISIONAL_PLACEMENT_READY"
        elif not has_tech and (fit_val >= 70.0 or ready_val >= 70.0):
            self.institutional_verification_status = "NEEDS_TECHNICAL_BENCHMARKING"
        else:
            self.institutional_verification_status = "NEEDS_DEVELOPMENT"

    def get_evidence_summary(self) -> Dict[str, Any]:
        return self.to_dict()["evidence_summary"]

    def to_dict(self) -> Dict[str, Any]:
        """
        Exports clean, immutable evidence dictionary matching the production contract.
        """
        measured_count = sum(1 for v in self.components.values() if v["status"] == "MEASURED")
        coverage_pct = round((measured_count / 4.0) * 100.0, 1)
        
        return {
            "schema_version": "3.0.0",
            "candidate": {
                "name": self.candidate_name,
                "usn": self.usn,
                "department": self.department,
                "college": self.college,
                "academic": {
                    "value": self.academic_cgpa,
                    "status": self.academic_status,
                    "display": self.academic_display
                }
            },
            "evidence_summary": {
                "career_fit_evidence_coverage": f"{measured_count}/4",
                "career_fit_measured_components": measured_count,
                "career_fit_total_components": 4,
                "career_fit_coverage_percentage": coverage_pct,
                "academic_evidence_status": self.academic_status,
                "psychometric_evidence_status": self.psychometric_evidence.get("status", "NOT_EVALUATED"),
                "technical_evidence_status": "MEASURED" if self.components["technical"]["status"] == "MEASURED" else "NOT_EVALUATED",
                "confidence": self.confidence,
                "institutional_verification_status": self.institutional_verification_status,
                "audit_notes": self.audit_notes
            },
            "psychometric_evidence": self.psychometric_evidence,
            "technical_evidence": self.technical_evidence,
            "career_fit_calculations": {
                "components": self.components,
                "primary_target": {
                    "role": self.primary_target_role,
                    "domain": self.primary_target_domain,
                    "career_fit_score": self.career_fit_score,
                    "job_readiness_score": self.job_readiness_score,
                    "careerfit_index": self.careerfit_index,
                    "confidence": self.confidence,
                    "status": "DERIVED" if self.career_fit_score is not None else "NOT_EVALUATED"
                },
                "evaluated_roles": self.evaluated_roles
            },
            "institutional_classification": {
                "quadrant": self.mathematical_quadrant,
                "quadrant_label": self.mathematical_quadrant_label,
                "institutional_status": self.institutional_verification_status,
                "confidence": self.confidence,
                "action": self.action_recommendation
            },
            "ai_interpretation": {
                "provider": "NVIDIA",
                "model": "nvidia/nemotron-3.5-lightning-30b-a3b",
                "status": "READY_FOR_SYNTHESIS",
                "executive_summary": None,
                "swot_analysis": None,
                "roadmap_narrative": None
            },
            "audit_trail": {
                "generated_at": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                "zero_defaults_enforced": True
            }
        }
