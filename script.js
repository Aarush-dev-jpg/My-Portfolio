const bootStatus = document.querySelector('#bootStatus');
const bootMessages = ['CALIBRATING INTERFACE...', 'LOADING PERSONALITY MODULE...', 'MAPPING PROJECT NODES...', 'ATLAS CORE READY.'];
let messageIndex = 0;
const messageTimer = setInterval(() => {
  messageIndex += 1;
  if (messageIndex < bootMessages.length) bootStatus.textContent = bootMessages[messageIndex];
  else clearInterval(messageTimer);
}, 480);

const clock = document.querySelector('#clock');
function updateClock() {
  clock.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false });
}
updateClock();
setInterval(updateClock, 1000);

let audioEnabled = true;
let audioContext;
function playTone(frequency = 440, duration = 0.08, type = 'sine') {
  if (!audioEnabled) return;
  audioContext ||= new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.07, audioContext.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

const soundToggle = document.querySelector('#soundToggle');
soundToggle.addEventListener('click', () => {
  audioEnabled = !audioEnabled;
  soundToggle.setAttribute('aria-pressed', audioEnabled);
  soundToggle.innerHTML = `<span class="sound-icon">${audioEnabled ? '◉' : '◌'}</span> AUDIO ${audioEnabled ? 'ON' : 'OFF'}`;
  if (audioEnabled) {
    playTone(440, 0.12);
    setTimeout(() => playTone(660, 0.16), 90);
    showToast('ATLAS AUDIO LINK ESTABLISHED');
  }
});

document.querySelectorAll('[data-sound]').forEach((element) => {
  element.addEventListener('click', () => playTone(520, 0.07, 'triangle'));
});

document.querySelectorAll('.project-card').forEach((card) => {
  card.addEventListener('mouseenter', () => playTone(240, 0.04, 'square'));
  card.addEventListener('click', () => {
    const projectName = card.querySelector('h3').textContent;
    showToast(`${projectName} NODE SELECTED // DETAILS INCOMING`);
    playTone(330, 0.1);
  });
});

const toast = document.querySelector('#toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

const gameStyle = document.createElement('style');
gameStyle.textContent = `
  .game-layout { align-items: center; }
  .game-console {
    width: min(100%, 820px);
    background: rgba(10, 17, 22, 0.82);
    border: 1px solid rgba(77, 225, 221, 0.26);
    box-shadow: 0 0 36px rgba(77, 225, 221, 0.08);
    padding: 18px 18px 16px;
  }
  .game-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--line);
    color: var(--muted);
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .game-score, .game-timer {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 110px;
    justify-content: flex-end;
  }
  .game-score strong, .game-timer strong {
    color: var(--cyan);
    font-size: 16px;
    font-weight: 700;
  }
  .game-status {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--cyan);
  }
  .game-arena {
    position: relative;
    height: 320px;
    margin-top: 16px;
    border: 1px solid rgba(77, 225, 221, 0.2);
    background:
      radial-gradient(circle at center, rgba(77, 225, 221, 0.14), rgba(8, 11, 16, 0.9) 44%, rgba(7, 10, 14, 1) 100%);
    overflow: hidden;
    isolation: isolate;
    box-shadow: inset 0 0 42px rgba(77, 225, 221, 0.06);
  }
  .game-arena::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(transparent 0%, rgba(77, 225, 221, 0.06) 52%, transparent 100%);
    animation: gameSweep 7s linear infinite;
  }
  .game-arena::after {
    content: '';
    position: absolute;
    inset: 10% 12%;
    border: 1px solid rgba(77, 225, 221, 0.12);
    border-radius: 50%;
    box-shadow: 0 0 28px rgba(77, 225, 221, 0.08);
  }
  .game-core {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 122px;
    height: 122px;
    border: 1px solid rgba(77, 225, 221, 0.7);
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: var(--cyan);
    background: radial-gradient(circle, rgba(77, 225, 221, 0.22), rgba(77, 225, 221, 0.06) 62%, transparent 100%);
    box-shadow: 0 0 34px rgba(77, 225, 221, 0.24);
    z-index: 0;
    animation: corePulse 1.6s ease-in-out infinite alternate;
  }
  .game-core span {
    font-family: var(--display);
    font-size: 30px;
    letter-spacing: 0.3em;
    transform: translateX(6px);
  }
  .game-target, .game-enemy {
    position: absolute;
    display: grid;
    place-items: center;
    border-radius: 50%;
    cursor: pointer;
    font-family: var(--display);
    letter-spacing: 0.08em;
    transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
    z-index: 1;
  }
  .game-target {
    border: 1px solid rgba(77, 225, 221, 0.9);
    color: var(--cyan);
    background: radial-gradient(circle, rgba(77, 225, 221, 0.24), rgba(77, 225, 221, 0.08) 48%, rgba(7, 10, 14, 0.82) 100%);
    box-shadow: 0 0 22px rgba(77, 225, 221, 0.18);
    font-size: 15px;
    animation: targetFloat 1s ease-in-out infinite alternate;
  }
  .game-target:hover {
    transform: scale(1.08);
    box-shadow: 0 0 26px rgba(77, 225, 221, 0.38);
  }
  .game-target.hit {
    opacity: 0;
    transform: scale(1.6);
  }
  .game-enemy {
    border: 1px solid rgba(255, 97, 97, 0.9);
    color: rgba(255, 170, 170, 0.9);
    background: radial-gradient(circle, rgba(255, 92, 92, 0.26), rgba(255, 92, 92, 0.08) 46%, rgba(26, 8, 10, 0.84) 100%);
    box-shadow: 0 0 20px rgba(255, 88, 88, 0.22);
    font-size: 12px;
    animation: enemyFloat 0.8s ease-in-out infinite alternate;
  }
  .game-enemy:hover {
    transform: scale(1.08);
    box-shadow: 0 0 28px rgba(255, 88, 88, 0.35);
  }
  .game-enemy.hit {
    opacity: 0;
    transform: scale(1.5);
  }
  .game-controls {
    display: flex;
    gap: 10px;
    margin-top: 16px;
  }
  .game-message {
    margin-top: 14px;
    color: var(--muted);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-size: 9px;
  }
  @keyframes targetFloat {
    0% { transform: translateY(0px) scale(0.98); }
    100% { transform: translateY(-6px) scale(1.04); }
  }
  @keyframes enemyFloat {
    0% { transform: translateY(0px) scale(0.96); }
    100% { transform: translateY(-7px) scale(1.08); }
  }
  @keyframes corePulse {
    0% { box-shadow: 0 0 18px rgba(77, 225, 221, 0.12), inset 0 0 18px rgba(77, 225, 221, 0.08); }
    100% { box-shadow: 0 0 40px rgba(77, 225, 221, 0.26), inset 0 0 26px rgba(77, 225, 221, 0.12); }
  }
  @keyframes gameSweep {
    0% { transform: translateY(-12%); opacity: 0.4; }
    50% { opacity: 0.85; }
    100% { transform: translateY(12%); opacity: 0.4; }
  }
  @media (max-width: 800px) {
    .game-header {
      flex-wrap: wrap;
      justify-content: space-between;
    }
    .game-score, .game-timer {
      min-width: auto;
    }
    .game-arena {
      height: 250px;
    }
    .game-controls {
      flex-direction: column;
    }
    .game-controls .button {
      width: 100%;
    }
  }
`;
document.head.appendChild(gameStyle);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('in-view');
  });
}, { threshold: 0.12 });
document.querySelectorAll('.content-section, .contact-section').forEach((section) => observer.observe(section));

