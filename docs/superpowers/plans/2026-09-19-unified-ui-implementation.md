# Unified UI Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the home, creator, play HUD, gift, and victory experiences under one mobile-first Mid-Autumn design system without changing gameplay or URL data behavior.

**Architecture:** Semantic CSS tokens and small React primitives provide the shared visual contract. Existing route and state boundaries remain intact; each screen adopts the contract incrementally, and presentation regressions are checked through contract tests, lint/build, and headless Chrome screenshots.

**Tech Stack:** Next.js 16.3.5 App Router, React 19.2.8, TypeScript 5, Tailwind CSS 4, Lucide React, Phaser 4.2.1, Node.js test runner, headless Google Chrome.

**Spec:** `docs/superpowers/specs/2026-09-19-unified-ui-design-system.md`

## Global Constraints

- Keep the existing gameplay, URL encoding/decoding, validation limits, preset content, and user-created content unchanged.
- Do not add state management, animation libraries, UI frameworks, backend services, accounts, storage, or analytics.
- Use Geist, a maximum of one action accent (`gold`), semantic success/danger colors, a 4 px spacing grid, and 44×44 px minimum touch targets.
- Use `100svh` and safe-area insets for the mobile game surface.
- Preserve Server Component boundaries for static pages and Client Component boundaries for interactive form/game/modal code.
- Support WCAG AA contrast, visible keyboard focus, logical headings, accessible names for icon-only controls, 320 px layouts, and `prefers-reduced-motion`.
- Use the installed Next.js documentation in `node_modules/next/dist/docs/`; do not rely on remembered Next.js APIs.

## Review Focus

- A 320 px viewport must not horizontally scroll; test the home, creator, and play pages with a 320×700 screenshot and DOM overflow probe in Task 7.
- Long receiver names and messages within configured limits must wrap without escaping HUD or modals; exercise encoded long-copy data in Task 7.
- Keyboard users must see focus and have accessible names for back, sound, replay, quiz options, copy, and share actions; assert markup contracts in Tasks 2, 5, and 6.
- Reduced-motion users must not receive decorative lantern, moon, bounce, smooth-scroll, or entrance animation; pin the media rule in Task 1 and emulate the preference in Task 7.
- Invalid links, low KAMA, quiz correct/incorrect, disabled controls, and form errors must use semantic status styling without relying on color alone; preserve and inspect each state in Tasks 4–7.

---

### Task 1: Establish the semantic token and global motion contract

**Files:**
- Create: `scripts/test-ui-contracts.mjs`
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: Tailwind CSS 4 through `@import "tailwindcss"`; existing Geist CSS variables from `layout.tsx`.
- Produces: semantic CSS variables `--color-night-*`, `--color-moon-*`, `--color-gold-*`, `--color-ink-*`, `--color-success-*`, `--color-danger-*`, `--radius-*`, `--shadow-*`, `--duration-*`; shared classes `app-shell`, `focus-ring`, `moon-surface`, `night-surface`, `ui-enter`, `lantern-swing`, and `moon-float`.

- [ ] **Step 1: Read the installed framework guidance**

Run:

```bash
sed -n '1,240p' node_modules/next/dist/docs/01-app/01-getting-started/11-css.md
sed -n '1,220p' node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md
sed -n '1,220p' node_modules/next/dist/docs/03-architecture/accessibility.md
```

Expected: confirm global CSS belongs in the root layout, Server/Client composition rules remain unchanged, and route announcements/focus behavior are understood before editing.

- [ ] **Step 2: Write the failing CSS contract test**

Create `scripts/test-ui-contracts.mjs` using only Node built-ins:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

test("defines the shared semantic design tokens", () => {
  for (const token of [
    "--color-night-950",
    "--color-moon-50",
    "--color-gold-500",
    "--color-ink-900",
    "--color-success-600",
    "--color-danger-600",
    "--radius-md",
    "--shadow-modal",
  ]) {
    assert.match(css, new RegExp(token));
  }
});

test("provides a reduced-motion escape hatch", () => {
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /animation-duration:\s*0\.01ms/);
  assert.match(css, /scroll-behavior:\s*auto/);
});

