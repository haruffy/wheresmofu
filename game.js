/*
  ============================================================
  モフをさがせ - game.js
  ============================================================

  【ゲーム本編のモフサイズ】

  ノーマル
  mofuSizeScale: 1.3

  ハード
  mofuSizeScale: 1.3

  スーパーハード
  mofuSizeScale: 1.0


  【さがすモフの見本サイズ】

  targetMofuSizeScale: 2

  全難易度共通です。


  【タイトル画面のモフサイズ】

  titleMofuSizeScale: 2

  こちらは「さがすモフ」とは別に変更できます。
  ============================================================
*/


const normalMofuImages = [
  "images/MoFu_01.png",
  "images/MoFu_02.png",
  "images/MoFu_03.png",
  "images/MoFu_04.png",
  "images/MoFu_05.png"
];


const hardMofuImages = [
  "images/MoFu_01.png",
  "images/MoFu_02.png",
  "images/MoFu_03.png",
  "images/MoFu_04.png",
  "images/MoFu_05.png"
];


const superHardMofuImages = [
  "images/MoFu_01.png",
  "images/MoFu_02.png",
  "images/MoFu_03.png",
  "images/MoFu_04.png",
  "images/MoFu_05.png",
  "images/MoFu_06.png",
  "images/MoFu_07.png",
  "images/MoFu_08.png",
  "images/MoFu_09.png",
  "images/MoFu_10.png"
];


const gameModeSettings = {

  normal: {
    label: "ノーマル",

    stageMofuCounts: [
      10,
      20,
      30,
      40,
      50,
      60,
      70,
      80,
      90,
      100
    ],

    images: normalMofuImages,

    mofuSizeScale: 1.5
  },


  hard: {
    label: "ハード",

    stageMofuCounts: [
      150,
      150,
      150,
      150,
      150
    ],

    images: hardMofuImages,

    mofuSizeScale: 1.25
  },


  superHard: {
    label: "スーパーハード",

    stageMofuCounts: [
      150,
      160,
      170,
      180,
      190
    ],

    images: superHardMofuImages,

    mofuSizeScale: 1.0
  }

};


const soundFiles = {
  bgm: "sounds/bgm_main.mp3",
  correct: "sounds/se_correct.mp3",
  wrong: "sounds/se_wrong.mp3",
  reveal: "sounds/se_reveal.mp3",
  nextLevel: "sounds/se_next_level.mp3",
  clear: "sounds/se_clear.mp3"
};


let bgmEnabled = false;
let seEnabled = true;


const bgmVolume = 0.35;
const seVolume = 0.8;


const useRandomRotation = true;
const useRandomSize = true;


const referenceGameWidth = 350;


/*
  ============================================================
  ゲーム本編モフの基本サイズ
  ============================================================

  基本的にはここではなく、
  各難易度の mofuSizeScale を調整してください。
*/
const minMofuWidthAtReference = 38;
const maxMofuWidthAtReference = 62;
const defaultMofuWidthAtReference = 50;


/*
  ============================================================
  「さがすモフ」の見本画像サイズ
  ============================================================

  48pxが元のサイズです。

  1.5 = 72px
  1.3 = 約62px
  1.0 = 48px

  この数字だけ変えれば調整できます。
*/
const targetMofuBaseWidth = 48;
const targetMofuSizeScale = 2;


/*
  ============================================================
  タイトル画面のモフ
  ============================================================

  50体表示します。

  titleMofuSizeScale を変更すると、
  タイトル画面だけサイズを変更できます。
*/
const titleMofuCount = 100;

const titleMofuMinWidth = 44;
const titleMofuMaxWidth = 68;

const titleMofuSizeScale = 1.5;


const useEvenPlacement = true;


const edgeMargin = 4;
const positionJitterRate = 0.22;


const answerScaleLarge = 1.25;
const answerScaleSmall = 0.9;
const answerAnimationSpeed = 160;


const titleScreen =
  document.getElementById("title-screen");


const playScreen =
  document.getElementById("play-screen");


const titleMofuArea =
  document.getElementById("title-mofu-area");


const backTitleButton =
  document.getElementById("back-title-button");


const testControls =
  document.getElementById("test-controls");


const testModeButtons =
  document.getElementById("test-mode-buttons");


const levelButtons =
  document.getElementById("level-buttons");


const gameScreen =
  document.getElementById("game-screen");


const targetMofu =
  document.getElementById("target-mofu");


const message =
  document.getElementById("message");


const modeText =
  document.getElementById("mode-text");


const levelText =
  document.getElementById("level-text");


const countText =
  document.getElementById("count-text");


const typeText =
  document.getElementById("type-text");


const timeText =
  document.getElementById("time-text");


const clearTimeText =
  document.getElementById("clear-time-text");


const answerButton =
  document.getElementById("answer-button");


const bgmButton =
  document.getElementById("bgm-button");


const seButton =
  document.getElementById("se-button");


let currentModeKey = "normal";
let isTestMode = false;
let currentLevel = 1;


let targetImage = "";
let previousTargetImage = "";


let topZIndex = 1;


let messageTimer = null;
let nextLevelTimer = null;


let answerAnimationTimer1 = null;
let answerAnimationTimer2 = null;
let answerAnimationTimer3 = null;


let resizeTimer = null;


let isStageCleared = false;
let audioStarted = false;


let timerInterval = null;
let timerStartTime = 0;
let elapsedTimeMs = 0;
let timerRunning = false;