const identityWrap = document.querySelector('#id-scan');
const identityReadout = document.querySelector('#id-readout-text');
const identityPhoto = document.querySelector('.id-photo');
if (identityPhoto) {
  identityPhoto.addEventListener('error', () => {
    identityPhoto.classList.add('asset-missing');
    identityReadout.textContent = 'PHOTO ASSET REQUIRED: aarush-photo.jpg';
  });
}
if (identityWrap && identityReadout) {
  const identityText = 'IDENTITY CONFIRMED: AARUSH R P';
  let identityScanned = false;
  const identityObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || identityScanned) return;
      identityScanned = true;
      identityWrap.classList.add('scanning');
      playTone(300, 0.12, 'sawtooth');
      setTimeout(() => playTone(1400, 0.07), 1000);
      let index = 0;
      const typeReadout = () => {
        identityReadout.textContent = identityText.slice(0, index);
        index += 1;
        if (index <= identityText.length) setTimeout(typeReadout, 28);
      };
      setTimeout(typeReadout, 1050);
      identityObserver.disconnect();
    });
  }, { threshold: 0.4 });
  identityObserver.observe(identityWrap);
}

const reader = document.querySelector('#atlasReader');
const readerState = document.querySelector('#readerState');
const selectionPopover = document.querySelector('#selectionPopover');
const readSelectionButton = document.querySelector('#readSelection');
const readerPause = document.querySelector('#readerPause');
const readerStop = document.querySelector('#readerStop');
const atlasWelcome = document.querySelector('#atlasWelcome');
let selectedText = '';
let currentSpeech;
let preferredVoice;

