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
  assert.doesNotMatch(css, /input,\s*textarea,\s*select\s*\{[^}]*!important/);
  assert.doesNotMatch(css, /body[\s\S]{0,240}user-select:\s*none/);
});
