from PIL import Image
import os

src = r"C:\Users\s8mustangs\portfolio\assets\images\wayfair-bento-reference.jpg"
out_dir = r"C:\Users\s8mustangs\portfolio\assets\images"
im = Image.open(src).convert("RGB")
w, _ = im.size

# Crop bands tuned to wireframe sections (366 x 1024 source)
crops = [
    ("wayfair-ref-01-hero-nav", (0, 0, w, 310)),
    ("wayfair-ref-02-categories", (0, 300, w, 520)),
    ("wayfair-ref-03-discover", (0, 510, w, 780)),
]

for name, box in crops:
    crop = im.crop(box)
    native = os.path.join(out_dir, f"{name}@1x.png")
    crop.save(native, "PNG", optimize=True)

    for scale in (2, 4):
        scaled = crop.resize((crop.width * scale, crop.height * scale), Image.NEAREST)
        path = os.path.join(out_dir, f"{name}@{scale}x.png")
        scaled.save(path, "PNG", optimize=True)
        print(f"{path}: {scaled.size}")

print("done")
