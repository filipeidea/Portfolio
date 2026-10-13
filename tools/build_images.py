"""Build responsive WebP images for the site.

Usage:  python3 tools/build_images.py <source-root> <crops-dir>

Reads the manifest below (output name -> source file), writes
assets/img/<project>/<name>-<width>.webp for each width in WIDTHS that is
not larger than the source, and writes assets/data/images.js with the
generated widths and aspect ratio of every image, which the site reads.
To add an image: add a line to MANIFEST and run the script again.
"""
import json
import os
import sys

from PIL import Image

Image.MAX_IMAGE_PIXELS = None
WIDTHS = [640, 1280, 2000]
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "assets", "img")
DATA = os.path.join(HERE, "..", "assets", "data", "images.js")

# key: "<project>/<name>"  value: (root, relative path)  root S = source folder, C = crops folder
MANIFEST = {
    "monolyt/front": ("S", "monolyt/BH_ESTALEIRO_EP3_C02_2022.12.02.jpg"),
    "monolyt/stone": ("S", "monolyt/BH_ESTALEIRO_EP3_C03_2022.12.02.jpg"),
    "monolyt/terraces": ("S", "monolyt/BH_ESTALEIRO_EP3_C05_2022.12.02.jpg"),
    "monolyt/corner": ("S", "monolyt/BH_ESTALEIRO_EP3_C06_2022.12.02.jpg"),
    "monolyt/axo": ("S", "monolyt/iso.png"),
    "urucuca/lagoon": ("S", "radyr/RADYR_ULHEUS_EP03_C01.jpg"),
    "urucuca/houses": ("S", "radyr/RADYR_ULHEUS_EP03_C02.jpg"),
    "urucuca/forest": ("S", "radyr/RADYR_ULHEUS_EP03_C03.jpg"),
    "urucuca/stone": ("S", "radyr/RADYR_ULHEUS_EP03_C04.jpg"),
    "urucuca/canopy": ("S", "radyr/RADYR_ULHEUS_EP03_C05.jpg"),
    "urucuca/site": ("S", "radyr/Screenshot_1.jpg"),
    "quinta/approach": ("S", "manuel marateca/MANUEL_MARATECA_EV03_C01.jpg"),
    "quinta/court": ("S", "manuel marateca/MANUEL_MARATECA_EV03_C02.jpg"),
    "quinta/wing": ("S", "manuel marateca/MANUEL_MARATECA_EV03_C04.jpg"),
    "quinta/pool": ("S", "manuel marateca/MANUEL_MARATECA_EV03_C05.jpg"),
    "quinta/houses": ("S", "manuel marateca/MANUEL_MARATECA_EV03_C06.jpg"),
    "quinta/arcade": ("S", "manuel marateca/MANUEL_MARATECA_EV03_C07.jpg"),
    "quinta/axo-sketch": ("S", "manuel marateca/croqui manuel remasterizado.png"),
    "quinta/elevations": ("S", "manuel marateca/Fachadas.png"),
    "iguatemi/tower": ("S", "aeb/AAM_IGUATEMI_EV02_240618_R00.jpg"),
    "iguatemi/street": ("S", "aeb/AAM_IGUATEMI_EV02_C03_240618_R00.jpg"),
    "iguatemi/facade": ("S", "aeb/AAM_IGUATEMI_EV02_C04_240618_R00.jpg"),
    "iguatemi/sketch": ("S", "aeb/croqui.jpg"),
    "iguatemi/model": ("S", "aeb/maquete.jpg"),
    "iguatemi/axo": ("S", "aeb/iso.jpg"),
    "gaivota/tower": ("S", "NORTIS/NORTIS_GAIVOTA 530_EV02_C02-01.jpg"),
    "gaivota/entrance": ("S", "NORTIS/NORTIS_GAIVOTA 530_EV02_C01-01.jpg"),
    "gaivota/axo": ("S", "NORTIS/ISO.jpg"),
    "gramado/corner": ("S", "gramado/SAES_HRT_EP03_IMAGENS_C01_2022.10.28.jpg"),
    "gramado/street": ("S", "gramado/SAES_HRT_EP03_IMAGENS_C02_2022.10.14.jpg"),
    "gramado/forest": ("S", "gramado/SAES_HRT_EP03_IMAGENS_C05_2022.10.14.jpg"),
    "bvv/wall": ("S", "bvv/C01.jpg"),
    "bvv/pavilion": ("S", "bvv/C02.jpg"),
    "bvv/garden": ("S", "bvv/C03.jpg"),
    "bvv/pool": ("S", "bvv/C04_pedra.jpg"),
    "bvv/axo": ("S", "bvv/iso bvv.png"),
    "bvv/plan": ("S", "bvv/planta baixa bvv.png"),
    "casa-par/pool": ("S", "casa par/casa-par-architects-office_3.jpg"),
    "casa-par/living": ("S", "casa par/casa-par-architects-office_5.jpg"),
    "casa-par/hall": ("S", "casa par/casa-par-architects-office_6.jpg"),
    "barrinhas/beach": ("C", "barrinhas-308.png"),
    "barrinhas/palms": ("C", "barrinhas-309.png"),
    "barrinhas/court": ("C", "barrinhas-310.png"),
    "barrinhas/pool": ("C", "barrinhas-311.png"),
    "barrinhas/sketch-1": ("C", "barrinhas-sketch-1.jpg"),
    "barrinhas/sketch-2": ("C", "barrinhas-sketch-2.jpg"),
    "tramandai/canopy": ("C", "tcc-02.png"),  # TCC\Renderizado\02-cinza.png
    "tramandai/square": ("C", "tcc-oficial.png"),  # RENDER OFICIAL- cinza.png
    "tramandai/hall": ("C", "tcc-interna2.png"),  # IMAGEM INTERNA2-cinza.png
    "tramandai/lagoon": ("C", "tcc-05.png"),  # 05-cinza.png
    "tramandai/approach": ("C", "tcc-081.png"),  # 081-cinza.png
    "tramandai/boardwalk": ("C", "tcc-oficial2.png"),  # RENDER OFICIAL2-cinza.png
    "tramandai/street": ("C", "tcc-091.png"),  # 091-cinza.png
    "tramandai/masterplan": ("C", "tcc-masterplan.png"),
    "tramandai/siteplan": ("C", "tcc-siteplan.png"),
    "tramandai/elevations": ("C", "tcc-elevations.png"),
    "tramandai/section": ("C", "tcc-section.png"),
    "sketch/multifamily-house": ("C", "sk-multifamily-a.png"),
    "sketch/multifamily-block": ("C", "sk-multifamily-b.png"),
    "sketch/plaza": ("C", "sk-render-plaza.png"),
    "sketch/plaza-studies": ("C", "sk-render-studies.png"),
    "sketch/storytelling": ("C", "sk-storytelling.png"),
    "sketch/cathedral": ("C", "sk-quinta-cathedral.png"),
    "sketch/lisbon": ("C", "sk-quinta-lisbon.png"),
    "sketch/details": ("C", "sk-quinta-details.png"),
    "sketch/arch": ("C", "sk-quinta-arch.png"),
    "profile/portrait": ("C", "portrait.png"),
    "profile/places-map": ("C", "places-map.png"),
    "profile/places-america": ("C", "america.png"),  # exported by Filipe from the map PSD (América.png)
}


