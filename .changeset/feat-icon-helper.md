---
'saaskip': minor
---

Add `icon()` render helper to abstract the icon library behind a single registry. Swapping from Hugeicons to Lucide, Heroicons, or Radix now requires changing only `src/config/icons.tsx` — no component or test changes needed.
