# mizeeski.com

Portfolio of João Vitor Mizeeski, product designer. Plain HTML, CSS and JavaScript: no build step, no dependencies.

## Structure

```
index.html            page content (English and Portuguese, switched by the EN/PT button)
404.html              not-found page
assets/css/style.css  styles and animations
assets/js/main.js     language switch, scroll effects, background colors, sketch drawing, hover previews
assets/img/           favicon, profile photo, project previews
assets/cv/            CV files linked from the contact section
CNAME                 custom domain (mizeeski.com)
.github/workflows/    GitHub Pages deploy on every push to main
```

## Run locally

Open `index.html` in the browser, or serve the folder:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Edit content

Every text exists twice in `index.html`: once with `lang="en"` and once with `lang="pt"`. Change both.
Section background colors live in the `data-bg` and `data-blobs` attributes of each `<section>`.

## Deploy

1. Replace the old React/Vite files in the repository with the contents of this folder (keep the `CNAME`).
2. In GitHub, go to Settings → Pages and set Source to "GitHub Actions".
3. Push to `main`. The workflow publishes the site.
