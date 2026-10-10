# Design and Development of a Multi-Game Learning Platform for Computational Thinking

A browser-based educational prototype that combines **five interactive learning activities** in one dashboard. The platform gives beginners opportunities to practice sorting, shortest-path calculations, logical reasoning, and strategic decision-making through direct interaction and immediate feedback.

Developed by **Md Shakib Mostafa** for the **Bachelor in Computer Science (Honours)** at **Albukhary International University**, School of Computing and Informatics, under the supervision of **Dr. Qudrattullah Omerkhel**.

## Project Background

Computational-thinking concepts can be difficult to understand through written explanations or programming exercises alone. Learners may recognize an algorithm but struggle to explain how each step changes the current state. Switching between separate learning tools can also interrupt their practice.

This project brings algorithm exercises and strategy games into one interface. Learners make sorting decisions, update graph distances, identify legal moves, and examine computer move evaluations without needing to write code.

## Objectives

1. Design and develop a multi-game platform integrating algorithm-based and strategy-based computational-thinking activities.
2. Create interactive activities for practicing sorting, shortest-path, logical, and strategic reasoning.
3. Implement browser-based progress tracking for supported scores, unlocked levels, and selected game statistics.

## Learning Activities

| Activity | Main features | Computational-thinking focus |
| --- | --- | --- |
| **Bubble Sort** | Arrays of 3–20 elements; manual swap and advance controls; pass and swap counters; feedback for incorrect decisions | Comparison, sequencing, and algorithmic reasoning |
| **Dijkstra’s Pathfinding** | Predefined weighted graphs; manual node selection and distance relaxation; distance table; three unlockable levels | Shortest-path reasoning and graph-state updates |
| **Tic-Tac-Toe** | 3 × 3 board; Random AI, recursive Minimax AI, and local player-versus-player mode; candidate-move score panel | Pattern recognition, state-space search, and decision-making |
| **Three Men’s Morris** | Nine connected positions; pre-placed pieces; movement to adjacent empty positions; computer and local player-versus-player modes | Movement constraints, valid-state transitions, and pattern recognition |
| **Chess** | 8 × 8 board; legal-move validation; check filtering; castling, en passant, and promotion; draw checks; Medium AI, Hard AI, local player-versus-player mode, and undo | Rule-based reasoning, evaluation, and strategic planning |

**Activity details:** Dijkstra is the only activity with unlockable levels. Bubble Sort difficulty is controlled by array size. Three Men’s Morris uses a simplified movement-only variant without a placement phase or piece capture. The Tic-Tac-Toe evaluation panel displays scores for candidate root moves rather than a complete recursive search tree. Chess uses one-ply and two-ply heuristic computer play.

## Shared Features

- Central dashboard and navigation between activities.
- Instruction pop-ups that can be reopened during play.
- Visual feedback and supported score and outcome updates.
- Sound effects synthesized through the Web Audio API.
- Light and dark themes.
- Selected progress and preferences stored in browser localStorage.
- Animated Three.js dashboard background.
- CSS Grid and Flexbox layouts with basic responsiveness; primarily designed for desktop browsers.

## Technologies and Architecture

| Technology | Purpose |
| --- | --- |
| HTML5 | Dashboard and activity interface structure |
| CSS3 | Styling, themes, and responsive layouts |
| JavaScript | Game logic, navigation, state management, and feedback |
| Three.js | Animated dashboard background |
| SVG and DOM APIs | Interactive graph and interface rendering |
| Web Audio API | Synthesized sound feedback |
| localStorage | Selected progress and preference persistence |
| Node.js built-in HTTP, filesystem, and path modules | Local static file serving |

The platform uses a modular client-side architecture. Each game has a separate JavaScript module and initialization function. `app.js` manages shared services and loads the selected activity into the common game area.

All gameplay executes in the browser. `server.js` serves the application files locally; it does not perform game calculations. The prototype requires no frontend framework, application backend, user-account service, or external database.

