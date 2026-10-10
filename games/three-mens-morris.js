/**
 * Three Men's Morris - Classic abstract strategy game
 * Two players (P and A) take turns moving pieces
 * to form mills (3 in a row).
 */
(function () {
  window.initThreeMensMorris = function (container) {

    container.innerHTML = `
      <style>
        /* Instruction modal */
        .tmm-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .tmm-modal-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }

        .tmm-modal-content {
          position: relative;
          background: #121826;
          border: 1px solid var(--accent-cyan);
          border-radius: 16px;
          width: 90%;
          max-width: 520px;
          padding: 1.5rem;
          box-shadow: 0 0 35px rgba(0,242,254,0.35);
          transform: scale(0.8);
          transition: transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
          color: #fff;
        }

        .tmm-modal-overlay.open .tmm-modal-content {
          transform: scale(1);
        }

        .tmm-modal-close {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 1.5rem;
          cursor: pointer;
          transition: color 0.2s;
        }

        .tmm-modal-close:hover {
          color: var(--accent-pink);
        }

        .tmm-modal-title {
          font-size: 1.25rem;
          font-weight: bold;
          color: var(--accent-cyan);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .tmm-modal-steps {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .tmm-modal-step {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          background: rgba(255,255,255,0.03);
          padding: 0.75rem;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .tmm-modal-step-num {
          width: 24px;
          height: 24px;
          min-width: 24px;
          border-radius: 50%;
          background: var(--accent-cyan);
          color: #000;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          flex-shrink: 0;
        }

        .tmm-modal-gotit {
          background: linear-gradient(
            135deg,
            var(--accent-cyan),
            var(--accent-purple)
          );
          color: white;
          padding: 0.5rem 1.5rem;
          font-weight: bold;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          margin-top: 1.25rem;
          text-align: center;
        }

        /* Board container */
        .tmm-board-wrapper {
          width: 100%;
          max-width: 960px;
          margin: 2rem auto 0;
        }

        .tmm-status-panel {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .tmm-turn-indicator {
          font-size: 1rem;
          color: var(--text-primary);
        }

        .tmm-stage-badge {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-secondary);
        }

        .tmm-phase-text {
          font-size: 1.1rem;
          font-weight: bold;
          color: var(--accent-cyan);
        }

        .tmm-mode-select {
          padding: 0.5rem;
          font-size: 0.9rem;
        }

        /* Board */
        .tmm-board {
          position: relative;
          width: 320px;
          height: 320px;
          margin: 0 auto;
          background: rgba(0,0,0,0.2);
          border-radius: 16px;
          border: 1px solid var(--glass-border);
          padding: 10px;
        }

        .tmm-board svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        .tmm-node {
          position: absolute;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-family: var(--font-mono);
          color: #fff;
        }

        .tmm-node:hover {
          transform: scale(1.15);
        }

        .tmm-node.empty {
          background: rgba(10,10,30,0.95);
          border: 2px solid rgba(255,255,255,0.25);
        }

        .tmm-node.player {
          background: #18E0FF;
          border: 2px solid white;
          box-shadow: 0 0 18px rgba(24,224,255,0.85);
        }

        .tmm-node.ai {
          background: #B45CFF;
          border: 2px solid white;
          box-shadow: 0 0 18px rgba(180,92,255,0.85);
        }

        .tmm-node.selected {
          transform: scale(1.2);
          border-color: #FF4FD8;
        }

        .tmm-legend {
          display: flex;
          gap: 2rem;
          justify-content: center;
          margin: 1rem 0;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .tmm-legend div {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
      </style>

      <div class="tmm-board-wrapper">

        <div class="tmm-status-panel">

          <div class="tmm-turn-indicator">
            <span id="tmm-status">Your Turn</span>
            <span id="tmm-phase-text" class="tmm-phase-text">Stage 1</span>
            <span id="tmm-turn-badge" class="tmm-turn-badge">Player 1</span>
          </div>

          <div>
            <select id="tmm-mode" class="tmm-mode-select">
              <option value="ai">VS AI</option>
              <option value="pvp">2 Players Local</option>
            </select>
          </div>

          <button
            id="tmm-reset"
            class="btn btn-secondary"
            style="padding: 0.5rem 1rem;"
          >
            Reset Game
          </button>

        </div>

        <div class="tmm-board">
          <svg>

            <line
              x1="30"
              y1="30"
              x2="250"
              y2="30"
              stroke="rgba(255,255,255,0.35)"
              stroke-width="3"
            />

            <line
              x1="30"
              y1="140"
              x2="250"
              y2="140"
              stroke="rgba(255,255,255,0.35)"
              stroke-width="3"
            />

            <line
              x1="30"
              y1="250"
              x2="250"
              y2="250"
              stroke="rgba(255,255,255,0.35)"
              stroke-width="3"
            />

            <line
              x1="30"
              y1="30"
              x2="30"
              y2="250"
              stroke="rgba(255,255,255,0.35)"
              stroke-width="3"
            />

            <line
              x1="140"
              y1="30"
              x2="140"
              y2="250"
              stroke="rgba(255,255,255,0.35)"
              stroke-width="3"
            />

            <line
              x1="250"
              y1="30"
              x2="250"
              y2="250"
              stroke="rgba(255,255,255,0.35)"
              stroke-width="3"
            />

            <line
              x1="30"
              y1="30"
              x2="250"
              y2="250"
              stroke="rgba(255,255,255,0.15)"
              stroke-width="2"
            />

            <line
              x1="250"
              y1="30"
              x2="30"
              y2="250"
              stroke="rgba(255,255,255,0.15)"
              stroke-width="2"
            />

          </svg>

          <div id="tmm-nodes-container"></div>
        </div>

        <div class="tmm-legend">

          <div>
            <div
              style="
                width:12px;
                height:12px;
                border-radius:50%;
                background:#18E0FF;
                border:2px solid white;
              "
            ></div>
            Player 1 (P)
          </div>

          <div>
            <div
              style="
                width:12px;
                height:12px;
                border-radius:50%;
                background:#B45CFF;
                border:2px solid white;
              "
            ></div>
            AI (A)
          </div>

          <div>
            <div
              style="
                width:12px;
                height:12px;
                border-radius:50%;
                background:white;
              "
            ></div>
            Empty
          </div>

        </div>

      </div>

      <div id="tmm-modal" class="tmm-modal-overlay">

        <div class="tmm-modal-content">

          <button
            id="tmm-modal-close"
            class="tmm-modal-close"
          >
            &times;
          </button>

          <div class="tmm-modal-title">
            📋 How to Play Three Men's Morris
          </div>

          <div
            class="tmm-modal-steps"
            id="tmm-modal-steps-container"
          ></div>

          <div style="margin-top: 1.25rem; text-align: center;">
            <button
              id="tmm-modal-gotit"
              class="tmm-modal-gotit"
            >
              Got it!
            </button>
          </div>

        </div>

      </div>
    `;

    const statusEl = document.getElementById('tmm-status');
    const phaseEl = document.getElementById('tmm-phase-text');
    const resetBtn = document.getElementById('tmm-reset');
    const nodesContainer = document.getElementById('tmm-nodes-container');
    const modeSelect = document.getElementById('tmm-mode');

    const nodeCoords = [
      { x: 30, y: 30 },
      { x: 140, y: 30 },
      { x: 250, y: 30 },
      { x: 30, y: 140 },
      { x: 140, y: 140 },
      { x: 250, y: 140 },
      { x: 30, y: 250 },
      { x: 140, y: 250 },
      { x: 250, y: 250 }
    ];

    const adj = [
      [1, 3, 4],
      [0, 2, 4],
      [1, 4, 5],
      [0, 4, 6],
      [0, 1, 2, 3, 5, 6, 7, 8],
      [2, 4, 8],
      [3, 4, 7],
      [6, 4, 8],
      [5, 4, 7]
    ];

    const winLines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];

    const startLayout = {
      P: [6, 7, 8],
      A: [0, 1, 2]
    };

    let board = Array(9).fill('');
    let currentTurn = 'P';
    let selectedNode = null;
    let gameActive = true;
    let gameMode = 'ai';
    let moveCounter = 0;
    let gameStage = 1;
    let playerName = 'Player 1';

    resetBtn.addEventListener('click', () => {

      if (
        typeof sounds !== 'undefined' &&
        sounds.playClick
      ) {
        sounds.playClick();
      }

      resetGame();
    });

    modeSelect.addEventListener('change', () => {

      gameMode = modeSelect.value;

      resetGame();
    });

    function resetGame() {

      board = Array(9).fill('');

      startLayout.P.forEach(i => {
        board[i] = 'P';
      });

      startLayout.A.forEach(i => {
        board[i] = 'A';
      });

      currentTurn = 'P';
      selectedNode = null;
      gameActive = true;
      moveCounter = 0;
      gameStage = 1;

      phaseEl.textContent = 'Stage 1';

      playerName =
        modeSelect.value === 'pvp'
          ? 'Player 1'
          : 'You';

      statusEl.textContent =
        gameMode === 'pvp'
          ? 'Player 1 Turn'
          : 'Your Turn';

      statusEl.style.color =
        'var(--text-primary)';

      renderBoard();
    }

    function renderBoard() {

      nodesContainer.innerHTML = '';

      nodeCoords.forEach((coord, i) => {

        const dot =
          document.createElement('div');

        dot.style.position =
          'absolute';

        dot.style.left =
          `${coord.x - 18}px`;

        dot.style.top =
          `${coord.y - 18}px`;

        dot.style.width =
          '36px';

        dot.style.height =
          '36px';

        dot.style.borderRadius =
          '50%';

        dot.style.cursor =
          gameActive
            ? 'pointer'
            : 'default';

        dot.style.transition =
          'all 0.2s ease';

        dot.style.display =
          'flex';

        dot.style.alignItems =
          'center';

        dot.style.justifyContent =
          'center';

        dot.style.fontWeight =
          'bold';

        if (board[i] === '') {

          dot.style.background =
            'rgba(10,10,30,0.95)';

          dot.style.border =
            '2px solid rgba(255,255,255,0.25)';

          dot.style.color =
            '#fff';

        }

        else if (board[i] === 'P') {

          dot.style.background =
            '#18E0FF';

          dot.style.border =
            '2px solid white';

          dot.style.boxShadow =
            '0 0 18px rgba(24,224,255,0.85)';

          dot.style.color =
            '#000';

        }

        else {

          dot.style.background =
            gameMode === 'pvp'
              ? '#FF9B2F'
              : '#B45CFF';

          dot.style.border =
            '2px solid white';

          dot.style.boxShadow =
            gameMode === 'pvp'
              ? '0 0 18px rgba(255,155,47,0.85)'
              : '0 0 18px rgba(180,92,255,0.85)';

          dot.style.color =
            '#000';

        }

        if (selectedNode === i) {

          dot.style.transform =
            'scale(1.2)';

          dot.style.borderColor =
            '#FF4FD8';

          dot.style.boxShadow =
            '0 0 20px rgba(255,20,200,0.9)';

        }

        dot.textContent =
          board[i] || '';

        dot.addEventListener(
          'click',
          () => {
            handleNodeClick(i);
          }
        );

        nodesContainer.appendChild(dot);

      });
    }

    function handleNodeClick(idx) {

      if (!gameActive) return;

      if (
        gameMode === 'ai' &&
        currentTurn === 'A'
      ) return;

      const currentPlayer =
        currentTurn;

      if (selectedNode === null) {

        if (
          board[idx] === currentPlayer
        ) {

          selectedNode = idx;

          if (
            typeof sounds !== 'undefined' &&
            sounds.playClick
          ) {
            sounds.playClick();
          }

          renderBoard();
        }

        return;
      }

      if (
        board[idx] === currentPlayer
      ) {

        selectedNode = idx;

        if (
          typeof sounds !== 'undefined' &&
          sounds.playClick
        ) {
          sounds.playClick();
        }

        renderBoard();

        return;
      }

      if (
        board[idx] === '' &&
        adj[selectedNode].includes(idx)
      ) {

        board[idx] =
          currentPlayer;

        board[selectedNode] =
          '';

        selectedNode =
          null;

        moveCounter++;

        if (
          typeof sounds !== 'undefined' &&
          sounds.playClick
        ) {
          sounds.playClick();
        }

        // Render final move first
        renderBoard();

        if (
          checkWin(currentPlayer)
        ) {

          endGame(currentPlayer);

          return;
        }

        advanceStage();

        switchTurn();

        if (
          gameMode === 'ai' &&
          currentTurn === 'A'
        ) {

          statusEl.textContent =
            'AI is thinking...';

          setTimeout(() => {

            if (!gameActive) return;

            aiMove();

          }, 500);
        }

      }

      else {

        selectedNode =
          null;

        if (
          typeof sounds !== 'undefined' &&
          sounds.playTone
        ) {

          sounds.playTone(
            150,
            'triangle',
            0.15
          );
        }

        renderBoard();
      }
    }

    function aiMove() {

      let possibleMoves = [];

      for (
        let from = 0;
        from < 9;
        from++
      ) {

        if (
          board[from] === 'A'
        ) {

          for (
            let to of adj[from]
          ) {

            if (
              board[to] === ''
            ) {

              possibleMoves.push({
                from,
                to
              });

            }
          }
        }
      }

      if (
        possibleMoves.length === 0
      ) return;

      let bestMove =
        null;

      for (
        let move of possibleMoves
      ) {

        board[move.from] =
          '';

        board[move.to] =
          'A';

        if (
          checkWin('A')
        ) {
          bestMove =
            move;
        }

        board[move.from] =
          'A';

        board[move.to] =
          '';

        if (bestMove) break;
      }

      if (!bestMove) {

        bestMove =
          possibleMoves[
            Math.floor(
              Math.random() *
              possibleMoves.length
            )
          ];
      }

      board[bestMove.from] =
        '';

      board[bestMove.to] =
        'A';

      moveCounter++;

      if (
        typeof sounds !== 'undefined' &&
        sounds.playClick
      ) {
        sounds.playClick();
      }

      // Render final AI move first
      renderBoard();

      if (
        checkWin('A')
      ) {

        endGame('A');

        return;
      }

      advanceStage();

      currentTurn =
        'P';

      statusEl.textContent =
        'Your Turn';

      renderBoard();
    }

    function checkWin(player) {

      return winLines.some(line => {

        const isStartingLine =

          (
            line[0] === 0 &&
            line[1] === 1 &&
            line[2] === 2
          )

          ||

          (
            line[0] === 6 &&
            line[1] === 7 &&
            line[2] === 8
          );

        if (isStartingLine) {
          return false;
        }

        return line.every(idx => {
          return board[idx] === player;
        });

      });
    }

    function advanceStage() {

      if (
        gameStage === 1 &&
        moveCounter >= 4
      ) {

        gameStage =
          2;

        phaseEl.textContent =
          'Stage 2';

        statusEl.textContent =
          'Mid Game - Control the center!';

      }

      else if (
        gameStage === 2 &&
        moveCounter >= 10
      ) {

        gameStage =
          3;

        phaseEl.textContent =
          'Stage 3';

        statusEl.textContent =
          'Final Battle!';

      }
    }

    function switchTurn() {

      if (
        currentTurn === 'P'
      ) {

        currentTurn =
          'A';

        statusEl.textContent =
          gameMode === 'pvp'
            ? 'Player 2 Turn'
            : 'AI Turn';

      }

      else {

        currentTurn =
          'P';

        statusEl.textContent =
          gameMode === 'pvp'
            ? 'Player 1 Turn'
            : 'Your Turn';

      }
    }

    function endGame(winner) {

      gameActive =
        false;

      // Award the learner's shared-platform score after a Player 1 win.
      const sharedPlatformState =
        typeof platformState !== 'undefined'
          ? platformState
          : window.platformState;

      if (
        winner === 'P' &&
        sharedPlatformState &&
        typeof sharedPlatformState.addScore === 'function'
      ) {
        sharedPlatformState.addScore(20);
      }

      // Keep final board visible
      renderBoard();

      if (
        winner === 'P'
      ) {

        if (
          typeof sounds !== 'undefined' &&
          sounds.playWin
        ) {
          sounds.playWin();
        }

        statusEl.textContent =
          gameMode === 'pvp'
            ? '🎉 Player 1 Wins!'
            : '🎉 You Win!';

        statusEl.style.color =
          '#00FF99';

      }

      else {

        if (
          gameMode === 'pvp'
        ) {

          if (
            typeof sounds !== 'undefined' &&
            sounds.playWin
          ) {
            sounds.playWin();
          }

          statusEl.textContent =
            '🎉 Player 2 Wins!';

          statusEl.style.color =
            '#FFA43B';

        }

        else {

          if (
            typeof sounds !== 'undefined' &&
            sounds.playFailure
          ) {
            sounds.playFailure();
          }

          statusEl.textContent =
            '❌ AI Wins!';

          statusEl.style.color =
            '#FF4FD8';

        }
      }
    }

    const tmmModal =
      document.getElementById(
        'tmm-modal'
      );

    const tmmModalSteps =
      document.getElementById(
        'tmm-modal-steps-container'
      );

    const tmmModalClose =
      document.getElementById(
        'tmm-modal-close'
      );

    const tmmModalGotit =
      document.getElementById(
        'tmm-modal-gotit'
      );

    const tmmInstructions = [
      'The board has 9 intersections connected by lines. Each player has 3 pieces.',
      'Stage 1: Pieces start on opposite edges. Player 1 (cyan) moves first.',
      'Click a piece to select it, then click an adjacent empty node to move.',
      'Stage 2: After 4 moves, pieces can move more freely. Control the center!',
      "Stage 3: After 10 moves, it's the final battle. Form a line of 3 to win!",
      'Win by getting 3 pieces in a row (horizontal, vertical, or diagonal).',
      "Starting lines (top/bottom rows) don't count as wins until pieces move."
    ];

    function openTmmModal() {

      if (
        !tmmModal ||
        !tmmModalSteps
      ) {
        return;
      }

      tmmModalSteps.innerHTML =
        '';

      tmmInstructions.forEach(
        (text, i) => {

          const div =
            document.createElement('div');

          div.className =
            'tmm-modal-step';

          div.innerHTML = `
            <div class="tmm-modal-step-num">
              ${i + 1}
            </div>

            <div>
              ${text}
            </div>
          `;

          tmmModalSteps.appendChild(
            div
          );
        }
      );

      tmmModal.classList.add(
        'open'
      );

      if (
        typeof sounds !== 'undefined' &&
        sounds.playClick
      ) {
        sounds.playClick();
      }
    }

    function closeTmmModal() {

      if (!tmmModal) {
        return;
      }

      tmmModal.classList.remove(
        'open'
      );

      if (
        typeof sounds !== 'undefined' &&
        sounds.playClick
      ) {
        sounds.playClick();
      }
    }

    if (tmmModalClose) {

      tmmModalClose.addEventListener(
        'click',
        closeTmmModal
      );
    }

    if (tmmModalGotit) {

      tmmModalGotit.addEventListener(
        'click',
        closeTmmModal
      );
    }

    if (tmmModal) {

      tmmModal.addEventListener(
        'click',
        (e) => {

          if (
            e.target === tmmModal
          ) {
            closeTmmModal();
          }

        }
      );
    }

    // =========================================
    // START GAME
    // =========================================

    resetGame();

    // Instruction popup does NOT open automatically.
    // If you later add an Instructions button,
    // call openTmmModal() from that button.

  };
})();