def main(src_root, crops):
    meta = {}
    for key, (root, rel) in MANIFEST.items():
        path = os.path.join(src_root if root == "S" else crops, rel)
        im = Image.open(path)
        if im.mode in ("RGBA", "LA", "P"):
            im = im.convert("RGBA")
            bg = Image.new("RGB", im.size, "white")
            bg.paste(im, mask=im.split()[-1])
            im = bg
        else:
            im = im.convert("RGB")
        w, h = im.size
        widths = [x for x in WIDTHS if x < w] + [min(w, WIDTHS[-1])]
        widths = sorted(set(widths))
        os.makedirs(os.path.join(OUT, os.path.dirname(key)), exist_ok=True)
        for tw in widths:
            th = round(h * tw / w)
            out = os.path.join(OUT, f"{key}-{tw}.webp")
            im.resize((tw, th), Image.LANCZOS).save(out, "WEBP", quality=80, method=6)
        meta[key] = {"w": widths, "r": round(w / h, 4)}
        print(key, w, h, widths)
    os.makedirs(os.path.dirname(DATA), exist_ok=True)
    old = {}
    if os.path.exists(DATA):
        txt = open(DATA).read()
        old = json.loads(txt[txt.index("{"):txt.rindex("}") + 1])
    old.update(meta)
    with open(DATA, "w") as f:
        f.write("// Generated by tools/build_images.py. Do not edit by hand.\n")
        f.write("window.IMAGES = " + json.dumps(old, indent=1, sort_keys=True) + ";\n")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
