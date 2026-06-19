# WOPR Game Menu

A WarGames-themed game directory hosted at https://esdavis.dev/games

## Features

- Phosphor-green CRT terminal aesthetic (VT323 font, scanlines, screen flicker)
- Typewriter boot sequence
- "Greetings, Professor Falken" audio greeting
- Per-keystroke Web Audio click sound
- Keyboard, mouse, and touch navigation
- Mobile-responsive

## File Structure

```
game-menu/
├── index.html
├── favicon.svg
├── css/
│   └── style.css
├── js/
│   └── main.js
└── audio/
    ├── greetings.mp3
    └── shall-we-play.mp3
```

## Setup

1. Drop `greetings.mp3` and `shall-we-play.mp3` into `audio/`
2. Deploy the folder contents to your web server's `/games` path

## Games

| Name | URL |
| --- | --- |
| STAX | https://esdavis.dev/stax |
| JigPuzz | https://esdavis.dev/jigpuzz |
| Connect 5 | https://esdavis.dev/connect5 |

To add or change games, update the `GAMES` constant at the top of `js/main.js`.

## Navigation

| Input | Action |
| --- | --- |
| Keyboard | ↑↓ arrows to move, Enter to launch |
| Mouse | Hover to highlight, click to launch |
| Touch | Tap to launch |
