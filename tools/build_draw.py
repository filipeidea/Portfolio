"""Build the "drawing itself" data for the Sketchbook page.

Usage:  python3 tools/build_draw.py [--preview DIR]

For every drawing in DRAWINGS (tools/draw.json) this writes, into assets/draw/:
  <id>.webp     the drawing (max 1400 px wide)
  <id>-t.webp   a time map of the same size, lossless: for every pixel, the moment
                (0..1) at which it appears while the page is scrolled. 16 bits:
                red = high byte, green = low byte. 0 = paper (always visible).
and assets/data/draw.js with sizes and the moments where each caption step starts.

How the order is made, so the drawing seems to be drawn and not wiped:
  * pixels are split into paper, pen lines (dark) and colour (the rest);
  * the drawing is split into "steps" (rectangles, in % of the image, in the order
    given in draw.json); each step is drawn in turn: first its lines, then its colour;
  * lines: connected strokes are visited pen-like — always the nearest stroke to
    where the pen is — and each stroke grows along its own length from the end
    nearest the pen (geodesic distance), at a constant pen speed;
  * colour: a wash that sweeps across the step with a soft, irregular front.
"""
import json
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage.graph import MCP_Geometric

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
OUT = os.path.join(ROOT, "assets", "draw")
MAXW = 1400
rng = np.random.default_rng(7)


def load_images_meta():
    txt = open(os.path.join(ROOT, "assets/data/images.js")).read()
    return json.loads(txt[txt.index("{"):txt.rindex("}") + 1])


def classify(a, paper_l=0.955):
    L = a.mean(2)
    s = a.max(2) - a.min(2)
    paper = (L > paper_l) & (s < 0.05)
    line = L < 0.5
    colour = ~paper & ~line
    return paper, line, colour


def stroke_order(line, region_mask, pen, t0, speed):
    """Times for the line pixels of one step. Returns (times dict as array, end time, pen)."""
    lab, n = ndi.label(ndi.binary_dilation(line & region_mask, iterations=1), structure=np.ones((3, 3)))
    lab = lab * (line & region_mask)
    T = np.zeros(line.shape)
    if n == 0:
        return T, t0, pen
    objs = ndi.find_objects(lab)
    comps = []
    for i, sl in enumerate(objs, start=1):
        if sl is None:
            continue
        m = lab[sl] == i
        cnt = int(m.sum())
        if cnt == 0:
            continue
        ys, xs = np.nonzero(m)
        comps.append({"i": i, "sl": sl, "m": m, "n": cnt,
                      "c": np.array([ys.mean() + sl[0].start, xs.mean() + sl[1].start])})
    cent = np.array([c["c"] for c in comps])
    left = np.ones(len(comps), bool)
    t = t0
    pos = np.array(pen, float)
    for _ in range(len(comps)):
        d = np.where(left, ((cent - pos) ** 2).sum(1), np.inf)
        k = int(np.argmin(d))
        left[k] = False
        c = comps[k]
        sl, m = c["sl"], c["m"]
        ys, xs = np.nonzero(m)
        # start at the stroke pixel nearest to the pen
        gy, gx = ys + sl[0].start, xs + sl[1].start
        j = int(np.argmin((gy - pos[0]) ** 2 + (gx - pos[1]) ** 2))
        if c["n"] > 12:
            cost = np.where(m, 1.0, np.inf)
            mcp = MCP_Geometric(cost)
            dist, _ = mcp.find_costs([(ys[j], xs[j])])
            dd = dist[ys, xs]
            dd[~np.isfinite(dd)] = 0
        else:
            dd = np.zeros(len(ys))
        length = max(dd.max(), 1.0)
        T[gy, gx] = t + dd / speed
        t += length / speed + 2.0 / speed  # small lift of the pen
        far = int(np.argmax(dd))
        pos = np.array([gy[far], gx[far]], float)
    return T, t, pos


