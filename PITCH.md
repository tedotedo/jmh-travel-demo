# Sales & Outreach Pitch Guide — JMH Travel Solutions Ltd (`jmh-travel-demo`)

## 1. Live Website Audit (`jmhtravelsolutions.co.uk` — Verified 12 Nov 2026)

* **Business:** JMH Travel Solutions Ltd (`01642 058430`)
* **Operating Area:** `Eaglescliffe, Stockton-on-Tees & North East` *(Privacy note: Companies House registered address appears residential — do **not** door-knock unannounced; lead via telephone/email outreach and display area-only location publicly).*
* **Current Platform:** IONOS MyWebsite NOW starter template.
* **Critical Revenue Leaks Found on the Live Site:**
  1. **"Coming Soon / Under Construction" Homepage:** Anyone landing on `jmhtravelsolutions.co.uk` sees an unfinished construction notice instead of an active 7–70 seater coach & minibus operator.
  2. **390px Mobile Cookie & Translation Wall:** On mobile phones (where most private-hire and emergency PSV driver searches happen), a stacked translation/cookie overlay obscures the screen before the user sees a single vehicle tier or phone button.
  3. **Broken Directory Link (`/contact/` -> `404`):** External local directory traffic (including *This Is Yarm*) links to `/contact/`, which returns a dead `404` page.
  4. **Unconfigured `mailto:mail@example.com` Button:** A leftover IONOS template button still points to `mail@example.com`, meaning clicked email enquiries vanish into thin air.
  5. **Plain Text Box Friction on `/contact-us/`:** Instead of structured date, time, return-toggle, and passenger fields, visitors face a long paragraph of instructions telling them to remember to type passenger numbers, return times, luggage, and flight numbers into one generic message box.

---

## 2. Respectful Phone Opener (`01642 058430`)

> *"Hi, is that the team at JMH Travel Solutions? Brilliant — my name’s Mark, I’m a local web designer here in the Yarm/Stockton area. I was looking at local businesses listed on This Is Yarm and spotted two quick things costing you enquiries on `jmhtravelsolutions.co.uk`: the link from This Is Yarm hits a 404 page, and there’s still an IONOS template button pointing to `mail@example.com` alongside the 'Under construction' banner. Rather than just ringing to point out problems, I built a working 3-page concept for your 7-to-70 seater fleet, PSV driver cover, and Transport Manager services — can I text or email you the private preview link to look at when you’re off the road?"*

---

## 3. 3-Tap Phone Demo Script (`390px` Mobile View)

1. **Tap 1 — Instant Fleet Credibility (`index.html`):**
   Show how the "Coming Soon" screen and mobile cookie wall are replaced by a crisp midnight-navy executive hero (`7-Seater to 70-Seater · Standard & Executive`), a pinned `Call 01642 058430` bar, and the **Quick Capacity Selector**.
2. **Tap 2 — 7–70 Seater Tiers + B2B PSV Division (`fleet-services.html`):**
   Scroll through the 4 clear passenger tiers (7–8, 16, 24–35, 49–70 seaters) and show how **24/7 PSV Driver Hire** and **External Transport Manager Compliance** get dedicated high-trust commercial sections for fellow North East operators.
3. **Tap 3 — Smart Structured Quote Form (`quote.html`):**
   Type `28` into Passengers (watch it automatically suggest `24–35 Seater Midi-Coach`), toggle `Return Journey` vs `One-Way`, and show how airport flight numbers, luggage, and return pickup times arrive cleanly structured in one email instead of half-finished text messages.

---

## 4. Common Objections & Calm Answers

* **"I started building the IONOS site myself — I just haven't had time to finish it."**
  * *"Completely understandable when you’re managing vehicles, drivers, and compliance. Right now, though, IONOS is showing 'Under construction' and `mail@example.com` to paying Corporate and Private Hire customers. Everything here is already written around your exact 7–70 seater fleet and PSV services — we just swap in your confirmed email and fleet photos and point your existing domain across."*
* **"Most of our work comes from school contracts or trade PSV cover, not casual web browsers."**
  * *"That’s why we built dedicated B2B sections for 24/7 PSV Driver Hire and External Transport Manager compliance. When a school bursar, corporate PA, or fellow operator checks your site before awarding a contract, seeing a sharp compliance-led site instead of 'Under construction' builds instant trust."*
* **"Will switching break our existing domain?"**
  * *"Not at all — you keep `jmhtravelsolutions.co.uk`. We also add automatic redirects from `/contact/` and `/contact-us/` straight to the new quote page so the broken link on This Is Yarm starts working immediately."*

---

## 5. Pre-Launch Operator Confirmation Checklist (`[...]` Placeholders)

Before removing the concept banner and deploying to `jmhtravelsolutions.co.uk`:

- [ ] **Confirmed dispatch email:** Replace `[Confirmed booking email – owner to confirm]` (eliminating `mail@example.com` permanently) and connect the `quote.html` form handler.
- [ ] **301 Redirects:** Configure `/contact/` and `/contact-us/` -> `/quote.html` so *This Is Yarm* referrals land cleanly on the quote form.
- [ ] **Exact Fleet Specs & Real Vehicle Photos:** Replace `[Exact vehicle specs & photos – owner to confirm]` and swap the AI-generated illustrative photos (`images/hero.jpg`, `images/feature.jpg`) with real photos of JMH’s minibuses and coaches.
- [ ] **Operator Licence / CPC Credentials:** Confirm any O-licence or Transport Manager accreditation wording (`[Operator licence & CPC details – owner to confirm]`).
- [ ] **Location Privacy Check:** Confirm the owner wishes to keep public location display strictly area-based (`Eaglescliffe, Stockton-on-Tees & North East`) with zero residential street/postcode exposure.