function getAtlasGreeting() {
  const hour = new Date().getHours();
  const greeting = hour >= 5 && hour < 12
    ? 'Good morning'
    : hour >= 12 && hour < 17
      ? 'Good afternoon'
      : hour >= 17 && hour < 21
        ? 'Good evening'
        : 'Good evening';
  return `${greeting}. I am ATLAS, Aarush's personal AI interface. How may I assist you?`;
}

function updateAtlasGreeting() {
  if (atlasWelcome) atlasWelcome.textContent = getAtlasGreeting();
}

function scheduleAtlasGreetingUpdate() {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1, 0, 0, 0);
  window.setTimeout(() => {
    updateAtlasGreeting();
    scheduleAtlasGreetingUpdate();
  }, nextHour.getTime() - now.getTime());
}

updateAtlasGreeting();
scheduleAtlasGreetingUpdate();

function loadAtlasVoice() {
  const voices = window.speechSynthesis.getVoices();
  const femaleVoice = /female|samantha|victoria|hazel|zira|susan|sara|aria|jenny|libby|google uk english female/i;
  preferredVoice = voices.find((voice) => /en-GB/i.test(voice.lang) && femaleVoice.test(voice.name))
    || voices.find((voice) => /en-US/i.test(voice.lang) && femaleVoice.test(voice.name))
    || voices.find((voice) => femaleVoice.test(voice.name))
    || voices.find((voice) => /en-GB/i.test(voice.lang))
    || voices.find((voice) => /en-US/i.test(voice.lang));
}

function speakAtlasWelcome() {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const welcome = new SpeechSynthesisUtterance(getAtlasGreeting());
  welcome.voice = preferredVoice;
  welcome.lang = preferredVoice?.lang || 'en-GB';
  welcome.rate = 0.88;
  welcome.pitch = 1.02;
  welcome.volume = 1;
  welcome.onstart = () => showReader('ATLAS WELCOME LINK ACTIVE');
  welcome.onend = () => reader.classList.remove('active');
  welcome.onerror = () => reader.classList.remove('active');
  window.speechSynthesis.speak(welcome);
}

loadAtlasVoice();
window.speechSynthesis.addEventListener('voiceschanged', loadAtlasVoice);

function showReader(message) {
  readerState.textContent = message;
  reader.classList.add('active');
}

function speakSelection() {
  if (!selectedText) return;
  window.speechSynthesis.cancel();
  currentSpeech = new SpeechSynthesisUtterance(selectedText);
  currentSpeech.voice = preferredVoice;
  currentSpeech.lang = preferredVoice?.lang || 'en-GB';
  currentSpeech.rate = 0.92;
  currentSpeech.pitch = 0.96;
  currentSpeech.volume = 1;
  currentSpeech.onstart = () => showReader('READING SELECTED DATA');
  currentSpeech.onend = () => {
    reader.classList.remove('active');
    selectionPopover.classList.remove('visible');
    selectedText = '';
  };
  currentSpeech.onerror = () => {
    reader.classList.remove('active');
    selectionPopover.classList.remove('visible');
    selectedText = '';
  };
  window.speechSynthesis.speak(currentSpeech);
  selectionPopover.classList.remove('visible');
  playTone(660, 0.1, 'triangle');
}

document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  const text = selection?.toString().trim();
  if (!text || text.length < 4 || !selection.rangeCount) return;
  selectedText = text;
  const bounds = selection.getRangeAt(0).getBoundingClientRect();
  selectionPopover.style.left = `${Math.min(Math.max(bounds.left + bounds.width / 2 - 83, 12), window.innerWidth - 178)}px`;
  selectionPopover.style.top = `${Math.max(bounds.top - 48, 76)}px`;
  selectionPopover.classList.add('visible');
});

document.addEventListener('mousedown', (event) => {
  if (!selectionPopover.contains(event.target)) selectionPopover.classList.remove('visible');
});

