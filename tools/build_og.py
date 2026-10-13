"""Make 1200x630 JPEG share images (Open Graph) from the site's WebP images.

Usage: python3 tools/build_og.py
Writes assets/og/<name>.jpg for the home page and every project cover.
Run again after changing a project's cover.
"""
import json, os, re, subprocess
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, "..")
OUT = os.path.join(ROOT, "assets", "og"); os.makedirs(OUT, exist_ok=True)
data = json.loads(subprocess.check_output(["node", "-e",
    "global.window={};require('./assets/data/projects.js');require('./assets/data/images.js');"
    "console.log(JSON.stringify({p:window.PROJECTS.map(x=>[x.slug,x.cover]),i:window.IMAGES}))"], cwd=ROOT))

def make(key, name):
    w = data["i"][key]["w"][-1]
    im = Image.open(os.path.join(ROOT, "assets", "img", f"{key}-{w}.webp")).convert("RGB")
    W, H = 1200, 630; r = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    l, t = (im.width - W) // 2, (im.height - H) // 2
    im.crop((l, t, l + W, t + H)).save(os.path.join(OUT, name + ".jpg"), quality=82, optimize=True, progressive=True)
    print(name)

make("urucuca/canopy", "home")
for slug, cover in data["p"]:
    make(cover, slug)
make("sketch/plaza", "sketchbook")
