// Web Audio API Synthesizer
class SoundSynth {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type, duration, startTime = 0) {
    if (this.muted) return;
    this.init();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + startTime + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(this.ctx.currentTime + startTime);
    osc.stop(this.ctx.currentTime + startTime + duration);
  }

  playClick() {
    this.playTone(800, 'sine', 0.08);
  }

  playSuccess() {
    this.playTone(523.25, 'sine', 0.1, 0);
    this.playTone(659.25, 'sine', 0.1, 0.08);
    this.playTone(783.99, 'sine', 0.15, 0.16);
  }

  playFailure() {
    this.playTone(220, 'triangle', 0.2, 0);
    this.playTone(185, 'triangle', 0.3, 0.15);
  }

  playWin() {
    const tempo = 0.12;
    this.playTone(523.25, 'triangle', tempo, 0);
    this.playTone(523.25, 'triangle', tempo, tempo);
    this.playTone(523.25, 'triangle', tempo, tempo*2);
    this.playTone(523.25, 'triangle', tempo*2, tempo*3);
    this.playTone(415.30, 'triangle', tempo*2, tempo*5);
    this.playTone(466.16, 'triangle', tempo*2, tempo*7);
    this.playTone(523.25, 'triangle', tempo, tempo*9);
    this.playTone(466.16, 'triangle', tempo, tempo*10);
    this.playTone(523.25, 'triangle', tempo*4, tempo*11);
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

const sounds = new SoundSynth();

const platformState = {
  score: 0,
  levels: {
    'bubble-sort': 1,
    'dijkstra': 1
  },
  stats: {
    'tic-tac-toe': { wins: 0, losses: 0, ties: 0 },
    'three-mens-morris': { wins: 0, losses: 0 },
    'chess': { wins: 0, losses: 0 }
  },

  load() {
    const saved = localStorage.getItem('comp_thinking_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.score = parsed.score || 0;
        this.levels = parsed.levels || { 'bubble-sort': 1, 'dijkstra': 1 };
        this.stats = parsed.stats || this.stats;
      } catch (e) {
        console.error("Failed parsing platform state, resetting.", e);
      }
    }
    this.updateUI();
  },

  save() {
    localStorage.setItem('comp_thinking_state', JSON.stringify({
      score: this.score,
      levels: this.levels,
      stats: this.stats
    }));
    this.updateUI();
  },

  addScore(points) {
    this.score += points;
    this.save();
  },

  unlockLevel(gameId, level) {
    if (this.levels[gameId] && this.levels[gameId] < level) {
      this.levels[gameId] = level;
      this.save();
    }
  },

  updateUI() {
    document.getElementById('global-score').textContent = this.score;
    
    const bsStatus = document.getElementById('bs-status');
    if (bsStatus) bsStatus.textContent = `Ready`;

    const dijStatus = document.getElementById('dij-status');
    if (dijStatus) dijStatus.textContent = `Level ${this.levels['dijkstra']}/3 Unlocked`;

    const tttStatus = document.getElementById('ttt-status-badge');
    if (tttStatus) {
      const wins = this.stats['tic-tac-toe'].wins;
      tttStatus.textContent = wins > 0 ? `${wins} Win${wins > 1 ? 's' : ''}` : 'Ready';
    }
    
    const tmmStatus = document.getElementById('tmm-status-badge');
    if (tmmStatus) {
      const wins = this.stats['three-mens-morris'].wins;
      tmmStatus.textContent = wins > 0 ? `${wins} Win${wins > 1 ? 's' : ''}` : 'Ready';
    }
    
    const chessStatus = document.getElementById('chess-status-badge');
    if (chessStatus) {
      const wins = this.stats['chess'].wins;
      chessStatus.textContent = wins > 0 ? `${wins} Win${wins > 1 ? 's' : ''}` : 'Ready';
    }
  }
};

