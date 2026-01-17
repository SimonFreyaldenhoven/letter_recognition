# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A browser-based interactive game for children to practice letter recognition. The game speaks a letter aloud using the Web Speech API, then presents two buttons for the child to identify the correct letter.

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

This is a vanilla JavaScript single-page application with no build step or dependencies.

**Files:**
- `index.html` - Main HTML structure with Play/Next controls and choice buttons container
- `script.js` - All game logic including speech synthesis, letter randomization, and confetti animation
- `style.css` - Styling with CSS variables for theming and keyframe animations

**Key data structure in script.js:**
- `wordsMap` - Object mapping each letter (A-Z) to an array of three example words

**Speech flow:**
- `speak()` - Fire-and-forget speech for quick feedback
- `speakAsync()` - Promise-based speech for sequenced playback (used in `playLetterAudio()` for paced letter introduction)

**Game loop:**
- `nextRound()` picks a random letter and creates two choice buttons (correct + one distractor)
- Correct answer triggers `playCorrectFeedback()` → confetti animation → automatic next round

## Browser Requirements

Requires Web Speech API (`speechSynthesis`). Works best in Chrome or Edge. Running via localhost may be needed for speech to work in some browsers.
