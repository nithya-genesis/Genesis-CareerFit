import os
import subprocess
import pypdf

exe = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
html_content = """<!DOCTYPE html>
<html>
<head>
<style>
@page { size: A4; margin: 0; }
.page { page-break-after: always; height: 297mm; width: 210mm; padding: 20mm; box-sizing: border-box; }
</style>
</head>
<body>
<div class="page"><h1>Page 1</h1></div>
<div class="page"><h1>Page 2</h1></div>
</body>
</html>"""

os.makedirs('scratch', exist_ok=True)
html_path = os.path.abspath('scratch/test_print.html')
pdf_path = os.path.abspath('scratch/test_print.pdf')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

cmd = [
    exe,
    '--headless',
    '--disable-gpu',
    '--no-pdf-header-footer',
    f'--print-to-pdf={pdf_path}',
    html_path
]

res = subprocess.run(cmd, capture_output=True, text=True)
print('Return code:', res.returncode)
print('PDF exists:', os.path.exists(pdf_path))
if os.path.exists(pdf_path):
    size = os.path.getsize(pdf_path)
    print('PDF size:', size, 'bytes')
    reader = pypdf.PdfReader(pdf_path)
    print('Page count:', len(reader.pages))
