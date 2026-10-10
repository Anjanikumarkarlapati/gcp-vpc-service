# Colour Palette: VPC-SC Console

Derived from the "Sharp edge" swatches. The meaning of each colour follows [PRD.md](../PRD.md) and [ARCHITECTURE.md](../ARCHITECTURE.md). Tokens live in [`frontend/src/tokens.css`](../frontend/src/tokens.css).

## 1. Brand swatches

| Swatch | Hex | Role |
|---|---|---|
| Grey | `#898989` | Structure, disabled text, chart neutral |
| Light grey | `#D9D9D9` | Borders, dividers, table lines |
| Red | `#FF4D4D` | **Denied**: violation, blocked request, perimeter breach |
| Mint | `#4DFFBC` | **Allowed**: enforced perimeter, passing test |
| Ink | `#1A1A1A` | Text, primary buttons, text on red/mint fills |

## 2. Why these meanings

| Product concept (source) | Colour |
|---|---|
| Denied request, `NO_MATCHING_ACCESS_LEVEL` etc. (Arch §4, §6) | Red |
| Allowed in-perimeter / ingress / egress match (Arch §4, test T1, T5, T6) | Mint |
| Dry-run mode, violations logged but not blocked (PRD FR-8, Arch §5) | Amber |
| Info, break-glass notes, runbook hints (PRD FR-15) | Blue |
| Structure: cards, tables, borders | Greys |

Rule: **status is never colour alone**. Pair every colour with an icon and a word (Denied, Allowed, Dry-run). This also covers colour-blind users, since red and mint are the only differentiator in the swatches.

## 3. Semantic tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#FFFFFF` | `#141414` | Page |
| `--surface` / `--surface-2` | `#FFFFFF` / `#F5F5F5` | `#1E1E1E` / `#272727` | Cards / table header, zebra |
| `--text` | `#1A1A1A` | `#EDEDED` | Body |
| `--text-muted` | `#595959` | `#A8A8A8` | Secondary text |
| `--border` | `#D9D9D9` | `#333333` | Decorative lines |
| `--border-strong` | `#767676` | `#898989` | Input borders |
| `--accent` | `#1A1A1A` | `#EDEDED` | Buttons, links, active tab |
| `--critical` / `-fill` / `-bg` | `#C41E1E` / `#FF4D4D` / `#FDECEC` | `#FF4D4D` / `#FF4D4D` / `#2E1717` | Denied |
| `--good` / `-fill` / `-bg` | `#00704C` / `#4DFFBC` / `#E6FFF5` | `#4DFFBC` / `#4DFFBC` / `#12291F` | Allowed |
| `--warning` / `-fill` / `-bg` | `#8A5A00` / `#F2B84B` / `#FFF4DC` | `#F2B84B` / `#F2B84B` / `#2C2412` | Dry-run |
| `--info` / `-fill` / `-bg` | `#2F6FA3` / `#7DB4E6` / `#E8F1F9` | `#7DB4E6` / `#7DB4E6` / `#17232E` | Info |

Amber and blue are not in the supplied swatches. They were added because the PRD needs a "dry-run" state and an "info" state that red and mint can't express.

## 4. Usage rules

1. **Fill vs text.** The raw red and mint are too light for text on white (3.27:1 and 1.28:1). Use `--critical-fill` / `--good-fill` for badges, bars and chart marks with `--on-*-fill` ink text on top. Use `--critical` / `--good` (darker) when red or green *is* the text or icon colour on a light surface.
2. **Light grey is decorative.** `#D9D9D9` is 1.41:1 on white, so use it for dividers only. Input borders use `--border-strong`.
3. **Decorative blocks.** `--block-1…4` are for hero shapes and chart marks. They never sit behind text.
4. **No hard-coded hex in components.** Use tokens only.
5. **Primary action is ink**, not red or mint, so a red button never reads as "denied".
6. **Destructive actions** (promote dry-run to enforced, remove project from perimeter) use `--critical` text with a confirm step.

## 5. Contrast (WCAG, computed with the relative-luminance formula)

| Pair | Ratio | Passes |
|---|---|---|
| Ink on white | 17.4 | AAA |
| `--text-muted` `#595959` on white | 7.0 | AAA |
| `--border-strong` `#767676` on white | 4.54 | AA (UI, 3:1) |
| `--critical` `#C41E1E` on white | 5.91 | AA |
| `--good` `#00704C` on white | 6.14 | AA |
| `--warning` `#8A5A00` on white | 5.93 | AA |
| `--info` `#2F6FA3` on white | 5.35 | AA |
| Ink on `#FF4D4D` | 5.32 | AA |
| Ink on `#4DFFBC` | 13.55 | AAA |
| `#FF4D4D` on `#141414` (dark) | 5.63 | AA |
| `#4DFFBC` on `#141414` (dark) | 14.34 | AAA |
| `#F2B84B` on `#141414` (dark) | 10.29 | AAA |
| `#7DB4E6` on `#141414` (dark) | 8.37 | AAA |
| `#A8A8A8` on `#141414` (dark) | 7.75 | AAA |

Not checked: the `*-bg` tint pairs on dark surfaces, and the `--surface-2` / `--surface` dark combinations. Run a checker before shipping dark mode.

## 6. Examples

| UI element | Tokens |
|---|---|
| "Denied" badge | `--critical-fill` background, `--on-critical-fill` text, X icon |
| "Allowed" badge | `--good-fill` background, `--on-good-fill` text, check icon |
| "Dry-run" banner | `--warning-bg` background, `--warning` text and border, flask icon |
| Violation row (`vpcServiceControlsUniqueId`) | `--surface`, `--border`, reason chip in critical |
| Test result T1–T8 | Pass uses good, fail uses critical |
| Dashboard chart: allowed vs denied | `--block-4` vs `--block-3`, with direct labels |
