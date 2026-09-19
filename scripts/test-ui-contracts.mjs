import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const uiIndex = readFileSync(new URL("../src/components/ui/index.ts", import.meta.url), "utf8");
const iconButton = readFileSync(new URL("../src/components/ui/IconButton.tsx", import.meta.url), "utf8");
const modalShell = readFileSync(new URL("../src/components/ui/ModalShell.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const creator = readFileSync(new URL("../src/components/GameCreator.tsx", import.meta.url), "utf8");

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
  assert.doesNotMatch(css, /input,\s*textarea,\s*select\s*\{[^}]*!important/);
  assert.doesNotMatch(css, /body[\s\S]{0,240}user-select:\s*none/);
});

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

test("home has one primary action and a cardless process flow", () => {
  assert.equal((home.match(/variant:\s*"primary"/g) ?? []).length, 1);
  assert.match(home, /aria-label="Cách tạo hành trình"/);
  assert.match(home, /<ol/);
  assert.doesNotMatch(home, /grid-cols-3/);
});

test("creator exposes the approved three-step flow", () => {
  for (const label of ["Chặng leo", "Mốc bất ngờ", "Lời chúc & chia sẻ"]) {
    assert.match(creator, new RegExp(label));
  }
  assert.match(creator, /role="alert"/);
  assert.match(creator, /aria-pressed=/);
});
