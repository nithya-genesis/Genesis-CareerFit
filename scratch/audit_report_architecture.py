import os
import re
import json

def audit_html_pages():
    with open("templates/report_template.html", "r", encoding="utf-8") as f:
        html = f.read()

    pages = re.split(r'<div class="page[^>]*">', html)
    print(f"Total HTML pages split: {len(pages)-1}")
    
    page_map = []
    for i, p in enumerate(pages[1:], 1):
        # Extract title
        h1 = re.search(r'<h1>(.*?)</h1>', p, re.DOTALL)
        title = h1.group(1).strip() if h1 else ("COVER PAGE" if i == 1 else f"PAGE {i}")
        # Clean tags from title
        title = re.sub(r'<[^>]+>', '', title).strip()
        
        # Subheaders/Banners
        banners = re.findall(r'<div class="banner"[^>]*>(.*?)</div>', p, re.DOTALL)
        clean_banners = [re.sub(r'<[^>]+>', '', b).strip() for b in banners]
        
        # Section titles
        h2s = re.findall(r'<h[234][^>]*>(.*?)</h[234]>', p, re.DOTALL)
        clean_h2s = [re.sub(r'<[^>]+>', '', h).strip() for h in h2s]
        
        # Jinja variables
        vars_found = sorted(list(set(re.findall(r'\{\{\s*([a-zA-Z0-9_\.\[\]\'\"]+)\s*\}\}', p))))
        
        # Hardcoded numerical occurrences
        hardcoded = []
        for pat in [r'\b8\.5\b', r'\b8\.2\b', r'\b72\.0\b', r'\b75\.0\b', r'\b80\.0\b', r'Aarav', r'750', r'650', r'85%']:
            matches = re.findall(pat, p)
            if matches:
                hardcoded.append(f"{pat}: {len(matches)} occurrences")
                
        page_map.append({
            "page": i,
            "title": title,
            "banners": clean_banners,
            "sections": clean_h2s[:4],
            "variables": vars_found,
            "hardcoded": hardcoded,
            "char_len": len(p)
        })
    
    return page_map

def audit_hardcoded_constants():
    report_files = [
        "templates/report_template.html",
        "engines/multi_report_engine.py",
        "engines/pdf_engine.py",
        "engines/report_engine.py",
        "services/report_service.py",
        "models/report.py",
        "server.py"
    ]
    findings = {}
    patterns = [r'\b8\.5\b', r'\b8\.2\b', r'\b72\.0\b', r'\b75\.0\b', r'\b80\.0\b', r'Aarav', r'750\s*/\s*800', r'Mock PDF', r'weasyprint']
    
    for fpath in report_files:
        if not os.path.exists(fpath):
            continue
        with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
        
        file_matches = []
        for line_num, line in enumerate(lines, 1):
            for pat in patterns:
                if re.search(pat, line, re.IGNORECASE):
                    file_matches.append((line_num, pat, line.strip()))
        findings[fpath] = file_matches
    return findings

if __name__ == "__main__":
    pm = audit_html_pages()
    for p in pm:
        print(f"==================================================")
        print(f"PAGE {p['page']}: {p['title']}")
        print(f"  Banners: {p['banners']}")
        print(f"  Sections: {p['sections']}")
        print(f"  Jinja Variables ({len(p['variables'])}): {p['variables']}")
        print(f"  Hardcoded Matches: {p['hardcoded']}")
    
    print("\n==================================================")
    print("CODEBASE HARDCODED / MOCK SCAN:")
    print("==================================================")
    hd = audit_hardcoded_constants()
    for fpath, matches in hd.items():
        print(f"\nFile: {fpath} ({len(matches)} matches)")
        for line_num, pat, line in matches[:10]:
            print(f"  Line {line_num} [{pat}]: {line[:120]}")
