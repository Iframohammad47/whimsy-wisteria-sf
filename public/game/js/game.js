/* =========================================================
   WHIMSY WISTERIA — Game Engine
   Vanilla JS. Data-driven. State reflected in the UI.
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Central state ---------- */
  const state = {
    stageIndex: 0,
    bouquet: [], // array of flower ids
  };

  let inventory = {}; // { rose: n, sunflower: n, lavender: n } for current stage
  const touched = {}; // types the player has interacted with this stage
  const MAX_BOUQUET = 8;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Safe element lookup ---------- */
  function $(id) {
    return document.getElementById(id);
  }

  /* ---------- Scene manager ---------- */
  function setActiveScene(id) {
    const scenes = document.querySelectorAll(".scene");
    scenes.forEach(function (s) {
      s.classList.toggle("active", s.id === id);
    });
  }

  /* ---------- Auto-advancing dialogue ---------- */
  let dialogueToken = 0;
  const dialogueTimers = [];

  function clearDialogueTimers() {
    while (dialogueTimers.length) {
      clearTimeout(dialogueTimers.pop());
    }
  }

  function readingTime(text) {
    return Math.max(2200, Math.min(2000 + text.length * 30, 5600));
  }

  /* Play lines one at a time, auto-advancing, then reveal the action. */
  function playDialogue(textEl, actionEl, lines, onFinished) {
    if (!textEl) return;
    dialogueToken += 1;
    const myToken = dialogueToken;
    clearDialogueTimers();

    if (actionEl) actionEl.classList.remove("show");

    let i = 0;

    function showLine() {
      if (myToken !== dialogueToken) return;
      if (i >= lines.length) {
        if (actionEl) actionEl.classList.add("show");
        if (typeof onFinished === "function") onFinished();
        return;
      }
      const line = lines[i];
      // Replace previous line so a single line fades in at a time.
      textEl.innerHTML = "";
      const span = document.createElement("span");
      span.className = "dialogue__line";
      span.textContent = line;
      textEl.appendChild(span);

      i += 1;
      const t = setTimeout(showLine, readingTime(line));
      dialogueTimers.push(t);
    }

    showLine();
  }

  /* ---------- INTRO ---------- */
  function startIntro() {
    const character = $("intro-character");
    const dialogue = $("intro-dialogue");
    if (character) character.style.opacity = "1";
    if (dialogue) dialogue.style.opacity = "1";

    setActiveScene("scene-intro");
    playDialogue($("intro-text"), $("intro-action"), INTRO_LINES);
  }

  /* ---------- INTRO -> GARDEN cinematic transition ---------- */
  let transitioning = false;

  function transitionToGarden() {
    if (transitioning) return;
    transitioning = true;

    const character = $("intro-character");
    const dialogue = $("intro-dialogue");
    const zoom = $("wisteria-zoom");
    const introBtn = $("intro-btn");

    if (introBtn) introBtn.disabled = true;
    clearDialogueTimers();

    // Step 1 & 2: character and dialogue fade away.
    if (character) character.style.opacity = "0";
    if (dialogue) dialogue.style.opacity = "0";

    // Steps 3-4: wisteria fills the screen and zooms forward.
    if (zoom && !prefersReducedMotion) {
      zoom.classList.add("run");
    }

    const revealDelay = prefersReducedMotion ? 200 : 1300;
    const endDelay = prefersReducedMotion ? 400 : 2700;

    // Step 5: prepare and reveal the garden underneath.
    setTimeout(function () {
      startStage(0);
      setActiveScene("scene-garden");
    }, revealDelay);

    // Step 6: clean up the overlay.
    setTimeout(function () {
      if (zoom) zoom.classList.remove("run");
      transitioning = false;
    }, endDelay);
  }

  /* ---------- STAGE SETUP ---------- */
  function startStage(index) {
    state.stageIndex = index;
    const stage = STAGES[index];
    if (!stage) {
      goToEnding();
      return;
    }

    // Reset bouquet + inventory for this stage.
    state.bouquet = [];
    inventory = {};
    Object.keys(touched).forEach(function (k) {
      delete touched[k];
    });

    // Inventory is per flower TYPE present in this stage.
    stage.flowers.forEach(function (f) {
      const def = FLOWERS[f.id];
      if (def) inventory[f.id] = def.maxQuantity;
    });

    renderLetter(stage);
    renderFlowers(stage); // hidden until the letter is dismissed
    hideBouquetPanel();
    clearPickMessage();

    setActiveScene("scene-garden");
  }

  /* ---------- LETTER ---------- */
  function renderLetter(stage) {
    const mount = $("letter-mount");
    if (!mount) return;
    mount.innerHTML = "";

    const letter = document.createElement("div");
    letter.className = "letter";
    letter.setAttribute("role", "region");
    letter.setAttribute("aria-label", "A letter");

    const count = document.createElement("p");
    count.className = "letter__count";
    count.textContent = "Letter " + stage.number + " of " + STAGES.length;

    const title = document.createElement("h2");
    title.className = "letter__title";
    title.textContent = stage.occasion;

    const body = document.createElement("div");
    body.className = "letter__body";
    stage.letter.forEach(function (para) {
      const p = document.createElement("p");
      p.textContent = para;
      body.appendChild(p);
    });

    const action = document.createElement("button");
    action.type = "button";
    action.className = "btn letter__action";
    action.textContent = "Make bouquet?";
    action.addEventListener("click", function () {
      dismissLetter(letter);
    });

    letter.appendChild(count);
    letter.appendChild(title);
    letter.appendChild(body);
    letter.appendChild(action);
    mount.appendChild(letter);

    // Flowers + bouquet stay hidden while the letter is up.
    setFlowersVisible(false);
  }

  function dismissLetter(letter) {
    letter.classList.add("leaving");
    const revealFlowers = function () {
      setFlowersVisible(true);
      showBouquetPanel();
      const letterMount = $("letter-mount");
      if (letterMount) letterMount.innerHTML = "";
    };
    if (prefersReducedMotion) {
      revealFlowers();
    } else {
      setTimeout(revealFlowers, 650);
    }
  }

  /* ---------- FLOWERS ---------- */
  function renderFlowers(stage) {
    const field = $("flower-field");
    if (!field) return;
    field.innerHTML = "";

    stage.flowers.forEach(function (f, idx) {
      const def = FLOWERS[f.id];
      if (!def) return;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "flower";
      btn.dataset.type = f.id;
      btn.dataset.index = String(idx);
      btn.style.left = f.left + "%";
      btn.style.top = f.top + "%";
      btn.setAttribute(
        "aria-label",
        def.name + " — " + def.meaning + ". Pick to add to your bouquet."
      );

      const img = document.createElement("img");
      img.src = def.image;
      img.alt = "";
      btn.appendChild(img);

      const badge = document.createElement("span");
      badge.className = "flower__badge";
      badge.setAttribute("aria-hidden", "true");
      btn.appendChild(badge);

      btn.addEventListener("click", function () {
        pickFlower(f.id, btn);
      });

      field.appendChild(btn);
    });

    updateFlowerStates();
  }

  function setFlowersVisible(visible) {
    const field = $("flower-field");
    if (!field) return;
    field.style.transition = "opacity 0.6s ease";
    field.style.opacity = visible ? "1" : "0";
    field.style.pointerEvents = visible ? "auto" : "none";
  }

  function pickFlower(typeId, btn) {
    const def = FLOWERS[typeId];
    if (!def) return;

    // Full armful — refuse politely.
    if (state.bouquet.length >= MAX_BOUQUET) {
      showPickMessage("That's a full armful already.");
      return;
    }
    // Type depleted.
    if (!inventory[typeId] || inventory[typeId] <= 0) {
      return;
    }

    inventory[typeId] -= 1;
    touched[typeId] = true;
    state.bouquet.push(typeId);

    // Satisfying little animation on the picked flower.
    if (!prefersReducedMotion) {
      btn.classList.remove("picking");
      // reflow to restart animation
      void btn.offsetWidth;
      btn.classList.add("picking");
    }

    showPickMessage(def.name + " — " + def.meaning + ".");
    updateFlowerStates();
    renderBouquet($("bouquet-stage"), state.bouquet, false);
    updateBouquetPanel();

    if (state.bouquet.length >= MAX_BOUQUET) {
      showPickMessage("That's a full armful already.");
    }
  }

  function updateFlowerStates() {
    const flowers = document.querySelectorAll(".flower");
    flowers.forEach(function (btn) {
      const type = btn.dataset.type;
      const remaining = inventory[type] || 0;
      const badge = btn.querySelector(".flower__badge");
      if (badge) badge.textContent = String(remaining);

      const depleted = remaining <= 0;
      btn.classList.toggle("depleted", depleted);
      btn.classList.toggle("touched", !!touched[type] && !depleted);
      btn.disabled = depleted;

      const def = FLOWERS[type];
      if (def) {
        btn.setAttribute(
          "aria-label",
          def.name +
            " — " +
            def.meaning +
            ". " +
            (depleted
              ? "None remaining."
              : remaining + " remaining. Pick to add to your bouquet.")
        );
      }
    });
  }

  /* ---------- PICK MESSAGE ---------- */
  let pickMsgTimer = null;
  function showPickMessage(text) {
    const el = $("pick-message");
    if (!el) return;
    el.textContent = text;
    el.classList.add("show");
    if (pickMsgTimer) clearTimeout(pickMsgTimer);
    pickMsgTimer = setTimeout(function () {
      el.classList.remove("show");
    }, 2400);
  }
  function clearPickMessage() {
    const el = $("pick-message");
    if (el) {
      el.classList.remove("show");
      el.textContent = "";
    }
  }

  /* ---------- BOUQUET RENDERING ----------
     Flowers fan out from a shared base so stems converge — a held bunch,
     not a row of icons. transform-origin is the bottom-center of each flower. */
  function renderBouquet(container, bouquet, large) {
    if (!container) return;
    container.innerHTML = "";

    const n = bouquet.length;
    if (n === 0) return;

    const step = Math.min(15, 78 / Math.max(n, 1));
    const baseHeight = large ? 168 : 118;

    bouquet.forEach(function (id, i) {
      const def = FLOWERS[id];
      if (!def) return;
      const img = document.createElement("img");
      img.className = "bouquet-flower";
      img.src = def.image;
      img.alt = "";
      img.setAttribute("aria-hidden", "true");

      const angle = (i - (n - 1) / 2) * step;
      // Outer flowers sit slightly higher for a rounded top.
      const lift = Math.abs(i - (n - 1) / 2) * (large ? 4 : 3);
      img.style.height = baseHeight + "px";
      img.style.zIndex = String(10 + i);
      img.style.transform =
        "translateX(-50%) translateY(" +
        -lift +
        "px) rotate(" +
        angle.toFixed(2) +
        "deg)";
      container.appendChild(img);
    });

    const tie = document.createElement("div");
    tie.className = "bouquet-tie";
    container.appendChild(tie);
  }

  function updateBouquetPanel() {
    const count = $("bouquet-count");
    const done = $("done-btn");
    const n = state.bouquet.length;
    if (count) {
      count.textContent =
        n === 0 ? "" : n + " of " + MAX_BOUQUET + " gathered";
    }
    if (done) done.disabled = n === 0;

    const stage = $("bouquet-stage");
    if (stage && n === 0) {
      stage.innerHTML =
        '<p class="bouquet-empty">A gentle bunch will gather here.</p>';
    }
  }

  function showBouquetPanel() {
    const panel = $("bouquet-panel");
    if (!panel) return;
    panel.hidden = false;
    renderBouquet($("bouquet-stage"), state.bouquet, false);
    updateBouquetPanel();
  }
  function hideBouquetPanel() {
    const panel = $("bouquet-panel");
    if (panel) panel.hidden = true;
  }

  function startOver() {
    state.bouquet = [];
    const stage = STAGES[state.stageIndex];
    inventory = {};
    Object.keys(touched).forEach(function (k) {
      delete touched[k];
    });
    if (stage) {
      stage.flowers.forEach(function (f) {
        const def = FLOWERS[f.id];
        if (def) inventory[f.id] = def.maxQuantity;
      });
    }
    updateFlowerStates();
    renderBouquet($("bouquet-stage"), state.bouquet, false);
    updateBouquetPanel();
    clearPickMessage();
  }

  /* ---------- DONE -> RESPONSE ---------- */
  function goToResponse() {
    const stage = STAGES[state.stageIndex];
    if (!stage) return;

    // Carry the bouquet into the response scene.
    renderBouquet($("response-bouquet"), state.bouquet, true);

    const lines = stage.responseFor(state.bouquet.slice());
    const isFinal = state.stageIndex >= STAGES.length - 1;

    const btn = $("response-btn");
    if (btn) {
      btn.textContent = isFinal ? "Sit with her a while" : "Next letter?";
      btn.onclick = function () {
        if (isFinal) {
          goToEnding();
        } else {
          startStage(state.stageIndex + 1);
        }
      };
    }

    setActiveScene("scene-response");
    playDialogue($("response-text"), $("response-action"), lines);
  }

  /* ---------- ENDING ---------- */
  function goToEnding() {
    setActiveScene("scene-ending");
    playDialogue($("ending-text"), $("ending-action"), ENDING_LINES);
  }

  function resetGame() {
    clearDialogueTimers();
    state.stageIndex = 0;
    state.bouquet = [];
    inventory = {};
    Object.keys(touched).forEach(function (k) {
      delete touched[k];
    });
    hideBouquetPanel();
    clearPickMessage();
    const respBouquet = $("response-bouquet");
    if (respBouquet) respBouquet.innerHTML = "";
    transitioning = false;
    startIntro();
  }

  /* ---------- AUDIO ---------- */
  function setupAudio() {
    const toggle = $("audio-toggle");
    const audio = $("theme");
    if (!toggle || !audio) return;
    let playing = false;

    toggle.addEventListener("click", function () {
      if (!playing) {
        const p = audio.play();
        if (p && typeof p.then === "function") {
          p.then(function () {
            playing = true;
            toggle.innerHTML = "&#9834; Music on";
            toggle.setAttribute("aria-pressed", "true");
          }).catch(function () {
            // Audio file missing or blocked — fail gracefully.
            playing = false;
            toggle.innerHTML = "&#9834; Music off";
            toggle.setAttribute("aria-pressed", "false");
          });
        }
      } else {
        audio.pause();
        playing = false;
        toggle.innerHTML = "&#9834; Music off";
        toggle.setAttribute("aria-pressed", "false");
      }
    });
  }

  /* ---------- INIT ---------- */
  function init() {
    // Wire the fixed buttons once (no duplicate listeners).
    const introBtn = $("intro-btn");
    if (introBtn) introBtn.addEventListener("click", transitionToGarden);

    const startOverBtn = $("start-over");
    if (startOverBtn) startOverBtn.addEventListener("click", startOver);

    const doneBtn = $("done-btn");
    if (doneBtn) doneBtn.addEventListener("click", goToResponse);

    const endingBtn = $("ending-btn");
    if (endingBtn) endingBtn.addEventListener("click", resetGame);

    setupAudio();
    startIntro();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