test("does not globally force form colors or disable selection", () => {
  assert.doesNotMatch(css, /input,\s*textarea,\s*select[\s\S]*!important/);
  assert.doesNotMatch(css, /body[\s\S]{0,240}user-select:\s*none/);
});
```

- [ ] **Step 3: Run the contract test and verify it fails**

Run: `node --test scripts/test-ui-contracts.mjs`

Expected: FAIL because the semantic tokens and reduced-motion contract are absent and global form/selection overrides still exist.

- [ ] **Step 4: Implement the global design foundation**

Update `globals.css` with the exact semantic palette from the spec, expose token aliases through `@theme inline`, establish base body color/typography, add three shadow/radius levels, define the shared surface/focus/motion classes, and remove global `!important` form colors plus body-wide `user-select: none`. Add a reduced-motion block that collapses animation/transition duration and disables smooth scrolling. Update `layout.tsx` body classes to use `app-shell` rather than literal hex colors.

- [ ] **Step 5: Verify the foundation**

Run:

```bash
node --test scripts/test-ui-contracts.mjs
npm run lint -- src/app/globals.css src/app/layout.tsx
```

Expected: contract tests PASS; ESLint reports no JS/TS issue in `layout.tsx` (CSS may be ignored by ESLint).

- [ ] **Step 6: Commit the foundation**

```bash
git add scripts/test-ui-contracts.mjs src/app/globals.css src/app/layout.tsx
git commit -m "feat: establish unified UI tokens"
```

### Task 2: Build the shared React primitives

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/IconButton.tsx`
- Create: `src/components/ui/Field.tsx`
- Create: `src/components/ui/Panel.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/SectionHeader.tsx`
- Create: `src/components/ui/ModalShell.tsx`
- Create: `src/components/ui/index.ts`
- Modify: `scripts/test-ui-contracts.mjs`

**Interfaces:**
- Consumes: Task 1 semantic CSS tokens and shared focus/surface classes.
- Produces: `buttonClassName(options)`, `Button`, `IconButton`, `Field`, `Panel`, `Badge`, `SectionHeader`, and `ModalShell` exported from `@/components/ui`.

- [ ] **Step 1: Extend the failing contract test for primitive APIs and accessibility**

Add to `scripts/test-ui-contracts.mjs`:

```js
const uiIndex = readFileSync(new URL("../src/components/ui/index.ts", import.meta.url), "utf8");
const iconButton = readFileSync(new URL("../src/components/ui/IconButton.tsx", import.meta.url), "utf8");
const modalShell = readFileSync(new URL("../src/components/ui/ModalShell.tsx", import.meta.url), "utf8");

test("exports the complete primitive surface", () => {
  for (const name of ["Button", "buttonClassName", "IconButton", "Field", "Panel", "Badge", "SectionHeader", "ModalShell"]) {
    assert.match(uiIndex, new RegExp(`\\b${name}\\b`));
  }
});

test("requires accessible labels for icon buttons and dialogs", () => {
  assert.match(iconButton, /"aria-label":\s*string/);
  assert.match(modalShell, /role="dialog"/);
  assert.match(modalShell, /aria-modal="true"/);
  assert.match(modalShell, /aria-labelledby=\{labelledBy\}/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test scripts/test-ui-contracts.mjs`

Expected: FAIL with missing `src/components/ui/index.ts`.

- [ ] **Step 3: Implement `Button` and `IconButton`**

Use this public contract:

```ts
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export function buttonClassName(options?: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}): string;

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
  }
): React.ReactElement;

export function IconButton(
  props: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
    "aria-label": string;
    tone?: "dark" | "light";
  }
): React.ReactElement;
```

Implement variants with semantic token classes, a 44 px minimum height, `focus-visible`, disabled opacity/cursor, and a restrained pressed transform.

- [ ] **Step 4: Implement layout and content primitives**

Use these contracts:

```ts
export function Field(props: {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}): React.ReactElement;

export function Panel(props: React.HTMLAttributes<HTMLDivElement> & {
  tone?: "light" | "dark" | "subtle";
}): React.ReactElement;

export function Badge(props: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "gold" | "neutral" | "success" | "danger";
}): React.ReactElement;

export function SectionHeader(props: {
  step?: number;
  title: string;
  description?: string;
  action?: React.ReactNode;
}): React.ReactElement;

export function ModalShell(props: {
  labelledBy: string;
  children: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
}): React.ReactElement;
```

`Field` must render a real `<label htmlFor={id}>`; helpers/errors use deterministic `${id}-helper` and `${id}-error` ids so inputs can opt into `aria-describedby`. `ModalShell` supplies overlay, `role="dialog"`, `aria-modal`, width, surface, and entry animation.

- [ ] **Step 5: Export and verify primitives**

Run:

```bash
node --test scripts/test-ui-contracts.mjs
npm run lint -- src/components/ui
npx tsc --noEmit
```

Expected: all contract tests PASS, lint PASS, TypeScript PASS.

- [ ] **Step 6: Commit the primitive layer**

```bash
git add scripts/test-ui-contracts.mjs src/components/ui
git commit -m "feat: add shared UI primitives"
```

