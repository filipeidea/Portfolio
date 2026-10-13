"""Corrections made directly inside the exported CV PDF (the InDesign source was not available).

Original fonts, layout and images are kept. Text is edited in the page content
streams, so the corrected text is real, selectable and readable by ATS software.
Characters missing from the embedded font subsets are handled as follows:
  - '9' in Helvetica Light (Iguatemi area): the font's own '6' rotated 180°
    (identical in Helvetica's design);
  - '@' and 'ú' (email line, Balneário Camboriú label): TeX Gyre Heros Bold,
    a metric-compatible Helvetica clone (tools/fonts/heros-bold.ttf).

Usage: python3 tools/edit_cv_pdf.py <original.pdf> <output.pdf>
Edits (approved by Filipe, 12 Oct 2026):
  p1  "over seven years" -> "over eight years"; remove "Passionate about…" sentence;
      add email filipemeltzer@outlook.com; Iguatemi 306 area 41,400 -> 49,811 m²;
      LinkedIn and email as clickable links
  p1  "458,000+ m²" -> "492,000+ m²" (project spreadsheet, 13 Oct 2026)
  p2  "more than 450,000" -> "492,000+"; corporate 68,504 -> 76,947 m²; hotels 5,109 -> 2,653 m²
  p3  add Balneário Camboriú to the map
  all metadata (title, author, language)
"""
import io, re, sys, os
import pikepdf
from fontTools.cffLib import CFFFontSet
from fontTools.pens.boundsPen import BoundsPen
from pypdf import PdfReader, PdfWriter
from pypdf.annotations import Link
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

SRC, DST = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
EMAIL = "filipemeltzer@outlook.com"
LINKEDIN = "https://www.linkedin.com/in/filipemeltzer"
NAVY = (1, 0.9, 0.1, 0)  # CMYK used for the CV's navy text

pdf = pikepdf.open(SRC)


# ---------- font helpers ----------
def tounicode(font):
    m = {}
    data = font.ToUnicode.read_bytes().decode("latin1")
    for blk in re.findall(r"beginbfchar(.*?)endbfchar", data, re.S):
        for a, b in re.findall(r"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>", blk):
            m[int(a, 16)] = bytes.fromhex(b).decode("utf-16-be")
    for blk in re.findall(r"beginbfrange(.*?)endbfrange", data, re.S):
        for a, b, c in re.findall(r"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>", blk):
            for k in range(int(a, 16), int(b, 16) + 1):
                m[k] = chr(int(c, 16) + k - int(a, 16))
    return m


class Font:
    def __init__(self, f):
        self.f = f
        self.dec = tounicode(f)
        self.enc = {v: k for k, v in self.dec.items()}
        self.first = int(f.FirstChar)
        self.widths = [float(w) for w in f.Widths]

    def encode(self, s):
        return bytes(self.enc[ch] for ch in s)

    def width(self, code):
        return self.widths[code - self.first]

    def _charstring(self, ch):
        ff = self.f.FontDescriptor.FontFile3.read_bytes()
        cff = CFFFontSet(); cff.decompile(io.BytesIO(ff), None)
        top = cff[cff.fontNames[0]]
        return top, top.CharStrings[{"6": "six", "9": "nine", "+": "plus"}[ch]]

    def outline_ops(self, ch):
        """the glyph outline as PDF path operators, in font units"""
        from fontTools.pens.recordingPen import RecordingPen
        top, cs = self._charstring(ch)
        pen = RecordingPen(); cs.draw(pen)
        O = pikepdf.Operator; out = []
        cur = None
        for kind, pts in pen.value:
            if kind == "moveTo": out.append(([*pts[0]], O("m"))); cur = pts[0]
            elif kind == "lineTo": out.append(([*pts[0]], O("l"))); cur = pts[0]
            elif kind == "curveTo": out.append(([*pts[0], *pts[1], *pts[2]], O("c"))); cur = pts[2]
            elif kind == "qCurveTo":  # not expected in CFF
                raise SystemExit("quadratic curve")
            elif kind in ("closePath", "endPath"): out.append(([], O("h")))
        return out

    def glyph_bounds(self, ch):
        """bbox of a glyph in font units, from the embedded CFF program"""
        ff = self.f.FontDescriptor.FontFile3.read_bytes()
        cff = CFFFontSet(); cff.decompile(io.BytesIO(ff), None)
        top = cff[cff.fontNames[0]]
        names = {"6": "six", "9": "nine", "+": "plus"}
        name = names[ch]
        cs = top.CharStrings[name]
        pen = BoundsPen(top.CharStrings); cs.draw(pen)
        return pen.bounds


