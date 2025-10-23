const questions = [{
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
let score = 0;
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
        score += 10 + timeBonus;
        correctAnswers++; // Incrementar el contador de respuestas correctas
        document.getElementById('scoreDisplay').textContent = `Puntaje: ${score}`;
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
    document.getElementById('finalScore').textContent = `${score} puntos`;

    // Mostrar badges
    const badgesContainer = document.getElementById('badgesContainer');
    badgesContainer.innerHTML = '';

    const badges = [];
    if (score >= 100) badges.push('Experto en Salud Mental');
    if (score >= 50) badges.push('Gran Conocedor');
    if (lives > 0) badges.push(`${lives} ${lives === 1 ? 'Vida Restante' : 'Vidas Restantes'}`);
    if (score === 150) badges.push('¡Puntuación Perfecta!');

    badges.forEach(badge => {
        const badgeEl = document.createElement('div');
        badgeEl.className = 'badge';
        badgeEl.textContent = badge;
        badgesContainer.appendChild(badgeEl);
    });

    let message;
    if (score >= 100) {
        message = `¡Perfecto! ¡Sos un experto en salud mental! Respondiste correctamente ${correctAnswers} de 5 preguntas.`;
        createConfetti();
    } else if (score >= 70) {
        message = `¡Muy bien! Tenés excelentes conocimientos sobre salud mental. Respondiste correctamente ${correctAnswers} de 5 preguntas.`;
    } else if (score >= 40) {
        message = `¡Buen trabajo! Seguí aprendiendo sobre salud mental. Respondiste correctamente ${correctAnswers} de 5 preguntas.`;
    } else {
        message = `¡Gracias por participar! Te invitamos a seguir descubriendo sobre salud mental. Respondiste correctamente ${correctAnswers} de 5 preguntas.`;
    }
    document.getElementById('finalMessage').textContent = message;
}

function shareResults() {
    const text = `¡Obtuve ${score} puntos en el Quiz Danimo de Salud Mental!\n¿Podés superarme?`;
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
    score = 0;
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