let answerUsedInRun = false;


const alphaCanvasCache = {};
const imageSizeCache = {};


let evenPositions = [];
let evenPositionIndex = 0;


const bgmAudio =
  new Audio(soundFiles.bgm);


bgmAudio.loop = true;
bgmAudio.volume = bgmVolume;


const seAudios = {

  correct:
    new Audio(soundFiles.correct),

  wrong:
    new Audio(soundFiles.wrong),

  reveal:
    new Audio(soundFiles.reveal),

  nextLevel:
    new Audio(soundFiles.nextLevel),

  clear:
    new Audio(soundFiles.clear)

};


function setupSoundVolumes() {

  seAudios.correct.volume =
    seVolume;

  seAudios.wrong.volume =
    seVolume;

  seAudios.reveal.volume =
    seVolume;

  seAudios.nextLevel.volume =
    seVolume;

  seAudios.clear.volume =
    seVolume;

}


function setupTargetMofuSize() {

  const targetWidth =
    targetMofuBaseWidth *
    targetMofuSizeScale;


  targetMofu.style.width =
    targetWidth + "px";

}


function startBgm() {

  if (bgmEnabled === false) {
    return;
  }


  const playPromise =
    bgmAudio.play();


  if (playPromise !== undefined) {

    playPromise.catch(function () {
    });

  }

}


function stopBgm() {

  bgmAudio.pause();

}


function playSe(name) {

  if (seEnabled === false) {
    return;
  }


  const sound =
    seAudios[name];


  if (!sound) {
    return;
  }


  sound.currentTime = 0;


  const playPromise =
    sound.play();


  if (playPromise !== undefined) {

    playPromise.catch(function () {
    });

  }

}


function updateSoundButtons() {

  if (bgmEnabled === true) {

    bgmButton.textContent =
      "BGM：ON";

    bgmButton.classList.remove(
      "sound-off"
    );

  } else {

    bgmButton.textContent =
      "BGM：OFF";

    bgmButton.classList.add(
      "sound-off"
    );

  }


  if (seEnabled === true) {

    seButton.textContent =
      "SE：ON";

    seButton.classList.remove(
      "sound-off"
    );

  } else {

    seButton.textContent =
      "SE：OFF";

    seButton.classList.add(
      "sound-off"
    );

  }

}


function toggleBgm() {

  bgmEnabled =
    !bgmEnabled;


  updateSoundButtons();


  if (bgmEnabled === true) {

    startBgm();

  } else {

    stopBgm();

  }

}


function toggleSe() {

  seEnabled =
    !seEnabled;


  updateSoundButtons();

}


function unlockAudioOnce() {

  if (audioStarted === true) {
    return;
  }


  audioStarted = true;


  startBgm();

}


function getAllImagePaths() {

  const uniquePaths =
    new Set();


  const modeKeys =
    Object.keys(
      gameModeSettings
    );


  for (
    let i = 0;
    i < modeKeys.length;
    i++
  ) {

    const modeKey =
      modeKeys[i];


    const images =
      gameModeSettings[
        modeKey
      ].images;


    for (
      let j = 0;
      j < images.length;
      j++
    ) {

      uniquePaths.add(
        images[j]
      );

    }

  }


  return Array.from(
    uniquePaths
  );

}


function preloadImages(callback) {

  const allImagePaths =
    getAllImagePaths();


  if (
    allImagePaths.length === 0
  ) {

    callback();

    return;

  }


  let loadedCount = 0;


  for (
    let i = 0;
    i < allImagePaths.length;
    i++
  ) {

    const imagePath =
      allImagePaths[i];


    const image =
      new Image();


    image.onload =
      function () {

        imageSizeCache[
          imagePath
        ] = {

          width:
            image.naturalWidth,

          height:
            image.naturalHeight

        };


        loadedCount =
          loadedCount + 1;


        if (
          loadedCount ===
          allImagePaths.length
        ) {

          callback();

        }

      };


    image.onerror =
      function () {

        imageSizeCache[
          imagePath
        ] = {

          width: 100,
          height: 150

        };


        loadedCount =
          loadedCount + 1;


        if (
          loadedCount ===
          allImagePaths.length
        ) {

          callback();

        }

      };


    image.src =
      imagePath;

  }

}


function getCurrentModeSettings() {

  return gameModeSettings[
    currentModeKey
  ];

}


function getCurrentImages() {

  return getCurrentModeSettings()
    .images;

}


function getCurrentMofuSizeScale() {

  const settings =
    getCurrentModeSettings();


  if (
    typeof settings.mofuSizeScale ===
    "number"
  ) {

    return settings.mofuSizeScale;

  }


  return 1.0;

}


function getMaxLevel() {

  return getCurrentModeSettings()
    .stageMofuCounts
    .length;

}


function getNumberOfMofusForLevel(
  level
) {

  const counts =
    getCurrentModeSettings()
      .stageMofuCounts;


  const index =
    level - 1;


  if (
    index >= 0 &&
    index < counts.length
  ) {

    return counts[index];

  }


  return counts[
    counts.length - 1
  ];

}


function getRandomNumber(
  min,
  max
) {

  return (
    Math.random() *
    (max - min) +
    min
  );

}


function getRandomInteger(
  min,
  max
) {

  return (
    Math.floor(
      Math.random() *
      (max - min + 1)
    ) +
    min
  );

}


