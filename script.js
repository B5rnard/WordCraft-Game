// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCIRwazCpmXp5el5pcyrVjoYb962fZpc7Y",
    authDomain: "wordcraft-17de9.firebaseapp.com",
    databaseURL: "https://wordcraft-17de9-default-rtdb.firebaseio.com",
    projectId: "wordcraft-17de9",
    storageBucket: "wordcraft-17de9.appspot.com",
    messagingSenderId: "411593162986",
    appId: "1:411593162986:web:481c9e7f7bf85a58e9d793",
    measurementId: "G-8GQX7TV5NE"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

class WordGame {
    constructor() {
        this.initDOMElements();
        this.initGameState();
        this.addEventListeners();
        this.checkReturningPlayer();
    }

    initDOMElements() {
        this.lettersElement = document.getElementById('letters');
        this.wordInput = document.getElementById('wordInput');
        this.submitButton = document.getElementById('submitButton');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.guessedWordsContainer = document.getElementById('guessedWords');
        this.messageElement = document.getElementById('message');
        this.playAgainButton = document.getElementById('playAgainButton');
        this.highScoreElement = document.getElementById('highScore');
        this.personalScoresList = document.getElementById('personalScores');
        this.dailyScoresList = document.getElementById('dailyScores');
        this.introPopup = document.getElementById('intro-popup');
        this.startGameButton = document.getElementById('start-game-btn');
        this.nicknameInput = document.getElementById('nicknameInput');
        this.emailInput = document.getElementById('emailInput');
        this.returningPlayerPopup = document.getElementById('returning-player-popup');
        this.returningPlayerName = document.getElementById('returning-player-name');
        this.startGameButtonReturning = document.getElementById('start-game-btn-returning');
    }

    initGameState() {
        this.letters = [];
        this.score = 0;
        this.timeLeft = 30;
        this.submittedWords = new Set();
        this.nineLetterWord = '';
        this.timerInterval = null;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.gameStarted = false;
        this.userInfo = JSON.parse(localStorage.getItem('userInfo')) || null;
    }

    addEventListeners() {
        this.submitButton.addEventListener('click', () => this.submitWord());
        this.wordInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') this.submitWord();
        });
        this.playAgainButton.addEventListener('click', () => this.resetGame());
        this.startGameButton.addEventListener('click', () => this.validateAndStartGame());
        this.startGameButtonReturning.addEventListener('click', () => this.startGame());
    }

    checkReturningPlayer() {
        if (this.userInfo) {
            this.nickname = this.userInfo.nickname;
            this.email = this.userInfo.email;
            this.returningPlayerName.textContent = this.nickname;
            this.returningPlayerPopup.style.display = 'flex';
        } else {
            this.showIntroPopup();
        }
    }

    showIntroPopup() {
        this.introPopup.style.display = 'flex';
    }

    hideIntroPopup() {
        this.introPopup.style.display = 'none';
    }

    validateAndStartGame() {
        this.nickname = this.nicknameInput.value.trim();
        this.email = this.emailInput.value.trim();

        if (!this.nickname) {
            alert('Please enter a nickname to start the game.');
            return;
        }

        this.userInfo = { nickname: this.nickname, email: this.email };
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
        this.startGame();
    }

    startGame() {
        this.hideIntroPopup();
        this.returningPlayerPopup.style.display = 'none';
        this.initGameState();
        this.selectNineLetterWord();
        this.generateLetters();
        this.startTimer();
        this.wordInput.focus();
        this.highScoreElement.textContent = this.highScore;
        this.playAgainButton.style.display = 'none';
    }

    resetGame() {
        this.initGameState();
        this.wordInput.disabled = false;
        this.guessedWordsContainer.innerHTML = '';
        this.messageElement.textContent = '';
        this.timerElement.classList.remove('timer-warning', 'timer-critical');
        this.startGame();
    }

    selectNineLetterWord() {
        const words = [
            'abilities', 'activate', 'adventure', 'algorithm', 'amazement', 
            'assistant', 'benchmark', 'challenge', 'chocolate', 'crescendo'
        ];
        this.nineLetterWord = words[Math.floor(Math.random() * words.length)];
    }

    generateLetters() {
        this.letters = this.shuffleArray([...this.nineLetterWord]);
        this.renderLetters();
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    renderLetters() {
        this.lettersElement.innerHTML = '';
        this.letters.forEach(letter => {
            const letterTile = document.createElement('div');
            letterTile.textContent = letter.toUpperCase();
            letterTile.className = 'letter-tile';
            this.lettersElement.appendChild(letterTile);
        });
    }

    startTimer() {
        this.timerElement.textContent = this.timeLeft;
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.timerElement.textContent = this.timeLeft;

            if (this.timeLeft <= 10 && this.timeLeft > 5) {
                this.timerElement.classList.add('timer-warning');
            } else if (this.timeLeft <= 5) {
                this.timerElement.classList.add('timer-critical');
            }

            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.endGame();
            }
        }, 1000);
    }

    submitWord() {
        if (!this.gameStarted) return;

        const word = this.wordInput.value.trim().toLowerCase();
        if (this.submittedWords.has(word)) {
            this.showMessage(`You've already submitted "${word.toUpperCase()}". Try a new word.`);
            this.wordInput.value = '';
            return;
        }

        if (!word || word.length < 2 || !this.canFormWordFromLetters(word)) {
            this.showMessage('Invalid word. Try again.');
            this.wordInput.value = '';
            return;
        }

        this.submittedWords.add(word);
        this.score += word.length;
        this.scoreElement.textContent = this.score;
        this.wordInput.value = '';
        this.updateGuessedWords(word);
    }

    canFormWordFromLetters(word) {
        const lettersCopy = [...this.letters];
        for (const char of word) {
            const index = lettersCopy.indexOf(char);
            if (index === -1) return false;
            lettersCopy.splice(index, 1);
        }
        return true;
    }

    updateGuessedWords(word) {
        const wordDiv = document.createElement('div');
        wordDiv.textContent = word.toUpperCase();
        wordDiv.className = 'guessed-word';
        this.guessedWordsContainer.prepend(wordDiv);
    }

    endGame() {
        clearInterval(this.timerInterval);
        this.showMessage('Game Over!');
        this.playAgainButton.style.display = 'block';
        this.saveScore();
    }

    saveScore() {
        const today = new Date().toISOString().split('T')[0];
        const scoreRef = db.ref(`scores/${today}`).push();
        scoreRef.set({
            nickname: this.nickname,
            email: this.email,
            score: this.score,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    }
}

// Initialize the game
const game = new WordGame();
