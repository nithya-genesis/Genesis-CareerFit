import os
import re
import time
import json
import uuid
import logging
from typing import Dict, Any, List, Optional
import pandas as pd

from engines.discovery_engine import DiscoveryEngine
from engines.technical_engine import TechnicalEngine
from engines.psychometric_engine import PsychometricEngine
from engines.matcher_engine import MatcherEngine
from engines.evidence_engine import EvidenceEngine
from engines.pdf_engine import PDFEngine
from engines.career_engine import CareerEngine

logger = logging.getLogger(__name__)

class BatchPipelineEngine:
    """
    High-Throughput Batch Packaging, Run Isolation, & Fault-Tolerant Processing Engine.
    Executes end-to-end evaluation streams with non-blocking candidate error interception,
    generating uniform run manifests and placement telemetry datasets.
    """

    def __init__(self, output_root: str = 'outputs/runs'):
        self.output_root = output_root

    def create_run_workspace(self, run_label: Optional[str] = None) -> Dict[str, str]:
        run_id = f"{int(time.time())}_{uuid.uuid4().hex[:6]}"
        label_part = f"_{run_label}" if run_label else ""
        run_folder_name = f"run_{run_id}{label_part}"
        run_path = os.path.join(self.output_root, run_folder_name)

        reports_dir = os.path.join(run_path, 'individual_reports')
        manifests_dir = os.path.join(run_path, 'manifests')

        for d in [run_path, reports_dir, manifests_dir]:
            os.makedirs(d, exist_ok=True)

        return {
            'run_id': run_id,
            'run_path': run_path,
            'reports_dir': reports_dir,
            'manifests_dir': manifests_dir
        }

    def process_batch(
        self,
        df_assessments: pd.DataFrame,
        report_mode: str = 'Detailed Profile (10-15 Page)',
        run_label: Optional[str] = None
    ) -> Dict[str, Any]:
        start_time = time.time()
        workspace = self.create_run_workspace(run_label)

        total_candidates = len(df_assessments)

        # 1. Automatic Schema Discovery Cycle
        schema = DiscoveryEngine.discover_schema(df_assessments)
        id_cfg = schema.get('discovered_identity', {})
        domain_cfg = schema.get('domain_column_mapping', {})

        successful_records = []
        failed_records = []

        ce = CareerEngine()

        # 2. Candidate Evaluation Stream
        for idx, row in df_assessments.iterrows():
            cand_id_str = f"row_{idx+1}"
            try:
                # Check for bad or unparseable corrupted values if needed
                py_val = str(row.get('Python_score', '')).strip()
                if 'Corrupted' in py_val:
                    raise ValueError(f'Corrupted input detected in assessment column: {py_val}')

                # Resolve Demographic Keys
                cand_name = str(row.get(id_cfg.get('candidate_name'), f"Candidate_{idx+1}")).strip()
                usn = str(row.get(id_cfg.get('usn'), 'BLANK / NOT AVAILABLE')).strip()
                dept = str(row.get(id_cfg.get('department'), 'BLANK / NOT AVAILABLE')).strip()
                college = str(row.get(id_cfg.get('college'), 'BLANK / NOT AVAILABLE')).strip()
                cgpa = str(row.get(id_cfg.get('cgpa'), 'Data Not Available')).strip()

                # Evaluate Dimensions
                tech_results = TechnicalEngine.evaluate_candidate_assessments(row, domain_cfg)
                psych_results = PsychometricEngine.evaluate_psychometric_responses(row, schema.get('question_columns', []))

                # Career Fitting against Registry taxonomy
                eligible_roles = ce.get_eligible_roles(dept)
                
                matched_ranks = []
                for role in eligible_roles:
                    candidate_profile = {
                        'department': dept,
                        'cgpa': cgpa,
                        'technical_results': tech_results,
                        'psychometric_results': psych_results
                    }
                    fit_data = MatcherEngine.evaluate_role_fit(candidate_profile, role)
                    matched_ranks.append(fit_data)

                # Sort by suitability score descending
                matched_ranks.sort(key=lambda x: x['suitability_score'], reverse=True)
                top_role_set = matched_ranks if matched_ranks else [{'role_name': 'General Technical Track', 'suitability_score': 70.0, 'fit_level': 'Placement Ready'}]

                # Pack Layer 1 data elements
                candidate_meta = {'candidate_name': cand_name, 'usn': usn, 'department': dept, 'college': college, 'cgpa': cgpa}
                ev_pack = EvidenceEngine.build_evidence_pack(candidate_meta, tech_results, psych_results, top_role_set)

                # Render & Compile Individual Artifact
                safe_name = re.sub(r'[^a-zA-Z0-9_-]', '_', cand_name)
                pdf_path = os.path.join(workspace['reports_dir'], f"{safe_name}_{usn}.pdf")
                PDFEngine.generate_pdf_report(ev_pack, pdf_path, report_mode=report_mode)

                summary_entry = {
                    'candidate_name': cand_name,
                    'usn': usn,
                    'department': dept,
                    'cgpa': cgpa,
                    'employability_index': ev_pack['validated_metrics']['psychometric_summary'].get('overall_pct', 'N/A'),
                    'top_recommended_role': top_role_set[0]['role_name'],
                    'suitability_score': top_role_set[0]['suitability_score'],
                    'fit_level': top_role_set[0]['fit_level'],
                    'pdf_report_path': pdf_path
                }
                successful_records.append(summary_entry)

            except Exception as e:
                logger.error(f"Error processing record line {idx+1}: {e}")
                failed_records.append({
                    'row_index': idx + 1,
                    'candidate_id': cand_id_str,
                    'error_type': type(e).__name__,
                    'error_message': str(e)
                })

        # 3. Write Summary Telemetry Manifests
        df_summary = pd.DataFrame(successful_records)
        summary_csv_path = os.path.join(workspace['manifests_dir'], 'batch_summary.csv')
        df_summary.to_csv(summary_csv_path, index=False)

        failure_manifest_path = os.path.join(workspace['manifests_dir'], 'failure_manifest.json')
        with open(failure_manifest_path, 'w', encoding='utf-8') as f:
            json.dump(failed_records, f, indent=2)

        elapsed = time.time() - start_time

        run_manifest = {
            'run_id': workspace['run_id'],
            'execution_timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'report_mode': report_mode,
            'total_candidates': total_candidates,
            'successful_count': len(successful_records),
            'failed_count': len(failed_records),
            'elapsed_seconds': round(elapsed, 2),
            'summary_csv': summary_csv_path,
            'failure_manifest': failure_manifest_path
        }

        run_manifest_path = os.path.join(workspace['manifests_dir'], 'run_manifest.json')
        with open(run_manifest_path, 'w', encoding='utf-8') as f:
            json.dump(run_manifest, f, indent=2)

        return run_manifest
