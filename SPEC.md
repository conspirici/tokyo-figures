# Project brief: US catalog site for 15 imported Japanese figures

Build a polished, fast product catalog website for US collectors, using `products.json` (same folder) as the only data source. All English copy is already written in that file. Do not rewrite it, except to fix obvious typos.

## 1. Goal and audience
- Sell imported Japanese anime/game figures to US buyers (anime, gaming, Vocaloid, Evangelion, Genshin/Honkai fans, aged ~18–40).
- The site should feel like a trustworthy boutique import shop: curated, not a marketplace dump. 15 products only.
- Primary action on each product: the "buy" CTA (see section 5). Secondary: browse by franchise.

## 2. Tech stack and hosting (decided by owner)
- **Next.js (App Router) + TypeScript + Tailwind CSS.**
- **Hosting: Cloudflare Pages.** Use a **static export** (`output: 'export'` in `next.config.ts`, `trailingSlash: true`, `images: { unoptimized: true }`). Build command `next build`, output directory `out`.
  - Reason: Cloudflare has deprecated the old `@cloudflare/next-on-pages` adapter, and now steers full-stack Next.js to Workers. A 15-product catalog doesn't need server rendering, so static export on Pages is the simplest setup that still matches the owner's choice.
  - Static export means: no Next API routes, no middleware, no ISR, no `next/image` optimizer. Use `generateStaticParams` for product pages, and do filtering client-side. Wrap any `useSearchParams` use in `<Suspense>`.
  - Server code (the inquiry form, the checkout stub) goes in **Cloudflare Pages Functions** in a top-level `functions/` folder (e.g. `functions/api/inquiry.ts`), not in the Next app.
  - Local dev: `next dev` for the UI, `wrangler pages dev out` to test the functions against a built site. Add npm scripts for both.
  - If a future need requires server rendering, the migration path is Workers with the OpenNext Cloudflare adapter. Don't build that now.
- **Email: Resend**, called from the Pages Function with plain `fetch` to `https://api.resend.com/emails` (no Node SDK needed on the edge runtime).
- **Spam protection: Cloudflare Turnstile** (free) plus a hidden honeypot field.
- Data from `products.json` at build time. No database.
- Lighthouse score 90+ on all four categories.

## 3. Pages
1. **Home**: auto-sliding hero carousel (section 9b), a scrolling ticker strip, "Featured" row (Priority "1 – Must" items), franchise tiles, trust strip (see 6), outlet-deals row, email signup (UI only, no backend unless asked).
2. **Shop** (`/shop`): grid of all 15, with filters (franchise, scale, new vs outlet, price range, availability) and sort (featured, price low/high). Filters must work without a page reload and be shareable via URL query params.
3. **Product page** (`/products/[slug]`): see section 4.
4. **About / How it works**: how imports work, who we are (leave clearly marked placeholder copy for the owner).
5. **Wholesale & Contact** (`/wholesale`, `/contact`): both use the inquiry form in section 3a.
6. **Shipping & duties**, **Returns & outlet policy**, **FAQ**: use the placeholders in section 6. Mark every placeholder with `TODO(owner)` so none ships by accident.
7. **Legal**: Terms, Privacy, and the trademark disclaimer in section 6.

## 3a. Inquiry form (wholesale and product questions)
One reusable `<InquiryForm />` used on `/wholesale`, `/contact`, and as a modal or section on every product page. It also powers the "Notify me" button for unavailable items.

**Fields**
- Name (required), email (required), company/store name (optional, shown first when type is Wholesale).
- Inquiry type (required select): Wholesale / bulk order, Product question, Availability / notify me, Shipping & duties, Other.
- Products of interest: multi-select of the 15 products. Prefill from the URL (`?product=<slug>&type=...`) so product pages link straight in.
- Quantity (shown for Wholesale only), country and state/region, message (required, max 2000 chars).
- Consent checkbox ("I agree to be contacted about this inquiry"), hidden honeypot field, Turnstile widget.

