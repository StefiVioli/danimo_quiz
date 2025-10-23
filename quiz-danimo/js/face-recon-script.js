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
let gameInProgress = false; // Controla el bucle de dibujo
let currentChallenge = '';
let animationFrameId;


// ===================================
// 1. INICIALIZACIÓN
// ===================================

// Cargar modelos de face-api.js
async function loadModels() {
    console.log("Cargando modelos...");
    const MODEL_URL = './models'; // Ruta a tu carpeta de modelos
    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    ]);
    console.log("Modelos cargados.");
    loadingStatus.innerText = "¡Modelos cargados! Listo para jugar.";
    startButton.disabled = false;
}

// Iniciar la cámara web
async function startWebcam() {
    console.log("Iniciando webcam...");
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });
        video.srcObject = stream;
        video.play();
    } catch (err) {
        console.error("Error al acceder a la webcam:", err);
        loadingStatus.innerText = "Error al acceder a la webcam. Revisa los permisos.";
    }
}

// Iniciar el bucle de dibujo (video en vivo)
function startVideoLoop() {
    if (!gameInProgress) return; // Se detiene si el juego no está activo (p.ej. al tomar foto)
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar video (volteado)
    ctx.save();
    ctx.scale(-1, 1); // Voltear horizontalmente
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore(); // Restaurar para que el texto no se voltee
    
    // Continuar el bucle
    animationFrameId = requestAnimationFrame(startVideoLoop);
}

// ===================================
// 2. LÓGICA DEL JUEGO
// ===================================

// Iniciar una nueva ronda del juego
function nextRound() {
    // Limpiar textos de la ronda anterior
    clearOverlay();

    // Iniciar el video en vivo de nuevo
    gameInProgress = true;
    startVideoLoop();

    // Elegir un nuevo desafío
    currentChallenge = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
    challengeText.innerText = `¡Prepara: ${EMOTIONS_ES[currentChallenge]}!`;

    // Iniciar la cuenta regresiva
    runCountdown(3);
}

// Ejecuta la cuenta regresiva (3, 2, 1...)
function runCountdown(seconds) {
    if (seconds > 0) {
        countdownText.innerText = seconds;
        setTimeout(() => runCountdown(seconds - 1), 1000);
    } else {
        countdownText.innerText = "¡FOTO!";
        // Tomar la foto y analizarla
        takeAndAnalyzeSnapshot();
    }
}

// Toma la "foto" (congela el canvas) y la analiza
async function takeAndAnalyzeSnapshot() {
    // 1. Detener el bucle de video (congela la imagen en el canvas)
    gameInProgress = false; 
    cancelAnimationFrame(animationFrameId);
    console.log("📸 Foto tomada. Analizando...");

    challengeText.innerText = "Analizando...";
    countdownText.innerText = "";

    try {
        // 2. Analizar la imagen actual del canvas
        const detections = await faceapi.detectSingleFace(
            canvas, 
            new faceapi.TinyFaceDetectorOptions()
        ).withFaceExpressions();

        if (detections) {
            // 3. Encontrar la emoción dominante
            const dominantEmotion = getDominantEmotion(detections.expressions);
            console.log(`Detectado: ${dominantEmotion} (Objetivo: ${currentChallenge})`);

            // 4. Mostrar resultado
            if (dominantEmotion === currentChallenge) {
                showResult(true, dominantEmotion);
                score++;
            } else {
                showResult(false, dominantEmotion);
            }
        } else {
            console.log("No se detectó rostro.");
            showResult(false, null); // null significa que no se detectó rostro
        }

    } catch (err) {
        console.error("Error en la detección:", err);
    }

    // Actualizar puntaje
    scoreDisplay.innerText = `Puntaje: ${score}`;

    // 5. Iniciar la siguiente ronda después de 3 segundos
    setTimeout(nextRound, 3000);
}

// ===================================
// 3. FUNCIONES AUXILIARES
// ===================================

// Inicia el juego al hacer clic en el botón
startButton.addEventListener('click', () => {
    score = 0;
    scoreDisplay.innerText = `Puntaje: ${score}`;
    startButton.style.display = 'none'; // Ocultar botón durante el juego
    nextRound();
});

// Muestra el resultado (correcto/incorrecto)
function showResult(isCorrect, detectedEmotion) {
    if (isCorrect) {
        resultText.innerText = `¡Correcto! ${EMOTIONS_ES[detectedEmotion]}`;
        resultText.className = 'correct';
    } else {
        if (detectedEmotion) {
            resultText.innerText = `¡Fallaste! Pedimos ${EMOTIONS_ES[currentChallenge]}, detectamos ${EMOTIONS_ES[detectedEmotion]}`;
        } else {
            resultText.innerText = "¡Oh! No pudimos detectar tu rostro.";
        }
        resultText.className = 'incorrect';
    }
}

// Limpia los textos de la superposición
function clearOverlay() {
    challengeText.innerText = "";
    countdownText.innerText = "";
    resultText.innerText = "";
    resultText.className = "";
}

// Encuentra la emoción con el puntaje más alto
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
}

main(); // Iniciar todo