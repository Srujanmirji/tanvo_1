# Tanvo

A responsive, animated agency website based on the supplied Tanvo visual reference.

## Run

```sh
npm install
npm run dev
```

## Validate

```sh
npm run build
npm test
```

Browser checks use installed Google Chrome through Playwright. They cover desktop/mobile rendering, local image loading, service expansion, portfolio and article dialogs, menu keyboard focus, capability tab keyboard controls, sequential process states, all three story frames, and switching reduced motion on while the page is open.

## Implementation

React, TypeScript, Vite, Tailwind CSS, Framer Motion, GSAP ScrollTrigger, Lenis, and Lucide. The hero uses CSS 3D geometry without WebGL. Imagery is stored locally as WebP. Desktop work uses 76vw project panels in a pinned horizontal section; mobile uses large vertical case studies; tablet, short desktop viewports, and desktop reduced-motion modes use native horizontal scrolling. Services use an asymmetric grid. Capability tabs support hover, touch, and arrow keys. A sticky philosophy column, masked heading reveals, and three-stage full-screen story establish the editorial pacing. The floating header stays compact; the desktop cursor distinguishes links from project imagery. Mouse parallax and offscreen-paused idle motion run only on suitable desktop pointers. Reduced-motion changes are observed live. Email and telephone CTAs open the visitor's configured applications.

## Inquiry form

"Start a Project" (hero and contact section) opens a modal form that POSTs JSON to a Google
Apps Script web app, which appends a row to a Google Sheet and emails `NOTIFY_EMAIL`.

Setup lives in [`apps-script/Code.gs`](apps-script/Code.gs) — paste it into the Sheet's Apps
Script editor, deploy as a web app (*Execute as: Me*, *Who has access: Anyone*), then copy the
values into `.env` (see [`.env.example`](.env.example)):

```
VITE_ENQUIRY_ENDPOINT=https://script.google.com/macros/s/.../exec
VITE_ENQUIRY_SECRET=<same string as SHARED_SECRET in Code.gs>
```

The secret ships in the client bundle — it deters casual endpoint abuse, it is not a credential.
Rotate it in both places if it gets scraped.

Every value is written through `text()` in `Code.gs`, which prefixes a literal-text apostrophe
when a value starts with `=`, `+`, `-` or `@`. Without it Sheets parses the cell as a formula:
a phone number like `+91 96633 41218` lands as `#ERROR!`, and `=IMPORTXML(...)` typed into the
brief would execute inside your spreadsheet.

Request body: `{secret, name, email, phone, capabilities, message, pageUrl, tv_hp}`.
`capabilities` is the selected chips joined with `", "`. `tv_hp` is the honeypot — Code.gs still
records those rows but marks them `SPAM?` and skips the email, so no real inquiry is lost.

The response is read as JSON, so `{status:'error', message}` from Code.gs is shown to the visitor
verbatim; only a network failure falls back to the generic message. After **any** edit to
`Code.gs` you must Deploy → Manage deployments → **New version** — saving alone does not update
the live `/exec` URL.

## Content to finalize before public launch

- Project screenshots are deferred at the user’s request. Replace the labeled concept previews when the actual assets arrive, and confirm project years, service scope, links, and results.
- Supply approved client testimonials; none have been fabricated.
- Supply the actual showreel video. The current studio introduction is a designed visual presentation, labeled accordingly.
- Confirm supplied team/project counts and contact information.
- Add verified social profile URLs if desired.

Photos originate from Unsplash. Typography is Manrope via Google Fonts. No backend, analytics, tracking, or contact submission service is configured. The site can be hosted as the static `dist` output.
# tanvo_1
# tanvo_1