function createTestModeButtons() {

  testModeButtons.innerHTML =
    "";


  const modeKeys = [
    "normal",
    "hard",
    "superHard"
  ];


  for (
    let i = 0;
    i < modeKeys.length;
    i++
  ) {

    const modeKey =
      modeKeys[i];


    const button =
      document.createElement(
        "button"
      );


    button.textContent =
      gameModeSettings[
        modeKey
      ].label;


    button.className =
      "test-mode-button";


    button.dataset.modeKey =
      modeKey;


    button.addEventListener(
      "click",
      function () {

        unlockAudioOnce();


        startTestDifficulty(
          modeKey
        );

      }
    );


    testModeButtons.appendChild(
      button
    );

  }


  updateActiveTestModeButton();

}


function updateActiveTestModeButton() {

  const buttons =
    document.querySelectorAll(
      ".test-mode-button"
    );


  for (
    let i = 0;
    i < buttons.length;
    i++
  ) {

    const button =
      buttons[i];


    if (
      button.dataset.modeKey ===
      currentModeKey
    ) {

      button.classList.add(
        "active"
      );

    } else {

      button.classList.remove(
        "active"
      );

    }

  }

}


function createLevelButtons() {

  levelButtons.innerHTML =
    "";


  if (isTestMode === false) {
    return;
  }


  const maxLevel =
    getMaxLevel();


  for (
    let level = 1;
    level <= maxLevel;
    level++
  ) {

    const button =
      document.createElement(
        "button"
      );


    button.textContent =
      String(level);


    button.className =
      "level-button";


    button.dataset.level =
      String(level);


    button.addEventListener(
      "click",
      function () {

        unlockAudioOnce();


        startTestLevel(
          level
        );

      }
    );


    levelButtons.appendChild(
      button
    );

  }


  updateActiveLevelButton();

}


function updateActiveLevelButton() {

  const buttons =
    document.querySelectorAll(
      ".level-button"
    );


  for (
    let i = 0;
    i < buttons.length;
    i++
  ) {

    const button =
      buttons[i];


    const buttonLevel =
      parseInt(
        button.dataset.level,
        10
      );


    if (
      buttonLevel ===
      currentLevel
    ) {

      button.classList.add(
        "active"
      );

    } else {

      button.classList.remove(
        "active"
      );

    }

  }

}


function clearGameplayTimers() {

  if (messageTimer !== null) {

    clearTimeout(
      messageTimer
    );


    messageTimer =
      null;

  }


  if (nextLevelTimer !== null) {

    clearTimeout(
      nextLevelTimer
    );


    nextLevelTimer =
      null;

  }


  clearAnswerAnimationTimers();

}


function createTitleMofus() {

  titleMofuArea.innerHTML =
    "";


  const images =
    getAllImagePaths();


  if (images.length === 0) {
    return;
  }


  const areaWidth =
    titleMofuArea.clientWidth;


  const areaHeight =
    titleMofuArea.clientHeight;


  if (
    areaWidth <= 0 ||
    areaHeight <= 0
  ) {

    return;

  }


  for (
    let i = 0;
    i < titleMofuCount;
    i++
  ) {

    const imageIndex =
      getRandomInteger(
        0,
        images.length - 1
      );


    const imagePath =
      images[
        imageIndex
      ];


    const mofu =
      document.createElement(
        "img"
      );


    /*
      元のランダムサイズを決めてから
      タイトル画面専用倍率をかけます。
    */
    const baseWidth =
      getRandomInteger(
        titleMofuMinWidth,
        titleMofuMaxWidth
      );


    const width =
      Math.round(
        baseWidth *
        titleMofuSizeScale
      );


    const height =
      getMofuHeight(
        imagePath,
        width
      );


    const maxLeft =
      Math.max(
        0,
        Math.floor(
          areaWidth - width
        )
      );


    const maxTop =
      Math.max(
        0,
        Math.floor(
          areaHeight - height
        )
      );


    const left =
      getRandomInteger(
        0,
        maxLeft
      );


    const top =
      getRandomInteger(
        0,
        maxTop
      );


    const rotation =
      getRandomNumber(
        0,
        360
      );


    mofu.src =
      imagePath;


    mofu.alt =
      "";


    mofu.className =
      "title-mofu";


    mofu.style.width =
      width + "px";


    mofu.style.left =
      left + "px";


    mofu.style.top =
      top + "px";


    mofu.style.transform =
      "rotate(" +
      rotation +
      "deg)";


    titleMofuArea.appendChild(
      mofu
    );

  }

}


function showTitleScreen() {

  clearGameplayTimers();


  stopGameTimer();


  clearGameScreen();


  playScreen.hidden =
    true;


  titleScreen.hidden =
    false;


  requestAnimationFrame(
    function () {

      createTitleMofus();

    }
  );

}


function startMainMode(
  modeKey
) {

  currentModeKey =
    modeKey;


  isTestMode =
    false;


  currentLevel =
    1;


  previousTargetImage =
    "";


  testControls.hidden =
    true;


  titleScreen.hidden =
    true;


  playScreen.hidden =
    false;


  clearGameplayTimers();


  resetGameTimer();


  createLevelButtons();


  createGame();


  startGameTimer();

}


