This repo hosts a simple browser-based interactive game to help children practice letters.

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
- Click "Play Letter" to hear a letter and three example words that start with it. The browser uses the Web Speech API (speechSynthesis) so no audio files are needed.
- Two big buttons appear; tap the one that shows the same letter as the sound. If correct, a short confetti animation and voice feedback will play.

Notes / Requirements
- A modern browser with speechSynthesis support is recommended. If speech does not play, try using Chrome or Edge and/or run via a local server.

If you want a different UI, sounds, or packaged app (Electron/PWA), tell me and I can scaffold it.
