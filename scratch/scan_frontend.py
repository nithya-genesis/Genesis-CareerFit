import os
import re

src_dir = "client/src"

def scan_frontend():
    print("=== FRONTEND CODEBASE SCAN ===")
    
    files = []
    for root, dirs, fnames in os.walk(src_dir):
        for fname in fnames:
            if fname.endswith(('.jsx', '.js', '.tsx', '.ts')):
                files.append(os.path.join(root, fname))
                
    hardcoded_patterns = {
        "750": r'\b750\b',
        "733": r'\b733\b',
        "88.89": r'\b88\.89\b',
        "88.9": r'\b88\.9\b',
        "88.6": r'\b88\.6\b',
        "80.0": r'\b80\.0\b',
        "75.0": r'\b75\.0\b',
        "72.0": r'\b72\.0\b',
        "62.0": r'\b62\.0\b',
        "Aarav Sharma": r'Aarav\s+Sharma',
        "Aarav": r'\bAarav\b',
        "mock": r'\bmock\b',
        "sample": r'\bsample\b',
        "demo": r'\bdemo\b',
        "placeholder": r'\bplaceholder\b'
    }
    
    results = {}
    api_calls = {}
    
    for f in sorted(files):
        rel_path = os.path.relpath(f, ".")
        with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
            content = fp.read()
            lines = content.splitlines()
            
        file_matches = []
        for line_num, line in enumerate(lines, 1):
            for pat_name, pat in hardcoded_patterns.items():
                if re.search(pat, line, re.IGNORECASE):
                    file_matches.append((line_num, pat_name, line.strip()))
                    
        if file_matches:
            results[rel_path] = file_matches
            
        # Scan API calls
        found_endpoints = re.findall(r'[\'"`](/api/[^\'"`]+)[\'"`]', content)
        if found_endpoints:
            api_calls[rel_path] = list(set(found_endpoints))
            
    print("\n--- HARDCODED / MOCK / DEMO MATCHES IN FRONTEND ---")
    for f, matches in results.items():
        print(f"\nFile: {f} ({len(matches)} matches)")
        for line_num, pat_name, line in matches[:8]:
            print(f"  L{line_num} [{pat_name}]: {line[:100]}")
            
    print("\n--- FRONTEND API ENDPOINT USAGE ---")
    for f, endpoints in api_calls.items():
        print(f"\nFile: {f}")
        for ep in endpoints:
            print(f"  -> {ep}")

if __name__ == "__main__":
    scan_frontend()