readSelectionButton.addEventListener('click', speakSelection);
readerPause.addEventListener('click', () => {
  if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
    window.speechSynthesis.pause();
    showReader('READING PAUSED');
    readerPause.textContent = 'RESUME';
  } else if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    showReader('READING SELECTED DATA');
    readerPause.textContent = 'PAUSE';
  }
});
readerStop.addEventListener('click', () => {
  window.speechSynthesis.cancel();
  readerPause.textContent = 'PAUSE';
  showReader('VOICE LINK STANDBY');
});

const gameArena = document.querySelector('#gameArena');
const gameScore = document.querySelector('#gameScore');
const gameTimer = document.querySelector('#gameTimer');
const gameMessage = document.querySelector('#gameMessage');
const gameStart = document.querySelector('#gameStart');
const gameReset = document.querySelector('#gameReset');
const atlasCommandForm = document.querySelector('#atlasCommandForm');
const atlasCommand = document.querySelector('#atlasCommand');
const atlasResponse = document.querySelector('#atlasResponse');
const atlasConversation = document.querySelector('#atlasConversation');
let gameRunning = false;
let score = 0;
let timeLeft = 30;
let health = 100;
let spawnTimer;
let enemyTimer;
let countdownTimer;

if (atlasCommandForm && atlasCommand && atlasResponse) {
  const atlasKnowledge = {
    identity: 'I am ATLAS, Aarush\'s personal AI interface. Aarush R P is a B.Tech student and aspiring web developer based in Kerala, India.',
    skills: 'Aarush works with HTML, CSS, JavaScript, Python, REST APIs, OpenAPI, AI integration, prompt engineering, debugging, Git, GitHub, Vercel, n8n, Node-RED, and ThingsBoard.',
    projects: 'The active project nodes are NAMMAL, an AI community platform; Recipe AI, an ingredient-aware food discovery tool; an ongoing mobile e-commerce app; and CAMPKART, a college marketplace.',
    contact: 'You can contact Aarush at rpaarush@gmail.com. His LinkedIn and GitHub links are available in the Contact zone.',
    availability: 'Aarush is available for collaboration and is always learning.',
    education: 'Aarush is a B.Tech student exploring practical software, intelligent tools, responsive interfaces, REST APIs, and automation.',
  };

  function getAtlasResponse(command) {
    if (/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(command)) return `${getAtlasGreeting()} I am ready to help.`;
    if (/\b(project|projects|work|built|build|portfolio)\b/.test(command)) return atlasKnowledge.projects;
    if (/\b(skill|stack|technology|technologies|tools|know|code)\b/.test(command)) return atlasKnowledge.skills;
    if (/\b(contact|email|reach|linkedin|github)\b/.test(command)) return atlasKnowledge.contact;
    if (/\b(available|hire|collab|collaboration|freelance)\b/.test(command)) return atlasKnowledge.availability;
    if (/\b(education|study|student|college|degree|btech)\b/.test(command)) return atlasKnowledge.education;
    if (/\b(who|about|name|aarush|yourself|identity)\b/.test(command)) return atlasKnowledge.identity;
    if (/\b(help|commands|what can you do)\b/.test(command)) return 'You can ask about Aarush, his skills, projects, education, availability, contact details, or the ATLAS interface.';
    if (/\b(status|system|diagnostic|online|core)\b/.test(command)) return 'All systems operational. ATLAS core is stable, the audio link is ready, and the portfolio nodes are online.';
    return 'I can answer questions about Aarush, his skills, projects, education, availability, contact details, and this portfolio. Try asking: What projects has Aarush built?';
  }

  function speakAtlasResponse(response) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(response);
    speech.voice = preferredVoice;
    speech.lang = preferredVoice?.lang || 'en-GB';
    speech.rate = 0.9;
    speech.pitch = 1.02;
    speech.volume = 1;
    speech.onstart = () => showReader('ATLAS RESPONDING');
    speech.onend = () => reader.classList.remove('active');
    speech.onerror = () => reader.classList.remove('active');
    window.speechSynthesis.speak(speech);
  }

  function addAtlasMessage(text, type) {
    if (!atlasConversation) return;
    const message = document.createElement('div');
    message.className = `atlas-message atlas-message-${type}`;
    message.textContent = text;
    atlasConversation.appendChild(message);
    atlasConversation.scrollTop = atlasConversation.scrollHeight;
  }

  atlasCommandForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const command = atlasCommand.value.trim().toLowerCase();
    if (!command) return;
    const response = getAtlasResponse(command);
    addAtlasMessage(atlasCommand.value.trim(), 'user');
    addAtlasMessage(response, 'atlas');
    atlasResponse.textContent = response;
    atlasCommand.value = '';
    playTone(660, 0.1, 'triangle');
    speakAtlasResponse(response);
  });
}

