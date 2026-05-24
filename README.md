# Prettier Codewars

A userscript that polishes Codewars training and profile pages without changing kata behavior.

Install from Greasy Fork:

https://greasyfork.org/scripts/579184-prettier-codewars

## Features

- Fixes kata training header controls on medium-width screens.
- Fixes profile Rank Breakdown layout on medium-width screens.
- Hides Codewars promotion, partner, referral, and house ad blocks.
- Uses local Maple Mono NF when available, falling back to Maple Mono webfont.
- Enables CodeMirror line wrapping.
- Tunes CodeMirror font size, line height, current line, and horizontal overflow.
- Adds K&R C AutoFormat for CodeMirror editors with 4-space indentation, `Alt+Shift+F`, one initial pass when entering a kata, and automatic formatting before test/attempt/submit.
- Adds C-only lightweight autocomplete with local identifiers, common C standard library words, `Ctrl+Space`, automatic suggestions while typing identifiers, and `Tab` to accept the selected hint.
- Makes `Tab` insert 4 spaces in CodeMirror editors.
- Keeps the kata description panel focused on `.description-content`.
- Adds small orange typing sparks and dark delete-annihilation particles.
- Adds Tampermonkey menu options for toggling editor polish, line wrapping, typography, and typing effects.

## Install

Install a userscript manager such as Tampermonkey, Violentmonkey, or Greasemonkey, then install the script from Greasy Fork.

You can also install directly from this repository:

https://raw.githubusercontent.com/NihilDigit/prettier_codewars/main/prettier-codewars.user.js

## Configuration

Open your userscript manager's menu on Codewars. Prettier Codewars exposes menu items for:

- Maple Mono font
- CodeMirror polish
- Line wrapping
- AutoFormat
- Lightweight autocomplete
- Typing sparks
- Delete annihilation
- Editor font size
- Editor line height
- Reset settings
- Hide promotions

## License

MIT