function startTestMode() {

  currentModeKey =
    "normal";


  isTestMode =
    true;


  currentLevel =
    1;


  previousTargetImage =
    "";


  titleScreen.hidden =
    true;


  playScreen.hidden =
    false;


  testControls.hidden =
    false;


  clearGameplayTimers();


  resetGameTimer();


  createTestModeButtons();


  createLevelButtons();


  createGame();


  startGameTimer();

}


function startTestDifficulty(
  modeKey
) {

  currentModeKey =
    modeKey;


  currentLevel =
    1;


  previousTargetImage =
    "";


  clearGameplayTimers();


  resetGameTimer();


  createTestModeButtons();


  createLevelButtons();


  createGame();


  startGameTimer();

}


function startTestLevel(
  level
) {

  currentLevel =
    level;


  previousTargetImage =
    "";


  clearGameplayTimers();


  resetGameTimer();


  updateActiveLevelButton();


  createGame();


  startGameTimer();

}


function handleTitleModeButtonClick(
  event
) {

  unlockAudioOnce();


  const selectedMode =
    event.currentTarget
      .dataset.startMode;


  if (
    selectedMode ===
    "test"
  ) {

    startTestMode();


    return;

  }


  if (
    gameModeSettings[
      selectedMode
    ]
  ) {

    startMainMode(
      selectedMode
    );

  }

}


function formatSeconds(
  milliseconds
) {

  return (
    milliseconds /
    1000
  ).toFixed(1);

}


function getCurrentElapsedTimeMs() {

  if (
    timerRunning === true
  ) {

    return (
      elapsedTimeMs +
      (
        performance.now() -
        timerStartTime
      )
    );

  }


  return elapsedTimeMs;

}


function updateTimerDisplay() {

  const currentMilliseconds =
    getCurrentElapsedTimeMs();


  timeText.textContent =
    "タイム：" +
    formatSeconds(
      currentMilliseconds
    ) +
    "秒";

}


function updateAnswerUsedStyle() {

  if (
    answerUsedInRun === true
  ) {

    timeText.classList.add(
      "answer-used"
    );


    clearTimeText.classList.add(
      "answer-used"
    );

  } else {

    timeText.classList.remove(
      "answer-used"
    );


    clearTimeText.classList.remove(
      "answer-used"
    );

  }

}


function resetGameTimer() {

  if (
    timerInterval !== null
  ) {

    clearInterval(
      timerInterval
    );


    timerInterval =
      null;

  }


  timerStartTime =
    0;


  elapsedTimeMs =
    0;


  timerRunning =
    false;


  answerUsedInRun =
    false;


  timeText.textContent =
    "タイム：0.0秒";


  clearTimeText.textContent =
    "";


  updateAnswerUsedStyle();

}


function startGameTimer() {

  if (
    timerRunning === true
  ) {

    return;

  }


  timerStartTime =
    performance.now();


  timerRunning =
    true;


  if (
    timerInterval !== null
  ) {

    clearInterval(
      timerInterval
    );

  }


  timerInterval =
    setInterval(
      function () {

        updateTimerDisplay();

      },
      50
    );

}


function stopGameTimer() {

  if (
    timerRunning === true
  ) {

    elapsedTimeMs =
      elapsedTimeMs +
      (
        performance.now() -
        timerStartTime
      );


    timerRunning =
      false;

  }


  if (
    timerInterval !== null
  ) {

    clearInterval(
      timerInterval
    );


    timerInterval =
      null;

  }


  updateTimerDisplay();

}


function markAnswerUsed() {

  answerUsedInRun =
    true;


  updateAnswerUsedStyle();

}


function showClearTime() {

  const seconds =
    formatSeconds(
      getCurrentElapsedTimeMs()
    );


  clearTimeText.textContent =
    "クリアタイム：" +
    seconds +
    "秒";


  updateAnswerUsedStyle();

}


function getRandomImage() {

  const images =
    getCurrentImages();


  const randomIndex =
    Math.floor(
      Math.random() *
      images.length
    );


  return images[
    randomIndex
  ];

}


function getRandomTargetImage() {

  const images =
    getCurrentImages();


  if (
    images.length <= 1
  ) {

    previousTargetImage =
      images[0];


    return images[0];

  }


  let selectedImage =
    getRandomImage();


  while (
    selectedImage ===
    previousTargetImage
  ) {

    selectedImage =
      getRandomImage();

  }


  previousTargetImage =
    selectedImage;


  return selectedImage;

}


function getGameScale() {

  const gameScreenWidth =
    gameScreen.clientWidth;


  if (
    gameScreenWidth <= 0
  ) {

    return 1;

  }


  return Math.min(
    1,
    gameScreenWidth /
    referenceGameWidth
  );

}


function getBaseMofuWidth() {

  const screenScale =
    getGameScale();


  const modeScale =
    getCurrentMofuSizeScale();


  const baseWidth =
    defaultMofuWidthAtReference *
    screenScale;


  return Math.round(
    baseWidth *
    modeScale
  );

}


function getMofuWidth() {

  const screenScale =
    getGameScale();


  const modeScale =
    getCurrentMofuSizeScale();


  if (
    useRandomSize === true
  ) {

    const minWidth =
      Math.max(
        24,
        Math.round(
          minMofuWidthAtReference *
          screenScale
        )
      );


    const maxWidth =
      Math.max(
        minWidth,
        Math.round(
          maxMofuWidthAtReference *
          screenScale
        )
      );


    const baseRandomWidth =
      getRandomInteger(
        minWidth,
        maxWidth
      );


    return Math.round(
      baseRandomWidth *
      modeScale
    );

  }


  return getBaseMofuWidth();

}