**Behavior**
- Client: validate with zod, show inline errors, disable button while sending, show a clear success and failure state (no page reload). Accessible (labels, `aria-live` status).
- Server (`functions/api/inquiry.ts`, POST only):
  1. Parse and re-validate with the same zod schema (share it from `lib/inquiry-schema.ts`).
  2. Reject if the honeypot is filled. Verify the Turnstile token against `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
  3. Send the owner an email through Resend: `from` is the verified sender, `to` is the owner address, `reply_to` is the customer's email, subject like `[Wholesale] Name – Company`. Include every field and the product titles. **Escape all user input** in the HTML body (or send plain text).
  4. Optionally send the customer an auto-confirmation email (behind a config flag, default on).
  5. Return JSON `{ ok: true }` or `{ ok: false, error }` with correct status codes. Never leak the API key or Resend error internals to the browser.
- Wholesale page content: short pitch for US retailers and resellers, what we offer, how it works in 3 steps, then the form. Minimum order, pricing tiers and payment terms are `TODO(owner)` placeholders. Do not invent them.

**Environment variables** (Cloudflare Pages → Settings → Variables and Secrets; `.dev.vars` locally, git-ignored; commit a `.dev.vars.example`)
- `RESEND_API_KEY` (secret), `INQUIRY_TO_EMAIL`, `INQUIRY_FROM_EMAIL` (an address on a domain verified in Resend, with SPF/DKIM set up), `TURNSTILE_SECRET_KEY` (secret), `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
- The README must list the Resend domain verification and Turnstile setup steps.

## 4. Product page requirements
- Gallery with main image, zoom/lightbox.
- Title (`english_title`), tagline, price, availability badge, condition badge (**New** or **Outlet**), franchise link.
- Short description, bullet highlights, specs table (scale, bonus, franchise, condition).
- For `condition: "outlet"`: show a visible but friendly notice with `condition_note`. Do not hide it below the fold.
- "You may also like": 3 related items (same franchise first, then same priority).
- Structured data (`Product` JSON-LD), Open Graph tags, and unique `<title>` and meta description per page.

## 5. Pricing, availability and the buy button (IMPORTANT)
- Show `price_usd` as the price, formatted `$1,234` (whole dollars). **Only 4 items have a price (owner-set): Hu Tao, Rei Ayanami, Dan Heng, Asuka. The other 11 have `price_usd: null`.** For those, render "Price coming soon" and the Notify-me / inquiry button. **Do not infer, copy or derive a price from `market_reference_usd`, `landed_cost_usd` or anything else.** The owner will fill in `price_usd` later; the site must pick it up from `products.json` with no code changes. Never display landed cost, margin, JPY price, market reference or source URLs on the public site; they are internal fields.
- Two of the four priced items currently sell below cost (see section 8). Don't change the numbers, but surface the warning in the README.
- Availability: `source_status` is `"available"` or `"sale_ended"`. The Japanese store has marked 8 items as sale ended, so the owner may not be able to restock them.
  - `available` → "In stock / Ships from Japan" and an **Add to cart / Buy** CTA.
  - `sale_ended` → show "Currently unavailable" and a **Notify me** email form instead of a buy button. Put an `inStock` flag in one config file so the owner can flip it.
- Checkout: build the cart UI, but wire it to a stub Pages Function (`functions/api/checkout.ts` returning "coming soon") unless I ask for Stripe or Shopify. Structure it so Stripe Checkout can be added later.
- Display prices in USD only, formatted `$1,234`. Show "+ shipping calculated at checkout".

## 6. Copy, tone and trust content
- Voice: friendly, enthusiastic collector-to-collector. Plain US English, no hype claims, no invented specs. If a value is `unspecified` or `null`, omit it from the specs table; never fill it in.
- Trust strip on the home page and product pages (use these, owner can edit): "Ships from Japan", "Carefully packed", "Customs duties info up front", "Outlet items clearly labeled". Do not claim "authorized dealer", "official" or "free shipping" unless the owner says so.
- Shipping & duties page (placeholders): ships from Japan, tracked, typical delivery window `TODO(owner)`, and US import duty/tariff handling `TODO(owner)` (say clearly whether duties are charged at checkout or on delivery).
- Footer disclaimer (required): "This is an independent retailer, not affiliated with or endorsed by the publishers, studios or manufacturers of the products shown. All product names, characters and trademarks belong to their respective owners."
- Age note: a few figures have mature-styled designs (for example Musashi). Add a small "18+ collectors" label on the product page if the owner sets `ageGate: true` in config.