## Repository Contents

| Path | Responsibility |
| --- | --- |
| `index.html` | Main dashboard, shared activity area, and script references |
| `styles.css` | Shared styling and layouts |
| `app.js` | Navigation, scoring, state, theme, instructions, and sound controls |
| `three-engine.js` | Three.js background engine |
| `server.js` | Local HTTP server on port 3000 |
| `games/bubble-sort.js` | Bubble Sort activity |
| `games/dijkstra.js` | Dijkstra’s Pathfinding activity |
| `games/tic-tac-toe.js` | Tic-Tac-Toe activity and Minimax evaluation |
| `games/three-mens-morris.js` | Three Men’s Morris activity |
| `games/chess.js` | Chess rules, computer play, and undo |
| `docs/Final-Report.pdf` | Final academic project report |

Keep the five game scripts inside `games/` and name the main HTML file `index.html` so the supplied paths resolve correctly.

## Run Locally

1. Install Node.js and download or clone the repository.
2. Open a terminal in the project folder.
3. Start the local server:

   ```sh
   node server.js
   ```

4. Open **http://localhost:3000** in a browser.
5. Select an activity from the dashboard.

Keep the terminal open while using the platform. Press **Ctrl+C** to stop the server.

The uploaded source uses Node.js built-in modules, so no npm dependency installation is required for this command. Although the report mentions `package.json` and npm scripts, these were not included in the uploaded source files; this repository uses `node server.js` directly.

Internet access is needed to load Three.js from jsDelivr and fonts from Google Fonts. Open the platform through the HTTP server rather than opening `index.html` directly. If port 3000 is occupied, change `PORT` in `server.js` and use the matching browser address.

## Progress Storage

| Storage key | Stored information |
| --- | --- |
| `comp_thinking_state` | Shared score, stored level values, and selected game statistics |
| `app_theme` | Light or dark theme preference |
| `ct_help_seen` | Whether automatic help has been shown for each activity |

Progress belongs to the browser and site address being used. Clearing site data removes it, and it does not synchronize across devices. Unfinished boards, Dijkstra timers, move histories, and Chess undo data are temporary and are not restored after a reload. The sound mute preference also resets on reload.

## Development and Evaluation

The report describes iterative development using a Scrum-based approach, covering requirements, system design, implementation, testing, and refinement.

**Results recorded in the final report:**

- 24 documented functional test cases covering startup, navigation, the five activities, shared controls, and browser storage.
- All 24 cases recorded as passing after the Tic-Tac-Toe candidate-score display issue was corrected and FT14 was repeated: **100% functional-test pass rate** under the reported test conditions.
- No user survey or controlled learning-outcome study was conducted.
- Broader browser, performance, accessibility, and touch-interaction evaluation remains necessary.

These are results documented in the report, rather than a fresh execution of its test suite against this repository. They do not establish universal reliability, accessibility compliance, confirmed usability, or a measured improvement in computational-thinking ability.

## Current Scope and Limitations

- Local browser progress only; no accounts or cross-device synchronization.
- Local player-versus-player modes only; no real-time online multiplayer.
- Predefined Dijkstra graphs rather than a general-purpose graph editor.
- No adaptive learner modelling or automatic difficulty adjustment.
- No LMS integration or native mobile applications.
- External resource dependencies; full offline operation has not been established.
- Educational effectiveness and broader usability still require empirical evaluation.

## Future Work

The report proposes improved hints and feedback, stronger progress tracking, additional activities and graph templates, a graph editor, and adaptive difficulty. Further work also includes accessibility and compatibility testing, offline support, and user evaluation using suitable usability instruments and pre- and post-activity learning assessments. Accounts, teacher reporting, cross-device progress, and online multiplayer are possible later extensions.

## Project Report

Read the [final project report](docs/Final-Report.pdf) for the literature review, methodology, system diagrams, algorithms, documented functional tests, limitations, and proposed evaluation.

**Report date:** September 2026.