def text_of(arr, font):
    out = []
    for el in arr:
        if isinstance(el, pikepdf.String):
            out += [(font.dec[b], 0.0) for b in bytes(el)]
        else:
            if out: out[-1] = (out[-1][0], out[-1][1] + float(el))
    return out  # list of (char, kern-after in 1/1000 em, TJ sign convention)


def to_tj(chars, font):
    arr, buf = [], b""
    for ch, k in chars:
        buf += font.encode(ch)
        if k:
            arr.append(pikepdf.String(buf)); arr.append(k); buf = b""
    if buf: arr.append(pikepdf.String(buf))
    return pikepdf.Array(arr)


def advance(chars, font, tc, tw):
    """horizontal advance in text-space units (Tf size 1)"""
    x = 0.0
    for ch, k in chars:
        code = font.enc[ch]
        x += font.width(code) / 1000 + tc + (tw if code == 32 else 0) - k / 1000
    return x


def _safe(arr, font):
    try:
        return "".join(c for c, _ in text_of(arr, font))
    except KeyError:
        return None


def find(ops, op_name, text, font):
    for i, (o, op) in enumerate(ops):
        if str(op) == op_name:
            arr = o[0] if op_name == "TJ" else [o[-1]]
            try:
                if "".join(c for c, _ in text_of(arr, font)).startswith(text):
                    return i
            except KeyError:  # string drawn in another font
                continue
    raise SystemExit("not found: " + text)


# ---------- page 1 ----------
p1 = pdf.pages[0]
light = Font(p1.Resources.Font.T1_2)
bold1 = Font(p1.Resources.Font.T1_3)
ops = list(pikepdf.parse_content_stream(p1))

# a) "over seven years" -> "over eight years"
i = find(ops, "TJ", "Architect with over seven", light)
chars = text_of(ops[i][0][0], light)
s = "".join(c for c, _ in chars); j = s.index("seven")
new = chars[:j] + [(c, 0.0) for c in "eight"] + chars[j + 5:]
ops[i] = ([to_tj(new, light)], ops[i][1])

# b) remove the two "Passionate…" lines
for t in ("Passionate about", "architecture, technology and design"):
    i = find(ops, "TJ", t, light)
    ops[i] = ([pikepdf.Array([])], ops[i][1])

# c) move the contact line up into the freed space
i = find(ops, "TJ", "São Paulo, Brazil", bold1)
tm = ops[i - 1]
assert str(tm[1]) == "Tm"
CONTACT_Y = 697.8608 - 17.8006  # same gap as before, below the new last line of the summary
EMAIL_Y = CONTACT_Y - 11
ops[i - 1] = ([*tm[0][:5], CONTACT_Y], tm[1])
contact_chars = text_of(ops[i][0][0], bold1)
li = "".join(c for c, _ in contact_chars).index("linkedin")
tc_contact, tw_contact = 0.004, -0.004
LINK_X0 = 28.3465 + 9 * advance(contact_chars[:li], bold1, tc_contact, tw_contact)
LINK_X1 = 28.3465 + 9 * advance(contact_chars, bold1, tc_contact, tw_contact)

# d) numbers rewritten in Helvetica Light, which has no '9' in its embedded subset:
#    each '9' is the font's own '6' outline rotated 180° (identical in Helvetica's design),
#    tagged with ActualText, with an invisible real '9' added on top for text extraction.
O = pikepdf.Operator
NINES = []  # (x, y, size) of every drawn '9', for the invisible text layer
xmin6, ymin6, xmax6, ymax6 = light.glyph_bounds("6")
six = light.enc["6"]; w6 = light.width(six)
glyph6 = light.outline_ops("6")


