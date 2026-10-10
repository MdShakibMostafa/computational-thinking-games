(function () {
  window.initDijkstra = function (container) {
    if (!container) return;

    container.innerHTML = `
      <style>
        .dij-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          width: 100%;
        }
        .dij-controls-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          justify-content: center;
          align-items: center;
        }
        .dij-stats-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem;
        }
        .dij-stat-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 0.4rem 0.9rem;
          font-family: var(--font-mono);
          min-width: 80px;
        }
        .dij-stat-label {
          font-size: 0.65rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .dij-stat-value {
          font-size: 1.2rem;
          font-weight: bold;
          color: var(--accent-cyan);
        }
        .dij-stat-value.bad  { color: var(--accent-pink); }
        .dij-stat-value.good { color: var(--accent-green); }
        .dij-status-text {
          font-size: 1.05rem;
          font-family: var(--font-mono);
          color: var(--accent-cyan);
          text-align: center;
          min-height: 1.5em;
          transition: color 0.3s;
        }
        .dij-graph-area {
          position: relative;
          width: 100%;
          max-width: 900px;
          height: 480px;
          background: rgba(0,0,0,0.35);
          border-radius: 14px;
          border: 1px solid var(--glass-border);
          overflow: hidden;
        }
        .dij-graph-area svg {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0; left: 0;
          z-index: 1;
        }
        .dij-nodes-layer {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0; left: 0;
          z-index: 2;
        }
        .dij-node {
          position: absolute;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: bold;
          font-family: var(--font-mono);
          transition: transform 0.2s ease, box-shadow 0.3s ease, background 0.3s ease;
          user-select: none;
        }
        .dij-node:hover { transform: scale(1.12); }
        .dij-node.state-default  { background: rgba(255,255,255,0.08); border: 2px solid rgba(255,255,255,0.2); }
        .dij-node.state-start    { background: rgba(0,242,254,0.2);    border: 3px solid var(--accent-cyan);  box-shadow: 0 0 14px rgba(0,242,254,0.5); }
        .dij-node.state-active   { background: rgba(0,242,254,0.25);   border: 2px solid var(--accent-cyan);  box-shadow: 0 0 20px rgba(0,242,254,0.6); animation: dij-pulse-cyan 1.2s infinite; }
        .dij-node.state-neighbor { background: rgba(255,0,127,0.25);   border: 2px solid var(--accent-pink);  box-shadow: 0 0 16px rgba(255,0,127,0.5); animation: dij-pulse-pink 1.2s infinite; }
        .dij-node.state-visited  { background: rgba(56,176,0,0.35);    border: 2px solid lime;                box-shadow: 0 0 10px rgba(56,176,0,0.4); }
        .dij-node.state-target   { background: rgba(255,215,0,0.15);   border: 3px solid gold;                box-shadow: 0 0 18px rgba(255,215,0,0.7); }
        .dij-node.state-path     { background: rgba(255,215,0,0.3);    border: 3px solid gold;                box-shadow: 0 0 24px gold; animation: dij-pulse-gold 1.5s infinite; }
        .dij-node.state-candidate {
          background: rgba(157,78,221,0.2);
          border: 2px solid var(--accent-purple);
          box-shadow: 0 0 14px rgba(157,78,221,0.45);
        }
        @keyframes dij-pulse-cyan {
          0%,100% { box-shadow: 0 0 14px rgba(0,242,254,0.5); }
          50%     { box-shadow: 0 0 28px rgba(0,242,254,0.9); }
        }
        @keyframes dij-pulse-pink {
          0%,100% { box-shadow: 0 0 12px rgba(255,0,127,0.4); }
          50%     { box-shadow: 0 0 24px rgba(255,0,127,0.8); }
        }
        @keyframes dij-pulse-gold {
          0%,100% { box-shadow: 0 0 18px gold; }
          50%     { box-shadow: 0 0 36px gold; }
        }
        .dij-node-label { font-size: 1rem;  color: #fff; }
        .dij-node-dist  { font-size: 0.72rem; color: #ccc; margin-top: 1px; }
        .dij-node-tag   { font-size: 0.55rem; color: gold; letter-spacing: 0.05em; }
        .dij-legend {
          display: flex; flex-wrap: wrap; gap: 0.6rem;
          justify-content: center;
          font-size: 0.78rem; font-family: var(--font-mono); color: var(--text-secondary);
        }
        .dij-legend-item { display: flex; align-items: center; gap: 0.35rem; }
        .dij-legend-dot  { width: 14px; height: 14px; border-radius: 50%; border: 2px solid transparent; flex-shrink: 0; }
        .dij-relax-panel {
          display: none; flex-direction: column; align-items: center; gap: 0.85rem;
          padding: 1.1rem 1.4rem;
          background: var(--glass-bg);
          border: 1px solid var(--accent-pink);
          border-radius: 14px;
          width: 100%; max-width: 520px;
          box-shadow: 0 0 18px rgba(255,0,127,0.2);
        }
        .dij-relax-title   { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent-pink); font-family: var(--font-mono); }
        .dij-relax-formula { font-size: 1rem; font-family: var(--font-mono); color: var(--text-primary); text-align: center; line-height: 1.7; }
        .dij-relax-inputs  { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; justify-content: center; }
        .dij-relax-input {
          width: 90px; text-align: center;
          background: var(--bg-secondary);
          border: 1px solid var(--accent-pink);
          color: var(--text-primary);
          padding: 0.45rem 0.6rem;
          border-radius: 8px; font-family: var(--font-mono); font-size: 1rem; outline: none;
        }
        .dij-relax-input:focus { border-color: var(--accent-cyan); box-shadow: 0 0 8px rgba(0,242,254,0.3); }
        .dij-hint-text { font-size: 0.8rem; color: var(--accent-purple); font-family: var(--font-mono); text-align: center; min-height: 1em; }
        .dij-instructions {
          width: 100%; max-width: 900px;
          background: rgba(0,242,254,0.04);
          border: 1px solid rgba(0,242,254,0.15);
          border-radius: 12px;
          padding: 0.85rem 1.2rem;
          font-size: 0.82rem; font-family: var(--font-mono); color: var(--text-secondary); line-height: 1.7;
        }
        .dij-instructions b { color: var(--accent-cyan); }
        .dij-path-display {
          font-family: var(--font-mono); font-size: 0.95rem; color: gold; text-align: center;
          padding: 0.5rem 1rem;
          background: rgba(255,215,0,0.06); border: 1px solid rgba(255,215,0,0.25);
          border-radius: 10px; width: 100%; max-width: 900px;
        }
        .dij-map-badge {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          color: var(--accent-purple);
          background: rgba(157,78,221,0.12);
          border: 1px solid rgba(157,78,221,0.3);
          border-radius: 8px;
          padding: 0.25rem 0.7rem;
        }
        .dij-level-lock {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        @keyframes dij-score-pop {
          0%   { opacity:0; transform: translateY(0) scale(0.7); }
          30%  { opacity:1; transform: translateY(-20px) scale(1.1); }
          70%  { opacity:1; transform: translateY(-30px) scale(1); }
          100% { opacity:0; transform: translateY(-50px) scale(0.9); }
        }
        .dij-score-popup {
          position: fixed; font-size: 1.5rem; font-weight: bold; font-family: var(--font-mono);
          color: gold; pointer-events: none;
          animation: dij-score-pop 1.6s ease forwards;
          z-index: 9999; text-shadow: 0 0 12px gold;
        }
        .dij-board {
          display: flex;
          gap: 0.85rem;
          width: 100%;
          max-width: 1100px;
          align-items: stretch;
          justify-content: center;
        }
        .dij-table-wrap {
          width: 230px;
          flex-shrink: 0;
          background: rgba(0,0,0,0.35);
          border: 1px solid var(--glass-border);
          border-radius: 14px;
          padding: 0.7rem 0.65rem 0.8rem;
          overflow: auto;
          max-height: 480px;
        }
        .dij-table-title {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          text-align: center;
        }
        .dij-table {
          width: 100%;
          border-collapse: collapse;
          font-family: var(--font-mono);
          font-size: 0.78rem;
        }
        .dij-table th {
          color: var(--text-secondary);
          font-weight: 600;
          text-align: left;
          padding: 0.28rem 0.3rem;
          border-bottom: 1px solid var(--glass-border);
        }
        .dij-table td {
          padding: 0.32rem 0.3rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          color: var(--text-primary);
        }
        .dij-table tr.dij-row-active td { background: rgba(0,242,254,0.12); color: var(--accent-cyan); }
        .dij-table tr.dij-row-next td { background: rgba(157,78,221,0.14); color: #d4b3ff; }
        .dij-table tr.dij-row-relax td { background: rgba(255,0,127,0.14); color: var(--accent-pink); }
        .dij-table tr.dij-row-visited td { color: var(--accent-green); }
        .dij-table tr.dij-row-path td { color: gold; font-weight: bold; }
        .dij-table .dij-inf { opacity: 0.45; }
        @media (max-width: 900px) {
          .dij-board { flex-direction: column; align-items: center; }
          .dij-table-wrap { width: 100%; max-width: 900px; max-height: 220px; }
        }
      </style>

      <div class="dij-wrapper">
        <div class="dij-controls-row">
          <label for="dij-level" style="font-family:var(--font-mono);font-size:0.9rem;color:var(--text-secondary);">Level:</label>
          <select id="dij-level" class="mode-select">
            <option value="1">Level 1 — Beginner (5 nodes)</option>
            <option value="2">Level 2 — Intermediate (7 nodes)</option>
            <option value="3">Level 3 — Advanced (9–10 nodes)</option>
          </select>
          <button id="dij-reset"    class="btn btn-secondary" style="font-size:0.88rem;padding:0.45rem 1rem;">🔄 New Graph</button>
          <button id="dij-hint-btn" class="btn btn-secondary" style="font-size:0.88rem;padding:0.45rem 1rem;">💡 Hint</button>
          <span class="dij-map-badge" id="dij-map-name">Map: —</span>
          <span class="dij-level-lock" id="dij-unlock-info">Unlocked: 1/3</span>
        </div>

        <div class="dij-stats-row">
          <div class="dij-stat-box"><span class="dij-stat-label">Timer</span>   <span class="dij-stat-value" id="dij-timer">00:00</span></div>
          <div class="dij-stat-box"><span class="dij-stat-label">Current</span> <span class="dij-stat-value" id="dij-current">—</span></div>
          <div class="dij-stat-box"><span class="dij-stat-label">Queue</span>   <span class="dij-stat-value" id="dij-queue">0</span></div>
          <div class="dij-stat-box"><span class="dij-stat-label">Steps</span>   <span class="dij-stat-value good" id="dij-steps">0</span></div>
          <div class="dij-stat-box"><span class="dij-stat-label">Mistakes</span><span class="dij-stat-value bad"  id="dij-mistakes">0</span></div>
        </div>

        <div id="dij-status" class="dij-status-text">Loading…</div>

        <div class="dij-board">
          <div class="dij-graph-area" id="dij-graph-area">
            <svg id="dij-svg">
              <defs>
                <!-- Forward arrows only -->
                <marker id="dij-m-end" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0.8 L9,4.5 L0,8.2 Z" fill="rgba(255,255,255,0.45)"/>
                </marker>
                <marker id="dij-m-end-path" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,1 L10,5 L0,9 Z" fill="#FFD700"/>
                </marker>
                <marker id="dij-m-end-relax" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,1 L10,5 L0,9 Z" fill="#ff007f"/>
                </marker>
              </defs>
            </svg>
            <div class="dij-nodes-layer" id="dij-nodes-container"></div>
          </div>
          <div class="dij-table-wrap">
            <div class="dij-table-title">Distance table</div>
            <table class="dij-table" id="dij-dist-table">
              <thead>
                <tr>
                  <th>Node</th>
                  <th>Dist</th>
                  <th>Prev</th>
                  <th>Done</th>
                </tr>
              </thead>
              <tbody id="dij-dist-body"></tbody>
            </table>
          </div>
        </div>

        <div class="dij-legend">
          <div class="dij-legend-item"><div class="dij-legend-dot" style="background:rgba(0,242,254,0.25);border-color:cyan;"></div><span>Active</span></div>
          <div class="dij-legend-item"><div class="dij-legend-dot" style="background:rgba(157,78,221,0.2);border-color:var(--accent-purple);"></div><span>Next (smallest dist)</span></div>
          <div class="dij-legend-item"><div class="dij-legend-dot" style="background:rgba(255,0,127,0.25);border-color:hotpink;"></div><span>Neighbour to Relax</span></div>
          <div class="dij-legend-item"><div class="dij-legend-dot" style="background:rgba(56,176,0,0.35);border-color:lime;"></div><span>Visited</span></div>
          <div class="dij-legend-item"><div class="dij-legend-dot" style="background:rgba(255,215,0,0.3);border-color:gold;"></div><span>Shortest Path</span></div>
        </div>

        <div class="dij-relax-panel" id="dij-relax-panel">
          <div class="dij-relax-title">⚡ Edge Relaxation</div>
          <div class="dij-relax-formula" id="dij-relax-text"></div>
          <div class="dij-relax-inputs">
            <span style="font-family:var(--font-mono);font-size:0.9rem;color:var(--text-secondary);">New distance =</span>
            <input type="number" id="dij-relax-input" class="dij-relax-input" placeholder="?" min="0"/>
            <button id="dij-btn-relax" class="btn" style="padding:0.5rem 1.1rem;">✔ Submit</button>
          </div>
          <div class="dij-hint-text" id="dij-hint-text"></div>
        </div>

        <div class="dij-path-display" id="dij-path-display" style="display:none;"></div>

        <div class="dij-instructions">
          <b>How to play Dijkstra correctly:</b>
          <b>1.</b> Always expand the unvisited node with the <b>smallest known distance</b> (purple glow). &nbsp;|&nbsp;
          <b>2.</b> For each neighbour, compute <b>min(current, dist(active)+edge)</b>. &nbsp;|&nbsp;
          <b>3.</b> Edges are <b>undirected</b> (travel both ways). &nbsp;|&nbsp;
          <b>4.</b> Finish when <b>TARGET</b> is visited. Gold path = shortest route.
          Higher levels unlock after you solve the current level.
        </div>
      </div>
    `;

    // ── DOM refs ──────────────────────────────────────────────
    const levelSelect    = document.getElementById('dij-level');
    const resetBtn       = document.getElementById('dij-reset');
    const hintBtn        = document.getElementById('dij-hint-btn');
    const currentEl      = document.getElementById('dij-current');
    const queueEl        = document.getElementById('dij-queue');
    const statusEl       = document.getElementById('dij-status');
    const svgEl          = document.getElementById('dij-svg');
    const nodesContainer = document.getElementById('dij-nodes-container');
    const relaxPanel     = document.getElementById('dij-relax-panel');
    const relaxText      = document.getElementById('dij-relax-text');
    const relaxInput     = document.getElementById('dij-relax-input');
    const btnRelax       = document.getElementById('dij-btn-relax');
    const hintText       = document.getElementById('dij-hint-text');
    const pathDisplay    = document.getElementById('dij-path-display');
    const timerEl        = document.getElementById('dij-timer');
    const stepsEl        = document.getElementById('dij-steps');
    const mistakesEl     = document.getElementById('dij-mistakes');
    const mapNameEl      = document.getElementById('dij-map-name');
    const unlockInfoEl   = document.getElementById('dij-unlock-info');
    const distBodyEl     = document.getElementById('dij-dist-body');

    // ── State ─────────────────────────────────────────────────
    let graph = {}, distances = {}, visited = {}, predecessors = {};
    let activeNode = null, neighborToRelax = null;
    let relaxedSet = new Set(), winPath = [];
    let gameActive = true, startNode = 'A', targetNode = '';
    let steps = 0, mistakes = 0, hintUsed = false;
    let timerInterval = null, timerSeconds = 0;
    let currentMapName = '';
    let undirectedEdgeList = []; // for rendering undirected edges once

    // ── Events ────────────────────────────────────────────────
    levelSelect.addEventListener('change', () => {
      if (typeof sounds !== 'undefined' && sounds.playClick) sounds.playClick();
      const unlocked = getUnlockedLevel();
      const chosen = parseInt(levelSelect.value) || 1;
      if (chosen > unlocked) {
        levelSelect.value = String(unlocked);
        setStatus(`Level ${chosen} is locked. Complete Level ${unlocked} first.`, 'var(--accent-pink)');
        return;
      }
      initGame();
    });
    resetBtn.addEventListener('click', () => {
      if (typeof sounds !== 'undefined' && sounds.playClick) sounds.playClick();
      initGame();
    });
    hintBtn.addEventListener('click', showHint);
    btnRelax.addEventListener('click', handleRelaxSubmit);
    relaxInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleRelaxSubmit(); });

    // ── Utilities ─────────────────────────────────────────────
    function random(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function pick(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function formatTime(s) {
      return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
    }

    function getUnlockedLevel() {
      if (typeof platformState !== 'undefined' && platformState.levels && platformState.levels['dijkstra']) {
        return platformState.levels['dijkstra'];
      }
      return 1;
    }

    function updateLevelSelectUI() {
      const unlocked = getUnlockedLevel();
      Array.from(levelSelect.options).forEach(opt => {
        const val = parseInt(opt.value);
        if (val > unlocked) {
          opt.disabled = true;
        } else {
          opt.disabled = false;
        }
      });
      // Re-label cleanly
      levelSelect.options[0].textContent = 'Level 1 — Beginner (5 nodes)' + (1 > unlocked ? ' 🔒' : '');
      levelSelect.options[1].textContent = 'Level 2 — Intermediate (7 nodes)' + (2 > unlocked ? ' 🔒' : '');
      levelSelect.options[2].textContent = 'Level 3 — Advanced (9–10 nodes)' + (3 > unlocked ? ' 🔒' : '');
      Array.from(levelSelect.options).forEach(opt => {
        opt.disabled = parseInt(opt.value) > unlocked;
      });

      if (parseInt(levelSelect.value) > unlocked) {
        levelSelect.value = String(unlocked);
      }
      if (unlockInfoEl) unlockInfoEl.textContent = `Unlocked: ${unlocked}/3`;
    }

    function startTimer() {
      stopTimer();
      timerSeconds = 0;
      timerEl.textContent = '00:00';
      timerInterval = setInterval(() => {
        timerSeconds++;
        timerEl.textContent = formatTime(timerSeconds);
      }, 1000);
    }

    function stopTimer() {
      if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    }

    function setStatus(msg, color) {
      if (statusEl) {
        statusEl.textContent = msg;
        statusEl.style.color = color || 'var(--accent-cyan)';
      }
    }

    function showScorePopup(pts) {
      const p = document.createElement('div');
      p.className = 'dij-score-popup';
      p.textContent = `+${pts} pts`;
      p.style.left = (window.innerWidth / 2 - 40) + 'px';
      p.style.top  = (window.innerHeight / 2 - 60) + 'px';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1700);
    }


    // Build UNDIRECTED graph: every edge works both ways with same weight
    function buildGraph(nodes, edges) {
      const g = {};
      Object.keys(nodes).forEach(id => {
        g[id] = { x: nodes[id].x, y: nodes[id].y, neighbors: {} };
      });

      const uniqueEdges = [];
      const seen = new Set();

      edges.forEach(([from, to, w]) => {
        if (!g[from] || !g[to] || from === to) return;
        const key = from < to ? `${from}|${to}` : `${to}|${from}`;
        if (seen.has(key)) return;
        seen.add(key);

        g[from].neighbors[to] = w;
        g[to].neighbors[from] = w;
        uniqueEdges.push([from, to, w]);
      });

      undirectedEdgeList = uniqueEdges;
      return g;
    }

    // BFS reachability check: start must reach target
    function isConnected(g, start, target) {
      const seen = new Set([start]);
      const q = [start];
      while (q.length) {
        const u = q.shift();
        if (u === target) return true;
        Object.keys(g[u].neighbors).forEach(v => {
          if (!seen.has(v)) { seen.add(v); q.push(v); }
        });
      }
      return false;
    }

    // Every node must be reachable from start (full connected component)
    function isFullyConnected(g, start) {
      const ids = Object.keys(g);
      const seen = new Set([start]);
      const q = [start];
      while (q.length) {
        const u = q.shift();
        Object.keys(g[u].neighbors).forEach(v => {
          if (!seen.has(v)) { seen.add(v); q.push(v); }
        });
      }
      return seen.size === ids.length;
    }

    // ═══════════════════════════════════════════════════════════
    //  CURATED UNDIRECTED DIJKSTRA MAPS
    //  Rules for every map:
    //  • Start left, Target right
    //  • Fully connected undirected graph
    //  • Multiple competing routes (students must relax carefully)
    //  • Fixed weights — no random jitter that breaks teaching design
    // ═══════════════════════════════════════════════════════════
    const MAP_LIBRARY = {
      level1: [
        {
          name: 'Fork Road',
          // A→B cheap first hop, but A→C→D→E is optimal
          nodes: {
            A: { x: 90,  y: 240 },
            B: { x: 300, y: 120 },
            C: { x: 300, y: 360 },
            D: { x: 540, y: 240 },
            E: { x: 780, y: 240 }
          },
          edges: [
            ['A','B',2], ['A','C',5],
            ['B','D',8], ['C','D',2],
            ['B','E',9], ['D','E',3], ['C','E',7]
          ]
          // Optimal: A-C-D-E = 10
        },
        {
          name: 'Diamond Path',
          nodes: {
            A: { x: 90,  y: 240 },
            B: { x: 320, y: 110 },
            C: { x: 320, y: 370 },
            D: { x: 560, y: 240 },
            E: { x: 800, y: 240 }
          },
          edges: [
            ['A','B',4], ['A','C',3],
            ['B','D',3], ['C','D',5],
            ['B','E',10], ['C','E',9], ['D','E',2]
          ]
          // Optimal: A-B-D-E = 9
        },
        {
          name: 'Shortcut Trap',
          // Direct A-E = 15 looks tempting but multi-hop is cheaper
          nodes: {
            A: { x: 90,  y: 240 },
            B: { x: 300, y: 130 },
            C: { x: 300, y: 350 },
            D: { x: 540, y: 240 },
            E: { x: 780, y: 240 }
          },
          edges: [
            ['A','B',3], ['A','C',4], ['A','E',15],
            ['B','D',4], ['C','D',3],
            ['D','E',2], ['B','E',8]
          ]
          // Optimal: A-B-D-E = 9  or A-C-D-E = 9
        },
        {
          name: 'Ladder Climb',
          nodes: {
            A: { x: 100, y: 380 },
            B: { x: 280, y: 240 },
            C: { x: 460, y: 120 },
            D: { x: 640, y: 240 },
            E: { x: 820, y: 120 }
          },
          edges: [
            ['A','B',2], ['A','C',9],
            ['B','C',3], ['B','D',5],
            ['C','D',2], ['C','E',4],
            ['D','E',3]
          ]
          // Optimal: A-B-C-E = 9
        },
        {
          name: 'Two Bridges',
          nodes: {
            A: { x: 90,  y: 240 },
            B: { x: 300, y: 120 },
            C: { x: 300, y: 360 },
            D: { x: 560, y: 120 },
            E: { x: 780, y: 240 }
          },
          edges: [
            ['A','B',4], ['A','C',2],
            ['B','D',3], ['C','D',5],
            ['B','E',7], ['C','E',6],
            ['D','E',1]
          ]
          // Optimal: A-B-D-E = 8
        }
      ],

      level2: [
        {
          name: 'City Grid',
          nodes: {
            A: { x: 80,  y: 240 },
            B: { x: 260, y: 110 },
            C: { x: 260, y: 370 },
            D: { x: 450, y: 110 },
            E: { x: 450, y: 370 },
            F: { x: 640, y: 240 },
            G: { x: 820, y: 240 }
          },
          edges: [
            ['A','B',4], ['A','C',2],
            ['B','D',3], ['C','E',5],
            ['B','E',6], ['C','D',7],
            ['D','F',2], ['E','F',3],
            ['D','G',8], ['F','G',2], ['E','G',6]
          ]
          // Optimal: A-C-E-F-G = 2+5+3+2 = 12  or A-B-D-F-G = 4+3+2+2 = 11
        },
        {
          name: 'River Crossing',
          nodes: {
            A: { x: 80,  y: 240 },
            B: { x: 250, y: 100 },
            C: { x: 250, y: 240 },
            D: { x: 250, y: 380 },
            E: { x: 500, y: 140 },
            F: { x: 500, y: 340 },
            G: { x: 760, y: 240 }
          },
          edges: [
            ['A','B',5], ['A','C',3], ['A','D',6],
            ['B','E',2], ['C','E',4], ['C','F',3], ['D','F',2],
            ['E','G',7], ['F','G',4],
            ['B','G',12], ['D','G',11]
          ]
          // Optimal: A-C-F-G = 3+3+4 = 10
        },
        {
          name: 'Mountain Pass',
          nodes: {
            A: { x: 80,  y: 360 },
            B: { x: 240, y: 200 },
            C: { x: 240, y: 400 },
            D: { x: 420, y: 100 },
            E: { x: 420, y: 300 },
            F: { x: 620, y: 200 },
            G: { x: 800, y: 200 }
          },
          edges: [
            ['A','B',3], ['A','C',2],
            ['B','D',4], ['B','E',5],
            ['C','E',3],
            ['D','F',3], ['E','F',2],
            ['D','G',9], ['F','G',3], ['E','G',7]
          ]
          // Optimal: A-C-E-F-G = 2+3+2+3 = 10
        },
        {
          name: 'Network Hub',
          nodes: {
            A: { x: 80,  y: 240 },
            B: { x: 280, y: 100 },
            C: { x: 280, y: 380 },
            D: { x: 480, y: 100 },
            E: { x: 480, y: 240 },
            F: { x: 480, y: 380 },
            G: { x: 720, y: 240 }
          },
          edges: [
            ['A','B',3], ['A','C',4], ['A','E',8],
            ['B','D',2], ['B','E',4],
            ['C','F',2], ['C','E',3],
            ['D','G',6], ['E','G',3], ['F','G',5],
            ['D','E',2], ['F','E',2]
          ]
          // Optimal: A-B-D-E-G = 3+2+2+3 = 10  or A-C-E-G = 4+3+3 = 10
        },
        {
          name: 'Detour Decision',
          nodes: {
            A: { x: 90,  y: 240 },
            B: { x: 270, y: 120 },
            C: { x: 270, y: 360 },
            D: { x: 470, y: 120 },
            E: { x: 470, y: 360 },
            F: { x: 650, y: 240 },
            G: { x: 820, y: 240 }
          },
          edges: [
            ['A','B',1], ['A','C',6],
            ['B','D',7], ['C','E',2],
            ['B','E',5], ['C','D',4],
            ['D','F',2], ['E','F',3],
            ['F','G',2], ['D','G',8], ['E','G',7]
          ]
          // Optimal: A-B-E-F-G = 1+5+3+2 = 11
        }
      ],

      level3: [
        {
          name: 'Campus Map',
          nodes: {
            A: { x: 70,  y: 240 },
            B: { x: 220, y: 100 },
            C: { x: 220, y: 240 },
            D: { x: 220, y: 380 },
            E: { x: 400, y: 100 },
            F: { x: 400, y: 240 },
            G: { x: 400, y: 380 },
            H: { x: 600, y: 160 },
            I: { x: 600, y: 320 },
            J: { x: 800, y: 240 }
          },
          edges: [
            ['A','B',4], ['A','C',2], ['A','D',5],
            ['B','E',3], ['C','F',3], ['D','G',2],
            ['B','F',6], ['C','E',5], ['C','G',4],
            ['E','H',2], ['F','H',3], ['F','I',2], ['G','I',3],
            ['H','J',4], ['I','J',3],
            ['E','J',10], ['G','J',9]
          ]
          // Optimal around A-C-F-I-J = 2+3+2+3 = 10
        },
        {
          name: 'Airline Routes',
          nodes: {
            A: { x: 70,  y: 240 },
            B: { x: 230, y: 90 },
            C: { x: 230, y: 240 },
            D: { x: 230, y: 390 },
            E: { x: 430, y: 90 },
            F: { x: 430, y: 240 },
            G: { x: 430, y: 390 },
            H: { x: 630, y: 140 },
            I: { x: 630, y: 340 },
            J: { x: 820, y: 240 }
          },
          edges: [
            ['A','B',5], ['A','C',3], ['A','D',6],
            ['B','E',2], ['C','F',4], ['D','G',2],
            ['B','F',7], ['C','E',6], ['C','G',5], ['D','F',8],
            ['E','H',3], ['F','H',2], ['F','I',3], ['G','I',2],
            ['H','J',5], ['I','J',4],
            ['E','J',11], ['G','J',10], ['A','J',20]
          ]
          // Direct A-J = 20 is expensive; multi-hop is better
        },
        {
          name: 'Pipeline Network',
          nodes: {
            A: { x: 70,  y: 240 },
            B: { x: 210, y: 100 },
            C: { x: 210, y: 380 },
            D: { x: 370, y: 100 },
            E: { x: 370, y: 240 },
            F: { x: 370, y: 380 },
            G: { x: 550, y: 100 },
            H: { x: 550, y: 240 },
            I: { x: 550, y: 380 },
            J: { x: 760, y: 240 }
          },
          edges: [
            ['A','B',3], ['A','C',4], ['A','E',7],
            ['B','D',2], ['B','E',4],
            ['C','F',2], ['C','E',3],
            ['D','G',3], ['E','G',5], ['E','H',2], ['E','I',5], ['F','I',3],
            ['G','J',6], ['H','J',3], ['I','J',4],
            ['D','H',4], ['F','H',4]
          ]
        },
        {
          name: 'Maze Junctions',
          nodes: {
            A: { x: 80,  y: 400 },
            B: { x: 220, y: 280 },
            C: { x: 220, y: 420 },
            D: { x: 380, y: 140 },
            E: { x: 380, y: 280 },
            F: { x: 380, y: 420 },
            G: { x: 560, y: 140 },
            H: { x: 560, y: 280 },
            I: { x: 720, y: 200 },
            J: { x: 820, y: 360 }
          },
          edges: [
            ['A','B',2], ['A','C',3],
            ['B','D',6], ['B','E',3], ['C','E',4], ['C','F',2],
            ['D','G',2], ['E','G',5], ['E','H',2], ['F','H',4],
            ['G','I',3], ['H','I',4], ['H','J',3], ['F','J',8],
            ['I','J',2], ['D','I',7]
          ]
        },
        {
          name: 'Delivery Routes',
          nodes: {
            A: { x: 70,  y: 240 },
            B: { x: 230, y: 120 },
            C: { x: 230, y: 360 },
            D: { x: 400, y: 80 },
            E: { x: 400, y: 240 },
            F: { x: 400, y: 400 },
            G: { x: 580, y: 120 },
            H: { x: 580, y: 360 },
            I: { x: 740, y: 180 },
            J: { x: 820, y: 320 }
          },
          edges: [
            ['A','B',3], ['A','C',2],
            ['B','D',4], ['B','E',3],
            ['C','E',4], ['C','F',3],
            ['D','G',2], ['E','G',5], ['E','H',3], ['F','H',2],
            ['G','I',3], ['H','J',2], ['G','J',6], ['H','I',4],
            ['I','J',2], ['D','I',8], ['F','J',7]
          ]
        },
        {
          name: 'Power Grid',
          nodes: {
            A: { x: 80,  y: 240 },
            B: { x: 250, y: 90 },
            C: { x: 250, y: 240 },
            D: { x: 250, y: 390 },
            E: { x: 450, y: 90 },
            F: { x: 450, y: 240 },
            G: { x: 450, y: 390 },
            H: { x: 650, y: 150 },
            I: { x: 650, y: 330 },
            J: { x: 820, y: 240 }
          },
          edges: [
            ['A','B',2], ['A','C',5], ['A','D',3],
            ['B','E',4], ['C','F',2], ['D','G',4],
            ['B','F',6], ['C','E',3], ['C','G',3], ['D','F',5],
            ['E','H',2], ['F','H',4], ['F','I',3], ['G','I',2],
            ['H','J',5], ['I','J',3],
            ['E','J',12], ['G','J',11]
          ]
        }
      ]
    };

    // ── Graph selection ───────────────────────────────────────
    function generateGraph(level) {
      const pool = level === 1 ? MAP_LIBRARY.level1
                : level === 2 ? MAP_LIBRARY.level2
                : MAP_LIBRARY.level3;

      // Try a few random maps until we get a fully connected one
      // (all curated maps should already be connected)
      for (let attempt = 0; attempt < 20; attempt++) {
        const template = pick(pool);
        currentMapName = template.name;

        // Tiny position jitter only — NEVER change weights
        const nodes = {};
        Object.keys(template.nodes).forEach(id => {
          nodes[id] = {
            x: Math.max(50, Math.min(850, template.nodes[id].x + random(-6, 6))),
            y: Math.max(50, Math.min(430, template.nodes[id].y + random(-6, 6)))
          };
        });

        const g = buildGraph(nodes, template.edges);
        const ids = Object.keys(g);
        const start = ids[0];
        const target = ids[ids.length - 1];

        if (isFullyConnected(g, start) && isConnected(g, start, target)) {
          return g;
        }
      }

      // Absolute fallback: simple linear path (always works)
      currentMapName = 'Safe Path';
      const fallbackNodes = {
        A: { x: 100, y: 240 },
        B: { x: 280, y: 160 },
        C: { x: 460, y: 320 },
        D: { x: 640, y: 160 },
        E: { x: 820, y: 240 }
      };
      return buildGraph(fallbackNodes, [
        ['A','B',2], ['A','C',5],
        ['B','C',3], ['B','D',4],
        ['C','D',2], ['C','E',6],
        ['D','E',3]
      ]);
    }

    // ── Init Game ─────────────────────────────────────────────
    function initGame() {
      updateLevelSelectUI();

      gameActive = true; activeNode = null; neighborToRelax = null;
      relaxedSet = new Set(); winPath = []; steps = 0; mistakes = 0; hintUsed = false;

      if (relaxPanel)  relaxPanel.style.display = 'none';
      if (pathDisplay) pathDisplay.style.display = 'none';
      if (hintText)    hintText.textContent = '';
      if (currentEl)   currentEl.textContent = '—';
      if (stepsEl)     stepsEl.textContent   = '0';
      if (mistakesEl)  mistakesEl.textContent = '0';

      const unlocked = getUnlockedLevel();
      let level = parseInt(levelSelect.value) || 1;
      if (level > unlocked) {
        level = unlocked;
        levelSelect.value = String(unlocked);
      }

      graph = generateGraph(level);
      if (mapNameEl) mapNameEl.textContent = `Map: ${currentMapName}`;

      distances = {}; visited = {}; predecessors = {};
      const nodeIds = Object.keys(graph);
      startNode  = nodeIds[0];
      targetNode = nodeIds[nodeIds.length - 1];

      nodeIds.forEach(node => {
        distances[node]    = node === startNode ? 0 : Infinity;
        visited[node]      = false;
        predecessors[node] = null;
      });

      setStatus(`Your turn: click the purple node (smallest distance). Path ${startNode} → ${targetNode}.`);
      startTimer();
      renderGraph();
      updateQueueCount();
    }

    // ── Render ────────────────────────────────────────────────
    function getNodeState(node) {
      if (!gameActive && winPath.includes(node)) return 'path';
      if (node === targetNode && !visited[node] && node !== activeNode && node !== neighborToRelax) return 'target';
      if (visited[node]) return 'visited';
      if (node === activeNode) return 'active';
      if (node === neighborToRelax) return 'neighbor';

      // Highlight the correct next node while waiting for a pick
      if (gameActive && activeNode === null) {
        const next = getMinDistanceNode();
        if (next === node) return 'candidate';
      }

      if (node === startNode && !visited[node]) return 'start';
      return 'default';
    }

    function renderGraph() {
      if (!svgEl || !nodesContainer) return;
      while (svgEl.children.length > 1) svgEl.removeChild(svgEl.lastChild);
      nodesContainer.innerHTML = '';

      const pathEdgeSet = new Set();
      for (let i = 0; i < winPath.length - 1; i++) {
        const a = winPath[i], b = winPath[i + 1];
        pathEdgeSet.add(`${a}-${b}`);
        pathEdgeSet.add(`${b}-${a}`);
      }

      // Draw each undirected edge once
      undirectedEdgeList.forEach(([u, v, weight]) => {
        const uNode = graph[u];
        const vNode = graph[v];
        if (!uNode || !vNode) return;

        const isPath = pathEdgeSet.has(`${u}-${v}`);
        const isRelax = !!(activeNode && neighborToRelax &&
          ((u === activeNode && v === neighborToRelax) || (v === activeNode && u === neighborToRelax)));
        const dx = vNode.x - uNode.x, dy = vNode.y - uNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const r = 30;
        const x1 = uNode.x + (dx / dist) * r, y1 = uNode.y + (dy / dist) * r;
        const x2 = vNode.x - (dx / dist) * r, y2 = vNode.y - (dy / dist) * r;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1); line.setAttribute('y1', y1);
        line.setAttribute('x2', x2); line.setAttribute('y2', y2);

        if (isRelax) {
          line.setAttribute('stroke', '#ff007f');
          line.setAttribute('stroke-width', '3.5');
          // Arrow points from the active node toward the neighbour being relaxed
          if (u === activeNode) line.setAttribute('marker-end', 'url(#dij-m-end-relax)');
          else line.setAttribute('marker-start', 'url(#dij-m-start-relax)');
        } else if (isPath) {
          line.setAttribute('stroke', '#FFD700');
          line.setAttribute('stroke-width', '4');
          const uIdx = winPath.indexOf(u);
          const vIdx = winPath.indexOf(v);
          if (uIdx >= 0 && vIdx === uIdx + 1) line.setAttribute('marker-end', 'url(#dij-m-end-path)');
          else if (vIdx >= 0 && uIdx === vIdx + 1) line.setAttribute('marker-start', 'url(#dij-m-start-path)');
          else {
            line.setAttribute('marker-start', 'url(#dij-m-start-path)');
            line.setAttribute('marker-end', 'url(#dij-m-end-path)');
          }
        } else {
          line.setAttribute('stroke', 'rgba(255,255,255,0.22)');
          line.setAttribute('stroke-width', '2.5');
          line.setAttribute('marker-start', 'url(#dij-m-start)');
          line.setAttribute('marker-end', 'url(#dij-m-end)');
        }
        svgEl.appendChild(line);

        const mx = (uNode.x + vNode.x) / 2 + (-dy / dist) * 12;
        const my = (uNode.y + vNode.y) / 2 + ( dx / dist) * 12;

        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('x', mx - 11); bg.setAttribute('y', my - 12);
        bg.setAttribute('width', 22);  bg.setAttribute('height', 16);
        bg.setAttribute('rx', 4);
        bg.setAttribute('fill', isPath ? 'rgba(40,35,0,0.9)' : 'rgba(10,10,20,0.85)');
        svgEl.appendChild(bg);

        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', mx); txt.setAttribute('y', my);
        txt.setAttribute('fill', isPath ? '#FFD700' : '#fff');
        txt.setAttribute('font-size', '13');
        txt.setAttribute('font-family', 'monospace');
        txt.setAttribute('font-weight', isPath ? 'bold' : 'normal');
        txt.setAttribute('text-anchor', 'middle');
        txt.setAttribute('dominant-baseline', 'middle');
        txt.textContent = weight;
        svgEl.appendChild(txt);
      });

      // Nodes
      Object.keys(graph).forEach(node => {
        const n = graph[node];
        const state = getNodeState(node);
        const el = document.createElement('div');
        el.className = `dij-node state-${state}`;
        el.style.left = `${n.x - 29}px`;
        el.style.top  = `${n.y - 29}px`;

        const labelEl = document.createElement('div');
        labelEl.className = 'dij-node-label';
        labelEl.textContent = node;

        const distEl = document.createElement('div');
        distEl.className = 'dij-node-dist';
        distEl.textContent = distances[node] === Infinity ? '∞' : distances[node];

        el.appendChild(labelEl);
        el.appendChild(distEl);

        if (node === targetNode && state !== 'path') {
          const tag = document.createElement('div');
          tag.className = 'dij-node-tag';
          tag.textContent = 'TARGET';
          el.appendChild(tag);
        }
        if (node === startNode && (state === 'start' || state === 'candidate')) {
          const tag = document.createElement('div');
          tag.className = 'dij-node-tag';
          tag.style.color = 'var(--accent-cyan)';
          tag.textContent = 'START';
          el.appendChild(tag);
        }

        el.addEventListener('click', () => handleNodeClick(node));
        nodesContainer.appendChild(el);
      });

      renderDistanceTable();
    }

    function renderDistanceTable() {
      if (!distBodyEl) return;
      const nextPick = (gameActive && activeNode === null) ? getMinDistanceNode() : null;
      const ids = Object.keys(graph).sort();
      distBodyEl.innerHTML = ids.map(id => {
        const dist = distances[id] === Infinity ? '∞' : distances[id];
        const prev = predecessors[id] || '—';
        const done = visited[id] ? '✓' : '';
        let rowClass = '';
        if (!gameActive && winPath.includes(id)) rowClass = 'dij-row-path';
        else if (id === activeNode) rowClass = 'dij-row-active';
        else if (id === neighborToRelax) rowClass = 'dij-row-relax';
        else if (id === nextPick) rowClass = 'dij-row-next';
        else if (visited[id]) rowClass = 'dij-row-visited';
        const distClass = distances[id] === Infinity ? ' class="dij-inf"' : '';
        return `<tr class="${rowClass}"><td>${id}</td><td${distClass}>${dist}</td><td>${prev}</td><td>${done}</td></tr>`;
      }).join('');
    }

    // ── Game Logic ────────────────────────────────────────────
    function getMinDistanceNode() {
      let minVal = Infinity, minNode = null;
      Object.keys(graph).forEach(node => {
        if (!visited[node] && distances[node] < minVal) {
          minVal = distances[node];
          minNode = node;
        }
      });
      return minNode; // null only if all remaining nodes have ∞ (should not happen)
    }

    function getPendingNeighbors(node) {
      // Relax unvisited neighbours (including already-known ones still unvisited)
      return Object.keys(graph[node].neighbors).filter(v => !visited[v] && !relaxedSet.has(v));
    }

    function handleNodeClick(node) {
      if (!gameActive || activeNode !== null) return;

      const next = getMinDistanceNode();
      if (!next) {
        // Soft-lock safety: should never happen on curated connected maps
        setStatus('No reachable unvisited node. Click New Graph.', 'var(--accent-pink)');
        return;
      }

      if (node === next) {
        if (typeof sounds !== 'undefined' && sounds.playClick) sounds.playClick();
        activeNode = node;
        relaxedSet = new Set();
        steps++;
        if (stepsEl) stepsEl.textContent = steps;
        if (currentEl) currentEl.textContent = activeNode;

        const list = getPendingNeighbors(activeNode);
        if (list.length > 0) {
          startRelaxingNeighbors(list);
        } else {
          finaliseNode();
        }
        renderGraph();
        updateQueueCount();
      } else {
        mistakes++;
        if (mistakesEl) mistakesEl.textContent = mistakes;
        if (typeof sounds !== 'undefined' && sounds.playFailure) sounds.playFailure();
        const d = distances[next] === Infinity ? '∞' : distances[next];
        setStatus(
          `Wrong node. Click purple ${next} (dist = ${d}) — smallest first.`,
          'var(--accent-pink)'
        );
        triggerShake();
      }
    }

    function startRelaxingNeighbors(list) {
      // Sort neighbours alphabetically so order is stable/predictable
      list.sort();
      neighborToRelax = list[0];
      if (hintText) hintText.textContent = '';
      if (relaxPanel) relaxPanel.style.display = 'flex';

      const edgeCost = graph[activeNode].neighbors[neighborToRelax];
      const curDist  = distances[activeNode];
      const curNeigh = distances[neighborToRelax] === Infinity ? '∞' : distances[neighborToRelax];
      const newSum   = curDist + edgeCost;

      if (relaxText) {
        relaxText.innerHTML =
          `Relax neighbour <span class="eval-number">${neighborToRelax}</span><br>` +
          `dist(<b>${activeNode}</b>) + w(${activeNode}–${neighborToRelax}) = ` +
          `<span class="eval-number">${curDist}</span> + <span class="eval-number">${edgeCost}</span> = <span class="eval-number">${newSum}</span><br>` +
          `Current dist(<b>${neighborToRelax}</b>) = <span class="eval-number">${curNeigh}</span><br>` +
          `Enter <b>min(${curNeigh}, ${newSum})</b>:`;
      }
      if (relaxInput) { relaxInput.value = ''; relaxInput.focus(); }
      setStatus(`Type the new distance for ${neighborToRelax}, then press Enter.`, 'var(--accent-pink)');
      renderGraph();
    }

    function handleRelaxSubmit() {
      if (!neighborToRelax || !activeNode) return;
      const inputVal = parseInt(relaxInput.value);
      if (isNaN(inputVal)) {
        if (hintText) hintText.textContent = '⚠️ Please enter a number.';
        return;
      }

      const edgeCost = graph[activeNode].neighbors[neighborToRelax];
      const newDist  = distances[activeNode] + edgeCost;
      const oldDist  = distances[neighborToRelax] === Infinity ? Infinity : distances[neighborToRelax];
      const actual   = Math.min(oldDist, newDist);

      if (inputVal === actual) {
        if (typeof sounds !== 'undefined' && sounds.playSuccess) sounds.playSuccess();
        if (hintText) hintText.textContent = '';

        if (newDist < oldDist) {
          predecessors[neighborToRelax] = activeNode;
        }
        distances[neighborToRelax] = actual;
        relaxedSet.add(neighborToRelax);

        const list = getPendingNeighbors(activeNode);
        if (list.length > 0) {
          startRelaxingNeighbors(list);
        } else {
          finaliseNode();
        }
        renderGraph();
        updateQueueCount();
      } else {
        mistakes++;
        if (mistakesEl) mistakesEl.textContent = mistakes;
        if (typeof sounds !== 'undefined' && sounds.playFailure) sounds.playFailure();
        if (hintText) {
          hintText.textContent = `❌ Incorrect. Remember: min(current dist, active+edge).`;
        }
        setStatus('Wrong number. Recalculate min(current, active + edge).', 'var(--accent-pink)');
        relaxInput.value = '';
        relaxInput.focus();
        triggerShake();
      }
    }

    function finaliseNode() {
      visited[activeNode] = true;
      const justVisited = activeNode;
      activeNode = null;
      neighborToRelax = null;
      relaxedSet = new Set();
      if (relaxPanel) relaxPanel.style.display = 'none';
      if (hintText)   hintText.textContent = '';
      if (currentEl)  currentEl.textContent = '—';

      // Win as soon as target is settled (classic Dijkstra early stop)
      if (justVisited === targetNode || visited[targetNode]) {
        checkVictory();
        return;
      }

      // Soft-lock guard
      const next = getMinDistanceNode();
      if (!next) {
        gameActive = false;
        stopTimer();
        setStatus('No more reachable nodes. Graph error — click New Graph.', 'var(--accent-pink)');
        renderGraph();
        return;
      }

      setStatus(`Your turn: click the purple node (smallest distance).`);
      renderGraph();
      updateQueueCount();
    }

    function showHint() {
      if (typeof sounds !== 'undefined' && sounds.playClick) sounds.playClick();
      hintUsed = true;
      if (!gameActive) return;

      if (activeNode === null) {
        const next = getMinDistanceNode();
        if (next) {
          const d = distances[next] === Infinity ? '∞' : distances[next];
          setStatus(`Hint: click purple ${next} (dist = ${d}) — smallest first.`, 'var(--accent-purple)');
        }
      } else if (neighborToRelax) {
        const edgeCost = graph[activeNode].neighbors[neighborToRelax];
        const newDist  = distances[activeNode] + edgeCost;
        const actual   = Math.min(
          distances[neighborToRelax] === Infinity ? Infinity : distances[neighborToRelax],
          newDist
        );
        if (hintText) hintText.textContent = `💡 Answer = ${actual}`;
      }
    }

    function reconstructPath(target) {
      const path = [];
      let curr = target;
      const guard = new Set();
      while (curr !== null && !guard.has(curr)) {
        guard.add(curr);
        path.unshift(curr);
        curr = predecessors[curr];
      }
      return path;
    }

    function checkVictory() {
      if (!visited[targetNode]) return;
      gameActive = false;
      stopTimer();
      if (typeof sounds !== 'undefined' && sounds.playWin) sounds.playWin();

      winPath = reconstructPath(targetNode);
      renderGraph();

      const level   = parseInt(levelSelect.value) || 1;
      const base    = level === 1 ? 30 : level === 2 ? 50 : 80;
      const penalty = Math.min(mistakes * 3, base - 10);
      const bonus   = hintUsed ? 0 : 10;
      const reward  = Math.max(base - penalty + bonus, 10);

      setStatus(
        `🎉 Solved "${currentMapName}"! Distance to ${targetNode} = ${distances[targetNode]}  |  +${reward} pts  |  Time: ${formatTime(timerSeconds)}`,
        'var(--accent-green)'
      );

      if (pathDisplay) {
        pathDisplay.style.display = 'block';
        pathDisplay.innerHTML =
          `🏆 Shortest Path: <b>${winPath.join(' → ')}</b> &nbsp;|&nbsp; Distance: <b>${distances[targetNode]}</b>`;
      }

      showScorePopup(reward);

      if (typeof platformState !== 'undefined') {
        if (platformState.addScore) platformState.addScore(reward);
        if (level < 3 && platformState.unlockLevel) {
          platformState.unlockLevel('dijkstra', level + 1);
        }
      }
      updateLevelSelectUI();
    }

    function updateQueueCount() {
      const count = Object.keys(graph).filter(
        n => !visited[n] && distances[n] !== Infinity
      ).length;
      if (queueEl) queueEl.textContent = count;
    }

    function triggerShake() {
      const area = document.getElementById('dij-graph-area');
      if (!area) return;
      area.classList.add('shake');
      setTimeout(() => area.classList.remove('shake'), 420);
    }

    // ── Start ─────────────────────────────────────────────────
    updateLevelSelectUI();
    initGame();
  };
})();
