# JMH Travel Solutions Ltd — Static Concept Website (`jmh-travel-demo`)

> **Concept Disclaimer:** Concept design by Mark Aszkenasy – not the official website of JMH Travel Solutions Ltd. Created strictly as a web design demonstration (`noindex, nofollow`).

## Overview

A modern, high-trust executive fleet and North East PSV transport operator concept website for **JMH Travel Solutions Ltd** (`01642 058430`), covering **7-seater to 70-seater Standard and Executive** minibus & coach hire alongside **24/7 PSV Driver Hire** and **PSV External Transport Manager Services** across Eaglescliffe, Stockton-on-Tees & the North East.

### Key Architecture & Compliance Highlights

- **Strict Residential Privacy Protection:** Displays operating area only (`Eaglescliffe, Stockton-on-Tees & North East`) with zero street names, house numbers, or residential postcodes anywhere in the codebase.
- **100% Self-Hosted & Offline-Ready:** Zero external CDN, font, or third-party script requests. Variable `Archivo` (`400–800`) and `Public Sans` (`300–700`) `.woff2` fonts are served locally from `fonts/`.
- **Smart Journey Quote Engine (`quote.html`):** Replaces unstructured plain-text instructions with enquiry-type routing, a `Return Journey` vs `One-Way` toggle, real-time passenger-count-to-vehicle-tier recommendations (`7–8`, `16`, `24–35`, `49–70` seaters), luggage/flight fields, and accessible client-side validation.
- **WCAG AA+ Contrast & Mobile-First:** Midnight navy (`#0D2036`), clean ice-slate (`#F3F6FA`), high-contrast transport teal (`#0A666E`), and signal amber (`#F0B429` with `#0D2036` dark ink), zero horizontal overflow (`360px`, `390px`, `1440px`), keyboard-accessible mobile nav (`Escape` closes), and a solid opaque mobile sticky action bar.

## File Structure

```text
jmh-travel-demo/
├── .nojekyll
├── index.html            # Fleet hero, quick capacity selector, passenger & B2B PSV overview
├── fleet-services.html   # 7–70 seater tier guide + 24/7 PSV Driver & Transport Manager sections
├── quote.html            # Smart structured journey quote & PSV enquiry form
├── favicon.svg           # Custom highway-chevron SVG favicon
├── css/
│   └── styles.css        # Self-hosted @font-face, executive fleet layout & WCAG AA tokens
├── fonts/
│   ├── archivo-latin.woff2
│   └── public-sans-latin.woff2
├── images/
│   ├── logo-mark.svg     # Custom geometric transport shield emblem
│   ├── hero.jpg          # Illustrative executive coach & minibus hero image (1440x803)
│   └── feature.jpg       # Illustrative executive leather cabin image (1200x896)
├── js/
│   └── main.js           # Mobile nav, URL param prefill, return toggle & tier calculator
├── PITCH.md              # Live IONOS audit, phone outreach script & migration checklist
└── README.md             # Project documentation
```

## Preview Locally

Open `index.html` directly in any modern browser, or serve the folder over a local static server:

```bash
python3 -m http.server 8081
```
