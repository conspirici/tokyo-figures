# Hero image prompts for ChatGPT (3 slides)

Site palette: electric blue #1F4FFF, lime #D7FF3A, ink black #0B1020, white / light grid #F4F7FF, small hot-pink accent #FF5FA2.

## Which product photos to attach
Download these product photos and attach one per prompt (use the clearest full-body front or 3/4 shot; the gallery pictures on each product page are often better than the cover).

| Slide | Product | Photo on the product page |
|---|---|---|
| 1 | Hatsune Miku "Cute" 1/4 (TF 434) | https://tokyofigure.jp/products/detail/434 |
| 2 | Genshin Hu Tao 1/7 (TF 1551) | https://tokyofigure.jp/products/detail/1551 |
| 3 | FGO Charlotte Corday, Summer Queens (TF 565) | https://tokyofigure.jp/products/detail/565 |

Note: these are the retailer's photos. Use your own photos or get permission before launch.

## Two ways to do it (pick one)

**Option A, figure included:** ChatGPT places your attached figure photo into the scene. Quickest, but ChatGPT may subtly change the figure. Check it carefully against the photo.

**Option B, background plate + real photo (recommended):** Generate the background with an empty pedestal, then remove the background from your product photo (ask ChatGPT "remove the background, return a transparent PNG, keep edges clean", or use remove.bg) and let the site overlay it. The figure stays 100% accurate and the site can animate it (pop-in, floating, parallax).

## Shared style block (paste at the start of every prompt)
```
Create a wide landscape 2:1 website hero background (about 2400x1200). Style: flat graphic pop-poster, inspired by Japanese doujin event catalog posters. Electric-blue (#1F4FFF) field with a subtle white grid-paper pattern, bold flat lime (#D7FF3A) geometric shapes, halftone dot patches, starbursts, zig-zag lines and a few four-point sparkles, thin ink-black outlines, slightly retro sticker feel, small hot-pink (#FF5FA2) accents. Limited palette only: electric blue, lime, white, ink black, hot pink. Clean, high-contrast, cheerful, premium. Composition: keep the LEFT 40% of the image calm and mostly empty (flat blue with faint grid) because website text will be placed there. Put all decoration and the focal subject on the RIGHT 60%, centered at about 70% from the left edge. Do NOT include any text, letters, numbers, logos, watermarks or UI. No people, no hands, no extra characters.
```

## Slide 1: Miku street-style (Option A)
Attach the Miku photo, then paste the shared style block followed by:
```
Theme: street style and music. Decorative props around the focal area: stacked sneaker boxes in lime and blue, blank speech bubbles, music notes, equalizer bars, a chunky starburst. Focal subject: the attached figure, placed on a low round white pedestal at right-centre, shown full-length. Reproduce the figure EXACTLY as in the attached photo: do not redraw, restyle, re-pose, recolor, crop or change its face, hair, outfit, shoes, proportions or base. Add only a soft contact shadow under it and a thin lime rim light. Everything else is flat graphic background.
```

## Slide 2: Hu Tao plum blossom (Option A)
Attach the Hu Tao photo, then:
```
Theme: winter plum blossoms. Decorative props: falling pink and white plum-blossom petals, round paper-lantern shapes in lime and blue, a large flat lime circle like a moon behind the focal area, simple branch silhouettes in ink black at the top right. Focal subject: the attached figure on a low round pedestal at right-centre, full-length. Reproduce the figure EXACTLY as photographed: do not redraw, restyle, re-pose, recolor, crop or change anything about it. Add only a soft contact shadow and a thin lime rim light.
```

## Slide 3: Charlotte Corday summer (Option A)
Attach the Charlotte Corday photo, then:
```
Theme: summer beach. Decorative props: a big flat lime sun disc behind the focal area, layered wave lines in blue and white, beach-ball and starfish shapes, floating bubbles, sparkles. Focal subject: the attached figure on a low round pedestal at right-centre, full-length. Reproduce the figure EXACTLY as photographed: do not redraw, restyle, re-pose, recolor, crop or change anything about it. Add only a soft contact shadow and a thin lime rim light.
```

## Option B versions (background plate only)
Use the shared style block plus the theme sentence from each slide above, then replace the "Focal subject" part with:
```
Focal area: an EMPTY low round white pedestal at right-centre with a soft contact shadow, and nothing standing on it. Leave a clear, uncluttered area of about 45% of the image height above the pedestal where a figure will be added later, with no props overlapping that area. No figure, no character, no person.
```

## Tips for good results
- If ChatGPT adds text or characters, reply: "Remove all text and any characters. Keep everything else the same."
- If the left side is busy, reply: "Make the left 40% empty flat blue with faint grid, move decorations to the right."
- If colors drift, reply: "Use only these hex colors: #1F4FFF, #D7FF3A, #0B1020, #F4F7FF, #FF5FA2."
- Option A: compare the figure to your photo. If anything changed, switch to Option B.
- Export as PNG, then save as `public/hero/slide-1-bg.webp` (and `slide-1-figure.png` for the cutout in Option B), `slide-2-*`, `slide-3-*`.
- Optional mobile version: ask for a portrait 4:5 (1080x1350) of the same scene with the focal subject centred in the top 60% and empty space below for text.
