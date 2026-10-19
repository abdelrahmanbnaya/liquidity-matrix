# AGENTS.md — rules for AI coding agents (Codex, etc.) working on liquidity-matrix.com

This is the static website of Liquidity Matrix (GitHub Pages, custom domain `liquidity-matrix.com`).
Plain HTML + one CSS file. No build step, no framework, no JavaScript bundle.

The owner's assistant **Jarvis** also writes to this repository automatically, several times a day
(every morning 08:00 Cairo time, at each session open, and every Monday). Read the rules below before
changing anything.

## 1. How to work

- **Always open a Pull Request. Never push to `main` directly.** The owner reviews and merges.
- Keep each PR small and about one thing. Explain in the PR description what changed and why.
- Before you finish, check every page you touched at a **390px wide** (phone) viewport and at desktop
  width: no sideways scroll, text readable, images not stretched.

## 2. Files you must NOT edit (Jarvis generates them from real market data)

| File / folder | Why |
|---|---|
| `markets/*.html` | One page per market, rebuilt by Jarvis on every update |
| `ar/markets/*.html`, `ar/weekly.html`, `ar/track-record.html`, the LEVELS block of `ar/levels.html` | The Arabic versions, rebuilt by Jarvis from `site_ar.py` |
| `weekly.html` | Weekly outlook, rebuilt by Jarvis every Monday |
| `assets/levels/*.png` | Charts rendered by Jarvis from real candles |
| `assets/gold-levels.png`, `assets/gold-levels-m.png` | The home-page gold chart, rendered by Jarvis |
| Everything between `<!-- LEVELS:START` and `<!-- LEVELS:END -->` in `levels.html` | Jarvis replaces this block on every update. Keep both markers exactly as they are. |
| `sitemap.xml` | Jarvis maintains the `<lastmod>` dates and adds market pages |
| `track-record.html`, `assets/levels/scenarios-r*.png` | Built by Jarvis from the public scenario log only |
| `data/scenarios.json` | The public log of educational scenarios and their outcomes. Never edit, reorder or delete entries. |
| `CNAME` | The custom domain. Changing it takes the site offline. |

You may edit the rest of `levels.html` (outside the markers) and all other root pages
(`index.html`, `services.html`, `about.html`, `disclaimer.html`, `privacy.html`, `404.html`).

Jarvis also applies small automatic text fixes to the root pages and rewrites the stylesheet link to
`/assets/style.css?v=N`. Do not change that `?v=` number yourself. If you change `assets/style.css`,
say so clearly in the PR description so the owner can bump the version in Jarvis (`STYLE_V` in
`site_levels.py`); otherwise browsers keep the old cached CSS.

## 3. Content rules (brand honesty — these are strict)

- **Never publish any trading-account result** (demo or live): no balances, P&L, win rates or equity
  curves of any account. The track record is the educational scenario log only, in R.

- **Never invent market numbers.** Prices, levels, dates, highs/lows on this site come only from
  Jarvis's code reading real candles. Do not type any market figure into a page.
- **No profit claims, no win rates, no "accuracy" percentages, no buy/sell signals, no testimonials
  or reviews** unless the owner provides real, verifiable ones.
- Everything is **education, not financial advice**. Keep the risk text in every footer exactly as it is,
  and keep `disclaimer.html`.
- The "Coming soon" section on `services.html`:
  - Trade ideas (Monthly / Yearly / VIP): **no prices** until the owner decides them.
  - Copy trading: keep the text saying it is not available, would only be offered through a regulated
    broker's platform where the law allows, and that we never hold client funds or ask for trading passwords.
- Never ask visitors for trading passwords, card numbers or ID documents. A read-only (investor)
  MetaTrader password is the most we ever ask for, and only for the journal review.
- Contact email: `jarvislmatrix@gmail.com`. Do not add other emails, phone numbers or names.
- Languages: English at `/`, Arabic (Modern Standard, right-to-left) at `/ar/`. A change to the text of an English
  page needs the same change on its Arabic page, and the reverse. Every page has the language button (`a.lang`).

## 4. Design and code rules

- One stylesheet: `assets/style.css`. Use its existing CSS variables (`--bg`, `--panel`, `--line`,
  `--text`, `--muted`, `--gold`, `--red`, `--green`) and existing classes (`.wrap`, `.card`, `.grid .g2 .g3`,
  `.btn .gold`, `.note`, `.kicker`, `.sub`, `.list`, `.stats .stat`, `.levels`, `.chart`) before adding new ones.
- Phones: the CSS has a `@media (max-width: 600px)` block. Tables with class `.levels` turn into cards on
  phones and need a `data-label="..."` attribute on every `<td>`.
- Images: always set `width` and `height` attributes; large images get `loading="lazy"`.
  Charts use `<picture>` with a phone version (`*-m.png`) for screens under 600px.
- `assets/sessions.js` is the session clock used on the market pages; keep its session times in line with
  the site (Asia 00:00 UTC, London 08:00 London, New York 08:00–17:00 New York).
- **No new third-party scripts, trackers, analytics, chat widgets, cookie banners or external fonts**
  without the owner's approval. Google Fonts (Inter, JetBrains Mono) is the only external resource.
- Keep pages accessible: meaningful `alt` text, real headings in order, links that say where they go.
- Keep `<title>`, `<meta name="description">` and `<link rel="canonical">` correct on every page you edit.

## 5. When unsure

Do less, and ask in the PR description. The owner prefers a small correct change over a big redesign.

- Links between our pages never end in `.html`: write `/pricing`, `/markets/xauusd`, `/ar/` (GitHub Pages serves the .html file). Jarvis cleans its own pages the same way.
