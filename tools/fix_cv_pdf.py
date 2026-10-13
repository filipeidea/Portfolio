"""Non-destructive fixes to the exported CV PDF (the InDesign source is not in this repository).

Adds document metadata (title, author, subject, language) and makes the LinkedIn
address on page 1 a clickable link. The layout and text are not changed.

Usage: python3 tools/fix_cv_pdf.py <input.pdf> <output.pdf>
"""
import sys
import pdfplumber
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, TextStringObject
from pypdf.annotations import Link

src, dst = sys.argv[1], sys.argv[2]
URL = "https://www.linkedin.com/in/filipemeltzer"

# find the LinkedIn text on page 1
with pdfplumber.open(src) as pdf:
    page = pdf.pages[0]
    words = page.extract_words()
    hits = [w for w in words if "linkedin.com" in w["text"]]
    H = page.height

reader = PdfReader(src)
writer = PdfWriter(clone_from=reader)
for w in hits:
    # pdfplumber uses top-left origin; PDF uses bottom-left
    rect = (w["x0"] - 1, H - w["bottom"] - 1, w["x1"] + 1, H - w["top"] + 1)
    writer.add_annotation(page_number=0, annotation=Link(rect=rect, url=URL))
writer.add_metadata({
    "/Title": "Filipe Meltzer — Architect & Urbanist — CV",
    "/Author": "Filipe Meltzer",
    "/Subject": "Curriculum vitae: architect and urbanist based in São Paulo, Brazil",
    "/Keywords": "Filipe Meltzer, architect, urbanist, São Paulo, CV",
})
writer._root_object[NameObject("/Lang")] = TextStringObject("en")
with open(dst, "wb") as f:
    writer.write(f)
print("links added:", len(hits))