def rewrite_light(ops, line_start, old, new):
    """locate a Helvetica Light line and return it with `old` replaced by `new` (same length)"""
    i = find(ops, "TJ", line_start, light)
    tc = tw = 0.0
    for o, op in ops[:i]:
        if str(op) == "Tc": tc = float(o[0])
        if str(op) == "Tw": tw = float(o[0])
    # current text position: last Tm, plus whatever was shown after it on the same line
    t = i - 1
    while str(ops[t][1]) != "Tm": t -= 1
    size, x0, y0 = float(ops[t][0][0]), float(ops[t][0][4]), float(ops[t][0][5])
    line_x, line_y = x0, y0
    for o, op in ops[t + 1:i]:
        n = str(op)
        if n in ("Tj", "TJ"):
            arr = o[0] if n == "TJ" else [o[-1]]
            x0 += size * advance(text_of(arr, light), light, tc, tw)
        elif n == "Td":  # new line start, relative to the previous line start
            line_x += float(o[0]) * size; line_y += float(o[1]) * size
            x0, y0 = line_x, line_y
        elif n not in ("Tc", "Tw", "Tf", "Tz", "TL", "Ts", "BDC", "EMC", "BMC"):
            raise SystemExit("unexpected operator before line: " + n)
    chars = text_of(ops[i][0][0], light)
    s = "".join(c for c, _ in chars); j = s.index(old); assert len(old) == len(new)
    chars = chars[:j] + [(n, k) for (c, k), n in zip(chars[j:j + len(old)], new)] + chars[j + len(old):]
    return i, chars, size, x0, y0, tc, tw


def emit(ops, i, chars, size, x0, y0, tc, tw):
    """re-draw the line; the first run keeps the current text position, later runs get a Tm"""
    k = size / 1000
    out, run, before = [], [], []
    for n, (ch, kern) in enumerate(chars):
        if ch != "9":
            run.append((ch, kern)); continue
        if run: out.append(([to_tj(run, light)], O("TJ")))
        xn = x0 + size * advance(chars[:n], light, tc, tw)
        NINES.append((xn, y0, size))
        x_next = xn + size * (w6 / 1000 + tc - kern / 1000)
        out += [([], O("ET")),
                ([pikepdf.Name("/Span"), pikepdf.Dictionary(ActualText=pikepdf.String("9"))], O("BDC")),
                ([], O("q")), ([-k, 0, 0, -k, xn + k * (xmin6 + xmax6), y0 + k * (ymin6 + ymax6)], O("cm")),
                *glyph6, ([], O("f")), ([], O("Q")), ([], O("EMC")),
                ([], O("BT")), ([size, 0, 0, size, x_next, y0], O("Tm"))]
        run = []
    if run: out.append(([to_tj(run, light)], O("TJ")))
    ops[i:i + 1] = out


for start, old, new in (("Natal) and Iguatemi 306 (41,400", "41,400", "49,811"),
                        ("23 projects totalling 458,000+", "458,000+", "492,000+")):
    emit(ops, *rewrite_light(ops, start, old, new))
p1.Contents = pdf.make_stream(pikepdf.unparse_content_stream(ops))

# ---------- page 2: "more than 450,000" -> "458,000+" ----------
p2 = pdf.pages[1]
b2 = Font(p2.Resources.Font.T1_1)
ops = list(pikepdf.parse_content_stream(p2))
i_more = find(ops, "TJ", "more than", b2)
x_more = float(ops[i_more - 1][0][4])
ops[i_more] = ([pikepdf.Array([])], ops[i_more][1])
plus_w = 36 * b2.width(b2.enc["+"]) / 1000
shift_num = None
for i, (o, op) in enumerate(ops):
    if str(op) == "TJ" and len(o[0]) and all(isinstance(e, pikepdf.String) or True for e in o[0]) and _safe(o[0], b2) == "450,000":
        chars = text_of(o[0], b2)
        chars = [(n, k) for (c, k), n in zip(chars, "492,000")]
        chars.append(("+", 0.0))
        ops[i] = ([to_tj(chars, b2)], op)
        tm = ops[i - 1]; assert str(tm[1]) == "Tm"
        # left edge aligned optically with the "23" above (x 28.72 at 48 pt)
        shift_num = 29.0 - float(tm[0][4])
        ops[i - 1] = ([*tm[0][:4], float(tm[0][4]) + shift_num, tm[0][5]], tm[1])
# typology areas updated from the project spreadsheet (Iguatemi 306 at 49,811 m²;
# hotels count Barrinhas only, Uruçuca's area being counted under masterplan)
for old, new in (("68,504 m²", "76,947 m²"), ("5,109 m²", "2,653 m²")):
    for i, (o, op) in enumerate(ops):
        if str(op) in ("Tj", "TJ"):
            arr = o[0] if str(op) == "TJ" else [o[-1]]
            t = _safe(arr, b2)
            if t and t.replace("˚", "²") == old:
                chars = text_of(arr, b2)
                chars = [(n, k) for (c, k), n in zip(chars, new[:len(new) - 3])] + chars[len(new) - 3:]
                ops[i] = ([to_tj(chars, b2)], op) if str(op) == "TJ" else ([pikepdf.String(b"".join(b2.encode(c) for c, _ in chars))], op)
                break
    else:
        raise SystemExit("not found " + old)