## 7. Images
- `source_image_url` points to images hosted by the Japanese retailer (tokyofigure.jp's CDN). **Do not hotlink these in production**, and don't assume I have the right to reuse them.
- Build the image component so it reads from `/public/images/{tf_id}/` (main.jpg, 2.jpg, 3.jpg). Add a script `npm run fetch-images` that downloads the `source_image_url` into place for local development only, and print a warning that the owner must replace them with their own photos or licensed images before launch.
- Always use responsive images (`srcset`/`next/image`), `alt` text built from `english_title`, lazy loading below the fold.

## 8. Known data issues to flag in the README (don't silently fix)
- Below landed cost at the owner's current `price_usd` (negative `margin_at_site_price_usd`): TF 1551 Hu Tao (-$5), TF 481 Dan Heng (-$33). TF 1553 Asuka is only +$3. Landed cost assumes the sheet's $35 shipping placeholder and 30% duty estimate, so recheck with real forwarder quotes.
- Every record has a `needs_verification` list (official English names, exact scale/height, maker). Show these only in a developer-visible report (`npm run report` printing a table), never on the public site.
- The outlet descriptions are generic, so give the outlet items differentiated tagline/highlights from the JSON and don't duplicate paragraphs.

## 9. Design direction
**Reference vibe (owner's inspirations):** Japanese and Thai doujin-event catalog posters. What to borrow, as layout and style principles only (do **not** copy their artwork, logos or text):
- A bright, graphic **grid-paper background** with bold flat color blocks.
- **Numbered items** with a chunky number tab, name, and a bold **price chip** under each product.
- **Sticker-style badges** (burst or rounded) such as NEW, OUTLET, LIMITED, RESTOCK-style labels, slightly rotated.
- Big, tight, heavy display type for headings, small neat type for specs.
- Labeled sections and tags like a printed poster (e.g. "FIGURES", "OUTLET").

**Where to deviate (these are $120–$500 collectibles for US buyers, not $5 zines):**
- Keep the poster energy in the framing (backgrounds, badges, numbering, headings), but let **large, clean product photography** be the hero. No busy artwork behind products.
- Product pages are calmer and more trust-forward than the posters: lots of whitespace, clear condition/availability info, shipping and duties clarity.
- Keep body copy readable. Poster-style decoration must never reduce legibility or contrast.

**Visual system**
- Palette: electric blue `#1F4FFF` (primary), lime `#D7FF3A` (accent/stickers), ink `#0B1020` (text), white and a very light blue-grey grid paper `#F4F7FF`. Condition badges: New = blue, Outlet = lime on ink, Limited = pink `#FF5FA2`, Unavailable = grey. Define these as design tokens in one file.
- Type: a heavy grotesque or wide display font for headings (e.g. Archivo Black / Space Grotesk via `next/font`) and a clean sans for body. Latin only, so no CJK font loading needed on the public pages.
- Components: numbered product card (`No. 01`), price chip, sticker badge, grid-paper section, ticket-style outlet notice. Subtle hover lift and a small sticker "wiggle" on hover; respect `prefers-reduced-motion`.
- Light theme only for launch (the grid-paper look depends on it). Dark mode is out of scope.
- Mobile-first. Test at 375px, 768px, 1280px.
- Accessible: WCAG AA contrast (check lime-on-white: always put lime behind ink text, never white text on lime), keyboard navigation, visible focus, semantic HTML.

## 9b. Hero carousel (custom images, already delivered)
The three hero images are in the repo's `assets/` folder. Each is a **flattened 1774x887 PNG (2:1)** where the figure is already composited into the scene. Use them as-is; don't regenerate or edit them.

| Slide | Source file in `assets/` | Product | Link | Focal point (x, y) | Theme |
|---|---|---|---|---|---|
| 1 | `Neon Miku Sneaker Pop-Art Showcase.png` | Miku "Cute" 1/4 Limited (TF 434) | `/products/hatsune-miku-cute-1-4-tokyo-figure-limited` | 78%, 60% | street style, music |
| 2 | `Anime Figure Under a Lime Moon.png` | Hu Tao 1/7 APEX [Outlet] (TF 1551) | `/products/genshin-impact-hu-tao-1-7-apex-outlet` | 72%, 50% | plum blossom, lanterns, lime moon |
| 3 | `Summer Beach Anime Figure Poster.png` | Charlotte Corday, Summer Queens (TF 565) | `/products/fgo-caster-charlotte-corday-summer-queens` | 70%, 55% | summer beach |

- **Asset pipeline:** add a script `npm run optimize-hero` that reads those PNGs and writes `public/hero/slide-1.webp`, `slide-2.webp`, `slide-3.webp` (and `.avif` if easy) at **1774w and 1200w** (no upscaling; the sources are 1774 px wide) plus a tiny blurred placeholder. Keep the original PNGs in `assets/` out of `public/`. Target each WebP under about 200 KB. Add a check that fails the build if a slide's image is missing, so the fallback is only used in dev.
- **Content config** `content/hero.json`: `{ slug, image, focal: {x, y}, alt, headline, subline, ctaLabel, ctaHref, badge }` per slide. Alt text describes the scene (e.g. "Hatsune Miku figure sitting on a pedestal among sneaker boxes on a blue pop-art background"). Headlines under 6 words, no price or shipping claims. Suggested copy: (1) "Street-style Miku" / "1/4 scale, limited colorway" / "Shop Miku", (2) "Hu Tao, plum-blossom edition" / "Genshin Impact, 1/7 scale" / "See Hu Tao", (3) "Summer Queens" / "Charlotte Corday, pre-painted" / "Shop the figure". Owner can edit.
- **Image behavior:** because the figure is baked into each image, the figure itself can't be animated separately. Animate the *scene around it* instead (see below). Don't attempt to cut out or mask the figure.
- **Layout (desktop and tablet ≥ 768px):** full-bleed, keep the 2:1 ratio (`aspect-ratio: 2/1`, min-height 480px, max-height 80vh), `object-fit: cover`, `object-position` from the slide's focal point. The **left ~40% of every image is empty blue grid by design**: put the text block there (headline, subline, CTA, badge). White or lime headline text on that blue passes contrast; never put ink-black text there.
- **Layout (mobile < 768px):** do **not** crop the image (the figure fills the right ~55% and would be cut). Show the image at full width at its natural 2:1 on top, then the text block and CTA directly below on the same electric-blue grid-paper background, so it reads as one poster. Slide height is image + text block, and the carousel reserves the tallest slide's height to avoid layout shift.
- **Carousel behavior:** autoplay every **5.5 s**; pause on hover, focus, touch and when the tab is hidden; swipe, arrow keys, dot indicators with an animated progress fill on the active dot; visible **pause/play button** (required for accessibility). With `prefers-reduced-motion`, no autoplay, no slide transitions, manual controls only. Mark up as a carousel region (`aria-roledescription="carousel"`), announce slide changes politely only when the user navigates manually.
- **Per-slide motion (about 900 ms, only the active slide):**
  1. Image crossfades in while slowly scaling 1.06 → 1.0 (Ken Burns), with a slight horizontal parallax tied to pointer position on desktop (max 12 px).
  2. Headline words stagger up; subline and CTA follow; the CTA gets one small bounce.
  3. A **sticker badge** (from `badge`, e.g. NEW / OUTLET / LIMITED, rotated -6°) stamps in over the top-left of the figure area with a springy overshoot.
  4. **Decorative overlay layer on top of the image**, built in SVG/CSS, not baked in: 4-6 sparkle (four-point star) shapes at fixed positions around the figure that twinkle on a staggered loop, plus lime/pink confetti-like dots that drift. Keep it subtle so it doesn't fight the artwork, and disable it for reduced motion. Place sparkles on empty areas near the focal point, not over the figure's face.
  5. Exit is a quick fade (200 ms).
- **Performance:** slide 1's image is the LCP element: render it in the initial HTML with `fetchpriority="high"` and the blurred placeholder, no JavaScript needed to show it. Slides 2 and 3 load lazily after first paint. Use `srcset` with the 1200w and 1774w versions and correct `sizes`.
- **Fallback:** if a slide image fails to load, show an electric-blue grid-paper CSS background with the product's own photo so the hero never looks broken.
- **Content check for owner (do not change in code):** the figure in the slide 3 image should match product TF 565; the owner will confirm before launch.

## 9c. Motion and micro-interactions (the site must feel lively)
Use **Motion** (the `motion` / Framer Motion library, loaded with `LazyMotion` + `domAnimation` to keep the bundle small) plus plain CSS for simple hovers. Mark animated components `"use client"`. Spring defaults: stiffness ~300, damping ~20 (snappy, slightly bouncy), not slow or floaty.
- **Header:** hides when scrolling down and slides back in when scrolling up; adds a hard drop-shadow "sticker" outline once scrolled.
- **Ticker strip** under the hero: seamless marquee of short phrases ("New arrivals", "Outlet deals", "Ships from Japan", "Wholesale welcome"), pauses on hover. Only use claims that are true.
- **Scroll reveals:** sections and product cards pop/rise into view with a stagger (once, not on every scroll). Section titles have a marker-underline that draws in.
- **Product cards:** on hover lift ~6px with a hard offset shadow (poster style), the image scales ~1.04 and tilts slightly following the cursor on desktop, the number tab and price chip bounce, the sticker badge wiggles. On touch devices, use a quick press-scale instead of hover.
- **Badges (NEW / OUTLET / LIMITED):** stamp in on reveal, subtle idle pulse on NEW only, never more than one looping animation per screen area.
- **Buttons:** squish on press (scale 0.96), springy release. "Add to cart" turns into a check mark with a small sparkle burst, and the cart icon in the header bumps and its count ticks up.
- **Filters and sort:** chips pop on select; the product grid reflows with **layout animations** (cards slide to their new positions, removed cards shrink out, new ones pop in) with no full-page jump.
- **Product page:** gallery thumbnails slide the main image with a crossfade, click-to-zoom lightbox opens with a spring scale from the thumbnail; the price chip and badges pop in on load; related items reveal with a stagger.
- **Forms:** focus ring grows with a gentle bounce, validation errors shake once, the submit button shows a loading state and then a success state with a sparkle burst and a friendly confirmation message.
- **Page transitions:** short fade + slide (≈200 ms). Never block navigation on animation.
- **Cursor and sound:** no custom cursor, no sound.
- **Rules:**
  1. Animate only `transform` and `opacity` (plus `layout` animations from Motion). No animating width, height or top/left.
  2. Keep 60 fps on a mid-range phone; test with CPU 4x slowdown in DevTools.
  3. `prefers-reduced-motion: reduce` disables parallax, tilt, idle loops, marquee and autoplay, and replaces springs with simple fades.
  4. Animations never delay content or the CTA. Content must be visible and usable without JavaScript.
  5. Add a `MOTION.md` or README section that lists each effect and where it's configured, so the owner can tone things down. Put durations and spring values in one `lib/motion.ts` file.

## 9a. Cloudflare Pages deployment notes
- Connect the repo to a Pages project. Build command `npm run build`, output directory `out`, set `NODE_VERSION` to a current LTS.
- `public/_headers`: security headers (CSP allowing Turnstile, `X-Content-Type-Options`, `Referrer-Policy`) and long cache for `/_next/static/*`.
- `public/_redirects` only if needed. Add a custom 404 page.
- Document in the README how to add the production secrets and how to preview with `wrangler pages dev`.

## 10. Acceptance criteria
- [ ] Exactly 15 products render, matching the `tf_id` values in `products.json`. A build-time assertion fails if the count is not 15 or an ID is duplicated.
- [ ] No internal fields (landed cost, margin, JPY, market reference, source URLs) appear in the built HTML, JS bundles or JSON served to the browser. Strip them in a data-loading layer.
- [ ] All 8 `sale_ended` items show "Currently unavailable" instead of a buy button.
- [ ] Items with null price show "Price coming soon".
- [ ] Filters, sort and search (by name/franchise) work and are URL-shareable.
- [ ] Lighthouse 90+ and no console errors; `npm run build` passes with zero TypeScript errors.
- [ ] Home hero has 3 auto-advancing slides built from the three images in `assets/` via `content/hero.json`, with pause button, swipe and keyboard control. On mobile the image shows uncropped with the text below it. The fallback visuals appear if an image fails.
- [ ] Reduced-motion mode shows no autoplay, tilt, marquee or looping animation. Lighthouse performance stays 90+ with animations on, LCP under 2.5 s on mobile emulation.
- [ ] `npm run build` produces a static `out/` folder with no server dependencies, and the site works when served from Cloudflare Pages.
- [ ] The inquiry form works end to end in `wrangler pages dev`: valid submit sends one email via Resend with `reply_to` set to the customer; invalid input, honeypot hits and failed Turnstile are rejected; user input is escaped in the email.
- [ ] The Resend and Turnstile secrets never appear in client bundles or the repo.
- [ ] Product pages link into the form with the product prefilled; unavailable items open the form as "Availability / notify me".
- [ ] README explains how to edit prices, stock flags and copy, and lists every `TODO(owner)`.

## 11. Suggested build order
1. Data layer + types + build-time validation of `products.json`.
2. Layout, nav, footer, design tokens.
3. Shop grid + filters. 4. Product page. 5. Home page. 6. Inquiry form + Pages Function + Wholesale/Contact pages. 7. Static pages + legal. 8. SEO + structured data. 9. Accessibility/performance pass. 10. Cloudflare config + README.
