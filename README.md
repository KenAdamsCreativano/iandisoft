# I&I Software — Website Rebuild v3

Rebuilt on top of the original AI-generated skeleton, against `IandI_Website_Revamp_Spec.docx` v1.2. This is the second pass — after a full re-read of the spec end to end (not just spot checks), plus direct user-reported bugs.

## v3 — this pass (full spec re-audit)

- **Home hero was the wrong background.** Spec Section 5 explicitly calls for "Navy field, orange nodes." It was light/white. Now navy, with the hero illustration recolored (white/gold/orange on dark) so it still reads correctly.
- **Icons had no circle badge.** Spec 3.2/5 calls for "icon per card in an orange circle" — cards sitewide had bare floating icons, which is a big part of why it read as generic/templated. Every card, mini, and phase icon now sits in an actual tinted circular badge. Credential-strip badges also corrected to monochrome navy per spec (were orange).
- **Oversized headlines, fixed.** Confirmed bug: the two-column hero layout narrowed the text column but never reduced the font-size clamp, so headlines sized for a full-width hero were wrapping huge in a half-width space.
- **24 dead "Learn more" links, fixed.** These were sub-capability cards (fraud typologies, service lines, AI Advisory's four pillars) that were never meant to link anywhere — converted from fake anchors to honest static cards rather than inventing 24 pages that don't exist.
- **Blog and Careers added to the footer**, linking to the live iandisoft.com pages for now (per spec 4.1: "retain... keep the Blog for SEO"), per your call to link out rather than build placeholders.
- **AI Advisory's "velocity story" was missing entirely.** Spec 4.1 explicitly calls for retaining the old site's 6 hrs Discovery → 3 days Assessment → 12 wks MVP → 6 mo Production strip onto this exact page. Added as a proper 4-step pipeline.
- **AI Advisory pillar #1 icon** didn't match spec's explicit icon list (wanted a compass) — fixed.
- **Home page's I&I Federal callout** was missing the "dignified capitol/eagle line-art emblem" spec calls for — added a small capitol glyph.
- Fixed a couple of stray `target="_blank"` links missing `rel="noopener"`.

## v2 — first pass

**Fixed (was broken):**
- Mobile navigation was pure CSS with no hamburger button and no JS — the entire nav menu was unreachable below 1080px. Now a real off-canvas panel with a working toggle, keyboard support (Escape closes it), and tap-out.
- The Contact form was a set of unlabeled placeholder inputs wired to a `mailto:` link (which drops anything the visitor typed). It's now a real, labeled, accessible form — wired for Netlify Forms out of the box (zero backend needed if you deploy there), with client-side validation and a status message.
- All 13 legacy solution/practice pages that the spec explicitly calls out to **retain** (Section 4.1 / 6.8) didn't exist. They're built now, using the real copy and URL slugs from the live iandisoft.com so existing SEO carries straight over. `_redirects` and `sitemap.xml` are included.
- Meta titles/descriptions were the same placeholder on every page. Now unique per page, plus canonical tags, Open Graph, and a favicon.
- Executive Search and Workforce Solutions had paraphrased the client's actual "voice" statements into generic summary sentences. Restored the client's real wording.
- Leadership & Team used bracket placeholders throughout. The current real team is now shown, with monogram tiles; unfilled roles are clearly marked as open rather than invented.
- "LinkedIn: I&I Software Inc." was plain text everywhere. Now a real link.
- Who We Are was missing the Recognition section the spec calls for; added.

**Upgraded:**
- Built the full hero illustration system the spec asks for across every inner page (was text-only beyond the homepage).
- Added keyboard focus states and a skip-to-content link.

## What's still genuinely open (client-supply items, not build gaps)

- Final vector logo files.
- Advisory Board names/affiliations, and the two Management Team slots nobody's hired for yet (Executive Search, Federal & Public Sector).
- Confirmation on the Medicaid product's final name and whether the state AG engagement can be named.
- Which of the 13 retained platform pages to sunset vs. keep long-term.

## Deploying this

Static site, no build step. Drag the `site` folder onto Netlify, Vercel, or Cloudflare Pages — `_redirects` is already Netlify-flavored and gives clean URLs (no `.html`) out of the box. Point iandisoft.com's DNS at it.

## Local structure

Every page is a flat `.html` file at the repo root. `style.css` and `script.js` are shared across all 26 pages. `assets/` holds the logo and favicon.

