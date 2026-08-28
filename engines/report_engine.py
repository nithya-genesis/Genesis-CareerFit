import os
import zipfile
from typing import List

def create_reports_zip(file_paths: List[str], output_zip_path: str = 'outputs/Generated_CareerFit_Reports.zip') -> str:
    if not file_paths:
        return output_zip_path

    os.makedirs(os.path.dirname(output_zip_path), exist_ok=True)

    if os.path.exists(output_zip_path):
        try:
            os.remove(output_zip_path)
        except OSError:
            pass

    valid_paths = [p for p in file_paths if os.path.exists(p) and os.path.getsize(p) > 0]
    if not valid_paths:
        return output_zip_path

    with zipfile.ZipFile(output_zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for file_path in valid_paths:
            arcname = os.path.basename(file_path)
            zip_file.write(file_path, arcname=arcname)

    print(f'[OK] [ZIP ARCHIVE READY]: {output_zip_path} ({len(valid_paths)} files)')
    return output_zip_path


class ReportEngine:
    create_reports_zip = staticmethod(create_reports_zip)