function getMofuHeight(
  imagePath,
  displayWidth
) {

  const imageSize =
    imageSizeCache[
      imagePath
    ];


  if (
    !imageSize ||
    imageSize.width === 0
  ) {

    return (
      displayWidth *
      1.5
    );

  }


  return (
    displayWidth *
    (
      imageSize.height /
      imageSize.width
    )
  );

}


function getMofuRotation() {

  if (
    useRandomRotation === true
  ) {

    return getRandomNumber(
      0,
      360
    );

  }


  return 0;

}


function clearGameScreen() {

  gameScreen.innerHTML =
    "";

}


function bringToFront(
  mofuElement
) {

  topZIndex =
    topZIndex + 1;


  mofuElement.style.zIndex =
    topZIndex;

}


function setMofuTransform(
  mofuElement,
  scale
) {

  const rotation =
    parseFloat(
      mofuElement.dataset.rotation ||
      "0"
    );


  mofuElement.style.transform =
    "rotate(" +
    rotation +
    "deg) scale(" +
    scale +
    ")";

}


function clearAnswerAnimationTimers() {

  if (
    answerAnimationTimer1 !== null
  ) {

    clearTimeout(
      answerAnimationTimer1
    );


    answerAnimationTimer1 =
      null;

  }


  if (
    answerAnimationTimer2 !== null
  ) {

    clearTimeout(
      answerAnimationTimer2
    );


    answerAnimationTimer2 =
      null;

  }


  if (
    answerAnimationTimer3 !== null
  ) {

    clearTimeout(
      answerAnimationTimer3
    );


    answerAnimationTimer3 =
      null;

  }

}


function animateAnswerMofu(
  mofuElement
) {

  clearAnswerAnimationTimers();


  setMofuTransform(
    mofuElement,
    answerScaleLarge
  );


  answerAnimationTimer1 =
    setTimeout(
      function () {

        setMofuTransform(
          mofuElement,
          answerScaleSmall
        );

      },
      answerAnimationSpeed
    );


  answerAnimationTimer2 =
    setTimeout(
      function () {

        setMofuTransform(
          mofuElement,
          answerScaleLarge
        );

      },
      answerAnimationSpeed * 2
    );


  answerAnimationTimer3 =
    setTimeout(
      function () {

        setMofuTransform(
          mofuElement,
          1
        );

      },
      answerAnimationSpeed * 3
    );

}


function showWrongMessage() {

  message.textContent =
    "ちがう！";


  if (
    messageTimer !== null
  ) {

    clearTimeout(
      messageTimer
    );

  }


  messageTimer =
    setTimeout(
      function () {

        message.textContent =
          "同じモフをタップしてね";


        messageTimer =
          null;

      },
      1000
    );

}


function showNextLevelMessage() {

  if (
    currentLevel <
    getMaxLevel()
  ) {

    message.textContent =
      "正解！ 次のステージへ";

  } else {

    message.textContent =
      "全ステージクリア！";

  }

}


function showAnswerMessage() {

  if (
    messageTimer !== null
  ) {

    clearTimeout(
      messageTimer
    );


    messageTimer =
      null;

  }


  message.textContent =
    "これが正解！";

}


function goToNextLevel() {

  if (
    currentLevel <
    getMaxLevel()
  ) {

    playSe(
      "nextLevel"
    );


    currentLevel =
      currentLevel + 1;


    createGame();

  } else {

    stopGameTimer();


    playSe(
      "clear"
    );


    message.textContent =
      "全ステージクリア！";


    showClearTime();

  }

}


function shuffleArray(
  array
) {

  for (
    let i = array.length - 1;
    i > 0;
    i--
  ) {

    const randomIndex =
      Math.floor(
        Math.random() *
        (i + 1)
      );


    const temporaryValue =
      array[i];


    array[i] =
      array[
        randomIndex
      ];


    array[
      randomIndex
    ] =
      temporaryValue;

  }


  return array;

}


function createEvenPositions(
  numberOfMofus
) {

  evenPositions =
    [];


  evenPositionIndex =
    0;


  const gameScreenWidth =
    gameScreen.clientWidth;


  const gameScreenHeight =
    gameScreen.clientHeight;


  const columns =
    Math.ceil(
      Math.sqrt(
        numberOfMofus *
        gameScreenWidth /
        gameScreenHeight
      )
    );


  const rows =
    Math.ceil(
      numberOfMofus /
      columns
    );


  const usableWidth =
    gameScreenWidth -
    edgeMargin * 2;


  const usableHeight =
    gameScreenHeight -
    edgeMargin * 2;


  const cellWidth =
    usableWidth /
    columns;


  const cellHeight =
    usableHeight /
    rows;


  for (
    let row = 0;
    row < rows;
    row++
  ) {

    for (
      let column = 0;
      column < columns;
      column++
    ) {

      const centerX =
        edgeMargin +
        cellWidth *
        column +
        cellWidth / 2;


      const centerY =
        edgeMargin +
        cellHeight *
        row +
        cellHeight / 2;


      const jitterX =
        getRandomNumber(
          -cellWidth *
          positionJitterRate,

          cellWidth *
          positionJitterRate
        );


      const jitterY =
        getRandomNumber(
          -cellHeight *
          positionJitterRate,

          cellHeight *
          positionJitterRate
        );


      evenPositions.push({

        x:
          centerX +
          jitterX,

        y:
          centerY +
          jitterY

      });

    }

  }


  shuffleArray(
    evenPositions
  );

}


