# Productivity Hub — AI project map

Static personal productivity site. No build step, no backend. Data in `localStorage`.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Homepage with tool cards (no nav bar) |
| `calculator.html` | Calculator |
| `notes.html` | Notes & to-do |
| `converter.html` | Unit converter |
| `timer.html` | Timer & stopwatch |
| `colors.html` | Color picker |
| `brain-break.html` | Mini-game hub (thin shell) |

## Shared assets

| Path | Role |
|------|------|
| `styles.css` | Global theme, typography (DM Sans), components |
| `transitions.css` | Pac-Man page transition styles |
| `transitions.js` | Page transition orchestration (~585 lines) |
| `shared/layout.js` | Injects nav on subpages via `SiteLayout.injectNav()` |
| `shared/transition-preload.js` | Head script: adds `page-enter-pending` before paint |

## Brain Break games

`brain-break.html` loads `games/hub.js` then one file per game. Games register with `BrainBreak.register(name, { init, onActivate, stop })`.

| File | Game id | Notes |
|------|---------|-------|
| `games/hub.js` | — | Tab switching, `BrainBreak.boot()` |
| `games/memory.js` | `memory` | Card matching |
| `games/asteroids.js` | `asteroids` | Canvas shooter; loop checks `BrainBreak.activeGame` |
| `games/pacman.js` | `pacman` | RAD-shaped maze |
| `games/guesser.js` | `questions` | Akinator-style yes/no |
| `games/drive.js` | `drive` | Wrapper around `DriveGame` |
| `games/drive-engine.js` | — | Three.js 3D track (CDN Three.js in page head) |
| `css/brain-break.css` | — | Game-specific layout styles |

## Page transition pattern

Every page `<head>` should include:

```html
<script src="shared/transition-preload.js"></script>
```

Subpages (not `index.html`) inject nav before `transitions.js`:

```html
<script src="shared/layout.js"></script>
<script>SiteLayout.injectNav();</script>
<script src="transitions.js"></script>
```

Toggle: `localStorage` key `hub-transitions-enabled` (default on). Session key `hub-transition` triggers enter animation.

## Conventions

- Keep new files under ~400 lines; split when larger.
- Tool pages still have inline `<style>` / `<script>` — extract to `css/` or `js/` when editing.
- Deploy: push to GitHub `zachmcune/productivity-hub` → Cloudflare Pages.
