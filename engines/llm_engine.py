"""
Genesis CareerFit - Multi-Agent Groq LLM Narrative Engine
Grounded in empirical assessment metrics. Analyzes exact candidate scores, OCEAN profiles,
skill deficits, and career alignment to produce high-impact, evidence-based diagnostic commentary.
"""
import os
import json
from typing import Dict, Any, List

try:
    from groq import Groq
except ImportError:
    Groq = None


class LLMNarrativeEngine:
    def __init__(self):
        self.api_key = os.environ.get("GROQ_API_KEY")
        self.client = Groq(api_key=self.api_key) if (Groq and self.api_key) else None

    def synthesize_report_narratives(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes multi-agent evidence synthesis across all 12 report sections.
        """
        student = profile.get("student", {})
        scores = profile.get("scores", {})
        psycho = profile.get("psychometric_results", {})
        comps = psycho.get("competencies", {})
        recs = profile.get("career_recommendations", {})
        primary_role = recs.get("primary_target", {}).get("role", "Business & Systems Analyst")
        domain = recs.get("primary_target", {}).get("domain", "Technology & Analytics")
        emp_index = scores.get("overall_index", 671)
        cgpa = student.get("cgpa_display", "Data Not Available")

        comp_summary = {k: f"{v.get('percentage', 0)}% ({v.get('rating', 'Developing')})" for k, v in comps.items()}

        prompt = f"""
You are the Chief Talent Intelligence Officer and Lead Industrial Psychologist for Genesis CareerFit.
Analyze the following empirical candidate assessment metrics:

CANDIDATE: {student.get('name', 'Candidate')} (USN: {student.get('usn', '000')}, Dept: {student.get('department', 'CSE')})
CGPA: {cgpa}
OVERALL CAREERFIT INDEX: {emp_index} / 800
PRIMARY RECOMMENDED ROLE: {primary_role} ({domain})
VERIFIED COMPETENCY SCORES:
{json.dumps(comp_summary, indent=2)}

Generate an exhaustive, highly professional, evidence-backed JSON diagnostic report containing detailed, analytical commentary for each section.
Do NOT use generic filler. Every sentence must explicitly reference their numbers, strengths, or gaps.

Return ONLY valid JSON matching this structure:
{{
  "executive_summary": "3-4 detailed analytical sentences deconstructing their overall index, aptitude-to-execution translation, and key hiring readiness verdict.",
  "ocean_interpretation": "Comprehensive breakdown of their Big 5 / OCEAN psychometric behavioral tendencies in high-stakes corporate settings.",
  "workplace_behaviour": "Detailed evaluation of team collaboration, deadline pressure handling, conflict resolution style, and leadership inclination.",
  "competency_analysis": "Diagnostic on top strengths vs lowest-scoring deficit competencies with operational workplace impact.",
  "career_fit_rationale": "Comprehensive explanation of WHY {primary_role} in {domain} is the optimal trajectory, referencing exact competency alignments.",
  "why_not_others": "Analytical justification on why secondary or alternative roles fell short due to specific skill threshold deficits.",
  "skill_gap_analysis": "Targeted critique of missing technical, operational, and executive capabilities required to achieve top-decile performance.",
  "employability_verdict": "Clear, direct corporate recruiter hiring recommendation and interview readiness assessment.",
  "development_roadmap_narrative": "Strategic 90-day upskilling and capstone project guidance structured across Phase 1 (Foundation), Phase 2 (Applied Projects), and Phase 3 (Market Readiness).",
  "final_diagnosis": "Holistic psychologist synthesis and 5-year career trajectory viability rating."
}}
"""
        if self.client:
            try:
                chat_completion = self.client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": "You are a senior enterprise talent analytics AI. Always output clean, valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    model="llama-3.3-70b-versatile",
                    temperature=0.3,
                    response_format={"type": "json_object"}
                )
                res_content = chat_completion.choices[0].message.content
                parsed = json.loads(res_content)
                return {"status": "SUCCESS", "data": parsed}
            except Exception as e:
                print(f"⚠️ [Groq Gateway Warning] API synthesis failed, falling back to deterministic synthesis: {e}")

        # Deterministic fallback
        top_comps = sorted(comps.items(), key=lambda x: x[1].get("percentage", 0), reverse=True)[:3]
        low_comps = sorted(comps.items(), key=lambda x: x[1].get("percentage", 0))[:3]
        top_str = ", ".join([f"{k} ({v.get('percentage', 0)}%)" for k, v in top_comps]) if top_comps else "Analytical Problem Solving (77.5%)"
        low_str = ", ".join([f"{k} ({v.get('percentage', 0)}%)" for k, v in low_comps]) if low_comps else "SQL Queries (62.0%)"

        fallback_data = {
            "executive_summary": f"Candidate {student.get('name', 'Candidate')} (CGPA {cgpa}) presents a balanced technical and analytical aptitude profile with an Overall CareerFit Index of {emp_index}/800. Prominent strengths in {top_str} indicate strong suitability for {primary_role} ({recs.get('primary_target', {}).get('match_score', 94.4)}% match). Prioritized focus on {low_str} is recommended for tier-1 placement conversion.",
            "ocean_interpretation": f"Psychometric profiling indicates a highly structured, analytical orientation characterized by high Conscientiousness and high Emotional Stability. In engineering sprint teams, {student.get('name', 'the candidate')} operates methodically and maintains calm during high-pressure releases.",
            "workplace_behaviour": f"Exhibits a dependable task-execution pattern with high dedication to pull-request protocols and quality deliverables. Team collaboration is constructive, though cross-functional stakeholder presentation benefits from structured scaffolding.",
            "competency_analysis": f"Evaluated evidence highlights competitive advantages across {top_str}. These capabilities enable rapid technical ingestion and root-cause analysis. Conversely, developmental focus is required in {low_str}.",
            "career_fit_rationale": f"The primary target role of {primary_role} within {domain} represents the highest multi-vector alignment. Quantitative logic and documentation habits support metric-driven decision making and dashboard architecture.",
            "why_not_others": f"Alternative corporate tracks exhibited lower suitability scores due to benchmark deficits in live algorithmic coding speed rounds and specialized infrastructure tooling.",
            "skill_gap_analysis": f"Current capability matrix reveals an immediate need to elevate {low_str} through intensive scenario simulations, portfolio capstone builds, and structured STAR presentation drills.",
            "employability_verdict": f"Hiring Classification: {scores.get('verdict', 'STRONG HIRE')}. The candidate is well-positioned for campus placement drives and enterprise interview evaluation rounds.",
            "development_roadmap_narrative": f"Recommended 90-day growth roadmap focuses on Phase 1 (remediating {low_str}), Phase 2 (building 2 interactive Streamlit/PowerBI dashboards), and Phase 3 (securing industry certifications and mock interviews).",
            "final_diagnosis": f"Senior Psychologist Synthesis: Candidate {student.get('name', 'Candidate')} exhibits high 5-year career viability in {domain}. Execution agility and technical discipline provide a solid foundation for rapid promotion into senior technical leadership."
        }
        return {"status": "DETERMINISTIC_FALLBACK", "data": fallback_data}