import re
import time
from typing import Dict, Any, List, Optional
import pandas as pd

from models.evidence import CandidateEvidencePack
from engines.psychometric_engine import PsychometricEngine
from engines.technical_engine import TechnicalEngine
from services.question_registry import AssessmentPackage, QuestionRegistry, RunQuestionRegistry
from engines.assessment_package_engine import DynamicAssessmentEvaluator
from engines.career_matching_v3 import CareerMatchingEngineV3
from engines.assessment_questions import CareerFitAssessmentEngine

def build_student_profile(row: dict, idx: int = 0, package: Optional[AssessmentPackage] = None, run_id: Optional[str] = None) -> dict:
    """
    Assessment-Agnostic Student Profile and Evidence Pack Builder for Genesis CareerFit 3.0.
    Seamlessly supports RunQuestionRegistry, dynamic AssessmentPackages, and multi-domain datasets.
    """
    series_row = pd.Series(row)
    
    # 1. Candidate Identity Extraction
    name = str(row.get("full_name") or row.get("Candidate_Name") or row.get("Candidate Name") or row.get("Student_Name") or row.get("name") or row.get("Name") or row.get("student_name") or f"Candidate {idx+1}").strip()
    if not name or name.lower() in ["-", "nan", "none", "null", "undefined"]:
        name = f"Candidate {idx+1}"
        
    usn_raw = row.get("USN") or row.get("usn") or row.get("Student_ID") or row.get("Roll_No") or row.get("Candidate_ID")
    if usn_raw is not None and str(usn_raw).strip() not in ["", "-", "NAN", "NONE", "NULL", "undefined"]:
        usn = str(usn_raw).strip().upper()
    else:
        usn = f"CAND_{idx+1:03d}"
        
    dept_raw = str(row.get("Department") or row.get("department") or row.get("Branch") or row.get("branch") or "General Engineering").strip()
    dept = dept_raw.replace("BE - ", "").replace("BE  - ", "").replace("B.Tech - ", "").strip().upper()
    if not dept or dept in ["-", "NAN", "NONE", "NULL"]:
        dept = "GENERAL ENGINEERING"
        
    college = str(row.get("College") or row.get("college") or row.get("Institution") or "Engineering Institute of Technology").strip()

    # 2. Academic CGPA Extraction
    cgpa_raw = row.get("CGPA") or row.get("cgpa") or row.get("Academic_CGPA")
    cgpa_val: Optional[float] = None
    cgpa_str: str = "Data Not Available"

    if cgpa_raw is not None and str(cgpa_raw).strip() not in ["", "-", "nan", "NaN", "None", "null", "BLANK / NOT AVAILABLE", "Data Not Available"]:
        try:
            clean_cgpa = str(cgpa_raw).replace('/10.0', '').replace('/10', '').strip()
            parsed = float(clean_cgpa)
            if 0.0 <= parsed <= 10.0:
                cgpa_val = round(parsed, 2)
                cgpa_str = f"{cgpa_val:.2f}/10.0"
        except (ValueError, TypeError):
            cgpa_val = None
            cgpa_str = "Data Not Available"

    # 3. Initialize CandidateEvidencePack
    evidence_pack = CandidateEvidencePack(
        candidate_name=name,
        usn=usn,
        department=dept,
        college=college,
        cgpa=cgpa_val
    )

    # 4. Check for Run-Scoped Question Registry First
    run_questions = RunQuestionRegistry.get_run_questions(run_id) if run_id else {}
    
    if run_questions:
        # Dynamic Evaluation using RunQuestionRegistry
        evaluated_items = {}
        domain_scores = {}
        competency_scores = {}
        attempted_count = 0
        total_questions = len(run_questions)

        for qid, q in run_questions.items():
            # Find column in row matching qid or column header
            val = None
            for k, v in row.items():
                if str(k).strip().upper() == qid or str(k).strip().upper() == q.question_id.upper():
                    val = v
                    break
            
            res = q.evaluate_response(val)
            evaluated_items[qid] = res
            if res.get("is_attempted"):
                attempted_count += 1

            dom = q.domain or "General"
            comp = q.competency or "Core"

            if dom not in domain_scores:
                domain_scores[dom] = {"raw_obtained": 0.0, "max_possible": 0.0, "question_ids": [], "attempted": 0}
            domain_scores[dom]["raw_obtained"] += res.get("score", 0.0)
            domain_scores[dom]["max_possible"] += res.get("max_score", 1.0)
            domain_scores[dom]["question_ids"].append(qid)
            if res.get("is_attempted"):
                domain_scores[dom]["attempted"] += 1

            if comp not in competency_scores:
                competency_scores[comp] = {"raw_obtained": 0.0, "max_possible": 0.0, "question_ids": [], "domain": dom, "attempted": 0}
            competency_scores[comp]["raw_obtained"] += res.get("score", 0.0)
            competency_scores[comp]["max_possible"] += res.get("max_score", 1.0)
            competency_scores[comp]["question_ids"].append(qid)
            if res.get("is_attempted"):
                competency_scores[comp]["attempted"] += 1

        # Format domain and competency summaries
        domains_summary = {}
        for dname, ddata in domain_scores.items():
            mx = ddata["max_possible"]
            pct = round((ddata["raw_obtained"] / mx) * 100.0, 2) if mx > 0 else 0.0
            rating = "Proficient" if pct >= 80 else ("Competent" if pct >= 65 else "Developing")
            domains_summary[dname] = {
                "domain_name": dname,
                "raw_obtained": ddata["raw_obtained"],
                "max_possible": mx,
                "percentage": pct,
                "rating": rating,
                "status": "MEASURED" if ddata["attempted"] > 0 else "NOT_EVALUATED",
                "question_ids": ddata["question_ids"]
            }

        comps_summary = {}
        for cname, cdata in competency_scores.items():
            mx = cdata["max_possible"]
            pct = round((cdata["raw_obtained"] / mx) * 100.0, 2) if mx > 0 else 0.0
            rating = "Proficient" if pct >= 80 else ("Competent" if pct >= 65 else "Developing")
            comps_summary[cname] = {
                "competency_name": cname,
                "domain": cdata["domain"],
                "raw_obtained": cdata["raw_obtained"],
                "max_possible": mx,
                "percentage": pct,
                "rating": rating,
                "status": "MEASURED" if cdata["attempted"] > 0 else "NOT_EVALUATED",
                "question_ids": cdata["question_ids"]
            }

        # Build unassessed domain explanations for all missing standard domains
        standard_domains = ["Technical", "Aptitude", "Psychometric"]
        unassessed_exps = {}
        for sdom in standard_domains:
            if sdom not in domains_summary or domains_summary[sdom]["status"] == "NOT_EVALUATED":
                unassessed_exps[sdom] = {
                    "domain_name": sdom,
                    "status": "NOT_EVALUATED",
                    "what_was_not_measured": f"{sdom} performance was not included in this assessment.",
                    "why_not_scored": f"No {sdom.lower()} question set or testing items were present in the uploaded dataset.",
                    "confidence_impact": f"This limits confidence when evaluating career pathways requiring {sdom.lower()} proficiency.",
                    "remediation_assessment": f"An institutional {sdom.lower()} evaluation module would provide the missing evidence."
                }

        measured_domain_count = sum(1 for d in domains_summary.values() if d["status"] == "MEASURED")
        coverage_pct = round((measured_domain_count / max(len(standard_domains), 1)) * 100.0, 1)

        psych_results = {
            "status": "MEASURED" if "Psychometric" in domains_summary and domains_summary["Psychometric"]["status"] == "MEASURED" else "NOT_EVALUATED",
            "source": f"Assessment Run {run_id}",
            "answered_count": attempted_count,
            "total_score": sum(d["raw_obtained"] for d in domains_summary.values()),
            "max_possible": sum(d["max_possible"] for d in domains_summary.values()),
            "percentage": domains_summary.get("Psychometric", {}).get("percentage", 75.0),
            "rating": "Competent",
            "competencies": comps_summary
        }
        evidence_pack.psychometric_evidence = psych_results

        assessment_eval = {
            "package_id": run_id,
            "package_name": f"Assessment Run {run_id}",
            "matched_question_count": len(run_questions),
            "total_package_questions": total_questions,
            "attempted_question_count": attempted_count,
            "question_coverage_pct": round((attempted_count / total_questions) * 100.0, 1) if total_questions > 0 else 0.0,
            "assessment_coverage_pct": coverage_pct,
            "confidence_tier": "HIGH" if coverage_pct >= 75.0 else ("MODERATE" if coverage_pct >= 40.0 else "INSUFFICIENT"),
            "domains": domains_summary,
            "competencies": comps_summary,
            "unassessed_domain_explanations": unassessed_exps
        }

    elif package is not None:
        assessment_eval = DynamicAssessmentEvaluator.evaluate_candidate_responses(row, package)
        psych_comps = {}
        for cname, cdata in assessment_eval.get("competencies", {}).items():
            psych_comps[cname] = {
                "score": cdata.get("raw_obtained"),
                "max_score": cdata.get("max_possible"),
                "percentage": cdata.get("percentage"),
                "rating": cdata.get("rating"),
                "status": cdata.get("status", "MEASURED"),
                "answered_items": cdata.get("attempted_count", 0),
                "total_items": cdata.get("total_questions", 0),
                "interpretation": cdata.get("interpretation")
            }
        psych_results = {
            "status": "MEASURED" if assessment_eval["attempted_question_count"] > 0 else "NOT_EVALUATED",
            "source": package.name,
            "answered_count": assessment_eval["attempted_question_count"],
            "total_score": sum(c.get("raw_obtained", 0) for c in assessment_eval.get("competencies", {}).values()),
            "max_possible": sum(c.get("max_possible", 0) for c in assessment_eval.get("competencies", {}).values()),
            "percentage": assessment_eval.get("domains", {}).get("Psychometric", {}).get("percentage", 0.0),
            "rating": "Competent",
            "competencies": psych_comps
        }
        evidence_pack.psychometric_evidence = psych_results
    else:
        # Check for CareerFit 20-Question assessment responses (Q01..Q20 or Q1..Q20)
        cf_q_keys = [q["id"].upper() for q in CareerFitAssessmentEngine.get_all_questions()]
        has_cf_questions = any(str(k).strip().upper() in cf_q_keys for k in row.keys())
        
        if has_cf_questions:
            # Map any Q1..Q20 to Q01..Q20 if needed
            norm_responses = {}
            for k, v in row.items():
                k_clean = str(k).strip().upper()
                if re.match(r"^Q\d+$", k_clean):
                    q_num = int(k_clean[1:])
                    q_key = f"Q{q_num:02d}"
                    norm_responses[q_key] = v
                else:
                    norm_responses[k_clean] = v

            cf_eval = CareerFitAssessmentEngine.evaluate_responses(norm_responses)
            domains_summary = cf_eval["domains"]
            comps_summary = cf_eval["competencies"]
            
            psych_results = {
                "status": "MEASURED" if cf_eval["attempted_count"] > 0 else "NOT_EVALUATED",
                "source": "Genesis CareerFit 20-Question Situational & Employability Assessment",
                "answered_count": cf_eval["attempted_count"],
                "total_score": cf_eval["total_obtained"],
                "max_possible": cf_eval["total_possible"],
                "percentage": cf_eval["overall_percentage"],
                "rating": "Proficient" if cf_eval["overall_percentage"] >= 80 else ("Competent" if cf_eval["overall_percentage"] >= 65 else "Developing"),
                "competencies": comps_summary
            }
            evidence_pack.psychometric_evidence = psych_results
            
            assessment_eval = {
                "package_id": "CAREERFIT_20Q_SITUATIONAL",
                "package_name": "CareerFit 20-Question Situational & Employability Assessment",
                "matched_question_count": cf_eval["total_questions"],
                "total_package_questions": cf_eval["total_questions"],
                "attempted_question_count": cf_eval["attempted_count"],
                "question_coverage_pct": round((cf_eval["attempted_count"] / cf_eval["total_questions"]) * 100.0, 1) if cf_eval["total_questions"] > 0 else 0.0,
                "assessment_coverage_pct": 100.0 if cf_eval["attempted_count"] == cf_eval["total_questions"] else round((cf_eval["attempted_count"] / cf_eval["total_questions"]) * 100.0, 1),
                "confidence_tier": "HIGH" if cf_eval["attempted_count"] >= 15 else ("MODERATE" if cf_eval["attempted_count"] >= 8 else "INSUFFICIENT"),
                "domains": domains_summary,
                "competencies": comps_summary,
                "unassessed_domain_explanations": {}
            }
        else:
            # Standard baseline psychometric evaluation
            question_cols = [str(k) for k in row.keys() if re.match(r"^[Qq]\d+$", str(k).strip())]
            if question_cols:
                psych_results = PsychometricEngine.evaluate_psychometric_responses(series_row, question_cols)
                evidence_pack.psychometric_evidence = psych_results
            else:
                psych_results = {
                    "status": "NOT_EVALUATED",
                    "source": None,
                    "answered_count": 0,
                    "total_score": None,
                    "max_possible": None,
                    "percentage": None,
                    "rating": "Not Evaluated",
                    "competencies": {}
                }
                evidence_pack.psychometric_evidence = psych_results

            # Check for direct custom numeric domain columns in row (e.g. Python, Aptitude, Circuits, Math, CAD, Thermo)
            non_domain_keys = {"usn", "name", "candidate_name", "candidate name", "student_name", "student name", "branch", "department", "dept", "cgpa", "phone", "email", "gender", "college", "idx", "candidate_id", "report_id"}
            custom_domains = {}
            for k, v in row.items():
                if str(k).lower().strip() not in non_domain_keys and not re.match(r"^[Qq]\d+$", str(k).strip()):
                    try:
                        num_v = float(str(v).replace('%', '').strip())
                        custom_domains[str(k).strip()] = {
                            "domain_name": str(k).strip(),
                            "percentage": num_v,
                            "raw_obtained": num_v,
                            "max_possible": 100.0 if num_v > 10.0 else 10.0,
                            "status": "MEASURED",
                            "rating": "Proficient" if num_v >= 80 else ("Competent" if num_v >= 65 else "Developing")
                        }
                    except (ValueError, TypeError):
                        pass

            measured_domains = {}
            if question_cols:
                measured_domains["Psychometric"] = {"domain_name": "Psychometric", "percentage": psych_results.get("percentage", 80.0), "status": psych_results["status"]}
            measured_domains.update(custom_domains)

            assessment_eval = {
                "package_id": "BASELINE_DYNAMIC_ADAPTIVE",
                "package_name": "Genesis Dynamic Assessment Evaluation",
                "matched_question_count": len(question_cols) + len(custom_domains),
                "total_package_questions": max(len(question_cols) + len(custom_domains), 5),
                "attempted_question_count": len(question_cols) + len(custom_domains),
                "question_coverage_pct": 100.0 if (question_cols or custom_domains) else 0.0,
                "assessment_coverage_pct": 75.0 if custom_domains else (25.0 if question_cols else 0.0),
                "confidence_tier": "HIGH" if len(custom_domains) >= 2 else ("MODERATE" if (question_cols or custom_domains) else "INSUFFICIENT"),
                "domains": measured_domains,
                "competencies": {**psych_results.get("competencies", {}), **{k: {"percentage": v["percentage"], "status": "MEASURED"} for k, v in custom_domains.items()}},
                "unassessed_domain_explanations": {
                    "Technical": {
                        "domain_name": "Technical",
                        "status": "NOT_EVALUATED",
                        "what_was_not_measured": "Technical coding performance was not included in this assessment.",
                        "why_not_scored": "No technical coding question set was present in the uploaded dataset.",
                        "confidence_impact": "This limits confidence when evaluating software engineering and technical architecture roles.",
                        "remediation_assessment": "A hands-on coding assessment would provide the missing evidence."
                    }
                } if "Technical" not in measured_domains and not any("tech" in k.lower() or "python" in k.lower() or "circuit" in k.lower() for k in measured_domains) else {}
            }

    # 5. Technical / Analytical / Communication Explicit Column Processing
    tech_results = TechnicalEngine.evaluate_technical_scores(series_row)
    evidence_pack.technical_evidence = tech_results

    # Check explicit columns
    row_keys_lower = {str(k).lower(): k for k in row.keys()}
    
    # 5a. Technical Column Check (e.g. Python Score / Total)
    if "python score" in row_keys_lower:
        p_sc = float(row[row_keys_lower["python score"]])
        p_tot = float(row.get(row_keys_lower.get("python total"), 20))
        pct_tech = round((p_sc / p_tot) * 100.0, 2)
        evidence_pack.set_technical_component(pct_tech, source_domain="Python Assessment")
    elif tech_results:
        tech_scores = [v["percentage"] for v in tech_results.values() if v.get("status") == "Evaluated" or v.get("status") == "MEASURED"]
        if tech_scores:
            avg_tech = sum(tech_scores) / len(tech_scores)
            evidence_pack.set_technical_component(avg_tech, source_domain="Technical Assessment")

    # 5b. Analytical Column Check (e.g. Aptitude Score / Total)
    if "aptitude score" in row_keys_lower:
        a_sc = float(row[row_keys_lower["aptitude score"]])
        a_tot = float(row.get(row_keys_lower.get("aptitude total"), 20))
        pct_ana = round((a_sc / a_tot) * 100.0, 2)
        evidence_pack.set_analytical_component(pct_ana, source="Aptitude Assessment")
    elif psych_results.get("status") in ["MEASURED", "Evaluated"] and "Analytical Thinking & Problem Solving" in psych_results["competencies"]:
        c_ana = psych_results["competencies"]["Analytical Thinking & Problem Solving"]
        if c_ana.get("percentage") is not None and c_ana.get("percentage") != "Not Evaluated":
            evidence_pack.set_analytical_component(float(str(c_ana["percentage"]).replace('%', '')), source="SJT Evaluation")

    # 5c. Communication Column Check (e.g. Verbal Score / Total)
    if "verbal score" in row_keys_lower:
        v_sc = float(row[row_keys_lower["verbal score"]])
        v_tot = float(row.get(row_keys_lower.get("verbal total"), 20))
        pct_comm = round((v_sc / v_tot) * 100.0, 2)
        evidence_pack.set_communication_component(pct_comm, source="Verbal Assessment")
    elif psych_results.get("status") in ["MEASURED", "Evaluated"] and "Communication" in psych_results["competencies"]:
        c_comm = psych_results["competencies"]["Communication"]
        if c_comm.get("percentage") is not None and c_comm.get("percentage") != "Not Evaluated":
            evidence_pack.set_communication_component(float(str(c_comm["percentage"]).replace('%', '')), source="SJT Evaluation")

    # 5d. Ownership Component Check
    if psych_results.get("status") in ["MEASURED", "Evaluated"] and "Accountability & Ownership" in psych_results["competencies"]:
        c_own = psych_results["competencies"]["Accountability & Ownership"]
        if c_own.get("percentage") is not None and c_own.get("percentage") != "Not Evaluated":
            evidence_pack.set_ownership_component(float(str(c_own["percentage"]).replace('%', '')), source="Accountability & Ownership (SJT)")
    elif psych_results.get("status") in ["MEASURED", "Evaluated"] and psych_results["competencies"]:
        first_comp = next((c for c in psych_results["competencies"].values() if c.get("status") == "MEASURED" and c.get("percentage") is not None), None)
        if first_comp:
            pct_val = float(str(first_comp["percentage"]).replace('%', ''))
            evidence_pack.set_ownership_component(pct_val, source="Dynamic Behavioral SJT")

    evidence_pack.calculate_authoritative_scores()
    evidence_summary = evidence_pack.get_evidence_summary()

    # 6. Career Matching via CareerMatchingEngineV3
    career_match_res = CareerMatchingEngineV3.match_candidate_careers(
        candidate_eval=assessment_eval,
        department=dept,
        cgpa=cgpa_val,
        evidence_pack=evidence_pack
    )

    primary_target = career_match_res["primary_target"]
    top_5_roles = career_match_res["top_5_roles"]
    top_10_roles = career_match_res["top_10_roles"]

    # 7. SWOT Analysis
    measured_comps = [c for c in psych_results.get("competencies", {}).values() if c.get("status") == "MEASURED"]
    sorted_comps = sorted(measured_comps, key=lambda x: x.get("percentage", 0) if isinstance(x.get("percentage"), (int, float)) else 0, reverse=True)

    strengths = [f"{c.get('competency_name', 'Skill')} ({c.get('percentage')}%) — {c.get('rating', 'Proficient')} proficiency demonstrated in assessment." for c in sorted_comps[:3]]
    if not strengths:
        strengths = ["Established engineering foundational baseline.", "Methodical analytical approach to technical problem solving."]

    weaknesses = [f"{c.get('competency_name', 'Skill')} ({c.get('percentage')}%) — Targeted pre-placement coaching recommended." for c in sorted_comps[-2:] if isinstance(c.get("percentage"), (int, float)) and c.get("percentage", 100) < 80.0]
    if not weaknesses:
        weaknesses = ["Timed technical coding execution under pressurized interview constraints.", "Cross-domain architectural scalability and systems design."]

    swot_analysis = {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "opportunities": [
            f"High placement alignment for entry-level {primary_target['role']} roles.",
            "Specialized technical competency certification to fast-track recruitment clearance."
        ],
        "threats": [
            "Competitive campus recruitment cutoffs in high-demand software engineering tracks.",
            "Rapidly shifting industry requirements toward distributed systems and containerization."
        ]
    }

    final_fit_score = evidence_pack.career_fit_score or primary_target.get("fit_score") or round(((evidence_pack.careerfit_index or career_match_res["overall_index"]) - 200) / 6.0, 2)
    final_readiness_score = evidence_pack.job_readiness_score or primary_target.get("readiness_score") or final_fit_score
    final_cf_index = evidence_pack.careerfit_index or primary_target.get("careerfit_index") or career_match_res["overall_index"]

    return {
        "student": {
            "name": name,
            "usn": usn,
            "department": dept,
            "college": college,
            "cgpa": cgpa_val,
            "cgpa_val": cgpa_val,
            "cgpa_display": cgpa_str,
            "academic_status": "MEASURED" if cgpa_val else "UNAVAILABLE",
            "report_id": f"CF-{usn}-{int(time.time())}"
        },
        "scores": {
            "overall_index": final_cf_index,
            "overall_index_pct": int((final_cf_index - 200) / 6.0),
            "fit_score": final_fit_score,
            "career_fit_score": final_fit_score,
            "readiness_score": final_readiness_score,
            "job_readiness_score": final_readiness_score,
            "careerfit_index": final_cf_index,
            "verdict": evidence_summary.get("institutional_verification_status") or career_match_res.get("verdict", "INSUFFICIENT_EVIDENCE"),
            "confidence_tier": evidence_summary.get("confidence") or career_match_res.get("confidence_tier", "INSUFFICIENT"),
            "coverage_percentage": assessment_eval["assessment_coverage_pct"],
            "percentile_display": "Benchmark unavailable (Single-Cohort Mode)"
        },
        "assessment_package": {
            "package_id": assessment_eval["package_id"],
            "package_name": assessment_eval["package_name"],
            "matched_count": assessment_eval["matched_question_count"],
            "total_questions": assessment_eval["total_package_questions"],
            "attempted_count": assessment_eval["attempted_question_count"],
            "question_coverage_pct": assessment_eval["question_coverage_pct"],
            "assessment_coverage_pct": assessment_eval["assessment_coverage_pct"],
            "domains": assessment_eval["domains"],
            "unassessed_domain_explanations": assessment_eval["unassessed_domain_explanations"]
        },
        "psychometric_results": psych_results,
        "psychometric_profile": {
            "swot_analysis": swot_analysis,
            "competencies": psych_results.get("competencies", {})
        },
        "technical_results": tech_results,
        "career_recommendations": {
            "primary_target": primary_target,
            "top_5_roles": top_5_roles,
            "top_10_roles": top_10_roles
        },
        "evidence_pack": evidence_pack.to_dict(),
        "evidence_summary": evidence_summary,
        "assessment_eval": assessment_eval
    }
