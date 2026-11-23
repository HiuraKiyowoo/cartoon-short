import sys, glob
from PIL import Image
d, out = sys.argv[1], sys.argv[2]; cols = int(sys.argv[3]) if len(sys.argv) > 3 else 6
fs = sorted(glob.glob(d + "/f*.jpg")); ims = [Image.open(f).convert("RGB") for f in fs]; w = 270; h = int(w * 16 / 9)
rows = (len(ims) + cols - 1) // cols; S = Image.new("RGB", (cols * w, rows * h))
for i, im in enumerate(ims): S.paste(im.resize((w, h)), ((i % cols) * w, (i // cols) * h))
S.save(out, quality=88)
