"""
engines/assessment_package_engine.py
Assessment-Agnostic Response Evaluation, Domain & Competency Aggregation Engine for Genesis CareerFit 3.0.

Guarantees:
1. Strictly evaluates responses against the uploaded AssessmentPackage (no hardcoded question counts).
2. Dynamic competency discovery: Only assesses competencies defined in the question templates.
3. Explicit unassessed explanations: Explains WHY a domain was not included, what it means, and next action.
4. Deterministic score calculation: obtained / max * 100 strictly bounded [0.0%, 100.0%].
5. Separates Fit Score from Evidence Confidence.
"""

from typing import Dict, Any, List, Optional, Set
from services.question_registry import AssessmentPackage, Question, QuestionRegistry
from services.scoring_normalization import normalize_competency_percentage, get_competency_rating

class DynamicAssessmentEvaluator:
    @classmethod
    def evaluate_candidate_responses(
        cls,
        candidate_row: Dict[str, Any],
        package: Optional[AssessmentPackage] = None
    ) -> Dict[str, Any]:
        """
        Evaluates candidate responses against the dynamic AssessmentPackage.
        """
        if package is None:
            package = QuestionRegistry.get_baseline_psychometric_package()

        # Step 1: Identify candidate response columns
        matched_responses: Dict[str, Dict[str, Any]] = {}
        unmatched_responses: Dict[str, Any] = {}
        
        # Domain and Competency Accumulators
        domain_accumulators: Dict[str, Dict[str, Any]] = {}
        competency_accumulators: Dict[str, Dict[str, Any]] = {}

        # Standard known non-question identity keys
        identity_keys = {
            "candidate_name", "student_name", "name", "usn", "student_id", "id", "roll_no",
            "department", "branch", "dept", "college", "institution", "university",
            "cgpa", "academic_cgpa", "email", "phone", "gender", "category"
        }

        # Normalize keys in candidate row
        clean_row = {str(k).strip(): v for k, v in candidate_row.items()}
        
        # Scan candidate keys for questions
        for col_name, raw_val in clean_row.items():
            col_lower = col_name.lower()
            if col_lower in identity_keys:
                continue

            # Check if this column maps to a Question ID in the package
            q_id = str(col_name).strip().upper()
            question = package.get_question(q_id)
            
            # If not direct, try stripping prefixes (e.g. "Q_1" -> "Q1", "Question 1" -> "Q1")
            if not question:
                import re
                m = re.search(r'(\d+)', q_id)
                if m:
                    alt_qid = f"Q{int(m.group(1))}"
                    alt_qid_3 = f"Q{int(m.group(1)):03d}"
                    question = package.get_question(alt_qid) or package.get_question(alt_qid_3)

            if question:
                eval_res = question.evaluate_response(raw_val)
                eval_res["question"] = question.to_dict()
                matched_responses[question.question_id] = eval_res
                
                # Accumulate Domain Score
                dom = question.domain
                if dom not in domain_accumulators:
                    domain_accumulators[dom] = {
                        "domain_name": dom,
                        "raw_obtained": 0.0,
                        "max_possible": 0.0,
                        "attempted_count": 0,
                        "total_questions": 0,
                        "correct_count": 0,
                        "question_ids": []
                    }
                domain_accumulators[dom]["raw_obtained"] += eval_res["score"]
                domain_accumulators[dom]["max_possible"] += eval_res["max_score"]
                domain_accumulators[dom]["total_questions"] += 1
                domain_accumulators[dom]["question_ids"].append(question.question_id)
                if eval_res["is_attempted"]:
                    domain_accumulators[dom]["attempted_count"] += 1
                if eval_res["is_correct"]:
                    domain_accumulators[dom]["correct_count"] += 1

                # Accumulate Competency Score
                comp = question.competency
                if comp:
                    if comp not in competency_accumulators:
                        competency_accumulators[comp] = {
                            "competency_name": comp,
                            "domain": dom,
                            "raw_obtained": 0.0,
                            "max_possible": 0.0,
                            "attempted_count": 0,
                            "total_questions": 0,
                            "question_ids": []
                        }
                    competency_accumulators[comp]["raw_obtained"] += eval_res["score"]
                    competency_accumulators[comp]["max_possible"] += eval_res["max_score"]
                    competency_accumulators[comp]["total_questions"] += 1
                    competency_accumulators[comp]["question_ids"].append(question.question_id)
                    if eval_res["is_attempted"]:
                        competency_accumulators[comp]["attempted_count"] += 1
            else:
                # Only flag as unmatched if not clearly metadata
                if any(char.isdigit() for char in col_name) or col_name.upper().startswith(('Q', 'PSY', 'APT', 'TECH', 'LOGIC', 'VERB')):
                    unmatched_responses[col_name] = raw_val

        # Step 2: Finalize Domain Metrics
        final_domains: Dict[str, Any] = {}
        for dom_name, d_acc in domain_accumulators.items():
            if d_acc["max_possible"] > 0:
                pct = normalize_competency_percentage((d_acc["raw_obtained"] / d_acc["max_possible"]) * 100.0)
            else:
                pct = 0.0
            final_domains[dom_name] = {
                "domain_name": dom_name,
                "percentage": pct,
                "raw_obtained": d_acc["raw_obtained"],
                "max_possible": d_acc["max_possible"],
                "attempted_count": d_acc["attempted_count"],
                "total_questions": d_acc["total_questions"],
                "correct_count": d_acc["correct_count"],
                "status": "MEASURED" if d_acc["attempted_count"] > 0 else "NOT_ATTEMPTED",
                "question_ids": d_acc["question_ids"]
            }

        # Step 3: Finalize Competency Metrics
        final_competencies: Dict[str, Any] = {}
        for comp_name, c_acc in competency_accumulators.items():
            if c_acc["max_possible"] > 0:
                pct = normalize_competency_percentage((c_acc["raw_obtained"] / c_acc["max_possible"]) * 100.0)
            else:
                pct = 0.0
            rating_tier, rating_desc, _ = get_competency_rating(pct)
            final_competencies[comp_name] = {
                "competency_name": comp_name,
                "domain": c_acc["domain"],
                "percentage": pct,
                "rating": rating_tier,
                "raw_obtained": c_acc["raw_obtained"],
                "max_possible": c_acc["max_possible"],
                "attempted_count": c_acc["attempted_count"],
                "total_questions": c_acc["total_questions"],
                "status": "MEASURED" if c_acc["attempted_count"] > 0 else "NOT_ATTEMPTED",
                "question_ids": c_acc["question_ids"],
                "interpretation": rating_desc or f"Demonstrates {rating_tier.lower()} consistency across assessed questions."
            }

        # Step 4: Identify Missing / Unassessed Domains from standard universe
        all_possible_domains = {"Psychometric", "Aptitude", "Technical", "Communication"}
        assessed_domains = set(final_domains.keys())
        unassessed_domain_explanations: Dict[str, Any] = {}

        for unassessed_dom in all_possible_domains - assessed_domains:
            unassessed_domain_explanations[unassessed_dom] = {
                "domain_name": unassessed_dom,
                "status": "NOT_INCLUDED_IN_ASSESSMENT",
                "reason": f"No {unassessed_dom.lower()} question set was supplied in this uploaded assessment package.",
                "what_this_means": f"Genesis CareerFit cannot make a verified conclusion regarding {unassessed_dom.lower()} proficiency.",
                "what_to_do_next": f"Upload a {unassessed_dom.lower()} assessment module or complete institutional testing."
            }

        # Step 5: Calculate Multi-Dimensional Evidence Coverage
        total_pkg_questions = package.total_questions or 1
        matched_count = len(matched_responses)
        attempted_count = sum(1 for r in matched_responses.values() if r["is_attempted"])
        
        question_coverage_pct = round((matched_count / total_pkg_questions) * 100.0, 1)
        assessment_coverage_pct = round((len(assessed_domains) / max(1, len(all_possible_domains))) * 100.0, 1)

        # Determine Evidence Confidence Tier
        if assessment_coverage_pct >= 75.0 and attempted_count >= 15:
            confidence = "HIGH"
        elif assessment_coverage_pct >= 50.0 or attempted_count >= 8:
            confidence = "MEDIUM"
        elif attempted_count > 0:
            confidence = "LOW"
        else:
            confidence = "INSUFFICIENT"

        return {
            "package_id": package.package_id,
            "package_name": package.name,
            "matched_responses": matched_responses,
            "unmatched_responses": unmatched_responses,
            "total_package_questions": total_pkg_questions,
            "matched_question_count": matched_count,
            "attempted_question_count": attempted_count,
            "question_coverage_pct": question_coverage_pct,
            "assessment_coverage_pct": assessment_coverage_pct,
            "confidence_tier": confidence,
            "domains": final_domains,
            "competencies": final_competencies,
            "unassessed_domain_explanations": unassessed_domain_explanations
        }