function updateGameHud() {
  if (gameScore) gameScore.textContent = String(score);
  if (gameTimer) gameTimer.textContent = String(timeLeft);
  if (gameMessage && !gameRunning) {
    gameMessage.textContent = health <= 0 ? 'SHIELD COLLAPSED // REINITIALIZE' : 'SYSTEM READY // CLICK START';
  }
}

function clearGameEntities() {
  if (!gameArena) return;
  gameArena.querySelectorAll('.game-target, .game-enemy').forEach((entity) => entity.remove());
}

function spawnTarget() {
  if (!gameArena || !gameRunning) return;

  const target = document.createElement('button');
  target.type = 'button';
  target.className = 'game-target';
  const value = [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)];
  target.textContent = `+${value}`;
  target.setAttribute('aria-label', `Collect ${value} points`);

  const size = 36 + Math.random() * 30;
  const bounds = gameArena.getBoundingClientRect();
  const x = Math.random() * Math.max(10, bounds.width - size - 18);
  const y = Math.random() * Math.max(10, bounds.height - size - 18);

  target.style.width = `${size}px`;
  target.style.height = `${size}px`;
  target.style.left = `${x}px`;
  target.style.top = `${y}px`;

  target.addEventListener('click', () => {
    if (!gameRunning) return;
    score += value;
    updateGameHud();
    target.classList.add('hit');
    playTone(430 + value * 9, 0.08, 'triangle');
    setTimeout(() => target.remove(), 140);
    if (gameMessage) gameMessage.textContent = 'CORE NODE STABILIZED // +POINTS';
  });

  gameArena.appendChild(target);
}

function spawnEnemy() {
  if (!gameArena || !gameRunning) return;

  const enemy = document.createElement('button');
  enemy.type = 'button';
  enemy.className = 'game-enemy';
  enemy.textContent = 'DRONE';
  enemy.setAttribute('aria-label', 'Enemy drone');

  const size = 42 + Math.random() * 32;
  const bounds = gameArena.getBoundingClientRect();
  const x = Math.random() * Math.max(10, bounds.width - size - 18);
  const y = Math.random() * Math.max(10, bounds.height - size - 18);

  enemy.style.width = `${size}px`;
  enemy.style.height = `${size}px`;
  enemy.style.left = `${x}px`;
  enemy.style.top = `${y}px`;

  enemy.addEventListener('click', () => {
    if (!gameRunning) return;
    score = Math.max(0, score - 15);
    health = Math.max(0, health - 8);
    updateGameHud();
    enemy.classList.add('hit');
    playTone(180, 0.08, 'sawtooth');
    setTimeout(() => enemy.remove(), 140);
    if (gameMessage) gameMessage.textContent = 'DRONE BREACH // DEFLECT IMMEDIATELY';
    if (health <= 0) endGame();
  });

  gameArena.appendChild(enemy);
}

function endGame() {
  if (countdownTimer) clearInterval(countdownTimer);
  if (spawnTimer) clearInterval(spawnTimer);
  if (enemyTimer) clearInterval(enemyTimer);
  gameRunning = false;
  clearGameEntities();

  const verdict = health <= 0
    ? 'SHIELD DOWN // CORE COMPROMISED'
    : score >= 180
      ? 'MISSION SUCCESS // CLIENT IMPRESSION: MAXIMUM'
      : score >= 100
        ? 'SYSTEM STRONG // STABILITY ACCEPTED'
        : 'SIMULATION PARTIAL // MORE DATA NEEDED';

  if (gameMessage) gameMessage.textContent = verdict;
  showToast(score >= 180 ? 'ATLAS SIMULATION SUCCESS' : 'SIMULATION COMPLETE');
  playTone(health <= 0 ? 180 : 760, 0.15, 'sawtooth');
}

