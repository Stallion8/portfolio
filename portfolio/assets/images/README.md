# Adding your images

My sandbox can't reach Canva's image servers directly, so the site ships with
labeled placeholder frames instead of your real photo/screens. They're sized
and named to drop straight in — no code changes needed.

## 1. Export from Canva
In your "Claude" design (or wherever the source images live):
1. Select the element/page you want (profile photo, app screen, etc.)
2. Download → PNG (or JPG) → highest quality
3. Repeat for each image below

## 2. Filenames the site expects

Place all files directly in `assets/images/`:

| Filename | Used on | Recommended size |
|---|---|---|
| `profile-photo.jpg` | Home + About | 800×1000px (portrait) |
| `mareflo-app-screens.png` | Mareflo case study | 1600×900px |
| `wayfair-01.png` | Wayfair case study | 800×1200px (tall) |
| `wayfair-02.png` | Wayfair case study | 1200×500px (wide) |
| `wayfair-03.png` | Wayfair case study | 1200×500px (wide) |
| `wayfair-04.png` | Wayfair case study | 700×900px (tall) |
| `wayfair-05.png` | Wayfair case study | 1400×900px (wide) |

## 3. Wire them in
Each placeholder is a `<div class="image-frame">` or `<div class="photo-frame placeholder">`.
Replace the placeholder `<div>` contents with an `<img>` tag, e.g.:

```html
<!-- before -->
<div class="photo-frame placeholder">
  <div class="placeholder-label">IMAGE SLOT ...</div>
</div>

<!-- after -->
<div class="photo-frame">
  <img src="assets/images/profile-photo.jpg" alt="Pratik Tamgadge">
</div>
```

(Drop the `placeholder` class too, so the dashed border disappears.)

If you'd rather I do this wiring myself, just come back and say "these are
the images" — I'll place them for you.
