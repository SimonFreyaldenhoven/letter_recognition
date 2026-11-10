A simple browser-based game to help children practice recognizing letters, numbers and sight words, and to hear rhymes.

How to run
1. Open the `index.html` file in a modern browser (Chrome, Edge, Firefox). For example, from PowerShell:

```
start .\index.html
```

2. (Optional) Run a local server (helpful for some browser voice APIs):

```
python -m http.server 8000
# then open http://localhost:8000
```

How the game works
- Pick what to practice: big letters (ABC), small letters (abc), numbers (1–20), sight words, rhymes, or a mix.
- "Mix it up" opens a second screen where you choose which of these to mix. Each round picks one of them at random. The choice is remembered for next time.
- Sight words follow the kindergarten order of Heggerty's *Bridge to Reading* program. Only the words taught so far are used. To add more as the year goes on, raise `SIGHT_WORDS_THROUGH_WEEK` near the top of `script.js` (11 = end of Unit 2, 34 = all 55 words).
- The game says a letter or number out loud, plus a few example words. Tap "Play sound" to hear it again. The browser's Web Speech API (speechSynthesis) does the talking, so no audio files are needed.
- Rhymes: "Which picture rhymes with… cat?" Four picture tiles are read out one by one, and each tile pops up and glows while its word is spoken, so children who can't read yet know which tile is which.
- For letters, numbers and sight words, six tiles appear; tap the one that matches. A correct answer gets a chime, confetti and praise, then the next round starts automatically. A wrong answer gets a gentle "try again" and the item is repeated (for rhymes: "dog… cat… those don't rhyme").
- A star meter (a sidebar on wide screens, a row on phones) gets a star for every answer that's right on the first try. A wrong tap empties it. Ten in a row wins a sticker, with a fanfare and confetti. Stickers are collected under "My stickers" on the home screen (new ones first, until she has all 16) and are remembered between visits.
- "Next" skips to a new item (the streak is unaffected); "Change mode" goes back to the menu (the streak carries over).

Notes / Requirements
- A modern browser with speechSynthesis support is recommended. If speech does not play, try Chrome or Edge and/or run via a local server. Edge's "Aria (Natural)" voice is used when available.
- Fonts (Fredoka, and Andika for the letters — designed for beginning readers) load from Google Fonts; offline, the game falls back to system fonts.
