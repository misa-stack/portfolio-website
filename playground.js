(function () {
  "use strict";

  const root = document.documentElement;
  const isCzech = () => root.lang === "cs";
  const text = (en, cz) => isCzech() ? cz : en;
  const languageListeners = [];
  document.addEventListener("portfolio:language", () => languageListeners.forEach((update) => update()));

  // Each pixel starts at z and repeatedly applies z² + c. The image is calculated
  // in small batches, never in a continuous animation loop.
  const julia = document.querySelector("[data-julia-interactive]");
  if (julia) {
    const canvas = julia.querySelector("[data-julia-canvas]");
    const context = canvas.getContext("2d", { alpha: false });
    if (context) {
      const real = julia.querySelector("[data-julia-real]");
      const imaginary = julia.querySelector("[data-julia-imaginary]");
      const realOutput = document.getElementById("julia-real-value");
      const imaginaryOutput = document.getElementById("julia-imaginary-value");
      const value = julia.querySelector("[data-julia-value]");
      let inView = false;
      let dirty = true;
      let frame = 0;
      let generation = 0;
      const format = (number) => number.toFixed(3).replace("-", "−");

      function updateLabels() {
        const a = Number(real.value);
        const b = Number(imaginary.value);
        const formula = `c = ${format(a)} ${b < 0 ? "−" : "+"} ${format(Math.abs(b))}i`;
        realOutput.value = format(a);
        imaginaryOutput.value = format(b);
        value.textContent = formula;
        canvas.setAttribute("aria-label", text("Julia set for ", "Juliova množina pro ") + formula);
      }

      function stop() {
        generation += 1;
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
      }

      function draw() {
        stop();
        if (!inView || document.hidden || !dirty) return;
        const run = generation;
        const width = Math.min(600, Math.max(240, Math.round(canvas.clientWidth * Math.min(devicePixelRatio || 1, 1.5))));
        const height = Math.round(width * 2 / 3);
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
        const pixels = context.createImageData(width, height);
        const a = Number(real.value);
        const b = Number(imaginary.value);
        const limit = 140;
        let row = 0;

        function batch() {
          frame = 0;
          if (run !== generation || !inView || document.hidden) return;
          const until = Math.min(height, row + 14);
          for (; row < until; row += 1) {
            for (let column = 0; column < width; column += 1) {
              let x = (column / width - 0.5) * 3.6;
              let y = (row / height - 0.5) * 2.4;
              let n = 0;
              while (x * x + y * y <= 4 && n < limit) {
                const nextX = x * x - y * y + a;
                y = 2 * x * y + b;
                x = nextX;
                n += 1;
              }
              const i = (row * width + column) * 4;
              if (n === limit) {
                pixels.data[i] = 17;
                pixels.data[i + 1] = 13;
                pixels.data[i + 2] = 22;
              } else {
                const smooth = n + 1 - Math.log2(Math.log2(Math.max(x * x + y * y, 4)) / 2);
                const t = Math.min(1, Math.max(0, smooth / 35));
                pixels.data[i] = 32 + 221 * Math.pow(t, .44);
                pixels.data[i + 1] = 18 + 213 * Math.pow(t, 1.6);
                pixels.data[i + 2] = 33 + 125 * Math.pow(t, 2.7);
              }
              pixels.data[i + 3] = 255;
            }
          }
          if (row < height) {
            frame = requestAnimationFrame(batch);
          } else {
            // Commit a complete image, so there is no flashing or half-painted frame.
            context.putImageData(pixels, 0, 0);
            dirty = false;
          }
        }
        frame = requestAnimationFrame(batch);
      }

      function requestRender() {
        dirty = true;
        updateLabels();
        draw();
      }

      real.addEventListener("input", requestRender);
      imaginary.addEventListener("input", requestRender);
      julia.querySelector("[data-julia-reset]").addEventListener("click", () => {
        real.value = "-0.8";
        imaginary.value = "0.156";
        requestRender();
      });
      julia.hidden = false;
      const fallback = document.querySelector("[data-julia-fallback]");
      if (fallback) fallback.hidden = true;
      updateLabels();
      languageListeners.push(updateLabels);
      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
          inView = entries[0].isIntersecting;
          if (inView) draw();
          else stop();
        }, { threshold: 0 });
        observer.observe(canvas);
      } else {
        inView = true;
        draw();
      }
      if ("ResizeObserver" in window) {
        new ResizeObserver(requestRender).observe(canvas);
      } else {
        window.addEventListener("resize", requestRender);
      }
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) stop();
        else draw();
      });
    }
  }

  // Original, independently verified mate-in-one. This is a fixed teaching puzzle,
  // not a browser build of the C++ engine. FEN: 7k/8/5KQ1/8/8/8/8/8 w - - 0 1
  const puzzle = document.querySelector("[data-puzzle-interactive]");
  if (puzzle) {
    const board = puzzle.querySelector("[data-puzzle-board]");
    const message = puzzle.querySelector("[data-puzzle-message]");
    const squares = [];
    let selected = "";
    let solved = false;
    let messageKey = "start";
    let focused = "g6";
    const symbols = { K: "♚", Q: "♛", k: "♚" };
    const pieceName = (piece) => ({
      K: text("white king", "bílý král"),
      Q: text("white queen", "bílá dáma"),
      k: text("black king", "černý král")
    }[piece] || text("empty", "prázdné"));
    const pieceAt = (square) => square === "h8" ? "k" : square === "f6" ? "K" : square === (solved ? "g7" : "g6") ? "Q" : "";
    const messages = {
      start: ["Can you close every escape route? White to move.", "Zvládneš zavřít všechny únikové cesty? Bílý táhne."],
      queen: ["Queen selected. Choose her destination.", "Dáma je vybraná. Vyber její cílové pole."],
      king: ["The king already protects the crucial square. Try the queen.", "Král už chrání rozhodující pole. Zkus dámu."],
      black: ["You play White. Start with your queen on g6.", "Hraješ za bílé. Začni svou dámou na g6."],
      empty: ["Select your queen on g6, then choose a destination.", "Vyber svou dámu na g6 a potom cílové pole."],
      illegal: ["A queen moves along a rank, file, or diagonal and cannot jump over a piece. Try another square.", "Dáma se pohybuje po řadě, sloupci nebo diagonále a nemůže přeskočit figurku. Zkus jiné pole."],
      wrong: ["That is not mate in one. Try covering the escape squares while keeping your queen protected.", "To není mat prvním tahem. Zkus pokrýt úniková pole a současně chránit svou dámu."],
      hint: ["The queen must cover g8 and h7, and your king must protect her. Look at g7.", "Dáma musí pokrýt g8 a h7 a tvůj král ji musí chránit. Podívej se na g7."],
      solved: ["Qg7# — checkmate! The queen covers g8 and h7. Kxg7 is impossible: your king on f6 protects her.", "Dg7# — mat! Dáma pokrývá g8 a h7. Kxg7 nejde: tvůj král na f6 ji chrání."]
    };

    function updatePuzzle() {
      squares.forEach((button) => {
        const square = button.dataset.square;
        const piece = pieceAt(square);
        button.dataset.piece = piece;
        button.querySelector(".puzzle-piece").textContent = symbols[piece] || "";
        button.setAttribute("aria-label", `${square}, ${pieceName(piece)}`);
        button.setAttribute("aria-selected", String(square === selected));
        button.tabIndex = square === focused ? 0 : -1;
        button.classList.toggle("is-solution", solved && square === "g7");
      });
      board.setAttribute("aria-label", solved
        ? text("Solved chess puzzle. White king f6, queen g7; black king h8. Checkmate.", "Vyřešená šachová úloha. Bílý král f6, dáma g7; černý král h8. Mat.")
        : text("Chess puzzle. White king f6, queen g6; black king h8.", "Šachová úloha. Bílý král f6, dáma g6; černý král h8."));
      message.textContent = text(...messages[messageKey]);
    }

    function select(square) {
      if (solved) return;
      const piece = pieceAt(square);
      if (square === selected) {
        selected = "";
        messageKey = "start";
      } else if (piece === "Q") {
        selected = square;
        messageKey = "queen";
      } else if (piece === "K") {
        messageKey = "king";
      } else if (selected) {
        const dx = Math.abs(square.charCodeAt(0) - "g".charCodeAt(0));
        const dy = Math.abs(Number(square[1]) - 6);
        if (square === "g7") {
          solved = true;
          selected = "";
          messageKey = "solved";
        } else {
          const blocked = square[1] === "6" && square.charCodeAt(0) < "f".charCodeAt(0);
          messageKey = piece === "k" || blocked || (dx !== 0 && dy !== 0 && dx !== dy) ? "illegal" : "wrong";
        }
      } else {
        messageKey = piece === "k" ? "black" : "empty";
      }
      updatePuzzle();
    }

    for (let row = 0; row < 8; row += 1) {
      const rowElement = document.createElement("div");
      rowElement.className = "puzzle-row";
      rowElement.setAttribute("role", "row");
      for (let column = 0; column < 8; column += 1) {
        const square = String.fromCharCode(97 + column) + (8 - row);
        const button = document.createElement("button");
        button.type = "button";
        button.className = `puzzle-square${(row + column) % 2 ? " is-dark" : ""}`;
        button.dataset.square = square;
        button.setAttribute("role", "gridcell");
        const piece = document.createElement("span");
        piece.className = "puzzle-piece";
        piece.setAttribute("aria-hidden", "true");
        button.append(piece);
        if (row === 7 || column === 0) {
          const coordinate = document.createElement("span");
          coordinate.className = "puzzle-coordinate";
          coordinate.setAttribute("aria-hidden", "true");
          coordinate.textContent = row === 7 ? String.fromCharCode(97 + column) : String(8 - row);
          button.append(coordinate);
        }
        button.addEventListener("focus", () => {
          focused = square;
          squares.forEach((item) => { item.tabIndex = item === button ? 0 : -1; });
        });
        button.addEventListener("click", () => select(square));
        button.addEventListener("keydown", (event) => {
          let nextRow = row;
          let nextColumn = column;
          if (event.key === "ArrowLeft") nextColumn = Math.max(0, column - 1);
          else if (event.key === "ArrowRight") nextColumn = Math.min(7, column + 1);
          else if (event.key === "ArrowUp") nextRow = Math.max(0, row - 1);
          else if (event.key === "ArrowDown") nextRow = Math.min(7, row + 1);
          else if (event.key === "Home") { nextColumn = 0; if (event.ctrlKey) nextRow = 0; }
          else if (event.key === "End") { nextColumn = 7; if (event.ctrlKey) nextRow = 7; }
          else return;
          event.preventDefault();
          squares[nextRow * 8 + nextColumn].focus();
        });
        squares.push(button);
        rowElement.append(button);
      }
      board.append(rowElement);
    }
    puzzle.querySelector("[data-puzzle-hint]").addEventListener("click", () => {
      messageKey = solved ? "solved" : "hint";
      updatePuzzle();
    });
    puzzle.querySelector("[data-puzzle-reset]").addEventListener("click", () => {
      solved = false;
      selected = "";
      focused = "g6";
      messageKey = "start";
      updatePuzzle();
    });
    updatePuzzle();
    languageListeners.push(updatePuzzle);
    puzzle.hidden = false;
    const fallback = document.querySelector("[data-puzzle-fallback]");
    if (fallback) fallback.hidden = true;
  }

  const terminal = document.querySelector("[data-portfolio-terminal]");
  if (terminal && typeof terminal.showModal === "function") {
    const output = terminal.querySelector("[data-terminal-output]");
    const input = terminal.querySelector("[data-terminal-input]");
    let opener = null;
    const history = [];
    const responses = {
      welcome: ["You found the terminal. Of course there’s one.\nTry help, about, projects, or clear", "Našel jsi terminál. Samozřejmě tu jeden je.\nZkus help, about, projects nebo clear"],
      help: ["help      show these commands\nabout     a little about me\nprojects  what I build\nclear     clear this screen", "help      seznam příkazů\nabout     něco o mně\nprojects  co tvořím\nclear     vymazat obrazovku"],
      about: ["Michal Krbec\nCybersecurity student in Prague. I write C++ to understand algorithms, work on FPV hardware, and spend too long configuring Arch.", "Michal Krbec\nStudent kyberbezpečnosti v Praze. Píšu v C++, abych pochopil algoritmy, pracuji na FPV hardwaru a trávím příliš času konfigurací Archu."],
      projects: ["Komplex — a C++ / Qt 6 fractal explorer.\nChess — my own C++ engine, with a graphical board and UCI.\nOpen Works to explore both projects.", "Komplex — prohlížeč fraktálů v C++ / Qt 6.\nChess — můj vlastní C++ engine s grafickou šachovnicí a UCI.\nOba najdeš na stránce Projekty."],
      unknown: ["Unknown command. Type help for the four available commands.", "Neznámý příkaz. Napiš help pro seznam čtyř dostupných příkazů."]
    };

    function appendLine(item) {
      const line = document.createElement("p");
      line.textContent = item.command !== undefined ? `misa@arch ~ $ ${item.command}` : text(...responses[item.key]);
      if (item.command !== undefined) line.className = "terminal-command";
      output.append(line);
      while (output.children.length > 50) output.firstElementChild.remove();
    }

    function addLine(item) {
      history.push(item);
      if (history.length > 50) history.shift();
      appendLine(item);
      output.scrollTop = output.scrollHeight;
    }

    function renderHistory() {
      output.replaceChildren();
      history.forEach(appendLine);
      output.scrollTop = output.scrollHeight;
    }

    document.querySelectorAll("[data-terminal-open]").forEach((trigger) => {
      trigger.hidden = false;
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        if (terminal.open) return;
        opener = trigger;
        if (!history.length) addLine({ key: "welcome" });
        terminal.showModal();
        input.focus();
      });
    });
    terminal.querySelector("[data-terminal-close]").addEventListener("click", () => terminal.close());
    terminal.addEventListener("close", () => { if (opener?.isConnected) opener.focus(); });
    terminal.addEventListener("click", (event) => {
      if (event.target !== terminal) return;
      const bounds = terminal.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) terminal.close();
    });
    terminal.querySelector("[data-terminal-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      const command = input.value.trim().slice(0, 120);
      if (!command) return;
      input.value = "";
      const normalized = command.toLowerCase();
      if (normalized === "clear") {
        history.length = 0;
        output.replaceChildren();
      } else {
        addLine({ command });
        addLine({ key: ["help", "about", "projects"].includes(normalized) ? normalized : "unknown" });
      }
      input.focus();
    });
    languageListeners.push(renderHistory);
  }
})();
