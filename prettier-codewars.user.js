// ==UserScript==
// @name         Prettier Codewars
// @namespace    https://codewars.com/
// @version      1.2.0
// @description  Polish Codewars with cleaner training pages, better editor typography, responsive fixes, subtle typing effects, and promotion cleanup.
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
  const HIDDEN_MARK = "data-cw-polish-hidden";
  const SPARKS_ID = "cw-polish-sparks";
  const STORAGE_PREFIX = "prettier-codewars:";

  const defaultConfig = {
    hidePromotions: true,
    useMapleMono: true,
    tuneCodeMirror: true,
    lineWrapping: true,
    autoFormat: true,
    lightweightAutocomplete: true,
    typingSparks: true,
    deleteAnnihilation: true,
    editorFontSize: "15px",
    editorLineHeight: 1.55
  };

  const menuOptions = [
    ["hidePromotions", "Hide promotions"],
    ["useMapleMono", "Maple Mono font"],
    ["tuneCodeMirror", "CodeMirror polish"],
    ["lineWrapping", "Line wrapping"],
    ["autoFormat", "AutoFormat"],
    ["lightweightAutocomplete", "Lightweight autocomplete"],
    ["typingSparks", "Typing sparks"],
    ["deleteAnnihilation", "Delete annihilation"]
  ];

  const C_KEYWORDS = [
    "auto",
    "break",
    "case",
    "char",
    "const",
    "continue",
    "default",
    "do",
    "double",
    "else",
    "enum",
    "extern",
    "float",
    "for",
    "goto",
    "if",
    "inline",
    "int",
    "long",
    "register",
    "restrict",
    "return",
    "short",
    "signed",
    "sizeof",
    "static",
    "struct",
    "switch",
    "typedef",
    "union",
    "unsigned",
    "void",
    "volatile",
    "while"
  ];

  const C_STANDARD_WORDS = [
    "EOF",
    "FILE",
    "NULL",
    "SEEK_CUR",
    "SEEK_END",
    "SEEK_SET",
    "bool",
    "calloc",
    "char",
    "double",
    "errno",
    "exit",
    "fclose",
    "feof",
    "ferror",
    "fflush",
    "fgets",
    "fopen",
    "fprintf",
    "fputc",
    "fputs",
    "fread",
    "free",
    "fscanf",
    "fseek",
    "ftell",
    "fwrite",
    "getchar",
    "int16_t",
    "int32_t",
    "int64_t",
    "int8_t",
    "intptr_t",
    "malloc",
    "max_align_t",
    "memcmp",
    "memcpy",
    "memmove",
    "memset",
    "offsetof",
    "printf",
    "ptrdiff_t",
    "putchar",
    "puts",
    "qsort",
    "realloc",
    "scanf",
    "size_t",
    "snprintf",
    "sprintf",
    "sscanf",
    "stderr",
    "stdin",
    "stdout",
    "strcat",
    "strchr",
    "strcmp",
    "strcpy",
    "strlen",
    "strncmp",
    "strncpy",
    "strrchr",
    "strstr",
    "strtol",
    "strtoul",
    "uint16_t",
    "uint32_t",
    "uint64_t",
    "uint8_t",
    "uintptr_t",
    "va_arg",
    "va_end",
    "va_list",
    "va_start",
    "void"
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
      config.hidePromotions
        ? `
    [data-cw-polish-hidden="true"] {
      display: none !important;
    }

    .partner-display,
    .promoted {
      display: none !important;
    }
    `
        : ""
    }

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

    .CodeMirror-hints {
      z-index: 2147483646 !important;
      border: 1px solid rgb(255 255 255 / 14%) !important;
      border-radius: 6px !important;
      background: rgb(18 20 26 / 96%) !important;
      box-shadow: 0 12px 30px rgb(0 0 0 / 35%) !important;
      color: rgb(238 241 246 / 94%) !important;
      font-family: "Maple Mono Web", "Maple Mono NF", "Maple Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace !important;
      font-size: 13px !important;
    }

    .CodeMirror-hint {
      border-radius: 4px !important;
      color: inherit !important;
    }

    li.CodeMirror-hint-active {
      background: rgb(232 98 36 / 92%) !important;
      color: white !important;
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

  const adSelectors = [
    "#house_ad_display",
    ".cw-ad",
    ".ads-container",
    "[id*='ad_display' i]",
    "[id*='ad-container' i]",
    "[class*='ad-container' i]",
    "a[href*='/ads/']",
    "a[href*='house_srv']",
    "iframe[src*='ad' i]",
    "ins.adsbygoogle",
    ".partner-display",
    ".promoted",
    ".my-4.flex.flex-col.md\\:flex-row.space-y-4.md\\:space-y-0.md\\:space-x-4",
    ".mt-4.flex.flex-col.md\\:flex-row.space-y-4.md\\:space-y-0.md\\:space-x-4"
  ];

  const classSetBlocklist = [
    ["my-4", "flex", "flex-col", "md:flex-row", "space-y-4", "md:space-y-0", "md:space-x-4"],
    ["mt-4", "flex", "flex-col", "md:flex-row", "space-y-4", "md:space-y-0", "md:space-x-4"],
    ["description-footer", "flex", "flex-row"],
    ["w-256", "max-w-full", "mx-auto", "my-4"],
    ["partner-display"],
    ["promoted"]
  ];

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

  function hide(node) {
    if (node && node.nodeType === Node.ELEMENT_NODE) {
      node.setAttribute(HIDDEN_MARK, "true");
    }
  }

  function isProtected(element) {
    return Boolean(
      element.closest("html, body") === element ||
        element.matches("main, #main_header, #trainer, #trainer *") ||
        element.querySelector?.("#trainer")
    );
  }

  function hideSafely(element) {
    if (!element || isProtected(element)) return;
    hide(element);
  }

  function nearestAdContainer(element) {
    return (
      element.closest(
        "#house_ad_display, .ads-container, .cw-ad, aside, article, section:not(#trainer), .panel, div[class*='md:w-'], div[class*='w-full']"
      ) ||
      element
    );
  }

  function removeAds(root = document) {
    if (!config.hidePromotions) return;

    for (const selector of adSelectors) {
      root.querySelectorAll(selector).forEach((element) => hideSafely(nearestAdContainer(element)));
    }

    root.querySelectorAll("div").forEach((element) => {
      if (classSetBlocklist.some((classSet) => classSet.every((name) => element.classList.contains(name)))) {
        hideSafely(element);
      }
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
        tuneEditor(element.CodeMirror);
        scheduleInitialAutoFormat(element.CodeMirror, element);
        if (config.typingSparks || config.deleteAnnihilation) {
          attachEffects(element.CodeMirror);
        }
      }
    });
  }

  function tuneEditor(cm) {
    const optionsKey = [config.lineWrapping, 4, 4, false].join(":");

    if (cm.__cwPolishOptionsKey !== optionsKey) {
      cm.__cwPolishOptionsKey = optionsKey;
      cm.setOption("lineWrapping", config.lineWrapping);
      cm.setOption("indentUnit", 4);
      cm.setOption("tabSize", 4);
      cm.setOption("indentWithTabs", false);
      cm.refresh();
    }

    attachEditorFeatures(cm);
  }

  function scheduleInitialAutoFormat(cm, element) {
    if (!config.autoFormat || cm.__cwPolishInitialFormatted || !isCMode(cm) || !isSolutionEditor(element)) return;
    cm.__cwPolishInitialFormatted = true;

    window.setTimeout(() => {
      if (!cm.getWrapperElement?.().isConnected) return;
      autoFormat(cm);
    }, 200);
  }

  function isSolutionEditor(element) {
    return document.querySelector(".CodeMirror") === element;
  }

  function attachEditorFeatures(cm) {
    if (cm.__cwPolishFeatures) return;
    cm.__cwPolishFeatures = true;

    const keyMap = {
      Tab: (instance) => {
        insertSpaces(instance, 4);
        return true;
      }
    };

    if (config.autoFormat) {
      keyMap["Alt-Shift-F"] = (instance) => {
        autoFormat(instance);
        return true;
      };
    }

    if (config.lightweightAutocomplete && isCMode(cm)) {
      keyMap["Ctrl-Space"] = (instance) => {
        showIdentifierHints(instance, true);
        return true;
      };

      cm.on("inputRead", (instance, change) => {
        if (instance.state.completionActive || !change.text || change.text.length !== 1) return;
        if (!/^[A-Za-z_$]$/.test(change.text[0])) return;

        const prefix = currentPrefix(instance);
        if (prefix.length >= 2) {
          showIdentifierHints(instance, false);
        }
      });
    }

    cm.addKeyMap(keyMap);
  }

  function insertSpaces(cm, count) {
    const spaces = " ".repeat(count);

    if (typeof cm.replaceSelections === "function" && typeof cm.listSelections === "function") {
      cm.replaceSelections(cm.listSelections().map(() => spaces), "end", "+input");
      return;
    }

    cm.replaceSelection(spaces, "end", "+input");
  }

  function autoFormat(cm) {
    if (!cm || typeof cm.indentLine !== "function") return;

    const cursor = cm.getCursor();
    const scroll = cm.getScrollInfo();

    if (isCMode(cm)) {
      const formatted = formatKAndRC(cm.getValue());
      if (formatted !== cm.getValue()) {
        cm.setValue(formatted);
      }
    }

    cm.operation(() => {
      for (let line = cm.firstLine(); line <= cm.lastLine(); line += 1) {
        cm.indentLine(line, "smart");
      }
    });

    cm.setCursor(cursor);
    cm.scrollTo(scroll.left, scroll.top);
  }

  function formatKAndRC(text) {
    const normalized = text.replace(/\t/g, "    ");
    const lines = normalized.split("\n");
    const output = [];

    lines.forEach((line) => {
      const leading = line.match(/^\s*/)[0];
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//") || trimmed.startsWith("*")) {
        output.push(line);
        return;
      }

      if (trimmed === "{" && output.length > 0) {
        const previous = output[output.length - 1];
        const previousTrimmed = previous.trim();

        if (isKAndRBraceLine(previousTrimmed)) {
          output[output.length - 1] = `${previous.replace(/\s*$/, "")} {`;
          return;
        }
      }

      if (/^else\b/.test(trimmed) && output.length > 0 && output[output.length - 1].trim() === "}") {
        output[output.length - 1] = `${output[output.length - 1].replace(/\s*$/, "")} ${trimmed}`;
        return;
      }

      output.push(line.replace(/^(\s*)}\s*else\b/, "$1} else"));
    });

    return output.join("\n");
  }

  function isKAndRBraceLine(beforeBrace) {
    return (
      /^(?:if|for|while|switch)\s*\(.*\)$/.test(beforeBrace) ||
      /^}?\s*else(?:\s+if\s*\(.*\))?$/.test(beforeBrace) ||
      /^do$/.test(beforeBrace) ||
      /^(?:[A-Za-z_]\w*[\w\s*]*\s+)?[A-Za-z_]\w*\s*\([^;]*\)$/.test(beforeBrace) ||
      /^(?:struct|union|enum)\b.*$/.test(beforeBrace)
    );
  }

  function showIdentifierHints(cm, explicit) {
    if (!cm || !isCMode(cm) || typeof cm.showHint !== "function") return;

    const hints = buildIdentifierHints(cm);
    if (!explicit && hints.list.length < 2) return;

    cm.showHint({
      hint: () => hints,
      completeSingle: false,
      closeCharacters: /[\s()[\]{};:>,]/,
      customKeys: {
        Tab: (_editor, handle) => handle.pick(),
        Enter: (_editor, handle) => handle.pick(),
        Esc: (_editor, handle) => handle.close(),
        Up: (_editor, handle) => handle.moveFocus(-1),
        Down: (_editor, handle) => handle.moveFocus(1)
      }
    });
  }

  function buildIdentifierHints(cm) {
    const cursor = cm.getCursor();
    const prefix = currentPrefix(cm);
    const from = { line: cursor.line, ch: cursor.ch - prefix.length };
    const to = { line: cursor.line, ch: cursor.ch };
    const candidates = buildCompletionCandidates(cm, cursor);
    const seen = new Set();

    const list = candidates
      .filter((word) => {
        const normalized = word.toLowerCase();
        if (seen.has(normalized)) return false;
        seen.add(normalized);
        return word.length > 1 && word !== prefix && (!prefix || normalized.startsWith(prefix.toLowerCase()));
      })
      .slice(0, 80);

    return { list, from, to };
  }

  function buildCompletionCandidates(cm, cursor) {
    const text = cm.getValue();
    const cache = cm.__cwPolishCompletionCache;

    if (cache && cache.text === text && cache.line === cursor.line) {
      return cache.candidates;
    }

    const candidates = [
      ...collectLocalIdentifiers(cm, cursor),
      ...collectPreprocessorIdentifiers(text),
      ...C_STANDARD_WORDS,
      ...C_KEYWORDS
    ];

    cm.__cwPolishCompletionCache = {
      candidates,
      text,
      line: cursor.line
    };

    return candidates;
  }

  function collectLocalIdentifiers(cm, cursor) {
    const startLine = findLocalBlockStart(cm, cursor.line);
    const endLine = findLocalBlockEnd(cm, cursor.line);
    const text = cm.getRange({ line: startLine, ch: 0 }, { line: endLine, ch: cm.getLine(endLine).length });
    return collectIdentifiers(text);
  }

  function collectPreprocessorIdentifiers(text) {
    const identifiers = [];
    const definePattern = /^\s*#\s*define\s+([A-Za-z_]\w*)/gm;
    let match;

    while ((match = definePattern.exec(text))) {
      identifiers.push(match[1]);
    }

    return identifiers;
  }

  function findLocalBlockStart(cm, line) {
    let depth = 0;

    for (let index = line; index >= cm.firstLine(); index -= 1) {
      const text = stripCCommentsAndStrings(cm.getLine(index));

      for (let ch = text.length - 1; ch >= 0; ch -= 1) {
        if (text[ch] === "}") depth += 1;
        if (text[ch] === "{") {
          if (depth === 0) return Math.max(cm.firstLine(), index - 1);
          depth -= 1;
        }
      }
    }

    return cm.firstLine();
  }

  function findLocalBlockEnd(cm, line) {
    let depth = 0;

    for (let index = line; index <= cm.lastLine(); index += 1) {
      const text = stripCCommentsAndStrings(cm.getLine(index));

      for (let ch = 0; ch < text.length; ch += 1) {
        if (text[ch] === "{") depth += 1;
        if (text[ch] === "}") {
          if (depth === 0) return index;
          depth -= 1;
          if (depth === 0) return index;
        }
      }
    }

    return cm.lastLine();
  }

  function collectIdentifiers(text) {
    const identifiers = [];
    const wordPattern = /\b[A-Za-z_]\w*\b/g;
    const cleaned = stripCCommentsAndStrings(text);
    let match;

    while ((match = wordPattern.exec(cleaned))) {
      identifiers.push(match[0]);
    }

    return identifiers;
  }

  function stripCCommentsAndStrings(text) {
    return text
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/\/\/.*/g, " ")
      .replace(/"(?:\\.|[^"\\])*"/g, " ")
      .replace(/'(?:\\.|[^'\\])*'/g, " ");
  }

  function currentPrefix(cm) {
    const cursor = cm.getCursor();
    const line = cm.getLine(cursor.line).slice(0, cursor.ch);
    const match = line.match(/[A-Za-z_$][\w$]*$/);
    return match ? match[0] : "";
  }

  function isCMode(cm) {
    return languageKey(cm.getOption("mode")) === "c";
  }

  function languageKey(mode) {
    const value = String(mode || "").toLowerCase();

    if (value === "text/x-c" || value === "text/x-csrc" || value === "text/x-chdr") return "c";
    return "";
  }

  function attachRunAutoFormat() {
    if (!config.autoFormat || document.__cwPolishRunAutoFormat) return;
    document.__cwPolishRunAutoFormat = true;

    document.addEventListener(
      "click",
      (event) => {
        if (!event.target.closest?.("#validate_btn, #attempt_btn, #submit_btn")) return;
        const solutionEditor = document.querySelector(".CodeMirror")?.CodeMirror;
        autoFormat(solutionEditor);
      },
      true
    );
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
    removeAds();
    tuneEditors();
    tuneDescriptionScroll();
    attachRunAutoFormat();

    [100, 300, 800, 1500, 3000].forEach((delay) => {
      window.setTimeout(() => {
        injectStyle();
        removeAds();
        tuneEditors();
        tuneDescriptionScroll();
      }, delay);
    });

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            removeAds(node);
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
