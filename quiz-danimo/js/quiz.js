const fixedQuestion = {
    question: "¿Cuál es el mayor uso de las IAs?",
    options: [
        "Hacer imagenes",
        "Buscar sentido de la vida",
        "Acompañamiento afectivo/terapia",
        "Generar resumenes/explicaciones",
    ],
    correct: 2,
    explanation: "Según Harvard Business Review, las IAs se utilizan en todas estas áreas de nuestra vida. Sin embargo, el acompañamiento afectivo y terapéutico es el uso más destacado, demostrando nuestra necesidad de apoyo emocional."
};

const questionPool = [
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
        question: "¿Qué porcentaje de nuestros pensamientos diarios son repetitivos?",
        options: [
            "30%",
            "50%",
            "70%",
            "95%"
        ],
        correct: 3,
        explanation: "Aproximadamente el 95% de nuestros pensamientos son repetitivos. Nuestro cerebro tiende a pensar los mismos pensamientos día tras día, por eso es tan importante ser conscientes de nuestros patrones mentales."
    },
    {
        question: "¿Cuántas emociones básicas puede reconocer el cerebro humano?",
        options: [
            "4 emociones",
            "6 emociones",
            "10 emociones",
            "15 emociones"
        ],
        correct: 1,
        explanation: "El cerebro humano reconoce 6 emociones básicas universales: alegría, tristeza, miedo, ira, sorpresa y asco. Estas emociones son reconocidas en todas las culturas del mundo."
    },
    {
        question: "¿Cuánto tiempo tarda tu cerebro en formar un nuevo hábito en promedio?",
        options: [
            "21 días",
            "32 días",
            "66 días",
            "94 días"
        ],
        correct: 2,
        explanation: "Estudios recientes muestran que en promedio se necesitan 66 días para formar un nuevo hábito, no 21 como se creía antes. El tiempo exacto varía según la complejidad del hábito y la persona."
    },
    {
        question: "¿Qué actividad reduce el estrés tanto como meditar?",
        options: [
            "Ver televisión",
            "Acariciar un perro o gato",
            "Dormir siesta",
            "Escuchar música"
        ],
        correct: 1,
        explanation: "Acariciar un perro o gato reduce el cortisol (hormona del estrés) y aumenta la oxitocina (hormona del bienestar) de manera similar a la meditación. ¡Las mascotas son terapéuticas!"
    },
    {
        question: "¿Cuántas neuronas nuevas genera tu cerebro cada día?",
        options: [
            "100 neuronas",
            "700 neuronas",
            "1,500 neuronas",
            "10,000 neuronas"
        ],
        correct: 2,
        explanation: "Tu cerebro genera aproximadamente 1,500 neuronas nuevas cada día en el hipocampo, la zona relacionada con la memoria y el aprendizaje. Este proceso se llama neurogénesis."
    },
    {
        question: "La risa libera endorfinas. ¿Cuántos minutos de risa equivalen a 10 minutos de ejercicio?",
        options: [
            "5 minutos",
            "10 minutos",
            "15 minutos",
            "20 minutos"
        ],
        correct: 1,
        explanation: "10 minutos de risa genuina pueden tener el mismo efecto en tu bienestar que 10 minutos de ejercicio moderado, liberando endorfinas y reduciendo el estrés. ¡Reír es medicina!"
    },
    {
        question: "¿Qué porcentaje de la población mundial experimenta ansiedad en algún momento de su vida?",
        options: [
            "15%",
            "30%",
            "50%",
            "70%"
        ],
        correct: 1,
        explanation: "Aproximadamente el 30% de la población mundial experimenta trastornos de ansiedad en algún momento de su vida. Es uno de los problemas de salud mental más comunes, pero también tratable."
    }
];

let questions = [];
let currentQuestion = 0;
let score = 0;
let answered = false;
let lives = 3;
let timerInterval;
let timeLeft = 20;
let correctAnswers = 0;

function selectRandomQuestions() {
    // Mezclar el pool de preguntas
    const shuffled = [...questionPool].sort(() => Math.random() - 0.5);
    // Tomar las primeras 4 preguntas
    const selectedQuestions = shuffled.slice(0, 4);
    // Insertar la pregunta fija al principio
    selectedQuestions.splice(0, 0, fixedQuestion);
    return selectedQuestions;
}

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

// Confeti simple con CSS
function createConfetti() {
    const colors = ['#f7a1b2', '#f58ba0', '#e8d4f0', '#fde2e8', '#ffc9d9', '#d2a8d6', '#f093fb', '#43e97b', '#4facfe', '#ff6b9d'];
    
    for (let i = 0; i < 60; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-50px';
            confetti.style.width = (Math.random() * 8 + 10) + 'px';
            confetti.style.height = (Math.random() * 12 + 15) + 'px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.setProperty('--drift', (Math.random() - 0.5) * 200 + 'px');
            confetti.style.setProperty('--rotation', Math.random() * 720 + 'deg');
            confetti.style.animationDuration = (Math.random() * 1.5 + 2.5) + 's';
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti && confetti.parentNode) {
                    confetti.remove();
                }
            }, 5000);
        }, i * 40);
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
    questions = selectRandomQuestions();
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
        correctAnswers++;
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

function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    lives = 3;
    answered = false;
    correctAnswers = 0;
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