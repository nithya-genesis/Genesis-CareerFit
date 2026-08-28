from typing import Dict, Any, List, Optional

class CareerFitAssessmentEngine:
    """
    Authoritative 20-Question CareerFit Situational & Employability Assessment Engine.
    Evaluates 10 Workplace Dimensions across 20 Deterministic Scenarios:
    1. Problem Solving (3 Questions)
    2. Emotional Intelligence (3 Questions)
    3. Communication (2 Questions)
    4. Adaptability (2 Questions)
    5. Resilience & Toughness (2 Questions)
    6. Integrity & Ethics (2 Questions)
    7. Teamwork (2 Questions)
    8. Leadership & Ownership (2 Questions)
    9. Decision Making (1 Question)
    10. Learning Agility (1 Question)
    TOTAL: 20 Questions
    """

    DIMENSIONS = [
        "Problem Solving",
        "Emotional Intelligence",
        "Communication",
        "Adaptability",
        "Resilience & Toughness",
        "Integrity & Ethics",
        "Teamwork",
        "Leadership & Ownership",
        "Decision Making",
        "Learning Agility"
    ]

    QUESTIONS: List[Dict[str, Any]] = [
        # =========================================================================
        # 1. PROBLEM SOLVING (3 Questions: Q01 - Q03)
        # =========================================================================
        {
            "id": "Q01",
            "dimension": "Problem Solving",
            "scenario": "A core microservice crashes in production every 30 minutes with out-of-memory errors. The service owner is unavailable, and users are experiencing transaction drops.",
            "options": [
                {
                    "key": "A",
                    "text": "Capture heap dumps, isolate memory leak vectors using profiler metrics, apply an immediate heap-size safeguard, and submit a verified fix.",
                    "score": 5,
                    "competencies": {"Problem Solving": 5, "Decision Making": 4, "Leadership & Ownership": 4}
                },
                {
                    "key": "B",
                    "text": "Restart the service manually every 25 minutes using a cron script until the service owner returns.",
                    "score": 2,
                    "competencies": {"Problem Solving": 2, "Adaptability": 2}
                },
                {
                    "key": "C",
                    "text": "Disable the entire microservice and redirect user requests to an error page indefinitely.",
                    "score": 1,
                    "competencies": {"Problem Solving": 1}
                },
                {
                    "key": "D",
                    "text": "Post an urgent message in the general chat and wait for another engineer to pick it up.",
                    "score": 1,
                    "competencies": {"Problem Solving": 1, "Leadership & Ownership": 1}
                }
            ],
            "explanation": "Option A demonstrates systematic root-cause diagnosis, structured instrumentation, and safe mitigation under operational pressure."
        },
        {
            "id": "Q02",
            "dimension": "Problem Solving",
            "scenario": "An algorithm predicting batch student placement readiness runs in O(N^3) time, taking 14 hours to execute for large cohorts. Your deadline is tomorrow morning.",
            "options": [
                {
                    "key": "A",
                    "text": "Profile the execution graph, identify redundant nested loops, and rewrite the inner computations using hash index lookups to achieve O(N log N) runtime.",
                    "score": 5,
                    "competencies": {"Problem Solving": 5, "Learning Agility": 4}
                },
                {
                    "key": "B",
                    "text": "Split the input dataset into smaller slices and run multiple terminal windows manually in parallel.",
                    "score": 3,
                    "competencies": {"Problem Solving": 3, "Adaptability": 3}
                },
                {
                    "key": "C",
                    "text": "Sample only 10% of candidates and guess the remaining 90% without algorithm modification.",
                    "score": 1,
                    "competencies": {"Problem Solving": 1, "Integrity & Ethics": 1}
                },
                {
                    "key": "D",
                    "text": "Inform the placement office that large datasets cannot be computed and request smaller batches.",
                    "score": 1,
                    "competencies": {"Problem Solving": 1}
                }
            ],
            "explanation": "Option A applies fundamental algorithmic optimization and computational complexity reduction to meet business constraints."
        },
        {
            "id": "Q03",
            "dimension": "Problem Solving",
            "scenario": "A third-party API that your application relies on for live authentication changes its response schema unexpectedly without advance notice.",
            "options": [
                {
                    "key": "A",
                    "text": "Implement a defensive schema validation adapter with fallback error handling, write a regression test against the new schema, and deploy a hotfix.",
                    "score": 5,
                    "competencies": {"Problem Solving": 5, "Adaptability": 4, "Decision Making": 4}
                },
                {
                    "key": "B",
                    "text": "File a support ticket with the third-party provider and disable authentication until they revert.",
                    "score": 2,
                    "competencies": {"Problem Solving": 2}
                },
                {
                    "key": "C",
                    "text": "Bypass authentication checks entirely so users can log in without verification.",
                    "score": 1,
                    "competencies": {"Problem Solving": 1, "Integrity & Ethics": 1}
                },
                {
                    "key": "D",
                    "text": "Blame the external vendor in the user error notice and take no code action.",
                    "score": 1,
                    "competencies": {"Problem Solving": 1, "Communication": 1}
                }
            ],
            "explanation": "Option A utilizes adapter patterns and resilient API interface contracts to maintain uptime."
        },

        # =========================================================================
        # 2. EMOTIONAL INTELLIGENCE (3 Questions: Q04 - Q06)
        # =========================================================================
        {
            "id": "Q04",
            "dimension": "Emotional Intelligence",
            "scenario": "During a cross-functional project review, a peer publicly criticizes your architecture proposal aggressively in front of department stakeholders.",
            "options": [
                {
                    "key": "A",
                    "text": "Listen actively without getting defensive, acknowledge their valid architectural points calmly, and propose a collaborative whiteboard session to align.",
                    "score": 5,
                    "competencies": {"Emotional Intelligence": 5, "Communication": 5, "Teamwork": 4}
                },
                {
                    "key": "B",
                    "text": "Point out flaws in their past project deliveries to defend your credibility in front of the group.",
                    "score": 1,
                    "competencies": {"Emotional Intelligence": 1, "Communication": 1}
                },
                {
                    "key": "C",
                    "text": "Remain completely silent during the meeting and vent your frustration to teammates afterwards.",
                    "score": 2,
                    "competencies": {"Emotional Intelligence": 2, "Leadership & Ownership": 1}
                },
                {
                    "key": "D",
                    "text": "Withdraw your proposal immediately to avoid any conflict.",
                    "score": 1,
                    "competencies": {"Emotional Intelligence": 1, "Resilience & Toughness": 1}
                }
            ],
            "explanation": "Option A demonstrates high emotional regulation, stakeholder maturity, and constructive conflict resolution."
        },
        {
            "id": "Q05",
            "dimension": "Emotional Intelligence",
            "scenario": "A junior colleague who joined recently appears withdrawn, is missing initial sprint tasks, and seems overwhelmed by the project tech stack.",
            "options": [
                {
                    "key": "A",
                    "text": "Schedule an informal 1-on-1 coffee check-in, listen with empathy to their onboarding challenges, and co-create a structured ramp-up roadmap.",
                    "score": 5,
                    "competencies": {"Emotional Intelligence": 5, "Leadership & Ownership": 5, "Teamwork": 4}
                },
                {
                    "key": "B",
                    "text": "Report their task delays directly to the placement manager without speaking to them.",
                    "score": 1,
                    "competencies": {"Emotional Intelligence": 1, "Teamwork": 1}
                },
                {
                    "key": "C",
                    "text": "Take over all their assigned tasks silently to prevent sprint delays.",
                    "score": 2,
                    "competencies": {"Emotional Intelligence": 2, "Leadership & Ownership": 2}
                },
                {
                    "key": "D",
                    "text": "Ignore their situation since onboarding is strictly HR's responsibility.",
                    "score": 1,
                    "competencies": {"Emotional Intelligence": 1}
                }
            ],
            "explanation": "Option A displays compassionate leadership, empathetic listening, and proactive mentorship."
        },
        {
            "id": "Q06",
            "dimension": "Emotional Intelligence",
            "scenario": "Your team has been working late hours for three consecutive weeks leading up to institutional campus recruitment drives. Morale is visibly dropping.",
            "options": [
                {
                    "key": "A",
                    "text": "Acknowledge the team's immense effort openly, conduct a workload triage to de-scope non-critical items, and advocate for recovery rest.",
                    "score": 5,
                    "competencies": {"Emotional Intelligence": 5, "Leadership & Ownership": 5, "Resilience & Toughness": 4}
                },
                {
                    "key": "B",
                    "text": "Tell the team that stress is normal in engineering and demand they push through without complaints.",
                    "score": 1,
                    "competencies": {"Emotional Intelligence": 1, "Leadership & Ownership": 1}
                },
                {
                    "key": "C",
                    "text": "Start leaving early quietly to avoid seeing the team's exhaustion.",
                    "score": 1,
                    "competencies": {"Emotional Intelligence": 1, "Teamwork": 1}
                },
                {
                    "key": "D",
                    "text": "Organize an after-work social event without addressing the underlying excessive workload.",
                    "score": 2,
                    "competencies": {"Emotional Intelligence": 2, "Decision Making": 2}
                }
            ],
            "explanation": "Option A balances team psychological well-being with realistic delivery triage."
        },

        # =========================================================================
        # 3. COMMUNICATION (2 Questions: Q07 - Q08)
        # =========================================================================
        {
            "id": "Q07",
            "dimension": "Communication",
            "scenario": "You must explain why transitioning to an event-driven Kafka architecture is necessary to non-technical college deans holding budget approval.",
            "options": [
                {
                    "key": "A",
                    "text": "Translate technical concepts into business outcomes: explain how asynchronous processing eliminates admission portal crashes during peak traffic.",
                    "score": 5,
                    "competencies": {"Communication": 5, "Problem Solving": 4, "Decision Making": 4}
                },
                {
                    "key": "B",
                    "text": "Deliver a 40-slide presentation explaining consumer groups, partition offsets, and zookeeper protocols in deep technical detail.",
                    "score": 2,
                    "competencies": {"Communication": 2}
                },
                {
                    "key": "C",
                    "text": "Tell the deans that technical details are beyond their expertise and ask them to just trust your recommendation.",
                    "score": 1,
                    "competencies": {"Communication": 1, "Emotional Intelligence": 1}
                },
                {
                    "key": "D",
                    "text": "Send an unannotated GitHub architecture diagram and request immediate budget approval via email.",
                    "score": 1,
                    "competencies": {"Communication": 1}
                }
            ],
            "explanation": "Option A bridges the technical-business communication divide by articulating tangible value."
        },
        {
            "id": "Q08",
            "dimension": "Communication",
            "scenario": "A remote distributed project team across 3 time zones is experiencing confusion because requirements are discussed verbally on calls with no written logs.",
            "options": [
                {
                    "key": "A",
                    "text": "Establish a lightweight RFC (Request for Comments) workflow and concise async summary notes in repository discussions after every key decision.",
                    "score": 5,
                    "competencies": {"Communication": 5, "Teamwork": 4, "Leadership & Ownership": 4}
                },
                {
                    "key": "B",
                    "text": "Mandate daily 2-hour synchronous midnight meetings so everyone must attend regardless of time zone.",
                    "score": 2,
                    "competencies": {"Communication": 2, "Emotional Intelligence": 1}
                },
                {
                    "key": "C",
                    "text": "Continue verbal discussions and tell remote members to ask questions if they don't understand.",
                    "score": 1,
                    "competencies": {"Communication": 1, "Teamwork": 1}
                },
                {
                    "key": "D",
                    "text": "Stop communicating with other time zones and work exclusively within your local group.",
                    "score": 1,
                    "competencies": {"Communication": 1, "Teamwork": 1}
                }
            ],
            "explanation": "Option A fosters asynchronous clarity, inclusive documentation, and alignment across distributed teams."
        },

        # =========================================================================
        # 4. ADAPTABILITY (2 Questions: Q09 - Q10)
        # =========================================================================
        {
            "id": "Q09",
            "dimension": "Adaptability",
            "scenario": "Halfway through building a placement prediction dashboard in React, the recruiting enterprise requests an exportable Python Streamlit dashboard instead.",
            "options": [
                {
                    "key": "A",
                    "text": "Assess the shared backend APIs, reuse core scoring modules, rapidly scaffold Streamlit UI components, and maintain clear milestone communication.",
                    "score": 5,
                    "competencies": {"Adaptability": 5, "Problem Solving": 4, "Learning Agility": 4}
                },
                {
                    "key": "B",
                    "text": "Refuse the change and insist the enterprise accept React because development has already started.",
                    "score": 1,
                    "competencies": {"Adaptability": 1, "Communication": 1}
                },
                {
                    "key": "C",
                    "text": "Abandon the project completely in frustration over shifting scope requirements.",
                    "score": 1,
                    "competencies": {"Adaptability": 1, "Resilience & Toughness": 1}
                },
                {
                    "key": "D",
                    "text": "Accept the change silently, keep the old React codebase, and try to wrap an iframe around it without telling the client.",
                    "score": 2,
                    "competencies": {"Adaptability": 2, "Integrity & Ethics": 1}
                }
            ],
            "explanation": "Option A displays agile mindset, technical adaptability, and proactive code reuse."
        },
        {
            "id": "Q10",
            "dimension": "Adaptability",
            "scenario": "Your project requires integrating with a newly released database engine that has zero internal documentation and only nascent community forums.",
            "options": [
                {
                    "key": "A",
                    "text": "Read the official release notes and engine source code, build an isolated sandbox proof-of-concept, and document internal best practices for the team.",
                    "score": 5,
                    "competencies": {"Adaptability": 5, "Learning Agility": 5, "Problem Solving": 4}
                },
                {
                    "key": "B",
                    "text": "Wait for other teams to adopt it first and postpone your project milestones indefinitely.",
                    "score": 2,
                    "competencies": {"Adaptability": 2, "Leadership & Ownership": 1}
                },
                {
                    "key": "C",
                    "text": "Copy unverified snippets from online forums directly into production without testing.",
                    "score": 1,
                    "competencies": {"Adaptability": 1, "Decision Making": 1}
                },
                {
                    "key": "D",
                    "text": "Complain that management chose an unsupported technology and refuse to work on it.",
                    "score": 1,
                    "competencies": {"Adaptability": 1, "Emotional Intelligence": 1}
                }
            ],
            "explanation": "Option A shows independent self-directed learning and structured exploration of novel technologies."
        },

        # =========================================================================
        # 5. RESILIENCE & TOUGHNESS (2 Questions: Q11 - Q12)
        # =========================================================================
        {
            "id": "Q11",
            "dimension": "Resilience & Toughness",
            "scenario": "During a live final-year placement coding interview, your first two solutions to a hard dynamic programming problem fail all hidden test cases.",
            "options": [
                {
                    "key": "A",
                    "text": "Take a deep breath, remain composed, articulate your edge-case analysis out loud to the interviewer, and pivot systematically to a bottom-up tabulation approach.",
                    "score": 5,
                    "competencies": {"Resilience & Toughness": 5, "Problem Solving": 4, "Communication": 4}
                },
                {
                    "key": "B",
                    "text": "Panic, apologize repeatedly, and give up before time expires.",
                    "score": 1,
                    "competencies": {"Resilience & Toughness": 1}
                },
                {
                    "key": "C",
                    "text": "Argue with the interviewer that the test cases are incorrect.",
                    "score": 1,
                    "competencies": {"Resilience & Toughness": 1, "Emotional Intelligence": 1}
                },
                {
                    "key": "D",
                    "text": "Freeze in silence and stare at the screen until the interview concludes.",
                    "score": 1,
                    "competencies": {"Resilience & Toughness": 1}
                }
            ],
            "explanation": "Option A shows psychological grit, grit under evaluation pressure, and transparent reasoning."
        },
        {
            "id": "Q12",
            "dimension": "Resilience & Toughness",
            "scenario": "A research paper and prototype software you worked on for 6 months is rejected by a conference with harsh reviewer feedback.",
            "options": [
                {
                    "key": "A",
                    "text": "Conduct an objective post-mortem: separate actionable technical critiques from subjective feedback, strengthen the benchmark experiments, and resubmit.",
                    "score": 5,
                    "competencies": {"Resilience & Toughness": 5, "Learning Agility": 5, "Problem Solving": 4}
                },
                {
                    "key": "B",
                    "text": "Discard the entire research project and decide never to publish again.",
                    "score": 1,
                    "competencies": {"Resilience & Toughness": 1}
                },
                {
                    "key": "C",
                    "text": "Resubmit the identical rejected paper to another journal without fixing any flaws.",
                    "score": 2,
                    "competencies": {"Resilience & Toughness": 2, "Learning Agility": 1}
                },
                {
                    "key": "D",
                    "text": "Blame co-authors for the rejection and withdraw from future team collaborations.",
                    "score": 1,
                    "competencies": {"Resilience & Toughness": 1, "Teamwork": 1}
                }
            ],
            "explanation": "Option A demonstrates constructive feedback assimilation, growth resilience, and persistent continuous improvement."
        },

        # =========================================================================
        # 6. INTEGRITY & ETHICS (2 Questions: Q13 - Q14)
        # =========================================================================
        {
            "id": "Q13",
            "dimension": "Integrity & Ethics",
            "scenario": "You discover that a legacy database query in your platform exposes unmasked student phone numbers and emails to anyone with a guest token.",
            "options": [
                {
                    "key": "A",
                    "text": "Treat it as an immediate P0 security incident: mask the endpoint immediately, rotate tokens, log the vulnerability report, and notify management.",
                    "score": 5,
                    "competencies": {"Integrity & Ethics": 5, "Leadership & Ownership": 5, "Decision Making": 4}
                },
                {
                    "key": "B",
                    "text": "Keep quiet about it since nobody has noticed it yet and fixing it might delay your sprint.",
                    "score": 1,
                    "competencies": {"Integrity & Ethics": 1, "Leadership & Ownership": 1}
                },
                {
                    "key": "C",
                    "text": "Tell your friends about the leak so they can test it before you report it.",
                    "score": 1,
                    "competencies": {"Integrity & Ethics": 1}
                },
                {
                    "key": "D",
                    "text": "Add a note in your personal to-do list to look at it next month.",
                    "score": 1,
                    "competencies": {"Integrity & Ethics": 1}
                }
            ],
            "explanation": "Option A enforces uncompromising data privacy standards, professional ethics, and rapid triage."
        },
        {
            "id": "Q14",
            "dimension": "Integrity & Ethics",
            "scenario": "A close batchmate asks you to share your completed proprietary assignment code so they can submit it under their name for placement shortlisting.",
            "options": [
                {
                    "key": "A",
                    "text": "Decline politely and firmly explain institutional plagiarism policies, while offering to spend 30 minutes explaining core concepts so they can write their own.",
                    "score": 5,
                    "competencies": {"Integrity & Ethics": 5, "Emotional Intelligence": 4, "Communication": 4}
                },
                {
                    "key": "B",
                    "text": "Send them your complete code and tell them to just rename a few variables.",
                    "score": 1,
                    "competencies": {"Integrity & Ethics": 1}
                },
                {
                    "key": "C",
                    "text": "Sell your code to them for a monetary fee.",
                    "score": 1,
                    "competencies": {"Integrity & Ethics": 1}
                },
                {
                    "key": "D",
                    "text": "Publicly humiliate them in the student group chat for asking.",
                    "score": 1,
                    "competencies": {"Integrity & Ethics": 2, "Emotional Intelligence": 1}
                }
            ],
            "explanation": "Option A maintains academic and professional integrity while constructively supporting peer learning."
        },

        # =========================================================================
        # 7. TEAMWORK (2 Questions: Q15 - Q16)
        # =========================================================================
        {
            "id": "Q15",
            "dimension": "Teamwork",
            "scenario": "Your 4-person capstone team has conflicting opinions on whether to use SQL vs. NoSQL for the project data layer, stalling all progress for 3 days.",
            "options": [
                {
                    "key": "A",
                    "text": "Create an objective decision matrix evaluating schema rigidity, query patterns, indexing needs, and team familiarity to reach a consensus.",
                    "score": 5,
                    "competencies": {"Teamwork": 5, "Decision Making": 5, "Problem Solving": 4}
                },
                {
                    "key": "B",
                    "text": "Threaten to leave the team unless everyone adopts your preferred database.",
                    "score": 1,
                    "competencies": {"Teamwork": 1, "Emotional Intelligence": 1}
                },
                {
                    "key": "C",
                    "text": "Let the loudest teammate choose without analyzing data access requirements.",
                    "score": 2,
                    "competencies": {"Teamwork": 2, "Decision Making": 1}
                },
                {
                    "key": "D",
                    "text": "Implement both databases simultaneously in the same project without consensus.",
                    "score": 1,
                    "competencies": {"Teamwork": 1, "Problem Solving": 1}
                }
            ],
            "explanation": "Option A utilizes structured engineering trade-off frameworks to resolve deadlock collaboratively."
        },
        {
            "id": "Q16",
            "dimension": "Teamwork",
            "scenario": "A sprint teammate is falling behind because of an unexpected illness, putting the joint sprint delivery at risk.",
            "options": [
                {
                    "key": "A",
                    "text": "Rebalance sprint priorities collectively as a team, redistribute critical path tasks, and support their recovery without compromising quality.",
                    "score": 5,
                    "competencies": {"Teamwork": 5, "Leadership & Ownership": 4, "Emotional Intelligence": 4}
                },
                {
                    "key": "B",
                    "text": "Complain to the project guide that the teammate's illness is hurting your individual GPA.",
                    "score": 1,
                    "competencies": {"Teamwork": 1, "Emotional Intelligence": 1}
                },
                {
                    "key": "C",
                    "text": "Demand the ill teammate work overnight from home to finish their deliverables.",
                    "score": 1,
                    "competencies": {"Teamwork": 1, "Emotional Intelligence": 1}
                },
                {
                    "key": "D",
                    "text": "Do nothing and let the sprint fail to show management that the team was understaffed.",
                    "score": 1,
                    "competencies": {"Teamwork": 1, "Leadership & Ownership": 1}
                }
            ],
            "explanation": "Option A shows psychological safety, collective accountability, and cross-functional workload rebalancing."
        },

        # =========================================================================
        # 8. LEADERSHIP & OWNERSHIP (2 Questions: Q17 - Q18)
        # =========================================================================
        {
            "id": "Q17",
            "dimension": "Leadership & Ownership",
            "scenario": "A production deployment fails due to a bug in a configuration file you modified yesterday. The incident alarm sounds during lunch.",
            "options": [
                {
                    "key": "A",
                    "text": "Take immediate ownership on the incident bridge, execute a clean rollback, explain the root cause transparently, and add an automated pre-commit config validator.",
                    "score": 5,
                    "competencies": {"Leadership & Ownership": 5, "Integrity & Ethics": 5, "Problem Solving": 4}
                },
                {
                    "key": "B",
                    "text": "Claim that the DevOps deployment script was at fault rather than your configuration change.",
                    "score": 1,
                    "competencies": {"Leadership & Ownership": 1, "Integrity & Ethics": 1}
                },
                {
                    "key": "C",
                    "text": "Pretend not to see the alarm until someone else initiates the rollback.",
                    "score": 1,
                    "competencies": {"Leadership & Ownership": 1}
                },
                {
                    "key": "D",
                    "text": "Delete your git commit history so nobody knows who authored the change.",
                    "score": 1,
                    "competencies": {"Leadership & Ownership": 1, "Integrity & Ethics": 1}
                }
            ],
            "explanation": "Option A exemplifies extreme ownership: immediate containment, blameless post-mortem, and automated preventative controls."
        },
        {
            "id": "Q18",
            "dimension": "Leadership & Ownership",
            "scenario": "You notice that the team's testing coverage has decayed to 35%, leading to frequent regressions in customer staging environments.",
            "options": [
                {
                    "key": "A",
                    "text": "Propose a 'Quality Sprint' initiative: set up CI coverage gates, write integration test fixtures for critical user journeys, and establish testing guidelines.",
                    "score": 5,
                    "competencies": {"Leadership & Ownership": 5, "Problem Solving": 4, "Communication": 4}
                },
                {
                    "key": "B",
                    "text": "Stop writing tests for your own code as well since nobody else cares.",
                    "score": 1,
                    "competencies": {"Leadership & Ownership": 1}
                },
                {
                    "key": "C",
                    "text": "Blame QA engineers exclusively for all regression bugs.",
                    "score": 1,
                    "competencies": {"Leadership & Ownership": 1, "Teamwork": 1}
                },
                {
                    "key": "D",
                    "text": "Disable test suites in CI pipeline so builds pass faster.",
                    "score": 1,
                    "competencies": {"Leadership & Ownership": 1, "Decision Making": 1}
                }
            ],
            "explanation": "Option A demonstrates proactive technical stewardship and standard-setting leadership."
        },

        # =========================================================================
        # 9. DECISION MAKING (1 Question: Q19)
        # =========================================================================
        {
            "id": "Q19",
            "dimension": "Decision Making",
            "scenario": "Your product launch is scheduled in 48 hours. A minor non-blocking UI layout bug is found in mobile viewport settings.",
            "options": [
                {
                    "key": "A",
                    "text": "Assess risk vs. impact: document the minor visual quirk as a known issue, proceed with scheduled release, and schedule a fast-follow patch next week.",
                    "score": 5,
                    "competencies": {"Decision Making": 5, "Leadership & Ownership": 4, "Problem Solving": 4}
                },
                {
                    "key": "B",
                    "text": "Cancel the entire product launch and restart testing from scratch for 2 months.",
                    "score": 2,
                    "competencies": {"Decision Making": 2, "Adaptability": 1}
                },
                {
                    "key": "C",
                    "text": "Apply a hurried, untested CSS patch to production 5 minutes before the launch.",
                    "score": 1,
                    "competencies": {"Decision Making": 1, "Resilience & Toughness": 1}
                },
                {
                    "key": "D",
                    "text": "Hide the mobile app download link from the website so nobody uses it.",
                    "score": 1,
                    "competencies": {"Decision Making": 1}
                }
            ],
            "explanation": "Option A demonstrates pragmatic risk analysis, business context evaluation, and disciplined release management."
        },

        # =========================================================================
        # 10. LEARNING AGILITY (1 Question: Q20)
        # =========================================================================
        {
            "id": "Q20",
            "dimension": "Learning Agility",
            "scenario": "An enterprise recruiter assigns an on-the-spot technical challenge using Rust and WebAssembly, languages not taught in your college syllabus.",
            "options": [
                {
                    "key": "A",
                    "text": "Embrace the challenge enthusiastically: leverage foundational C++/memory management concepts, consult standard documentation, and build a functional MVP.",
                    "score": 5,
                    "competencies": {"Learning Agility": 5, "Problem Solving": 5, "Resilience & Toughness": 4}
                },
                {
                    "key": "B",
                    "text": "Complain that the college curriculum didn't teach Rust and ask for a standard C problem.",
                    "score": 1,
                    "competencies": {"Learning Agility": 1, "Adaptability": 1}
                },
                {
                    "key": "C",
                    "text": "Pretend you know Rust and try to write Python code with Rust syntax hoping the compiler works.",
                    "score": 1,
                    "competencies": {"Learning Agility": 1, "Integrity & Ethics": 1}
                },
                {
                    "key": "D",
                    "text": "Walk out of the interview room immediately.",
                    "score": 1,
                    "competencies": {"Learning Agility": 1, "Resilience & Toughness": 1}
                }
            ],
            "explanation": "Option A highlights high learning agility, cross-domain knowledge transfer, and proactive intellectual curiosity."
        }
    ]

    @classmethod
    def get_all_questions(cls) -> List[Dict[str, Any]]:
        return cls.QUESTIONS

    @classmethod
    def evaluate_responses(cls, responses: Dict[str, Any]) -> Dict[str, Any]:
        """
        Deterministically evaluates student response keys (e.g. {"Q01": "A", "Q02": "B", ...})
        Returns:
        - raw scores per question
        - domain-level percentage scores (0 - 100%)
        - competency scores
        - overall CareerFit Index (200 - 800)
        - answer reconciliation
        """
        dim_scores: Dict[str, float] = {d: 0.0 for d in cls.DIMENSIONS}
        dim_max: Dict[str, float] = {d: 0.0 for d in cls.DIMENSIONS}
        q_results: Dict[str, Any] = {}
        total_obtained = 0.0
        total_possible = 0.0

        for q in cls.QUESTIONS:
            qid = q["id"]
            dim = q["dimension"]
            selected_key = str(responses.get(qid, "")).strip().upper()
            
            # Find matching option
            matched_opt = next((opt for opt in q["options"] if opt["key"].upper() == selected_key), None)
            max_opt_score = max(opt["score"] for opt in q["options"])
            
            score_obtained = matched_opt["score"] if matched_opt else 0
            is_attempted = matched_opt is not None
            
            total_possible += max_opt_score
            total_obtained += score_obtained
            
            dim_max[dim] += max_opt_score
            dim_scores[dim] += score_obtained
            
            q_results[qid] = {
                "question_id": qid,
                "dimension": dim,
                "selected_key": selected_key,
                "score_obtained": score_obtained,
                "max_score": max_opt_score,
                "is_attempted": is_attempted,
                "explanation": q.get("explanation", "")
            }

        # Calculate normalized domain percentage scores
        domains_summary = {}
        competencies_summary = {}
        for dim in cls.DIMENSIONS:
            mx = dim_max[dim]
            ob = dim_scores[dim]
            pct = round((ob / mx) * 100.0, 2) if mx > 0 else 0.0
            rating = "Proficient" if pct >= 80 else ("Competent" if pct >= 65 else "Developing")
            
            domains_summary[dim] = {
                "domain_name": dim,
                "percentage": pct,
                "raw_obtained": ob,
                "max_possible": mx,
                "rating": rating,
                "status": "MEASURED" if ob > 0 else "NOT_EVALUATED"
            }
            competencies_summary[dim] = {
                "competency_name": dim,
                "percentage": pct,
                "rating": rating,
                "status": "MEASURED" if ob > 0 else "NOT_EVALUATED"
            }

        overall_pct = round((total_obtained / total_possible) * 100.0, 2) if total_possible > 0 else 0.0
        cf_index = int(round(200 + (overall_pct / 100.0) * 600))

        return {
            "total_questions": len(cls.QUESTIONS),
            "attempted_count": sum(1 for r in q_results.values() if r["is_attempted"]),
            "total_obtained": total_obtained,
            "total_possible": total_possible,
            "overall_percentage": overall_pct,
            "careerfit_index": cf_index,
            "question_results": q_results,
            "domains": domains_summary,
            "competencies": competencies_summary
        }
