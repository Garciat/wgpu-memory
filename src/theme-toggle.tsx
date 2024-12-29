import { render } from "npm:preact@10.25.3";

function main() {
  const targetName = new URL(import.meta.url).searchParams.get("target");
  if (!targetName) {
    throw new Error("Missing target query parameter");
  }
  const target = document.getElementById(targetName);
  if (!target) {
    throw new Error(`Target element not found: ${targetName}`);
  }
  render(<ThemeToggle />, target);
}

const ThemeToggle = () => {
  function onToggleTheme() {
    const theme = readTheme();
    writeTheme(theme === "dark" ? "light" : "dark");
  }

  writeTheme(readTheme());

  return (
    <button class="button" onClick={onToggleTheme}>
      <span class="icon">◐</span>
    </button>
  );
};

function readTheme() {
  return localStorage.getItem("theme") ||
    (globalThis.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");
}

function writeTheme(theme: string) {
  localStorage.setItem("theme", theme);
  document.documentElement.dataset.theme = theme;
}

main();
