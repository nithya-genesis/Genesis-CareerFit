import os
import pandas as pd

class IngestionEngine:
    """Handles universal spreadsheet reading across CSV, XLS, and XLSX formats."""
    
    @staticmethod
    def load_dataset(file_path: str) -> pd.DataFrame:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Dataset file not found: {file_path}")
            
        ext = os.path.splitext(file_path)[1].lower()
        
        try:
            if ext == '.csv':
                df = pd.read_csv(file_path)
            elif ext in ['.xls', '.xlsx']:
                xls = pd.ExcelFile(file_path)
                # Load first sheet by default
                df = pd.read_excel(xls, sheet_name=xls.sheet_names[0])
            else:
                raise ValueError(f"Unsupported file format: {ext}")
                
            # Clean dataframe: drop completely empty rows and columns
            df = df.dropna(how='all').dropna(how='all', axis=1)
            
            # Clean string headers
            df.columns = [str(c).strip() for c in df.columns]
            return df
            
        except Exception as e:
            raise RuntimeError(f"Error ingesting file {file_path}: {str(e)}")