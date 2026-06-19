const VERSION = '0.0.0';

const GAMES = [
  { label: 'STAX',      url: 'https://esdavis.dev/stax' },
  { label: 'JIGPUZZ',   url: 'https://esdavis.dev/jigpuzz' },
  { label: 'CONNECT 5', url: 'https://esdavis.dev/connect5' },
];

const BOOT_LINES = [
  { text: 'UNITED STATES DEPARTMENT OF DEFENSE',        speed: 40, pause: 0 },
  { text: 'DARPA JOINT OPERATIONS COMMAND',             speed: 40, pause: 0 },
  { text: '═'.repeat(46),                               speed: 8,  pause: 100, cls: 'separator' },
  { text: 'W.O.P.R. — WAR OPERATION PLAN RESPONSE',      speed: 40, pause: 0,   cls: 'bright' },
  { text: `JOSHUA — STRATEGIC SIMULATION SYSTEM ${VERSION}`, speed: 40, pause: 0,   cls: 'bright' },
  { text: '═'.repeat(46),                               speed: 8,  pause: 200, cls: 'separator' },
  { text: '',                                           speed: 0,  pause: 300 },
  { text: 'SYSTEM STATUS ............... NOMINAL',      speed: 35, pause: 0 },
  { text: 'SECURITY CLEARANCE .......... RESTRICTED',   speed: 35, pause: 0 },
  { text: 'AVAILABLE PROGRAMS .......... 3',            speed: 35, pause: 400 },
  { text: '',                                           speed: 0,  pause: 200 },
  { text: 'LOADING GAMES LIBRARY...',                   speed: 50, pause: 600 },
  { text: '',                                           speed: 0,  pause: 200 },
];

const GREETING_LINES = [
  { text: 'GREETINGS, PROFESSOR FALKEN.', speed: 60, pause: 0,   cls: 'bright' },
  { text: '',                             speed: 0,  pause: 400 },
  { text: 'SHALL WE PLAY A GAME?',        speed: 60, pause: 0,   cls: 'bright' },
  { text: '',                             speed: 0,  pause: 800 },
];

let audioCtx = null;

function initAudio() {
  if (!audioCtx) audioCtx = new AudioContext();
}

function playKeyClick() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  const oscGain = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.value = 900 + (Math.random() - 0.5) * 160;
  osc.connect(oscGain);
  oscGain.connect(audioCtx.destination);
  oscGain.gain.setValueAtTime(0.06, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);
  osc.start(now);
  osc.stop(now + 0.022);
  osc.onended = () => { osc.disconnect(); oscGain.disconnect(); };

  const buf = audioCtx.createBuffer(1, 512, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < 512; i++) data[i] = Math.random() * 2 - 1;
  const noise = audioCtx.createBufferSource();
  const noiseGain = audioCtx.createGain();
  noise.buffer = buf;
  noise.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);
  noiseGain.gain.setValueAtTime(0.04, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);
  noise.start(now);
  noise.onended = () => { noise.disconnect(); noiseGain.disconnect(); };
}

async function typewriter(container, lines, skipRef = { value: false }) {
  for (const line of lines) {
    if (line.pause > 0 && !skipRef.value) {
      await new Promise(resolve => setTimeout(resolve, line.pause));
    }

    const lineEl = document.createElement('span');
    lineEl.className = `line ${line.cls || ''}`.trim();
    container.appendChild(lineEl);

    if (!line.text) continue;

    for (const char of line.text) {
      const glyphEl = document.createElement('span');
      glyphEl.className = 'glyph';
      glyphEl.textContent = char;
      lineEl.appendChild(glyphEl);

      if (!skipRef.value) {
        glyphEl.classList.add('hot');
        playKeyClick();
        await new Promise(resolve =>
          setTimeout(resolve, Math.max(5, line.speed + (Math.random() * 30) - 15))
        );
        glyphEl.classList.remove('hot');
      }
    }

    container.scrollTop = container.scrollHeight;
  }
}

async function playSequence(clip1El, clip2El) {
  try { await clip1El.play(); } catch {}
  await new Promise(resolve => clip1El.addEventListener('ended', resolve, { once: true }));
  try { await clip2El.play(); } catch {}
}

class GameMenu {
  constructor(menuEl, games) {
    this.menuEl = menuEl;
    this.games = games;
    this.activeIndex = 0;

    const sep = '═'.repeat(46);
    menuEl.innerHTML =
      `<span class="menu-separator">${sep}</span>` +
      games.map((g, i) =>
        `<span class="game-item" data-index="${i}">${g.label}</span>`
      ).join('') +
      `<span class="menu-separator">${sep}</span>` +
      `<span class="menu-prompt">SELECT A PROGRAM<span class="cursor">█</span></span>`;

    document.addEventListener('keydown', this._onKey.bind(this));
    menuEl.addEventListener('mouseover', this._onMouseOver.bind(this));
    menuEl.addEventListener('click', this._onClick.bind(this));
    menuEl.addEventListener('touchstart', (e) => {
      const item = e.target.closest('.game-item');
      if (item) {
        this.activeIndex = Number(item.dataset.index);
        this._updateActive();
      }
    });

    this._updateActive();
  }

  _updateActive() {
    this.menuEl.querySelectorAll('.game-item').forEach((el, i) =>
      el.classList.toggle('active', i === this.activeIndex)
    );
  }

  _onKey(e) {
    if (e.key === 'ArrowUp') {
      this.activeIndex = (this.activeIndex - 1 + this.games.length) % this.games.length;
      this._updateActive();
    } else if (e.key === 'ArrowDown') {
      this.activeIndex = (this.activeIndex + 1) % this.games.length;
      this._updateActive();
    } else if (e.key === 'Enter') {
      this._navigate(this.activeIndex);
    }
  }

  _onMouseOver(e) {
    const item = e.target.closest('.game-item');
    if (!item) return;
    this.activeIndex = Number(item.dataset.index);
    this._updateActive();
  }

  _onClick(e) {
    const item = e.target.closest('.game-item');
    if (item) this._navigate(Number(item.dataset.index));
  }

  _navigate(index) {
    window.open(this.games[index].url, '_blank');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const gate     = document.getElementById('gate');
  const terminal = document.getElementById('terminal');
  const output   = document.getElementById('output');
  const menu     = document.getElementById('menu');
  const audio1   = document.getElementById('audio-greetings');
  const audio2   = document.getElementById('audio-shall-we-play');

  const start = () => {
    gate.classList.add('hidden');
    initAudio();
    terminal.classList.add('active');
    const skipRef = { value: false };
    const skip = () => {
      skipRef.value = true;
      document.removeEventListener('keydown',    skip);
      document.removeEventListener('click',      skip);
      document.removeEventListener('touchstart', skip);
    };
    document.addEventListener('keydown',    skip);
    document.addEventListener('click',      skip);
    document.addEventListener('touchstart', skip);
    (async () => {
      await typewriter(output, BOOT_LINES, skipRef);
      playSequence(audio1, audio2);
      await typewriter(output, GREETING_LINES, skipRef);
      document.removeEventListener('keydown',    skip);
      document.removeEventListener('click',      skip);
      document.removeEventListener('touchstart', skip);
      menu.classList.remove('hidden');
      new GameMenu(menu, GAMES);
    })();
  };

  const startOnce = () => {
    document.removeEventListener('click',      startOnce);
    document.removeEventListener('keydown',    startOnce);
    document.removeEventListener('touchstart', startOnce);
    start();
  };
  document.addEventListener('click',      startOnce);
  document.addEventListener('keydown',    startOnce);
  document.addEventListener('touchstart', startOnce);
});
