/**
 * Chess Game - Classic board game
 * Three color themes: Standard (White/Black), Red/Green, Cream/Beige
 * Three modes: Player vs Player, AI vs Player (Medium), AI vs Player (Hard)
 * Full international (FIDE) chess rules:
 *   - 16 pieces per side
 *   - King, Queen, Rook, Bishop, Knight, Pawn movement
 *   - Castling (O-O / O-O-O)
 *   - En passant
 *   - Pawn promotion (Q / R / B / N)
 *   - Check, Checkmate, Stalemate
 *   - Insufficient material, threefold repetition, fifty-move rule
 *   - Algebraic notation (e4, Nf3, O-O, e8=Q, ...)
 */

(function () {
  window.initChess = function (container) {
    container.innerHTML = `
      <style>
        /* Chess Board */
        .chess-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          width: 100%;
          max-width: 1050px;
          margin: 0 auto;
          padding: 1rem;
        }

        .chess-board-container {
          position: relative;
          padding: 8px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          border: 1px solid var(--glass-border);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
        }

        .chess-board-grid {
          display: grid;
          grid-template-columns: repeat(8, 64px);
          grid-template-rows: repeat(8, 64px);
          gap: 0;
          overflow: hidden;
          border-radius: 8px;
          border: 2px solid #1a1a1a;
        }

        .chess-square {
          position: relative;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          user-select: none;
          transition: background-color 0.25s ease, box-shadow 0.25s ease;
        }

        /* Theme 1: Standard (White/Black) */
        .theme-standard .chess-square.light { background-color: #e9edf0; color: #2b2b2b; }
        .theme-standard .chess-square.dark { background-color: #2b2b2b; color: #e9edf0; }
        .theme-standard .chess-piece.white { color: #ffffff; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.7)); }
        .theme-standard .chess-piece.black { color: #1a1a1a; filter: drop-shadow(0 2px 3px rgba(255,255,255,0.7)); }

        /* Theme 2: Red (Red/Green) */
        .theme-red .chess-square.light { background-color: #ffe0e0; color: #8b0000; }
        .theme-red .chess-square.dark { background-color: #8b0000; color: #ffe0e0; }
        .theme-red .chess-piece.red { color: #ff0000; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.5)); }
        .theme-red .chess-piece.green { color: #006400; filter: drop-shadow(0 2px 3px rgba(255,255,255,0.5)); }

        /* Theme 3: Cream/Beige (Light Cream / Warm Beige) */
        .theme-cream-beige .chess-square.light { background-color: #FBEBC1; color: #9D6C3E; }
        .theme-cream-beige .chess-square.dark { background-color: #9D6C3E; color: #FBEBC1; }
        .theme-cream-beige .chess-piece.cream { color: #FDF3D0; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.6)); }
        .theme-cream-beige .chess-piece.beige { color: #4A3520; filter: drop-shadow(0 2px 3px rgba(255,255,255,0.6)); }

        /* Theme 4: Blue */
        .theme-blue .chess-square.light { background-color: #E9F1F7; color: #263D57; }
        .theme-blue .chess-square.dark { background-color: #B9D6E8; color: #263D57; }
        .theme-blue .chess-piece.white { color: #FFF8E8; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.7)); }
        .theme-blue .chess-piece.black { color: #263D57; filter: drop-shadow(0 2px 3px rgba(255,255,255,0.5)); }

        /* Theme 5: Green */
        .theme-green .chess-square.light { background-color: #EBECD0; color: #739552; }
        .theme-green .chess-square.dark { background-color: #739552; color: #F5F5F5; }
        .theme-green .chess-piece.white { color: #F5F5F5; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.4)); }
        .theme-green .chess-piece.black { color: #333333; filter: drop-shadow(0 2px 3px rgba(255,255,255,0.5)); }

        .chess-square.light:hover { background-color: #f1f3f5; }
        .chess-square.dark:hover { background-color: #3b3b3b; }

        .chess-square.selected {
          background-color: rgba(255, 235, 59, 0.45) !important;
          box-shadow: inset 0 0 10px rgba(255, 235, 59, 0.6);
        }

        .chess-square.legal-move::before {
          content: "";
          position: absolute;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: rgba(0, 242, 254, 0.75);
          box-shadow: var(--shadow-glow-cyan);
          pointer-events: none;
        }

        .chess-square.legal-capture::before {
          content: "";
          position: absolute;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 3px solid rgba(255, 80, 80, 0.7);
          box-shadow: 0 0 8px rgba(255, 80, 80, 0.5);
          pointer-events: none;
        }

        .chess-square.last-move-from,
        .chess-square.last-move-to {
          background-color: rgba(155, 199, 0, 0.35) !important;
        }

        .chess-piece {
          font-size: 3.2rem;
          line-height: 1;
          z-index: 5;
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        .chess-piece:hover { transform: scale(1.1); }

        .chess-side-panel {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 280px;
          flex-shrink: 0;
        }

        .chess-box {
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .chess-box-title {
          font-size: 0.85rem;
          font-family: var(--font-mono);
          text-transform: uppercase;
          color: var(--text-secondary);
          letter-spacing: 0.05em;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding-bottom: 0.35rem;
        }

        .move-history-container {
          height: 180px;
          overflow-y: auto;
          font-family: var(--font-mono);
          font-size: 0.82rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          padding-right: 0.2rem;
        }

        .move-history-item {
          display: flex;
          justify-content: space-between;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          background: rgba(255,255,255,0.03);
          color: var(--text-secondary);
        }

        .color-selector {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .color-btn {
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          cursor: pointer;
          border: 2px solid transparent;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          transition: all 0.2s;
        }

        .color-btn.standard { background: linear-gradient(135deg, #e9edf0, #2b2b2b); color: white; }
        .color-btn.red { background: linear-gradient(135deg, #ffe0e0, #8b0000); color: white; }
        .color-btn.cream { background: linear-gradient(135deg, #FBEBC1, #9D6C3E); color: #FFF8E7; }
        .color-btn.blue { background: linear-gradient(135deg, #E9F1F7, #B9D6E8); color: #263D57; }
        .color-btn.green { background: linear-gradient(135deg, #EBECD0, #739552); color: #333333; }
        .color-btn:hover { transform: scale(1.05); }
        .color-btn.active { border-color: var(--accent-cyan); box-shadow: 0 0 10px rgba(0,242,254,0.5); }

        .chess-meta {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
      </style>

      <div class="chess-wrapper theme-standard" id="chess-theme-container">

        <!-- Top Controls Header -->
        <div class="ttt-controls" style="display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; align-items: center;">
          <div class="color-selector">
            <button class="color-btn standard active" data-theme="standard">Standard (White/Black)</button>
            <button class="color-btn red" data-theme="red">Red/Green</button>
            <button class="color-btn cream" data-theme="cream-beige">Cream/Beige</button>
            <button class="color-btn blue" data-theme="blue">Blue</button>
            <button class="color-btn green" data-theme="green">Green</button>
          </div>
          <select id="chess-mode" class="mode-select" style="margin: 0 0.5rem; padding: 0.4rem 0.8rem; border-radius: 6px; background: var(--glass-bg); color: var(--text-primary); border: 1px solid var(--glass-border);">
            <option value="pvp">Player vs Player</option>
            <option value="ai-medium">AI vs Player (Medium)</option>
            <option value="ai-hard">AI vs Player (Hard)</option>
          </select>
          <button id="chess-reset" class="btn btn-secondary" style="font-size:0.85rem; padding: 0.45rem 0.9rem;">🔄 Reset Game</button>
        </div>

        <div style="font-family: var(--font-mono); font-size: 0.95rem; color: var(--text-secondary); text-align: center;">
          Turn: <span id="chess-turn-text" class="eval-number" style="color: var(--accent-cyan);">White's Turn</span>
        </div>

        <div id="chess-status" class="ttt-status" style="color: var(--text-primary); text-align: center; font-size: 1.05rem; min-height: 1.5em;">
          Select a piece to move. Checkmate the enemy King!
        </div>

        <!-- Game Main Layout -->
        <div class="chess-game-layout" style="display: flex; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap; justify-content: center;">

          <!-- Board Area -->
          <div class="chess-board-section">
            <div class="chess-board-container">
              <div id="chess-board" class="chess-board-grid"></div>
            </div>
            <div class="chess-meta" style="margin-top: 0.5rem;">
              <span>Move: <span id="chess-fullmove">1</span></span>
              <span>Half-move clock: <span id="chess-halfmove">0</span></span>
            </div>
          </div>

          <!-- Side Panel -->
          <div class="chess-side-panel">
            <div class="chess-box">
              <div class="chess-box-title">
                <span>📜 Move History</span>
              </div>
              <div id="chess-move-history" class="move-history-container">
                <div style="color: var(--text-secondary); font-size: 0.8rem; font-style: italic;">Game started...</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    // ===== GAME ELEMENTS =====
    const statusEl = document.getElementById('chess-status');
    const turnEl = document.getElementById('chess-turn-text');
    const resetBtn = document.getElementById('chess-reset');
    const modeSelect = document.getElementById('chess-mode');
    const boardEl = document.getElementById('chess-board');
    const themeContainer = document.getElementById('chess-theme-container');
    const moveHistoryEl = document.getElementById('chess-move-history');
    const colorBtns = document.querySelectorAll('.color-btn');
    const fullMoveEl = document.getElementById('chess-fullmove');
    const halfMoveEl = document.getElementById('chess-halfmove');

    // Add undo button to controls
    const undoBtn = document.createElement('button');
    undoBtn.id = 'chess-undo';
    undoBtn.className = 'btn btn-secondary';
    undoBtn.style.fontSize = '0.85rem';
    undoBtn.style.padding = '0.45rem 0.9rem';
    undoBtn.style.marginLeft = '0.5rem';
    undoBtn.style.background = 'linear-gradient(135deg, rgba(66, 133, 245, 0.15), rgba(33, 37, 66, 0.15))';
    undoBtn.style.color = 'var(--text-primary)';
    undoBtn.style.border = '1px solid var(--glass-border)';
    undoBtn.style.borderRadius = '8px';
    undoBtn.style.cursor = 'pointer';
    undoBtn.dataset.theme = 'neutral';
    undoBtn.textContent = '↩️ Undo';
    undoBtn.setAttribute('aria-label', 'Undo last move');

    // Add undo button to controls
    const controlsContainer = document.querySelector('.ttt-controls');
    controlsContainer.appendChild(undoBtn);

    // Initialize undo tracking variables
    const undoHistory = [];
    let currentMoveIndex = 0;

    // Add undo button handler
    undoBtn.addEventListener('click', () => {
      if (currentMoveIndex > 0) {
        currentMoveIndex--;
        const prevState = undoHistory[currentMoveIndex];

        // Restore the game state
        board = cloneBoard(prevState.board);
        turn = prevState.turn;
        lastMove = prevState.lastMove ? { ...prevState.lastMove } : null;
        selectedSquare = null;
        legalMoves = [];
        halfMoveClock = prevState.halfMoveClock;
        castling = { ...prevState.castling };
        enPassant = prevState.enPassant ? { ...prevState.enPassant } : null;
        positionHistory = [...prevState.positionHistory];
        fullMoveNumber = prevState.fullMoveNumber;

        // Update UI
        updateStatus();
        renderBoard();
        updateHistoryUI();

        // Enable/disable undo button
        undoBtn.disabled = currentMoveIndex === 0;
      }
    });

    // Function to record moves for undo
    function recordUndoState() {
      undoHistory.push({
        board: cloneBoard(board),
        turn: turn,
        lastMove: lastMove ? { ...lastMove } : null,
        halfMoveClock: halfMoveClock,
        castling: { ...castling },
        enPassant: enPassant ? { ...enPassant } : null,
        positionHistory: [...positionHistory],
        fullMoveNumber: fullMoveNumber
      });
      currentMoveIndex = undoHistory.length - 1;
      undoBtn.disabled = currentMoveIndex === 0;
    }

    // Unicode pieces for standard chess
    const unicodePieces = {
      'WP': '♙', 'WR': '♖', 'WN': '♘', 'WB': '♗', 'WQ': '♕', 'WK': '♔',
      'BP': '♟', 'BR': '♜', 'BN': '♞', 'BB': '♝', 'BQ': '♛', 'BK': '♚'
    };

    // Direction arrays
    const KNIGHT = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    const KINGDIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    const ROOKDIRS = [[-1,0],[1,0],[0,-1],[0,1]];
    const BISHDIRS = [[-1,-1],[-1,1],[1,-1],[1,1]];

    // Initial board setup (row 0 = black back rank, row 7 = white back rank)
    const initialBoard = [
      ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
      ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
      ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
    ];

    // ===== GAME STATE =====
    let board = [];
    let currentTheme = 'standard';
    let currentMode = 'pvp';
    let selectedSquare = null;
    let legalMoves = [];
    let turn = 'W';
    let gameActive = true;
    let moveHistory = [];           // { from, to, notation, piece }
    let lastMove = null;            // { from:{row,col}, to:{row,col} }
    let castling = { WK: true, WQ: true, BK: true, BQ: true };
    let enPassant = null;           // { row, col } target square
    let halfMoveClock = 0;          // for fifty-move rule
    let fullMoveNumber = 1;         // for notation / display
    let positionHistory = [];       // position keys for threefold repetition

    // ===== UTILITIES =====
    function inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }
    function cloneBoard(b) { return b.map(row => [...row]); }

    function findKing(b, color) {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (b[r][c] === color + 'K') return { row: r, col: c };
        }
      }
      return null;
    }

    // Is square (row,col) on board `b` attacked by color `byColor`?
    function squareAttacked(b, row, col, byColor) {
      const opp = byColor;

      // Pawn attacks
      const pdr = opp === 'W' ? -1 : 1;   // direction the pawn moves
      const pr = row - pdr;               // square a pawn would need to be on
      if (inBounds(pr, col - 1) && b[pr][col - 1] === opp + 'P') return true;
      if (inBounds(pr, col + 1) && b[pr][col + 1] === opp + 'P') return true;

      // Knight attacks
      for (const [dr, dc] of KNIGHT) {
        const r = row + dr, c = col + dc;
        if (inBounds(r, c) && b[r][c] === opp + 'N') return true;
      }

      // King attacks
      for (const [dr, dc] of KINGDIRS) {
        const r = row + dr, c = col + dc;
        if (inBounds(r, c) && b[r][c] === opp + 'K') return true;
      }

      // Rook / Queen (straight)
      for (const [dr, dc] of ROOKDIRS) {
        let r = row + dr, c = col + dc;
        while (inBounds(r, c)) {
          const t = b[r][c];
          if (t) {
            if (t === opp + 'R' || t === opp + 'Q') return true;
            break;
          }
          r += dr; c += dc;
        }
      }

      // Bishop / Queen (diagonal)
      for (const [dr, dc] of BISHDIRS) {
        let r = row + dr, c = col + dc;
        while (inBounds(r, c)) {
          const t = b[r][c];
          if (t) {
            if (t === opp + 'B' || t === opp + 'Q') return true;
            break;
          }
          r += dr; c += dc;
        }
      }

      return false;
    }

    function isInCheck(b, color) {
      const k = findKing(b, color);
      if (!k) return false;
      return squareAttacked(b, k.row, k.col, color === 'W' ? 'B' : 'W');
    }

    // Pseudo-legal moves for the piece at (row,col) on board `b`.
    function getPieceMovesOn(b, row, col, ep) {
      const piece = b[row][col];
      if (!piece) return [];
      const color = piece[0];
      const type = piece[1];
      const moves = [];

      if (type === 'N' || type === 'K') {
        const dirs = type === 'N' ? KNIGHT : KINGDIRS;
        dirs.forEach(([dr, dc]) => {
          const r = row + dr, c = col + dc;
          if (inBounds(r, c) && (!b[r][c] || b[r][c][0] !== color)) moves.push({ row: r, col: c });
        });
      } else if (type === 'R' || type === 'B' || type === 'Q') {
        const dirs = type === 'R' ? ROOKDIRS : type === 'B' ? BISHDIRS : ROOKDIRS.concat(BISHDIRS);
        dirs.forEach(([dr, dc]) => {
          let r = row + dr, c = col + dc;
          while (inBounds(r, c)) {
            const t = b[r][c];
            if (!t) moves.push({ row: r, col: c });
            else { if (t[0] !== color) moves.push({ row: r, col: c }); break; }
            r += dr; c += dc;
          }
        });
      } else if (type === 'P') {
        const dir = color === 'W' ? -1 : 1;
        const startRow = color === 'W' ? 6 : 1;
        const promoRow = color === 'W' ? 0 : 7;

        // Single push
        if (inBounds(row + dir, col) && !b[row + dir][col]) {
          if (row + dir === promoRow) moves.push({ row: row + dir, col, promotion: true });
          else moves.push({ row: row + dir, col });

          // Double push
          if (row === startRow && !b[row + 2 * dir][col]) {
            moves.push({ row: row + 2 * dir, col });
          }
        }

        // Captures + en passant
        [-1, 1].forEach(dc => {
          const nr = row + dir, nc = col + dc;
          if (inBounds(nr, nc)) {
            const t = b[nr][nc];
            if (t && t[0] !== color) {
              if (nr === promoRow) moves.push({ row: nr, col: nc, promotion: true });
              else moves.push({ row: nr, col: nc });
            } else if (ep && ep.row === nr && ep.col === nc && nr === row + dir) {
              moves.push({ row: nr, col: nc, special: 'enPassant' });
            }
          }
        });
      }

      return moves;
    }

    // Apply a move to board `nb` (mutates). Handles EP, castling, promotion.
    function applyMoveToBoard(nb, fr, fc, tr, tc, special, promo) {
      const p = nb[fr][fc];
      if (special === 'enPassant') {
        nb[fr][tc] = null; // captured pawn is on the same row as the mover
      }
      nb[tr][tc] = p;
      nb[fr][fc] = null;
      if (promo) nb[tr][tc] = p[0] + promo;
      if (special === 'castleK') { nb[fr][5] = nb[fr][7]; nb[fr][7] = null; }
      if (special === 'castleQ') { nb[fr][3] = nb[fr][0]; nb[fr][0] = null; }
    }

    // Fully legal moves for the piece at (row,col) on the real board.
    function getLegalMoves(row, col) {
      const piece = board[row][col];
      if (!piece) return [];
      const color = piece[0];

      let moves = getPieceMovesOn(board, row, col, enPassant).map(m => ({ ...m, from: { row, col } }));

      moves = moves.filter(m => {
        const nb = cloneBoard(board);
        applyMoveToBoard(nb, row, col, m.row, m.col, m.special, m.promotion ? 'Q' : null);
        return !isInCheck(nb, color);
      });

      if (piece[1] === 'K') {
        getCastlingMoves(color).forEach(m => moves.push({ ...m, from: { row, col } }));
      }

      return moves;
    }

    function getCastlingMoves(color) {
      const res = [];
      const opp = color === 'W' ? 'B' : 'W';

      if (color === 'W') {
        if (castling.WK && board[7][4] === 'WK' && board[7][7] === 'WR' &&
            !board[7][5] && !board[7][6] &&
            !isInCheck(board, 'W') &&
            !squareAttacked(board, 7, 4, opp) && !squareAttacked(board, 7, 5, opp) && !squareAttacked(board, 7, 6, opp)) {
          res.push({ row: 7, col: 6, special: 'castleK' });
        }
        if (castling.WQ && board[7][4] === 'WK' && board[7][0] === 'WR' &&
            !board[7][1] && !board[7][2] && !board[7][3] &&
            !isInCheck(board, 'W') &&
            !squareAttacked(board, 7, 4, opp) && !squareAttacked(board, 7, 3, opp) && !squareAttacked(board, 7, 2, opp)) {
          res.push({ row: 7, col: 2, special: 'castleQ' });
        }
      } else {
        if (castling.BK && board[0][4] === 'BK' && board[0][7] === 'BR' &&
            !board[0][5] && !board[0][6] &&
            !isInCheck(board, 'B') &&
            !squareAttacked(board, 0, 4, opp) && !squareAttacked(board, 0, 5, opp) && !squareAttacked(board, 0, 6, opp)) {
          res.push({ row: 0, col: 6, special: 'castleK' });
        }
        if (castling.BQ && board[0][4] === 'BK' && board[0][0] === 'BR' &&
            !board[0][1] && !board[0][2] && !board[0][3] &&
            !isInCheck(board, 'B') &&
            !squareAttacked(board, 0, 4, opp) && !squareAttacked(board, 0, 3, opp) && !squareAttacked(board, 0, 2, opp)) {
          res.push({ row: 0, col: 2, special: 'castleQ' });
        }
      }
      return res;
    }

    // All legal moves for a given color (real board).
    function getAllLegalMoves(color) {
      const res = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (board[r][c] && board[r][c][0] === color) {
            res.push(...getLegalMoves(r, c));
          }
        }
      }
      return res;
    }

    // Legal-move count on an arbitrary board `b` (used for mate detection in search).
    function legalMovesCountOn(b, color) {
      let count = 0;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = b[r][c];
          if (p && p[0] === color) {
            const pm = getPieceMovesOn(b, r, c, enPassant);
            for (const m of pm) {
              const nb = cloneBoard(b);
              applyMoveToBoard(nb, r, c, m.row, m.col, m.special, null);
              if (!isInCheck(nb, color)) count++;
            }
          }
        }
      }
      return count;
    }

    // ===== POSITION KEY (for threefold repetition) =====
    function getPositionKey() {
      let s = '';
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) s += board[r][c] ? board[r][c] : '.';
      }
      s += turn;
      s += (castling.WK ? 'K' : '') + (castling.WQ ? 'Q' : '') + (castling.BK ? 'k' : '') + (castling.BQ ? 'q' : '');
      s += enPassant ? (String.fromCharCode(97 + enPassant.col) + (8 - enPassant.row)) : '-';
      return s;
    }

    function isThreefold() {
      const key = getPositionKey();
      return positionHistory.filter(k => k === key).length >= 3;
    }

    // ===== DRAW / END CONDITIONS =====
    function isInsufficientMaterial() {
      const pieces = [];
      for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++)
          if (board[r][c]) pieces.push(board[r][c]);

      const minors = pieces.filter(p => p[1] === 'B' || p[1] === 'N');
      const nonKings = pieces.filter(p => p[1] !== 'K');

      if (nonKings.length === 0) return true;                 // K vs K
      if (nonKings.length === 1 && minors.length === 1) return true; // K+minor vs K

      // K+B vs K+B with bishops on same-colored squares
      if (nonKings.length === 2 && nonKings.every(p => p[1] === 'B')) {
        let sq1 = null, sq2 = null, i = 0;
        for (let r = 0; r < 8 && i < 2; r++)
          for (let c = 0; c < 8 && i < 2; c++)
            if (board[r][c] && board[r][c][1] === 'B') { if (i === 0) sq1 = (r + c) % 2; else sq2 = (r + c) % 2; i++; }
        if (sq1 !== null && sq1 === sq2) return true;
      }
      return false;
    }

    // ===== NOTATION =====
    function getAmbiguation(from, to, type) {
      let fileConflict = false, rankConflict = false, any = false;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (r === from.row && c === from.col) continue;
          const p = board[r][c];
          if (p && p[0] === turn && p[1] === type) {
            const ms = getLegalMoves(r, c);
            if (ms.some(m => m.row === to.row && m.col === to.col)) {
              any = true;
              if (c === from.col) rankConflict = true;
              if (r === from.row) fileConflict = true;
            }
          }
        }
      }
      if (!any) return 'none';
      if (fileConflict && rankConflict) return 'both';
      if (fileConflict) return 'rank'; // another piece shares the file -> disambiguate by rank
      if (rankConflict) return 'file'; // another piece shares the rank -> disambiguate by file
      return 'none';
    }

    function getNotation(move, movingPiece, captured, givesCheck, givesMate) {
      const from = move.from, to = move.to;
      const type = movingPiece[1];

      if (move.special === 'castleK') return givesMate ? 'O-O#' : givesCheck ? 'O-O+' : 'O-O';
      if (move.special === 'castleQ') return givesMate ? 'O-O-O#' : givesCheck ? 'O-O-O+' : 'O-O-O';

      let s = '';
      const isCapture = captured !== null;

      if (type !== 'P') {
        s += type;
        const amb = getAmbiguation(from, to, type);
        if (amb === 'file') s += String.fromCharCode(97 + from.col);
        else if (amb === 'rank') s += (8 - from.row);
        else if (amb === 'both') s += String.fromCharCode(97 + from.col) + (8 - from.row);
      }

      if (isCapture) {
        if (type === 'P') s += String.fromCharCode(97 + from.col);
        s += 'x';
      }

      s += String.fromCharCode(97 + to.col) + (8 - to.row);

      if (move.promotion) s += '=' + move.promotion;
      if (givesMate) s += '#';
      else if (givesCheck) s += '+';

      return s;
    }

    // ===== MAKE A MOVE (full state) =====
    function doMove(from, to, promo) {
      // Record state before making the move (for undo)
      recordUndoState();

      const movingPiece = board[from.row][from.col];
      const color = movingPiece[0];
      const isPawn = movingPiece[1] === 'P';

      const move = { from: { ...from }, to: { ...to }, promotion: promo || null, special: null, captured: null };

      // Determine special / capture
      if (isPawn && enPassant && to.row === enPassant.row && to.col === enPassant.col && board[to.row][to.col] === null) {
        move.special = 'enPassant';
        move.captured = board[from.row][to.col];
      } else if (board[to.row][to.col] !== null) {
        move.captured = board[to.row][to.col];
      }
      if (movingPiece[1] === 'K' && Math.abs(to.col - from.col) === 2) {
        move.special = to.col === 6 ? 'castleK' : 'castleQ';
      }

      // Update castling rights
      if (movingPiece[1] === 'K') { castling[color + 'K'] = false; castling[color + 'Q'] = false; }
      if (movingPiece[1] === 'R') {
        if (from.row === 7 && from.col === 0) castling.WQ = false;
        if (from.row === 7 && from.col === 7) castling.WK = false;
        if (from.row === 0 && from.col === 0) castling.BQ = false;
        if (from.row === 0 && from.col === 7) castling.BK = false;
      }
      if (to.row === 7 && to.col === 0) castling.WQ = false;
      if (to.row === 7 && to.col === 7) castling.WK = false;
      if (to.row === 0 && to.col === 0) castling.BQ = false;
      if (to.row === 0 && to.col === 7) castling.BK = false;

      applyMoveToBoard(board, from.row, from.col, to.row, to.col, move.special, promo);

      // En passant target
      enPassant = null;
      if (isPawn && Math.abs(to.row - from.row) === 2) {
        enPassant = { row: (from.row + to.row) / 2, col: from.col };
      }

      // Clocks
      if (isPawn || move.captured) halfMoveClock = 0;
      else halfMoveClock++;
      if (turn === 'B') fullMoveNumber++;

      lastMove = { from: { ...from }, to: { ...to } };

      // Notation (after the move is on the board)
      const opp = turn === 'W' ? 'B' : 'W';
      const givesCheck = isInCheck(board, opp);
      const oppHasMoves = getAllLegalMoves(opp).length > 0;
      const givesMate = givesCheck && !oppHasMoves;
      const notation = getNotation(move, movingPiece, move.captured, givesCheck, givesMate);

      moveHistory.push({ from: { ...from }, to: { ...to }, notation, piece: movingPiece });

      positionHistory.push(getPositionKey());
      turn = turn === 'W' ? 'B' : 'W';
    }

    // ===== AI MOVE =====
    function evaluatePosition(testBoard) {
      const values = { 'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9 };
      let score = 0;
      const center = [[3, 3], [3, 4], [4, 3], [4, 4]];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = testBoard[r][c];
          if (p) {
            const val = values[p[1]] || 0;
            score += (p[0] === 'B' ? -val : val);
            if (p === 'WP' && center.some(([cr, cc]) => cr === r && cc === c)) score += 0.5;
            if (p === 'BP' && center.some(([cr, cc]) => cr === r && cc === c)) score -= 0.5;
          }
        }
      }
      return score;
    }

    function aiMove() {
      if (!gameActive || currentMode === 'pvp') return;

      const color = 'B';
      const moves = getAllLegalMoves(color);
      if (moves.length === 0) return;

      const useDepth = currentMode === 'ai-hard';
      let best = null;
      let bestValue = -Infinity;

      for (const m of moves) {
        const nb = cloneBoard(board);
        applyMoveToBoard(nb, m.from.row, m.from.col, m.row, m.col, m.special, m.promotion ? 'Q' : null);

        let val = evaluatePosition(nb);

        const oppInCheck = isInCheck(nb, 'W');
        const oppHas = legalMovesCountOn(nb, 'W') > 0;
        if (oppInCheck && !oppHas) val += 1000;       // checkmate
        else if (oppInCheck) val += 2;                // give check

        if (useDepth) {
          // One-ply lookahead: minimize White's best reply
          let worst = Infinity;
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              if (nb[r][c] && nb[r][c][0] === 'W') {
                const wm = getPieceMovesOn(nb, r, c, null);
                for (const w of wm) {
                  const nb2 = cloneBoard(nb);
                  applyMoveToBoard(nb2, r, c, w.row, w.col, w.special, null);
                  if (isInCheck(nb2, 'W')) continue; // illegal for White
                  const v2 = evaluatePosition(nb2);
                  if (v2 < worst) worst = v2;
                }
              }
            }
          }
          if (worst !== Infinity) val -= worst * 0.9;
        }

        if (val > bestValue || (val === bestValue && Math.random() > 0.5)) {
          bestValue = val;
          best = m;
        }
      }

      if (best) {
        doMove(best.from, best, best.promotion ? 'Q' : null);
        selectedSquare = null;
        legalMoves = [];
        afterMove();
      }
    }

    // ===== UPDATE UI =====
    function renderBoard() {
      boardEl.innerHTML = '';

      board.forEach((row, rowIndex) => {
        row.forEach((piece, colIndex) => {
          const square = document.createElement('div');
          const isLight = (rowIndex + colIndex) % 2 === 0;
          square.className = `chess-square ${isLight ? 'light' : 'dark'}`;
          square.dataset.row = rowIndex;
          square.dataset.col = colIndex;

          if (piece) {
            const colorMap = {
              'standard': { 'W': 'white', 'B': 'black' },
              'red': { 'W': 'red', 'B': 'green' },
              'cream-beige': { 'W': 'cream', 'B': 'beige' },
              'blue': { 'W': 'white', 'B': 'black' },
              'green': { 'W': 'white', 'B': 'black' }
            };
            const pieceColor = colorMap[currentTheme][piece[0]];
            const pieceClass = `chess-piece ${pieceColor}`;
            const symbol = unicodePieces[piece] || '♟';
            square.innerHTML = `<span class="${pieceClass}">${symbol}</span>`;
          }

          if (lastMove) {
            if (lastMove.from.row === rowIndex && lastMove.from.col === colIndex) square.classList.add('last-move-from');
            if (lastMove.to.row === rowIndex && lastMove.to.col === colIndex) square.classList.add('last-move-to');
          }

          if (selectedSquare && selectedSquare.row === rowIndex && selectedSquare.col === colIndex) {
            square.classList.add('selected');
          }

          if (legalMoves.some(move => move.row === rowIndex && move.col === colIndex)) {
            if (piece) square.classList.add('legal-capture');
            else square.classList.add('legal-move');
          }

          square.addEventListener('click', () => handleSquareClick(rowIndex, colIndex));
          boardEl.appendChild(square);
        });
      });
    }

    function updateStatus() {
      const colorNames = { 'W': 'White', 'B': 'Black' };
      turnEl.textContent = `${colorNames[turn] || 'Unknown'}'s Turn`;
      turnEl.style.color = turn === 'W' ? '#00FF99' : '#FFA43B';
      if (fullMoveEl) fullMoveEl.textContent = fullMoveNumber;
      if (halfMoveEl) halfMoveEl.textContent = halfMoveClock;
    }

    function updateHistoryUI() {
      if (moveHistory.length === 0) {
        moveHistoryEl.innerHTML = '<div style="color: var(--text-secondary); font-size: 0.8rem; font-style: italic;">Game started...</div>';
        return;
      }

      moveHistoryEl.innerHTML = '';
      moveHistory.forEach((m, i) => {
        const div = document.createElement('div');
        div.className = 'move-history-item';
        const num = Math.floor((i + 1) / 2);
        const sub = (i % 2) + 1;
        div.innerHTML = `<span>${num}.${sub}</span><span>${m.notation}</span>`;
        moveHistoryEl.appendChild(div);
      });
      moveHistoryEl.scrollTop = moveHistoryEl.scrollHeight;
    }

    // After a move: check for checkmate / stalemate / draws, then update UI.
    function afterMove() {
      const sideToMove = turn;
      const moves = getAllLegalMoves(sideToMove);
      const inCheck = isInCheck(board, sideToMove);

      updateStatus();
      renderBoard();
      updateHistoryUI();

      if (moves.length === 0) {
        gameActive = false;
        if (inCheck) statusEl.textContent = `${sideToMove === 'W' ? 'Black' : 'White'} wins by checkmate! 🎉`;
        else statusEl.textContent = 'Draw by stalemate.';
        return;
      }
      if (isInsufficientMaterial()) { gameActive = false; statusEl.textContent = 'Draw by insufficient material.'; return; }
      if (halfMoveClock >= 100) { gameActive = false; statusEl.textContent = 'Draw by fifty-move rule.'; return; }
      if (isThreefold()) { gameActive = false; statusEl.textContent = 'Draw by threefold repetition.'; return; }

      if (inCheck) statusEl.textContent = `${sideToMove === 'W' ? 'White' : 'Black'} is in check!`;
      else statusEl.textContent = 'Select a piece to move.';

      if (currentMode !== 'pvp' && turn === 'B') {
        setTimeout(aiMove, 500);
      }
    }

    function resetGame() {
      board = initialBoard.map(row => [...row]);
      selectedSquare = null;
      legalMoves = [];
      turn = 'W';
      gameActive = true;
      moveHistory = [];
      lastMove = null;
      castling = { WK: true, WQ: true, BK: true, BQ: true };
      enPassant = null;
      halfMoveClock = 0;
      fullMoveNumber = 1;
      positionHistory = [getPositionKey()];
      updateStatus();
      renderBoard();
      updateHistoryUI();
      statusEl.textContent = 'Select a piece to move. Checkmate the enemy King!';
    }

    // ===== MODE CHANGES =====
    function setMode(newMode) {
      currentMode = newMode;
      resetGame();
    }

    // ===== CLICK HANDLING =====
    function handleSquareClick(row, col) {
      if (!gameActive) return;
      if (currentMode !== 'pvp' && turn === 'B') return; // AI's turn

      const piece = board[row][col];

      if (!selectedSquare) {
        if (piece && piece[0] === turn) {
          selectedSquare = { row, col };
          legalMoves = getLegalMoves(row, col);
          renderBoard();
        }
        return;
      }

      const move = legalMoves.find(m => m.row === row && m.col === col);

      if (move) {
        let promo = null;
        if (move.promotion) {
          if (currentMode === 'pvp' || turn === 'W') {
            const choice = prompt('Promote pawn to (Q, R, B, or N):', 'Q');
            promo = (choice || 'Q').toUpperCase().slice(0, 1);
            if (!['Q', 'R', 'B', 'N'].includes(promo)) promo = 'Q';
          } else {
            promo = 'Q';
          }
        }

        doMove(selectedSquare, { row, col }, promo);
        selectedSquare = null;
        legalMoves = [];
        afterMove();
      } else if (piece && piece[0] === turn) {
        selectedSquare = { row, col };
        legalMoves = getLegalMoves(row, col);
        renderBoard();
      } else {
        selectedSquare = null;
        legalMoves = [];
        renderBoard();
      }
    }

    // ===== EVENT LISTENERS =====
    colorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTheme = btn.dataset.theme;
        themeContainer.className = `chess-wrapper theme-${currentTheme}`;
        renderBoard();
      });
    });

    modeSelect.addEventListener('change', () => {
      setMode(modeSelect.value);
    });

    resetBtn.addEventListener('click', () => {
      resetGame();
    });

    // ===== INITIAL RENDER =====
    resetGame();
  };
})();
