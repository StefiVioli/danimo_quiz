class Quiz {
    constructor() {
        this.currentQuestion = 0;
        this.score = 0;
        this.answered = false;
        this.questions = [];

        // DOM Elements
        this.elements = {
            startScreen: document.getElementById('startScreen'),
            quizScreen: document.getElementById('quizScreen'),
            endScreen: document.getElementById('endScreen'),
            questionNumber: document.getElementById('questionNumber'),
            scoreDisplay: document.getElementById('scoreDisplay'),
            questionText: document.getElementById('questionText'),
            optionsContainer: document.getElementById('optionsContainer'),
            explanationContainer: document.getElementById('explanationContainer'),
            nextBtn: document.getElementById('nextBtn'),
            progressFill: document.getElementById('progressFill'),
            finalScore: document.getElementById('finalScore'),
            finalMessage: document.getElementById('finalMessage')
        };

        // Bind methods
        this.startQuiz = this.startQuiz.bind(this);
        this.loadQuestion = this.loadQuestion.bind(this);
        this.selectAnswer = this.selectAnswer.bind(this);
        this.nextQuestion = this.nextQuestion.bind(this);
        this.showResults = this.showResults.bind(this);
        this.restartQuiz = this.restartQuiz.bind(this);

        // Initialize
        this.init();
    }

    async init() {
        try {
            const response = await fetch('assets/data/questions.json');
            this.questions = await response.json();
        } catch (error) {
            console.error('Error loading questions:', error);
        }
    }

    startQuiz() {
        this.elements.startScreen.classList.add('hidden');
        this.elements.quizScreen.classList.remove('hidden');
        this.loadQuestion();
    }

    loadQuestion() {
        this.answered = false;
        const q = this.questions[this.currentQuestion];
        
        this.elements.questionNumber.textContent = `Pregunta ${this.currentQuestion + 1} de ${this.questions.length}`;
        this.elements.questionText.textContent = q.question;
        this.elements.progressFill.style.width = `${((this.currentQuestion + 1) / this.questions.length) * 100}%`;
        
        this.elements.optionsContainer.innerHTML = '';
        q.options.forEach((option, index) => {
            const div = document.createElement('div');
            div.className = 'option';
            div.textContent = option;
            div.onclick = () => this.selectAnswer(index);
            this.elements.optionsContainer.appendChild(div);
        });

        this.elements.explanationContainer.innerHTML = '';
        this.elements.nextBtn.classList.add('hidden');
    }

    selectAnswer(index) {
        if (this.answered) return;
        this.answered = true;

        const q = this.questions[this.currentQuestion];
        const options = document.querySelectorAll('.option');
        
        if (index === q.correct) {
            options[index].classList.add('correct');
            this.score++;
            this.elements.scoreDisplay.textContent = `Puntaje: ${this.score}`;
        } else {
            options[index].classList.add('incorrect');
            options[q.correct].classList.add('correct');
        }

        this.elements.explanationContainer.innerHTML = 
            `<div class="explanation">${q.explanation}</div>`;
        
        this.elements.nextBtn.classList.remove('hidden');
        this.elements.nextBtn.textContent = 
            this.currentQuestion < this.questions.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados';
    }

    nextQuestion() {
        this.currentQuestion++;
        if (this.currentQuestion < this.questions.length) {
            this.loadQuestion();
        } else {
            this.showResults();
        }
    }

    showResults() {
        this.elements.quizScreen.classList.add('hidden');
        this.elements.endScreen.classList.remove('hidden');
        this.elements.finalScore.textContent = `${this.score}/${this.questions.length}`;
        
        let message;
        if (this.score === this.questions.length) {
            message = "¡Perfecto! Conocés muy bien sobre salud mental";
        } else if (this.score >= this.questions.length / 2) {
            message = "¡Muy bien! Tenés buenos conocimientos sobre salud mental";
        } else {
            message = "¡Gracias por participar! Seguí aprendiendo sobre salud mental";
        }
        this.elements.finalMessage.textContent = message;
    }

    restartQuiz() {
        this.currentQuestion = 0;
        this.score = 0;
        this.elements.endScreen.classList.add('hidden');
        this.elements.startScreen.classList.remove('hidden');
        this.elements.scoreDisplay.textContent = 'Puntaje: 0';
    }
}

// Initialize Quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new Quiz();
    window.quiz = quiz; // Make quiz accessible globally for button onclick handlers
});