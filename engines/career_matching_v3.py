from typing import Dict, Any, List, Optional
from engines.career_universe import CareerUniverse
from services.scoring_normalization import normalize_competency_percentage

class CareerMatchingEngineV3:
    """
    Evidence-Aware Multi-Track Career Intelligence Engine (Report Engine 3.0).
    Evaluates candidates across the comprehensive 45+ Career Universe (Tech, Non-Tech, Cross-Domain).
    Separates Match / Suitability Score from Evidence Confidence.
    Excludes unassessed competencies from fit calculation without penalizing with zeros.
    """

    DEPARTMENT_ALIGNMENTS = {
        "CSE": ["Software Development Engineer", "Backend Engineer", "Full Stack Developer", "Data Engineer", "Systems Engineer", "Cloud / DevOps Engineer"],
        "CS": ["Software Development Engineer", "Backend Engineer", "Full Stack Developer", "Data Engineer", "Systems Engineer", "Cloud / DevOps Engineer"],
        "ISE": ["Cloud / DevOps Engineer", "Database Administrator", "Cybersecurity Analyst", "Data Engineer", "Backend Engineer", "Systems Engineer"],
        "IS": ["Cloud / DevOps Engineer", "Database Administrator", "Cybersecurity Analyst", "Data Engineer", "Backend Engineer", "Systems Engineer"],
        "IT": ["Cloud / DevOps Engineer", "Database Administrator", "Cybersecurity Analyst", "Data Engineer", "Backend Engineer", "Systems Engineer"],
        "AIML": ["AI / GenAI Engineer", "Machine Learning Engineer", "Data Analyst", "Data Engineer", "Product Analyst"],
        "AI": ["AI / GenAI Engineer", "Machine Learning Engineer", "Data Analyst", "Data Engineer", "Product Analyst"],
        "ECE": ["Embedded / IoT Systems Engineer", "Systems Engineer", "Automation Engineer", "Network Engineer", "QA / Automation Engineer"],
        "EC": ["Embedded / IoT Systems Engineer", "Systems Engineer", "Automation Engineer", "Network Engineer", "QA / Automation Engineer"],
        "EEE": ["Embedded / IoT Systems Engineer", "Systems Engineer", "Automation Engineer", "Operations Analyst", "Process Excellence Analyst"],
        "EE": ["Embedded / IoT Systems Engineer", "Systems Engineer", "Automation Engineer", "Operations Analyst", "Process Excellence Analyst"],
        "MECHANICAL": ["Process Excellence Analyst", "Operations Analyst", "Quality Operations Associate", "Supply Chain Analyst", "Automation Engineer", "Project Coordinator"],
        "MECH": ["Process Excellence Analyst", "Operations Analyst", "Quality Operations Associate", "Supply Chain Analyst", "Automation Engineer", "Project Coordinator"],
        "ME": ["Process Excellence Analyst", "Operations Analyst", "Quality Operations Associate", "Supply Chain Analyst", "Automation Engineer", "Project Coordinator"],
        "CIVIL": ["Project Coordinator", "Project Management Associate", "Operations Analyst", "Consulting Analyst", "Quality Operations Associate", "Program Coordinator"],
        "CV": ["Project Coordinator", "Project Management Associate", "Operations Analyst", "Consulting Analyst", "Quality Operations Associate", "Program Coordinator"],
        "MANAGEMENT": ["Management Trainee", "Business Analyst", "Product Operations Specialist", "Project Management Associate", "Consulting Analyst"],
        "MBA": ["Management Trainee", "Business Analyst", "Product Operations Specialist", "Project Management Associate", "Consulting Analyst"],
        "BBA": ["Business Development Associate", "Management Trainee", "Customer Success Associate", "Project Coordinator"],
        "MCA": ["Software Development Engineer", "Full Stack Developer", "Backend Engineer", "Data Analyst", "Database Administrator"],
        "BCA": ["Application Support Engineer", "Full Stack Developer", "QA / Automation Engineer", "Data Analyst", "Frontend Engineer"]
    }

    @classmethod
    def evaluate_candidate(cls, candidate_eval: Dict[str, Any], department: str = "CSE", cgpa: Optional[float] = None, evidence_pack: Optional[Any] = None) -> Dict[str, Any]:
        return cls.match_candidate_careers(candidate_eval, department=department, cgpa=cgpa, evidence_pack=evidence_pack)

    @classmethod
    def match_candidate_careers(
        cls,
        candidate_eval: Dict[str, Any],
        department: str = "CSE",
        cgpa: Optional[float] = None,
        evidence_pack: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Calculates multi-track career fit across all 45+ roles in CareerUniverse.
        """
        # Extract candidate competency vector (from both standard and dynamic evaluations)
        candidate_competencies = {}
        for cname, cdata in candidate_eval.get("competencies", {}).items():
            pct = cdata.get("percentage")
            status = cdata.get("status", "NOT_EVALUATED")
            if pct is not None and status == "MEASURED":
                try:
                    num_pct = float(str(pct).replace('%', ''))
                    candidate_competencies[cname] = num_pct
                except (ValueError, TypeError):
                    pass

        # Also extract direct domain scores if present (e.g. AIML, Python, Aptitude)
        for dname, ddata in candidate_eval.get("domains", {}).items():
            pct = ddata.get("percentage")
            status = ddata.get("status", "NOT_EVALUATED")
            if pct is not None and status == "MEASURED":
                try:
                    candidate_competencies[dname] = float(str(pct).replace('%', ''))
                except (ValueError, TypeError):
                    pass

        if not candidate_competencies:
            # Also check evidence_pack if passed
            if evidence_pack:
                if hasattr(evidence_pack, "technical_evidence") and evidence_pack.technical_evidence:
                    for tname, tdata in evidence_pack.technical_evidence.items():
                        if isinstance(tdata, dict) and tdata.get("percentage") is not None:
                            try:
                                candidate_competencies[tname] = float(tdata["percentage"])
                            except Exception:
                                pass
                if hasattr(evidence_pack, "analytical_component") and evidence_pack.analytical_component:
                    try:
                        candidate_competencies["Analytical Thinking & Aptitude"] = float(evidence_pack.analytical_component.get("percentage", 0))
                    except Exception:
                        pass
                if hasattr(evidence_pack, "psychometric_evidence") and evidence_pack.psychometric_evidence:
                    for pname, pdata in evidence_pack.psychometric_evidence.get("competencies", {}).items():
                        if isinstance(pdata, dict) and pdata.get("percentage") is not None:
                            try:
                                candidate_competencies[pname] = float(pdata["percentage"])
                            except Exception:
                                pass

        if not candidate_competencies:
            insufficient_role = cls._insufficient_evidence_role(department)
            return {
                "primary_target": insufficient_role,
                "top_5_roles": [insufficient_role],
                "top_10_roles": [insufficient_role],
                "strong_alternatives": [],
                "emerging_careers": [],
                "careers_to_defer": [],
                "all_evaluated_roles": [],
                "overall_index": 200,
                "verdict": "INSUFFICIENT_EVIDENCE",
                "confidence_tier": "INSUFFICIENT",
                "total_roles_evaluated": 0,
                "tech_role_count": 0,
                "non_tech_role_count": 0,
                "cross_domain_role_count": 0
            }

        evaluated_roles = []
        all_profiles = CareerUniverse.get_all_roles()

        for profile in all_profiles:
            role_eval = cls._evaluate_single_role(
                profile=profile,
                candidate_competencies=candidate_competencies,
                department=department,
                cgpa=cgpa
            )
            evaluated_roles.append(role_eval)

        # Sort evaluated roles by match score descending, then by confidence weight and department affinity
        confidence_rank = {"HIGH": 3, "MEDIUM": 2, "LOW": 1, "INSUFFICIENT": 0, "PROVISIONAL": 1}
        dept_clean = (department or "").upper().replace("&", "").replace(" ", "").replace("_", "")
        dept_roles = []
        if dept_clean in cls.DEPARTMENT_ALIGNMENTS:
            dept_roles = cls.DEPARTMENT_ALIGNMENTS[dept_clean]
        else:
            for k in sorted(cls.DEPARTMENT_ALIGNMENTS.keys(), key=len, reverse=True):
                if k == dept_clean or (len(k) >= 3 and k in dept_clean):
                    dept_roles = cls.DEPARTMENT_ALIGNMENTS[k]
                    break

        def compute_sort_score(r):
            dept_bonus = 2.0 if r["role"] in dept_roles[:3] else (1.0 if r["role"] in dept_roles else 0.0)
            return (
                r["fit_score"] + dept_bonus,
                confidence_rank.get(r["confidence_level"], 0),
                r.get("coverage_ratio", 0.0),
                r.get("measured_requirements_count", 0)
            )
        
        # High/Medium confidence roles eligible for Best Fit & Alternatives
        viable_roles = [r for r in evaluated_roles if r["confidence_level"] in ["HIGH", "MEDIUM", "PROVISIONAL"] and r["measured_requirements_count"] > 0]
        deferred_roles = [r for r in evaluated_roles if r not in viable_roles or r["confidence_level"] == "LOW" or len(r["missing_evidence"]) >= 3]

        if viable_roles:
            viable_roles.sort(key=compute_sort_score, reverse=True)
            primary_target = viable_roles[0]
            strong_alternatives = viable_roles[1:5]
        else:
            # Fallback to highest scoring role with Provisional notice
            evaluated_roles.sort(key=compute_sort_score, reverse=True)
            primary_target = evaluated_roles[0] if evaluated_roles else cls._insufficient_evidence_role(department)
            strong_alternatives = evaluated_roles[1:5] if len(evaluated_roles) > 1 else []

        # Emerging Careers (different category from primary target with high potential)
        other_cat_roles = [r for r in evaluated_roles if r["category"] != primary_target.get("category") and r != primary_target and r not in strong_alternatives]
        other_cat_roles.sort(key=lambda x: x["fit_score"], reverse=True)
        emerging_careers = other_cat_roles[:3]

        # Deferred / Caution Roles (Missing critical prerequisites)
        deferred_roles.sort(key=lambda x: len(x["missing_evidence"]), reverse=True)
        careers_to_defer = deferred_roles[:3]

        # Dual institutional classification
        overall_index = primary_target["careerfit_index"]
        if primary_target["confidence_level"] == "HIGH" and primary_target["fit_score"] >= 75.0:
            verdict = "VERIFIED_PLACEMENT_READY"
        elif primary_target["fit_score"] >= 65.0:
            verdict = "PROVISIONAL_PLACEMENT_READY"
        elif primary_target["fit_score"] >= 50.0:
            verdict = "DEVELOPING_POTENTIAL"
        else:
            verdict = "NEEDS_DEVELOPMENT"

        return {
            "primary_target": primary_target,
            "top_5_roles": [primary_target] + strong_alternatives[:4],
            "top_10_roles": [primary_target] + strong_alternatives[:4] + emerging_careers[:3] + careers_to_defer[:2],
            "strong_alternatives": strong_alternatives,
            "emerging_careers": emerging_careers,
            "careers_to_defer": careers_to_defer,
            "all_evaluated_roles": evaluated_roles,
            "overall_index": overall_index,
            "verdict": verdict,
            "confidence_tier": primary_target["confidence_level"],
            "total_roles_evaluated": len(evaluated_roles),
            "tech_role_count": sum(1 for r in evaluated_roles if r["category"] == "TECH"),
            "non_tech_role_count": sum(1 for r in evaluated_roles if r["category"] == "NON_TECH"),
            "cross_domain_role_count": sum(1 for r in evaluated_roles if r["category"] == "CROSS_DOMAIN")
        }

    @classmethod
    def _evaluate_single_role(
        cls,
        profile: Dict[str, Any],
        candidate_competencies: Dict[str, float],
        department: str,
        cgpa: Optional[float]
    ) -> Dict[str, Any]:
        reqs = profile["requirements"]
        total_req_count = len(reqs)
        
        measured_score_sum = 0.0
        measured_weight_sum = 0.0
        supporting_evidence = []
        missing_evidence = []
        contributing_question_ids = []

        for req_name, weight in reqs.items():
            matched_score = None
            
            # Exact match check
            if req_name in candidate_competencies:
                matched_score = candidate_competencies[req_name]
            else:
                # Fuzzy keyword match
                req_lower = req_name.lower()
                for cname, score in candidate_competencies.items():
                    c_lower = cname.lower()
                    if req_lower in c_lower or (("analytical" in req_lower or "problem" in req_lower) and ("analytical" in c_lower or "aptitude" in c_lower)):
                        matched_score = score
                        break
                    elif ("sql" in req_lower or "database" in req_lower) and "sql" in c_lower:
                        matched_score = score
                        break
                    elif "python" in req_lower and "python" in c_lower:
                        matched_score = score
                        break
                    elif ("aiml" in req_lower or "ai" in req_lower or "machine learning" in req_lower) and ("aiml" in c_lower or "ai" in c_lower):
                        matched_score = score
                        break

            if matched_score is not None:
                measured_score_sum += matched_score * weight
                measured_weight_sum += weight
                supporting_evidence.append(f"{req_name} ({matched_score:.1f}%)")
            else:
                missing_evidence.append(f"{req_name} (Not Evaluated in current assessment)")

        measured_req_count = len(supporting_evidence)
        coverage_ratio = measured_weight_sum if total_req_count > 0 else 0.0

        if measured_weight_sum > 0:
            # Dynamic Normalization (Zero fabrication: Missing competencies do NOT reduce percentage to 0)
            raw_fit = measured_score_sum / measured_weight_sum
            fit_score = round(max(0.0, min(100.0, raw_fit)), 1)
        else:
            # Baseline foundational estimate if zero direct competencies measured
            fit_score = 70.0 if cgpa and cgpa >= 8.0 else 60.0

        # Determine Evidence Confidence Level
        if coverage_ratio >= 0.70 and measured_req_count >= 3:
            confidence_level = "HIGH"
            confidence_reason = f"Comprehensive assessment evidence available ({measured_req_count}/{total_req_count} competency dimensions measured)."
        elif coverage_ratio >= 0.35 or measured_req_count >= 1:
            confidence_level = "MEDIUM"
            confidence_reason = f"Partial assessment evidence recorded ({measured_req_count}/{total_req_count} dimensions measured). Complete target domain module to verify."
        else:
            confidence_level = "LOW"
            confidence_reason = f"Limited direct assessment evidence ({measured_req_count}/{total_req_count} dimensions measured)."

        # CareerFit Index calculation: 200 + (fit / 100) * 600
        careerfit_index = int(200 + (fit_score / 100.0) * 600)

        # Structured Explanations
        strengths = [s for s in supporting_evidence if float(s.split('(')[1].replace('%)', '')) >= 75.0]
        if not strengths and supporting_evidence:
            strengths = supporting_evidence[:2]
        elif not strengths:
            strengths = ["Academic analytical baseline."]

        limitations = [f"Direct {m.split('(')[0].strip()} assessment has not yet been administered." for m in missing_evidence[:2]]
        if not limitations:
            limitations = ["Timed technical execution under live enterprise interview constraints."]

        why_text = f"The candidate demonstrated {fit_score}% alignment across measured dimensions including {', '.join(supporting_evidence[:2]) if supporting_evidence else 'foundational reasoning'}."
        impact_text = f"Directly prepares candidate for entry-level {profile['title']} roles by leveraging verified analytical strengths."
        rank_reason = f"Ranks prominently due to strong consistency in {strengths[0] if strengths else 'core reasoning'} with {confidence_level.lower()} confidence."
        improve_text = f"Completing {profile['next_assessment']} will provide definitive proof and can raise match rating above 90%."

        return {
            "role": profile["title"],
            "title": profile["title"],
            "category": profile["category"],
            "fit_score": fit_score,
            "match_score": fit_score,
            "confidence": confidence_level,
            "confidence_level": confidence_level,
            "confidence_reason": confidence_reason,
            "careerfit_index": careerfit_index,
            "description": profile["description"],
            "supporting_evidence": supporting_evidence,
            "missing_evidence": missing_evidence,
            "measured_requirements_count": measured_req_count,
            "total_requirements_count": total_req_count,
            "coverage_ratio": coverage_ratio,
            "coverage_percentage": round(coverage_ratio * 100.0, 1),
            "strengths": strengths,
            "limitations": limitations,
            "why_this_career": why_text,
            "why_this_role": why_text,
            "hard_skills": ", ".join(profile.get("skills", ["Core Engineering", "Problem Solving"])),
            "career_impact": impact_text,
            "rank_reason": rank_reason,
            "what_could_improve": improve_text,
            "recommended_next_assessment": profile["next_assessment"],
            "recommended_skills": profile["skills"],
            "recommended_projects": profile["projects"]
        }

    @classmethod
    def _insufficient_evidence_role(cls, department: str = "Engineering") -> Dict[str, Any]:
        return {
            "role": "Insufficient Evidence",
            "title": "Insufficient Evidence",
            "category": "UNASSESSED",
            "fit_score": 0.0,
            "match_score": 0.0,
            "confidence": "INSUFFICIENT",
            "confidence_level": "INSUFFICIENT",
            "confidence_reason": "No assessment items or verified competency evidence recorded.",
            "careerfit_index": 200,
            "description": "Evaluation requires completing the diagnostic assessment.",
            "supporting_evidence": [],
            "missing_evidence": ["Assessment responses required"],
            "measured_requirements_count": 0,
            "total_requirements_count": 5,
            "coverage_percentage": 0.0,
            "strengths": ["Pending assessment completion"],
            "limitations": ["No assessment responses recorded"],
            "why_this_career": "Awaiting candidate response data.",
            "why_this_role": "Awaiting candidate response data.",
            "career_impact": "Complete assessment to generate personalized career trajectory.",
            "rank_reason": "Unassessed profile.",
            "what_could_improve": "Complete the institutional diagnostic assessment.",
            "recommended_next_assessment": "Genesis CareerFit Baseline Diagnostic",
            "recommended_skills": ["Foundational Problem Solving"],
            "recommended_projects": ["Introductory skill benchmarks"]
        }

    # Backward compatibility alias
    _fallback_role = _insufficient_evidence_role
