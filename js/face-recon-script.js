// --- Elementos del DOM ---
const video = document.getElementById('video');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('start-button');
const loadingStatus = document.getElementById('loading-status');
const challengeText = document.getElementById('challenge-text');
const countdownText = document.getElementById('countdown-text');
const resultText = document.getElementById('result-text');
const scoreDisplay = document.getElementById('score');

// --- Configuración del Juego ---
const EMOTIONS = ['happy', 'sad', 'angry', 'surprised', 'neutral'];
const EMOTIONS_ES = {
    'happy': 'Alegría 😄',
    'sad': 'Tristeza 😢',
    'angry': 'Enojo 😠',
    'surprised': 'Sorpresa 😮',
    'neutral': 'Neutral 😐',
    'disgusted': 'Asco 🤢',
    'fearful': 'Miedo 😨'
};

// --- Estado del Juego ---
let score = 0;
let gameInProgress = false;
let currentChallenge = '';
let animationFrameId;

// ================================
// Partículas sobre rostro (modo emoción)
const particles = [];
function createEmojiParticles(x, y, emotion) {
    const emojiMap = {
        happy: ["😄", "😂", "😊", "😍"],
        sad: ["😢", "😭", "😞"],
        angry: ["😡", "😤", "👿"],
        surprised: ["😲", "😮", "😯"],
        neutral: ["🙂", "😐", "😶"],
        fearful: ["😨", "😰", "😱"],
        disgusted: ["🤢", "🤮", "😖"]
    };
    const chosen = emojiMap[emotion] || ["✨"];

    for (let i = 0; i < 5 + Math.random() * 5; i++) {
        particles.push({
            emoji: chosen[Math.floor(Math.random() * chosen.length)],
            x: x + (Math.random() - 0.5) * 100,
            y: y + (Math.random() - 0.5) * 60,
            vx: (Math.random() - 0.5) * 2,
            vy: -1 - Math.random() * 1.5,
            life: 100 + Math.random() * 50
        });
    }
}
function drawParticles(ctx) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        ctx.font = "24px sans-serif";
        ctx.globalAlpha = p.life / 150;
        ctx.fillText(p.emoji, p.x, p.y);
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 2;
        if (p.life <= 0) particles.splice(i, 1);
    }
    ctx.globalAlpha = 1.0;
}

// ================================
// Partículas de fondo (decoración)
function createParticlesBackground() {
    const container = document.getElementById('particles');
    if (!container) return;
    const shapes = ['💝', '✨', '💫', '⭐', '🌟', '💖', '💗', '🌸', '🦋', '🌺'];

    for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = shapes[Math.floor(Math.random() * shapes.length)];
        particle.style.left = Math.random() * 100 + '%';
        particle.style.bottom = Math.random() * 100 + '%';
        particle.style.animationDelay = -(Math.random() * 8) + 's';
        particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
        container.appendChild(particle);
    }
}

// Confeti de celebración
function createConfetti() {
    /*
    const colors = ['#f7a1b2', '#f58ba0', '#e8d4f0', '#fde2e8', '#ffc9d9', '#d2a8d6', '#f093fb', '#43e97b', '#4facfe'];
    for (let i = 0; i < 80; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-20px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.3 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confetti.style.width = (Math.random() * 8 + 6) + 'px';
        confetti.style.height = (Math.random() * 12 + 12) + 'px';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 5000);
    }
        */
}

// ===================================
// 1. INICIALIZACIÓN
// ===================================
async function loadModels() {
    const MODEL_URL = './models';
    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    ]);
    loadingStatus.innerText = "¡Modelos cargados! Listo para jugar.";
    startButton.disabled = false;
}
async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = stream;
        video.play();
    } catch (err) {
        console.error(err);
        loadingStatus.innerText = "Error al acceder a la webcam. Revisa los permisos.";
    }
}
function startVideoLoop() {
    if (!gameInProgress) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();
    drawParticles(ctx); // emojis sobre rostro
    animationFrameId = requestAnimationFrame(startVideoLoop);
}

// ===================================
// 2. LÓGICA DEL JUEGO
// ===================================
function nextRound() {
    clearOverlay();
    gameInProgress = true;
    startVideoLoop();
    currentChallenge = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
    challengeText.innerText = `¡Prepara: ${EMOTIONS_ES[currentChallenge]}!`;
    runCountdown(3);
}
function runCountdown(seconds) {
    if (seconds > 0) {
        countdownText.innerText = seconds;
        setTimeout(() => runCountdown(seconds - 1), 1000);
    } else {
        countdownText.innerText = "¡FOTO!";
        takeAndAnalyzeSnapshot();
    }
}
async function takeAndAnalyzeSnapshot() {
    gameInProgress = false;
    cancelAnimationFrame(animationFrameId);
    challengeText.innerText = "Analizando...";
    countdownText.innerText = "";
    try {
        const detections = await faceapi
            .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();
        if (detections) {
            const dominantEmotion = getDominantEmotion(detections.expressions);
            const { x, y, width } = detections.detection.box;
            createEmojiParticles(x + width / 2, y + 50, dominantEmotion);
            if (dominantEmotion === currentChallenge) {
                showResult(true, dominantEmotion);
                score++;
                createConfetti();
            } else showResult(false, dominantEmotion);
        } else showResult(false, null);
    } catch (err) { console.error(err); }
    scoreDisplay.innerText = `Puntaje: ${score}`;
    setTimeout(nextRound, 3000);
}

// ===================================
// 3. AUXILIARES
// ===================================
startButton.addEventListener('click', () => {
    score = 0;
    scoreDisplay.innerText = `Puntaje: ${score}`;
    startButton.style.display = 'none';
    nextRound();
});
function showResult(isCorrect, detectedEmotion) {
    if (isCorrect) {
        resultText.innerText = `¡Correcto! ${EMOTIONS_ES[detectedEmotion]}`;
        resultText.className = 'correct';
    } else {
        if (detectedEmotion) resultText.innerText = `¡Fallaste! Pedimos ${EMOTIONS_ES[currentChallenge]}, detectamos ${EMOTIONS_ES[detectedEmotion]}`;
        else resultText.innerText = "¡Oh! No pudimos detectar tu rostro.";
        resultText.className = 'incorrect';
    }
}
function clearOverlay() {
    challengeText.innerText = "";
    countdownText.innerText = "";
    resultText.innerText = "";
    resultText.className = "";
}
function getDominantEmotion(expressions) {
    return Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
}

// ===================================
// 4. EJECUTAR AL CARGAR
// ===================================
async function main() {
    startButton.disabled = true;
    await loadModels();
    await startWebcam();
    createParticlesBackground(); // partículas de fondo
}
main();
