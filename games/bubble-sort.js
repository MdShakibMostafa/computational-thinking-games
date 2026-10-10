(function() {
  window.initBubbleSort = function(container) {
    if (!container) return;

    // Generate dropdown options from 3 to 20 elements
    let elementOptionsHTML = '';
    for (let i = 3; i <= 20; i++) {
      const selected = i === 5 ? 'selected' : '';
      elementOptionsHTML += `<option value="${i}" ${selected}>${i} Elements</option>`;
    }

    container.innerHTML = `
      <style>
        .bs-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          width: 100%;
        }

        .bs-game-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.2rem;
          width: 100%;
          max-width: 900px;
        }

        .bs-controls-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .bs-stats-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem;
        }

        .bs-stat-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 0.5rem 1rem;
          font-family: var(--font-mono);
          min-width: 75px;
        }

        .bs-stat-label {
          font-size: 0.7rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .bs-stat-value {
          font-size: 1.25rem;
          font-weight: bold;
          color: var(--accent-cyan);
        }

        .bs-action-btn {
          padding: 0.75rem 1.8rem;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }

        .bs-action-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.15);
        }

        .bs-action-btn:active {
          transform: translateY(0);
        }

        .bs-hint-box {
          padding: 0.85rem 1.2rem;
          font-size: 0.95rem;
          background: rgba(0, 242, 254, 0.05);
          border: 1px solid rgba(0, 242, 254, 0.2);
          border-radius: 10px;
          width: 100%;
          text-align: center;
          box-sizing: border-box;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* --- BIGGER BAR CONTAINER & NUMBERS --- */
        .bs-bar-container {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 6px;
          height: 340px;
          width: 100%;
          padding: 30px 15px 15px 15px;
          background: rgba(0,0,0,0.3);
          border-radius: 16px;
          border: 1px solid var(--glass-border);
          overflow-x: auto;
          box-sizing: border-box;
        }

        .bs-bar-val {
          font-family: var(--font-mono);
          font-size: 0.95rem;
          font-weight: 800;
          color: #ffffff;
          background: rgba(0, 0, 0, 0.7);
          padding: 4px 6px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          white-space: nowrap;
          pointer-events: none;
          box-shadow: 0 2px 5px rgba(0,0,0,0.6);
          margin-bottom: 6px;
        }
      </style>

      <div class="bs-wrapper">
        <div class="bs-game-panel">

          <!-- Controls (View Instructions button removed from here) -->
          <div class="bs-controls-row">
            <label for="bs-element-select" style="color: var(--text-secondary); font-size: 0.95rem; font-family: var(--font-mono);">Elements:</label>
            <select id="bs-element-select" class="mode-select" style="font-size: 0.95rem;">
              ${elementOptionsHTML}
            </select>
            <button id="bs-reset" class="btn btn-secondary" style="font-size:0.9rem; padding: 0.45rem 1rem;">🔀 Shuffle</button>
          </div>

          <!-- Stats -->
          <div class="bs-stats-row">
            <div class="bs-stat-box">
              <span class="bs-stat-label">Total</span>
              <span class="bs-stat-value" id="bs-total-elements">5</span>
            </div>
            <div class="bs-stat-box">
              <span class="bs-stat-label">Sorted</span>
              <span class="bs-stat-value"><span id="bs-sorted-count">0</span>/<span id="bs-total-count">5</span></span>
            </div>
            <div class="bs-stat-box">
              <span class="bs-stat-label">Pass</span>
              <span class="bs-stat-value" id="bs-pass">1</span>
            </div>
            <div class="bs-stat-box">
              <span class="bs-stat-label">Swaps</span>
              <span class="bs-stat-value" id="bs-swaps">0</span>
            </div>
          </div>

          <!-- Status -->
          <div id="bs-status-text" style="font-size: 1.05rem; font-family: var(--font-mono); color: var(--accent-cyan); text-align: center; min-height: 1.4em;">
            Compare adjacent elements!
          </div>

          <!-- Bigger Bar Container -->
          <div id="bs-bar-container" class="bs-bar-container">
          </div>

          <!-- Hint Box -->
          <div id="bs-hint-panel" class="bs-hint-box">
            Select the number of elements and press <strong>Shuffle</strong> to begin!
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; gap: 1.25rem;">
            <button id="bs-btn-swap" class="bs-action-btn" style="background: linear-gradient(135deg, var(--accent-pink), var(--accent-purple)); color: white; box-shadow: var(--shadow-glow-pink);">
              🔁 Swap Elements
            </button>
            <button id="bs-btn-next" class="bs-action-btn" style="background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple)); color: white; box-shadow: var(--shadow-glow-cyan);">
              ➡️ Advance Pointer
            </button>
          </div>

        </div>
      </div>
    `;

    const elementSelect = document.getElementById('bs-element-select');
    const resetBtn = document.getElementById('bs-reset');
    const totalElementsEl = document.getElementById('bs-total-elements');
    const sortedCountEl = document.getElementById('bs-sorted-count');
    const totalCountEl = document.getElementById('bs-total-count');
    const passEl = document.getElementById('bs-pass');
    const swapsEl = document.getElementById('bs-swaps');
    const statusText = document.getElementById('bs-status-text');
    const barContainer = document.getElementById('bs-bar-container');
    const hintPanel = document.getElementById('bs-hint-panel');
    const btnSwap = document.getElementById('bs-btn-swap');
    const btnNext = document.getElementById('bs-btn-next');

    let arr = [];
    let idx = 0;
    let pass = 1;
    let swaps = 0;
    let sortedBoundary = 0;
    let gameActive = true;

    elementSelect.addEventListener('change', () => {
      if (typeof sounds !== 'undefined' && sounds.playClick) sounds.playClick();
      initGame();
    });
    resetBtn.addEventListener('click', () => {
      if (typeof sounds !== 'undefined' && sounds.playClick) sounds.playClick();
      initGame();
    });
    btnSwap.addEventListener('click', handleSwap);
    btnNext.addEventListener('click', handleNext);

    function generateRandomArray(count) {
      const set = new Set();
      while (set.size < count) {
        set.add(Math.floor(Math.random() * 81) + 15);
      }
      const values = Array.from(set);
      let isSorted = true;
      for (let i = 0; i < values.length - 1; i++) {
        if (values[i] > values[i + 1]) { isSorted = false; break; }
      }
      if (isSorted && values.length > 1) {
        const temp = values[0]; values[0] = values[1]; values[1] = temp;
      }
      return values;
    }

    function initGame() {
      const numElements = parseInt(elementSelect.value) || 5;
      gameActive = true;
      idx = 0;
      pass = 1;
      swaps = 0;

      arr = generateRandomArray(numElements);
      sortedBoundary = arr.length;

      if (passEl) passEl.textContent = pass;
      if (swapsEl) swapsEl.textContent = swaps;
      if (totalElementsEl) totalElementsEl.textContent = arr.length;
      if (totalCountEl) totalCountEl.textContent = arr.length;
      if (sortedCountEl) sortedCountEl.textContent = 0;

      renderBars();
      updateStatus();
    }

    function renderBars() {
      if (!barContainer) return;
      barContainer.innerHTML = '';

      arr.forEach((val, i) => {
        const bar = document.createElement('div');
        bar.style.height = `${val * 2.8 + 40}px`;
        bar.style.flex = '1';
        bar.style.minWidth = arr.length > 15 ? '28px' : '36px';
        bar.style.maxWidth = '60px';
        bar.style.background = 'rgba(255, 255, 255, 0.15)';
        bar.style.borderRadius = '8px 8px 0 0';
        bar.style.position = 'relative';
        bar.style.transition = 'all 0.3s ease';
        bar.style.display = 'flex';
        bar.style.alignItems = 'flex-end';
        bar.style.justifyContent = 'center';
        bar.style.paddingBottom = '10px';
        bar.style.flexShrink = '0';

        const valText = document.createElement('span');
        valText.className = 'bs-bar-val';
        valText.textContent = val;

        bar.appendChild(valText);

        if (gameActive) {
          if (i === idx || i === idx + 1) {
            bar.style.background = 'linear-gradient(to top, rgba(0, 242, 254, 0.8), rgba(157, 78, 221, 0.8))';
            bar.style.boxShadow = '0 0 16px rgba(0, 242, 254, 0.6)';
          } else if (i >= sortedBoundary) {
            bar.style.background = 'rgba(56, 176, 0, 0.3)';
          }
        } else {
          bar.style.background = 'rgba(56, 176, 0, 0.4)';
        }

        barContainer.appendChild(bar);
      });
    }

    function updateStatus() {
      if (!gameActive) return;
      const val1 = arr[idx];
      const val2 = arr[idx + 1];
      const sortedCount = arr.length - sortedBoundary;
      if (sortedCountEl) sortedCountEl.textContent = sortedCount;

      if (hintPanel) {
        if (val1 > val2) {
          hintPanel.innerHTML = `Element ${idx + 1} <span class="eval-number">(${val1})</span> &gt; Element ${idx + 2} <span class="eval-number">(${val2})</span> — click <strong>🔁 Swap Elements</strong>`;
        } else {
          hintPanel.innerHTML = `Element ${idx + 1} <span class="eval-number">(${val1})</span> &le; Element ${idx + 2} <span class="eval-number">(${val2})</span> — click <strong>➡️ Advance Pointer</strong>`;
        }
      }
      if (statusText) {
        statusText.textContent = `Comparing element ${idx + 1} and element ${idx + 2} of ${arr.length}`;
        statusText.style.color = 'var(--accent-cyan)';
      }
    }

    function handleSwap() {
      if (!gameActive) return;
      const val1 = arr[idx], val2 = arr[idx + 1];
      if (val1 > val2) {
        if (typeof sounds !== 'undefined' && sounds.playClick) sounds.playClick();
        arr[idx] = val2; arr[idx + 1] = val1;
        swaps++;
        if (swapsEl) swapsEl.textContent = swaps;
        renderBars();
        advancePointer();
      } else {
        if (typeof sounds !== 'undefined' && sounds.playFailure) sounds.playFailure();
        if (statusText) { statusText.textContent = `❌ Wrong! ${val1} ≤ ${val2}, no swap needed.`; statusText.style.color = 'var(--accent-pink)'; }
        triggerShake();
      }
    }

    function handleNext() {
      if (!gameActive) return;
      const val1 = arr[idx], val2 = arr[idx + 1];
      if (val1 <= val2) {
        if (typeof sounds !== 'undefined' && sounds.playClick) sounds.playClick();
        advancePointer();
      } else {
        if (typeof sounds !== 'undefined' && sounds.playFailure) sounds.playFailure();
        if (statusText) { statusText.textContent = `❌ Wrong! ${val1} > ${val2}, swap them first!`; statusText.style.color = 'var(--accent-pink)'; }
        triggerShake();
      }
    }

    function advancePointer() {
      idx++;
      if (idx >= sortedBoundary - 1) {
        sortedBoundary--;
        idx = 0;
        pass++;
        if (passEl) passEl.textContent = pass;
        if (typeof sounds !== 'undefined' && sounds.playSuccess) sounds.playSuccess();
        if (checkSorted() || sortedBoundary <= 1) {
          if (sortedCountEl) sortedCountEl.textContent = arr.length;
          endGame(true, `Sorted all ${arr.length} elements!`);
          return;
        }
      }
      updateStatus();
      renderBars();
    }

    function checkSorted() {
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] > arr[i + 1]) return false;
      }
      return true;
    }

    function endGame(victory, message) {
      gameActive = false;
      if (victory) {
        if (typeof sounds !== 'undefined' && sounds.playWin) sounds.playWin();
        if (statusText) { statusText.textContent = `🎉 ${message}`; statusText.style.color = 'var(--accent-green)'; }
        const scoreReward = arr.length * 5;
        if (typeof platformState !== 'undefined' && platformState.addScore) platformState.addScore(scoreReward);
      } else {
        if (typeof sounds !== 'undefined' && sounds.playFailure) sounds.playFailure();
        if (statusText) { statusText.textContent = `❌ ${message}`; statusText.style.color = 'var(--accent-pink)'; }
      }
      renderBars();
    }

    function triggerShake() {
      if (!barContainer) return;
      barContainer.classList.add('shake');
      setTimeout(() => barContainer.classList.remove('shake'), 400);
    }

    // Start game
    initGame();
  };
})();