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

function startEmotionGame() {
            document.getElementById('startScreen').classList.add('hidden');
            document.getElementById('quizScreen').classList.add('hidden');
            document.getElementById('emotionScreen').classList.remove('hidden');
        }


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

main();

const questions = [
            {
                question: "¿Cuál es el mayor uso de las IAs?",
                options: [
                    "Acompañamiento afectivo/terapia",
                    "Organizar mi vida",
                    "Buscar sentido de la vida",
                    "Aprender mejor",
                    "Todas las anteriores"
                ],
                correct: 4,
                explanation: "Según Harvard Business Review, las IAs se utilizan en todas estas áreas de nuestra vida. Sin embargo, el acompañamiento afectivo y terapéutico es el uso más destacado, demostrando nuestra necesidad de apoyo emocional."
            },
            {
                question: "¿Sabías que nombrar tus emociones reduce su intensidad? Este fenómeno se llama:",
                options: [
                    "Reflexión emocional",
                    "Etiquetado afectivo",
                    "Mindfulness cognitivo",
                    "Catarsis verbal"
                ],
                correct: 1,
                explanation: "El etiquetado afectivo es el proceso de poner nombre a lo que sentimos. Cuando identificamos y nombramos nuestras emociones ('estoy ansioso', 'me siento frustrado'), nuestro cerebro reduce la intensidad de esa emoción, ayudándonos a procesarla mejor."
            },
            {
                question: "La ansiedad y la emoción positiva activan las mismas zonas del cerebro. ¿Qué ayuda a tu cerebro a diferenciarlas?",
                options: [
                    "El contexto y cómo las interpretas",
                    "La intensidad",
                    "El horario del día",
                    "La edad"
                ],
                correct: 0,
                explanation: "Nuestro cerebro necesita del contexto y de cómo interpretamos la situación para diferenciar entre ansiedad y emoción positiva. Por eso, cambiar nuestra perspectiva puede transformar cómo experimentamos las emociones."
            },
            {
                question: "Escribir sobre tus emociones durante 15-20 minutos al día puede:",
                options: [
                    "Mejorar tu memoria",
                    "Fortalecer tu sistema inmune",
                    "Aumentar tu energía",
                    "Todas las anteriores"
                ],
                correct: 1,
                explanation: "Estudios científicos demuestran que escribir sobre nuestras emociones fortalece el sistema inmune, reduce el estrés y mejora nuestro bienestar general. ¡Llevar un registro emocional tiene beneficios reales para tu salud!"
            },
            {
                question: "¿Cuál es el mejor momento del día para hacer un registro de tus emociones?",
                options: [
                    "Por la mañana al despertar",
                    "Después del almuerzo",
                    "Antes de dormir",
                    "No importa el momento"
                ],
                correct: 2,
                explanation: "Registrar tus emociones antes de dormir te permite reflexionar sobre tu día, procesar lo vivido y descansar mejor. Este hábito nocturno ayuda a tu mente a ordenar las experiencias emocionales del día."
            }
        ];

        let currentQuestion = 0;
        let score_quizas = 0;
        let answered = false;
        let lives = 3;
        let timerInterval;
        let timeLeft = 20;
        let correctAnswers = 0; // Contador de respuestas correctas

        // Crear partículas de fondo
        function createParticles() {
            const particles = document.getElementById('particles');
            const shapes = ['💝', '✨', '💫', '⭐', '🌟', '💖', '💗', '🌸', '🦋', '🌺'];
            
            for (let i = 0; i < 25; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.textContent = shapes[Math.floor(Math.random() * shapes.length)];
                particle.style.left = Math.random() * 100 + '%';
                particle.style.bottom = Math.random() * 100 + '%';
                particle.style.animationDelay = -(Math.random() * 8) + 's';
                particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
                particles.appendChild(particle);
            }
        }

        // Confeti
        function createConfetti() {
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
        }

        function startTimer() {
            timeLeft = 20;
            const timerElement = document.getElementById('timer');
            timerElement.classList.remove('warning');
            
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                timeLeft--;
                timerElement.textContent = timeLeft;
                
                if (timeLeft <= 5) {
                    timerElement.classList.add('warning');
                }
                
                if (timeLeft === 0) {
                    clearInterval(timerInterval);
                    if (!answered) {
                        loseLife();
                        showCorrectAnswer();
                    }
                }
            }, 1000);
        }

        function loseLife() {
            lives--;
            const hearts = document.querySelectorAll('.heart');
            hearts[lives].classList.add('lost');
            
            if (lives === 0) {
                setTimeout(() => {
                    showResults();
                }, 1000);
            }
        }

        function showCorrectAnswer() {
            answered = true;
            const q = questions[currentQuestion];
            const options = document.querySelectorAll('.option');
            options[q.correct].classList.add('correct');
            
            document.getElementById('explanationContainer').innerHTML = 
                `<div class="explanation"><strong>¡Se acabó el tiempo!</strong> ${q.explanation}</div>`;
            
            document.getElementById('nextBtn').classList.remove('hidden');
            document.getElementById('nextBtn').textContent = 
                currentQuestion < questions.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados';
        }

        function startQuiz() {
            document.getElementById('startScreen').classList.add('hidden');
            document.getElementById('quizScreen').classList.remove('hidden');
            loadQuestion();
        }


        function loadQuestion() {
            if (lives === 0) return;
            
            answered = false;
            startTimer();
            
            const q = questions[currentQuestion];
            document.getElementById('questionNumber').textContent = `Pregunta ${currentQuestion + 1} de ${questions.length}`;
            document.getElementById('questionText').textContent = q.question;
            document.getElementById('progressFill').style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;
            
            const container = document.getElementById('optionsContainer');
            container.innerHTML = '';
            
            q.options.forEach((option, index) => {
                const div = document.createElement('div');
                div.className = 'option';
                div.textContent = option;
                div.onclick = () => selectAnswer(index);
                container.appendChild(div);
            });

            document.getElementById('explanationContainer').innerHTML = '';
            document.getElementById('nextBtn').classList.add('hidden');
        }

        function selectAnswer(index) {
            if (answered) return;
            answered = true;
            clearInterval(timerInterval);

            const q = questions[currentQuestion];
            const options = document.querySelectorAll('.option');
            
            if (index === q.correct) {
                options[index].classList.add('correct');
                const timeBonus = Math.max(0, timeLeft * 2);
                score_quizas += 10 + timeBonus;
                correctAnswers++; // Incrementar el contador de respuestas correctas
                document.getElementById('scoreDisplay').textContent = `Puntaje: ${score_quiza}`;
                createConfetti();
            } else {
                options[index].classList.add('incorrect');
                options[q.correct].classList.add('correct');
                loseLife();
            }

            document.getElementById('explanationContainer').innerHTML = 
                `<div class="explanation">${q.explanation}</div>`;
            
            document.getElementById('nextBtn').classList.remove('hidden');
            document.getElementById('nextBtn').textContent = 
                currentQuestion < questions.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados';
        }

        function nextQuestion() {
            currentQuestion++;
            if (currentQuestion < questions.length && lives > 0) {
                loadQuestion();
            } else {
                showResults();
            }
        }

        function showResults() {
            clearInterval(timerInterval);
            document.getElementById('quizScreen').classList.add('hidden');
            document.getElementById('endScreen').classList.remove('hidden');
            document.getElementById('finalScore').textContent = `${score_quiza} puntos`;
            
            // Mostrar badges
            const badgesContainer = document.getElementById('badgesContainer');
            badgesContainer.innerHTML = '';
            
            const badges = [];
            if (score_quiza >= 100) badges.push('Experto en Salud Mental');
            if (score_quiza >= 50) badges.push('Gran Conocedor');
            if (lives > 0) badges.push(`${lives} ${lives === 1 ? 'Vida Restante' : 'Vidas Restantes'}`);
            if (score_quiza === 150) badges.push('¡Puntuación Perfecta!');
            
            badges.forEach(badge => {
                const badgeEl = document.createElement('div');
                badgeEl.className = 'badge';
                badgeEl.textContent = badge;
                badgesContainer.appendChild(badgeEl);
            });
            
            let message;
            if (score_quiza >= 100) {
                message = `¡Perfecto! ¡Sos un experto en salud mental! Respondiste correctamente ${correctAnswers} de 5 preguntas.`;
                createConfetti();
            } else if (score_quiza >= 70) {
                message = `¡Muy bien! Tenés excelentes conocimientos sobre salud mental. Respondiste correctamente ${correctAnswers} de 5 preguntas.`;
            } else if (score_quiza >= 40) {
                message = `¡Buen trabajo! Seguí aprendiendo sobre salud mental. Respondiste correctamente ${correctAnswers} de 5 preguntas.`;
            } else {
                message = `¡Gracias por participar! Te invitamos a seguir descubriendo sobre salud mental. Respondiste correctamente ${correctAnswers} de 5 preguntas.`;
            }
            document.getElementById('finalMessage').textContent = message;
        }

        function shareResults() {
            const text = `¡Obtuve ${score_quiza} puntos en el Quiz Danimo de Salud Mental!\n¿Podés superarme?`;
            if (navigator.share) {
                navigator.share({
                    title: 'Quiz Danimo',
                    text: text
                }).catch(() => {});
            } else {
                const tempInput = document.createElement('textarea');
                tempInput.value = text;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                alert('¡Texto copiado al portapapeles!');
            }
        }

        function restartQuiz() {
            currentQuestion = 0;
            score_quiza = 0;
            lives = 3;
            answered = false;
            correctAnswers = 0; // Reiniciar el contador de respuestas correctas
            clearInterval(timerInterval);
            
            document.querySelectorAll('.heart').forEach(heart => {
                heart.classList.remove('lost');
            });
            
            document.getElementById('endScreen').classList.add('hidden');
            document.getElementById('startScreen').classList.remove('hidden');
            document.getElementById('scoreDisplay').textContent = 'Puntaje: 0';
        }

        // Inicializar partículas al cargar
        createParticles();