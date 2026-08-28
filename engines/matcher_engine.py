import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class MatcherEngine:
    """
    Deterministic Career Fit & Skill Gap Engine.
    Enforces zero-default scoring, provenance tracking, and dynamic normalization.
    """

    @staticmethod
    def evaluate_role_fit(candidate_profile: Dict[str, Any], role_def: Dict[str, Any]) -> Dict[str, Any]:
        tech_scores = candidate_profile.get('technical_results', {})
        psych_results = candidate_profile.get('psychometric_results', {})
        
        # Extract overall SJT
        overall_sjt: Optional[float] = None
        if psych_results.get('percentage') is not None:
            overall_sjt = float(psych_results['percentage'])
        elif psych_results.get('summary', {}).get('overall_pct') is not None:
            overall_sjt = float(psych_results['summary']['overall_pct'])

        # Extract CGPA
        cgpa_val: Optional[float] = None
        academic_pct: Optional[float] = None
        raw_cgpa = candidate_profile.get('cgpa') or candidate_profile.get('student', {}).get('cgpa')
        if raw_cgpa is not None and str(raw_cgpa).strip() not in ['', '-', 'nan', 'None', 'Data Not Available']:
            try:
                cgpa_val = float(str(raw_cgpa).replace('/10.0', '').replace('/10', '').strip())
                academic_pct = round(min(100.0, max(0.0, (cgpa_val / 10.0) * 100.0)), 1)
            except (ValueError, TypeError):
                cgpa_val = None
                academic_pct = None

        # Evaluate Role Required Skills
        req_skills = role_def.get('required_skills', {})
        tech_matches = []
        gap_items = []

        for skill, min_val in req_skills.items():
            if skill in tech_scores and tech_scores[skill].get('percentage') is not None:
                cand_val = float(tech_scores[skill]['percentage'])
                tech_matches.append(min(100.0, (cand_val / min_val) * 100.0 if min_val > 0 else 100.0))
                diff = min_val - cand_val
                
                if diff <= 0.0:
                    gap_tier = 'Benchmark Exceeded / Strong Area'
                elif diff <= 10.0:
                    gap_tier = 'Minor Gap / On-Track'
                elif diff <= 20.0:
                    gap_tier = 'Moderate Gap (30-Day Remediation Focus)'
                else:
                    gap_tier = 'High Priority Gap (90-Day Deep Upskilling)'

                gap_items.append({
                    'skill': skill,
                    'current_level': round(cand_val, 1),
                    'required_level': min_val,
                    'status': 'MEASURED',
                    'gap_tier': gap_tier
                })
            else:
                # Skill NOT evaluated in this assessment
                gap_items.append({
                    'skill': skill,
                    'current_level': None,
                    'required_level': min_val,
                    'status': 'NOT_EVALUATED',
                    'gap_tier': 'High Priority Gap (Unassessed Domain)'
                })

        avg_tech_fit = round(sum(tech_matches) / len(tech_matches), 1) if tech_matches else None

        # Deterministic Weighted Suitability with Dynamic Normalization
        active_weights = {}
        if avg_tech_fit is not None:
            active_weights['tech'] = (0.40, avg_tech_fit)
        if overall_sjt is not None:
            psych_weight = float(role_def.get('psychometric_weight', 0.35))
            active_weights['psych'] = (psych_weight, overall_sjt)
        if academic_pct is not None:
            active_weights['acad'] = (0.20, academic_pct)

        total_weight = sum(w for w, _ in active_weights.values())
        if total_weight > 0.0:
            raw_fit = sum(val * (w / total_weight) for w, val in active_weights.values())
            suitability_score = round(min(100.0, max(0.0, raw_fit)), 1)
        else:
            suitability_score = None

        if suitability_score is not None:
            if suitability_score >= 80.0:
                fit_level = 'Strong Fit / Placement Ready'
            elif suitability_score >= 70.0:
                fit_level = 'Target Fit / Developing'
            else:
                fit_level = 'Needs Foundation Development'
        else:
            fit_level = 'Not Evaluated'

        return {
            'role_id': role_def.get('role_id', 'GEN_01'),
            'role_name': role_def.get('role_name', 'Software Engineer'),
            'family': role_def.get('family', 'IT — Technical'),
            'suitability_score': suitability_score,
            'fit_level': fit_level,
            'description': role_def.get('description', ''),
            'matrix_breakdown': {
                'technical': avg_tech_fit,
                'psychometric': overall_sjt,
                'academic': academic_pct
            },
            'gap_analysis': gap_items
        }
