# Tokyo Figure catalog

A static Next.js (App Router) + Tailwind catalog for 15 imported Japanese figures. It's hosted on Cloudflare Pages, and the inquiry form and checkout stub run as Pages Functions. `products.json` is the only data source.

## Quick start

```bash
npm install
npm run fetch-images     # dev only: downloads retailer photos into public/images (see warning below)
npm run optimize-hero    # assets/*.png -> public/hero/*.webp/.avif + blur placeholders
npm run dev              # UI at http://localhost:3000 (the forms need pages:dev)
npm run pages:dev        # builds, then serves out/ + functions at http://localhost:8788
```

Copy `.dev.vars.example` to `.dev.vars` (functions) and `.env.example` to `.env.local` (public build vars). Both examples use Cloudflare's always-pass Turnstile test keys. `INQUIRY_DRY_RUN=1` logs emails instead of sending them.

| Script | What it does |
|---|---|
| `npm run build` | `prebuild` validates products.json (exactly 15 products, unique IDs) and checks the hero images exist. Then it runs `next build` to make `out/`, and `postbuild` fails if internal fields, source URLs or secrets appear in `out/`. |
| `npm run report` | Developer-only table of prices, landed cost, margin and the `needs_verification` list. Never shown on the site. |
| `npm run images` | Rebuilds the responsive variants (480/960 webp) from your own `public/images/{tf_id}/main.jpg, 2.jpg, 3.jpg`. |
| `npm run typecheck` / `typecheck:functions` | TypeScript checks. |

## ⚠ Known data issues (not fixed, as the spec asks)

Prices come from `price_usd` in `products.json` (`my_price_usd` is still accepted). Run `npm run report` for the full table.

- **Selling below cost:** TF 1551 Hu Tao **−$5**, TF 481 Dan Heng **−$33**, TF 1562 Chika Fujiwara **−$18**.
- **Thin margins:** TF 1553 Asuka +$3, TF 1547 Inazuma box +$5, TF 1542 March 7th +$13.
- **8 items are `sale_ended`** at the source. They show "Currently unavailable" and Notify me instead of a buy button.
- Every record has a `needs_verification` list (official English names, scale, maker).
- The hero slide 3 figure should match TF 565. The owner needs to confirm this.

## ⚠ Images

`npm run fetch-images` downloads photos from the Japanese retailer's CDN **for local development only**. Don't assume you have the right to reuse them. Replace every file in `public/images/{tf_id}/` (`main.jpg`, optional `2.jpg`, `3.jpg`) with your own photos or licensed images, then run `npm run images`. The folder is git-ignored. If a product has no photo, a numbered placeholder tile is shown instead.

## Editing the store

- **Stock flags:** `config/store.ts` → `inStockOverrides` (by TF ID). The default comes from `source_status`.
- **Prices:** edit `my_price_usd` in `products.json`, or use `priceOverrides` in `config/store.ts`. `null` shows "Price coming soon".
- **18+ label:** `ageGate` in `config/store.ts`.
- **Store name, email, ticker phrases, trust strip:** `config/store.ts`.
- **Product copy:** `products.json`. **Hero slides:** `content/hero.json`.
- **Design tokens** (colors, fonts, shadows): the `@theme` block at the top of `app/globals.css`.
- **Motion:** see [MOTION.md](MOTION.md).

Rebuild and redeploy after any change.

## Policies (edit in one place)

All shop policy copy reads from `policies` in `config/store.ts`: reply time, handling time, delivery window, carriers, how duties are handled, damage-report window, return window, refund time, wholesale minimum, wholesale pricing and payment terms, and payment methods. Change a value there and every page (Shipping, Returns, FAQ, Terms, Wholesale, form confirmations) updates. The Terms and Privacy pages are written as standard launch copy. Have them reviewed for your business before launch.

## Inquiry form setup

The flow is `components/InquiryForm.tsx` → `POST /api/inquiry` (`functions/api/inquiry.ts`). Both sides validate with `lib/inquiry-schema.ts`. Requests are rejected if the honeypot is filled (the server pretends success) or if Turnstile verification fails. All user input is HTML-escaped in the email. `reply_to` is set to the customer, and the customer gets an optional confirmation (`SEND_CUSTOMER_CONFIRMATION`, on by default).

**Resend**
1. Create a Resend account and go to **Domains → Add domain** (a subdomain like `mail.yourshop.com` works well).
2. Add the DNS records it shows (SPF/MX TXT, DKIM CNAMEs, optional DMARC) in Cloudflare DNS, then wait for "Verified".
3. Create an API key with **Sending access**.
4. Set `INQUIRY_FROM_EMAIL` to an address on that domain, e.g. `Shop <inquiries@mail.yourshop.com>`.

**Turnstile**
1. Go to Cloudflare dashboard → **Turnstile → Add widget**. Add your `*.pages.dev` and custom domains (plus `localhost` for testing) and choose Managed mode.
2. Copy the **site key** into `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. It's public and baked in at build time, so set it as a build variable.
3. Copy the **secret key** into `TURNSTILE_SECRET_KEY` as a secret.

**Variables** (Pages → Settings → Variables and Secrets, for Production and Preview):
`RESEND_API_KEY` (secret), `TURNSTILE_SECRET_KEY` (secret), `INQUIRY_TO_EMAIL`, `INQUIRY_FROM_EMAIL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_SITE_URL`, optional `SEND_CUSTOMER_CONFIRMATION`. Do **not** set `INQUIRY_DRY_RUN` in production.

## Checkout

The cart is stored in localStorage. "Check out" calls `functions/api/checkout.ts`, which currently answers "coming soon". To add Stripe, follow the steps in that file's header comment. The client (`lib/checkout.ts`) already redirects to the returned `url`. Prices must be looked up server-side.

## Deploying to Netlify (recommended for now)

`netlify.toml` already configures everything: build command `npm run build`, publish directory `out`, Node 22, and `NEXT_PUBLIC_FORM_BACKEND=netlify`.

1. In Netlify, choose **Add new site → Import an existing project**, then pick this GitHub repo. The settings are read from `netlify.toml`.
2. Go to **Site configuration → Forms** and click **Enable form detection**, then trigger a redeploy. Netlify registers the `inquiry` form from `public/__forms.html`.
3. Under **Forms → Form notifications**, add an email notification so every inquiry lands in your inbox. Submissions also appear in the dashboard under Forms → inquiry.
4. Optional: set `NEXT_PUBLIC_SITE_URL` to your Netlify URL or custom domain, which is used for canonical links and the sitemap.

On Netlify the inquiry form needs no API keys. Spam is handled by Netlify's filter plus a honeypot field, and Turnstile/Resend aren't used. Checkout goes straight to the order request form. `public/_headers` and the 404 page work on Netlify as-is. Note that the form posts to Netlify only on the deployed site: under `npm run dev` the submit fails, because there's no Netlify backend locally.

## Deploying to Cloudflare Pages (alternative)

1. Connect the repo to a Pages project. Use build command `npm run build`, output directory `out`, and set the `NODE_VERSION` variable to `22` (current LTS).
2. Add the variables above. Commit `public/hero/*` (generated by `npm run optimize-hero`), or the build fails on purpose.
3. `public/_headers` sets the security headers, a CSP that allows Turnstile, and long caching for `/_next/static/*`. `script-src` includes `'unsafe-inline'` because Next's static export inlines its bootstrap scripts.
4. Preview locally with `npm run pages:dev` (wrangler, using `.dev.vars`).

If server rendering is ever needed, move to Workers with the OpenNext Cloudflare adapter.
