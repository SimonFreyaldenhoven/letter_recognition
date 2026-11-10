# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A browser-based interactive game for children to practice recognizing letters (upper- and lowercase), numbers 1–20, kindergarten sight words, and rhyming. The game speaks aloud using the Web Speech API and the child taps a tile: six tiles for letters/numbers/words, four picture tiles for rhymes (each lights up while its word is read, for children who can't read yet).

## Running the Application

Open `index.html` directly in a modern browser (Chrome, Edge, Firefox):
```
start .\index.html   # Windows PowerShell
```

Or run a local server (recommended for reliable speech synthesis):
```
python -m http.server 8000
# then open http://localhost:8000
```

## Architecture

Vanilla JavaScript single-page application with no build step or dependencies (Google Fonts are loaded from a `<link>` but are optional — system fonts are the fallback).

**Files:**
- `index.html` - Three screens: mode selection (with the `.sticker-shelf` collection), the mix picker (`#mixSelect`, toggles with `aria-pressed`), and the game (Change mode / Next, `#streak` meter, Play button, `#rhymeTarget` picture card, `#choices` tile container, `#message`). Also includes the `#reward` dialog.
- `script.js` - All game logic, organized in sections: content, helpers, `speech`, `sfx`, visual effects, game, wiring
- `style.css` - Styling with CSS variables. `.tone-*` classes give mode cards / mix toggles their colours. Tiles are colored by position via `:nth-child(6n+…)` and size their text in `cqi` units relative to the grid. `#choices[data-count]` picks the layout: 6 tiles = 3×2; 4 (rhymes) = one row, 2×2 on phones. `.spotlight` / `.spotlighting` make the tile being read pop and the rest fade. `--chrome` is the height of everything except the tiles; it's used to fit the tiles on short screens and is larger below 960px, where the streak becomes a row instead of a fixed sidebar.

**Content in script.js:**
- `lettersMap` / `numbersMap` - Each letter/number mapped to example words/phrases
- `SIGHT_WORDS` - All 55 Heggerty *Bridge to Reading* kindergarten "Red Words" in teaching order, each with its introduction week and an example sentence. `SIGHT_WORDS_THROUGH_WEEK` limits the game to words taught so far.
- `RHYME_FAMILIES` - Rhyming words with emoji pictures, one family per line (single-word families are only used as wrong answers; near-rhyming families are deliberately excluded; emoji ≤ Unicode 12)
- `GROUPS` - letters / lowercase / numbers / sightWords / rhymes. Each group spreads in a round behaviour, `MATCH_ROUNDS` or `RHYME_ROUNDS`, with `choiceCount`, `makeRound(item)`, `introduce(step, round)`, `nudge(step, round, option, btn)` and an optional `confirm(...)`. Items are objects `{ group, text, spoken, example | emoji, family }`: objects, not strings, because "a" and "I" are both letters and sight words, so compare them by identity. `rhymes.items` holds the words that can be asked about; `rhymes.allWords` holds every word.
- A round is `{ item, answer, options, tiles }`: for match groups `answer === item`; for rhymes `item` is the word to rhyme with and `answer` is another word from its family. Wrong answers come from the item's own group (rhymes: one each from three other families).
- `STREAK_GOAL` (10) and `STICKERS` (emoji + spoken name) - the streak reward
- `MODES` - which groups each mode draws from, plus the on-screen prompt. "mixed" has no fixed groups: they come from the mix picker, are saved in `localStorage` (`letterGame.mix`), and default to `DEFAULT_MIX`.

**Speech (`speech` module):**
- `speech.run(async step => { await step.say(...); await step.pause(...) })` - The ONLY way to speak. Starting a new sequence cancels the current one; the old script throws an internal `Cancelled` at its next `say`/`pause` and stops. This is what prevents overlapping/garbled speech when buttons are tapped quickly — never call `speechSynthesis.speak()` directly.
- `speech.interrupt()` - Stop all speech (used when leaving the game screen)
- `step.until(promise)` - wait for something else (e.g. a tap) inside a sequence; still cancellable
- In game code, use the wrappers `sequence()` / `stopSpeech()`, which also reset the Play button's speaking indicator and clear any spotlight.
- Each utterance has a timeout fallback because some engines never fire `onend`.

**Game loop:**
- `newRound()` → `drawItem()` picks one of `state.groups` uniformly at random (so the big rhyme group doesn't dominate a mix), then draws from that group's shuffled deck: each item once per cycle, never the same item or rhyme family twice in a row. `startRound(item)` builds the round via `group.makeRound`, and `renderRound` draws it.
- `group.introduce` is the paced intro. Match: "Okay, listen closely. This is the letter … B. Words that start with B are …". Rhymes: "Which picture rhymes with … cat?", then each tile's word via `sayLit()`, which spotlights the tile while its word is spoken.
- Correct tap → `celebrate()`: locks input, chime + confetti + praise, then optionally `group.confirm` (rhymes: "cat … hat … They rhyme!"), then `newRound()` and the new intro, all inside one cancellable sequence
- Wrong tap → `tryAgain()`: shake + soft sound, then `group.nudge` (match: repeats the target; rhymes: "dog … cat … Those don't rhyme")
- Streak: `state.streak` counts first-try right answers. A wrong tap sets `round.missed` and calls `setStreak(0)`. At `STREAK_GOAL`, `celebrate` runs `giveReward(step)`: it saves a sticker (`letterGame.stickers` in localStorage, new ones first), shows the dialog, and waits for ▶ via `step.until(promise)`. The streak lives in memory only and carries across mode changes; Next doesn't affect it.
- `onTap()` wraps click handlers to swallow double-taps and clicks right after a screen change
- `readList` / `writeList` - localStorage helpers that fall back gracefully when storage is unavailable

## Browser Requirements

Requires Web Speech API (`speechSynthesis`). Works best in Chrome or Edge (prefers Edge's "Aria Natural" voice). Running via localhost may be needed for speech to work in some browsers. A notice is shown if speech is unavailable.
