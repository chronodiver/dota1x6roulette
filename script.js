const challenges = [
"3 Игры подряд на одном герое из старой системы",
"Не подбирать сферы до выпадения легендарки",
"Первая шмотка после ботинка (грейженная версия ботинка разрешена) — муншард",
"Катка без вардов",
"Игра на рандом герое с легендаркой W (2 скилл)",
"Не качать 1 скилл до легендарки",
"С нулевой минуты идти гангать до выпадения легендарки, не бить крипов кроме вейвов",
"Игра на рандом герое с легендаркой Q (1 скилл)",
"Игра на рандом герое с легендаркой E (3 скилл)",
"Игра на рандом герое с легендаркой R (ультимейт)",
"Фаст блинк даггер без сапога",
"После ботинка (грейженная версия ботинка разрешена) фаст дагон 5",
"Игнорирование рун и наблюдателей",
"Катка без Aghanim shard",
"Катка без Aghanim Scepter (включая Aghanim Essence)",
"Фаст бф после ботинка (грейженная версия ботинка разрешена)",
"После ботинка (грейженная версия ботинка разрешена) фаст дагон 5",
"Стартовый закуп дасты на все деньги",
"Каждый раз выбирать только самый правый талант (сохраняя редкость сферы)"
];

const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spin-btn');
const resultText = document.getElementById('result-text');
const historyList = document.getElementById('history-list');

// Configuration
const numSegments = challenges.length;
const segmentAngle = 360 / numSegments;
const colors = ['#8B0000', '#2F4F4F', '#191970', '#556B2F', '#A52A2A', '#4B0082']; // Dark themed colors

// Sound Context
let audioCtx;
let masterGain;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.3; // Global volume
        masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playTickSound() {
    if (audioCtx) {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = 'triangle';
        // Randomize pitch slightly for realism
        const pitch = 600 + Math.random() * 200;
        osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);

        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);

        osc.connect(gainNode);
        gainNode.connect(masterGain);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    }
}

function playWinSound() {
    if (audioCtx) {
        // Play a simple chord
        const notes = [440, 554.37, 659.25, 880]; // A major 7
        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            const now = audioCtx.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.2, now + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2);

            osc.connect(gainNode);
            gainNode.connect(masterGain);

            osc.start(now + i * 0.05); // Stagger start
            osc.stop(now + 2.5);
        });
    }
}

// Draw Wheel Gradient
function drawWheel() {
    let gradient = 'conic-gradient(';
    for (let i = 0; i < numSegments; i++) {
        const color = colors[i % colors.length];
        const start = i * segmentAngle;
        const end = (i + 1) * segmentAngle;
        gradient += `${color} ${start}deg ${end}deg${i === numSegments - 1 ? '' : ','}`;
    }
    gradient += ')';
    wheel.style.background = gradient;
}

// Animation State
let currentRotation = 0;
let isSpinning = false;

// Easing function: easeOutCubic
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function spinWheel() {
    if (isSpinning) return;
    initAudio();

    isSpinning = true;
    spinBtn.disabled = true;
    resultText.textContent = "Крутимся...";
    resultText.classList.remove('highlight');

    // 1. Determine target
    const randomSegment = Math.floor(Math.random() * numSegments);
    // Landing angle center of segment relative to start (0)
    const segmentCenter = (randomSegment * segmentAngle) + (segmentAngle / 2);

    // We need to rotate such that 'segmentCenter' is at top (0 deg).
    // Currently wheel is at 'currentRotation'.
    // Target Rotation:
    // We want (finalRotation % 360) corresponding to the position where segmentCenter is at Top.
    // If we rotate clockwise, the value at top moves backwards in degrees.
    // Position at top = (360 - (Rotation % 360)) % 360.
    // We want Position at top = segmentCenter.
    // segmentCenter = 360 - (TargetMod).
    // TargetMod = 360 - segmentCenter.

    const targetMod = (360 - segmentCenter) % 360;
    const extraSpins = 5 + Math.floor(Math.random() * 3); // 5 to 7 spins
    const fullSpinsRot = extraSpins * 360;

    // Calculate distance to target from current
    const currentMod = currentRotation % 360;
    let distance = targetMod - currentMod;
    if (distance < 0) distance += 360;

    const totalRotationNeeded = fullSpinsRot + distance;
    const startRotation = currentRotation;
    const finalRotation = startRotation + totalRotationNeeded;

    const duration = 5000; // 5 seconds
    const startTime = performance.now();

    // For sound tracking
    let lastAngle = startRotation;

    function animate(time) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeVal = easeOutCubic(progress);

        const currentAngle = startRotation + (totalRotationNeeded * easeVal);
        wheel.style.transform = `rotate(${currentAngle}deg)`;

        // Check for segment crossing for sound
        // We cross a line every 'segmentAngle' degrees
        // Track how many lines we passed
        // Current Line Index = Math.floor(currentAngle / segmentAngle)
        const lastIndex = Math.floor(lastAngle / segmentAngle);
        const currentIndex = Math.floor(currentAngle / segmentAngle);

        if (currentIndex > lastIndex) {
            playTickSound();
        }

        lastAngle = currentAngle;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            currentRotation = finalRotation; // exact snap
            isSpinning = false;
            finishSpin(challenges[randomSegment]);
        }
    }

    requestAnimationFrame(animate);
}

function finishSpin(result) {
    playWinSound();
    resultText.textContent = result;
    resultText.classList.add('highlight');
    spinBtn.disabled = false;
    addToHistory(result);
}

function addToHistory(text) {
    const li = document.createElement('li');
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Add result to history with localized time
    li.innerHTML = `<span>${text}</span> <span class="time">${timeStr}</span>`;

    if (historyList.firstChild) {
        historyList.insertBefore(li, historyList.firstChild);
    } else {
        historyList.appendChild(li);
    }
}

// Initialize
drawWheel();
spinBtn.addEventListener('click', spinWheel);
