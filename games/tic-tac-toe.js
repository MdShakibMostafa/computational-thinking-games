(function () {
  window.initTicTacToe = function (container) {
    container.innerHTML = `
      <div class="ttt-container">
        <div class="ttt-controls">
          <select id="ttt-mode" class="mode-select">
            <option value="minimax">
              VS Minimax AI (Impossible)
            </option>
            <option value="easy">
              VS Easy AI (Random)
            </option>
            <option value="pvp">
              Player vs Player (Local)
            </option>
          </select>

          <button
            id="ttt-reset"
            class="btn btn-secondary"
          >
            Reset Game
          </button>
        </div>

        <div class="ttt-status" id="ttt-status">
          Your turn (X)
        </div>

        <div class="ttt-grid" id="ttt-grid">
          <div class="ttt-cell" data-idx="0"></div>
          <div class="ttt-cell" data-idx="1"></div>
          <div class="ttt-cell" data-idx="2"></div>
          <div class="ttt-cell" data-idx="3"></div>
          <div class="ttt-cell" data-idx="4"></div>
          <div class="ttt-cell" data-idx="5"></div>
          <div class="ttt-cell" data-idx="6"></div>
          <div class="ttt-cell" data-idx="7"></div>
          <div class="ttt-cell" data-idx="8"></div>
        </div>

        <div class="ttt-evaluation-panel">
          <h3>Minimax Candidate Move Scores</h3>

          <div
            id="ttt-tree-log"
            class="tree-visualizer"
          >
            <div>
              Start playing to see evaluations...
            </div>
          </div>
        </div>
      </div>
    `;

    const grid = document.getElementById('ttt-grid');
    const cells = grid.querySelectorAll('.ttt-cell');
    const statusEl = document.getElementById('ttt-status');
    const modeSelect = document.getElementById('ttt-mode');
    const resetBtn = document.getElementById('ttt-reset');
    const treeLog = document.getElementById('ttt-tree-log');

    let board = Array(9).fill('');
    let currentPlayer = 'X';
    let gameActive = true;

    cells.forEach((cell) => {
      cell.addEventListener('click', () => {
        if (!gameActive) {
          return;
        }

        const idx = parseInt(
          cell.getAttribute('data-idx'),
          10
        );

        if (board[idx] !== '') {
          sounds.playTone(150, 'triangle', 0.15);
          cell.classList.add('shake');

          setTimeout(() => {
            cell.classList.remove('shake');
          }, 400);

          return;
        }

        makeMove(idx, currentPlayer);

        if (
          gameActive &&
          modeSelect.value !== 'pvp'
        ) {
          currentPlayer = 'O';
          statusEl.textContent = 'AI is thinking...';
          grid.style.pointerEvents = 'none';

          setTimeout(() => {
            if (!gameActive) {
              grid.style.pointerEvents = 'auto';
              return;
            }

            aiMove();
            grid.style.pointerEvents = 'auto';
          }, 400);
        }
      });
    });

    resetBtn.addEventListener('click', () => {
      sounds.playClick();
      resetGame();
    });

    modeSelect.addEventListener('change', () => {
      sounds.playClick();
      resetGame();
      updateEvaluationPanel();
    });

    function updateEvaluationPanel() {
      if (!treeLog) {
        return;
      }

      if (modeSelect.value === 'minimax') {
        treeLog.innerHTML =
          '<div>Start playing to see evaluations...</div>';
      } else if (modeSelect.value === 'easy') {
        treeLog.innerHTML =
          '<div>Easy AI selects a random available move.</div>';
      } else {
        treeLog.innerHTML =
          '<div>Candidate scores are not used in local PvP mode.</div>';
      }
    }

    function resetGame() {
      board = Array(9).fill('');
      currentPlayer = 'X';
      gameActive = true;

      statusEl.textContent = 'Your turn (X)';
      statusEl.style.color = 'var(--text-primary)';
      grid.style.pointerEvents = 'auto';

      cells.forEach((cell) => {
        cell.textContent = '';
        cell.className = 'ttt-cell';
      });

      updateEvaluationPanel();
    }

    function makeMove(idx, player) {
      board[idx] = player;

      const cell = cells[idx];
      cell.textContent = player;
      cell.classList.add(player.toLowerCase());

      sounds.playClick();

      if (checkWin(board, player)) {
        endGame(player);
        return;
      }

      if (board.every((value) => value !== '')) {
        endGame('Draw');
        return;
      }

      if (modeSelect.value === 'pvp') {
        currentPlayer =
          currentPlayer === 'X' ? 'O' : 'X';

        statusEl.textContent =
          `Player ${currentPlayer}'s turn`;
      } else {
        currentPlayer =
          player === 'X' ? 'O' : 'X';
      }
    }

    function endGame(result) {
      gameActive = false;

      if (result === 'Draw') {
        statusEl.textContent = "It's a draw!";
        statusEl.style.color =
          'var(--text-secondary)';

        sounds.playSuccess();

        if (modeSelect.value === 'minimax') {
          platformState.addScore(15);
          sounds.playWin();
        }

        return;
      }

      if (result === 'X') {
        statusEl.textContent =
          modeSelect.value === 'pvp'
            ? 'Player X Wins!'
            : 'You Win!';

        statusEl.style.color =
          'var(--accent-cyan)';

        sounds.playWin();

        const points =
          modeSelect.value === 'easy' ? 10 : 30;

        platformState.addScore(points);
        platformState.stats['tic-tac-toe'].wins += 1;
        platformState.save();

        return;
      }

      statusEl.textContent =
        modeSelect.value === 'pvp'
          ? 'Player O Wins!'
          : 'AI Wins!';

      statusEl.style.color =
        'var(--accent-purple)';

      sounds.playFailure();

      if (modeSelect.value !== 'pvp') {
        platformState.stats[
          'tic-tac-toe'
        ].losses += 1;

        platformState.save();
      }
    }

    function checkWin(currentBoard, player) {
      const winConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
      ];

      return winConditions.some((combination) => {
        return combination.every((idx) => {
          return currentBoard[idx] === player;
        });
      });
    }

    function getEmptyIndices(currentBoard) {
      return currentBoard
        .map((value, idx) => {
          return value === '' ? idx : null;
        })
        .filter((value) => value !== null);
    }

    function aiMove() {
      const mode = modeSelect.value;
      let chosenIdx;

      if (mode === 'easy') {
        const emptyPositions =
          getEmptyIndices(board);

        chosenIdx =
          emptyPositions[
            Math.floor(
              Math.random() * emptyPositions.length
            )
          ];

        if (treeLog) {
          treeLog.innerHTML = `
            <div style="color: var(--accent-purple)">
              Easy AI selected random position:
              ${chosenIdx}
            </div>
          `;
        }
      } else {
        chosenIdx = getBestMove();
      }

      if (chosenIdx !== undefined) {
        makeMove(chosenIdx, 'O');
      }
    }

    function getBestMove() {
      let bestValue = -Infinity;
      let bestMove;

      const emptyPositions =
        getEmptyIndices(board);

      if (treeLog) {
        treeLog.innerHTML = `
          <div
            style="
              border-bottom: 1px solid
                var(--glass-border);
              padding-bottom: 4px;
              margin-bottom: 4px;
              font-weight: bold;
              color: var(--accent-cyan);
            "
          >
            Minimax Search: Root Moves
          </div>
        `;
      }

      for (const move of emptyPositions) {
        board[move] = 'O';

        const moveValue =
          minimaxEval(board, 0, false);

        board[move] = '';

        if (treeLog) {
          const scoreClass =
            moveValue > 0
              ? 'positive'
              : moveValue < 0
                ? 'negative'
                : '';

          const scoreText =
            moveValue > 0
              ? `+${moveValue}`
              : moveValue;

          treeLog.innerHTML += `
            <div class="tree-node evaluation">
              Move at index ${move}:
              <span
                class="score-badge ${scoreClass}"
              >
                ${scoreText}
              </span>
            </div>
          `;
        }

        if (moveValue > bestValue) {
          bestValue = moveValue;
          bestMove = move;
        }
      }

      if (treeLog) {
        const displayedBestValue =
          bestValue > 0
            ? `+${bestValue}`
            : bestValue;

        treeLog.innerHTML += `
          <div
            style="
              margin-top: 0.5rem;
              color: var(--accent-purple);
              font-weight: bold;
            "
          >
            Best Choice: Index ${bestMove}
            (Score: ${displayedBestValue})
          </div>
        `;

        treeLog.scrollTop =
          treeLog.scrollHeight;
      }

      return bestMove;
    }

    function minimaxEval(
      currentBoard,
      depth,
      isMaximizing
    ) {
      if (checkWin(currentBoard, 'O')) {
        return 10 - depth;
      }

      if (checkWin(currentBoard, 'X')) {
        return depth - 10;
      }

      if (
        currentBoard.every(
          (value) => value !== ''
        )
      ) {
        return 0;
      }

      const emptyPositions =
        getEmptyIndices(currentBoard);

      if (isMaximizing) {
        let maximumValue = -Infinity;

        for (const move of emptyPositions) {
          currentBoard[move] = 'O';

          maximumValue = Math.max(
            maximumValue,
            minimaxEval(
              currentBoard,
              depth + 1,
              false
            )
          );

          currentBoard[move] = '';
        }

        return maximumValue;
      }

      let minimumValue = Infinity;

      for (const move of emptyPositions) {
        currentBoard[move] = 'X';

        minimumValue = Math.min(
          minimumValue,
          minimaxEval(
            currentBoard,
            depth + 1,
            true
          )
        );

        currentBoard[move] = '';
      }

      return minimumValue;
    }

    updateEvaluationPanel();
  };
})();