function startGame() {
  if (gameRunning) return;
  score = 0;
  timeLeft = 30;
  health = 100;
  gameRunning = true;
  clearGameEntities();
  updateGameHud();
  if (gameMessage) gameMessage.textContent = 'TARGETS ACQUIRED // DEPLOY TO CORE';
  spawnTarget();

  spawnTimer = setInterval(() => {
    spawnTarget();
  }, 850);

  enemyTimer = setInterval(() => {
    spawnEnemy();
  }, 1300);

  countdownTimer = setInterval(() => {
    timeLeft -= 1;
    updateGameHud();
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

if (gameStart) {
  gameStart.addEventListener('click', startGame);
}

if (gameReset) {
  gameReset.addEventListener('click', () => {
    if (countdownTimer) clearInterval(countdownTimer);
    if (spawnTimer) clearInterval(spawnTimer);
    if (enemyTimer) clearInterval(enemyTimer);
    gameRunning = false;
    score = 0;
    timeLeft = 30;
    health = 100;
    clearGameEntities();
    updateGameHud();
    if (gameMessage) gameMessage.textContent = 'SYSTEM READY // CLICK START';
  });
}

const flightOverlay = document.querySelector('#flightOverlay');
const flightDestination = document.querySelector('#flightDestination');
const pageNav = document.querySelector('.page-nav');
const marquee = document.querySelector('.marquee');
let flightInProgress = false;
const panelScrollPositions = new WeakMap();

function updateZoneNav(panel) {
  const currentScroll = panel.scrollTop;
  const previousScroll = panelScrollPositions.get(panel) ?? 0;
  const movingDown = currentScroll > previousScroll + 2;
  const movingUp = currentScroll < previousScroll - 2;
  panelScrollPositions.set(panel, currentScroll);

  if (currentScroll <= 8 || movingUp) pageNav.classList.remove('nav-hidden');
  else if (movingDown) pageNav.classList.add('nav-hidden');
}

document.querySelectorAll('.page-panel').forEach((panel) => {
  panelScrollPositions.set(panel, panel.scrollTop);
  panel.addEventListener('scroll', () => updateZoneNav(panel), { passive: true });
});

function activatePage(target) {
  document.querySelectorAll('.page-panel').forEach((panel) => panel.classList.toggle('active', panel === target));
  document.querySelectorAll('.page-nav-item').forEach((item) => item.classList.toggle('active', item.dataset.pageTarget === `#${target.id}`));
  marquee.classList.toggle('marquee-hidden', target.id !== 'home');
  pageNav.classList.remove('nav-hidden');
  panelScrollPositions.set(target, target.scrollTop);
  if (target.id === 'game') speakAtlasWelcome();
}

document.querySelectorAll('[data-flight]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetSelector = link.dataset.pageTarget || link.getAttribute('href');
    const target = targetSelector === '#top' ? document.querySelector('#home') : document.querySelector(targetSelector);
    if (!target || flightInProgress) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      event.preventDefault();
      activatePage(target);
      return;
    }
    event.preventDefault();
    flightInProgress = true;
    flightDestination.textContent = `${link.dataset.flight} // LOCKED`;
    flightOverlay.classList.add('launch');
    playTone(180, 0.12, 'sawtooth');
    setTimeout(() => playTone(440, 0.18, 'triangle'), 150);
    setTimeout(() => {
      activatePage(target);
      flightOverlay.classList.remove('launch');
      flightOverlay.classList.add('arrival');
      setTimeout(() => {
        flightOverlay.classList.remove('arrival');
        flightInProgress = false;
      }, 300);
    }, 550);
  });
});

const pointerReticle = document.createElement('div');
pointerReticle.className = 'pointer-reticle';
document.body.append(pointerReticle);

const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
document.body.append(scrollProgress);

window.addEventListener('pointermove', (event) => {
  document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
  document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
  pointerReticle.classList.toggle('active', event.clientX > 20 && event.clientY > 20);
});

window.addEventListener('scroll', () => {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight ? window.scrollY / scrollableHeight : 0;
  scrollProgress.style.transform = `scaleX(${progress})`;
});

document.querySelectorAll('.project-card, .skill-matrix > div').forEach((panel) => {
  panel.addEventListener('pointermove', (event) => {
    if (window.matchMedia('(max-width: 800px)').matches) return;
    const bounds = panel.getBoundingClientRect();
    const tiltX = ((event.clientY - bounds.top) / bounds.height - 0.5) * -3;
    const tiltY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 3;
    panel.style.setProperty('--tilt-x', `${tiltX}deg`);
    panel.style.setProperty('--tilt-y', `${tiltY}deg`);
  });
  panel.addEventListener('pointerleave', () => {
    panel.style.setProperty('--tilt-x', '0deg');
    panel.style.setProperty('--tilt-y', '0deg');
  });
});
