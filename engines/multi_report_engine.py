import os
from typing import Dict, Any, List, Optional
from services.report_service import generate_candidate_pdf

def build_requested_reports(profile_dict: Dict[str, Any], output_dir: str = "outputs", formats: Optional[List[str]] = None, interpretation_data: Optional[Dict[str, Any]] = None) -> Dict[str, str]:
    """
    Directs report compilation to the unified report service and headless PDF compiler.
    Zero mock/fabricated PDF generation.
    """
    os.makedirs(output_dir, exist_ok=True)
    pdf_path = generate_candidate_pdf(profile_dict, output_dir=output_dir, interpretation_data=interpretation_data)
    return {"dossier": pdf_path}
