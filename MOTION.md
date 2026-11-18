# Motion guide

JS springs and durations live in `lib/motion.ts`. The CSS timing knobs are the `--motion-*` variables at the top of `app/globals.css`. Motion (`motion/react`) is code-split through `LazyMotion` in `components/MotionProvider.tsx`. It uses `domMax` rather than `domAnimation` because the shop grid and the lightbox need layout animations. The feature bundle loads after first paint.

`prefers-reduced-motion: reduce` turns off autoplay, the marquee, sparkles, confetti and idle pulses, and swaps everything else for quick fades. This is handled by the reduced-motion block at the end of `globals.css` plus `MotionConfig reducedMotion="user"`.

| Effect | Where |
|---|---|
| Header hides on scroll down, gets a sticker shadow once scrolled | `components/Header.tsx` |
| Cart icon bump + count tick | `components/Header.tsx` (keyed on `bump` from `lib/cart.tsx`) |
| Hero autoplay (5.5 s), progress dot, pause/play, swipe, arrow keys | `components/HeroCarousel.tsx`, `durations.heroAutoplay` |
| Hero Ken Burns, word stagger, CTA bounce, badge stamp, sparkles, confetti | `.hero-*`, `.sparkle`, `.confetti` in `globals.css` |
| Ticker marquee (pauses on hover) | `components/Ticker.tsx`, `--motion-ticker` |
| Scroll reveals + marker underline draw-in | `components/Reveal.tsx`, `.reveal` / `.marker` in CSS |
| Product card: small lift + hard shadow on hover (the only hover animation) | `.card-lift` in `globals.css` |
| NEW badge idle pulse (only the first card in a row) | `.sticker-pulse` |
| Filter chip pop + grid layout reflow | `components/ShopClient.tsx` |
| Add to cart → check mark + sparkle burst | `components/BuyBox.tsx`, `components/SparkleBurst.tsx` |
| Gallery crossfade + spring lightbox | `components/Gallery.tsx` |
| Form focus ring, error shake, sending/success states | `.field-focus`, `.shake`, `components/InquiryForm.tsx` |
| Button squish | `.btn-press` |
| Page transition (fade + slide, 200 ms) | `app/template.tsx`, `--motion-page` |

To tone everything down, raise the spring `damping` in `lib/motion.ts` and lengthen or remove the CSS keyframes.

Hover effects are kept to a minimum on purpose: the hero, the logo, stickers, prices and images don't animate on hover.
