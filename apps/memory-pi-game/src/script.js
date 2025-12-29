(function () {
  let currentTimeMs = 0;
  const MAX_DISPLAY_LIMIT = 1000;
  const MAX_TIMEOUT_SECONDS = 60;
  const MAX_START_INDEX = 100000;
  let currentDigitCount = 0;
  let practiceStartIndex = 0;

  let bestTimeRegistered = Number(localStorage.getItem("bestTime")) || 0;
  let bestDigitCountRegistered = Number(localStorage.getItem("bestNbdec")) || 0;

  let gameStartTime;
  let lastDigitInputTime;

  /**
   * Loads game settings from localStorage or returns defaults.
   */
  function loadGameSettings() {
    const storedOptions = JSON.parse(localStorage.getItem("options"));

    return {
      maxAllowedSeconds: Number(
        storedOptions && "tpsMax" in storedOptions ? storedOptions.tpsMax : 3
      ),
      digitGroupSize: Number(
        storedOptions && "nbspace" in storedOptions ? storedOptions.nbspace : 2
      ),
    };
  }

  let maxAllowedSeconds = loadGameSettings().maxAllowedSeconds;
  let countdownTimerId;

  let digitGroupSize = loadGameSettings().digitGroupSize;

  let isGameOver = false;
  let keepFocusActive = false;
  let isPracticeModeActive = false;
  let isOptionsPanelOpen = false;

  const PI_DIGITS =
    "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989";

  function formatMillisecondsToTime(duration) {
    var milliseconds = parseInt(duration % 1000),
      seconds = parseInt((duration / 1000) % 60),
      minutes = parseInt((duration / (1000 * 60)) % 60);
    seconds = seconds < 10 ? "0" + seconds : seconds;
    if (milliseconds < 10) milliseconds = "00" + milliseconds;
    else if (milliseconds < 100) milliseconds = "0" + milliseconds;
    return minutes + ":" + seconds + "'" + milliseconds;
  }

  function updateCurrentTimeDisplay(timeMs) {
    currentTimeMs = timeMs;
    document.getElementById("current-score-time").textContent =
      formatMillisecondsToTime(timeMs);
  }

  function updateCurrentDigitCountDisplay(count) {
    currentDigitCount = count;
    document.getElementById("current-score-digits").textContent = count;
  }

  function updateBestTimeDisplay(timeMs) {
    bestTimeRegistered = timeMs;
    localStorage.setItem("bestTime", bestTimeRegistered);
    document.getElementById("best-score-time").textContent =
      formatMillisecondsToTime(timeMs);
  }

  function updateBestDigitCountDisplay(count) {
    bestDigitCountRegistered = count;
    localStorage.setItem("bestNbdec", bestDigitCountRegistered);
    document.getElementById("best-score-digits").textContent = count;
  }

  /**
   * Utility to create a button with given properties.
   */
  function createButton(value, className, id, onClick) {
    const btn = document.createElement("input");
    btn.type = "submit";
    btn.value = value;
    if (className) btn.className = className;
    if (id) btn.id = id;
    if (onClick) btn.addEventListener("click", onClick);
    return btn;
  }

  function resetGameUI() {
    keepFocusActive = false;
    const actionButtons = document.getElementById("action-buttons");
    actionButtons.replaceChildren(
      createButton("Play", null, "play-btn", startGame)
    );

    document.getElementById("pi-digits-output").textContent = "";
    document.getElementById("cursor-element").textContent = "";
    document.getElementById("game-input-container").style.display = "none";
    document.getElementById("feedback-container").style.display = "none";
    document.getElementById("feedback-text").textContent = "\u00A0"; // &nbsp; equivalent

    clearTimeout(countdownTimerId);
    updateCurrentTimeDisplay(0);
    updateCurrentDigitCountDisplay(0);

    if (isPracticeModeActive) {
      actionButtons.prepend(document.createElement("br"));
      actionButtons.prepend(
        createButton("Back", null, null, togglePracticeMode)
      );
      const playBtn = actionButtons.querySelector("#play-btn");
      if (playBtn) {
        const space = document.createTextNode("\u00A0");
        actionButtons.insertBefore(space, playBtn);
      }
    } else if (isOptionsPanelOpen) {
      actionButtons.replaceChildren();
      actionButtons.appendChild(document.createElement("br"));
      actionButtons.appendChild(
        createButton("Back", null, null, () => {
          revertSettingsInputs();
          toggleOptions();
        })
      );
      actionButtons.appendChild(document.createTextNode("\u00A0"));
      actionButtons.appendChild(
        createButton("Apply", null, null, saveGameSettings)
      );
    } else {
      actionButtons.replaceChildren();
      actionButtons.appendChild(
        createButton("Play", null, "play-btn", startGame)
      );
      actionButtons.appendChild(document.createElement("br"));
      actionButtons.appendChild(
        createButton(
          "Practice",
          null,
          "practice-toggle-btn",
          togglePracticeMode
        )
      );
      actionButtons.appendChild(document.createElement("br"));
      actionButtons.appendChild(
        createButton("Options", null, "options-toggle-btn", toggleOptions)
      );
    }
  }

  function toggleOptions() {
    if (isPracticeModeActive) togglePracticeMode();
    isOptionsPanelOpen = !isOptionsPanelOpen;
    resetGameUI();
    const optionsToggleBtn = document.getElementById("options-toggle-btn");
    const optionsPanel = document.getElementById("options-panel");
    if (isOptionsPanelOpen) {
      optionsPanel.style.display = "";
      if (optionsToggleBtn)
        optionsToggleBtn.style.cssText = "background:#89e6ff; color:black";
    } else {
      optionsPanel.style.display = "none";
      if (optionsToggleBtn)
        optionsToggleBtn.style.cssText = "background:#1763ba";
    }
  }

  function validateTimeoutSetting() {
    let val = document.getElementById("timeout-setting-input").value;
    if (val > MAX_TIMEOUT_SECONDS) val = MAX_TIMEOUT_SECONDS;
    if (val < 1 && val !== "") val = 1;
    document.getElementById("timeout-setting-input").value = val;
  }

  function validateGroupSizeSetting() {
    let val = document.getElementById("group-size-setting-input").value;
    if (val > MAX_DISPLAY_LIMIT) val = MAX_DISPLAY_LIMIT;
    if (val < 1 && val !== "") val = 1;
    document.getElementById("group-size-setting-input").value = val;
  }

  function saveGameSettings() {
    maxAllowedSeconds =
      parseInt(document.getElementById("timeout-setting-input").value) || 3;
    digitGroupSize =
      parseInt(document.getElementById("group-size-setting-input").value) || 2;
    localStorage.setItem(
      "options",
      JSON.stringify({ tpsMax: maxAllowedSeconds, nbspace: digitGroupSize })
    );

    document.getElementById("timeout-rule-display").textContent =
      maxAllowedSeconds;
  }

  function revertSettingsInputs() {
    document.getElementById("timeout-setting-input").value = maxAllowedSeconds;
    document.getElementById("group-size-setting-input").value = digitGroupSize;
  }

  function togglePracticeMode() {
    if (isOptionsPanelOpen) toggleOptions();
    isPracticeModeActive = !isPracticeModeActive;
    resetGameUI();
    renderPracticeDigits();
    const practiceToggleBtn = document.getElementById("practice-toggle-btn");
    const practiceSection = document.getElementById("practice-section");
    if (isPracticeModeActive) {
      practiceSection.style.display = "";
      if (practiceToggleBtn)
        practiceToggleBtn.style.cssText = "background:#89e6ff; color:black";
    } else {
      practiceSection.style.display = "none";
      if (practiceToggleBtn)
        practiceToggleBtn.style.cssText = "background:#1763ba";
    }
  }

  function renderPracticeDigits() {
    keepFocusActive = false;
    const piDisplayView = document.getElementById("pi-display-view");
    piDisplayView.replaceChildren();

    let digitsToCount = parseInt(
      document.getElementById("practice-digit-count-input").value
    );
    if (digitsToCount > MAX_DISPLAY_LIMIT) {
      digitsToCount = MAX_DISPLAY_LIMIT;
      document.getElementById("practice-digit-count-input").value =
        digitsToCount;
    }
    if (digitsToCount < 1) {
      digitsToCount = 1;
      document.getElementById("practice-digit-count-input").value =
        digitsToCount;
    }

    let practiceDigits = PI_DIGITS.substring(
      practiceStartIndex + 2,
      practiceStartIndex + digitsToCount + 2
    );

    let groupSize =
      parseInt(document.getElementById("group-size-setting-input").value) || 2;
    if (groupSize > MAX_DISPLAY_LIMIT) {
      groupSize = MAX_DISPLAY_LIMIT;
      document.getElementById("group-size-setting-input").value = groupSize;
    }

    if (practiceStartIndex === 0) {
      piDisplayView.appendChild(document.createTextNode("3."));
    } else {
      piDisplayView.appendChild(document.createTextNode(".."));
    }

    if (groupSize > 0) {
      let formattedDigits = "";
      for (
        let formatIndex = 0;
        formatIndex < practiceDigits.length;
        formatIndex++
      ) {
        formattedDigits += practiceDigits[formatIndex];
        if (
          (formatIndex + 1) % groupSize === 0 &&
          formatIndex !== practiceDigits.length - 1
        ) {
          formattedDigits += " ";
        }
      }
      piDisplayView.appendChild(document.createTextNode(formattedDigits));
    } else {
      piDisplayView.appendChild(document.createTextNode(practiceDigits));
    }
  }

  function updatePracticeStart() {
    keepFocusActive = false;
    let userStartIndex = parseInt(
      document.getElementById("practice-start-input").value
    );
    if (userStartIndex > MAX_START_INDEX) {
      userStartIndex = MAX_START_INDEX;
      document.getElementById("practice-start-input").value = userStartIndex;
    }
    if (userStartIndex < 1) {
      userStartIndex = 1;
      document.getElementById("practice-start-input").value = userStartIndex;
    }
    practiceStartIndex = userStartIndex - 1;
    renderPracticeDigits();
  }

  function startGame() {
    if (isOptionsPanelOpen) toggleOptions();
    resetGameUI();
    isGameOver = false;
    document.getElementById("pi-digits-output").style.color = "green";

    let displayPrefix = "3.";
    if (isPracticeModeActive) {
      if (practiceStartIndex === 1) displayPrefix = "3.1";
      else if (practiceStartIndex === 2) displayPrefix = "3.14 ";
      else if (practiceStartIndex > 2) displayPrefix = "..";
    }

    const outputContainer = document.getElementById("pi-digits-output");
    outputContainer.replaceChildren();
    const prefixSpan = document.createElement("span");
    prefixSpan.style.color = "black";
    prefixSpan.textContent = displayPrefix;
    outputContainer.appendChild(prefixSpan);

    document.getElementById("cursor-element").textContent = "_";
    document.getElementById("game-input-container").style.display = "";
    document.getElementById("feedback-container").style.display = "";

    const feedbackText = document.getElementById("feedback-text");
    feedbackText.style.cssText = "background:white; width:100%; color:green;";
    feedbackText.textContent = "Go!";

    document.getElementById("hidden-input-field").focus();

    const actionButtons = document.getElementById("action-buttons");
    actionButtons.replaceChildren();
    if (!isPracticeModeActive) {
      actionButtons.appendChild(createButton("Back", null, null, resetGameUI));
    } else {
      actionButtons.appendChild(
        createButton("Back", null, null, togglePracticeMode)
      );
    }
    actionButtons.appendChild(document.createTextNode("\u00A0"));
    actionButtons.appendChild(createButton("Restart", null, null, startGame));

    keepFocusActive = true;
    maintainInputFieldFocus();
  }

  function endGameWithResult(message) {
    clearTimeout(countdownTimerId);
    updateCurrentTimeDisplay(currentTimeMs);
    if (
      !isPracticeModeActive &&
      currentDigitCount >= bestDigitCountRegistered
    ) {
      if (
        currentTimeMs < bestTimeRegistered ||
        bestTimeRegistered == 0 ||
        currentDigitCount > bestDigitCountRegistered
      ) {
        updateBestTimeDisplay(currentTimeMs);
      }
      updateBestDigitCountDisplay(currentDigitCount);
    }

    const feedbackText = document.getElementById("feedback-text");
    feedbackText.style.cssText = "background:white; color:red; width:100%;";
    feedbackText.textContent = message;

    document.getElementById("cursor-element").textContent = "\u00A0";

    const actionButtons = document.getElementById("action-buttons");
    actionButtons.replaceChildren();
    actionButtons.appendChild(createButton("Back", null, null, resetGameUI));
    actionButtons.appendChild(document.createTextNode("\u00A0"));
    actionButtons.appendChild(createButton("Try again", null, null, startGame));

    isGameOver = true;
    keepFocusActive = false;
  }

  function runCountdownTimer(secondsLeft) {
    const feedbackText = document.getElementById("feedback-text");
    if (secondsLeft > 0) {
      feedbackText.textContent = "\u00A0";
      if (secondsLeft / maxAllowedSeconds > 2 / 3)
        feedbackText.style.background = "green";
      else if (secondsLeft / maxAllowedSeconds <= 1 / 3)
        feedbackText.style.background = "red";
      else feedbackText.style.background = "orange";

      feedbackText.style.width = (secondsLeft / maxAllowedSeconds) * 10 + "em";
      countdownTimerId = setTimeout(
        () => runCountdownTimer(secondsLeft - 0.01),
        10
      );
    } else {
      var grammarSuffix = PI_DIGITS[2 + currentDigitCount] == 8 ? "n" : "";
      endGameWithResult(
        "Time's up! The next digit is a" +
          grammarSuffix +
          " " +
          PI_DIGITS[2 + currentDigitCount] +
          ". Game over."
      );
    }
  }

  function maintainInputFieldFocus() {
    document.getElementById("hidden-input-field").focus();
    if (keepFocusActive) setTimeout(maintainInputFieldFocus, 10);
  }

  function handleInput() {
    let inputDigit = document.getElementById("hidden-input-field").value;
    let piDigitIndex = 2 + currentDigitCount;
    if (isPracticeModeActive) piDigitIndex += practiceStartIndex;

    if (!isGameOver && keepFocusActive) {
      if (/^[0-9]$/.test(inputDigit)) {
        if (currentDigitCount === 0) {
          gameStartTime = new Date();
        } else {
          lastDigitInputTime = new Date();
          if (inputDigit === PI_DIGITS[piDigitIndex]) {
            updateCurrentTimeDisplay(
              lastDigitInputTime.getTime() - gameStartTime.getTime()
            );
          }
        }

        const outputContainer = document.getElementById("pi-digits-output");
        if (inputDigit === PI_DIGITS[piDigitIndex]) {
          updateCurrentDigitCountDisplay(currentDigitCount + 1);
          clearTimeout(countdownTimerId);
          if (!isPracticeModeActive) runCountdownTimer(maxAllowedSeconds);

          outputContainer.appendChild(document.createTextNode(inputDigit));

          const feedbackText = document.getElementById("feedback-text");
          if (isPracticeModeActive) {
            feedbackText.style.color = "green";
            const targetCount = parseInt(
              document.getElementById("practice-digit-count-input").value
            );
            if (currentDigitCount === targetCount) {
              feedbackText.textContent =
                "You have completed your challenge. Congratulations!";
            } else {
              feedbackText.textContent = "Correct!";
            }
          }
        } else {
          const feedbackText = document.getElementById("feedback-text");
          if (isPracticeModeActive) {
            feedbackText.style.color = "red";
            feedbackText.textContent = "Wrong digit! Try again.";
          } else {
            const errorSpan = document.createElement("span");
            errorSpan.style.color = "red";
            errorSpan.textContent = inputDigit;
            outputContainer.appendChild(errorSpan);

            let grammarSuffix = PI_DIGITS[piDigitIndex] == 8 ? "n" : "";
            document.getElementById("cursor-element").textContent = "\u00A0";
            endGameWithResult(
              "Wrong digit! It was a" +
                grammarSuffix +
                " " +
                PI_DIGITS[piDigitIndex] +
                ". Game over."
            );
          }
        }

        let groupInterval = digitGroupSize;
        if (groupInterval < 1) groupInterval = 100;

        if (
          currentDigitCount > 0 &&
          currentDigitCount % groupInterval === 0 &&
          inputDigit === PI_DIGITS[piDigitIndex]
        ) {
          outputContainer.appendChild(document.createTextNode(" "));
        }
      }
    }

    if (
      !isPracticeModeActive &&
      currentDigitCount >= bestDigitCountRegistered
    ) {
      if (
        currentTimeMs < bestTimeRegistered ||
        bestTimeRegistered === 0 ||
        currentDigitCount > bestDigitCountRegistered
      ) {
        updateBestTimeDisplay(currentTimeMs);
      }
      updateBestDigitCountDisplay(currentDigitCount);
    }
    document.getElementById("hidden-input-field").value = "";
  }

  function syncHighScores() {
    document.getElementById("best-score-digits").textContent =
      localStorage.getItem("bestNbdec") || 0;
    document.getElementById("best-score-time").textContent =
      formatMillisecondsToTime(Number(localStorage.getItem("bestTime")) || 0);
  }

  // Global Key Listeners
  document.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      if (
        !isPracticeModeActive &&
        currentDigitCount >= bestDigitCountRegistered
      ) {
        if (
          currentTimeMs < bestTimeRegistered ||
          bestTimeRegistered === 0 ||
          currentDigitCount > bestDigitCountRegistered
        ) {
          updateBestTimeDisplay(currentTimeMs);
        }
        updateBestDigitCountDisplay(currentDigitCount);
      }
      startGame();
    }
  });

  // Setup DOM Event Listeners
  function setupEventListeners() {
    const practiceStartInput = document.getElementById("practice-start-input");
    const practiceDigitCountInput = document.getElementById(
      "practice-digit-count-input"
    );
    const hiddenInputField = document.getElementById("hidden-input-field");
    const timeoutSettingInput = document.getElementById(
      "timeout-setting-input"
    );
    const groupSizeSettingInput = document.getElementById(
      "group-size-setting-input"
    );

    const playBtn = document.getElementById("play-btn");
    const practiceToggleBtn = document.getElementById("practice-toggle-btn");
    const optionsToggleBtn = document.getElementById("options-toggle-btn");

    const onlyDigits = (e) => {
      if (
        !/^[0-9]$/.test(e.key) &&
        e.key !== "Backspace" &&
        e.key !== "Delete" &&
        e.key !== "Tab" &&
        e.key !== "ArrowLeft" &&
        e.key !== "ArrowRight"
      ) {
        if (!(e.ctrlKey || e.metaKey)) e.preventDefault();
      }
    };

    if (practiceStartInput) {
      practiceStartInput.addEventListener("keyup", () => {
        resetGameUI();
        updatePracticeStart();
      });
      practiceStartInput.addEventListener("keydown", onlyDigits);
      practiceStartInput.addEventListener("focus", resetGameUI);
    }
    if (practiceDigitCountInput) {
      practiceDigitCountInput.addEventListener("keyup", () => {
        resetGameUI();
        renderPracticeDigits();
      });
      practiceDigitCountInput.addEventListener("keydown", onlyDigits);
      practiceDigitCountInput.addEventListener("focus", resetGameUI);
    }
    if (hiddenInputField) {
      hiddenInputField.addEventListener("input", handleInput);
    }
    if (timeoutSettingInput) {
      timeoutSettingInput.addEventListener("keyup", validateTimeoutSetting);
      timeoutSettingInput.addEventListener("keydown", onlyDigits);
    }
    if (groupSizeSettingInput) {
      groupSizeSettingInput.addEventListener("keyup", validateGroupSizeSetting);
      groupSizeSettingInput.addEventListener("keydown", onlyDigits);
    }

    if (playBtn) playBtn.addEventListener("click", startGame);
    if (practiceToggleBtn)
      practiceToggleBtn.addEventListener("click", togglePracticeMode);
    if (optionsToggleBtn)
      optionsToggleBtn.addEventListener("click", toggleOptions);
  }

  // Initialize
  syncHighScores();
  setupEventListeners();
})();