### Task 3: Redesign the home page as the visual anchor

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `scripts/test-ui-contracts.mjs`

**Interfaces:**
- Consumes: `buttonClassName`, `Badge`, and the Task 1 surface/motion tokens.
- Produces: a full-bleed mobile-first landing page with one moon visual, one primary CTA, one secondary CTA, and a cardless three-step flow.

- [ ] **Step 1: Add a failing home hierarchy contract**

```js
const home = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");

test("home has one primary action and a cardless process flow", () => {
  assert.equal((home.match(/variant:\s*"primary"/g) ?? []).length, 1);
  assert.match(home, /aria-label="Cách tạo hành trình"/);
  assert.match(home, /<ol/);
  assert.doesNotMatch(home, /grid-cols-3/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test scripts/test-ui-contracts.mjs`

Expected: FAIL because the current page uses three cards and inline CTA styling.

- [ ] **Step 3: Implement the poster-like composition**

Keep all existing route destinations. Structure the page as:

```tsx
<main className="app-shell ...">
  <header>{/* compact brand */}</header>
  <section>{/* Badge, h1, one-sentence copy, CTA pair, moon visual */}</section>
  <ol aria-label="Cách tạo hành trình">{/* 3 connected steps with dividers */}</ol>
  <footer>{/* privacy/URL facts */}</footer>
</main>
```

Use one dominant moon plane, at most two decorative lanterns, exactly one gold primary link using `buttonClassName({ variant: "primary", size: "lg" })`, and a secondary link using the secondary variant. Remove repeated glass cards, continuous pulse/bounce, and competing background blobs.

- [ ] **Step 4: Verify the page**

Run:

```bash
node --test scripts/test-ui-contracts.mjs
npm run lint -- src/app/page.tsx
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 5: Commit the home page**

```bash
git add src/app/page.tsx scripts/test-ui-contracts.mjs
git commit -m "feat: unify home page visual hierarchy"
```

### Task 4: Recompose the game creator into a three-step workspace

**Files:**
- Modify: `src/app/create/page.tsx`
- Modify: `src/components/GameCreator.tsx`
- Modify: `scripts/test-ui-contracts.mjs`

**Interfaces:**
- Consumes: all shared primitives; preserves `GameConfig`, `Gift`, `GameDifficulty`, `QuizData`, `encodeGameConfig`, validation, presets, and current event handlers.
- Produces: creator sections named `Chặng leo`, `Mốc bất ngờ`, and `Lời chúc & chia sẻ`, with consistent fields, segmented controls, error summary, and link result panel.

- [ ] **Step 1: Add failing creator structure and status contracts**

```js
const creator = readFileSync(new URL("../src/components/GameCreator.tsx", import.meta.url), "utf8");

