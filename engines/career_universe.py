from typing import Dict, Any, List, Optional

class CareerUniverse:
    """
    Comprehensive 45+ Role Career Universe for Genesis CareerFit 3.0.
    Spans Technical, Non-Technical, and Cross-Domain Career Tracks.
    Each role defines an authoritative competency requirement profile.
    """

    CAREER_PROFILES: Dict[str, Dict[str, Any]] = {
        # =========================================================================
        # 1. TECHNICAL CAREERS (18 Roles)
        # =========================================================================
        "Software Development Engineer": {
            "title": "Software Development Engineer",
            "category": "TECH",
            "department_bias": "Low",
            "description": "Architects, develops, and maintains scalable software applications and distributed systems.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.25,
                "Data Structures & Algorithms": 0.25,
                "Python": 0.15,
                "Relational Databases & SQL": 0.15,
                "Accountability & Ownership": 0.10,
                "Communication": 0.10
            },
            "skills": ["Algorithms", "Data Structures", "System Design", "Git", "REST APIs"],
            "projects": ["Distributed task queue", "High-throughput API gateway with caching"],
            "next_assessment": "Comprehensive 90-minute timed DSA & System Design coding challenge"
        },
        "Backend Engineer": {
            "title": "Backend Engineer",
            "category": "TECH",
            "department_bias": "Low",
            "description": "Designs core server-side logic, database architectures, microservices, and API integrations.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.25,
                "Relational Databases & SQL": 0.25,
                "Python": 0.20,
                "Data Structures & Algorithms": 0.15,
                "Accountability & Ownership": 0.15
            },
            "skills": ["SQL Optimization", "Microservices", "Docker", "Database Indexing", "Message Queues"],
            "projects": ["E-commerce backend service with transactional concurrency and payment webhook integration"],
            "next_assessment": "Database Query Optimization & Async Server Architecture Assessment"
        },
        "Frontend Engineer": {
            "title": "Frontend Engineer",
            "category": "TECH",
            "department_bias": "Low",
            "description": "Builds intuitive, responsive user interfaces and client-side web applications.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.20,
                "Quality Orientation": 0.20,
                "Communication": 0.20,
                "Customer Orientation": 0.20,
                "Accountability & Ownership": 0.20
            },
            "skills": ["React/Vue", "TypeScript", "State Management", "CSS/Tailwind", "Web Performance"],
            "projects": ["Responsive real-time dashboard with client-side caching and WebSockets"],
            "next_assessment": "Frontend Component Architecture & Responsive Design Sprint"
        },
        "Full Stack Developer": {
            "title": "Full Stack Developer",
            "category": "TECH",
            "department_bias": "Low",
            "description": "Delivers end-to-end applications bridging interactive frontends with scalable backend backbones.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.25,
                "Python": 0.20,
                "Relational Databases & SQL": 0.20,
                "Communication": 0.15,
                "Accountability & Ownership": 0.20
            },
            "skills": ["Full Stack JS/Python", "REST/GraphQL", "Relational Schemas", "CI/CD Deployment"],
            "projects": ["Full-stack multi-tenant collaboration platform with JWT auth and live sync"],
            "next_assessment": "End-to-End Application Architecture Capstone Assessment"
        },
        "Data Analyst": {
            "title": "Data Analyst",
            "category": "TECH",
            "department_bias": "Low",
            "description": "Transforms raw transactional datasets into actionable business intelligence dashboards and executive insights.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.30,
                "Relational Databases & SQL": 0.30,
                "Python": 0.20,
                "Communication": 0.20
            },
            "skills": ["SQL Aggregations", "Tableau/Power BI", "Data Cleaning", "Statistical Testing"],
            "projects": ["Customer churn cohort analysis dashboard with automated weekly SQL ingestion"],
            "next_assessment": "Complex SQL Multi-Table Aggregation & Statistical Interpretation Test"
        },
        "Data Engineer": {
            "title": "Data Engineer",
            "category": "TECH",
            "department_bias": "Low",
            "description": "Constructs robust data pipelines, ETL workflows, and lakehouse storage infrastructure.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.25,
                "Relational Databases & SQL": 0.30,
                "Python": 0.25,
                "Accountability & Ownership": 0.20
            },
            "skills": ["Airflow/Prefect", "Spark", "SQL Data Modeling", "Data Warehousing", "Parquet/Iceberg"],
            "projects": ["Automated batch ETL pipeline syncing external APIs into BigQuery/Snowflake"],
            "next_assessment": "Data Pipeline Orchestration & Distributed Query Optimization Assessment"
        },
        "Machine Learning Engineer": {
            "title": "Machine Learning Engineer",
            "category": "TECH",
            "department_bias": "Low",
            "description": "Trains, evaluates, and deploys predictive machine learning and deep learning models into production.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.30,
                "Python": 0.30,
                "AIML": 0.25,
                "Relational Databases & SQL": 0.15
            },
            "skills": ["Scikit-Learn/PyTorch", "Feature Engineering", "Model Serving", "MLflow", "Vector DBs"],
            "projects": ["End-to-end model inference API with latency monitoring and automated retraining"],
            "next_assessment": "Applied Machine Learning & Feature Engineering Benchmark"
        },
        "AI / GenAI Engineer": {
            "title": "AI / GenAI Engineer",
            "category": "TECH",
            "department_bias": "Low",
            "description": "Builds generative AI systems, retrieval-augmented generation (RAG) pipelines, and intelligent agent workflows.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.30,
                "Python": 0.30,
                "AIML": 0.25,
                "Innovation": 0.15
            },
            "skills": ["LLM Fine-Tuning", "RAG Pipelines", "LangChain/LlamaIndex", "Embeddings", "Prompt Ops"],
            "projects": ["Domain-grounded RAG assistant with semantic reranking and citation grounding"],
            "next_assessment": "Generative AI Systems & Vector Retrieval Architecture Assessment"
        },
        "Cybersecurity Analyst": {
            "title": "Cybersecurity Analyst",
            "category": "TECH",
            "department_bias": "Low",
            "description": "Monitors networks, identifies vulnerabilities, ensures regulatory compliance, and defends against cyber threats.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.30,
                "Integrity & Ethics": 0.25,
                "Accountability & Ownership": 0.25,
                "Stress Management & Resilience": 0.20
            },
            "skills": ["Threat Modeling", "SIEM Tools", "Network Security", "Vulnerability Scanning", "ISO 27001"],
            "projects": ["Automated security audit script scanning server misconfigurations and open ports"],
            "next_assessment": "Vulnerability Assessment & Incident Response Simulation"
        },
        "Cloud / DevOps Engineer": {
            "title": "Cloud / DevOps Engineer",
            "category": "TECH",
            "department_bias": "Low",
            "description": "Automates cloud infrastructure, CI/CD pipelines, container orchestration, and system reliability.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.25,
                "Work Commitment & Reliability": 0.25,
                "Accountability & Ownership": 0.25,
                "Adaptability": 0.25
            },
            "skills": ["Terraform", "Kubernetes", "Docker", "AWS/GCP", "GitHub Actions CI/CD"],
            "projects": ["Multi-region auto-scaling infrastructure blueprint deployed with Infrastructure as Code"],
            "next_assessment": "Cloud Infrastructure as Code & Reliability Engineering Sprint"
        },
        "QA / Automation Engineer": {
            "title": "QA / Automation Engineer",
            "category": "TECH",
            "department_bias": "Low",
            "description": "Designs automated test suites, end-to-end regression frameworks, and enforces software quality gates.",
            "requirements": {
                "Quality Orientation": 0.35,
                "Analytical Thinking & Problem Solving": 0.25,
                "Accountability & Ownership": 0.20,
                "Communication": 0.20
            },
            "skills": ["Playwright/Selenium", "PyTest", "API Testing", "Load Testing", "Test Matrix Design"],
            "projects": ["Automated cross-browser regression test suite integrated into CI pipeline"],
            "next_assessment": "Automated Testing Frameworks & Boundary Value Verification"
        },
        "Embedded / IoT Systems Engineer": {
            "title": "Embedded / IoT Systems Engineer",
            "category": "TECH",
            "department_bias": "Medium",
            "description": "Programs microcontrollers, sensor interfaces, firmware, and edge computing hardware architectures.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.30,
                "Data Structures & Algorithms": 0.25,
                "Quality Orientation": 0.25,
                "Work Commitment & Reliability": 0.20
            },
            "skills": ["C/C++", "RTOS", "Microcontrollers (STM32/ESP32)", "I2C/SPI Protocols", "Hardware Debugging"],
            "projects": ["Low-power telemetry sensor node transmitting encrypted data via MQTT"],
            "next_assessment": "Embedded C Hardware Abstraction & Real-Time Constraints Assessment"
        },
        "Database Administrator": {
            "title": "Database Administrator",
            "category": "TECH",
            "department_bias": "Low",
            "description": "Ensures database availability, backups, replication, performance tuning, and security compliance.",
            "requirements": {
                "Relational Databases & SQL": 0.40,
                "Analytical Thinking & Problem Solving": 0.25,
                "Work Commitment & Reliability": 0.20,
                "Quality Orientation": 0.15
            },
            "skills": ["PostgreSQL/MySQL Administration", "Replication", "Query Profiling", "Backup Automation"],
            "projects": ["Automated database failover cluster with WAL archiving and point-in-time recovery"],
            "next_assessment": "Relational Storage Engines & High-Availability Disaster Recovery Exam"
        },
        "Systems Engineer": {
            "title": "Systems Engineer",
            "category": "TECH",
            "department_bias": "Low",
            "description": "Oversees enterprise operating systems, hardware provisioning, virtualization, and server environments.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.30,
                "Work Commitment & Reliability": 0.25,
                "Accountability & Ownership": 0.25,
                "Quality Orientation": 0.20
            },
            "skills": ["Linux Kernel Configuration", "Shell Scripting", "Networking", "Virtualization"],
            "projects": ["Automated bare-metal server provisioning workflow with Ansible"],
            "next_assessment": "Linux Enterprise System Administration & Network Protocols Assessment"
        },
        "Network Engineer": {
            "title": "Network Engineer",
            "category": "TECH",
            "department_bias": "Low",
            "description": "Architects, deploys, and troubleshoots enterprise local and wide area network infrastructures.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.35,
                "Work Commitment & Reliability": 0.25,
                "Stress Management & Resilience": 0.20,
                "Communication": 0.20
            },
            "skills": ["TCP/IP", "BGP/OSPF Routing", "VLANs", "Firewalls", "Wireshark Packet Analysis"],
            "projects": ["Enterprise multi-VLAN topology design with dynamic routing and firewall policies"],
            "next_assessment": "Network Protocol Packet Analysis & Routing Configuration Test"
        },
        "Technical Consultant": {
            "title": "Technical Consultant",
            "category": "TECH",
            "department_bias": "Low",
            "description": "Advises clients on technological modernization, enterprise architecture, and digital transformation.",
            "requirements": {
                "Communication": 0.30,
                "Analytical Thinking & Problem Solving": 0.25,
                "Customer Orientation": 0.25,
                "Accountability & Ownership": 0.20
            },
            "skills": ["Enterprise Architecture", "Client Presentations", "Requirements Gathering", "Technology Evaluation"],
            "projects": ["Legacy system cloud migration strategy document with ROI projection"],
            "next_assessment": "Client Case Study Presentation & Technical Requirements Analysis"
        },
        "Application Support Engineer": {
            "title": "Application Support Engineer",
            "category": "TECH",
            "department_bias": "Low",
            "description": "Diagnoses, troubleshoots, and resolves enterprise production application defects and user escalations.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.25,
                "Customer Orientation": 0.25,
                "Stress Management & Resilience": 0.25,
                "Communication": 0.25
            },
            "skills": ["Log Analysis", "SQL Debugging", "Root Cause Analysis (RCA)", "Ticketing Systems", "SLA Management"],
            "projects": ["Automated log error parser generating real-time triage alerts"],
            "next_assessment": "Live Incident Triage & Production Root Cause Analysis Simulation"
        },
        "Automation Engineer": {
            "title": "Automation Engineer",
            "category": "TECH",
            "department_bias": "Low",
            "description": "Builds robotic process automation (RPA) workflows and industrial automated execution scripts.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.30,
                "Quality Orientation": 0.30,
                "Python": 0.20,
                "Work Commitment & Reliability": 0.20
            },
            "skills": ["Scripting", "Workflow Automation", "API Integration", "Process Mapping"],
            "projects": ["Automated multi-system reconciliation bot replacing manual monthly spreadsheets"],
            "next_assessment": "Process Automation & Integration Scripting Challenge"
        },

        # =========================================================================
        # 2. NON-TECHNICAL / MANAGEMENT CAREERS (17 Roles)
        # =========================================================================
        "Business Analyst": {
            "title": "Business Analyst",
            "category": "NON_TECH",
            "department_bias": "Zero",
            "description": "Bridges business stakeholders with engineering teams by eliciting requirements, analyzing data, and mapping processes.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.25,
                "Communication": 0.25,
                "Customer Orientation": 0.20,
                "Decision Making": 0.15,
                "Accountability & Ownership": 0.15
            },
            "skills": ["BRD/FRD Documentation", "User Stories", "BPMN Process Modeling", "Stakeholder Interviews", "Excel Modeling"],
            "projects": ["Comprehensive Business Requirements Document (BRD) and process flow for an onboarding workflow"],
            "next_assessment": "Business Case Analysis & Requirements Elicitation Case Study"
        },
        "Management Trainee": {
            "title": "Management Trainee",
            "category": "NON_TECH",
            "department_bias": "Zero",
            "description": "Fast-track general management role rotating across operations, strategy, finance, and people management.",
            "requirements": {
                "Leadership & Influence": 0.25,
                "Learning Agility & Growth Mindset": 0.25,
                "Communication": 0.20,
                "Decision Making": 0.15,
                "Adaptability": 0.15
            },
            "skills": ["Cross-functional Leadership", "Executive Presentations", "Strategic Planning", "Financial Basics"],
            "projects": ["Departmental resource allocation strategy and 1-year operational milestone plan"],
            "next_assessment": "Executive Leadership Assessment & Situational Management Simulation"
        },
        "Operations Analyst": {
            "title": "Operations Analyst",
            "category": "NON_TECH",
            "department_bias": "Zero",
            "description": "Optimizes internal business workflows, supply bottlenecks, resource utilization, and operational KPIs.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.30,
                "Time Management & Organization": 0.25,
                "Work Commitment & Reliability": 0.25,
                "Quality Orientation": 0.20
            },
            "skills": ["Process Flowcharting", "Spreadsheet Modeling", "KPI Dashboards", "Root Cause Analysis"],
            "projects": ["Warehouse fulfillment bottleneck analysis reducing turnaround time by 18%"],
            "next_assessment": "Operational Efficiency Case Study & Process Optimization Test"
        },
        "Project Coordinator": {
            "title": "Project Coordinator",
            "category": "NON_TECH",
            "department_bias": "Zero",
            "description": "Facilitates project schedules, milestone tracking, resource allocation, and team status reporting.",
            "requirements": {
                "Time Management & Organization": 0.30,
                "Communication": 0.25,
                "Teamwork & Collaboration": 0.25,
                "Accountability & Ownership": 0.20
            },
            "skills": ["Jira/Asana", "Gantt Charts", "Meeting Facilitation", "Risk Logs", "Status Reporting"],
            "projects": ["Cross-functional product release schedule with dependency critical path mapping"],
            "next_assessment": "Project Milestone & Risk Management Simulation"
        },
        "Project Management Associate": {
            "title": "Project Management Associate",
            "category": "NON_TECH",
            "department_bias": "Zero",
            "description": "Assists project managers in executing structured deliverable lifecycles, budgets, and change control.",
            "requirements": {
                "Time Management & Organization": 0.25,
                "Leadership & Influence": 0.25,
                "Communication": 0.25,
                "Decision Making": 0.25
            },
            "skills": ["Agile/Scrum", "Scope Management", "Budget Tracking", "Stakeholder Communication"],
            "projects": ["Complete project charter and sprint burn-down tracking template"],
            "next_assessment": "Agile Sprint Planning & Scope Management Assessment"
        },
        "Product Operations Specialist": {
            "title": "Product Operations Specialist",
            "category": "NON_TECH",
            "department_bias": "Zero",
            "description": "Aligns product feedback loops, feature rollouts, internal training, and user adoption metrics.",
            "requirements": {
                "Customer Orientation": 0.25,
                "Analytical Thinking & Problem Solving": 0.25,
                "Communication": 0.25,
                "Adaptability": 0.25
            },
            "skills": ["Product Analytics", "Feature Rollout Playbooks", "User Feedback Triage", "Cross-team Enablement"],
            "projects": ["Product launch operational readiness playbook with automated feedback aggregation"],
            "next_assessment": "Product Rollout Strategy & Feedback Loop Case Study"
        },
        "HR Analyst": {
            "title": "HR Analyst",
            "category": "NON_TECH",
            "department_bias": "Zero",
            "description": "Analyzes workforce metrics, talent retention patterns, employee compensation, and hiring funnels.",
            "requirements": {
                "Emotional Intelligence": 0.30,
                "Analytical Thinking & Problem Solving": 0.25,
                "Integrity & Ethics": 0.25,
                "Communication": 0.20
            },
            "skills": ["HR Analytics", "Retention Metrics", "Survey Design", "Confidential Data Handling"],
            "projects": ["Employee attrition predictive analysis and retention policy recommendations"],
            "next_assessment": "People Analytics & Workforce Strategy Assessment"
        },
        "Recruitment / Talent Acquisition Associate": {
            "title": "Recruitment / Talent Acquisition Associate",
            "category": "NON_TECH",
            "department_bias": "Zero",
            "description": "Sources, screens, interviews, and closes high-caliber candidates for enterprise hiring pipelines.",
            "requirements": {
                "Communication": 0.30,
                "Emotional Intelligence": 0.25,
                "Time Management & Organization": 0.25,
                "Customer Orientation": 0.20
            },
            "skills": ["Candidate Sourcing", "Competency-based Interviewing", "ATS Management", "Offer Negotiation"],
            "projects": ["Campus recruitment hiring drive campaign with structured evaluation rubrics"],
            "next_assessment": "Candidate Screening & Competency Interview Simulation"
        },
        "Customer Success Associate": {
            "title": "Customer Success Associate",
            "category": "NON_TECH",
            "department_bias": "Zero",
            "description": "Drives customer retention, onboarding enablement, quarterly reviews, and renewal expansion.",
            "requirements": {
                "Customer Orientation": 0.35,
                "Communication": 0.25,
                "Conflict Resolution": 0.20,
                "Emotional Intelligence": 0.20
            },
            "skills": ["Account Health Monitoring", "Customer Onboarding", "QBR Presentations", "De-escalation"],
            "projects": ["SaaS customer onboarding journey mapping with milestone check-in playbook"],
            "next_assessment": "Customer Health Review & Retention Case Study"
        },
        "Technical Sales Associate": {
            "title": "Technical Sales Associate",
            "category": "NON_TECH",
            "department_bias": "Zero",
            "description": "Conducts consultative sales discovery, product demonstrations, and closes technology enterprise contracts.",
            "requirements": {
                "Communication": 0.35,
                "Customer Orientation": 0.25,
                "Achievement Orientation": 0.20,
                "Leadership & Influence": 0.20
            },
            "skills": ["Solution Selling", "Pitch Presentations", "Objection Handling", "Sales Pipeline CRM"],
            "projects": ["Enterprise consultative sales pitch deck and competitive positioning battlecard"],
            "next_assessment": "Consultative Sales Discovery & Pitch Demonstration Test"
        },
        "Business Development Associate": {
            "title": "Business Development Associate",
            "category": "NON_TECH",
            "department_bias": "Zero",
            "description": "Generates outbound enterprise leads, explores strategic partnerships, and expands market presence.",
            "requirements": {
                "Achievement Orientation": 0.30,
                "Communication": 0.30,
                "Learning Agility & Growth Mindset": 0.20,
                "Stress Management & Resilience": 0.20
            },
            "skills": ["Outreach Campaigns", "Market Research", "Prospecting", "Relationship Building"],
            "projects": ["Outbound B2B market entry strategy report targeting mid-market enterprises"],
            "next_assessment": "B2B Market Prospecting & Outreach Simulation"
        },
        "Consulting Analyst": {
            "title": "Consulting Analyst",
            "category": "NON_TECH",
            "department_bias": "Zero",
            "description": "Performs structured research, financial modeling, industry benchmarking, and strategic advisory.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.30,
                "Communication": 0.25,
                "Learning Agility & Growth Mindset": 0.25,
                "Quality Orientation": 0.20
            },
            "skills": ["Hypothesis-driven Problem Solving", "Executive Deck Building", "Financial Modeling", "Market Sizing"],
            "projects": ["Strategic market entry case study presentation with unit economics model"],
            "next_assessment": "Management Consulting Case Interview Assessment"
        },
        "Marketing Analytics Specialist": {
            "title": "Marketing Analytics Specialist",
            "category": "NON_TECH",
            "department_bias": "Zero",
            "description": "Evaluates digital campaign performance, attribution modeling, customer acquisition costs, and conversion funnels.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.30,
                "Customer Orientation": 0.25,
                "Innovation": 0.25,
                "Communication": 0.20
            },
            "skills": ["Google Analytics", "A/B Testing", "CAC/LTV Modeling", "Campaign Attribution"],
            "projects": ["Digital advertising attribution analysis recommending budget reallocation"],
            "next_assessment": "Marketing Attribution Modeling & A/B Test Design Test"
        },
        "Supply Chain Analyst": {
            "title": "Supply Chain Analyst",
            "category": "NON_TECH",
            "department_bias": "Zero",
            "description": "Monitors vendor logistics, inventory levels, procurement cycles, and freight cost optimizations.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.30,
                "Time Management & Organization": 0.25,
                "Work Commitment & Reliability": 0.25,
                "Decision Making": 0.20
            },
            "skills": ["Inventory Modeling", "Logistics Planning", "Procurement Analytics", "Supplier Risk Analysis"],
            "projects": ["Multi-tier supplier lead-time risk mitigation model"],
            "next_assessment": "Supply Chain Inventory Optimization Case Study"
        },
        "Process Excellence Analyst": {
            "title": "Process Excellence Analyst",
            "category": "NON_TECH",
            "department_bias": "Zero",
            "description": "Applies Lean Six Sigma methodologies to eliminate waste, standardize standard operating procedures (SOPs), and improve throughput.",
            "requirements": {
                "Quality Orientation": 0.35,
                "Analytical Thinking & Problem Solving": 0.25,
                "Accountability & Ownership": 0.20,
                "Communication": 0.20
            },
            "skills": ["Lean Six Sigma", "Value Stream Mapping", "Root Cause Analysis", "SOP Documentation"],
            "projects": ["Process cycle time reduction study eliminating redundant manual approvals"],
            "next_assessment": "Lean Six Sigma Process Optimization Assessment"
        },
        "Quality Operations Associate": {
            "title": "Quality Operations Associate",
            "category": "NON_TECH",
            "department_bias": "Zero",
            "description": "Audits operational compliance, enforces governance standards, and verifies quality benchmarks.",
            "requirements": {
                "Quality Orientation": 0.35,
                "Integrity & Ethics": 0.25,
                "Work Commitment & Reliability": 0.20,
                "Accountability & Ownership": 0.20
            },
            "skills": ["Compliance Auditing", "Quality Standards", "Checklist Verification", "Documentation"],
            "projects": ["Standard Operating Procedure audit report across operational fulfillment centers"],
            "next_assessment": "Quality Auditing & Compliance Verification Test"
        },
        "Program Coordinator": {
            "title": "Program Coordinator",
            "category": "NON_TECH",
            "department_bias": "Zero",
            "description": "Manages cross-department initiatives, institutional schedules, resource logistics, and stakeholder alignments.",
            "requirements": {
                "Time Management & Organization": 0.30,
                "Communication": 0.25,
                "Teamwork & Collaboration": 0.25,
                "Leadership & Influence": 0.20
            },
            "skills": ["Multi-project Scheduling", "Event Logistics", "Stakeholder Communication", "Budget Alignment"],
            "projects": ["Institutional initiative tracking blueprint coordinating 5 cross-functional teams"],
            "next_assessment": "Program Administration & Logistics Case Study"
        },

        # =========================================================================
        # 3. CROSS-DOMAIN CAREERS (10 Roles)
        # =========================================================================
        "Product Analyst": {
            "title": "Product Analyst",
            "category": "CROSS_DOMAIN",
            "department_bias": "Low",
            "description": "Combines quantitative product telemetry, user behavioral analytics, and UX experimentation to guide feature roadmaps.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.30,
                "Customer Orientation": 0.25,
                "Communication": 0.20,
                "Innovation": 0.15,
                "Decision Making": 0.10
            },
            "skills": ["User Telemetry (Mixpanel/Amplitude)", "SQL", "A/B Testing", "Funnel Conversion Modeling"],
            "projects": ["Feature adoption funnel analysis identifying key drop-off point and redesign proposal"],
            "next_assessment": "Product Metrics Funnel Analysis & Experimentation Strategy Sprint"
        },
        "Technology Solutions Consultant": {
            "title": "Technology Solutions Consultant",
            "category": "CROSS_DOMAIN",
            "department_bias": "Low",
            "description": "Evaluates enterprise business workflows and architects customized technological solution integrations.",
            "requirements": {
                "Communication": 0.30,
                "Analytical Thinking & Problem Solving": 0.25,
                "Customer Orientation": 0.25,
                "Accountability & Ownership": 0.20
            },
            "skills": ["Solution Design", "API Integrations", "Client Scoping", "Architecture Diagrams"],
            "projects": ["Enterprise CRM and ERP integration solution architecture blueprint"],
            "next_assessment": "Enterprise Integration Architecture & Client Scoping Simulation"
        },
        "Solutions Architect Associate": {
            "title": "Solutions Architect Associate",
            "category": "CROSS_DOMAIN",
            "department_bias": "Low",
            "description": "Translates business requirements into resilient, secure, and scalable cloud application architectures.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.30,
                "Quality Orientation": 0.25,
                "Communication": 0.25,
                "Decision Making": 0.20
            },
            "skills": ["Cloud Topologies", "Security Best Practices", "Cost Optimization", "High Availability Design"],
            "projects": ["Disaster recovery architecture plan for critical transactional workloads"],
            "next_assessment": "Cloud Solution Architecture & Cost Optimization Exam"
        },
        "Business Systems Analyst": {
            "title": "Business Systems Analyst",
            "category": "CROSS_DOMAIN",
            "department_bias": "Low",
            "description": "Specializes in enterprise software configuration (ERP/CRM), data mapping, and business system workflows.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.30,
                "Communication": 0.25,
                "Relational Databases & SQL": 0.25,
                "Accountability & Ownership": 0.20
            },
            "skills": ["ERP/CRM Configuration", "Data Schema Mapping", "User Acceptance Testing (UAT)", "SQL Queries"],
            "projects": ["Enterprise billing system data schema migration and UAT verification plan"],
            "next_assessment": "Business Systems Configuration & Data Migration Assessment"
        },
        "Implementation Consultant": {
            "title": "Implementation Consultant",
            "category": "CROSS_DOMAIN",
            "department_bias": "Low",
            "description": "Deploys enterprise SaaS platforms for corporate clients, configuring workflows, integrations, and training.",
            "requirements": {
                "Customer Orientation": 0.30,
                "Communication": 0.25,
                "Analytical Thinking & Problem Solving": 0.25,
                "Time Management & Organization": 0.20
            },
            "skills": ["SaaS Onboarding", "Client Configuration", "Data Import/Export", "User Training"],
            "projects": ["Enterprise software rollout schedule with cutover checklist and user guide"],
            "next_assessment": "Client Software Implementation & Cutover Management Case"
        },
        "Pre-Sales Solutions Engineer": {
            "title": "Pre-Sales Solutions Engineer",
            "category": "CROSS_DOMAIN",
            "department_bias": "Low",
            "description": "Partners with sales executives to deliver technical proof-of-concepts (POCs), RFPs, and tailored client demos.",
            "requirements": {
                "Communication": 0.35,
                "Customer Orientation": 0.25,
                "Analytical Thinking & Problem Solving": 0.20,
                "Innovation": 0.20
            },
            "skills": ["Technical POCs", "RFP Responses", "Live Demonstrations", "Objection Handling"],
            "projects": ["Custom Proof-of-Concept demonstration addressing complex security RFP criteria"],
            "next_assessment": "Live RFP Response & Technical Demonstration Challenge"
        },
        "Technical Program Coordinator": {
            "title": "Technical Program Coordinator",
            "category": "CROSS_DOMAIN",
            "department_bias": "Low",
            "description": "Coordinates multi-team engineering roadmaps, unblocks technical dependencies, and tracks release schedules.",
            "requirements": {
                "Time Management & Organization": 0.30,
                "Communication": 0.25,
                "Analytical Thinking & Problem Solving": 0.25,
                "Leadership & Influence": 0.20
            },
            "skills": ["Technical Roadmapping", "Dependency Management", "Release Coordination", "Agile at Scale"],
            "projects": ["Multi-sprint engineering release readiness matrix across 4 microservice squads"],
            "next_assessment": "Technical Dependency & Multi-Team Release Planning Sprint"
        },
        "Data-Driven Operations Analyst": {
            "title": "Data-Driven Operations Analyst",
            "category": "CROSS_DOMAIN",
            "department_bias": "Low",
            "description": "Applies SQL and quantitative metrics to solve operational logjams and optimize service level agreements.",
            "requirements": {
                "Analytical Thinking & Problem Solving": 0.30,
                "Relational Databases & SQL": 0.25,
                "Time Management & Organization": 0.25,
                "Communication": 0.20
            },
            "skills": ["SQL Aggregations", "Operational Dashboards", "SLA Optimization", "Process Modeling"],
            "projects": ["Automated SLA breach prediction dashboard with automated escalation triggers"],
            "next_assessment": "Operational SQL Analysis & Metric Dashboarding Test"
        },
        "Technical Product Operations Lead": {
            "title": "Technical Product Operations Lead",
            "category": "CROSS_DOMAIN",
            "department_bias": "Low",
            "description": "Oversees end-to-end technical product rollout, operational governance, and client support escalation channels.",
            "requirements": {
                "Accountability & Ownership": 0.30,
                "Communication": 0.25,
                "Analytical Thinking & Problem Solving": 0.25,
                "Customer Orientation": 0.20
            },
            "skills": ["Product Telemetry", "Incident Management", "Cross-team Governance", "Executive Reporting"],
            "projects": ["Operational excellence framework for enterprise B2B SaaS platform launch"],
            "next_assessment": "Product Governance & Incident Response Case Simulation"
        },
        "Digital Transformation Analyst": {
            "title": "Digital Transformation Analyst",
            "category": "CROSS_DOMAIN",
            "department_bias": "Low",
            "description": "Assists enterprises in transitioning analog and legacy workflows into modern cloud and automated digital tools.",
            "requirements": {
                "Learning Agility & Growth Mindset": 0.30,
                "Analytical Thinking & Problem Solving": 0.25,
                "Communication": 0.25,
                "Adaptability": 0.20
            },
            "skills": ["Digital Auditing", "Change Management", "Cloud Tooling", "Workflow Modernization"],
            "projects": ["Departmental paper-to-cloud transformation feasibility study and roadmap"],
            "next_assessment": "Digital Transformation Strategy & Change Management Case"
        }
    }

    @classmethod
    def get_all_roles(cls) -> List[Dict[str, Any]]:
        return list(cls.CAREER_PROFILES.values())

    @classmethod
    def get_role(cls, title: str) -> Optional[Dict[str, Any]]:
        return cls.CAREER_PROFILES.get(title)

    @classmethod
    def get_tech_roles(cls) -> List[Dict[str, Any]]:
        return [r for r in cls.CAREER_PROFILES.values() if r.get("category") == "TECH"]

    @classmethod
    def get_non_tech_roles(cls) -> List[Dict[str, Any]]:
        return [r for r in cls.CAREER_PROFILES.values() if r.get("category") == "NON_TECH"]

    @classmethod
    def get_cross_domain_roles(cls) -> List[Dict[str, Any]]:
        return [r for r in cls.CAREER_PROFILES.values() if r.get("category") == "CROSS_DOMAIN"]
