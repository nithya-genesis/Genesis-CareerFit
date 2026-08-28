import os
import re
import json

with open("templates/report_template.html", "r", encoding="utf-8") as f:
    html = f.read()

pages = re.split(r'<div class="page[^>]*">', html)[1:]

print(f"Total Pages Analyzed: {len(pages)}\n")

for idx, p in enumerate(pages, 1):
    print(f"==================================================")
    print(f"PAGE {idx}")
    print(f"==================================================")
    
    # H1 / Page title
    h1 = re.search(r'<h1>(.*?)</h1>', p, re.DOTALL)
    title = re.sub(r'<[^>]+>', '', h1.group(1)).strip() if h1 else ("COVER PAGE" if idx == 1 else f"PAGE {idx}")
    print(f"Title: {title}")
    
    # Banners
    banners = re.findall(r'<div class="banner"[^>]*>(.*?)</div>', p, re.DOTALL)
    for b in banners:
        clean_b = " ".join(re.sub(r'<[^>]+>', ' ', b).split())
        print(f"  [BANNER]: {clean_b}")
        
    # Headings
    headings = re.findall(r'<h[234][^>]*>(.*?)</h[234]>', p, re.DOTALL)
    clean_h = [" ".join(re.sub(r'<[^>]+>', ' ', h).split()) for h in headings]
    if clean_h:
        print(f"  [HEADINGS]: {clean_h}")
        
    # Jinja Variables
    vars_found = sorted(list(set(re.findall(r'\{\{\s*([^}]+)\s*\}\}', p))))
    print(f"  [JINJA VARS ({len(vars_found)})]:")
    for v in vars_found:
        print(f"    - {v.strip()}")
        
    # Loops
    loops = re.findall(r'\{%\s*for\s+([^%]+)\s*%\}', p)
    if loops:
        print(f"  [LOOPS]: {loops}")
        
    # Conditionals
    ifs = re.findall(r'\{%\s*if\s+([^%]+)\s*%\}', p)
    if ifs:
        print(f"  [IFS]: {ifs}")
    print()
