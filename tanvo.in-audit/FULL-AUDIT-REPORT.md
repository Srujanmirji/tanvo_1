# Tanvo SEO and AI Visibility Audit

Audit date: 13 September 2026
Website: https://www.tanvo.in/
Estimated health score before fixes: **44/100**

## Executive summary

Tanvo is crawlable and fast, but it does not yet have the content depth, real-world proof, local entity strength, reviews, or independent mentions required to compete for broad agency searches. A sampled search for `site:tanvo.in` did not surface the site, and local results were dominated by older agencies with dedicated service pages, addresses, case studies, and reviews.

The search-result globe was caused by favicon processing, not the Organization logo. The live `/favicon.ico` returned 404. The repository now contains stable ICO, PNG and Apple favicon assets generated from `Tanvo_Logo.png`; the transparent navigation mark remains unchanged.

## Scores

| Area | Score | Key evidence |
|---|---:|---|
| Technical SEO | 67/100 | HTTPS, robots, sitemap and valid schema pass; initial body was an empty SPA shell and only three URLs were indexed in the sitemap. |
| Local SEO | 18/100 | No verifiable Google Business Profile, reviews, complete NAP, local citations, or local authority footprint was found. |
| AI/LLM visibility | 33/100 | AI crawlers are allowed, but the site lacked raw HTML content, evidence-rich case studies, named experts, and independent references. |
| Content/proof | 25/100 | The portfolio correctly labels current work as concepts; this also means there is little client proof for search engines or LLMs to cite. |

## Implemented in this repository

- Added dedicated favicon assets from the user-provided non-transparent SEO logo and pointed all pages to them.
- Changed Organization structured data to use `/seo-logo.png` without changing the visible navigation/footer logo.
- Added meaningful matching fallback HTML to the homepage's initial response for non-JavaScript crawlers.
- Added an indexable `/web-development-agency-hubli-dharwad/` landing page with original service, process, local and FAQ content.
- Added truthful `Service` and `FAQPage` structured data to that page.
- Added the page to the sitemap and linked it from the rendered homepage.
- Added `/llms.txt` as a low-cost discovery aid, with explicit disclosure that concept work is not client work.
- Added a browser regression test for the page and SEO assets.

## Material limitations

- No Google Search Console, GA4, PageSpeed API, Moz, Bing Webmaster, or GBP access was available.
- No street address, business hours, coordinates, legal entity name, founder profiles, approved client case studies, or testimonials were supplied, so none were invented.
- No code change can guarantee a number-one Google position or force an LLM to recommend a business.

## Evidence sources

- [Google favicon requirements](https://developers.google.com/search/docs/appearance/favicon-in-search)
- [Google guidance for AI search features](https://developers.google.com/search/docs/appearance/ai-features)
- [Google LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [OpenAI: ChatGPT search](https://help.openai.com/en/articles/9237897-chatgpt-search)

See [ACTION-PLAN.md](./ACTION-PLAN.md) for the work that must happen outside the repository.