function getRandomPosition(
  width,
  height
) {

  const gameScreenWidth =
    gameScreen.clientWidth;


  const gameScreenHeight =
    gameScreen.clientHeight;


  const maxLeft =
    Math.max(
      edgeMargin,
      gameScreenWidth -
      width -
      edgeMargin
    );


  const maxTop =
    Math.max(
      edgeMargin,
      gameScreenHeight -
      height -
      edgeMargin
    );


  return {

    left:
      getRandomInteger(
        edgeMargin,
        Math.floor(
          maxLeft
        )
      ),

    top:
      getRandomInteger(
        edgeMargin,
        Math.floor(
          maxTop
        )
      )

  };

}


function getPositionFromCenter(
  center,
  width,
  height
) {

  const gameScreenWidth =
    gameScreen.clientWidth;


  const gameScreenHeight =
    gameScreen.clientHeight;


  let left =
    center.x -
    width / 2;


  let top =
    center.y -
    height / 2;


  if (
    left <
    edgeMargin
  ) {

    left =
      edgeMargin;

  }


  if (
    top <
    edgeMargin
  ) {

    top =
      edgeMargin;

  }


  if (
    left >
    gameScreenWidth -
    width -
    edgeMargin
  ) {

    left =
      gameScreenWidth -
      width -
      edgeMargin;

  }


  if (
    top >
    gameScreenHeight -
    height -
    edgeMargin
  ) {

    top =
      gameScreenHeight -
      height -
      edgeMargin;

  }


  if (
    left <
    edgeMargin
  ) {

    left =
      edgeMargin;

  }


  if (
    top <
    edgeMargin
  ) {

    top =
      edgeMargin;

  }


  return {

    left:
      left,

    top:
      top

  };

}


function getPositionForMofu(
  width,
  height
) {

  if (
    useEvenPlacement === true &&
    evenPositionIndex <
    evenPositions.length
  ) {

    const center =
      evenPositions[
        evenPositionIndex
      ];


    evenPositionIndex =
      evenPositionIndex + 1;


    return getPositionFromCenter(
      center,
      width,
      height
    );

  }


  return getRandomPosition(
    width,
    height
  );

}


function saveResponsivePlacementData(
  mofu,
  left,
  top,
  width
) {

  const screenWidth =
    gameScreen.clientWidth;


  const screenHeight =
    gameScreen.clientHeight;


  if (
    screenWidth <= 0 ||
    screenHeight <= 0
  ) {

    return;

  }


  mofu.dataset.leftRate =
    String(
      left /
      screenWidth
    );


  mofu.dataset.topRate =
    String(
      top /
      screenHeight
    );


  mofu.dataset.widthRate =
    String(
      width /
      screenWidth
    );

}


function createMofu(
  imagePath,
  isCorrect
) {

  const mofu =
    document.createElement(
      "img"
    );


  const mofuWidth =
    getMofuWidth();


  const mofuHeight =
    getMofuHeight(
      imagePath,
      mofuWidth
    );


  const rotation =
    getMofuRotation();


  const position =
    getPositionForMofu(
      mofuWidth,
      mofuHeight
    );


  mofu.src =
    imagePath;


  mofu.alt =
    "モフ";


  mofu.className =
    "mofu-item";


  mofu.style.zIndex =
    1;


  mofu.style.width =
    mofuWidth +
    "px";


  mofu.style.left =
    position.left +
    "px";


  mofu.style.top =
    position.top +
    "px";


  mofu.dataset.correct =
    isCorrect
      ? "true"
      : "false";


  mofu.dataset.rotation =
    String(
      rotation
    );


  saveResponsivePlacementData(
    mofu,
    position.left,
    position.top,
    mofuWidth
  );


  setMofuTransform(
    mofu,
    1
  );


  gameScreen.appendChild(
    mofu
  );

}


function updateGameInfo(
  numberOfMofus
) {

  const settings =
    getCurrentModeSettings();


  modeText.textContent =
    settings.label;


  levelText.textContent =
    currentLevel +
    " / " +
    getMaxLevel();


  countText.textContent =
    "表示数：" +
    numberOfMofus;


  typeText.textContent =
    "種類：" +
    settings.images.length;


  if (
    isTestMode === true
  ) {

    updateActiveTestModeButton();


    updateActiveLevelButton();

  }

}


function createGame() {

  clearGameScreen();


  topZIndex =
    1;


  isStageCleared =
    false;


  clearAnswerAnimationTimers();


  if (
    messageTimer !== null
  ) {

    clearTimeout(
      messageTimer
    );


    messageTimer =
      null;

  }


  if (
    nextLevelTimer !== null
  ) {

    clearTimeout(
      nextLevelTimer
    );


    nextLevelTimer =
      null;

  }


  const numberOfMofus =
    getNumberOfMofusForLevel(
      currentLevel
    );


  createEvenPositions(
    numberOfMofus
  );


  updateGameInfo(
    numberOfMofus
  );


  message.textContent =
    "同じモフをタップしてね";


  clearTimeText.textContent =
    "";


  targetImage =
    getRandomTargetImage();


  targetMofu.src =
    targetImage;


  const correctPosition =
    Math.floor(
      Math.random() *
      numberOfMofus
    );


  for (
    let i = 0;
    i < numberOfMofus;
    i++
  ) {

    if (
      i ===
      correctPosition
    ) {

      createMofu(
        targetImage,
        true
      );

    } else {

      let wrongImage =
        getRandomImage();


      while (
        wrongImage ===
        targetImage
      ) {

        wrongImage =
          getRandomImage();

      }


      createMofu(
        wrongImage,
        false
      );

    }

  }

}