test("creator exposes the approved three-step flow", () => {
  for (const label of ["Chặng leo", "Mốc bất ngờ", "Lời chúc & chia sẻ"]) {
    assert.match(creator, new RegExp(label));
  }
  assert.match(creator, /role="alert"/);
  assert.match(creator, /aria-pressed=/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test scripts/test-ui-contracts.mjs`

Expected: FAIL because current headings differ and errors/segmented buttons lack the required semantics.

- [ ] **Step 3: Update the creator page shell**

Use the common night background and a plain 720 px content column. Replace the custom rounded back pill with `buttonClassName({ variant: "ghost", size: "sm" })`. Keep `GameCreator` as a Client Component and the route page as a Server Component.

- [ ] **Step 4: Recompose `GameCreator` without changing behavior**

Preserve state, validation, URL generation, presets, add/remove/update handlers, clipboard, and Web Share behavior. Replace visual wrappers with:

```tsx
<Panel tone="light">
  <header>{/* Badge, h1, concise support copy */}</header>
  <form className="...">
    <section aria-labelledby="creator-step-1"><SectionHeader step={1} title="Chặng leo" /></section>
    <section aria-labelledby="creator-step-2"><SectionHeader step={2} title="Mốc bất ngờ" /></section>
    <section aria-labelledby="creator-step-3"><SectionHeader step={3} title="Lời chúc & chia sẻ" /></section>
  </form>
</Panel>
```

Wrap all text inputs/textarea/select-like regions with `Field`, use `Button` for button actions, add `aria-pressed` to preset/difficulty/checkpoint-type segmented choices, and keep destructive controls as the danger variant. Use dividers and whitespace instead of nested same-elevation cards. Keep a submit error summary with `role="alert"`; use a success-toned result panel for the generated link.

- [ ] **Step 5: Verify creator logic and presentation compile together**

Run:

```bash
node --test scripts/test-ui-contracts.mjs
npm run lint -- src/app/create/page.tsx src/components/GameCreator.tsx
npx tsc --noEmit
node scripts/test-url-limits.ts
```

Expected: UI contracts, lint, TypeScript, and URL-limit checks PASS; if direct Node execution cannot resolve TypeScript path aliases, record that result and rely on the production build in Task 7 rather than changing runtime code.

- [ ] **Step 6: Commit the creator redesign**

```bash
git add src/app/create/page.tsx src/components/GameCreator.tsx scripts/test-ui-contracts.mjs
git commit -m "feat: streamline game creator workflow"
```

### Task 5: Unify the play frame, HUD, and KAMA status

**Files:**
- Modify: `src/app/play/page.tsx`
- Modify: `src/components/KamaBar.tsx`
- Modify: `scripts/test-ui-contracts.mjs`

**Interfaces:**
- Consumes: `IconButton`, `Badge`, `Panel`, `buttonClassName`; existing `PhaserGameHandle`, `GameConfig`, gift/victory callbacks, and `soundEngine` behavior.
- Produces: a safe-area-aware `100svh` game frame, shared icon controls, semantic progress/pass statuses, and a simplified KAMA meter.

- [ ] **Step 1: Add failing HUD accessibility and viewport contracts**

```js
const play = readFileSync(new URL("../src/app/play/page.tsx", import.meta.url), "utf8");
const kama = readFileSync(new URL("../src/components/KamaBar.tsx", import.meta.url), "utf8");

test("play surface uses mobile viewport and labelled controls", () => {
  assert.match(play, /100svh/);
  for (const label of ["Về trang chủ", "Bật âm thanh", "Tắt âm thanh", "Chơi lại từ đầu"]) {
    assert.match(play, new RegExp(`aria-label=.*${label}`));
  }
});

test("KAMA exposes a semantic progress meter", () => {
  assert.match(kama, /role="progressbar"/);
  assert.match(kama, /aria-valuenow=\{Math\.round\(percentage\)\}/);
  assert.match(kama, /aria-valuemin=\{0\}/);
  assert.match(kama, /aria-valuemax=\{100\}/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test scripts/test-ui-contracts.mjs`

Expected: FAIL because current controls rely on `title`, the frame uses `92vh`, and KAMA lacks progress semantics.

- [ ] **Step 3: Redesign the frame and HUD**

Keep all state and callbacks intact. Use `IconButton` for back/sound/replay, `Badge` for receiver and pass count, a compact central progress readout, and safe-area padding. Change the outer game frame to `h-[100svh]` on mobile with desktop max height, a one-pixel semantic border, and the shared elevated shadow. Preserve the invalid-link fallback but style it with Panel/Button primitives.

- [ ] **Step 4: Simplify and label KAMA**

Render one track/fill treatment. Use success for normal, gold for medium, and danger plus an icon/text warning below 25%. Add `role="progressbar"`, `aria-label="Năng lượng KAMA"`, `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`. Remove multi-color gradients and decorative pulse except the meaningful low-energy warning.

- [ ] **Step 5: Verify and commit**

Run:

```bash
node --test scripts/test-ui-contracts.mjs
npm run lint -- src/app/play/page.tsx src/components/KamaBar.tsx
npx tsc --noEmit
```

Expected: PASS.

```bash
git add src/app/play/page.tsx src/components/KamaBar.tsx scripts/test-ui-contracts.mjs
git commit -m "feat: unify game HUD and status styling"
```

### Task 6: Consolidate gift and victory dialogs

**Files:**
- Modify: `src/components/GiftModal.tsx`
- Modify: `src/components/VictoryModal.tsx`
- Modify: `scripts/test-ui-contracts.mjs`

**Interfaces:**
- Consumes: `ModalShell`, `Button`, `buttonClassName`, `Badge`, semantic success/danger classes; existing modal props and confetti/sound behavior.
- Produces: two dialogs sharing one shell and action hierarchy, with quiz answers communicated by icon/text/ARIA as well as color.

- [ ] **Step 1: Add failing shared-dialog contracts**

```js
const giftModal = readFileSync(new URL("../src/components/GiftModal.tsx", import.meta.url), "utf8");
const victoryModal = readFileSync(new URL("../src/components/VictoryModal.tsx", import.meta.url), "utf8");

test("gift and victory experiences share ModalShell", () => {
  assert.match(giftModal, /<ModalShell/);
  assert.match(victoryModal, /<ModalShell/);
});

test("quiz feedback is announced without relying only on color", () => {
  assert.match(giftModal, /aria-live="polite"/);
  assert.match(giftModal, /CheckCircle2/);
  assert.match(giftModal, /XCircle/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test scripts/test-ui-contracts.mjs`

Expected: FAIL because dialogs still duplicate shell markup and feedback is not announced through a live region.

- [ ] **Step 3: Migrate `GiftModal`**

Keep answer evaluation, pass chance, delayed reward transition, confetti, and sound exactly as-is. Wrap content in `<ModalShell labelledBy="gift-modal-title">`, attach that id to the active heading, use `Button` for continue/pass actions, and render quiz options as 44 px controls with explicit selected/correct/incorrect icon plus text. Add a concise `aria-live="polite"` feedback sentence for correct/incorrect state.

- [ ] **Step 4: Migrate `VictoryModal`**

Keep replay, clipboard/Web Share, and `/create` navigation behavior. Use `<ModalShell labelledBy="victory-modal-title">`; make replay primary, share secondary, and create-new a ghost-styled Link using `buttonClassName`. Keep one static moon visual and confetti, removing continuous bounce/pulse.

- [ ] **Step 5: Verify and commit**

Run:

```bash
node --test scripts/test-ui-contracts.mjs
npm run lint -- src/components/GiftModal.tsx src/components/VictoryModal.tsx
npx tsc --noEmit
```

Expected: PASS.

```bash
git add src/components/GiftModal.tsx src/components/VictoryModal.tsx scripts/test-ui-contracts.mjs
git commit -m "feat: standardize game dialogs"
```

### Task 7: Verify responsive, state, and production quality

**Files:**
- Modify as needed: files changed in Tasks 1–6, limited to defects found by verification.
- Create: `.artifacts/ui-review/` screenshots (do not commit).

**Interfaces:**
- Consumes: the complete implementation from Tasks 1–6.
- Produces: a lint-clean, type-safe, production-buildable UI verified at mobile and desktop sizes with no gameplay/data regression.

- [ ] **Step 1: Run the full automated verification suite**

```bash
node --test scripts/test-ui-contracts.mjs
npm run lint
npx tsc --noEmit
npm run build
```

Expected: all commands exit 0. Do not claim success from partial output.

- [ ] **Step 2: Start the production server for visual inspection**

Run `npm run start` in a persistent terminal after the successful build. Confirm `http://localhost:3000` responds before continuing.

- [ ] **Step 3: Capture the required screenshots with installed Chrome**

```bash
mkdir -p .artifacts/ui-review
google-chrome --headless --disable-gpu --hide-scrollbars --window-size=320,700 --screenshot=.artifacts/ui-review/home-320.png http://localhost:3000/
google-chrome --headless --disable-gpu --hide-scrollbars --window-size=375,812 --screenshot=.artifacts/ui-review/create-375.png http://localhost:3000/create
google-chrome --headless --disable-gpu --hide-scrollbars --window-size=375,812 --screenshot=.artifacts/ui-review/play-375.png http://localhost:3000/play
google-chrome --headless --disable-gpu --hide-scrollbars --window-size=1440,900 --screenshot=.artifacts/ui-review/home-1440.png http://localhost:3000/
google-chrome --headless --disable-gpu --hide-scrollbars --window-size=1440,900 --screenshot=.artifacts/ui-review/create-1440.png http://localhost:3000/create
google-chrome --headless --disable-gpu --hide-scrollbars --window-size=1440,900 --screenshot=.artifacts/ui-review/play-1440.png http://localhost:3000/play
```

Expected: six non-empty PNGs.

- [ ] **Step 4: Inspect screenshots and exercise uncovered states**

Inspect all six screenshots. In Chrome DevTools or a temporary local console script, verify `document.documentElement.scrollWidth <= window.innerWidth` at 320 px. Manually exercise creator validation/disabled/add-remove/preset/result states, invalid `/play?data=broken`, sound/replay, low KAMA, gift quiz correct/incorrect/pass, long receiver/message content, victory actions, keyboard focus order, and reduced-motion emulation. Fix only verified defects, rerunning the narrow lint/type/contract command for each changed file.

- [ ] **Step 5: Re-run the final suite after visual fixes**

```bash
node --test scripts/test-ui-contracts.mjs
npm run lint
npx tsc --noEmit
npm run build
git diff --check
git status --short
```

Expected: tests, lint, typecheck, build, and diff check PASS; status lists only intentional tracked changes and the ignored/untracked screenshot artifact directory.

- [ ] **Step 6: Commit final verification fixes**

If Task 7 required tracked fixes:

```bash
git add src scripts/test-ui-contracts.mjs
git commit -m "fix: polish responsive UI states"
```

If no tracked fixes were needed, do not create an empty commit.
