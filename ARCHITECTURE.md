# GENESIS CAREERFIT — ARCHITECTURE & DATA FLOW SPECIFICATION

## 1. System Topology

```
                         [ React Vite Frontend ]
                     (Role-Aware Portals & Routes)
                                  |
               REST API & Streaming Excel / Headless PDF
                                  |
                                  v
                       [ FastAPI Server Engine ]
                 (Auth, Scope Guards, RBAC, Endpoints)
                                  |
        +-------------------------+-------------------------+
        |                         |                         |
        v                         v                         v
[ Canonical Scoring ]   [ Career Universe Engine ]  [ Report Generator ]
(Deterministic Scoring)   (45 Role Pathways Catalog) (12-Page & 6-Page PDF)
        |                         |                         |
        +-------------------------+-------------------------+
                                  |
                                  v
                     [ SQLite Database (WAL) ]
              (Foreign Keys, 14 Compound Multi-Tenant Indexes)
```

---

## 2. Canonical Scoring & Provenance Engine

The platform operates on a single canonical evaluation object:
- **`careerfit_raw_score`**: Integer between 200 and 800.
- **`careerfit_max_score`**: Fixed at 800.
- **`careerfit_percentage`**: Evaluated as `(raw_score / 800) * 100`.
- **`provenance`**: Every score references the specific assessment run and item responses that produced it.
- **Zero Fabrication**: Unassessed domains are never filled with dummy percentages.

---

## 3. Multi-Tenancy Scoping Model

- **Platform Admin**: Cross-tenant scope (`institution_id = "platform"`).
- **Placement Officer**: Bound to `user.institution_id`. All queries strictly filtered by institution.
- **Student**: Bound to `user.usn` and `user.student_id`. Anti-IDOR guards prevent accessing any other student records.