# "m²" and "approved by clients" sit on the same baseline to the right of the number
for i, (o, op) in enumerate(ops):
    if str(op) == "Tm" and abs(float(o[5]) - 21.1666) < .01 and float(o[4]) > 200:
        ops[i] = ([*o[:4], float(o[4]) + shift_num + plus_w, o[5]], op)
p2.Contents = pdf.make_stream(pikepdf.unparse_content_stream(ops))

# ---------- page 3: Balneário Camboriú dot (same white dot as the others) ----------
p3 = pdf.pages[2]
DOT = (362.4, 312.0)  # between Itajaí and Itapema, just east of them, clear of their dots
dot_ops = pikepdf.unparse_content_stream([
    ([], pikepdf.Operator("q")),
    ([0, 0, 0, 0], pikepdf.Operator("k")),
    ([1, 0, 0, 1, DOT[0], DOT[1] - 2.239], pikepdf.Operator("cm")),
    ([0, 0], pikepdf.Operator("m")),
    ([1.237, 0, 2.239, 1.002, 2.239, 2.239], pikepdf.Operator("c")),
    ([2.239, 3.476, 1.237, 4.479, 0, 4.479], pikepdf.Operator("c")),
    ([-1.237, 4.479, -2.239, 3.476, -2.239, 2.239], pikepdf.Operator("c")),
    ([-2.239, 1.002, -1.237, 0, 0, 0], pikepdf.Operator("c")),
    ([], pikepdf.Operator("f")),
    ([], pikepdf.Operator("Q")),
])
p3.contents_add(pdf.make_stream(dot_ops), prepend=False)

pdf.Root.Lang = pikepdf.String("en")
tmp = io.BytesIO(); pdf.save(tmp)

# ---------- new text in a Helvetica-compatible font (overlay) ----------
pdfmetrics.registerFont(TTFont("HerosBold", os.path.join(HERE, "fonts", "heros-bold.ttf")))
W, H = 595.276, 841.89
buf = io.BytesIO(); c = canvas.Canvas(buf, pagesize=(W, H))
# page 1: email under the contact line, same size, colour and tracking as the line above
c.setFillColorCMYK(*NAVY); c.setFont("HerosBold", 9)
t = c.beginText(28.3465, EMAIL_Y); t.setFont("HerosBold", 9); t.setCharSpace(0.036); t.textOut(EMAIL); c.drawText(t)
email_w = pdfmetrics.stringWidth(EMAIL, "HerosBold", 9) + 0.036 * len(EMAIL)
# invisible '9's (render mode 3) over the drawn ones, so copy/paste and ATS read the numbers
for xn, yn, sz in NINES:
    t = c.beginText(xn, yn); t.setFont("HerosBold", sz); t.setTextRenderMode(3); t.textOut("9"); c.drawText(t)
c.showPage()
c.showPage()
# page 3: label to the right of the new dot, white, 6 pt like the other labels
c.setFillColorCMYK(0, 0, 0, 0); c.setFont("HerosBold", 6)
c.drawString(DOT[0] + 4.5, DOT[1] - 2.1, "balneário camboriú sc")
c.showPage(); c.save()
overlay = PdfReader(io.BytesIO(buf.getvalue()))

reader = PdfReader(io.BytesIO(tmp.getvalue()))
writer = PdfWriter(clone_from=reader)
writer.pages[0].merge_page(overlay.pages[0])
writer.pages[2].merge_page(overlay.pages[2])
writer.add_annotation(0, Link(rect=(LINK_X0 - 1, CONTACT_Y - 2.5, LINK_X1 + 1, CONTACT_Y + 8), url=LINKEDIN))
writer.add_annotation(0, Link(rect=(27.3, EMAIL_Y - 2.5, 28.3465 + email_w + 1, EMAIL_Y + 8), url="mailto:" + EMAIL))
writer.add_metadata({
    "/Title": "Filipe Meltzer — Architect — CV",
    "/Author": "Filipe Meltzer",
    "/Subject": "Curriculum vitae: architect based in São Paulo, Brazil",
    "/Keywords": "Filipe Meltzer, architect, urbanist, São Paulo, CV",
})
with open(DST, "wb") as f:
    writer.write(f)
print("written", DST)