def smooth_noise(shape, scale):
    h, w = shape
    sm = rng.random((max(2, h // scale + 2), max(2, w // scale + 2)))
    z = ndi.zoom(sm, (h / (sm.shape[0] - 1), w / (sm.shape[1] - 1)), order=3)[:h, :w]
    z = (z - z.min()) / (np.ptp(z) + 1e-9)
    return z


def build(d, meta, preview=None):
    key = d["img"]
    w = meta[key]["w"]
    pick = max([x for x in w if x <= MAXW] or [w[0]])
    im = Image.open(os.path.join(ROOT, f"assets/img/{key}-{pick}.webp")).convert("RGB")
    if d.get("crop"):  # trim stray edges of a scan, in % of the image
        c = d["crop"]
        im = im.crop((round(c[0] / 100 * im.width), round(c[1] / 100 * im.height), round(c[2] / 100 * im.width), round(c[3] / 100 * im.height)))
    if im.width > MAXW:
        im = im.resize((MAXW, round(im.height * MAXW / im.width)), Image.LANCZOS)
    a = np.asarray(im).astype(float) / 255
    H, W = a.shape[:2]
    paper, line, colour = classify(a, d.get("paper", 0.975))
    steps = d["steps"]
    # region of every pixel: the first step whose rectangle contains it; else the last step
    reg = np.full((H, W), len(steps) - 1, int)
    assigned = np.zeros((H, W), bool)
    yy, xx = np.mgrid[0:H, 0:W]
    # wobble the step boundaries so a wash never stops on a straight line
    wob = d.get("wobble", 0.05)
    xx = xx + (smooth_noise((H, W), 50) - 0.5) * 2 * wob * W
    yy = yy + (smooth_noise((H, W), 50) - 0.5) * 2 * wob * H
    inbox = []  # (step, x0, y0, x1, y1) in pixels; a step may have several boxes
    for si, st in enumerate(steps):
        boxes = st.get("box", [0, 0, 100, 100])
        if not isinstance(boxes[0], list):
            boxes = [boxes]
        for x0, y0, x1, y1 in boxes:
            bx = (x0 / 100 * W, y0 / 100 * H, x1 / 100 * W, y1 / 100 * H)
            inbox.append((si,) + bx)
            m = (xx >= bx[0]) & (xx < bx[2]) & (yy >= bx[1]) & (yy < bx[3]) & ~assigned
            reg[m] = si
            assigned |= m
    if d.get("group", "blob") == "blob":
        # whole blobs of ink (a rock, a tree, a panel) go to the step whose box holds their
        # centre, so a step never cuts through a figure
        ink = ~paper
        blobs, nb = ndi.label(ndi.binary_dilation(ink, iterations=d.get("blobGap", 6)))
        blobs = blobs * ink
        total_ink = ink.sum()
        for bi, sl in enumerate(ndi.find_objects(blobs), start=1):
            if sl is None:
                continue
            m = blobs[sl] == bi
            if m.sum() > 0.6 * total_ink:
                continue  # one blob is almost the whole drawing: keep the boxes
            cy, cx = ndi.center_of_mass(m)
            cy += sl[0].start
            cx += sl[1].start
            for si, x0, y0, x1, y1 in inbox:
                if x0 <= cx < x1 and y0 <= cy < y1:
                    reg[sl][m] = si
                    break
    speed = d.get("speed", 1.0)
    T = np.zeros((H, W))
    t = 0.0
    pen = np.array([0.0, 0.0])
    starts = []
    for si, st in enumerate(steps):
        rm = reg == si
        starts.append(t)
        if st.get("pen"):
            pen = np.array([st["pen"][1] / 100 * H, st["pen"][0] / 100 * W])
        Tl, t, pen = stroke_order(line, rm, pen, t, speed)
        T += Tl
        cm = colour & rm
        if cm.any():
            ys, xs = np.nonzero(cm)
            dirx, diry = st.get("wash", [1, 0.6])
            proj = xs * dirx + ys * diry
            proj = (proj - proj.min()) / (np.ptp(proj) + 1e-9)
            nz = smooth_noise((H, W), 40)[ys, xs]
            s = np.clip(0.75 * proj + 0.25 * nz, 0, 1)
            # a wash lasts a share of the step's line time (at least a fixed minimum)
            dur = max((t - starts[-1]) * d.get("washShare", 0.45), d.get("washMin", 600))
            T[ys, xs] = t + s * dur
            t += dur
    total = t
    T = T / total * 0.97
    T[paper] = 0
    T[(T == 0) & ~paper] = 1e-4
    q = np.clip(np.round(T * 65535), 0, 65535).astype(np.uint16)
    rgb = np.zeros((H, W, 3), np.uint8)
    rgb[..., 0] = q >> 8
    rgb[..., 1] = q & 255
    os.makedirs(OUT, exist_ok=True)
    im.save(os.path.join(OUT, f"{d['id']}.webp"), "WEBP", quality=86, method=6)
    Image.fromarray(rgb).save(os.path.join(OUT, f"{d['id']}-t.webp"), "WEBP", lossless=True, quality=100, method=6)
    if preview:
        frames = []
        for f in [0.15, 0.35, 0.55, 0.75, 0.97]:
            show = (T <= f) | paper
            fr = np.where(show[..., None], a, 1.0)
            frames.append(Image.fromarray((fr * 255).astype(np.uint8)))
        tw = 360
        th = round(H * tw / W)
        sheet = Image.new("RGB", (tw * 5, th), "white")
        for i, fr in enumerate(frames):
            sheet.paste(fr.resize((tw, th)), (i * tw, 0))
        sheet.save(os.path.join(preview, d["id"] + ".jpg"))
    return {"id": d["id"], "w": W, "h": H, "steps": [round(float(s) / total * 0.97, 4) for s in starts]}


def main():
    preview = None
    if "--preview" in sys.argv:
        preview = sys.argv[sys.argv.index("--preview") + 1]
        os.makedirs(preview, exist_ok=True)
    only = [x for x in sys.argv[1:] if not x.startswith("--") and x != preview]
    meta = load_images_meta()
    cfg = json.load(open(os.path.join(HERE, "draw.json")))
    out_path = os.path.join(ROOT, "assets/data/draw.js")
    old = {}
    if os.path.exists(out_path):
        txt = open(out_path).read()
        old = json.loads(txt[txt.index("{"):txt.rindex("}") + 1])
    for d in cfg:
        if only and d["id"] not in only:
            continue
        r = build(d, meta, preview)
        old[d["id"]] = {"w": r["w"], "h": r["h"], "steps": r["steps"]}
        print(d["id"], r["w"], r["h"], r["steps"],
              os.path.getsize(os.path.join(OUT, d["id"] + "-t.webp")) // 1024, "KB map")
    with open(out_path, "w") as f:
        f.write("// Generated by tools/build_draw.py. Do not edit by hand.\n")
        f.write("window.DRAW = " + json.dumps(old, indent=1, sort_keys=True) + ";\n")


if __name__ == "__main__":
    main()
