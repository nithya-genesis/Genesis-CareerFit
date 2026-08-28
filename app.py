import os
import io
import pandas as pd
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from engines.discovery_engine import DatasetDiscoveryEngine
from engines.profile_builder import build_student_profile
from engines.multi_report_engine import build_requested_reports
from engines.report_engine import create_reports_zip

app = FastAPI(title="Genesis CareerFit Placement Intelligence API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OUTPUT_DIR = os.path.abspath("outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.get("/")
def root():
    return {"status": "ONLINE", "service": "Genesis CareerFit FastAPI Engine"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/api/dashboard/stats")
def dashboard_stats():
    return {
        "total_evaluations": 10,
        "average_readiness": "78.5%",
        "top_career_domain": "Technology & Analytics",
        "hiring_rate": "85%"
    }

@app.post("/api/discover")
async def discover_schema(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith((".xls", ".xlsx")):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format.")
        manifest = DatasetDiscoveryEngine.discover_dataset(df, file_name=file.filename)
        return JSONResponse(content={"status": "SUCCESS", "manifest": manifest})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/evaluate")
async def evaluate_dataset(file: UploadFile = File(...), report_format: Optional[str] = Form("dossier")):
    try:
        contents = await file.read()
        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith((".xls", ".xlsx")):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format.")

        for existing in os.listdir(OUTPUT_DIR):
            fpath = os.path.join(OUTPUT_DIR, existing)
            if os.path.isfile(fpath):
                try: os.remove(fpath)
                except OSError: pass

        records = df.to_dict(orient="records")
        generated_pdfs = []
        candidate_summaries = []

        for idx, row in enumerate(records):
            profile = build_student_profile(row, idx=idx)
            rendered = build_requested_reports(profile, output_dir=OUTPUT_DIR, formats=["dossier"])
            dossier_path = rendered.get("dossier")
            if dossier_path and os.path.exists(dossier_path):
                generated_pdfs.append(dossier_path)

            candidate_summaries.append({
                "name": profile.get("student", {}).get("name"),
                "usn": profile.get("student", {}).get("usn"),
                "cgpa": profile.get("student", {}).get("cgpa_display"),
                "careerfit_index": profile.get("scores", {}).get("overall_index"),
                "verdict": profile.get("scores", {}).get("verdict"),
                "target_role": profile.get("career_recommendations", {}).get("primary_target", {}).get("role"),
                "suitability_match": profile.get("career_recommendations", {}).get("primary_target", {}).get("match_score"),
                "pdf_generated": bool(dossier_path)
            })

        zip_path = os.path.join(OUTPUT_DIR, "Generated_CareerFit_Reports.zip")
        if generated_pdfs:
            create_reports_zip(generated_pdfs, zip_path)

        return JSONResponse(content={
            "status": "SUCCESS",
            "total_candidates": len(candidate_summaries),
            "candidates": candidate_summaries,
            "zip_available": os.path.exists(zip_path),
            "zip_download_url": "/api/download/reports"
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download/reports")
def download_reports_zip():
    zip_path = os.path.join(OUTPUT_DIR, "Generated_CareerFit_Reports.zip")
    if not os.path.exists(zip_path):
        raise HTTPException(status_code=404, detail="No report archive found.")
    return FileResponse(path=zip_path, media_type="application/zip", filename="Generated_CareerFit_Reports.zip")

@app.get("/api/download/pdf/{filename}")
def download_single_pdf(filename: str):
    pdf_path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="PDF not found.")
    return FileResponse(path=pdf_path, media_type="application/pdf", filename=filename)
