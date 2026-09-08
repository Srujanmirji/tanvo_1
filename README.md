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

React, TypeScript, Vite, Tailwind CSS, Framer Motion, GSAP ScrollTrigger, Lenis, and Lucide. The hero uses CSS 3D geometry without WebGL. Imagery is stored locally as WebP. Desktop work uses 76vw project panels in a pinned horizontal section; mobile, short viewports, and reduced-motion modes use native horizontal scrolling. Services use an asymmetric grid. Capability tabs support hover, touch, and arrow keys. A sticky philosophy column and three-stage full-screen story establish the editorial pacing. Mouse parallax and offscreen-paused idle motion run only on suitable desktop pointers. Reduced-motion changes are observed live. Email and telephone CTAs open the visitor's configured applications.

## Content to finalize before public launch

- Project screenshots are deferred at the user’s request. Replace the labeled concept previews when the actual assets arrive, and confirm project years, service scope, links, and results.
- Supply approved client testimonials; none have been fabricated.
- Supply the actual showreel video. The current studio introduction is a designed visual presentation, labeled accordingly.
- Confirm supplied team/project counts and contact information.
- Add verified social profile URLs if desired.

Photos originate from Unsplash. Typography is Manrope via Google Fonts. No backend, analytics, tracking, or contact submission service is configured. The site can be hosted as the static `dist` output.
# tanvo_1
# tanvo_1
