# JMH Travel Solutions Ltd — Static Concept Website (`jmh-travel-demo`)

> **Concept Disclaimer:** Concept design by Mark Aszkenasy – not the official website of JMH Travel Solutions Ltd. Created strictly as a web design demonstration (`noindex, nofollow`).

## Overview

A daylight-first **Swiss/UK Modern Transit Dispatch Console, Live Route Schematic & Panoramic Charter Search Dock** concept website for **JMH Travel Solutions Ltd** (`01642 058430`), covering **7-seater to 70-seater Standard and Executive** minibus & coach hire alongside **specialist PSV Driver Hire** and **PSV External Transport Manager Services** across Eaglescliffe, Stockton-on-Tees & the North East.

### Key Architecture & Compliance Highlights

- **Strict Residential Privacy Protection:** Displays operating area only (`Eaglescliffe, Stockton-on-Tees & North East`) with zero street names, house numbers, or residential postcodes anywhere in the codebase.
- **Transit Dispatch Console Header & Live SVG Route Line:** Top telemetry strip with horizontal SVG route schematic (`Eaglescliffe — Stockton-on-Tees — Yarm — Teesside & UK Charter`) paired with a crisp architectural white navigation bar.
- **Panoramic Stage + Docked Horizontal Charter Matcher (`index.html`):** Features service mode tabs (`Minibus / Coach Charter`, `PSV Driver Cover (B2B)`, `External Transport Manager`), an interactive `7–70` passenger count slider, auto-matched vehicle tier pills, a live 70-seat visual dot matrix, `Standard` / `Executive` toggle, and direct carry-over into `quote.html`.
- **100% Self-Hosted & Offline-Ready:** Zero external CDN, font, or third-party script requests. Variable `Archivo` (`400–800`) and `Public Sans` (`300–700`) `.woff2` fonts are served locally from `fonts/`.
- **WCAG AA+ Contrast & Mobile-First:** Crisp Alabaster (`#F6F8FA`), Technical Slate (`#0E1A2B`), Signal Highway Amber (`#F0A818` with `#0E1A2B` dark ink), and Emerald Compliance (`#0D7A5F`), zero horizontal overflow (`360px`, `390px`, `1440px`), keyboard-accessible mobile nav (`Escape` closes), and a solid opaque mobile sticky action bar.

## File Structure

```text
jmh-travel-demo/
├── .nojekyll
├── index.html            # Panoramic fleet stage, horizontal 7-70 seat matcher, 4-tier blueprint & B2B compliance
├── fleet-services.html   # 7–70 seater SVG blueprint guide + specialist PSV Driver & Transport Manager sections
├── quote.html            # Smart structured journey quote & PSV enquiry form with console carry-over
├── favicon.svg           # Custom highway road-stripe SVG favicon
├── css/
│   └── styles.css        # Self-hosted @font-face, daylight transit console & WCAG AA+ tokens
├── fonts/
│   ├── archivo-latin.woff2
│   └── public-sans-latin.woff2
├── images/
│   ├── logo-mark.svg     # Custom geometric road-stripe emblem
│   ├── hero.jpg          # Illustrative executive coach & minibus hero image (1440x803)
│   └── feature.jpg       # Illustrative executive leather cabin image (1200x896)
├── js/
│   └── main.js           # Mobile nav, live 70-seat slider/dot matcher, URL/storage carry-over & validation
├── PITCH.md              # Live IONOS audit, phone outreach script & migration checklist
└── README.md             # Project documentation
```

## Preview Locally

Open `index.html` directly in any modern browser, or serve the folder over a local static server:

```bash
python3 -m http.server 8081
```

## Set D — Where Are You Going?

- `d/index.html`, `d/css/styles.css`, `d/js/app.js` — Journey first, fleet second, in British road-sign styling: pick the trip type, set the group size and the right vehicle is chosen for you.
- Live at https://tedotedo.github.io/jmh-travel-demo/d/. Reuses the root `fonts/` and `images/`; same `noindex`, zero external requests and `.ph` placeholder rules as Sets A–C.
- Destinations are real places used as examples, not confirmed routes, and every price is a placeholder. Location is shown as area only.