const gameInstructionsData = {
  'bubble-sort': {
    title: '💡 How to Play Bubble Sort',
    steps: [
      { num: 1, text: '<strong>Choose elements:</strong> Select how many elements (3 to 20) you want to sort using the top dropdown.' },
      { num: 2, text: '<strong>Compare:</strong> Look at the two highlighted bars indicated by the pointer.' },
      { num: 3, text: '<strong>Swap:</strong> If the left bar value is <em>larger</em> than the right bar, click <strong>Swap Elements</strong>.' },
      { num: 4, text: '<strong>Advance:</strong> If the left bar value is <em>smaller or equal</em>, click <strong>Advance Pointer</strong>.' },
      { num: 5, text: '<strong>Win:</strong> Repeat passes until all elements lock in green (sorted ascendingly)!' }
    ]
  },
  'tic-tac-toe': {
    title: '💡 How to Play Tic Tac Toe',
    steps: [
      { num: 1, text: '<strong>Objective:</strong> Align 3 of your marks (X) horizontally, vertically, or diagonally.' },
      { num: 2, text: '<strong>Select Mode:</strong> Choose between Easy AI or Minimax AI.' },
      { num: 3, text: '<strong>Minimax Tree:</strong> Watch the live recursive tree below the board calculate the computer\'s moves.' },
      { num: 4, text: '<strong>Strategy:</strong> Block the AI from getting 3 in a row while setting up double traps!' }
    ]
  },
  'dijkstra': {
    title: '💡 How to Play Dijkstra\'s Algorithm',
    steps: [
      { num: 1, text: '<strong>Goal:</strong> Find the shortest path from the START node to the TARGET node.' },
      { num: 2, text: '<strong>Pick a node:</strong> Click the <em>purple</em> node — it always has the smallest known distance.' },
      { num: 3, text: '<strong>Relax each neighbour:</strong> For the pink node, type <code>min(current distance, active + edge weight)</code> and press Enter. You type this yourself — it is not automatic.' },
      { num: 4, text: '<strong>Use the table:</strong> Distances and previous nodes update in the table beside the graph as you play.' },
      { num: 5, text: '<strong>Win:</strong> Keep going until TARGET is visited. The gold path is the shortest route. Solve a level to unlock the next one.' }
    ]
  },
  'three-mens-morris': {
    title: '💡 How to Play Three Men\'s Morris',
    steps: [
      { num: 1, text: '<strong>Phase 1 (Placement):</strong> Take turns placing your 3 pieces onto empty grid intersections.' },
      { num: 2, text: '<strong>Phase 2 (Movement):</strong> Slide your pieces along connecting lines to adjacent open spaces.' },
      { num: 3, text: '<strong>Win Condition:</strong> Line up all 3 of your pieces horizontally, vertically, or diagonally before the AI!' }
    ]
  },
  'chess': {
    title: '💡 How to Play Chess Game',
    steps: [
      { num: 1, text: '<strong>Select Piece:</strong> Click any of your pieces to highlight its legal movement paths.' },
      { num: 2, text: '<strong>Special Moves:</strong> Supports Castling, Double Pawn Push, and En Passant.' },
      { num: 3, text: '<strong>Minimax Engine:</strong> The AI uses 2-ply evaluation searching material value and positional advantage.' },
      { num: 4, text: '<strong>Win Condition:</strong> Checkmate the enemy King to win the game!' }
    ]
  }
};

let activeCurrentGameId = 'bubble-sort';

document.addEventListener('DOMContentLoaded', () => {
  platformState.load();
  showDashboard();

  document.getElementById('back-to-dashboard').addEventListener('click', () => {
    sounds.playClick();
    showDashboard();
  });

  const soundBtn = document.getElementById('sound-toggle-btn');
  soundBtn.addEventListener('click', () => {
    const isMuted = sounds.toggleMute();
    soundBtn.innerHTML = isMuted ? '🔇' : '🔊';
    sounds.init();
    if (!isMuted) sounds.playClick();
  });

  const themeBtn = document.getElementById('theme-toggle-btn');
  themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    themeBtn.innerHTML = newTheme === 'dark' ? '🌙' : '☀️';
    localStorage.setItem('app_theme', newTheme);

    // Update Three.js engine theme if available
    if (window.threeDashboardEngine && typeof window.threeDashboardEngine.setTheme === 'function') {
      window.threeDashboardEngine.setTheme(newTheme);
    }
  });

  const savedTheme = localStorage.getItem('app_theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeBtn.innerHTML = savedTheme === 'dark' ? '🌙' : '☀️';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeBtn.innerHTML = '🌙';
  }

  const gameCards = document.querySelectorAll('.game-card');
  gameCards.forEach(card => {
    card.addEventListener('click', () => {
      sounds.init();
      sounds.playClick();
      const gameId = card.getAttribute('data-game');
      launchGame(gameId);
    });
  });

  const globalModal = document.getElementById('global-instruction-modal');
  const triggerBtn = document.getElementById('global-instruction-trigger');
  const closeBtn = document.getElementById('global-modal-close-btn');
  const gotitBtn = document.getElementById('global-modal-gotit-btn');

  if (triggerBtn) triggerBtn.addEventListener('click', () => openGlobalModal());
  if (closeBtn) closeBtn.addEventListener('click', closeGlobalModal);
  if (gotitBtn) gotitBtn.addEventListener('click', closeGlobalModal);
  if (globalModal) {
    globalModal.addEventListener('click', (e) => {
      if (e.target === globalModal) closeGlobalModal();
    });
  }
});

