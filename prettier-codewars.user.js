// ==UserScript==
// @name         Prettier Codewars
// @namespace    https://codewars.com/
// @version      1.0.0
// @description  Polish Codewars with cleaner training pages, better editor typography, responsive fixes, and subtle typing effects.
// @author       NihilDigit
// @match        https://www.codewars.com/*
// @match        https://codewars.com/*
// @icon         https://www.codewars.com/favicon.ico
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-start
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  const STYLE_ID = "cw-polish-style";
  const SPARKS_ID = "cw-polish-sparks";
  const STORAGE_PREFIX = "prettier-codewars:";

  const defaultConfig = {
    useMapleMono: true,
    tuneCodeMirror: true,
    lineWrapping: true,
    typingSparks: true,
    deleteAnnihilation: true,
    editorFontSize: "15px",
    editorLineHeight: 1.55
  };

  const menuOptions = [
    ["useMapleMono", "Maple Mono font"],
    ["tuneCodeMirror", "CodeMirror polish"],
    ["lineWrapping", "Line wrapping"],
    ["typingSparks", "Typing sparks"],
    ["deleteAnnihilation", "Delete annihilation"]
  ];

  function readSetting(key) {
    const fallback = defaultConfig[key];
    const storageKey = STORAGE_PREFIX + key;

    try {
      if (typeof GM_getValue === "function") {
        return GM_getValue(storageKey, fallback);
      }

      const value = window.localStorage.getItem(storageKey);
      return value === null ? fallback : JSON.parse(value);
    } catch (_error) {
      return fallback;
    }
  }

  function writeSetting(key, value, reload = true) {
    const storageKey = STORAGE_PREFIX + key;

    try {
      if (typeof GM_setValue === "function") {
        GM_setValue(storageKey, value);
      } else {
        window.localStorage.setItem(storageKey, JSON.stringify(value));
      }
    } catch (_error) {
      return;
    }

    if (reload) {
      window.location.reload();
    }
  }

  function readConfig() {
    return Object.fromEntries(Object.keys(defaultConfig).map((key) => [key, readSetting(key)]));
  }

  const config = readConfig();

  const effectColors = {
    sparks: ["#ffd166", "#ff9f1c", "#ff6b35", "#e5383b", "#fff3b0"]
  };

  function buildCss() {
    return `
    ${
      config.useMapleMono
        ? `
    @font-face {
      font-family: "Maple Mono Web";
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src:
        local("Maple Mono NF"),
        local("MapleMono NF"),
        local("Maple Mono Normal NF"),
        url("https://cdn.jsdelivr.net/fontsource/fonts/maple-mono@latest/latin-400-normal.woff2") format("woff2");
    }

    @font-face {
      font-family: "Maple Mono Web";
      font-style: italic;
      font-weight: 400;
      font-display: swap;
      src:
        local("Maple Mono NF Italic"),
        local("MapleMono NF Italic"),
        local("Maple Mono Normal NF Italic"),
        url("https://cdn.jsdelivr.net/fontsource/fonts/maple-mono@latest/latin-400-italic.woff2") format("woff2");
    }

    .CodeMirror,
    .CodeMirror pre,
    .CodeMirror code,
    .CodeMirror-line,
    .CodeMirror-line *,
    pre,
    code,
    kbd,
    samp {
      font-family: "Maple Mono Web", "Maple Mono NF", "Maple Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace !important;
      font-variant-ligatures: contextual common-ligatures !important;
    }
    `
        : ""
    }

    ${
      config.tuneCodeMirror
        ? `
    .CodeMirror {
      font-size: ${config.editorFontSize} !important;
      line-height: ${config.editorLineHeight} !important;
    }

    .CodeMirror-lines,
    .CodeMirror pre.CodeMirror-line,
    .CodeMirror pre.CodeMirror-line-like {
      line-height: ${config.editorLineHeight} !important;
    }

    .CodeMirror-cursor {
      transition:
        left 80ms ease-out,
        top 80ms ease-out,
        height 80ms ease-out !important;
    }

    .CodeMirror-activeline-background {
      background: rgb(255 255 255 / 5.5%) !important;
    }

    .CodeMirror-hscrollbar {
      display: none !important;
    }

    .CodeMirror-scroll {
      overflow-x: hidden !important;
    }
    `
        : ""
    }

    #description_area .description-content[data-cw-polish-short-overflow="true"] {
      overflow: visible !important;
    }

    #description_area .description.h-full > :not(.description-content) {
      display: none !important;
    }

    #description_area .description.h-full {
      overflow: hidden !important;
    }

    #description_area .description-content.p-4 {
      height: 100% !important;
      overflow: auto !important;
    }

    #cw-polish-sparks {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      pointer-events: none;
      overflow: hidden;
    }

    @media (max-width: 1100px) {
      body.play_view #cc_play_view .game-title .panel > .flex.flex-col.md\\:flex-row {
        flex-direction: column !important;
      }

      body.play_view #cc_play_view .game-title .w-full.md\\:w-5\\/12,
      body.play_view #cc_play_view .game-title .w-full.md\\:w-7\\/12 {
        width: 100% !important;
      }

      body.play_view #cc_play_view .game-title .w-full.md\\:w-7\\/12.pt-4.md\\:pl-4 {
        display: flex !important;
        flex-wrap: wrap !important;
        align-items: stretch !important;
        gap: 8px !important;
        padding-left: 0 !important;
        padding-top: 12px !important;
      }

      body.play_view #cc_play_view .game-title .language-selector,
      body.play_view #cc_play_view .game-title #language_dd,
      body.play_view #cc_play_view .game-title #language_version {
        flex: 1 1 180px !important;
        min-width: 160px !important;
        max-width: none !important;
      }

      body.play_view #cc_play_view .game-title .w-full.md\\:w-7\\/12.pt-4.md\\:pl-4 > a {
        display: flex !important;
        flex: 0 0 auto !important;
      }
    }

    @media (max-width: 1000px) {
      body#users.show_view main .bg-ui-section .flex.flex-col.md\\:flex-row {
        flex-direction: column !important;
        align-items: stretch !important;
      }

      body#users.show_view main .bg-ui-section .flex.flex-col.md\\:flex-row > .w-full.md\\:w-6\\/12 {
        width: 100% !important;
        padding-left: 0 !important;
      }

      body#users.show_view #report .honor-chart-container {
        display: grid !important;
        grid-template-columns: 220px minmax(220px, 1fr) !important;
        align-items: center !important;
        column-gap: 32px !important;
        width: max-content !important;
        max-width: 100% !important;
        margin: 16px auto 0 !important;
      }

      body#users.show_view #report #honor_chart {
        grid-column: 1 !important;
      }

      body#users.show_view #report .honor-chart-center {
        left: 55px !important;
        top: 55px !important;
      }

      body#users.show_view #report .honor-chart-container > .md\\:w-64 {
        position: static !important;
        grid-column: 2 !important;
        width: auto !important;
        height: auto !important;
        overflow: visible !important;
        padding-left: 0 !important;
        margin-top: 0 !important;
      }
    }

    @media (max-width: 720px) {
      body#users.show_view main .bg-ui-section .flex.flex-col.md\\:flex-row {
        flex-direction: column !important;
      }

      body#users.show_view main .bg-ui-section .flex.flex-col.md\\:flex-row > .w-full.md\\:w-6\\/12 {
        width: 100% !important;
      }

      body#users.show_view #report .honor-chart-container {
        grid-template-columns: 1fr !important;
        justify-items: center !important;
        row-gap: 18px !important;
        width: 100% !important;
      }

      body#users.show_view #report .honor-chart-container > .md\\:w-64 {
        grid-column: 1 !important;
      }
    }
  `;
  }

  function injectStyle() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      (document.head || document.documentElement).append(style);
    }

    style.id = STYLE_ID;
    style.textContent = buildCss();
  }

  function registerSettingsMenu() {
    if (typeof GM_registerMenuCommand !== "function") return;

    menuOptions.forEach(([key, label]) => {
      const state = config[key] ? "On" : "Off";
      GM_registerMenuCommand(`${state} - ${label}`, () => writeSetting(key, !config[key]));
    });

    GM_registerMenuCommand(`Set editor font size (${config.editorFontSize})`, () => {
      const value = window.prompt("Editor font size, for example 15px:", config.editorFontSize);
      if (value && /^\d+(?:\.\d+)?(?:px|rem|em)$/.test(value.trim())) {
        writeSetting("editorFontSize", value.trim());
      }
    });

    GM_registerMenuCommand(`Set editor line height (${config.editorLineHeight})`, () => {
      const value = window.prompt("Editor line height, for example 1.55:", String(config.editorLineHeight));
      const numberValue = Number(value);
      if (Number.isFinite(numberValue) && numberValue >= 1 && numberValue <= 3) {
        writeSetting("editorLineHeight", numberValue);
      }
    });

    GM_registerMenuCommand("Reset Prettier Codewars settings", () => {
      Object.entries(defaultConfig).forEach(([key, value]) => writeSetting(key, value, false));
      window.location.reload();
    });
  }

  function tuneEditors(root = document) {
    if (!config.tuneCodeMirror) return;

    const mirrors = [];

    if (root.matches?.(".CodeMirror")) {
      mirrors.push(root);
    }

    if (root.querySelectorAll) {
      mirrors.push(...root.querySelectorAll(".CodeMirror"));
    }

    mirrors.forEach((element) => {
      if (element.CodeMirror) {
        element.CodeMirror.setOption("lineWrapping", config.lineWrapping);
        element.CodeMirror.refresh();
        if (config.typingSparks || config.deleteAnnihilation) {
          attachEffects(element.CodeMirror);
        }
      }
    });
  }

  function ensureSparkLayer() {
    let layer = document.getElementById(SPARKS_ID);
    if (!layer) {
      layer = document.createElement("div");
      layer.id = SPARKS_ID;
      document.documentElement.append(layer);
    }

    return layer;
  }

  function sparkAt(x, y, intensity = 1) {
    const layer = ensureSparkLayer();
    const count = Math.min(7, Math.max(3, Math.round(4 * intensity)));

    for (let index = 0; index < count; index += 1) {
      const spark = document.createElement("i");
      const angle = -Math.PI + Math.random() * Math.PI;
      const distance = 18 + Math.random() * 34 * intensity;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance - Math.random() * 8;
      const size = 4 + Math.random() * 4;
      const color = effectColors.sparks[Math.floor(Math.random() * effectColors.sparks.length)];
      const rotation = (Math.random() - 0.5) * 160;

      spark.style.cssText = [
        "position:absolute",
        `left:${x}px`,
        `top:${y}px`,
        `width:${size}px`,
        `height:${size}px`,
        `background:${color}`,
        "border-radius:1px",
        `box-shadow:0 0 ${7 + size * 2}px ${color}`,
        `transform:translate(-50%,-50%) rotate(${rotation}deg) scale(1)`,
        "opacity:.9",
        "will-change:transform,opacity"
      ].join(";");

      layer.append(spark);

      spark
        .animate(
          [
            { transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(1)`, opacity: 0.95 },
            {
              transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rotation + 120}deg) scale(.25)`,
              opacity: 0
            }
          ],
          {
            duration: 520 + Math.random() * 260,
            easing: "cubic-bezier(.16, 1, .3, 1)"
          }
        )
        .finished.finally(() => spark.remove());
    }
  }

  function annihilateAt(x, y, intensity = 1) {
    const layer = ensureSparkLayer();
    const driftX = -5 - Math.random() * 8;
    const driftY = -2 + (Math.random() - 0.5) * 6;
    const count = Math.min(5, Math.max(3, Math.round(4 * intensity)));

    for (let index = 0; index < count; index += 1) {
      const voidBit = document.createElement("i");
      const angle = Math.random() * Math.PI * 2;
      const distance = 18 + Math.random() * 32 * intensity;
      const sx = Math.cos(angle) * distance;
      const sy = Math.sin(angle) * distance;
      const endX = driftX * 0.35 + (Math.random() - 0.5) * 1.5;
      const endY = driftY * 0.35 + (Math.random() - 0.5) * 1.5;
      const size = 4 + Math.random() * 5;
      const rotation = (Math.random() - 0.5) * 180;

      voidBit.style.cssText = [
        "position:absolute",
        `left:${x}px`,
        `top:${y}px`,
        `width:${size}px`,
        `height:${size}px`,
        "background:oklch(5% 0.01 265 / .92)",
        "border-radius:2px",
        "box-shadow:0 0 8px oklch(0% 0 0 / .9)",
        `transform:translate(calc(-50% + ${sx}px), calc(-50% + ${sy}px)) rotate(${rotation}deg) scale(1)`,
        "opacity:.86",
        "will-change:transform,opacity,filter"
      ].join(";");

      layer.append(voidBit);

      voidBit
        .animate(
          [
            {
              transform: `translate(calc(-50% + ${sx}px), calc(-50% + ${sy}px)) rotate(${rotation}deg) scale(1)`,
              opacity: 0.86
            },
            {
              transform: `translate(calc(-50% + ${endX}px), calc(-50% + ${endY}px)) rotate(${rotation + 210}deg) scale(.05)`,
              opacity: 0
            }
          ],
          {
            duration: 500 + Math.random() * 140,
            easing: "cubic-bezier(.55, 0, .1, 1)"
          }
        )
        .finished.finally(() => voidBit.remove());
    }
  }

  function attachEffects(cm) {
    if (cm.__cwPolishEffects) return;
    cm.__cwPolishEffects = true;

    let lastSpark = 0;

    cm.on("change", (_instance, change) => {
      if (!change.origin || change.origin === "setValue") return;

      const now = performance.now();
      if (now - lastSpark < 30) return;
      lastSpark = now;

      const cursor = cm.getCursor();
      const pos = cm.cursorCoords(cursor, "window");
      const typed = change.text.join("").length;
      const removed = change.removed ? change.removed.join("").length : 0;
      const x = pos.left + 2;
      const y = pos.top + (pos.bottom - pos.top) / 2;

      if (typed > 0 && config.typingSparks) {
        sparkAt(x, y, Math.min(1.8, 1 + typed / 8));
      } else if (removed > 0 && config.deleteAnnihilation) {
        annihilateAt(x, y, Math.min(1.6, 1 + removed / 8));
      }
    });
  }

  function tuneDescriptionScroll(root = document) {
    const contents = [];

    if (root.matches?.("#description_area .description-content")) {
      contents.push(root);
    }

    if (root.querySelectorAll) {
      contents.push(...root.querySelectorAll("#description_area .description-content"));
    }

    contents.forEach((element) => {
      if (element.scrollHeight - element.clientHeight <= 20) {
        element.setAttribute("data-cw-polish-short-overflow", "true");
      } else {
        element.removeAttribute("data-cw-polish-short-overflow");
      }
    });
  }

  function boot() {
    registerSettingsMenu();
    injectStyle();
    tuneEditors();
    tuneDescriptionScroll();

    [100, 300, 800, 1500, 3000].forEach((delay) => {
      window.setTimeout(() => {
        injectStyle();
        tuneEditors();
        tuneDescriptionScroll();
      }, delay);
    });

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            tuneEditors(node);
            tuneDescriptionScroll(node);
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
    injectStyle();
  } else {
    boot();
  }
})();
