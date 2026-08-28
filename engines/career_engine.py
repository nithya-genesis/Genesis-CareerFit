from typing import Dict, Any, List

BRANCH_CAREER_BLUEPRINTS = {
    "CSE": [
        {
            "role_name": "Software Development Engineer",
            "domain": "Distributed Systems & Core Software",
            "technical_competencies": ["Data Structures & Algorithms", "Object-Oriented Architecture", "REST APIs"],
            "required_competencies": {"Analytical Thinking & Problem Solving": 75.0, "Quality Orientation": 70.0, "Accountability & Ownership": 70.0},
            "pathway": ["Junior Software Engineer", "Software Development Engineer II", "Senior Systems Architect", "Principal Engineering Lead"],
            "base_fit": 88.0
        },
        {
            "role_name": "Full Stack Cloud Platform Engineer",
            "domain": "Web Platforms & Cloud Microservices",
            "technical_competencies": ["React/TypeScript", "Node.js", "Docker & Kubernetes"],
            "required_competencies": {"Analytical Thinking & Problem Solving": 70.0, "Learning Agility & Growth Mindset": 75.0, "Quality Orientation": 65.0},
            "pathway": ["Graduate Cloud Developer", "Cloud Solutions Engineer", "DevOps & SRE Specialist", "Cloud Platform Director"],
            "base_fit": 85.0
        }
    ],
    "AI&ML": [
        {
            "role_name": "AI & Machine Learning Specialist",
            "domain": "Applied Artificial Intelligence & Deep Learning",
            "technical_competencies": ["PyTorch / TensorFlow", "Statistical Modeling", "RAG & LLM Pipelines"],
            "required_competencies": {"Analytical Thinking & Problem Solving": 80.0, "Learning Agility & Growth Mindset": 75.0, "Decision Making": 70.0},
            "pathway": ["Junior ML Engineer", "Machine Learning Scientist", "Lead AI Architect", "Director of Cognitive Systems"],
            "base_fit": 91.0
        },
        {
            "role_name": "Applied Computer Vision & NLP Engineer",
            "domain": "Cognitive Vision & Language Systems",
            "technical_competencies": ["OpenCV", "HuggingFace Transformers", "Vector Database Indexing"],
            "required_competencies": {"Analytical Thinking & Problem Solving": 75.0, "Quality Orientation": 70.0, "Innovation": 70.0},
            "pathway": ["Associate NLP/CV Engineer", "Senior AI Research Engineer", "Cognitive Systems Architect"],
            "base_fit": 87.0
        }
    ],
    "AI&DS": [
        {
            "role_name": "Data Analytics & BI Pipeline Engineer",
            "domain": "Business Intelligence & Data Infrastructure",
            "technical_competencies": ["Advanced SQL Query Optimization", "PowerBI / Tableau", "ETL Warehousing"],
            "required_competencies": {"Analytical Thinking & Problem Solving": 75.0, "Quality Orientation": 70.0, "Decision Making": 65.0},
            "pathway": ["Associate Data Analyst", "Senior Business Intelligence Engineer", "Lead Data Strategist", "Chief Data Officer"],
            "base_fit": 89.0
        }
    ],
    "ECE": [
        {
            "role_name": "Embedded Systems & Firmware Engineer",
            "domain": "Microcontrollers & Low-Level Hardware",
            "technical_competencies": ["Embedded C/C++", "RTOS", "UART / I2C / SPI Communication Protocols"],
            "required_competencies": {"Analytical Thinking & Problem Solving": 75.0, "Quality Orientation": 75.0, "Work Commitment & Reliability": 70.0},
            "pathway": ["Associate Firmware Developer", "Embedded Systems Engineer", "Hardware Platform Architect"],
            "base_fit": 87.5
        }
    ],
    "EEE": [
        {
            "role_name": "Power Systems & Battery Management Specialist",
            "domain": "Clean Tech & Electric Mobility",
            "technical_competencies": ["MATLAB / Simulink", "BMS Architecture", "Power Converter Design"],
            "required_competencies": {"Analytical Thinking & Problem Solving": 75.0, "Quality Orientation": 70.0, "Accountability & Ownership": 70.0},
            "pathway": ["Junior EV Power Engineer", "Battery Systems Specialist", "Energy Grid Solutions Director"],
            "base_fit": 86.0
        }
    ],
    "ME": [
        {
            "role_name": "Mechanical Design & Simulation Engineer",
            "domain": "CAD Modeling, FEA & Structural Simulation",
            "technical_competencies": ["SolidWorks / CATIA", "ANSYS FEA", "GD&T Standards"],
            "required_competencies": {"Analytical Thinking & Problem Solving": 75.0, "Quality Orientation": 75.0, "Work Commitment & Reliability": 70.0},
            "pathway": ["Junior CAD Designer", "Structural Simulation Engineer", "Lead Mechanical Architect"],
            "base_fit": 84.0
        }
    ]
}

DEFAULT_FALLBACK = [
    {
        "role_name": "Business & Systems Analyst",
        "domain": "Enterprise Analysis & Product Systems",
        "technical_competencies": ["Requirements Gathering", "BPMN Process Modeling", "SQL Data Validation"],
        "required_competencies": {"Communication": 75.0, "Analytical Thinking & Problem Solving": 70.0, "Customer Orientation": 65.0},
        "pathway": ["Associate Systems Analyst", "Product Analyst", "Enterprise Solution Consultant", "VP of Business Systems"],
        "base_fit": 83.0
    }
]

class CareerEngine:
    @classmethod
    def evaluate_candidate(cls, branch: str, comp_scores: Dict[str, Any], cgpa_val: float) -> Dict[str, Any]:
        clean_branch = branch.upper().strip()
        blueprints = BRANCH_CAREER_MAP.get(clean_branch, DEFAULT_FALLBACK)
        
        evaluated_roles = []
        for bp in blueprints:
            reqs = bp["required_competencies"]
            matches = []
            for comp_name, threshold in reqs.items():
                pct = comp_scores.get(comp_name, {}).get("percentage", 70.0)
                matches.append(min(100.0, (pct / threshold) * 100.0))

            comp_fit = sum(matches) / len(matches) if matches else 75.0
            
            # Career Fit = Directional alignment based on Aptitude + Psychometric competencies
            career_fit = round(min(98.0, max(55.0, (bp["base_fit"] * 0.4) + (comp_fit * 0.6))), 1)
            
            # Job Readiness = Current Entry-Level execution preparedness (incorporates Academic Rigor / CGPA)
            cgpa_factor = (min(10.0, max(5.0, cgpa_val)) / 10.0) * 100.0
            job_readiness = round(min(95.0, max(45.0, (career_fit * 0.65) + (cgpa_factor * 0.35) - 6.0)), 1)

            evaluated_roles.append({
                "role_name": bp["role_name"],
                "domain": bp["domain"],
                "career_fit_pct": career_fit,
                "job_readiness_pct": job_readiness,
                "career_pathway": bp["pathway"],
                "technical_skills_evidence": bp["technical_competencies"],
                "fit_tier": "Placement Ready" if job_readiness >= 75.0 else "Development Recommended"
            })

        evaluated_roles.sort(key=lambda x: x["career_fit_pct"], reverse=True)
        primary = evaluated_roles[0]

        return {
            "primary_role": primary,
            "all_evaluated_roles": evaluated_roles
        }