const HELP_SEEN_KEY = 'ct_help_seen';

function getSeenHelp() {
  try {
    return JSON.parse(localStorage.getItem(HELP_SEEN_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

function markHelpSeen(gameId) {
  const seen = getSeenHelp();
  seen[gameId] = true;
  try {
    localStorage.setItem(HELP_SEEN_KEY, JSON.stringify(seen));
  } catch (e) {
    /* ignore quota / private-mode errors */
  }
}

function openGlobalModal(options) {
  const silent = options && options.silent;
  const globalModal = document.getElementById('global-instruction-modal');
  if (!globalModal) return;

  if (!silent && typeof sounds !== 'undefined' && sounds.playClick) sounds.playClick();

  const data = gameInstructionsData[activeCurrentGameId] || gameInstructionsData['bubble-sort'];
  const nameEl = document.getElementById('global-modal-game-name');
  if (nameEl) nameEl.textContent = data.title;

  const stepsContainer = document.getElementById('global-modal-steps-container');
  if (stepsContainer) {
    stepsContainer.innerHTML = '';
    data.steps.forEach(step => {
      const div = document.createElement('div');
      div.className = 'global-modal-step';
      div.innerHTML = `
        <div class="global-modal-step-num">${step.num}</div>
        <div>${step.text}</div>
      `;
      stepsContainer.appendChild(div);
    });
  }

  globalModal.classList.add('open');
}

function closeGlobalModal() {
  if (typeof sounds !== 'undefined' && sounds.playClick) sounds.playClick();
  const globalModal = document.getElementById('global-instruction-modal');
  if (globalModal) globalModal.classList.remove('open');
}

function showDashboard() {
  document.getElementById('dashboard-view').style.display = 'block';
  document.getElementById('game-arena-view').style.display = 'none';
  document.getElementById('active-game-container').innerHTML = '';
  
  const triggerBtn = document.getElementById('global-instruction-trigger');
  if (triggerBtn) triggerBtn.style.display = 'none';
}

function launchGame(gameId) {
  activeCurrentGameId = gameId;
  document.getElementById('dashboard-view').style.display = 'none';
  const arena = document.getElementById('game-arena-view');
  arena.style.display = 'flex';

  const triggerBtn = document.getElementById('global-instruction-trigger');
  if (triggerBtn) triggerBtn.style.display = 'inline-flex';

  const titleEl = document.getElementById('active-game-title');
  const catEl = document.getElementById('active-game-category');
  const container = document.getElementById('active-game-container');

  if (gameId === 'tic-tac-toe') {
    titleEl.textContent = "Tic Tac Toe";
    catEl.textContent = "Game Trees & Minimax Algorithm";
    if (window.initTicTacToe) window.initTicTacToe(container);
    else container.innerHTML = `<p>Error: Tic Tac Toe game module not loaded.</p>`;

  } else if (gameId === 'bubble-sort') {
    titleEl.textContent = "Bubble Sort Challenge";
    catEl.textContent = "Sorting Algorithms & Time Complexity";
    if (window.initBubbleSort) window.initBubbleSort(container);
    else container.innerHTML = `<p>Bubble Sort game module is loaded soon!</p>`;

  } else if (gameId === 'dijkstra') {
    titleEl.textContent = "Dijkstra's Pathfinding";
    catEl.textContent = "Graph Theory & Shortest Path";
    if (window.initDijkstra) window.initDijkstra(container);
    else container.innerHTML = `<p>Dijkstra's Algorithm game module is loaded soon!</p>`;

  } else if (gameId === 'three-mens-morris') {
    titleEl.textContent = "Three Men's Morris";
    catEl.textContent = "State-Space & Constraints";
    if (window.initThreeMensMorris) window.initThreeMensMorris(container);
    else container.innerHTML = `<p>Three Men's Morris game module is loaded soon!</p>`;

  } else if (gameId === 'chess') {
    titleEl.textContent = "Chess Game";
    catEl.textContent = "Complex State Evaluation & Strategy";
    if (window.initChess) window.initChess(container);
    else container.innerHTML = `<p>Chess game module is loaded soon!</p>`;
  }

  const seen = getSeenHelp();
  if (!seen[gameId]) {
    markHelpSeen(gameId);
    setTimeout(() => openGlobalModal({ silent: true }), 280);
  }
}