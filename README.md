# Pratik Tamgadge — Portfolio Site

A static, dependency-free site (plain HTML/CSS/JS) built for GitHub Pages.

## Structure
```
index.html          Home
about.html           About
contact.html         Contact
work/
  mareflo.html       Case study — Mareflo / MoodDial
  igaming.html       Case study — Responsible Gaming UX
  wayfair.html        Case study — Wayfair.com UX Revamp
  paperlite.html      Case study — Paperlite.io iOS Audit
assets/
  styles.css         Shared design system
  script.js          Scroll reveal, MoodDial widget, nav
  images/            Drop your exported Canva images here (see README.md inside)
```

## Deploy to GitHub Pages (free)
1. Create a new repo on GitHub, e.g. `portfolio`
2. Upload everything in this folder to the repo root (keep the folder structure intact)
3. Go to the repo's **Settings → Pages**
4. Under "Build and deployment," set **Source: Deploy from a branch**, branch **main**, folder **/ (root)**
5. Save — GitHub gives you a URL like `https://yourusername.github.io/portfolio/` within a minute or two

## Custom domain (optional)
Settings → Pages → Custom domain → enter your domain, then add a `CNAME` record
at your domain registrar pointing to `yourusername.github.io`. GitHub issues
free HTTPS automatically once it's verified.

## Adding your real images
See `assets/images/README.md` for exact filenames, sizes, and how to wire
them into the placeholder frames.
