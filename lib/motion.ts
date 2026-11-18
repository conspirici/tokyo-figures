/**
 * Every JS-driven animation duration and spring lives here so the owner can tone things down in one place.
 * CSS-driven effects use the matching custom properties at the top of app/globals.css (search "--motion-").
 * See MOTION.md for the full list of effects.
 */
export const spring = { type: "spring", stiffness: 300, damping: 20 } as const;
export const softSpring = { type: "spring", stiffness: 260, damping: 26 } as const;
export const fade = { duration: 0.18, ease: "easeOut" } as const;

export const durations = {
  heroAutoplay: 5500, // ms between hero slides
  sparkleBurst: 0.6, // s
};

export const hover = {
  cardLift: -3, // px (set in CSS: .card-lift in app/globals.css)
};

export const press = { scale: 0.96 };