function resizeCurrentGameWithoutRandomizing() {

  if (
    playScreen.hidden === true
  ) {

    return;

  }


  const screenWidth =
    gameScreen.clientWidth;


  const screenHeight =
    gameScreen.clientHeight;


  if (
    screenWidth <= 0 ||
    screenHeight <= 0
  ) {

    return;

  }


  const mofuNodeList =
    gameScreen.querySelectorAll(
      ".mofu-item"
    );


  for (
    let i = 0;
    i < mofuNodeList.length;
    i++
  ) {

    const mofu =
      mofuNodeList[i];


    const leftRate =
      parseFloat(
        mofu.dataset.leftRate ||
        "0"
      );


    const topRate =
      parseFloat(
        mofu.dataset.topRate ||
        "0"
      );


    const widthRate =
      parseFloat(
        mofu.dataset.widthRate ||
        "0"
      );


    mofu.style.left =
      leftRate *
      screenWidth +
      "px";


    mofu.style.top =
      topRate *
      screenHeight +
      "px";


    mofu.style.width =
      widthRate *
      screenWidth +
      "px";

  }

}


function getCanvasForImage(
  imgElement
) {

  const imageSource =
    imgElement.currentSrc ||
    imgElement.src;


  if (
    alphaCanvasCache[
      imageSource
    ]
  ) {

    return alphaCanvasCache[
      imageSource
    ];

  }


  if (
    !imgElement.complete ||
    imgElement.naturalWidth === 0 ||
    imgElement.naturalHeight === 0
  ) {

    return null;

  }


  const canvas =
    document.createElement(
      "canvas"
    );


  canvas.width =
    imgElement.naturalWidth;


  canvas.height =
    imgElement.naturalHeight;


  const context =
    canvas.getContext(
      "2d"
    );


  context.drawImage(
    imgElement,
    0,
    0
  );


  alphaCanvasCache[
    imageSource
  ] =
    canvas;


  return canvas;

}


function getElementCenter(
  element
) {

  const left =
    parseFloat(
      element.style.left
    );


  const top =
    parseFloat(
      element.style.top
    );


  const width =
    element.offsetWidth;


  const height =
    element.offsetHeight;


  return {

    x:
      left +
      width / 2,

    y:
      top +
      height / 2

  };

}


function rotatePointBack(
  x,
  y,
  centerX,
  centerY,
  angleDegrees
) {

  const angleRadians =
    angleDegrees *
    Math.PI /
    180;


  const translatedX =
    x -
    centerX;


  const translatedY =
    y -
    centerY;


  const rotatedX =
    translatedX *
    Math.cos(
      -angleRadians
    ) -
    translatedY *
    Math.sin(
      -angleRadians
    );


  const rotatedY =
    translatedX *
    Math.sin(
      -angleRadians
    ) +
    translatedY *
    Math.cos(
      -angleRadians
    );


  return {

    x:
      rotatedX +
      centerX,

    y:
      rotatedY +
      centerY

  };

}


function isPointInsideElement(
  clickX,
  clickY,
  element
) {

  const left =
    parseFloat(
      element.style.left
    );


  const top =
    parseFloat(
      element.style.top
    );


  const width =
    element.offsetWidth;


  const height =
    element.offsetHeight;


  const rotation =
    parseFloat(
      element.dataset.rotation ||
      "0"
    );


  const center =
    getElementCenter(
      element
    );


  const unrotatedPoint =
    rotatePointBack(
      clickX,
      clickY,
      center.x,
      center.y,
      rotation
    );


  if (
    unrotatedPoint.x <
    left
  ) {

    return false;

  }


  if (
    unrotatedPoint.x >
    left +
    width
  ) {

    return false;

  }


  if (
    unrotatedPoint.y <
    top
  ) {

    return false;

  }


  if (
    unrotatedPoint.y >
    top +
    height
  ) {

    return false;

  }


  return true;

}


function isOpaquePixelAtPoint(
  imgElement,
  clickX,
  clickY
) {

  const canvas =
    getCanvasForImage(
      imgElement
    );


  if (
    canvas === null
  ) {

    return false;

  }


  const left =
    parseFloat(
      imgElement.style.left
    );


  const top =
    parseFloat(
      imgElement.style.top
    );


  const displayedWidth =
    imgElement.offsetWidth;


  const displayedHeight =
    imgElement.offsetHeight;


  const rotation =
    parseFloat(
      imgElement.dataset.rotation ||
      "0"
    );


  const center =
    getElementCenter(
      imgElement
    );


  const unrotatedPoint =
    rotatePointBack(
      clickX,
      clickY,
      center.x,
      center.y,
      rotation
    );


  const localX =
    unrotatedPoint.x -
    left;


  const localY =
    unrotatedPoint.y -
    top;


  const scaleX =
    canvas.width /
    displayedWidth;


  const scaleY =
    canvas.height /
    displayedHeight;


  const imageX =
    Math.floor(
      localX *
      scaleX
    );


  const imageY =
    Math.floor(
      localY *
      scaleY
    );


  if (
    imageX < 0 ||
    imageX >=
    canvas.width ||
    imageY < 0 ||
    imageY >=
    canvas.height
  ) {

    return false;

  }


  const context =
    canvas.getContext(
      "2d"
    );


  const pixelData =
    context.getImageData(
      imageX,
      imageY,
      1,
      1
    ).data;


  const alpha =
    pixelData[3];


  return alpha > 0;

}


