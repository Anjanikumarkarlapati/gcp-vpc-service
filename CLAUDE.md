# Frontend design rules

Use this format for ALL frontend work. Do not introduce Tailwind or a UI component library.

## Stack

| Part | Choice |
|---|---|
| Framework | React 19, react-router-dom 7, Vite 8 |
| Styling | Hand-written CSS in one file, `frontend/src/styles.css`, built on CSS custom properties on `:root` |
| Fonts | Bundled locally via Fontsource: DM Sans (UI), Crimson Text (display headings), DM Mono (IDs, code) |
| Icons | `@phosphor-icons/react` |
| Theme | Light by default; dark via `data-theme="dark"` |

## Colour tokens ("Old photograph")

| Role | Light | Dark |
|---|---|---|
| Page background | `#fdfbd4` | `#1c1c12` |
| Card surface | `#fffef0` | `#25251a` |
| Body text | `#2a2919` | `#fdfbd4` |
| Accent (buttons, links, active tab) | `#545333` | `#d9d7b6` |
| Borders | `#d9d7b6` (input borders `#878672`) | `#3a3a2a` |
| Critical / warning / info | `#b3261e` / `#8f5a08` / `#3b6e91` | `#e86a62` / `#d9a520` / `#6ba3c9` |

Components never hard-code colours; use the tokens only, so a palette change touches one block.

## Rules

1. Status is never colour alone: colour + Phosphor icon + word. Map tones (good, warning, critical, info, muted) in `components/Status.jsx`.
2. Set the theme before first paint: `index.html` reads the saved theme (or OS preference) before React loads, so dark mode never flashes white.
3. Body text and UI borders target WCAG AA. Dark-mode input borders are at least 4:1. Re-run a contrast checker when changing tokens.
4. Decorative colour (`--block`) is only for background shapes, never behind text.
5. Buttons and nav links are at least 40-44px tall; focus rings are a visible 2px outline.
6. Respect `prefers-reduced-motion` (disable animations and transitions).
7. Responsive breakpoints: 1100, 1023, 960, 767, 480px. Top bar collapses at phone width; login art hides below 960px.
8. Motion is subtle: 150ms transitions; the only intentional animation is the rising bars in the dashboard hero.

## Layout pattern

- Top bar (not a sidebar): wordmark, nav links (Buckets, Audit log, How to use), theme toggle, account pill, sign-out.
- Page head: small eyebrow label, large serif title, short subtitle.
- Cards with a header row and body; tables with a tinted header row.
- Dashboard hero: dark panel with a large number, then a three-column bento grid of tiles.
- Advisory banners for risks: tinted box with a coloured border.

## Reusable classes

`.btn` (variants `-primary`, `-danger`, `-quiet`, `-sm`, `-icon`), `.card`, `.input`, `.status`, `.tag`, `.tabs`, `.banner`, `.advisory`, `.table-wrap`, `.empty`, `.row`, `.spread`.
