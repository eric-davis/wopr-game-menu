const VERSION = '0.0.0';

const GAMES = [
  { label: 'STAX',      url: 'https://esdavis.dev/stax' },
  { label: 'JIGPUZZ',   url: 'https://esdavis.dev/jigpuzz' },
  { label: 'CONNECT 5', url: 'https://esdavis.dev/connect5' },
];

class GameMenu {
  constructor(menuEl, games) {
    this.menuEl = menuEl;
    this.games = games;
    this.activeIndex = 0;

    const sep = '═'.repeat(46);
    menuEl.innerHTML =
      `<span class="line bright">JOSHUA — STRATEGIC SIMULATION SYSTEM ${VERSION}</span>` +
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
  document.getElementById('terminal').classList.add('active');
  const menu = document.getElementById('menu');
  menu.classList.remove('hidden');
  new GameMenu(menu, GAMES);
});