function getTopmostVisibleMofuAtPoint(
  clickX,
  clickY
) {

  const mofuNodeList =
    gameScreen.querySelectorAll(
      ".mofu-item"
    );


  const mofuEntries =
    [];


  for (
    let i = 0;
    i < mofuNodeList.length;
    i++
  ) {

    mofuEntries.push({

      element:
        mofuNodeList[i],

      order:
        i

    });

  }


  mofuEntries.sort(
    function (
      a,
      b
    ) {

      const zA =
        parseInt(
          a.element.style.zIndex ||
          "0",
          10
        );


      const zB =
        parseInt(
          b.element.style.zIndex ||
          "0",
          10
        );


      if (
        zA !== zB
      ) {

        return (
          zB -
          zA
        );

      }


      return (
        b.order -
        a.order
      );

    }
  );


  for (
    let i = 0;
    i < mofuEntries.length;
    i++
  ) {

    const mofu =
      mofuEntries[i]
        .element;


    if (
      isPointInsideElement(
        clickX,
        clickY,
        mofu
      ) === false
    ) {

      continue;

    }


    if (
      isOpaquePixelAtPoint(
        mofu,
        clickX,
        clickY
      ) === true
    ) {

      return mofu;

    }

  }


  return null;

}


function getCorrectMofuElement() {

  const mofuNodeList =
    gameScreen.querySelectorAll(
      ".mofu-item"
    );


  for (
    let i = 0;
    i < mofuNodeList.length;
    i++
  ) {

    const mofu =
      mofuNodeList[i];


    if (
      mofu.dataset.correct ===
      "true"
    ) {

      return mofu;

    }

  }


  return null;

}


function revealAnswer() {

  unlockAudioOnce();


  if (
    isStageCleared === true
  ) {

    return;

  }


  const correctMofu =
    getCorrectMofuElement();


  if (
    correctMofu === null
  ) {

    return;

  }


  markAnswerUsed();


  playSe(
    "reveal"
  );


  /*
    答え表示では
    正解モフを最前面には移動しません。

    元のレイヤー位置のまま
    拡大縮小だけを行います。
  */
  animateAnswerMofu(
    correctMofu
  );


  showAnswerMessage();

}


function handleMofuClick(
  mofuElement
) {

  unlockAudioOnce();


  if (
    isStageCleared === true
  ) {

    return;

  }


  bringToFront(
    mofuElement
  );


  if (
    mofuElement.dataset.correct ===
    "true"
  ) {

    isStageCleared =
      true;


    playSe(
      "correct"
    );


    showNextLevelMessage();


    if (
      currentLevel >=
      getMaxLevel()
    ) {

      stopGameTimer();


      showClearTime();

    }


    nextLevelTimer =
      setTimeout(
        function () {

          goToNextLevel();

        },
        1000
      );

  } else {

    playSe(
      "wrong"
    );


    showWrongMessage();

  }

}


function handleGameScreenClick(
  event
) {

  const rect =
    gameScreen
      .getBoundingClientRect();


  const clickX =
    event.clientX -
    rect.left;


  const clickY =
    event.clientY -
    rect.top;


  const selectedMofu =
    getTopmostVisibleMofuAtPoint(
      clickX,
      clickY
    );


  if (
    selectedMofu === null
  ) {

    return;

  }


  handleMofuClick(
    selectedMofu
  );

}


function handleResize() {

  if (
    playScreen.hidden === true
  ) {

    return;

  }


  if (
    resizeTimer !== null
  ) {

    clearTimeout(
      resizeTimer
    );

  }


  resizeTimer =
    setTimeout(
      function () {

        /*
          Chromeのページズームや
          画面サイズ変更でも
          createGame()は呼びません。

          正解・画像・回転・配置は
          再抽選しません。
        */

        resizeCurrentGameWithoutRandomizing();


        resizeTimer =
          null;

      },
      100
    );

}


const titleModeButtonList =
  document.querySelectorAll(
    ".title-mode-button"
  );


for (
  let i = 0;
  i < titleModeButtonList.length;
  i++
) {

  titleModeButtonList[
    i
  ].addEventListener(
    "click",
    handleTitleModeButtonClick
  );

}


backTitleButton.addEventListener(
  "click",
  function () {

    unlockAudioOnce();


    showTitleScreen();

  }
);


bgmButton.addEventListener(
  "click",
  function () {

    unlockAudioOnce();


    toggleBgm();

  }
);


seButton.addEventListener(
  "click",
  function () {

    unlockAudioOnce();


    toggleSe();

  }
);


answerButton.addEventListener(
  "click",
  revealAnswer
);


gameScreen.addEventListener(
  "click",
  handleGameScreenClick
);


window.addEventListener(
  "resize",
  function () {

    handleResize();

  }
);


setupSoundVolumes();


setupTargetMofuSize();


updateSoundButtons();


preloadImages(
  function () {

    showTitleScreen();

  }
);